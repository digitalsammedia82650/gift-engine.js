/* =========================================================
   GIFT PHYSICS PRO — ULTIMATE ENGINE
   © Digital Sam Media — Credit Protected
========================================================= */
(function(){

/* ---------------- CSS (SCOPED) ---------------- */
const styles = `
#gift-app-root{
  --bg:#0f1016;--panel:#1a1c25;--accent:#00f2ff;
  --needle:#ff0055;--border:#2d303d;--txt:#fff;
  background:var(--bg);color:var(--txt);
  font-family:'Segoe UI',sans-serif;
  min-height:100vh;padding:20px;
  display:flex;flex-direction:column;align-items:center;
}
#gift-app-root *{box-sizing:border-box}

.spinner-section{position:relative;width:450px;height:450px}
#wheel-canvas{width:100%;height:100%;border-radius:50%;
  border:12px solid var(--border);
  box-shadow:0 20px 60px rgba(0,0,0,.7)}
.needle{
  position:absolute;top:-8px;left:50%;
  transform:translateX(-50%);
  width:0;height:0;
  border-left:16px solid transparent;
  border-right:16px solid transparent;
  border-bottom:32px solid var(--needle);
  filter:drop-shadow(0 0 12px rgba(255,0,85,.6))
}
.center-cap{
  position:absolute;top:50%;left:50%;
  width:42px;height:42px;
  background:#111;border:4px solid var(--border);
  border-radius:50%;transform:translate(-50%,-50%)
}

#result{font-size:2.4rem;font-weight:900;color:var(--accent);
  margin:15px;text-align:center}
.hint{font-size:.8rem;color:#666;letter-spacing:2px}

.panel{
  background:var(--panel);
  padding:20px;border-radius:18px;
  border:1px solid var(--border);
  max-width:520px;width:100%
}
.row{display:flex;gap:10px;margin-bottom:15px}
input{
  flex:1;background:#000;color:#fff;
  border:1px solid #444;padding:10px;border-radius:8px
}
button{
  background:var(--accent);border:none;
  padding:10px 18px;font-weight:bold;
  border-radius:8px;cursor:pointer
}
.tags{display:flex;flex-wrap:wrap;gap:8px}
.tag{background:#2d303d;padding:6px 14px;border-radius:20px}
.credit{font-size:10px;opacity:.6;margin-top:12px}

.confetti{
  position:fixed;width:10px;height:10px;
  top:-10px;animation:fall linear forwards;z-index:9999
}
@keyframes fall{to{transform:translateY(110vh) rotate(720deg)}}
`;

/* Inject once */
if(!document.getElementById("gift-style")){
  const s=document.createElement("style");
  s.id="gift-style";s.innerText=styles;
  document.head.appendChild(s);
}

/* ---------------- INIT ---------------- */
window.initGiftApp=function(containerId,creditUrl){

const root=document.getElementById(containerId);
root.id="gift-app-root";

root.innerHTML=`
  <div id="result">READY 🎁</div>
  <div class="hint">SHAKE • DRAG • ROLL DICE</div>

  <div class="spinner-section">
    <div class="needle"></div>
    <canvas id="wheel-canvas" width="450" height="450"></canvas>
    <div class="center-cap"></div>
  </div>

  <div class="panel">
    <div class="row">
      <input id="giftInput" placeholder="Add gift…">
      <button id="add">ADD</button>
      <button id="dice">🎲</button>
    </div>
    <div class="tags"></div>
  </div>

  <a class="credit" href="${creditUrl}" target="_blank">DIGITAL SAM MEDIA</a>
`;

/* ---------------- CREDIT LOCK ---------------- */
setInterval(()=>{
  const link=root.querySelector(".credit");
  if(!link || link.href!==creditUrl){
    root.innerHTML="<h2 style='color:red'>Credit removed</h2>";
    throw new Error("Credit lock triggered");
  }
},2000);

/* ---------------- CORE LOGIC ---------------- */
const canvas=root.querySelector("#wheel-canvas");
const ctx=canvas.getContext("2d");
const tags=root.querySelector(".tags");
const result=root.querySelector("#result");

let gifts=["Watch","Phone","Chocolate","Shoes","Trip"];
let angle=0,vel=0,dragging=false,lastX=0;

/* Sounds */
const spinSound=new Audio("https://cdn.jsdelivr.net/gh/digitalsammedia82650/assets/spin.mp3");
const winSound=new Audio("https://cdn.jsdelivr.net/gh/digitalsammedia82650/assets/win.mp3");

/* Draw wheel */
function draw(){
  ctx.clearRect(0,0,450,450);
  const cx=225,cy=225,r=200;
  const slice=2*Math.PI/gifts.length;
  gifts.forEach((g,i)=>{
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.fillStyle=`hsl(${i*360/gifts.length},75%,50%)`;
    ctx.arc(cx,cy,r,angle+i*slice,angle+(i+1)*slice);
    ctx.fill();
  });
}

/* Tags */
function renderTags(){
  tags.innerHTML="";
  gifts.forEach(g=>{
    const t=document.createElement("div");
    t.className="tag";t.textContent=g;
    tags.appendChild(t);
  });
}

/* Spin end */
function settle(){
  const slice=2*Math.PI/gifts.length;
  const idx=Math.floor(((2*Math.PI-angle)%(2*Math.PI))/slice);
  result.textContent="😂 HAH HA! "+gifts[idx];
  winSound.play();confetti();
}

/* Confetti */
function confetti(){
  for(let i=0;i<80;i++){
    const c=document.createElement("div");
    c.className="confetti";
    c.style.left=Math.random()*100+"vw";
    c.style.background=`hsl(${Math.random()*360},100%,60%)`;
    c.style.animationDuration=1.5+Math.random()*2+"s";
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),3500);
  }
}

/* Animate */
function animate(){
  angle+=vel;vel*=0.985;
  draw();
  if(vel>0.002) requestAnimationFrame(animate);
  else if(vel>0) settle();
}

/* Drag spin */
canvas.onmousedown=e=>{
  dragging=true;lastX=e.clientX;
};
window.onmouseup=()=>dragging=false;
window.onmousemove=e=>{
  if(dragging){
    vel+=(e.clientX-lastX)*0.0006;
    lastX=e.clientX;
    spinSound.play();
    animate();
  }
};

/* Dice stop */
root.querySelector("#dice").onclick=()=>{
  vel=Math.random()*0.8+0.6;
  spinSound.play();animate();
};

/* Mouse shake */
let last={x:0,y:0,t:Date.now()};
window.addEventListener("mousemove",e=>{
  const now=Date.now();
  const dx=e.clientX-last.x,dy=e.clientY-last.y;
  const sp=Math.sqrt(dx*dx+dy*dy)/(now-last.t||1);
  if(sp>1.8){vel+=sp*0.3;spinSound.play();animate();}
  last={x:e.clientX,y:e.clientY,t:now};
});

/* Mobile gyro */
window.addEventListener("devicemotion",e=>{
  const a=e.accelerationIncludingGravity;
  if(a && Math.abs(a.x)>8){
    vel+=Math.abs(a.x)*0.01;
    spinSound.play();animate();
  }
});

/* Add gift */
root.querySelector("#add").onclick=()=>{
  const v=root.querySelector("#giftInput").value.trim();
  if(v && gifts.length<12){
    gifts.push(v);renderTags();draw();
    root.querySelector("#giftInput").value="";
  }
};

draw();renderTags();

};

})();
