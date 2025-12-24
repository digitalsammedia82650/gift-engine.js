/* ======================================================
   GIFT ENGINE CORE v1.4
   © Digitalsam Media
   ====================================================== */

(function (global) {

  let canvas, ctx, needle;
  let gifts = [];
  let angle = 0;
  let velocity = 0;
  let settled = true;
  const friction = 0.985;
  let callbacks = {};
  let lastMouse = { x: 0, y: 0, t: Date.now() };

  function draw() {
    if (!canvas || !ctx || !gifts.length) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 15;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const slice = (Math.PI * 2) / gifts.length;
    gifts.forEach((g, i) => {
      const a = i * slice - Math.PI / 2;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.fillStyle = `hsl(${i * 360 / gifts.length},65%,40%)`;
      ctx.arc(cx, cy, r, a, a + slice);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(a + slice / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px Arial";
      ctx.fillText(g, r - 20, 5);
      ctx.restore();
    });
  }

  function getWinner() {
    let n = angle % 360;
    if (n < 0) n += 360;
    const slice = 360 / gifts.length;
    return gifts[Math.floor(((360 - n) % 360) / slice)];
  }

  function animate() {
    if (!settled) {
      angle += velocity;
      velocity *= friction;

      if (velocity < 0.02) {
        velocity = 0;
        settled = true;
        callbacks.onResult?.(getWinner());
      }
    }
    if (needle) {
      needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    }
    requestAnimationFrame(animate);
  }

  function shakeFromMouse(e) {
    const now = Date.now();
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const force = dist / (now - lastMouse.t);

    if (force > 1.8) {
      velocity += force * 0.5;
      settled = false;
      callbacks.onSpin?.();
    }

    lastMouse = { x: e.clientX, y: e.clientY, t: now };
  }

  global.GiftEngine = {

    init(cfg) {
      canvas = cfg.canvas;
      ctx = cfg.ctx;
      needle = cfg.needle;
      gifts = cfg.gifts || [];
      callbacks = cfg || {};
      draw();
      animate();
      window.addEventListener("mousemove", shakeFromMouse);
    },

    addGift(name) {
      if (!name || gifts.length >= 15) return;
      gifts.push(name);
      draw();
    },

    removeGift(i) {
      gifts.splice(i, 1);
      draw();
    },

    getGifts() {
      return gifts.slice();
    }
  };

})(window);
