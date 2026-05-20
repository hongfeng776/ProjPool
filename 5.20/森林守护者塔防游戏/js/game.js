class ForestDefenderGame {
    constructor() {
        this.currentScreen = 'main-menu';
        this.levels = [
            { id: 1, name: '森林入口', unlocked: true, stars: 0, waves: 5, lives: 20 },
            { id: 2, name: '林间小道', unlocked: false, stars: 0, waves: 7, lives: 18 },
            { id: 3, name: '深林湖畔', unlocked: false, stars: 0, waves: 8, lives: 16 },
            { id: 4, name: '古树要塞', unlocked: false, stars: 0, waves: 10, lives: 15 },
            { id: 5, name: '森林之心', unlocked: false, stars: 0, waves: 12, lives: 12 },
            { id: 6, name: '最终守护', unlocked: false, stars: 0, waves: 15, lives: 10 }
        ];
        this.towerTypes = {
            arrow: { 
                name: '箭塔', cost: 50, damage: 15, range: 130, fireRate: 700, 
                color: '#8B4513', projectileColor: '#D2691E', projectileSpeed: 500,
                canCrit: true, critChance: 0.2, critMultiplier: 2,
                upgradeCost: [40, 60, 80], damageUpgrade: [8, 12, 15], rangeUpgrade: [10, 15, 20]
            },
            cannon: { 
                name: '炮塔', cost: 100, damage: 40, range: 110, fireRate: 1400, 
                color: '#696969', projectileColor: '#FF4500', projectileSpeed: 350,
                splash: true, splashRadius: 50, splashDamage: 0.5,
                upgradeCost: [70, 100, 130], damageUpgrade: [15, 25, 35], rangeUpgrade: [8, 12, 15]
            },
            magic: { 
                name: '魔法塔', cost: 150, damage: 25, range: 160, fireRate: 1000, 
                color: '#9932CC', projectileColor: '#DA70D6', projectileSpeed: 450,
                slow: true, slowAmount: 0.5, slowDuration: 2000,
                upgradeCost: [90, 130, 170], damageUpgrade: [12, 18, 25], rangeUpgrade: [12, 18, 25]
            }
        };
        this.enemyTypes = {
            normal: { name: '哥布林', hp: 60, speed: 40, reward: 12, color: '#32CD32', size: 15, armor: 0 },
            fast: { name: '野狼', hp: 40, speed: 75, reward: 18, color: '#808080', size: 12, armor: 0 },
            tank: { name: '巨魔', hp: 200, speed: 28, reward: 35, color: '#8B0000', size: 22, armor: 5 },
            boss: { name: '树人首领', hp: 500, speed: 20, reward: 100, color: '#2F4F4F', size: 30, armor: 10 }
        };
        this.gameState = {
            lives: 20,
            gold: 100,
            wave: 1,
            isPaused: false,
            currentLevel: null,
            towers: [],
            enemies: [],
            projectiles: [],
            damageNumbers: [],
            selectedTowerType: null,
            selectedTower: null,
            path: [],
            buildableAreas: [],
            waveInProgress: false,
            enemiesSpawned: 0,
            enemiesPerWave: 0,
            totalKills: 0,
            totalDamageDealt: 0,
            totalGoldEarned: 0,
            gameStartTime: 0,
            towersBuilt: 0,
            towersUpgraded: 0
        };
        this.canvas = null;
        this.ctx = null;
        this.lastTime = 0;
        this.animationId = null;
        this.messageTimeout = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderLevelButtons();
    }

    bindEvents() {
        document.getElementById('start-btn').addEventListener('click', () => {
            this.showScreen('level-select');
        });

        document.getElementById('how-to-play-btn').addEventListener('click', () => {
            this.showScreen('how-to-play');
        });

        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showScreen('settings');
        });

        document.getElementById('back-btn').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        document.getElementById('back-from-info-btn').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        document.getElementById('back-from-settings-btn').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('back-from-game-btn').addEventListener('click', () => {
            this.showExitConfirm();
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;

        if (screenId === 'level-select') {
            this.renderLevelButtons();
        }
    }

    renderLevelButtons() {
        const levelsGrid = document.getElementById('levels-grid');
        levelsGrid.innerHTML = '';

        this.levels.forEach(level => {
            const levelBtn = document.createElement('button');
            levelBtn.className = `level-btn ${level.unlocked ? '' : 'locked'}`;
            levelBtn.innerHTML = `
                <span style="font-size: 24px; font-weight: bold;">${level.id}</span>
                <span style="font-size: 12px; color: #ddd;">${level.name}</span>
                <span class="level-stars">${this.getStarsDisplay(level.stars)}</span>
                <span style="font-size: 10px; color: #aaa;">${level.waves}波 | ❤️${level.lives}</span>
            `;
            
            if (level.unlocked) {
                levelBtn.addEventListener('click', () => {
                    this.startLevel(level);
                });
            }
            
            levelsGrid.appendChild(levelBtn);
        });
    }

    getStarsDisplay(stars) {
        let display = '';
        for (let i = 0; i < 3; i++) {
            display += i < stars ? '⭐' : '☆';
        }
        return display;
    }

    startLevel(level) {
        this.gameState = {
            lives: level.lives,
            gold: 100 + (level.id - 1) * 20,
            wave: 1,
            isPaused: false,
            currentLevel: level,
            towers: [],
            enemies: [],
            projectiles: [],
            damageNumbers: [],
            selectedTowerType: null,
            selectedTower: null,
            path: [],
            buildableAreas: [],
            waveInProgress: false,
            enemiesSpawned: 0,
            enemiesPerWave: 0,
            totalKills: 0,
            totalDamageDealt: 0,
            totalGoldEarned: 0,
            gameStartTime: Date.now(),
            towersBuilt: 0,
            towersUpgraded: 0
        };
        this.updateGameUI();
        this.showScreen('game-screen');
        this.initGameCanvas();
        this.createTowerUI();
        this.createMessageUI();
        this.generatePath();
        this.generateBuildableAreas();
        this.startGameLoop();
        this.showMessage(`关卡 ${level.id}: ${level.name} - 准备战斗！`, 2000);
        setTimeout(() => this.startWave(), 2500);
    }

    initGameCanvas() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }

    createTowerUI() {
        const existingUI = document.getElementById('tower-select');
        if (existingUI) existingUI.remove();

        const towerUI = document.createElement('div');
        towerUI.id = 'tower-select';
        towerUI.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 15px;
            background: rgba(0,0,0,0.85);
            padding: 15px 20px;
            border-radius: 15px;
            z-index: 100;
            border: 2px solid rgba(255,215,0,0.3);
        `;

        Object.entries(this.towerTypes).forEach(([type, tower]) => {
            const btn = document.createElement('button');
            btn.className = 'tower-btn';
            btn.dataset.type = type;
            btn.innerHTML = `
                <div style="width:45px;height:45px;background:${tower.color};border-radius:10px;margin:0 auto 5px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;box-shadow:0 3px 6px rgba(0,0,0,0.3);">${tower.name.charAt(0)}</div>
                <div style="font-size:14px;font-weight:bold;">${tower.name}</div>
                <div style="color:#FFD700;font-size:12px;">💰${tower.cost}</div>
                <div style="color:#FF6B6B;font-size:10px;">⚔️${tower.damage}</div>
            `;
            btn.style.cssText = `
                background: linear-gradient(180deg, #5a5a5a 0%, #3a3a3a 100%);
                color: white;
                border: 3px solid transparent;
                border-radius: 12px;
                padding: 10px 15px;
                cursor: pointer;
                min-width: 90px;
                transition: all 0.2s;
            `;
            btn.addEventListener('click', () => this.selectTowerType(type, btn));
            towerUI.appendChild(btn);
        });

        document.getElementById('game-screen').appendChild(towerUI);
    }

    createTowerInfoUI() {
        const existingUI = document.getElementById('tower-info');
        if (existingUI) existingUI.remove();

        if (!this.gameState.selectedTower) return;

        const tower = this.gameState.selectedTower;
        const towerData = this.towerTypes[tower.type];
        const canUpgrade = tower.level < 4;
        const upgradeCost = canUpgrade ? towerData.upgradeCost[tower.level - 1] : 0;
        const sellValue = Math.floor(towerData.cost * 0.6 + tower.level * 15);

        const towerInfoUI = document.createElement('div');
        towerInfoUI.id = 'tower-info';
        towerInfoUI.style.cssText = `
            position: absolute;
            right: 20px;
            top: 80px;
            background: rgba(0,0,0,0.9);
            padding: 20px;
            border-radius: 15px;
            z-index: 100;
            min-width: 200px;
            border: 2px solid ${tower.color};
        `;

        towerInfoUI.innerHTML = `
            <div style="color: white; font-size: 18px; font-weight: bold; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span>${towerData.name} Lv.${tower.level}</span>
                <button id="close-tower-info" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">×</button>
            </div>
            <div style="color: #ddd; font-size: 14px; line-height: 1.8;">
                <div>⚔️ 伤害: <span style="color: #FF6B6B;">${tower.damage}</span></div>
                <div>📏 射程: <span style="color: #4CAF50;">${tower.range}</span></div>
                <div>⏱️ 攻速: <span style="color: #2196F3;">${(1000/tower.fireRate).toFixed(1)}/秒</span></div>
                ${tower.canCrit ? '<div>💥 暴击: ' + Math.floor(tower.critChance*100) + '%</div>' : ''}
                ${tower.splash ? '<div>💫 溅射: 是</div>' : ''}
                ${tower.slow ? '<div>❄️ 减速: 是</div>' : ''}
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button id="upgrade-tower-btn" style="
                    flex: 1;
                    padding: 10px;
                    background: ${canUpgrade && this.gameState.gold >= upgradeCost ? 'linear-gradient(180deg, #4CAF50, #388E3C)' : '#666'};
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: ${canUpgrade && this.gameState.gold >= upgradeCost ? 'pointer' : 'not-allowed'};
                    font-weight: bold;
                " ${!canUpgrade || this.gameState.gold < upgradeCost ? 'disabled' : ''}>
                    ${canUpgrade ? `升级 💰${upgradeCost}` : '已满级'}
                </button>
                <button id="sell-tower-btn" style="
                    flex: 1;
                    padding: 10px;
                    background: linear-gradient(180deg, #F44336, #D32F2F);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    出售 💰${sellValue}
                </button>
            </div>
        `;

        document.getElementById('game-screen').appendChild(towerInfoUI);

        document.getElementById('close-tower-info').addEventListener('click', () => {
            this.gameState.selectedTower = null;
            towerInfoUI.remove();
        });

        if (canUpgrade && this.gameState.gold >= upgradeCost) {
            document.getElementById('upgrade-tower-btn').addEventListener('click', () => {
                this.upgradeTower(tower);
            });
        }

        document.getElementById('sell-tower-btn').addEventListener('click', () => {
            this.sellTower(tower);
        });
    }

    createMessageUI() {
        const existingMsg = document.getElementById('game-message');
        if (existingMsg) existingMsg.remove();

        const msgUI = document.createElement('div');
        msgUI.id = 'game-message';
        msgUI.style.cssText = `
            position: absolute;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.85);
            color: white;
            padding: 12px 30px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: bold;
            z-index: 100;
            display: none;
            transition: opacity 0.3s;
            border: 2px solid rgba(255,215,0,0.5);
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        `;
        document.getElementById('game-screen').appendChild(msgUI);
    }

    showMessage(text, duration = 2000) {
        const msgUI = document.getElementById('game-message');
        if (msgUI) {
            msgUI.textContent = text;
            msgUI.style.display = 'block';
            msgUI.style.opacity = '1';
            
            if (this.messageTimeout) {
                clearTimeout(this.messageTimeout);
            }
            
            this.messageTimeout = setTimeout(() => {
                msgUI.style.opacity = '0';
                setTimeout(() => {
                    msgUI.style.display = 'none';
                }, 300);
            }, duration);
        }
    }

    selectTowerType(type, btn) {
        document.querySelectorAll('.tower-btn').forEach(b => {
            b.style.borderColor = 'transparent';
            b.style.transform = 'scale(1)';
        });

        this.gameState.selectedTower = null;
        const towerInfoUI = document.getElementById('tower-info');
        if (towerInfoUI) towerInfoUI.remove();

        if (this.gameState.selectedTowerType === type) {
            this.gameState.selectedTowerType = null;
            this.showMessage('已取消选择');
        } else {
            this.gameState.selectedTowerType = type;
            btn.style.borderColor = '#FFD700';
            btn.style.transform = 'scale(1.05)';
            const tower = this.towerTypes[type];
            this.showMessage(`已选择 ${tower.name} - 点击绿色区域建造`);
        }
    }

    generatePath() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        this.gameState.path = [
            { x: 0, y: h * 0.35 },
            { x: w * 0.25, y: h * 0.35 },
            { x: w * 0.25, y: h * 0.65 },
            { x: w * 0.75, y: h * 0.65 },
            { x: w * 0.75, y: h * 0.35 },
            { x: w * 0.5, y: h * 0.35 },
            { x: w * 0.5, y: h * 0.5 },
            { x: w, y: h * 0.5 }
        ];
    }

    generateBuildableAreas() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const gridSize = 55;
        
        this.gameState.buildableAreas = [];
        
        for (let x = gridSize; x < w - gridSize; x += gridSize) {
            for (let y = gridSize + 90; y < h - gridSize - 120; y += gridSize) {
                let onPath = false;
                for (let i = 0; i < this.gameState.path.length - 1; i++) {
                    const p1 = this.gameState.path[i];
                    const p2 = this.gameState.path[i + 1];
                    if (this.distanceToSegment(x, y, p1.x, p1.y, p2.x, p2.y) < 45) {
                        onPath = true;
                        break;
                    }
                }
                if (!onPath) {
                    this.gameState.buildableAreas.push({ x, y, size: gridSize - 5 });
                }
            }
        }
    }

    distanceToSegment(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;
        let xx, yy;
        if (param < 0) { xx = x1; yy = y1; }
        else if (param > 1) { xx = x2; yy = y2; }
        else { xx = x1 + param * C; yy = y1 + param * D; }
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        for (const tower of this.gameState.towers) {
            const dist = Math.sqrt(Math.pow(x - tower.x, 2) + Math.pow(y - tower.y, 2));
            if (dist < 30) {
                this.gameState.selectedTowerType = null;
                document.querySelectorAll('.tower-btn').forEach(b => {
                    b.style.borderColor = 'transparent';
                    b.style.transform = 'scale(1)';
                });
                this.gameState.selectedTower = tower;
                this.createTowerInfoUI();
                return;
            }
        }

        if (!this.gameState.selectedTowerType) {
            this.gameState.selectedTower = null;
            const towerInfoUI = document.getElementById('tower-info');
            if (towerInfoUI) towerInfoUI.remove();
            return;
        }

        const tower = this.towerTypes[this.gameState.selectedTowerType];
        
        if (this.gameState.gold < tower.cost) {
            this.showMessage('金币不足！继续消灭敌人获取金币');
            return;
        }

        let clickedArea = null;
        for (const area of this.gameState.buildableAreas) {
            if (Math.abs(x - area.x) < area.size / 2 && Math.abs(y - area.y) < area.size / 2) {
                clickedArea = area;
                break;
            }
        }

        if (!clickedArea) {
            this.showMessage('请在绿色可建造区域建造防御塔');
            return;
        }

        const existing = this.gameState.towers.find(t => 
            Math.abs(t.x - clickedArea.x) < 10 && Math.abs(t.y - clickedArea.y) < 10
        );
        if (existing) {
            this.showMessage('该位置已有防御塔');
            return;
        }

        this.buildTower(this.gameState.selectedTowerType, clickedArea.x, clickedArea.y);
    }

    buildTower(type, x, y) {
        const towerData = this.towerTypes[type];
        this.gameState.gold -= towerData.cost;
        this.gameState.towersBuilt++;
        this.updateGameUI();

        this.gameState.towers.push({
            type,
            x,
            y,
            ...towerData,
            lastFire: 0,
            level: 1,
            attackAnimation: 0
        });

        this.showMessage(`${towerData.name} 建造成功！`);
        
        this.gameState.selectedTowerType = null;
        document.querySelectorAll('.tower-btn').forEach(b => {
            b.style.borderColor = 'transparent';
            b.style.transform = 'scale(1)';
        });
    }

    upgradeTower(tower) {
        const towerData = this.towerTypes[tower.type];
        const upgradeCost = towerData.upgradeCost[tower.level - 1];
        
        if (this.gameState.gold < upgradeCost) {
            this.showMessage('金币不足！');
            return;
        }

        this.gameState.gold -= upgradeCost;
        this.gameState.towersUpgraded++;
        
        tower.level++;
        tower.damage += towerData.damageUpgrade[tower.level - 2];
        tower.range += towerData.rangeUpgrade[tower.level - 2];
        
        if (tower.canCrit) {
            tower.critChance = Math.min(0.4, tower.critChance + 0.05);
        }
        if (tower.slow) {
            tower.slowDuration += 300;
        }
        if (tower.splash) {
            tower.splashRadius += 10;
        }

        this.updateGameUI();
        this.showMessage(`${towerData.name} 升级到 Lv.${tower.level}！`);
        this.createTowerInfoUI();
    }

    sellTower(tower) {
        const towerData = this.towerTypes[tower.type];
        const sellValue = Math.floor(towerData.cost * 0.6 + tower.level * 15);
        
        this.gameState.gold += sellValue;
        this.updateGameUI();

        const idx = this.gameState.towers.indexOf(tower);
        if (idx > -1) {
            this.gameState.towers.splice(idx, 1);
        }

        this.gameState.selectedTower = null;
        const towerInfoUI = document.getElementById('tower-info');
        if (towerInfoUI) towerInfoUI.remove();

        this.showMessage(`出售 ${towerData.name}，获得 ${sellValue} 金币`);
    }

    startWave() {
        this.showMessage(`第 ${this.gameState.wave} 波敌人来袭！准备战斗！`);
        this.gameState.waveInProgress = true;
        this.gameState.enemiesSpawned = 0;
        this.gameState.enemiesPerWave = 5 + (this.gameState.wave - 1) * 3;
        this.spawnEnemy();
    }

    spawnEnemy() {
        if (this.gameState.enemiesSpawned >= this.gameState.enemiesPerWave) return;
        
        const types = ['normal'];
        if (this.gameState.wave >= 2) types.push('fast');
        if (this.gameState.wave >= 3) types.push('tank');
        if (this.gameState.wave >= 5 && this.gameState.enemiesSpawned === this.gameState.enemiesPerWave - 1) {
            types.length = 0;
            types.push('boss');
        }
        
        const type = types[Math.floor(Math.random() * types.length)];
        const enemyData = this.enemyTypes[type];
        
        const waveMultiplier = 1 + (this.gameState.wave - 1) * 0.18;
        
        this.gameState.enemies.push({
            type,
            x: this.gameState.path[0].x,
            y: this.gameState.path[0].y,
            hp: Math.floor(enemyData.hp * waveMultiplier),
            maxHp: Math.floor(enemyData.hp * waveMultiplier),
            speed: enemyData.speed,
            baseSpeed: enemyData.speed,
            reward: Math.floor(enemyData.reward * waveMultiplier),
            color: enemyData.color,
            size: enemyData.size,
            armor: enemyData.armor,
            pathIndex: 0,
            pathProgress: 0,
            slowedUntil: 0,
            hitAnimation: 0
        });
        
        this.gameState.enemiesSpawned++;
        
        if (this.gameState.enemiesSpawned < this.gameState.enemiesPerWave) {
            setTimeout(() => this.spawnEnemy(), type === 'boss' ? 1500 : 700);
        }
    }

    startGameLoop() {
        this.lastTime = performance.now();
        this.gameLoop();
    }

    gameLoop(currentTime = performance.now()) {
        if (this.currentScreen !== 'game-screen') return;
        
        const deltaTime = Math.min(currentTime - this.lastTime, 50);
        this.lastTime = currentTime;

        if (!this.gameState.isPaused) {
            this.update(deltaTime);
        }
        
        this.render();
        
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(deltaTime) {
        this.updateEnemies(deltaTime);
        this.updateTowers(deltaTime);
        this.updateProjectiles(deltaTime);
        this.updateDamageNumbers(deltaTime);
        this.checkWaveComplete();
        this.checkGameOver();
    }

    updateEnemies(deltaTime) {
        const now = Date.now();
        
        for (let i = this.gameState.enemies.length - 1; i >= 0; i--) {
            const enemy = this.gameState.enemies[i];
            const path = this.gameState.path;
            
            if (enemy.hitAnimation > 0) {
                enemy.hitAnimation -= deltaTime;
            }
            
            let currentSpeed = enemy.baseSpeed;
            if (enemy.slowedUntil > now) {
                currentSpeed *= 0.5;
            }
            enemy.speed = currentSpeed;
            
            if (enemy.pathIndex >= path.length - 1) {
                this.gameState.lives--;
                this.updateGameUI();
                this.gameState.enemies.splice(i, 1);
                this.showMessage(`敌人突破防线！剩余生命: ${this.gameState.lives}`);
                continue;
            }

            const current = path[enemy.pathIndex];
            const next = path[enemy.pathIndex + 1];
            const dx = next.x - current.x;
            const dy = next.y - current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const moveDistance = enemy.speed * (deltaTime / 1000);
            enemy.pathProgress += moveDistance / dist;
            
            if (enemy.pathProgress >= 1) {
                enemy.pathIndex++;
                enemy.pathProgress = enemy.pathProgress - 1;
            }
            
            const clampedProgress = Math.min(Math.max(enemy.pathProgress, 0), 1);
            enemy.x = current.x + dx * clampedProgress;
            enemy.y = current.y + dy * clampedProgress;
        }
    }

    updateTowers(deltaTime) {
        const now = Date.now();
        
        for (const tower of this.gameState.towers) {
            if (tower.attackAnimation > 0) {
                tower.attackAnimation -= deltaTime;
            }
            
            if (now - tower.lastFire < tower.fireRate) continue;

            let target = null;
            let maxProgress = -1;
            
            for (const enemy of this.gameState.enemies) {
                const dist = Math.sqrt(
                    Math.pow(enemy.x - tower.x, 2) + 
                    Math.pow(enemy.y - tower.y, 2)
                );
                if (dist < tower.range) {
                    const progress = enemy.pathIndex + enemy.pathProgress;
                    if (progress > maxProgress) {
                        maxProgress = progress;
                        target = enemy;
                    }
                }
            }

            if (target) {
                tower.lastFire = now;
                tower.attackAnimation = 200;
                
                this.gameState.projectiles.push({
                    x: tower.x,
                    y: tower.y - 25,
                    targetX: target.x,
                    targetY: target.y,
                    target,
                    damage: tower.damage,
                    speed: tower.projectileSpeed,
                    color: tower.projectileColor,
                    towerType: tower.type,
                    canCrit: tower.canCrit,
                    critChance: tower.critChance,
                    critMultiplier: tower.critMultiplier,
                    splash: tower.splash,
                    splashRadius: tower.splashRadius,
                    splashDamage: tower.splashDamage,
                    slow: tower.slow,
                    slowAmount: tower.slowAmount,
                    slowDuration: tower.slowDuration
                });
            }
        }
    }

    updateProjectiles(deltaTime) {
        for (let i = this.gameState.projectiles.length - 1; i >= 0; i--) {
            const proj = this.gameState.projectiles[i];
            
            if (proj.target && this.gameState.enemies.includes(proj.target)) {
                proj.targetX = proj.target.x;
                proj.targetY = proj.target.y;
            }
            
            const dx = proj.targetX - proj.x;
            const dy = proj.targetY - proj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 18) {
                if (proj.target && this.gameState.enemies.includes(proj.target)) {
                    let finalDamage = proj.damage;
                    let isCrit = false;
                    
                    if (proj.canCrit && Math.random() < proj.critChance) {
                        finalDamage = Math.floor(finalDamage * proj.critMultiplier);
                        isCrit = true;
                    }
                    
                    const armor = proj.target.armor || 0;
                    finalDamage = Math.max(1, finalDamage - armor);
                    
                    this.gameState.totalDamageDealt += finalDamage;
                    
                    this.dealDamage(proj.target, finalDamage, isCrit, proj.x, proj.y);
                    
                    if (proj.splash) {
                        for (const enemy of this.gameState.enemies) {
                            if (enemy !== proj.target) {
                                const splashDist = Math.sqrt(
                                    Math.pow(enemy.x - proj.targetX, 2) + 
                                    Math.pow(enemy.y - proj.targetY, 2)
                                );
                                if (splashDist < proj.splashRadius) {
                                    const splashDmg = Math.max(1, Math.floor(finalDamage * proj.splashDamage));
                                    this.dealDamage(enemy, splashDmg, false, enemy.x, enemy.y);
                                }
                            }
                        }
                    }
                    
                    if (proj.slow) {
                        proj.target.slowedUntil = Date.now() + proj.slowDuration;
                    }
                }
                
                this.gameState.projectiles.splice(i, 1);
                continue;
            }
            
            const moveDistance = proj.speed * (deltaTime / 1000);
            const ratio = Math.min(moveDistance / dist, 1);
            proj.x += dx * ratio;
            proj.y += dy * ratio;
        }
    }

    dealDamage(enemy, damage, isCrit, x, y) {
        enemy.hp -= damage;
        enemy.hitAnimation = 150;
        
        this.addDamageNumber(damage, isCrit, x, y);
        
        if (enemy.hp <= 0) {
            this.gameState.gold += enemy.reward;
            this.gameState.totalGoldEarned += enemy.reward;
            this.gameState.totalKills++;
            this.updateGameUI();
            
            const idx = this.gameState.enemies.indexOf(enemy);
            if (idx > -1) {
                this.gameState.enemies.splice(idx, 1);
            }
            
            this.addDamageNumber(`+${enemy.reward}💰`, false, x, y - 20, '#FFD700');
        }
    }

    addDamageNumber(text, isCrit, x, y, color = null) {
        this.gameState.damageNumbers.push({
            text: String(text),
            x,
            y,
            color: color || (isCrit ? '#FF0000' : '#FFFFFF'),
            isCrit,
            life: 1000,
            maxLife: 1000,
            vy: -80
        });
    }

    updateDamageNumbers(deltaTime) {
        for (let i = this.gameState.damageNumbers.length - 1; i >= 0; i--) {
            const num = this.gameState.damageNumbers[i];
            num.life -= deltaTime;
            num.y += num.vy * (deltaTime / 1000);
            
            if (num.life <= 0) {
                this.gameState.damageNumbers.splice(i, 1);
            }
        }
    }

    checkWaveComplete() {
        if (this.gameState.waveInProgress && 
            this.gameState.enemiesSpawned >= this.gameState.enemiesPerWave && 
            this.gameState.enemies.length === 0) {
            
            this.gameState.waveInProgress = false;
            
            const waveBonus = this.gameState.wave * 15;
            this.gameState.gold += waveBonus;
            this.gameState.totalGoldEarned += waveBonus;
            this.updateGameUI();
            
            if (this.gameState.wave < this.gameState.currentLevel.waves) {
                this.gameState.wave++;
                this.updateGameUI();
                this.showMessage(`第 ${this.gameState.wave - 1} 波已清除！获得 ${waveBonus} 金币奖励！`, 2500);
                setTimeout(() => this.startWave(), 3500);
            } else {
                this.levelComplete();
            }
        }
    }

    checkGameOver() {
        if (this.gameState.lives <= 0) {
            this.showGameOver();
        }
    }

    levelComplete() {
        cancelAnimationFrame(this.animationId);
        
        const stars = this.gameState.lives >= this.gameState.currentLevel.lives * 0.8 ? 3 : 
                     this.gameState.lives >= this.gameState.currentLevel.lives * 0.5 ? 2 : 1;
        this.setLevelStars(this.gameState.currentLevel.id, stars);
        this.unlockNextLevel(this.gameState.currentLevel.id);
        
        const playTime = Math.floor((Date.now() - this.gameState.gameStartTime) / 1000);
        const minutes = Math.floor(playTime / 60);
        const seconds = playTime % 60;

        this.showVictoryScreen(stars, minutes, seconds);
    }

    showVictoryScreen(stars, minutes, seconds) {
        const existingUI = document.getElementById('victory-screen');
        if (existingUI) existingUI.remove();

        const victoryUI = document.createElement('div');
        victoryUI.id = 'victory-screen';
        victoryUI.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 200;
        `;

        victoryUI.innerHTML = `
            <div style="
                background: linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%);
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                color: white;
                border: 4px solid #FFD700;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                max-width: 500px;
            ">
                <h1 style="font-size: 48px; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">🎉 胜利！🎉</h1>
                <div style="font-size: 40px; margin-bottom: 25px;">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
                <div style="font-size: 24px; margin-bottom: 20px; color: #FFD700;">
                    ${this.gameState.currentLevel.name} 完成！
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                    <div style="font-size: 16px; line-height: 2;">
                        <div>❤️ 剩余生命: <span style="color: #FF6B6B;">${this.gameState.lives}</span></div>
                        <div>💀 击杀敌人: <span style="color: #FF6B6B;">${this.gameState.totalKills}</span></div>
                        <div>⚔️ 总伤害: <span style="color: #FF6B6B;">${this.gameState.totalDamageDealt}</span></div>
                        <div>💰 总金币: <span style="color: #FFD700;">${this.gameState.totalGoldEarned}</span></div>
                        <div>🏰 建造塔数: <span style="color: #4CAF50;">${this.gameState.towersBuilt}</span></div>
                        <div>⬆️ 升级次数: <span style="color: #2196F3;">${this.gameState.towersUpgraded}</span></div>
                        <div>⏱️ 用时: <span style="color: #9C27B0;">${minutes}分${seconds}秒</span></div>
                    </div>
                </div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="next-level-btn" style="
                        padding: 15px 30px;
                        font-size: 18px;
                        background: linear-gradient(180deg, #4CAF50, #388E3C);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        cursor: pointer;
                        font-weight: bold;
                        transition: all 0.2s;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        下一关
                    </button>
                    <button id="back-to-level-select-btn" style="
                        padding: 15px 30px;
                        font-size: 18px;
                        background: linear-gradient(180deg, #2196F3, #1976D2);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        cursor: pointer;
                        font-weight: bold;
                        transition: all 0.2s;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        关卡选择
                    </button>
                </div>
            </div>
        `;

        document.getElementById('game-screen').appendChild(victoryUI);

        document.getElementById('next-level-btn').addEventListener('click', () => {
            const nextLevel = this.levels.find(l => l.id === this.gameState.currentLevel.id + 1);
            if (nextLevel && nextLevel.unlocked) {
                victoryUI.remove();
                this.startLevel(nextLevel);
            } else {
                victoryUI.remove();
                this.exitGame();
            }
        });

        document.getElementById('back-to-level-select-btn').addEventListener('click', () => {
            victoryUI.remove();
            this.exitGame();
        });
    }

    showGameOver() {
        cancelAnimationFrame(this.animationId);
        
        const playTime = Math.floor((Date.now() - this.gameState.gameStartTime) / 1000);
        const minutes = Math.floor(playTime / 60);
        const seconds = playTime % 60;

        const existingUI = document.getElementById('gameover-screen');
        if (existingUI) existingUI.remove();

        const gameoverUI = document.createElement('div');
        gameoverUI.id = 'gameover-screen';
        gameoverUI.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 200;
        `;

        gameoverUI.innerHTML = `
            <div style="
                background: linear-gradient(180deg, #C62828 0%, #8B0000 100%);
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                color: white;
                border: 4px solid #FF5722;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                max-width: 500px;
            ">
                <h1 style="font-size: 48px; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">💀 游戏结束 💀</h1>
                <div style="font-size: 24px; margin-bottom: 20px; color: #FFD700;">
                    森林被入侵了...
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                    <div style="font-size: 16px; line-height: 2;">
                        <div>📊 到达波次: <span style="color: #FF6B6B;">${this.gameState.wave}/${this.gameState.currentLevel.waves}</span></div>
                        <div>💀 击杀敌人: <span style="color: #FF6B6B;">${this.gameState.totalKills}</span></div>
                        <div>⚔️ 总伤害: <span style="color: #FF6B6B;">${this.gameState.totalDamageDealt}</span></div>
                        <div>💰 总金币: <span style="color: #FFD700;">${this.gameState.totalGoldEarned}</span></div>
                        <div>🏰 建造塔数: <span style="color: #4CAF50;">${this.gameState.towersBuilt}</span></div>
                        <div>⏱️ 用时: <span style="color: #9C27B0;">${minutes}分${seconds}秒</span></div>
                    </div>
                </div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="retry-level-btn" style="
                        padding: 15px 30px;
                        font-size: 18px;
                        background: linear-gradient(180deg, #FF9800, #F57C00);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        cursor: pointer;
                        font-weight: bold;
                        transition: all 0.2s;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        重新挑战
                    </button>
                    <button id="back-to-level-select-btn2" style="
                        padding: 15px 30px;
                        font-size: 18px;
                        background: linear-gradient(180deg, #2196F3, #1976D2);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        cursor: pointer;
                        font-weight: bold;
                        transition: all 0.2s;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        关卡选择
                    </button>
                </div>
            </div>
        `;

        document.getElementById('game-screen').appendChild(gameoverUI);

        document.getElementById('retry-level-btn').addEventListener('click', () => {
            gameoverUI.remove();
            this.startLevel(this.gameState.currentLevel);
        });

        document.getElementById('back-to-level-select-btn2').addEventListener('click', () => {
            gameoverUI.remove();
            this.exitGame();
        });
    }

    showExitConfirm() {
        const existingUI = document.getElementById('exit-confirm');
        if (existingUI) existingUI.remove();

        const confirmUI = document.createElement('div');
        confirmUI.id = 'exit-confirm';
        confirmUI.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 200;
        `;

        confirmUI.innerHTML = `
            <div style="
                background: #333;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                color: white;
                border: 2px solid #FFD700;
            ">
                <h2 style="margin-bottom: 20px;">确定要退出游戏吗？</h2>
                <p style="margin-bottom: 25px; color: #aaa;">当前进度将不会保存</p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="confirm-exit-btn" style="
                        padding: 12px 25px;
                        background: #F44336;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                    ">确定退出</button>
                    <button id="cancel-exit-btn" style="
                        padding: 12px 25px;
                        background: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                    ">继续游戏</button>
                </div>
            </div>
        `;

        document.getElementById('game-screen').appendChild(confirmUI);

        document.getElementById('confirm-exit-btn').addEventListener('click', () => {
            confirmUI.remove();
            this.exitGame();
        });

        document.getElementById('cancel-exit-btn').addEventListener('click', () => {
            confirmUI.remove();
        });
    }

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = '#90EE90';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#7CCD7C';
        for (let x = 0; x < w; x += 40) {
            for (let y = 0; y < h; y += 40) {
                if ((x + y) % 80 === 0) {
                    ctx.fillRect(x, y, 40, 40);
                }
            }
        }

        this.drawPath();
        this.drawBuildableAreas();
        this.drawTowers();
        this.drawEnemies();
        this.drawProjectiles();
        this.drawDamageNumbers();
        this.drawDecorations();
    }

    drawPath() {
        const ctx = this.ctx;
        const path = this.gameState.path;
        
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 58;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = 50;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#A1887F';
        ctx.lineWidth = 42;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();

        ctx.fillStyle = '#FF5722';
        ctx.beginPath();
        ctx.arc(path[0].x, path[0].y, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('入口', path[0].x, path[0].y);

        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(path[path.length - 1].x, path[path.length - 1].y, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.fillText('基地', path[path.length - 1].x, path[path.length - 1].y);
    }

    drawBuildableAreas() {
        const ctx = this.ctx;
        
        for (const area of this.gameState.buildableAreas) {
            const hasTower = this.gameState.towers.some(t => 
                Math.abs(t.x - area.x) < 10 && Math.abs(t.y - area.y) < 10
            );
            if (!hasTower) {
                ctx.fillStyle = this.gameState.selectedTowerType ? 
                    'rgba(76, 175, 80, 0.5)' : 'rgba(100, 200, 100, 0.3)';
                ctx.fillRect(area.x - 22, area.y - 22, 44, 44);
                
                ctx.strokeStyle = this.gameState.selectedTowerType ?
                    'rgba(56, 142, 60, 0.8)' : 'rgba(50, 150, 50, 0.5)';
                ctx.lineWidth = 2;
                ctx.strokeRect(area.x - 22, area.y - 22, 44, 44);
            }
        }
    }

    drawTowers() {
        const ctx = this.ctx;
        
        for (const tower of this.gameState.towers) {
            const isAttacking = tower.attackAnimation > 0;
            const attackScale = isAttacking ? 1 + (tower.attackAnimation / 500) : 1;
            const isSelected = this.gameState.selectedTower === tower;
            
            if (isSelected) {
                ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(tower.x, tower.y - 15, tower.range, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
                ctx.fill();
            } else {
                ctx.strokeStyle = 'rgba(255, 235, 59, 0.15)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(tower.x, tower.y - 15, tower.range, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            ctx.fillStyle = '#616161';
            ctx.beginPath();
            ctx.arc(tower.x, tower.y + 5, 24, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#424242';
            ctx.fillRect(tower.x - 18, tower.y - 10, 36, 25);
            
            ctx.fillStyle = tower.color;
            ctx.fillRect(
                tower.x - 14 * attackScale, 
                tower.y - 35 - (isAttacking ? 5 : 0), 
                28 * attackScale, 
                30
            );
            
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.moveTo(tower.x - 16 * attackScale, tower.y - 35 - (isAttacking ? 5 : 0));
            ctx.lineTo(tower.x, tower.y - 55 - (isAttacking ? 10 : 0));
            ctx.lineTo(tower.x + 16 * attackScale, tower.y - 35 - (isAttacking ? 5 : 0));
            ctx.closePath();
            ctx.fill();
            
            if (tower.level > 1) {
                ctx.fillStyle = '#FFD700';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`Lv.${tower.level}`, tower.x, tower.y + 38);
            }
            
            if (isAttacking) {
                ctx.fillStyle = 'rgba(255, 200, 0, 0.6)';
                ctx.beginPath();
                ctx.arc(tower.x, tower.y - 40, 12, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawEnemies() {
        const ctx = this.ctx;
        const now = Date.now();
        
        for (const enemy of this.gameState.enemies) {
            const isHit = enemy.hitAnimation > 0;
            const isSlowed = enemy.slowedUntil > now;
            
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(enemy.x, enemy.y + enemy.size + 2, enemy.size * 0.8, enemy.size * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            
            if (isSlowed) {
                ctx.strokeStyle = '#00BFFF';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.size + 5, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            ctx.fillStyle = isHit ? '#FFFFFF' : enemy.color;
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(enemy.x - 4, enemy.y - 3, 4, 0, Math.PI * 2);
            ctx.arc(enemy.x + 4, enemy.y - 3, 4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(enemy.x - 4, enemy.y - 3, 2, 0, Math.PI * 2);
            ctx.arc(enemy.x + 4, enemy.y - 3, 2, 0, Math.PI * 2);
            ctx.fill();
            
            const hpRatio = enemy.hp / enemy.maxHp;
            const hpBarWidth = enemy.size * 2.5;
            
            ctx.fillStyle = '#333';
            ctx.fillRect(enemy.x - hpBarWidth / 2, enemy.y - enemy.size - 15, hpBarWidth, 8);
            
            ctx.fillStyle = hpRatio > 0.6 ? '#4CAF50' : hpRatio > 0.3 ? '#FFC107' : '#F44336';
            ctx.fillRect(enemy.x - hpBarWidth / 2 + 1, enemy.y - enemy.size - 14, (hpBarWidth - 2) * hpRatio, 6);
            
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(enemy.x - hpBarWidth / 2, enemy.y - enemy.size - 15, hpBarWidth, 8);
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 9px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                `${Math.ceil(enemy.hp)}/${enemy.maxHp}`, 
                enemy.x, 
                enemy.y - enemy.size - 9
            );
        }
    }

    drawProjectiles() {
        const ctx = this.ctx;
        
        for (const proj of this.gameState.projectiles) {
            const dx = proj.targetX - proj.x;
            const dy = proj.targetY - proj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            ctx.strokeStyle = proj.color;
            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(proj.x, proj.y);
            ctx.lineTo(proj.x - Math.cos(angle) * 20, proj.y - Math.sin(angle) * 20);
            ctx.stroke();
            ctx.globalAlpha = 1;
            
            ctx.fillStyle = proj.color;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, 7, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFEB3B';
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(proj.x - 2, proj.y - 2, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawDamageNumbers() {
        const ctx = this.ctx;
        
        for (const num of this.gameState.damageNumbers) {
            const alpha = num.life / num.maxLife;
            const scale = num.isCrit ? 1.5 : 1;
            
            ctx.globalAlpha = alpha;
            ctx.font = `bold ${Math.floor(16 * scale)}px Arial`;
            ctx.textAlign = 'center';
            
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeText(num.text, num.x, num.y);
            
            ctx.fillStyle = num.color;
            ctx.fillText(num.text, num.x, num.y);
            
            ctx.globalAlpha = 1;
        }
    }

    drawDecorations() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        const trees = [
            { x: 50, y: 150 }, { x: 120, y: 200 }, { x: w - 80, y: 180 },
            { x: w - 150, y: 250 }, { x: 80, y: h - 150 }, { x: w - 100, y: h - 180 },
            { x: 30, y: h * 0.45 }, { x: w - 40, y: h * 0.25 }
        ];

        for (const tree of trees) {
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(tree.x + 5, tree.y + 38, 20, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#5D4037';
            ctx.fillRect(tree.x - 7, tree.y, 14, 42);
            
            ctx.fillStyle = '#2E7D32';
            ctx.beginPath();
            ctx.arc(tree.x, tree.y - 15, 28, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#388E3C';
            ctx.beginPath();
            ctx.arc(tree.x - 14, tree.y - 5, 18, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(tree.x + 14, tree.y - 5, 18, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#43A047';
            ctx.beginPath();
            ctx.arc(tree.x - 5, tree.y - 22, 10, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    updateGameUI() {
        document.getElementById('lives').textContent = this.gameState.lives;
        document.getElementById('gold').textContent = this.gameState.gold;
        document.getElementById('wave').textContent = this.gameState.wave;
    }

    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
        document.getElementById('pause-btn').textContent = this.gameState.isPaused ? '继续' : '暂停';
        if (this.gameState.isPaused) {
            this.showMessage('游戏已暂停');
        }
    }

    unlockNextLevel(currentLevelId) {
        const nextLevel = this.levels.find(l => l.id === currentLevelId + 1);
        if (nextLevel) {
            nextLevel.unlocked = true;
        }
    }

    setLevelStars(levelId, stars) {
        const level = this.levels.find(l => l.id === levelId);
        if (level && stars > level.stars) {
            level.stars = stars;
        }
    }

    exitGame() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        const towerUI = document.getElementById('tower-select');
        if (towerUI) towerUI.remove();
        const msgUI = document.getElementById('game-message');
        if (msgUI) msgUI.remove();
        const towerInfoUI = document.getElementById('tower-info');
        if (towerInfoUI) towerInfoUI.remove();
        this.showScreen('level-select');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new ForestDefenderGame();
});