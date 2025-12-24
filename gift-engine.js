/**
 * Gift Physics Pro - Core Logic
 * Moved to external for performance and security
 */
(function() {
    const canvas = document.getElementById('wheel-canvas');
    const ctx = canvas.getContext('2d');
    const needle = document.getElementById('physical-needle');
    const resultDisplay = document.getElementById('result-display');
    const inputField = document.getElementById('gift-input-field');
    const addBtn = document.getElementById('add-gift-btn');
    const tagDisplay = document.getElementById('tag-display');

    // Initial heavy data or "secret" list
    let gifts = ["Watch", "Gaming PC", "iPhone 15", "Chocolate", "Mystery Box", "Car"];
    
    let currentAngle = 0;
    let velocity = 0;
    let lastMousePos = { x: 0, y: 0 };
    let lastTime = Date.now();
    let isSettled = true;

    function init() {
        renderGifts();
        animate();
    }

    function renderGifts() {
        tagDisplay.innerHTML = '';
        gifts.forEach((g, i) => {
            const tag = document.createElement('div');
            tag.className = 'gift-tag';
            tag.innerHTML = `${g} <span class="remove" onclick="removeGift(${i})">×</span>`;
            tagDisplay.appendChild(tag);
        });

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

    addBtn.onclick = () => {
        const val = inputField.value.trim();
        if (val && gifts.length < 15) {
            gifts.push(val);
            inputField.value = '';
            renderGifts();
        }
    };

    window.removeGift = (i) => {
        gifts.splice(i, 1);
        renderGifts();
    };

    window.addEventListener('mousemove', (e) => {
        const now = Date.now();
        const dt = now - lastTime;
        if (dt < 10) return;

        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const mouseVelocity = dist / dt;

        if (mouseVelocity > 1.8) {
            velocity += mouseVelocity * 0.5;
            isSettled = false;
            resultDisplay.innerText = "SPINNING...";
            resultDisplay.style.color = "white";
        }

        lastMousePos = { x: e.clientX, y: e.clientY };
        lastTime = now;
    });

    function animate() {
        if (!isSettled) {
            currentAngle += velocity;
            velocity *= 0.985; 

            if (velocity < 0.02) {
                velocity = 0;
                isSettled = true;
                calculateWinner();
            }
        }
        needle.style.transform = `translateX(-50%) rotate(${currentAngle}deg)`;
        requestAnimationFrame(animate);
    }

    function calculateWinner() {
        if (gifts.length === 0) return;
        let normalized = currentAngle % 360;
        if (normalized < 0) normalized += 360;
        const sliceSize = 360 / gifts.length;
        const index = Math.floor(((360 - normalized) % 360) / sliceSize);
        const winner = gifts[index];
        resultDisplay.innerText = "WINNER: " + winner.toUpperCase() + "!";
        resultDisplay.style.color = "#00f2ff";
        spawnConfetti();
    }

    function spawnConfetti() {
        for(let i=0; i<60; i++){
            const p = document.createElement("div");
            p.className = "confetti-piece";
            p.style.left = Math.random() * 100 + "vw";
            p.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
            p.style.animationDuration = (Math.random() * 2 + 1) + "s";
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 3000);
        }
    }

    init();
})();
