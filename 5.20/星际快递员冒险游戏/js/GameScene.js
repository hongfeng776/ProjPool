class GameScene extends Scene {
    constructor(game) {
        super(game);
        this.reset();
    }

    reset() {
        this.stars = [];
        this.planets = [];
        this.player = {
            x: 200,
            y: 360,
            width: 70,
            height: 50,
            maxSpeed: 450,
            acceleration: 1500,
            friction: 800,
            vx: 0,
            vy: 0,
            tilt: 0,
            targetTilt: 0,
            hasPackage: false,
            currentPackage: null
        };
        this.keys = {};
        this.packages = [];
        this.packageSpawnTimer = 0;
        this.particles = [];
        this.score = 0;
        this.deliveries = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.showControls = true;
        this.controlsTimer = 5;
        
        this.currentMission = null;
        this.missionComplete = false;
        this.missionTimer = 0;
        this.totalMissions = 0;
    }

    init(loadSave = false) {
        super.init();
        this.reset();
        this.generateStars();
        this.generatePlanets();
        
        if (loadSave && storageManager.hasSaveData()) {
            this.loadSaveData();
        }
        
        this.generateMission();
    }

    generateStars() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 1 + 0.5,
                twinkle: Math.random() * Math.PI * 2
            });
        }
    }

    generatePlanets() {
        this.planets = [];
        const planetTypes = [
            { name: '岩石星', color: '#8B7355', accent: '#A0522D', hasRings: false },
            { name: '海洋星', color: '#4A90D9', accent: '#2E5A8C', hasRings: false },
            { name: '熔岩星', color: '#FF6B35', accent: '#CC4400', hasRings: false },
            { name: '冰霜星', color: '#B8D4E8', accent: '#7EB6D9', hasRings: false },
            { name: '丛林星', color: '#228B22', accent: '#006400', hasRings: false },
            { name: '紫晶星', color: '#9B59B6', accent: '#6C3483', hasRings: true }
        ];

        const positions = [
            { x: 150, y: 120 },
            { x: 1050, y: 150 },
            { x: 200, y: 550 },
            { x: 950, y: 520 },
            { x: 640, y: 360 }
        ];

        positions.forEach((pos, i) => {
            const type = planetTypes[i % planetTypes.length];
            const size = 45 + Math.random() * 25;
            this.planets.push({
                x: pos.x,
                y: pos.y,
                size: size,
                name: type.name,
                color: type.color,
                accent: type.accent,
                hasRings: type.hasRings,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                pulsePhase: Math.random() * Math.PI * 2,
                isPickup: false,
                isDelivery: false
            });
        });
    }

    generateMission() {
        if (this.planets.length < 2) return;

        const availablePlanets = [...this.planets];
        const pickupIndex = Math.floor(Math.random() * availablePlanets.length);
        const pickupPlanet = availablePlanets[pickupIndex];
        availablePlanets.splice(pickupIndex, 1);
        const deliveryPlanet = availablePlanets[Math.floor(Math.random() * availablePlanets.length)];

        this.planets.forEach(p => {
            p.isPickup = false;
            p.isDelivery = false;
        });

        pickupPlanet.isPickup = true;
        deliveryPlanet.isDelivery = true;

        const baseReward = 200 + Math.floor(Math.random() * 300);
        const timeLimit = 25 + Math.floor(Math.random() * 15);

        this.currentMission = {
            pickupPlanet: pickupPlanet,
            deliveryPlanet: deliveryPlanet,
            reward: baseReward,
            timeLimit: timeLimit,
            timeRemaining: timeLimit,
            phase: 'pickup',
            distance: Math.hypot(deliveryPlanet.x - pickupPlanet.x, deliveryPlanet.y - pickupPlanet.y)
        };

        this.missionComplete = false;
        this.player.hasPackage = false;
        this.updateMissionUI();
    }

    createUI() {
        const hud = document.createElement('div');
        hud.className = 'hud';
        hud.innerHTML = `
            <div style="font-size: 20px; margin-bottom: 8px;">📦 分数: <span id="score">0</span></div>
            <div style="font-size: 20px; margin-bottom: 8px;">🚀 配送: <span id="deliveries">0</span></div>
            <div style="font-size: 16px; color: #4ade80; margin-bottom: 8px;">📋 完成任务: <span id="missions">0</span></div>
            <div style="font-size: 12px; color: #888;">⌨️ WASD / 方向键 移动</div>
            <div style="font-size: 11px; color: #666; margin-top: 5px;">💾 按 P 键快速保存</div>
        `;

        const missionPanel = document.createElement('div');
        missionPanel.id = 'mission-panel';
        missionPanel.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(13, 27, 42, 0.9);
            padding: 15px 20px;
            border-radius: 10px;
            border: 2px solid #457b9d;
            min-width: 220px;
            color: #fff;
        `;
        missionPanel.innerHTML = `
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #90e0ef;">🛸 快递任务</div>
            <div id="mission-content">
                <div style="color: #fbbf24; margin-bottom: 5px;">� 取货: <span id="pickup-name">加载中...</span></div>
                <div style="color: #a7f3d0; margin-bottom: 5px;">📍 送货: <span id="delivery-name">加载中...</span></div>
                <div style="color: #fca5a5; margin-bottom: 5px;">⏱️ 时限: <span id="mission-time">0</span>秒</div>
                <div style="color: #fcd34d;">💰 奖励: <span id="mission-reward">0</span>分</div>
            </div>
            <div id="mission-status" style="margin-top: 10px; font-weight: bold; color: #4ade80;">
                状态: 前往取货点
            </div>
        `;

        const controlsHint = document.createElement('div');
        controlsHint.id = 'controls-hint';
        controlsHint.style.cssText = `
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.7);
            color: #fff;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 16px;
            text-align: center;
            border: 2px solid #457b9d;
        `;
        controlsHint.innerHTML = `
            <div style="margin-bottom: 5px;">🎮 操作说明</div>
            <div>WASD / 方向键 移动 | 靠近闪烁星球完成取/送货</div>
        `;

        const comboDisplay = document.createElement('div');
        comboDisplay.id = 'combo-display';
        comboDisplay.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 48px;
            font-weight: bold;
            color: #ffd700;
            text-shadow: 0 0 20px #ff6b6b;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
        `;

        const backBtn = document.createElement('button');
        backBtn.className = 'back-button';
        backBtn.textContent = '返回菜单';
        backBtn.onclick = () => {
            this.quickSave();
            setTimeout(() => {
                this.game.loadScene('menu');
            }, 500);
        };

        const endBtn = document.createElement('button');
        endBtn.style.cssText = `
            position: absolute;
            top: 70px;
            right: 20px;
            padding: 10px 20px;
            font-size: 16px;
            color: #ffd700;
            background: rgba(13, 27, 42, 0.9);
            border: 2px solid #ffd700;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        endBtn.textContent = '🏆 结束并提交分数';
        endBtn.onclick = () => {
            this.showNameInput();
        };

        this.uiLayer.appendChild(hud);
        this.uiLayer.appendChild(missionPanel);
        this.uiLayer.appendChild(controlsHint);
        this.uiLayer.appendChild(comboDisplay);
        this.uiLayer.appendChild(backBtn);
        this.uiLayer.appendChild(endBtn);
    }

    showNameInput() {
        const overlay = document.createElement('div');
        overlay.id = 'name-input-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const panel = document.createElement('div');
        panel.style.cssText = `
            background: rgba(13, 27, 42, 0.95);
            padding: 40px;
            border-radius: 15px;
            border: 3px solid #457b9d;
            text-align: center;
            min-width: 400px;
        `;

        const title = document.createElement('h2');
        title.style.cssText = 'color: #ffd700; margin-bottom: 20px; font-size: 28px;';
        title.textContent = '🏆 提交你的分数';

        const stats = document.createElement('div');
        stats.style.cssText = 'color: #e0e1dd; margin-bottom: 25px; font-size: 18px;';
        stats.innerHTML = `
            <p>📦 最终分数: <span style="color: #4ade80;">${this.score.toLocaleString()}</span></p>
            <p>🚀 完成配送: <span style="color: #60a5fa;">${this.deliveries}</span></p>
            <p>🌍 完成任务: <span style="color: #f472b6;">${this.totalMissions}</span></p>
        `;

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '输入你的名字 (最多12字)';
        input.maxLength = 12;
        input.style.cssText = `
            width: 100%;
            padding: 12px;
            margin-bottom: 20px;
            font-size: 18px;
            background: rgba(30, 58, 95, 0.8);
            border: 2px solid #457b9d;
            border-radius: 8px;
            color: #fff;
            text-align: center;
        `;
        input.value = '快递员' + Math.floor(Math.random() * 1000);

        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'display: flex; gap: 15px; justify-content: center;';

        const submitBtn = document.createElement('button');
        submitBtn.textContent = '提交分数';
        submitBtn.style.cssText = `
            padding: 12px 30px;
            font-size: 18px;
            font-weight: bold;
            color: #fff;
            background: linear-gradient(135deg, #4ade80, #22c55e);
            border: none;
            border-radius: 8px;
            cursor: pointer;
        `;
        submitBtn.onclick = () => {
            const name = input.value.trim() || '匿名快递员';
            storageManager.addToLeaderboard(name, this.score, this.deliveries, this.totalMissions);
            storageManager.deleteSave();
            this.game.loadScene('menu');
        };

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '继续游戏';
        cancelBtn.style.cssText = `
            padding: 12px 30px;
            font-size: 18px;
            font-weight: bold;
            color: #fff;
            background: linear-gradient(135deg, #6b7280, #4b5563);
            border: none;
            border-radius: 8px;
            cursor: pointer;
        `;
        cancelBtn.onclick = () => overlay.remove();

        btnContainer.appendChild(submitBtn);
        btnContainer.appendChild(cancelBtn);
        panel.appendChild(title);
        panel.appendChild(stats);
        panel.appendChild(input);
        panel.appendChild(btnContainer);
        overlay.appendChild(panel);
        this.uiLayer.appendChild(overlay);
        input.focus();
    }

    updateMissionUI() {
        const pickupName = document.getElementById('pickup-name');
        const deliveryName = document.getElementById('delivery-name');
        const missionTime = document.getElementById('mission-time');
        const missionReward = document.getElementById('mission-reward');
        const missionStatus = document.getElementById('mission-status');
        const missionsEl = document.getElementById('missions');

        if (this.currentMission) {
            if (pickupName) pickupName.textContent = this.currentMission.pickupPlanet.name;
            if (deliveryName) deliveryName.textContent = this.currentMission.deliveryPlanet.name;
            if (missionTime) missionTime.textContent = Math.ceil(this.currentMission.timeRemaining);
            if (missionReward) missionReward.textContent = this.currentMission.reward;
            
            if (missionStatus) {
                if (this.currentMission.phase === 'pickup') {
                    missionStatus.textContent = '🚀 状态: 前往取货点';
                    missionStatus.style.color = '#fbbf24';
                } else if (this.currentMission.phase === 'delivery') {
                    missionStatus.textContent = '📦 状态: 携带包裹送货';
                    missionStatus.style.color = '#4ade80';
                }
            }
        }
        if (missionsEl) missionsEl.textContent = this.totalMissions;
    }

    spawnParticles(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const speed = 100 + Math.random() * 150;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                maxLife: 1,
                size: 4 + Math.random() * 4,
                color: color
            });
        }
    }

    handleInput(input) {
        if (input.type === 'keydown') {
            const key = input.key.toLowerCase();
            
            if (key === 'p' && !this.saveCooldown) {
                this.quickSave();
                this.saveCooldown = true;
                setTimeout(() => this.saveCooldown = false, 1000);
            }
            
            this.keys[key] = true;
            if (input.key.startsWith('Arrow')) {
                this.keys[input.key] = true;
            }
        } else if (input.type === 'keyup') {
            const key = input.key.toLowerCase();
            this.keys[key] = false;
            if (input.key.startsWith('Arrow')) {
                this.keys[input.key] = false;
            }
        }
    }

    update(deltaTime) {
        this.stars.forEach(star => {
            star.x -= star.speed * deltaTime * 30;
            star.twinkle += deltaTime * 2;
            if (star.x < 0) {
                star.x = this.canvas.width;
                star.y = Math.random() * this.canvas.height;
            }
        });

        this.planets.forEach(planet => {
            planet.rotation += planet.rotationSpeed * deltaTime;
            planet.pulsePhase += deltaTime * 1.5;
        });

        const acc = this.player.acceleration;
        const maxSpeed = this.player.maxSpeed;
        const friction = this.player.friction;

        let inputX = 0, inputY = 0;
        if (this.keys['w'] || this.keys['arrowup']) inputY = -1;
        if (this.keys['s'] || this.keys['arrowdown']) inputY = 1;
        if (this.keys['a'] || this.keys['arrowleft']) inputX = -1;
        if (this.keys['d'] || this.keys['arrowright']) inputX = 1;

        if (inputX !== 0) {
            this.player.vx += inputX * acc * deltaTime;
        } else {
            const frictionForce = Math.sign(this.player.vx) * friction * deltaTime;
            if (Math.abs(frictionForce) > Math.abs(this.player.vx)) {
                this.player.vx = 0;
            } else {
                this.player.vx -= frictionForce;
            }
        }

        if (inputY !== 0) {
            this.player.vy += inputY * acc * deltaTime;
        } else {
            const frictionForce = Math.sign(this.player.vy) * friction * deltaTime;
            if (Math.abs(frictionForce) > Math.abs(this.player.vy)) {
                this.player.vy = 0;
            } else {
                this.player.vy -= frictionForce;
            }
        }

        const speed = Math.sqrt(this.player.vx * this.player.vx + this.player.vy * this.player.vy);
        if (speed > maxSpeed) {
            this.player.vx = (this.player.vx / speed) * maxSpeed;
            this.player.vy = (this.player.vy / speed) * maxSpeed;
        }

        this.player.targetTilt = -inputY * 0.3 - inputX * 0.2;
        this.player.tilt += (this.player.targetTilt - this.player.tilt) * 8 * deltaTime;

        this.player.x += this.player.vx * deltaTime;
        this.player.y += this.player.vy * deltaTime;

        this.player.x = Math.max(40, Math.min(this.canvas.width - 40, this.player.x));
        this.player.y = Math.max(40, Math.min(this.canvas.height - 40, this.player.y));

        if (this.currentMission && !this.missionComplete) {
            this.currentMission.timeRemaining -= deltaTime;

            if (this.currentMission.timeRemaining <= 0) {
                this.showMissionFailed();
                this.generateMission();
            } else {
                this.updateMissionUI();
            }

            if (this.currentMission.phase === 'pickup') {
                const pickupPlanet = this.currentMission.pickupPlanet;
                const dist = Math.hypot(this.player.x - pickupPlanet.x, this.player.y - pickupPlanet.y);
                if (dist < pickupPlanet.size + 40) {
                    this.currentMission.phase = 'delivery';
                    this.player.hasPackage = true;
                    this.spawnParticles(pickupPlanet.x, pickupPlanet.y, '#fbbf24', 20);
                    this.showPickupEffect();
                    this.updateMissionUI();
                }
            } else if (this.currentMission.phase === 'delivery') {
                const deliveryPlanet = this.currentMission.deliveryPlanet;
                const dist = Math.hypot(this.player.x - deliveryPlanet.x, this.player.y - deliveryPlanet.y);
                if (dist < deliveryPlanet.size + 40) {
                    this.missionComplete = true;
                    this.player.hasPackage = false;
                    this.totalMissions++;
                    
                    const timeBonus = Math.floor(this.currentMission.timeRemaining * 10);
                    const totalReward = this.currentMission.reward + timeBonus;
                    this.score += totalReward;
                    this.deliveries++;
                    
                    this.spawnParticles(deliveryPlanet.x, deliveryPlanet.y, '#4ade80', 30);
                    this.showMissionComplete(totalReward);
                    this.updateUI();
                    
                    setTimeout(() => {
                        this.generateMission();
                    }, 2000);
                }
            }
        }

        this.particles.forEach(p => {
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.life -= deltaTime * 1.5;
        });
        this.particles = this.particles.filter(p => p.life > 0);

        this.controlsTimer -= deltaTime;
        if (this.controlsTimer <= 0 && this.showControls) {
            this.showControls = false;
            const hint = document.getElementById('controls-hint');
            if (hint) {
                hint.style.transition = 'opacity 0.5s';
                hint.style.opacity = '0';
                setTimeout(() => hint.remove(), 500);
            }
        }
    }

    quickSave() {
        const success = storageManager.saveGame({
            score: this.score,
            deliveries: this.deliveries,
            missions: this.totalMissions,
            playerX: this.player.x,
            playerY: this.player.y
        });

        if (success) {
            this.showSaveNotification('💾 游戏已保存!');
        }
    }

    loadSaveData() {
        const saveData = storageManager.loadGame();
        if (saveData) {
            this.score = saveData.score || 0;
            this.deliveries = saveData.deliveries || 0;
            this.totalMissions = saveData.missions || 0;
            this.player.x = saveData.playerX || 200;
            this.player.y = saveData.playerY || 360;
            this.updateUI();
            return true;
        }
        return false;
    }

    showSaveNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(13, 27, 42, 0.95);
            color: #4ade80;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 20px;
            font-weight: bold;
            border: 2px solid #4ade80;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;
        notification.textContent = message;
        this.uiLayer.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 1500);
    }

    showPickupEffect() {
        const display = document.getElementById('combo-display');
        if (display) {
            display.textContent = '📦 包裹已拾取!';
            display.style.opacity = '1';
            display.style.color = '#fbbf24';
            setTimeout(() => {
                display.style.opacity = '0';
            }, 1500);
        }
    }

    showMissionComplete(reward) {
        const display = document.getElementById('combo-display');
        if (display) {
            display.innerHTML = `✅ 配送成功!<br><span style="font-size: 32px;">+${reward}分</span>`;
            display.style.opacity = '1';
            display.style.color = '#4ade80';
            setTimeout(() => {
                display.style.opacity = '0';
            }, 2000);
        }
    }

    showMissionFailed() {
        const display = document.getElementById('combo-display');
        if (display) {
            display.textContent = '❌ 超时! 任务失败';
            display.style.opacity = '1';
            display.style.color = '#f87171';
            setTimeout(() => {
                display.style.opacity = '0';
            }, 1500);
        }
    }

    showComboEffect(combo, points) {
        const display = document.getElementById('combo-display');
        if (display) {
            display.textContent = `🔥 x${combo} 连击! +${points}`;
            display.style.opacity = '1';
            display.style.transform = 'translate(-50%, -50%) scale(1.2)';
            setTimeout(() => {
                display.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 100);
            setTimeout(() => {
                display.style.opacity = '0';
            }, 800);
        }
    }

    checkCollision(a, b) {
        const margin = 15;
        return a.x - (a.width/2 + margin) < b.x + b.width/2 &&
               a.x + (a.width/2 + margin) > b.x - b.width/2 &&
               a.y - (a.height/2 + margin) < b.y + b.height/2 &&
               a.y + (a.height/2 + margin) > b.y - b.height/2;
    }

    updateUI() {
        const scoreEl = document.getElementById('score');
        const deliveriesEl = document.getElementById('deliveries');
        const comboEl = document.getElementById('combo');
        if (scoreEl) scoreEl.textContent = this.score.toLocaleString();
        if (deliveriesEl) deliveriesEl.textContent = this.deliveries;
        if (comboEl) comboEl.textContent = `x${this.combo}`;
    }

    render() {
        this.drawNebula();
        this.drawStars();
        this.drawPlanets();
        this.drawPlayer();
        this.drawParticles();
        this.drawInputIndicator();
        this.drawMissionLine();
    }

    drawMissionLine() {
        if (this.currentMission) {
            const { pickupPlanet, deliveryPlanet, phase } = this.currentMission;
            
            this.ctx.setLineDash([10, 10]);
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.beginPath();
            this.ctx.moveTo(pickupPlanet.x, pickupPlanet.y);
            this.ctx.lineTo(deliveryPlanet.x, deliveryPlanet.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }

    drawInputIndicator() {
        const cx = this.canvas.width - 80;
        const cy = this.canvas.height - 80;
        const size = 20;
        const gap = 5;
        
        this.ctx.globalAlpha = 0.5;
        
        const up = this.keys['w'] || this.keys['arrowup'];
        const down = this.keys['s'] || this.keys['arrowdown'];
        const left = this.keys['a'] || this.keys['arrowleft'];
        const right = this.keys['d'] || this.keys['arrowright'];
        
        this.ctx.fillStyle = up ? '#4ade80' : '#374151';
        this.ctx.fillRect(cx - size/2, cy - size - gap, size, size);
        
        this.ctx.fillStyle = down ? '#4ade80' : '#374151';
        this.ctx.fillRect(cx - size/2, cy + gap, size, size);
        
        this.ctx.fillStyle = left ? '#4ade80' : '#374151';
        this.ctx.fillRect(cx - size - gap, cy - size/2, size, size);
        
        this.ctx.fillStyle = right ? '#4ade80' : '#374151';
        this.ctx.fillRect(cx + gap, cy - size/2, size, size);
        
        this.ctx.globalAlpha = 1;
    }

    drawNebula() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, 500
        );
        gradient.addColorStop(0, 'rgba(30, 60, 90, 0.3)');
        gradient.addColorStop(0.5, 'rgba(20, 40, 70, 0.2)');
        gradient.addColorStop(1, 'rgba(10, 20, 40, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawStars() {
        this.stars.forEach(star => {
            const alpha = 0.4 + Math.sin(star.twinkle) * 0.2;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawPlanets() {
        this.planets.forEach(planet => {
            const pulse = 1 + Math.sin(planet.pulsePhase) * 0.05;
            const size = planet.size * pulse;

            if (planet.isPickup || planet.isDelivery) {
                const glowSize = size + 25 + Math.sin(planet.pulsePhase * 2) * 10;
                const glowColor = planet.isPickup ? 'rgba(251, 191, 36, 0.3)' : 'rgba(74, 222, 128, 0.3)';
                const glow = this.ctx.createRadialGradient(planet.x, planet.y, 0, planet.x, planet.y, glowSize);
                glow.addColorStop(0, glowColor);
                glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
                this.ctx.fillStyle = glow;
                this.ctx.beginPath();
                this.ctx.arc(planet.x, planet.y, glowSize, 0, Math.PI * 2);
                this.ctx.fill();
            }

            const gradient = this.ctx.createRadialGradient(
                planet.x - size * 0.3, planet.y - size * 0.3, 0,
                planet.x, planet.y, size
            );
            gradient.addColorStop(0, planet.color);
            gradient.addColorStop(0.7, planet.accent);
            gradient.addColorStop(1, '#1a1a2e');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(planet.x, planet.y, size, 0, Math.PI * 2);
            this.ctx.fill();

            if (planet.hasRings) {
                this.ctx.save();
                this.ctx.translate(planet.x, planet.y);
                this.ctx.rotate(planet.rotation);
                this.ctx.scale(1, 0.3);
                this.ctx.strokeStyle = 'rgba(180, 180, 200, 0.6)';
                this.ctx.lineWidth = 8;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, size + 20, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.strokeStyle = 'rgba(150, 150, 170, 0.4)';
                this.ctx.lineWidth = 5;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, size + 35, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.restore();
            }

            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(planet.name, planet.x, planet.y - size - 20);

            if (planet.isPickup) {
                this.ctx.fillStyle = '#fbbf24';
                this.ctx.font = '20px Arial';
                this.ctx.fillText('📦', planet.x, planet.y + size + 25);
            } else if (planet.isDelivery) {
                this.ctx.fillStyle = '#4ade80';
                this.ctx.font = '20px Arial';
                this.ctx.fillText('📍', planet.x, planet.y + size + 25);
            }
        });
    }

    drawPlayer() {
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        this.ctx.rotate(this.player.tilt);

        const speed = Math.sqrt(this.player.vx * this.player.vx + this.player.vy * this.player.vy);
        const isMoving = speed > 10;

        if (isMoving) {
            const flameLength = 15 + Math.random() * 15;
            const gradient = this.ctx.createLinearGradient(-10, 0, -10 - flameLength, 0);
            gradient.addColorStop(0, '#ff6b6b');
            gradient.addColorStop(0.5, '#ffd93d');
            gradient.addColorStop(1, 'rgba(255, 107, 107, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.moveTo(-10, -8);
            this.ctx.lineTo(-10 - flameLength, 0);
            this.ctx.lineTo(-10, 8);
            this.ctx.closePath();
            this.ctx.fill();

            const flameLength2 = 10 + Math.random() * 10;
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.moveTo(-10, -4);
            this.ctx.lineTo(-10 - flameLength2, 0);
            this.ctx.lineTo(-10, 4);
            this.ctx.closePath();
            this.ctx.fill();
        }

        this.ctx.fillStyle = '#e63946';
        this.ctx.beginPath();
        this.ctx.moveTo(35, 0);
        this.ctx.lineTo(-15, -22);
        this.ctx.lineTo(-5, 0);
        this.ctx.lineTo(-15, 22);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = '#c1121f';
        this.ctx.beginPath();
        this.ctx.moveTo(20, 0);
        this.ctx.lineTo(-15, -22);
        this.ctx.lineTo(-5, 0);
        this.ctx.closePath();
        this.ctx.fill();

        if (this.player.hasPackage) {
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.fillRect(25, -12, 18, 18);
            this.ctx.strokeStyle = '#f59e0b';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(25, -12, 18, 18);
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText('📦', 34, -2);
        }

        this.ctx.fillStyle = '#457b9d';
        this.ctx.beginPath();
        this.ctx.moveTo(25, 0);
        this.ctx.lineTo(0, -14);
        this.ctx.lineTo(0, 14);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = '#a8dadc';
        this.ctx.beginPath();
        this.ctx.ellipse(15, 0, 8, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawPackages() {
        this.packages.forEach(pkg => {
            if (!pkg.collected) {
                this.ctx.save();
                this.ctx.translate(pkg.x, pkg.y);
                
                const pulse = 1 + Math.sin(pkg.pulse) * 0.05;
                this.ctx.scale(pulse, pulse);

                if (pkg.type === 'precious') {
                    const glow = this.ctx.createRadialGradient(0, 0, 0, 0, 0, pkg.width);
                    glow.addColorStop(0, 'rgba(241, 196, 15, 0.4)');
                    glow.addColorStop(1, 'rgba(241, 196, 15, 0)');
                    this.ctx.fillStyle = glow;
                    this.ctx.fillRect(-pkg.width, -pkg.height, pkg.width * 2, pkg.height * 2);
                } else if (pkg.type === 'rare') {
                    const glow = this.ctx.createRadialGradient(0, 0, 0, 0, 0, pkg.width * 0.8);
                    glow.addColorStop(0, 'rgba(155, 89, 182, 0.3)');
                    glow.addColorStop(1, 'rgba(155, 89, 182, 0)');
                    this.ctx.fillStyle = glow;
                    this.ctx.fillRect(-pkg.width, -pkg.height, pkg.width * 2, pkg.height * 2);
                }

                this.ctx.fillStyle = pkg.color;
                this.ctx.fillRect(-pkg.width/2, -pkg.height/2, pkg.width, pkg.height);

                this.ctx.strokeStyle = pkg.ribbon;
                this.ctx.lineWidth = 4;
                this.ctx.beginPath();
                this.ctx.moveTo(0, -pkg.height/2);
                this.ctx.lineTo(0, pkg.height/2);
                this.ctx.moveTo(-pkg.width/2, 0);
                this.ctx.lineTo(pkg.width/2, 0);
                this.ctx.stroke();

                this.ctx.fillStyle = pkg.ribbon;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 6, 0, Math.PI * 2);
                this.ctx.fill();

                const icons = { normal: '📦', rare: '💎', precious: '⭐' };
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(icons[pkg.type], 0, 0);

                this.ctx.restore();
            }
        });
    }

    drawParticles() {
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = alpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }
}
