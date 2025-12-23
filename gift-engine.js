/* =========================================================
   🎁 GIFT SPINNER ENGINE — DIGITAL SAM MEDIA
   CORE: Scoped CSS + Spinner Physics + UI Logic
========================================================= */

(function(){

/* ---------- SCOPED STYLES ---------- */
const styles = `
#gift-app-root {
  --bg-dark:#0f1016; --panel-bg:#1a1c25; --accent:#00f2ff;
  --needle:#ff0055; --txt:#fff; --border:#2d303d;
  background:var(--bg-dark); color:var(--txt);
  font-family:Segoe UI,sans-serif;
  border-radius:16px; padding:20px; max-width:420px;
}
#gift-app-root .spinner-section{
  position:relative; width:300px; height:300px; margin:20px auto;
}
#gift-app-root canvas{
  width:100%; height:100%; border-radius:50%;
  border:8px solid var(--border);
}
#gift-app-root .needle{
  position:absolute; top:-8px; left:50%;
  transform:translateX(-50%);
  width:0;height:0;
  border-left:14px solid transparent;
  border-right:14px solid transparent;
  border-bottom:28px solid var(--needle);
}
#gift-app-root .panel{
  background:var(--panel-bg); padding:15px; border-radius:12px;
}
#gift-app-root input{
  width:70%; padding:8px; background:#000;
  border:1px solid #444; color:#fff; border-radius:6px;
}
#gift-app-root button{
  width:25%; padding:8px; background:var(--accent);
  border:none; font-weight:bold; cursor:pointer;
}
#gift-app-root .tags{
  display:flex; flex-wrap:wrap; gap:6px; margin-top:10px;
}
#gift-app-root .tag{
  background:#2d303d; padding:4px 10px;
  border-radius:14px; font-size:12px;
}
#gift-app-root .result{
  text-align:center; font-size:20px; margin-top:10px;
}
#gift-app-root .credit{
  font-size:10px; opacity:.6; text-align:center; margin-top:10px;
}
`;

const s=document.createElement("style");
s.innerHTML=styles;
document.head.appendChild(s);

/* ---------- MAIN INIT FUNCTION ---------- */
window.initGiftApp=function(containerId,creditUrl){

const root=document.getElementById(containerId);
root.id="gift-app-root";
root.innerHTML=`
  <div class="spinner-section">
    <div class="needle"></div>
    <canvas width="300" height="300"></canvas>
  </div>

  <div class="panel">
    <input id="giftInput" placeholder="Add gift…">
    <button id="addGift">ADD</button>
    <div class="tags"></div>
  </div>

  <div class="result">Click SPIN</div>
  <button id="spinBtn">SPIN 🎉</button>

  <div class="credit">
    Widget by <a href="${creditUrl}" target="_blank">Digital Sam Media</a>
  </div>
`;

const canvas=root.querySelector("canvas");
const ctx=canvas.getContext("2d");
const tags=root.querySelector(".tags");
const result=root.querySelector(".result");

let gifts=[],angle=0,vel=0,spinning=false;

/* Draw Wheel */
function draw(){
  ctx.clearRect(0,0,300,300);
  if(!gifts.length) return;
  let slice=2*Math.PI/gifts.length;
  gifts.forEach((_,i)=>{
    ctx.beginPath();
    ctx.moveTo(150,150);
    ctx.fillStyle=`hsl(${i*360/gifts.length},80%,55%)`;
    ctx.arc(150,150,140,angle+i*slice,angle+(i+1)*slice);
    ctx.fill();
  });
}

/* Add Gift */
root.querySelector("#addGift").onclick=()=>{
  let val=root.querySelector("#giftInput").value.trim();
  if(!val || gifts.length>=10) return;
  gifts.push(val);
  let t=document.createElement("div");
  t.className="tag"; t.textContent=val;
  tags.appendChild(t);
  root.querySelector("#giftInput").value="";
  draw();
};

/* Spin */
root.querySelector("#spinBtn").onclick=()=>{
  if(gifts.length<2) return alert("Add at least 2 gifts");
  vel=Math.random()*0.4+0.4;
  spinning=true;

  function anim(){
    angle+=vel;
    vel*=0.985;
    draw();
    if(vel<0.002){
      spinning=false;
      let slice=2*Math.PI/gifts.length;
      let index=Math.floor(((2*Math.PI-angle)%(2*Math.PI))/slice);
      result.textContent="😂 Haha! Gift: "+gifts[index];
      return;
    }
    requestAnimationFrame(anim);
  }
  anim();
};

draw();
};

})();
