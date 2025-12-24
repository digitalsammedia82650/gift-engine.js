/**
 * Gift Physics Pro - Core Engine
 * Repository: digitalsammedia82650/gift-engine.js
 */
window.GiftEngine = (function() {
    let state = {
        gifts: [],
        currentAngle: 0,
        velocity: 0,
        isSettled: true,
        lastMousePos: { x: 0, y: 0 },
        lastTime: Date.now()
    };

    let config = {};

    function init(userConfig) {
        config = userConfig;
        state.gifts = userConfig.gifts || [];
        setupEvents();
        animate();
        renderCanvas();
    }

    function setupEvents() {
        window.addEventListener('mousemove', (e) => {
            const now = Date.now();
            const dt = now - state.lastTime;
            if (dt < 10) return;

            const dx = e.clientX - state.lastMousePos.x;
            const dy = e.clientY - state.lastMousePos.y;
            const mouseVelocity = Math.sqrt(dx*dx + dy*dy) / dt;

            // Trigger Spin Physics
            if (mouseVelocity > 1.8) {
                state.velocity += mouseVelocity * 0.5;
                if (state.isSettled) {
                    state.isSettled = false;
                    if (config.onSpin) config.onSpin();
                }
            }
            state.lastMousePos = { x: e.clientX, y: e.clientY };
            state.lastTime = now;
        });
    }

    function renderCanvas() {
        const { ctx, canvas } = config;
        if (!ctx || !canvas) return;
        
        const gifts = state.gifts;
        const cx = 225, cy = 225, r = 210;

        ctx.clearRect(0, 0, 450, 450);
        if (gifts.length === 0) return;

        const slice = (Math.PI * 2) / gifts.length;
        gifts.forEach((gift, i) => {
            const startA = i * slice - Math.PI/2;
            const endA = (i + 1) * slice - Math.PI/2;

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.fillStyle = `hsl(${(i * 360 / gifts.length)}, 65%, 40%)`;
            ctx.arc(cx, cy, r, startA, endA);
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(startA + slice/2);
            ctx.textAlign = "right";
            ctx.fillStyle = "white";
            ctx.font = "bold 14px Arial";
            ctx.fillText(gift, r - 20, 5);
            ctx.restore();
        });
    }

    function animate() {
        if (!state.isSettled) {
            state.currentAngle += state.velocity;
            state.velocity *= 0.985; // Heavy Friction Calculation

            if (state.velocity < 0.02) {
                state.velocity = 0;
                state.isSettled = true;
                calculateWinner();
            }
            // Update Needle Rotation
            if(config.needle) config.needle.style.transform = `translateX(-50%) rotate(${state.currentAngle}deg)`;
        }
        requestAnimationFrame(animate);
    }

    function calculateWinner() {
        if (state.gifts.length === 0) return;
        let normalized = state.currentAngle % 360;
        if (normalized < 0) normalized += 360;
        const sliceSize = 360 / state.gifts.length;
        const index = Math.floor(((360 - normalized) % 360) / sliceSize);
        if (config.onResult) config.onResult(state.gifts[index]);
    }

    return {
        init: init,
        addGift: (name) => { 
            state.gifts.push(name); 
            renderCanvas(); 
        },
        removeGift: (index) => { 
            state.gifts.splice(index, 1); 
            renderCanvas(); 
        },
        getGifts: () => state.gifts
    };
})();
