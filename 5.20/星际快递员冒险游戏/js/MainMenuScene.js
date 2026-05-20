class MainMenuScene extends Scene {
    constructor(game) {
        super(game);
        this.stars = [];
        this.shipX = 100;
        this.shipY = 360;
        this.shipAngle = 0;
        this.currentMenu = 'main';
    }

    init() {
        super.init();
        this.generateStars();
        this.currentMenu = 'main';
    }

    generateStars() {
        this.stars = [];
        for (let i = 0; i < 150; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.1,
                twinkle: Math.random() * Math.PI * 2
            });
        }
    }

    createUI() {
        if (this.currentMenu === 'main') {
            this.createMainMenu();
        } else if (this.currentMenu === 'leaderboard') {
            this.createLeaderboardMenu();
        } else if (this.currentMenu === 'nameInput') {
            this.createNameInputMenu();
        }
    }

    createMainMenu() {
        const menuContainer = document.createElement('div');
        menuContainer.className = 'menu-container';

        const title = document.createElement('h1');
        title.className = 'game-title';
        title.textContent = '星际快递员';

        const subtitle = document.createElement('p');
        subtitle.className = 'game-subtitle';
        subtitle.textContent = 'INTERGALACTIC COURIER ADVENTURE';

        const hasSave = storageManager.hasSaveData();
        const continueBtn = UI.createButton('继续游戏', 'menu-button', () => {
            this.game.loadScene('game', true);
        });
        if (!hasSave) {
            continueBtn.disabled = true;
            continueBtn.style.opacity = '0.5';
            continueBtn.textContent = '继续游戏 (无存档)';
        }

        const startBtn = UI.createButton('新游戏', 'menu-button', () => {
            if (hasSave) {
                if (confirm('确定要开始新游戏吗？这将覆盖现有存档！')) {
                    storageManager.deleteSave();
                } else {
                    return;
                }
            }
            this.game.loadScene('game', false);
        });

        const leaderboardBtn = UI.createButton('🏆 排行榜', 'menu-button', () => {
            this.showLeaderboard();
        });

        const exitBtn = UI.createButton('退出游戏', 'menu-button', () => {
            if (confirm('确定要退出游戏吗？')) {
                window.close();
            }
        });

        menuContainer.appendChild(title);
        menuContainer.appendChild(subtitle);
        menuContainer.appendChild(continueBtn);
        menuContainer.appendChild(startBtn);
        menuContainer.appendChild(leaderboardBtn);
        menuContainer.appendChild(exitBtn);

        this.uiLayer.appendChild(menuContainer);
    }

    createLeaderboardMenu() {
        const menuContainer = document.createElement('div');
        menuContainer.className = 'menu-container';

        const title = document.createElement('h2');
        title.style.cssText = 'font-size: 42px; color: #ffd700; margin-bottom: 30px; text-shadow: 0 0 15px #ffd700;';
        title.textContent = '🏆 排行榜';

        const leaderboard = storageManager.getLeaderboard();
        const table = document.createElement('div');
        table.style.cssText = 'background: rgba(13, 27, 42, 0.8); padding: 20px; border-radius: 10px; min-width: 450px; margin-bottom: 20px; border: 2px solid #457b9d;';

        if (leaderboard.length === 0) {
            const empty = document.createElement('p');
            empty.style.cssText = 'color: #888; text-align: center; font-size: 18px; padding: 30px;';
            empty.textContent = '暂无记录，快去创造你的第一个记录吧！';
            table.appendChild(empty);
        } else {
            const header = document.createElement('div');
            header.style.cssText = 'display: grid; grid-template-columns: 60px 150px 100px 100px; color: #90e0ef; font-weight: bold; padding: 10px; border-bottom: 2px solid #457b9d; margin-bottom: 10px;';
            header.innerHTML = '<div>排名</div><div>玩家</div><div>分数</div><div>任务</div>';
            table.appendChild(header);

            leaderboard.forEach((entry, index) => {
                const row = document.createElement('div');
                row.style.cssText = 'display: grid; grid-template-columns: 60px 150px 100px 100px; padding: 10px; color: #e0e1dd; border-bottom: 1px solid rgba(69, 123, 157, 0.3);';
                
                const medals = ['🥇', '🥈', '🥉'];
                const rankDisplay = index < 3 ? medals[index] : `#${index + 1}`;
                
                row.innerHTML = `
                    <div style="font-size: 20px;">${rankDisplay}</div>
                    <div>${entry.name}</div>
                    <div style="color: #4ade80;">${entry.score.toLocaleString()}</div>
                    <div style="color: #60a5fa;">${entry.missions}</div>
                `;
                
                if (index < 3) {
                    row.style.background = 'rgba(255, 215, 0, 0.1)';
                }
                
                table.appendChild(row);
            });
        }

        const backBtn = UI.createButton('返回主菜单', 'menu-button', () => {
            this.showMainMenu();
        });

        menuContainer.appendChild(title);
        menuContainer.appendChild(table);
        menuContainer.appendChild(backBtn);

        this.uiLayer.appendChild(menuContainer);
    }

    showLeaderboard() {
        this.currentMenu = 'leaderboard';
        this.clearUI();
        this.createUI();
    }

    showMainMenu() {
        this.currentMenu = 'main';
        this.clearUI();
        this.createUI();
    }

    update(deltaTime) {
        this.stars.forEach(star => {
            star.x -= star.speed;
            star.twinkle += deltaTime * 2;
            
            if (star.x < 0) {
                star.x = this.canvas.width;
                star.y = Math.random() * this.canvas.height;
            }
        });

        this.shipAngle += deltaTime * 2;
        this.shipY = 360 + Math.sin(this.shipAngle) * 30;
    }

    render() {
        this.drawStars();
        this.drawSpaceship();
        this.drawPlanets();
    }

    drawStars() {
        this.stars.forEach(star => {
            const alpha = 0.5 + Math.sin(star.twinkle) * 0.3;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawSpaceship() {
        this.ctx.save();
        this.ctx.translate(this.shipX, this.shipY);
        
        this.ctx.fillStyle = '#e63946';
        this.ctx.beginPath();
        this.ctx.moveTo(50, 0);
        this.ctx.lineTo(-30, -25);
        this.ctx.lineTo(-20, 0);
        this.ctx.lineTo(-30, 25);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = '#457b9d';
        this.ctx.beginPath();
        this.ctx.moveTo(30, 0);
        this.ctx.lineTo(-5, -15);
        this.ctx.lineTo(-5, 15);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = '#ffb703';
        this.ctx.beginPath();
        this.ctx.moveTo(-20, -8);
        this.ctx.lineTo(-45, 0);
        this.ctx.lineTo(-20, 8);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
    }

    drawPlanets() {
        const gradient1 = this.ctx.createRadialGradient(1000, 150, 0, 1000, 150, 80);
        gradient1.addColorStop(0, '#ff6b6b');
        gradient1.addColorStop(0.7, '#c92a2a');
        gradient1.addColorStop(1, '#5c1414');
        this.ctx.fillStyle = gradient1;
        this.ctx.beginPath();
        this.ctx.arc(1000, 150, 80, 0, Math.PI * 2);
        this.ctx.fill();

        const gradient2 = this.ctx.createRadialGradient(1100, 550, 0, 1100, 550, 50);
        gradient2.addColorStop(0, '#4ecdc4');
        gradient2.addColorStop(0.7, '#1a936f');
        gradient2.addColorStop(1, '#0d5c4a');
        this.ctx.fillStyle = gradient2;
        this.ctx.beginPath();
        this.ctx.arc(1100, 550, 50, 0, Math.PI * 2);
        this.ctx.fill();
    }
}
