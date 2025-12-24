/* ======================================================
   GIFT PHYSICS PRO ENGINE
   © Digital Sam Media
   ====================================================== */
(function () {

const REQUIRED_CREDIT_ID = "ds-gift-credit";
const REQUIRED_URL = "https://www.digitalsammedia.com/";
let CREDIT_OK = false;

/* ---------- SAFE CREDIT CHECK (ONCE ONLY) ---------- */
function verifyCreditOnce() {
    const link = document.getElementById(REQUIRED_CREDIT_ID);
    if (!link) return false;
    if (link.href !== REQUIRED_URL) return false;
    CREDIT_OK = true;
    return true;
}

/* ---------- ENGINE INIT ---------- */
window.initGiftSpinner = function (mountId) {
    const root = document.getElementById(mountId);
    if (!root) return;

    root.innerHTML = `
    <div id="gift-app-root">
      <div id="result-display">READY TO SPIN</div>
      <div class="shake-hint">Drag / Shake to spin</div>

      <div class="spinner-section">
        <div class="dial-outer"></div>
        <canvas id="wheel-canvas" width="450" height="450"></canvas>
        <div class="needle-assembly"><div id="physical-needle"></div></div>
        <div class="center-cap"></div>
      </div>

      <div class="input-panel">
        <div class="input-row">
          <input id="gift-input" maxlength="18" placeholder="Add gift">
          <button id="add-btn">ADD</button>
        </div>
        <div id="gift-tags"></div>
      </div>

      <a id="ds-gift-credit"
         href="https://www.digitalsammedia.com/"
         target="_blank"
         class="credit">
         Gift Spinner by Digital Sam Media
      </a>
    </div>
    `;

    verifyCreditOnce(); // 🔒 SAFE

    /* ---------- STATE ---------- */
    const canvas = document.getElementById("wheel-canvas");
    const ctx = canvas.getContext("2d");
    const needle = document.getElementById("physical-needle");
    const result = document.getElementById("result-display");
    const gifts = ["Watch","Phone","Chocolate","Surprise","Voucher"];
    let angle = 0, velocity = 0, spinning = false;

    /* ---------- DRAW ---------- */
    function draw() {
        ctx.clearRect(0,0,450,450);
        const cx=225, cy=225, r=210;
        const slice = Math.PI*2/gifts.length;

        gifts.forEach((g,i)=>{
            ctx.beginPath();
            ctx.moveTo(cx,cy);
            ctx.fillStyle=`hsl(${i*360/gifts.length},70%,45%)`;
            ctx.arc(cx,cy,r,i*slice-Math.PI/2,(i+1)*slice-Math.PI/2);
            ctx.fill();

            ctx.save();
            ctx.translate(cx,cy);
            ctx.rotate(i*slice+slice/2-Math.PI/2);
            ctx.fillStyle="#fff";
            ctx.font="bold 14px Arial";
            ctx.textAlign="right";
            ctx.fillText(g,r-20,5);
            ctx.restore();
        });
    }

    /* ---------- PHYSICS ---------- */
    function animate(){
        if(spinning){
            angle += velocity;
            velocity *= 0.985;
            if(velocity<0.02){
                spinning=false;
                pickWinner();
            }
        }
        needle.style.transform=`translateX(-50%) rotate(${angle}deg)`;
        requestAnimationFrame(animate);
    }

    function pickWinner(){
        if(!CREDIT_OK){
            result.textContent="Credit required";
            return;
        }
        const norm=(angle%360+360)%360;
        const index=Math.floor(((360-norm)%360)/(360/gifts.length));
        result.textContent="🎁 "+gifts[index];
        confetti();
    }

    /* ---------- INPUT ---------- */
    document.getElementById("add-btn").onclick=()=>{
        const val=document.getElementById("gift-input").value.trim();
        if(val && gifts.length<15){
            gifts.push(val);
            draw();
        }
    };

    /* ---------- DRAG + SHAKE ---------- */
    let lastX=0,lastT=Date.now();
    window.addEventListener("mousemove",e=>{
        const now=Date.now(),dt=now-lastT;
        const dx=e.clientX-lastX;
        if(Math.abs(dx/dt)>1){
            velocity+=Math.abs(dx)*0.01;
            spinning=true;
            result.textContent="SPINNING...";
        }
        lastX=e.clientX; lastT=now;
    });

    /* ---------- CONFETTI ---------- */
    function confetti(){
        for(let i=0;i<60;i++){
            const c=document.createElement("div");
            c.style.cssText=`position:fixed;width:8px;height:8px;
            left:${Math.random()*100}vw;
            background:hsl(${Math.random()*360},100%,50%);
            top:-10px;animation:fall ${Math.random()*2+1}s linear`;
            document.body.appendChild(c);
            setTimeout(()=>c.remove(),3000);
        }
    }

    draw();
    animate();
};

})();
