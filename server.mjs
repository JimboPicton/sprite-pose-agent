import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PORT = 4173;
const COMFY = "http://127.0.0.1:8188";
const MIME = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".json":"application/json", ".png":"image/png" };

const json = (res, status, value) => {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(value));
};

async function readBody(req) {
  const parts = [];
  for await (const part of req) parts.push(part);
  return Buffer.concat(parts);
}

async function uploadImage(dataUrl, prefix) {
  if (!dataUrl?.includes(",")) throw new Error(`Missing ${prefix} image.`);
  const bytes = Buffer.from(dataUrl.split(",")[1], "base64");
  const form = new FormData();
  form.append("image", new Blob([bytes], { type: "image/png" }), `${prefix}-${Date.now()}.png`);
  form.append("type", "input");
  form.append("overwrite", "true");
  const response = await fetch(`${COMFY}/upload/image`, { method: "POST", body: form });
  if (!response.ok) throw new Error(`Pose upload failed: ${await response.text()}`);
  return response.json();
}

async function waitForOutput(promptId) {
  const deadline = Date.now() + 10 * 60 * 1000;
  while (Date.now() < deadline) {
    const response = await fetch(`${COMFY}/history/${promptId}`);
    const history = await response.json();
    const job = history[promptId];
    if (job?.status?.status_str === "error") throw new Error("ComfyUI reported a workflow error. Check its terminal.");
    const images = job?.outputs?.["51"]?.images;
    if (images?.length) return images[0];
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error("ComfyUI generation timed out.");
}

async function generate(payload) {
  const uploaded = await uploadImage(payload.poseImage, "sprite-pose");
  const reference = await uploadImage(payload.referenceImage, "sprite-reference");
  const workflow = JSON.parse(await readFile(join(ROOT, "workflows", "pose-controlnet-api.json"), "utf8"));
  workflow["46"].inputs.image = uploaded.subfolder ? `${uploaded.subfolder}/${uploaded.name}` : uploaded.name;
  workflow["60"].inputs.image = reference.subfolder ? `${reference.subfolder}/${reference.name}` : reference.name;
  const prompt = [
    payload.characterDescription,
    payload.essentialFeatures,
    payload.artStyle,
    payload.direction,
    `${payload.animation} animation, frame ${payload.frame}`,
    "match the supplied OpenPose skeleton"
  ].map(value => String(value || "").trim()).filter(Boolean).join(", ");
  workflow["54"].inputs.text = prompt;
  workflow["55"].inputs.text = String(payload.negativePrompt || workflow["55"].inputs.text);
  const fidelity = Math.max(20, Math.min(100, Number(payload.referenceFidelity) || 75));
  workflow["64"].inputs.weight = Math.max(0.2, Math.min(1, fidelity / 100));
  const identityModes = {
    balanced: { weight_type: "linear", embeds_scaling: "V only" },
    strong: { weight_type: "strong middle", embeds_scaling: "K+V w/ C penalty" },
    style: { weight_type: "strong style transfer", embeds_scaling: "V only" },
    flexible: { weight_type: "ease out", embeds_scaling: "V only" }
  };
  const identity = identityModes[payload.identityMode] || identityModes.balanced;
  workflow["64"].inputs.weight_type = identity.weight_type;
  workflow["64"].inputs.embeds_scaling = identity.embeds_scaling;
  workflow["50"].inputs.denoise = 1;
  workflow["45"].inputs.strength = Math.max(0.5, Math.min(1.6, (Number(payload.poseStrength) || 120) / 100));
  workflow["50"].inputs.seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  workflow["65"].inputs.k_colors = Math.max(4, Math.min(64, Number(payload.pixelPalette) || 24));
  const finishedImage = payload.pixelFinish ? ["65", 0] : ["49", 0];
  let exportImage = finishedImage;
  if (payload.transparentOutput) {
    const modelsResponse = await fetch(`${COMFY}/models/background_removal`);
    const backgroundModels = modelsResponse.ok ? await modelsResponse.json() : [];
    if (!backgroundModels.length) {
      throw new Error("Transparent PNG requires a BiRefNet model in ComfyUI-Shared/models/background_removal.");
    }
    workflow["66"] = {
      inputs: { bg_removal_name: backgroundModels[0] },
      class_type: "LoadBackgroundRemovalModel"
    };
    workflow["67"] = {
      inputs: { bg_removal_model: ["66", 0], image: finishedImage },
      class_type: "RemoveBackground"
    };
    workflow["68"] = {
      inputs: { image: finishedImage, alpha: ["67", 0] },
      class_type: "JoinImageWithAlpha"
    };
    exportImage = ["68", 0];
  }
  const allowedSizes = new Set([16, 32, 64, 128, 256]);
  const outputSize = allowedSizes.has(Number(payload.outputSize)) ? Number(payload.outputSize) : 128;
  workflow["69"] = {
    inputs: {
      image: exportImage,
      upscale_method: payload.pixelFinish ? "nearest-exact" : "lanczos",
      width: outputSize,
      height: outputSize,
      crop: "disabled"
    },
    class_type: "ImageScale"
  };
  workflow["51"].inputs.images = ["69", 0];
  workflow["51"].inputs.filename_prefix = `SpritePose/${payload.animation}_${String(payload.frame).padStart(2,"0")}`;
  const queued = await fetch(`${COMFY}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: workflow, client_id: crypto.randomUUID() })
  });
  const queuedData = await queued.json();
  if (!queued.ok || !queuedData.prompt_id) throw new Error(queuedData.error?.message || JSON.stringify(queuedData.node_errors || queuedData));
  const image = await waitForOutput(queuedData.prompt_id);
  const query = new URLSearchParams(image);
  const output = await fetch(`${COMFY}/view?${query}`);
  if (!output.ok) throw new Error("Could not retrieve the generated image.");
  const bytes = Buffer.from(await output.arrayBuffer());
  return `data:${output.headers.get("content-type") || "image/png"};base64,${bytes.toString("base64")}`;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/api/comfy/status") {
      const response = await fetch(`${COMFY}/system_stats`);
      const stats = await response.json();
      const modelsResponse = await fetch(`${COMFY}/models/background_removal`);
      const backgroundRemovalModels = modelsResponse.ok ? await modelsResponse.json() : [];
      return json(res, response.status, {
        ...stats,
        capabilities: { backgroundRemovalModels }
      });
    }
    if (url.pathname === "/api/comfy/generate" && req.method === "POST") {
      const payload = JSON.parse((await readBody(req)).toString("utf8"));
      return json(res, 200, { image: await generate(payload) });
    }
    const requested = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
    const path = normalize(join(ROOT, requested));
    if (!path.startsWith(ROOT)) return json(res, 403, { error: "Forbidden" });
    const file = await readFile(path);
    res.writeHead(200, { "Content-Type": MIME[extname(path)] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(file);
  } catch (error) {
    if (req.url?.startsWith("/api/")) return json(res, 500, { error: error.message });
    json(res, 404, { error: "Not found" });
  }
});

server.on("error", error => {
  if (error.code === "EADDRINUSE") {
    console.error(`Sprite Pose Agent is already running at http://127.0.0.1:${PORT}`);
    process.exitCode = 0;
    return;
  }
  throw error;
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Sprite Pose Agent v1.0.0: http://127.0.0.1:${PORT}`);
});
