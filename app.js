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

const $ = (selector) => document.querySelector(selector);
const fileInput = $("#fileInput");
const dropZone = $("#dropZone");
const sourcePreview = $("#sourcePreview");
const timeline = $("#timeline");
const poseCanvas = $("#poseCanvas");
let imageUrl = "";
let poses = WALK_POSES;
let currentFrame = 0;
let playing = false;
let timer = null;

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
  [pose.neck,pose.hip,pose.lElbow,pose.rElbow,pose.lKnee,pose.rKnee].forEach(point => {
    ctx.fillStyle = "#ef6b3b"; ctx.beginPath(); ctx.arc(...point, small ? 5 : 4, 0, Math.PI*2); ctx.fill();
  });
  ctx.restore();
}

function renderTimeline() {
  timeline.innerHTML = "";
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
  [...timeline.children].forEach((node, i) => node.classList.toggle("active", i === currentFrame));
}

function buildPlan() {
  const count = Number($("#frameCount").value);
  poses = count === 6 ? WALK_POSES.filter((_, i) => ![1,5].includes(i)) : WALK_POSES;
  currentFrame = 0;
  $("#emptyState").classList.add("hidden");
  $("#animationStage").classList.remove("hidden");
  timeline.classList.remove("hidden");
  $("#stageTitle").textContent = `Walk cycle · ${count} frames`;
  $("#exportJson").disabled = false;
  $("#exportSheet").disabled = false;
  renderTimeline();
  showFrame(0);
  document.querySelector(".steps span:nth-of-type(2)").classList.add("active");
}

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
  const data = {
    schemaVersion: "0.1",
    animation: "walk",
    frameCount: poses.length,
    fps: Number($("#fps").value),
    canvas: { width: 320, height: 320 },
    baseline: 284,
    pivot: { x: 160, y: 284 },
    frames: poses.map((pose, index) => ({ index, durationMs: Math.round(1000 / Number($("#fps").value)), ...pose }))
  };
  download(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), "walk-cycle.json");
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
  sheet.toBlob(blob => download(blob, "walk-cycle-sheet.png"), "image/png");
});
