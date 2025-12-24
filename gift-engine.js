// Wait for DOM to be fully loaded
(function() {
    function initGiftSpinner() {
        const canvas = document.getElementById('wheel-canvas');
        const ctx = canvas.getContext('2d');
        const needle = document.getElementById('physical-needle');
        const resultDisplay = document.getElementById('result-display');
        const inputField = document.getElementById('gift-input-field');
        const addBtn = document.getElementById('add-gift-btn');
        const tagDisplay = document.getElementById('tag-display');

        // Check if elements exist
        if (!canvas || !ctx || !needle || !resultDisplay || !inputField || !addBtn || !tagDisplay) {
            console.error('Gift spinner elements not found. Retrying...');
            setTimeout(initGiftSpinner, 100);
            return;
        }

        let gifts = ["Watch", "Gaming PC", "iPhone 15", "Chocolate", "Mystery Box", "Car"];
        
        // Physics State
        let currentAngle = 0;
        let velocity = 0;
        let lastMousePos = { x: 0, y: 0 };
        let lastTime = Date.now();
        let isSettled = true;

        // Render Logic
        function renderGifts() {
            // Render Tags
            tagDisplay.innerHTML = '';
            gifts.forEach((g, i) => {
                const tag = document.createElement('div');
                tag.className = 'gift-tag';
                tag.innerHTML = `${g} <span class="remove" data-index="${i}">×</span>`;
                tagDisplay.appendChild(tag);
            });

            // Add event listeners to remove buttons
            document.querySelectorAll('.gift-tag .remove').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    gifts.splice(index, 1);
                    renderGifts();
                });
            });

            // Draw Dial Segments
            const cx = 225, cy = 225, r = 210;
            ctx.clearRect(0, 0, 450, 450);
            if (gifts.length === 0) return;

            const slice = (Math.PI * 2) / gifts.length;
            gifts.forEach((gift, i) => {
                const startA = i * slice - Math.PI/2;
                const endA = (i + 1) * slice - Math.PI/2;

                // Draw Pie Slice
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.fillStyle = `hsl(${(i * 360 / gifts.length)}, 65%, 40%)`;
                ctx.arc(cx, cy, r, startA, endA);
                ctx.fill();
                ctx.strokeStyle = "rgba(255,255,255,0.1)";
                ctx.lineWidth = 2;
                ctx.stroke();

                // Draw Text
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

        // Input Actions
        addBtn.addEventListener('click', function() {
            const val = inputField.value.trim();
            if (val && gifts.length < 15) {
                gifts.push(val);
                inputField.value = '';
                renderGifts();
            }
        });

        // Allow Enter key to add gift
        inputField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addBtn.click();
            }
        });

        // Physics Loop
        window.addEventListener('mousemove', (e) => {
            const now = Date.now();
            const dt = now - lastTime;
            if (dt < 10) return;

            const dx = e.clientX - lastMousePos.x;
            const dy = e.clientY - lastMousePos.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const mouseVelocity = dist / dt;

            // If shaking rapidly, add momentum to the needle
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
                velocity *= 0.985; // Friction

                // Stop condition
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
            
            // Normalize angle to 0-360
            let normalized = currentAngle % 360;
            if (normalized < 0) normalized += 360;

            const sliceSize = 360 / gifts.length;
            // Needle points UP (0 deg), so we find which index covers the 0 deg position
            // relative to the starting offset of the draw code
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

        // Initialize
        renderGifts();
        animate();
    }

    // Try to initialize immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGiftSpinner);
    } else {
        initGiftSpinner();
    }
})();
