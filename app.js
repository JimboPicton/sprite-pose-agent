const WALK_POSES = [
  { name: "Contact", head:[160,70], neck:[160,99], hip:[160,178], lElbow:[126,136], lHand:[109,176], rElbow:[195,139], rHand:[211,174], lKnee:[126,228], lFoot:[100,284], rKnee:[193,230], rFoot:[218,284] },
  { name: "Down", head:[158,75], neck:[158,104], hip:[160,184], lElbow:[130,145], lHand:[117,181], rElbow:[190,144], rHand:[202,177], lKnee:[137,230], lFoot:[114,284], rKnee:[190,239], rFoot:[202,284] },
  { name: "Passing", head:[160,71], neck:[160,100], hip:[160,180], lElbow:[140,145], lHand:[130,181], rElbow:[180,144], rHand:[190,180], lKnee:[151,230], lFoot:[143,284], rKnee:[178,232], rFoot:[187,270] },
  { name: "Up", head:[162,65], neck:[162,94], hip:[160,174], lElbow:[183,136], lHand:[196,171], rElbow:[139,138], rHand:[126,174], lKnee:[176,221], lFoot:[192,268], rKnee:[145,225], rFoot:[133,284] },
  { name: "Contact", head:[160,70], neck:[160,99], hip:[160,178], lElbow:[195,139], lHand:[211,174], rElbow:[126,136], rHand:[109,176], lKnee:[193,230], lFoot:[218,284], rKnee:[126,228], rFoot:[100,284] },
  { name: "Down", head:[162,75], neck:[162,104], hip:[160,184], lElbow:[190,145], lHand:[203,181], rElbow:[130,144], rHand:[118,177], lKnee:[190,230], lFoot:[206,284], rKnee:[130,239], rFoot:[118,284] },
  { name: "Passing", head:[160,71], neck:[160,100], hip:[160,180], lElbow:[180,145], lHand:[190,181], rElbow:[140,144], rHand:[130,180], lKnee:[169,230], lFoot:[177,284], rKnee:[142,232], rFoot:[133,270] },
  { name: "Up", head:[158,65], neck:[158,94], hip:[160,174], lElbow:[139,136], lHand:[126,171], rElbow:[181,138], rHand:[194,174], lKnee:[144,221], lFoot:[128,268], rKnee:[175,225], rFoot:[187,284] }
];

const pose = (name, head, neck, hip, lElbow, lHand, rElbow, rHand, lKnee, lFoot, rKnee, rFoot) =>
  ({ name, head, neck, hip, lElbow, lHand, rElbow, rHand, lKnee, lFoot, rKnee, rFoot });

const IDLE_POSES = [
  pose("Settle", [160,67],[160,96],[160,178],[143,137],[140,180],[177,137],[180,180],[147,230],[143,284],[173,230],[177,284]),
  pose("Breathe in", [160,64],[160,93],[160,175],[142,134],[138,176],[178,134],[182,176],[147,228],[143,284],[173,228],[177,284]),
  pose("Settle", [160,67],[160,96],[160,178],[143,137],[140,180],[177,137],[180,180],[147,230],[143,284],[173,230],[177,284]),
  pose("Breathe out", [160,69],[160,98],[160,180],[144,140],[141,182],[176,140],[179,182],[147,231],[143,284],[173,231],[177,284])
];
const RUN_POSES = WALK_POSES.map((p, i) => {
  const q = cloneSequence([p])[0];
  q.name = ["Contact","Compression","Passing","Flight","Contact","Compression","Passing","Flight"][i];
  q.hip[1] -= 10; q.neck[1] -= 12; q.head[1] -= 12;
  q.lFoot[0] = 160 + (q.lFoot[0] - 160) * 1.55; q.rFoot[0] = 160 + (q.rFoot[0] - 160) * 1.55;
  q.lHand[0] = 160 + (q.lHand[0] - 160) * 1.45; q.rHand[0] = 160 + (q.rHand[0] - 160) * 1.45;
  return q;
});
const JUMP_POSES = [
  pose("Anticipation",[160,100],[160,125],[160,195],[137,158],[124,186],[183,158],[196,186],[135,235],[125,284],[185,235],[195,284]),
  pose("Take-off",[160,77],[160,104],[160,174],[135,134],[113,108],[185,134],[207,108],[144,219],[130,271],[176,219],[190,271]),
  pose("Apex",[160,45],[160,73],[160,145],[125,98],[105,76],[195,98],[215,76],[132,177],[112,213],[188,177],[208,213]),
  pose("Descent",[160,66],[160,94],[160,166],[130,119],[111,144],[190,119],[209,144],[139,213],[122,262],[181,213],[198,262]),
  pose("Landing",[160,100],[160,125],[160,195],[137,158],[124,186],[183,158],[196,186],[135,235],[125,284],[185,235],[195,284])
];
const CROUCH_POSES = [
  IDLE_POSES[0],
  pose("Lower",[171,104],[166,130],[154,199],[143,157],[126,184],[190,159],[205,190],[128,230],[106,284],[183,235],[207,284]),
  pose("Crouched",[184,133],[176,157],[153,211],[145,177],[124,202],[204,172],[227,194],[126,239],[103,284],[184,239],[211,284])
];
const CRAWL_POSES = [
  pose("Reach",[211,187],[187,198],[128,222],[170,209],[205,223],[163,228],[190,246],[106,247],[76,269],[143,247],[170,273]),
  pose("Pull",[196,190],[172,202],[119,224],[150,219],[183,231],[143,235],[168,251],[99,250],[69,274],[133,248],[159,270]),
  pose("Pass",[203,187],[179,199],[125,222],[158,214],[194,207],[151,233],[180,245],[104,249],[76,273],[143,248],[174,269]),
  pose("Reach",[211,187],[187,198],[128,222],[170,209],[205,223],[163,228],[190,246],[106,247],[76,269],[143,247],[170,273]),
  pose("Pull",[196,190],[172,202],[119,224],[150,219],[183,231],[143,235],[168,251],[99,250],[69,274],[133,248],[159,270]),
  pose("Pass",[203,187],[179,199],[125,222],[158,214],[194,207],[151,233],[180,245],[104,249],[76,273],[143,248],[174,269])
];
const HURT_POSES = [
  IDLE_POSES[0],
  pose("Impact",[172,78],[166,105],[151,183],[137,135],[117,153],[184,140],[199,174],[140,231],[129,284],[174,232],[190,284]),
  pose("Recoil",[186,91],[174,116],[151,193],[141,146],[120,166],[192,146],[211,164],[137,237],[120,284],[176,237],[199,284]),
  pose("Recover",[169,74],[165,102],[157,182],[143,139],[130,177],[183,139],[196,174],[144,231],[136,284],[174,231],[184,284])
];
const DEATH_POSES = [
  IDLE_POSES[0],
  pose("Hit",[176,80],[168,107],[151,184],[137,139],[118,164],[188,140],[211,153],[138,232],[126,284],[174,232],[194,284]),
  pose("Stagger",[196,111],[180,131],[151,199],[147,157],[129,184],[201,156],[225,169],[132,240],[111,284],[181,239],[211,284]),
  pose("Fall",[221,164],[195,171],[151,218],[166,190],[193,207],[210,192],[237,208],[122,247],[91,276],[177,248],[211,278]),
  pose("Impact",[249,228],[221,225],[158,240],[190,232],[226,250],[198,248],[233,266],[130,254],[92,273],[169,261],[205,277]),
  pose("Still",[258,252],[230,248],[163,249],[196,246],[229,258],[202,258],[238,269],[133,256],[93,273],[169,263],[208,276])
];
const GETUP_POSES = cloneSequence(DEATH_POSES).reverse().map((p, i) => ({ ...p, name: ["Prone","Push","Kneel","Rise","Balance","Ready"][i] }));

function cloneSequence(source) {
  return source.map(p => Object.fromEntries(Object.entries(p).map(([k,v]) => [k, Array.isArray(v) ? [...v] : v])));
}

const ANIMATIONS = {
  idle: { label: "Idle", poses: IDLE_POSES },
  walk: { label: "Walk cycle", poses: WALK_POSES, alternates: [8, 6] },
  run: { label: "Run", poses: RUN_POSES },
  jump: { label: "Jump", poses: JUMP_POSES },
  crouch: { label: "Crouch / duck", poses: CROUCH_POSES },
  crawl: { label: "Crawl", poses: CRAWL_POSES },
  hurt: { label: "Hurt / stagger", poses: HURT_POSES },
  death: { label: "Death / fall", poses: DEATH_POSES },
  getup: { label: "Get up", poses: GETUP_POSES }
};

const $ = (selector) => document.querySelector(selector);
const FALLBACK_VERSION = { version: "0.3.1", buildDate: "2026-06-28" };

async function displayVersion() {
  let release = FALLBACK_VERSION;
  try {
    const response = await fetch(`version.json?cache=${Date.now()}`, { cache: "no-store" });
    if (response.ok) release = await response.json();
  } catch {
    // Direct file opening cannot fetch JSON, so the embedded release remains visible.
  }
  const versionLabel = `v${release.version}`;
  $("#headerVersion").textContent = versionLabel;
  $("#footerVersion").textContent = versionLabel;
  $("#buildDate").textContent = new Date(`${release.buildDate}T00:00:00`)
    .toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
  document.title = `Sprite Pose Agent ${versionLabel}`;
}

displayVersion();
const fileInput = $("#fileInput");
const dropZone = $("#dropZone");
const sourcePreview = $("#sourcePreview");
const timeline = $("#timeline");
const poseCanvas = $("#poseCanvas");
let imageUrl = "";
const clonePoses = cloneSequence;
let poses = clonePoses(WALK_POSES);
let basePoses = clonePoses(WALK_POSES);
let currentFrame = 0;
let playing = false;
let timer = null;
let draggedJoint = null;
const JOINT_KEYS = ["head", "neck", "hip", "lElbow", "lHand", "rElbow", "rHand", "lKnee", "lFoot", "rKnee", "rFoot"];

function loadImage(file) {
  if (!file?.type.startsWith("image/")) return;
  if (imageUrl) URL.revokeObjectURL(imageUrl);
  imageUrl = URL.createObjectURL(file);
  sourcePreview.src = imageUrl;
  $("#animatedSprite").src = imageUrl;
  dropZone.classList.add("has-image");
  $("#removeImage").classList.remove("hidden");
}

fileInput.addEventListener("change", () => loadImage(fileInput.files[0]));
["dragenter", "dragover"].forEach(type => dropZone.addEventListener(type, e => {
  e.preventDefault(); dropZone.classList.add("dragging");
}));
["dragleave", "drop"].forEach(type => dropZone.addEventListener(type, e => {
  e.preventDefault(); dropZone.classList.remove("dragging");
}));
dropZone.addEventListener("drop", e => loadImage(e.dataTransfer.files[0]));
$("#removeImage").addEventListener("click", () => {
  if (imageUrl) URL.revokeObjectURL(imageUrl);
  imageUrl = "";
  fileInput.value = "";
  sourcePreview.removeAttribute("src");
  dropZone.classList.remove("has-image");
  $("#removeImage").classList.add("hidden");
});

$("#fps").addEventListener("input", e => {
  $("#fpsOutput").value = `${e.target.value} fps`;
  if (playing) startPlayback();
});

function drawPose(canvas, pose, small = false) {
  const ctx = canvas.getContext("2d");
  const scale = canvas.width / 320;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(scale, scale);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#1f513e";
  ctx.lineWidth = small ? 8 : 6;
  const line = (a,b) => { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); };
  line(pose.neck, pose.hip);
  line(pose.neck, pose.lElbow); line(pose.lElbow, pose.lHand);
  line(pose.neck, pose.rElbow); line(pose.rElbow, pose.rHand);
  line(pose.hip, pose.lKnee); line(pose.lKnee, pose.lFoot);
  line(pose.hip, pose.rKnee); line(pose.rKnee, pose.rFoot);
  ctx.fillStyle = "#c9f06a";
  ctx.strokeStyle = "#1f513e";
  ctx.lineWidth = small ? 5 : 4;
  ctx.beginPath(); ctx.arc(...pose.head, 17, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  JOINT_KEYS.forEach(key => {
    const point = pose[key];
    ctx.fillStyle = key === "head" ? "#c9f06a" : "#ef6b3b";
    ctx.beginPath(); ctx.arc(...point, small ? 5 : 6, 0, Math.PI*2); ctx.fill();
    if (!small) {
      ctx.strokeStyle = "#fffdf8"; ctx.lineWidth = 2; ctx.stroke();
    }
  });
  ctx.restore();
}

function renderTimeline() {
  timeline.innerHTML = "";
  timeline.style.gridTemplateColumns = `repeat(${poses.length}, minmax(55px, 1fr))`;
  poses.forEach((pose, index) => {
    const button = document.createElement("button");
    button.className = `frame-card${index === currentFrame ? " active" : ""}`;
    button.type = "button";
    button.setAttribute("aria-label", `Frame ${index + 1}: ${pose.name}`);
    const canvas = document.createElement("canvas");
    canvas.width = 160; canvas.height = 160;
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    button.append(canvas, number);
    button.addEventListener("click", () => showFrame(index));
    timeline.append(button);
    drawPose(canvas, pose, true);
  });
}

function showFrame(index) {
  currentFrame = (index + poses.length) % poses.length;
  const pose = poses[currentFrame];
  drawPose(poseCanvas, pose);
  $("#frameLabel").textContent = `Frame ${currentFrame + 1} · ${pose.name}`;
  $("#propagateForward").disabled = currentFrame === poses.length - 1;
  [...timeline.children].forEach((node, i) => node.classList.toggle("active", i === currentFrame));
}

function buildPlan() {
  const animation = ANIMATIONS[$("#animationSelect").value];
  const count = Number($("#frameCount").value);
  const source = animation === ANIMATIONS.walk && count === 6
    ? animation.poses.filter((_, i) => ![1,5].includes(i))
    : animation.poses;
  basePoses = clonePoses(source);
  poses = clonePoses(basePoses);
  currentFrame = 0;
  $("#emptyState").classList.add("hidden");
  $("#animationStage").classList.remove("hidden");
  $("#mappingTools").classList.remove("hidden");
  timeline.classList.remove("hidden");
  $("#stageTitle").textContent = `${animation.label} · ${poses.length} frames`;
  $("#exportJson").disabled = false;
  $("#exportSheet").disabled = false;
  renderTimeline();
  showFrame(0);
  document.querySelector(".steps span:nth-of-type(2)").classList.add("active");
}

function syncFrameOptions() {
  const animation = ANIMATIONS[$("#animationSelect").value];
  const counts = animation.alternates || [animation.poses.length];
  $("#frameCount").innerHTML = counts.map(count => `<option value="${count}">${count} frames</option>`).join("");
  if (!$("#animationStage").classList.contains("hidden")) buildPlan();
}
$("#animationSelect").addEventListener("change", syncFrameOptions);

function canvasPoint(event) {
  const rect = poseCanvas.getBoundingClientRect();
  return [
    (event.clientX - rect.left) * (poseCanvas.width / rect.width),
    (event.clientY - rect.top) * (poseCanvas.height / rect.height)
  ];
}

poseCanvas.addEventListener("pointerdown", event => {
  if (playing) {
    playing = false;
    clearInterval(timer);
    $("#playButton").textContent = "▶";
  }
  const [x, y] = canvasPoint(event);
  const candidates = JOINT_KEYS
    .map(key => ({ key, distance: Math.hypot(poses[currentFrame][key][0] - x, poses[currentFrame][key][1] - y) }))
    .sort((a, b) => a.distance - b.distance);
  if (candidates[0].distance > 22) return;
  draggedJoint = candidates[0].key;
  poseCanvas.setPointerCapture(event.pointerId);
  poseCanvas.classList.add("dragging");
});

poseCanvas.addEventListener("pointermove", event => {
  if (!draggedJoint) return;
  const [x, y] = canvasPoint(event);
  poses[currentFrame][draggedJoint] = [
    Math.max(10, Math.min(310, Math.round(x))),
    Math.max(10, Math.min(310, Math.round(y)))
  ];
  drawPose(poseCanvas, poses[currentFrame]);
});

function finishJointDrag(event) {
  if (!draggedJoint) return;
  draggedJoint = null;
  poseCanvas.classList.remove("dragging");
  if (poseCanvas.hasPointerCapture(event.pointerId)) poseCanvas.releasePointerCapture(event.pointerId);
  renderTimeline();
  showFrame(currentFrame);
}
poseCanvas.addEventListener("pointerup", finishJointDrag);
poseCanvas.addEventListener("pointercancel", finishJointDrag);

$("#referenceOpacity").addEventListener("input", event => {
  $("#animatedSprite").style.opacity = Number(event.target.value) / 100;
});

$("#propagateForward").addEventListener("click", () => {
  if (currentFrame >= poses.length - 1) return;
  const offsets = Object.fromEntries(JOINT_KEYS.map(key => [
    key,
    [
      poses[currentFrame][key][0] - basePoses[currentFrame][key][0],
      poses[currentFrame][key][1] - basePoses[currentFrame][key][1]
    ]
  ]));

  for (let frame = currentFrame + 1; frame < poses.length; frame += 1) {
    JOINT_KEYS.forEach(key => {
      poses[frame][key] = [
        Math.max(10, Math.min(310, basePoses[frame][key][0] + offsets[key][0])),
        Math.max(10, Math.min(310, basePoses[frame][key][1] + offsets[key][1]))
      ];
    });
  }
  renderTimeline();
  showFrame(currentFrame + 1);
  $("#frameLabel").textContent += " · fit propagated";
});

$("#resetFrame").addEventListener("click", () => {
  poses[currentFrame] = clonePoses([basePoses[currentFrame]])[0];
  renderTimeline();
  showFrame(currentFrame);
});

$("#resetAll").addEventListener("click", () => {
  poses = clonePoses(basePoses);
  renderTimeline();
  showFrame(currentFrame);
});

$("#buildButton").addEventListener("click", buildPlan);
$("#frameCount").addEventListener("change", () => {
  if (!$("#animationStage").classList.contains("hidden")) buildPlan();
});
$("#previousFrame").addEventListener("click", () => showFrame(currentFrame - 1));
$("#nextFrame").addEventListener("click", () => showFrame(currentFrame + 1));

function startPlayback() {
  clearInterval(timer);
  timer = setInterval(() => showFrame(currentFrame + 1), 1000 / Number($("#fps").value));
}
$("#playButton").addEventListener("click", () => {
  if ($("#animationStage").classList.contains("hidden")) buildPlan();
  playing = !playing;
  $("#playButton").textContent = playing ? "Ⅱ" : "▶";
  if (playing) startPlayback(); else clearInterval(timer);
});

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

$("#exportJson").addEventListener("click", () => {
  const animationId = $("#animationSelect").value;
  const data = {
    schemaVersion: "0.1",
    animation: animationId,
    frameCount: poses.length,
    fps: Number($("#fps").value),
    canvas: { width: 320, height: 320 },
    baseline: 284,
    pivot: { x: 160, y: 284 },
    frames: poses.map((pose, index) => ({ index, durationMs: Math.round(1000 / Number($("#fps").value)), ...pose }))
  };
  download(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), `${animationId}-poses.json`);
});

$("#exportSheet").addEventListener("click", () => {
  const sheet = document.createElement("canvas");
  sheet.width = poses.length * 320; sheet.height = 320;
  const ctx = sheet.getContext("2d");
  poses.forEach((pose, index) => {
    const frame = document.createElement("canvas");
    frame.width = 320; frame.height = 320;
    drawPose(frame, pose);
    ctx.drawImage(frame, index * 320, 0);
  });
  sheet.toBlob(blob => download(blob, `${$("#animationSelect").value}-pose-sheet.png`), "image/png");
});
