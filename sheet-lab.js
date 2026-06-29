const $ = selector => document.querySelector(selector);
const input = $("#sheetInput");
const sourceCanvas = $("#sourceCanvas");
const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
let sourceImage = null;
let frames = [];
let background = [0, 255, 255];

function loadImage(file) {
  if (!file?.type.startsWith("image/")) return;
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    sourceImage = image;
    sourceCanvas.width = image.naturalWidth;
    sourceCanvas.height = image.naturalHeight;
    sourceContext.drawImage(image, 0, 0);
    background = sampleCorners(sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height));
    $("#fileName").textContent = `${file.name} · ${sourceCanvas.width} × ${sourceCanvas.height}`;
    $("#analyse").disabled = false;
    $("#status").textContent = `Background sampled near rgb(${background.map(Math.round).join(", ")}).`;
    URL.revokeObjectURL(url);
  };
  image.src = url;
}

function sampleCorners(imageData) {
  const { data, width, height } = imageData;
  const size = Math.max(4, Math.floor(Math.min(width, height) * .02));
  const samples = [];
  [[0,0],[width-size,0],[0,height-size],[width-size,height-size]].forEach(([sx,sy]) => {
    for (let y = sy; y < sy + size; y += 2) for (let x = sx; x < sx + size; x += 2) {
      const i = (y * width + x) * 4;
      samples.push([data[i], data[i+1], data[i+2]]);
    }
  });
  return [0,1,2].map(channel => samples.reduce((sum, value) => sum + value[channel], 0) / samples.length);
}

function chromaKey(imageData, tolerance) {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const distance = Math.hypot(data[i]-background[0], data[i+1]-background[1], data[i+2]-background[2]);
    if (distance < tolerance) data[i+3] = 0;
  }
}

function removeGroundLines(imageData) {
  const { data, width, height } = imageData;
  const candidates = [];
  for (let y = 0; y < height; y += 1) {
    let dark = 0;
    for (let x = 0; x < width; x += 2) {
      const i = (y * width + x) * 4;
      if (data[i+3] && data[i] + data[i+1] + data[i+2] < 230) dark += 1;
    }
    if (dark > width * .28) candidates.push(y);
  }
  candidates.forEach(y => {
    for (let yy = Math.max(0,y-1); yy <= Math.min(height-1,y+1); yy += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (yy * width + x) * 4;
        if (data[i] + data[i+1] + data[i+2] < 260) data[i+3] = 0;
      }
    }
  });
  return candidates;
}

function largestComponent(imageData) {
  const { data, width, height } = imageData;
  const seen = new Uint8Array(width * height);
  let largest = [];
  let secondSize = 0;
  const neighbours = [[1,0],[-1,0],[0,1],[0,-1]];
  for (let start = 0; start < width * height; start += 1) {
    if (seen[start] || data[start*4+3] < 20) continue;
    const stack = [start];
    const component = [];
    seen[start] = 1;
    while (stack.length) {
      const point = stack.pop();
      component.push(point);
      const x = point % width, y = Math.floor(point / width);
      neighbours.forEach(([dx,dy]) => {
        const nx=x+dx, ny=y+dy, next=ny*width+nx;
        if (nx>=0 && nx<width && ny>=0 && ny<height && !seen[next] && data[next*4+3]>=20) {
          seen[next]=1; stack.push(next);
        }
      });
    }
    if (component.length > largest.length) {
      secondSize = largest.length;
      largest = component;
    } else secondSize = Math.max(secondSize, component.length);
  }
  const keep = new Uint8Array(width * height);
  largest.forEach(index => keep[index] = 1);
  let left=width,top=height,right=-1,bottom=-1,touches=false;
  for (let i=0;i<width*height;i+=1) {
    if (!keep[i]) data[i*4+3]=0;
    else {
      const x=i%width,y=Math.floor(i/width);
      left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
      if (x<2 || x>width-3 || y<2 || y>height-3) touches=true;
    }
  }
  return { bounds:{left,top,right,bottom}, largest:largest.length, secondSize, touches };
}

function analyse() {
  if (!sourceImage) return;
  sourceContext.clearRect(0,0,sourceCanvas.width,sourceCanvas.height);
  sourceContext.drawImage(sourceImage,0,0);
  const keyed = sourceContext.getImageData(0,0,sourceCanvas.width,sourceCanvas.height);
  chromaKey(keyed, Number($("#tolerance").value));
  const lines = $("#removeLines").checked ? removeGroundLines(keyed) : [];
  sourceContext.putImageData(keyed,0,0);
  const columns=Math.max(1,Number($("#columns").value));
  const rows=Math.max(1,Number($("#rows").value));
  const cellWidth=sourceCanvas.width/columns, cellHeight=sourceCanvas.height/rows;
  frames=[];
  for(let row=0;row<rows;row+=1) for(let column=0;column<columns;column+=1) {
    const sx=Math.round(column*cellWidth), sy=Math.round(row*cellHeight);
    const ex=Math.round((column+1)*cellWidth), ey=Math.round((row+1)*cellHeight);
    const canvas=document.createElement("canvas");
    canvas.width=ex-sx;canvas.height=ey-sy;
    const context=canvas.getContext("2d");
    const imageData=sourceContext.getImageData(sx,sy,canvas.width,canvas.height);
    const component=largestComponent(imageData);
    context.putImageData(imageData,0,0);
    const empty=component.largest<100;
    const review=!empty && (component.touches || component.secondSize>component.largest*.2);
    frames.push({canvas,bounds:component.bounds,approved:!empty,review,empty,row,column});
  }
  renderFrames();
  $("#export").disabled=!frames.some(frame=>frame.approved);
  $("#keepAll").disabled=false;
  $("#status").textContent=`${frames.filter(f=>!f.empty).length} occupied cells · ${frames.filter(f=>f.review).length} flagged for review · ${lines.length} ground-line rows removed.`;
}

function renderFrames() {
  const container=$("#frames");
  container.innerHTML="";
  frames.forEach((frame,index)=>{
    const button=document.createElement("button");
    button.className=`frame${frame.review?" review":""}${frame.approved?"":" rejected"}`;
    button.type="button";
    const preview=document.createElement("canvas");
    preview.width=frame.canvas.width;preview.height=frame.canvas.height;
    preview.getContext("2d").drawImage(frame.canvas,0,0);
    const number=document.createElement("span");
    number.textContent=String(index+1).padStart(2,"0");
    button.append(preview,number);
    if(frame.review){const warning=document.createElement("b");warning.textContent="REVIEW";button.append(warning);}
    button.addEventListener("click",()=>{
      frame.approved=!frame.approved;
      button.classList.toggle("rejected",!frame.approved);
      $("#export").disabled=!frames.some(item=>item.approved&&!item.empty);
    });
    container.append(button);
  });
}

function exportSheet() {
  const columns=Math.max(1,Number($("#columns").value));
  const rows=Math.max(1,Number($("#rows").value));
  const size=Number($("#cellSize").value);
  const padding=Math.max(0,Number($("#padding").value));
  const valid=frames.filter(frame=>frame.approved&&!frame.empty);
  const maxWidth=Math.max(...valid.map(f=>f.bounds.right-f.bounds.left+1));
  const maxHeight=Math.max(...valid.map(f=>f.bounds.bottom-f.bounds.top+1));
  const scale=Math.min((size-padding*2)/maxWidth,(size-padding*2)/maxHeight);
  const output=document.createElement("canvas");
  output.width=columns*size;output.height=rows*size;
  const context=output.getContext("2d");
  context.imageSmoothingEnabled=true;
  frames.forEach(frame=>{
    if(!frame.approved||frame.empty)return;
    const b=frame.bounds,w=b.right-b.left+1,h=b.bottom-b.top+1;
    const dw=w*scale,dh=h*scale;
    const dx=frame.column*size+(size-dw)/2;
    const dy=frame.row*size+size-padding-dh;
    context.drawImage(frame.canvas,b.left,b.top,w,h,dx,dy,dw,dh);
  });
  output.toBlob(blob=>{
    const link=document.createElement("a");
    link.href=URL.createObjectURL(blob);
    link.download=`clean-sprites-${size}px.png`;
    link.click();
    setTimeout(()=>URL.revokeObjectURL(link.href),1000);
  },"image/png");
}

input.addEventListener("change",()=>loadImage(input.files[0]));
$("#analyse").addEventListener("click",analyse);
$("#export").addEventListener("click",exportSheet);
$("#keepAll").addEventListener("click",()=>{
  frames.forEach(frame=>frame.approved=!frame.empty);
  renderFrames();
  $("#export").disabled=!frames.some(frame=>frame.approved&&!frame.empty);
});
$("#tolerance").addEventListener("input",event=>{$("#toleranceOut").value=event.target.value;});
