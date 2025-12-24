/* ======================================================
   GIFT ENGINE CORE v1.2
   © Digitalsam Media
   Logic Layer Only – CDN Safe
   ====================================================== */

(function (global) {

  const GiftEngine = {
    canvas: null,
    ctx: null,
    gifts: [],
    angle: 0,
    velocity: 0,
    friction: 0.985,
    settled: true,
    callbacks: {},

    init(cfg) {
      this.canvas = cfg.canvas;
      this.ctx = cfg.ctx;
      this.gifts = cfg.gifts || [];
      this.callbacks = cfg;
      this.draw();
      this.loop();
    },

    addGift(name) {
      if (!name || this.gifts.length >= 15) return;
      this.gifts.push(name);
      this.draw();
    },

    removeGift(i) {
      this.gifts.splice(i, 1);
      this.draw();
    },

    shake(force) {
      if (force > 1.8) {
        this.velocity += force * 0.5;
        this.settled = false;
        this.callbacks.onSpin?.();
      }
    },

    snap(angle) {
      const slice = 360 / this.gifts.length;
      return Math.round(angle / slice) * slice;
    },

    loop() {
      if (!this.settled) {
        this.angle += this.velocity;
        this.velocity *= this.friction;

        if (this.velocity < 0.02) {
          this.velocity = 0;
          this.settled = true;
          this.angle = this.snap(this.angle);
          this.callbacks.onResult?.(this.getWinner());
        }
      }
      requestAnimationFrame(() => this.loop());
    },

    getWinner() {
      let n = this.angle % 360;
      if (n < 0) n += 360;
      const slice = 360 / this.gifts.length;
      return this.gifts[Math.floor(((360 - n) % 360) / slice)];
    },

    draw() {
      const s = this.canvas.width;
      const cx = s / 2;
      const cy = s / 2;
      const r = cx - 15;
      const ctx = this.ctx;

      ctx.clearRect(0, 0, s, s);
      if (!this.gifts.length) return;

      const slice = (Math.PI * 2) / this.gifts.length;

      this.gifts.forEach((g, i) => {
        const a = i * slice - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.fillStyle = `hsl(${i * 360 / this.gifts.length},65%,45%)`;
        ctx.arc(cx, cy, r, a, a + slice);
        ctx.fill();

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
  };

  global.GiftEngine = GiftEngine;

})(window);
