class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.masterVolume = 0.3;
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    enable() {
        this.enabled = true;
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    disable() {
        this.enabled = false;
    }

    toggle() {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable();
        }
        return this.enabled;
    }

    playTone(frequency, duration, type = 'sine', volume = 1) {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;
        gainNode.gain.setValueAtTime(this.masterVolume * volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playClick() {
        this.playTone(800, 0.1, 'sine', 0.5);
    }

    playPop() {
        this.playTone(600, 0.08, 'sine', 0.6);
        setTimeout(() => this.playTone(800, 0.08, 'sine', 0.4), 50);
    }

    playEliminate() {
        const notes = [523, 659, 784];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.6 - i * 0.1), i * 60);
        });
    }

    playCombo(combo) {
        const baseFreq = 400 + Math.min(combo, 10) * 50;
        for (let i = 0; i < Math.min(combo, 5); i++) {
            setTimeout(() => this.playTone(baseFreq + i * 100, 0.1, 'sine', 0.5), i * 50);
        }
    }

    playLevelComplete() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.7), i * 150);
        });
    }

    playGameOver() {
        const notes = [400, 350, 300, 250];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'sine', 0.5), i * 200);
        });
    }

    playStar() {
        this.playTone(1200, 0.15, 'sine', 0.6);
    }

    playButton() {
        this.playTone(500, 0.08, 'sine', 0.4);
    }

    playError() {
        this.playTone(200, 0.15, 'square', 0.3);
    }
}

class BlockGame {
    constructor() {
        this.rows = 8;
        this.cols = 8;
        this.colors = 5;
        this.board = [];
        this.score = 0;
        this.currentLevel = 1;
        this.maxLevels = 20;
        this.combo = 0;
        this.comboTimer = null;
        this.isAnimating = false;
        this.sound = new SoundManager();

        this.initGameData();
        this.loadGameProgress();
        this.initElements();
        this.bindEvents();
        this.updateScoreDisplay();
        this.updateSoundButton();
    }

    initGameData() {
        this.levels = [];
        for (let i = 1; i <= this.maxLevels; i++) {
            const baseScore = 500 + (i - 1) * 200;
            const starThresholds = [
                baseScore,
                Math.floor(baseScore * 1.5),
                Math.floor(baseScore * 2)
            ];
            this.levels.push({
                level: i,
                targetScore: baseScore,
                stars: starThresholds,
                colors: Math.min(3 + Math.floor(i / 5), 5)
            });
        }
    }

    loadGameProgress() {
        const saved = localStorage.getItem('blockGameProgress');
        if (saved) {
            this.gameProgress = JSON.parse(saved);
        } else {
            this.gameProgress = {
                unlockedLevel: 1,
                highScores: {},
                stars: {}
            };
        }

        const soundEnabled = localStorage.getItem('blockGameSound');
        if (soundEnabled !== null) {
            this.sound.enabled = soundEnabled === 'true';
        }

        const highScore = localStorage.getItem('blockGameHighScore');
        if (highScore) {
            this.highScore = parseInt(highScore);
        } else {
            this.highScore = 0;
        }
    }

    saveGameProgress() {
        localStorage.setItem('blockGameProgress', JSON.stringify(this.gameProgress));
        localStorage.setItem('blockGameHighScore', this.highScore.toString());
        localStorage.setItem('blockGameSound', this.sound.enabled.toString());
    }

    initElements() {
        this.startScreen = document.getElementById('startScreen');
        this.levelScreen = document.getElementById('levelScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.levelCompleteScreen = document.getElementById('levelCompleteScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.gameBoard = document.getElementById('gameBoard');
        this.levelGrid = document.getElementById('levelGrid');
        this.soundBtn = document.getElementById('soundBtn');

        this.scoreElement = document.getElementById('score');
        this.targetScoreElement = document.getElementById('targetScore');
        this.currentLevelElement = document.getElementById('currentLevel');
        this.comboElement = document.getElementById('combo');
        this.progressFill = document.getElementById('progressFill');

        this.completedLevelElement = document.getElementById('completedLevel');
        this.levelScoreElement = document.getElementById('levelScore');
        this.starsElement = document.getElementById('stars');

        this.failedLevelElement = document.getElementById('failedLevel');
        this.finalScoreElement = document.getElementById('finalScore');
        this.failedTargetElement = document.getElementById('failedTarget');

        this.startBtn = document.getElementById('startBtn');
        this.levelSelectBtn = document.getElementById('levelSelectBtn');
        this.backToStartBtn = document.getElementById('backToStartBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.menuBtn = document.getElementById('menuBtn');
        this.nextLevelBtn = document.getElementById('nextLevelBtn');
        this.levelCompleteMenuBtn = document.getElementById('levelCompleteMenuBtn');
        this.retryBtn = document.getElementById('retryBtn');
        this.homeBtn = document.getElementById('homeBtn');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => {
            this.sound.playButton();
            this.startGame();
        });
        this.levelSelectBtn.addEventListener('click', () => {
            this.sound.playButton();
            this.showLevelSelect();
        });
        this.backToStartBtn.addEventListener('click', () => {
            this.sound.playButton();
            this.showStartScreen();
        });
        this.restartBtn.addEventListener('click', () => {
            this.sound.playButton();
            this.restartLevel();
        });
        this.menuBtn.addEventListener('click', () => {
            this.sound.playButton();
            this.showStartScreen();
        });
        this.nextLevelBtn.addEventListener('click', () => {
            this.sound.playButton();
            this.startLevel(this.currentLevel + 1);
        });
        this.levelCompleteMenuBtn.addEventListener('click', () => {
            this.sound.playButton();
            this.showStartScreen();
        });
        this.retryBtn.addEventListener('click', () => {
            this.sound.playButton();
            this.restartLevel();
        });
        this.homeBtn.addEventListener('click', () => {
            this.sound.playButton();
            this.showStartScreen();
        });
        this.soundBtn.addEventListener('click', () => {
            this.toggleSound();
        });
    }

    toggleSound() {
        const enabled = this.sound.toggle();
        this.updateSoundButton();
        this.saveGameProgress();
        if (enabled) {
            this.sound.playButton();
        }
    }

    updateSoundButton() {
        if (this.soundBtn) {
            this.soundBtn.textContent = this.sound.enabled ? '🔊' : '🔇';
            this.soundBtn.classList.toggle('muted', !this.sound.enabled);
        }
    }

    showLevelSelect() {
        this.startScreen.style.display = 'none';
        this.levelScreen.style.display = 'block';
        this.renderLevelGrid();
    }

    renderLevelGrid() {
        this.levelGrid.innerHTML = '';
        for (let i = 1; i <= this.maxLevels; i++) {
            const card = document.createElement('div');
            const isUnlocked = i <= this.gameProgress.unlockedLevel;
            const stars = this.gameProgress.stars[i] || 0;

            let cardClass = 'level-card';
            if (isUnlocked) {
                cardClass += stars > 0 ? ' completed' : ' unlocked';
            } else {
                cardClass += ' locked';
            }

            card.className = cardClass;

            if (isUnlocked) {
                card.innerHTML = `
                    <span class="level-number">${i}</span>
                    <span class="level-stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</span>
                `;
                card.addEventListener('click', () => {
                    this.sound.playButton();
                    this.startLevel(i);
                });
            } else {
                card.innerHTML = `
                    <span class="level-number">🔒</span>
                `;
                card.addEventListener('click', () => {
                    this.sound.playError();
                });
            }

            this.levelGrid.appendChild(card);
        }
    }

    startGame() {
        const levelToStart = this.gameProgress.unlockedLevel;
        this.startLevel(levelToStart);
    }

    startLevel(level) {
        if (level > this.maxLevels) {
            alert('恭喜你通关了所有关卡！');
            this.showStartScreen();
            return;
        }

        this.currentLevel = level;
        this.score = 0;
        this.combo = 0;
        this.isAnimating = false;
        this.colors = this.levels[level - 1].colors;

        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
            this.comboTimer = null;
        }

        this.updateScoreDisplay();
        this.hideCombo();
        this.initBoard();
        this.renderBoard();
        this.showGameScreen();
        this.sound.playClick();
    }

    restartLevel() {
        this.startLevel(this.currentLevel);
    }

    initBoard() {
        this.board = [];
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col] = Math.floor(Math.random() * this.colors);
            }
        }

        while (this.hasInitialMatches()) {
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    if (this.findConnectedBlocks(row, col).length >= 2) {
                        this.board[row][col] = Math.floor(Math.random() * this.colors);
                    }
                }
            }
        }
    }

    hasInitialMatches() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.findConnectedBlocks(row, col).length >= 2) {
                    return true;
                }
            }
        }
        return false;
    }

    renderBoard() {
        this.gameBoard.innerHTML = '';
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const block = document.createElement('div');
                block.className = `block color-${this.board[row][col]}`;
                block.dataset.row = row;
                block.dataset.col = col;
                block.style.animationDelay = `${(row + col) * 20}ms`;

                block.addEventListener('click', () => this.handleBlockClick(row, col));
                block.addEventListener('mouseenter', () => this.showHoverPreview(row, col));
                block.addEventListener('mouseleave', () => this.clearHoverPreview());

                this.gameBoard.appendChild(block);
            }
        }
    }

    showHoverPreview(row, col) {
        if (this.isAnimating) return;

        const connectedBlocks = this.findConnectedBlocks(row, col);
        if (connectedBlocks.length >= 2) {
            this.sound.playPop();
            connectedBlocks.forEach(([r, c]) => {
                const block = this.getBlockElement(r, c);
                if (block) {
                    block.classList.add('highlight');
                }
            });
        }
    }

    clearHoverPreview() {
        const blocks = document.querySelectorAll('.block.highlight');
        blocks.forEach(block => block.classList.remove('highlight'));
    }

    getBlockElement(row, col) {
        return document.querySelector(`.block[data-row="${row}"][data-col="${col}"]`);
    }

    async handleBlockClick(row, col) {
        if (this.isAnimating) return;

        const connectedBlocks = this.findConnectedBlocks(row, col);
        if (connectedBlocks.length >= 2) {
            this.isAnimating = true;
            this.increaseCombo();
            await this.performElimination(connectedBlocks);

            if (this.score >= this.levels[this.currentLevel - 1].targetScore) {
                this.levelComplete();
            } else if (this.isGameOver()) {
                setTimeout(() => this.gameOver(), 500);
            } else {
                this.isAnimating = false;
            }
        } else {
            this.sound.playError();
        }
    }

    increaseCombo() {
        this.combo++;
        this.showCombo();
        this.sound.playCombo(this.combo);

        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }

        this.comboTimer = setTimeout(() => {
            this.combo = 0;
            this.hideCombo();
        }, 2000);
    }

    showCombo() {
        if (this.comboElement && this.combo > 1) {
            this.comboElement.textContent = `${this.combo}连击!`;
            this.comboElement.style.display = 'block';
            this.comboElement.style.animation = 'none';
            this.comboElement.offsetHeight;
            this.comboElement.style.animation = 'comboJump 0.5s ease';
        }
    }

    hideCombo() {
        if (this.comboElement) {
            this.comboElement.style.display = 'none';
        }
    }

    async performElimination(blocks) {
        await this.removeBlocksWithAnimation(blocks);
        await this.applyGravityWithAnimation();
        await this.fillEmptyBlocksWithAnimation();

        const newMatches = this.findAllMatches();
        if (newMatches.length > 0) {
            this.increaseCombo();
            await this.delay(200);
            await this.performElimination(newMatches[0]);
        }
    }

    findAllMatches() {
        const visited = new Set();
        const allMatches = [];

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const key = `${row},${col}`;
                if (!visited.has(key) && this.board[row][col] !== null) {
                    const connected = this.findConnectedBlocks(row, col);
                    if (connected.length >= 2) {
                        allMatches.push(connected);
                        connected.forEach(([r, c]) => visited.add(`${r},${c}`));
                    }
                }
            }
        }

        return allMatches;
    }

    findConnectedBlocks(row, col) {
        const color = this.board[row][col];
        if (color === null) return [];

        const visited = new Set();
        const connected = [];
        const stack = [[row, col]];

        while (stack.length > 0) {
            const [r, c] = stack.pop();
            const key = `${r},${c}`;

            if (visited.has(key)) continue;
            if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) continue;
            if (this.board[r][c] !== color) continue;

            visited.add(key);
            connected.push([r, c]);

            stack.push([r - 1, c]);
            stack.push([r + 1, c]);
            stack.push([r, c - 1]);
            stack.push([r, c + 1]);
        }

        return connected;
    }

    async removeBlocksWithAnimation(blocks) {
        const basePoints = blocks.length * blocks.length * 10;
        const comboMultiplier = 1 + (this.combo - 1) * 0.5;
        const points = Math.floor(basePoints * comboMultiplier);
        this.score += points;

        if (this.score > this.highScore) {
            this.highScore = this.score;
        }

        this.updateScoreDisplay();
        this.showScorePopup(blocks, points);
        this.sound.playEliminate();

        blocks.forEach(([row, col]) => {
            const block = this.getBlockElement(row, col);
            if (block) {
                block.classList.add('removing');
            }
        });

        await this.delay(300);

        blocks.forEach(([row, col]) => {
            this.board[row][col] = null;
        });
    }

    showScorePopup(blocks, points) {
        const [centerRow, centerCol] = blocks[Math.floor(blocks.length / 2)];
        const block = this.getBlockElement(centerRow, centerCol);
        if (!block) return;

        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        popup.style.left = block.offsetLeft + block.offsetWidth / 2 + 'px';
        popup.style.top = block.offsetTop + 'px';
        this.gameBoard.appendChild(popup);

        setTimeout(() => popup.remove(), 1000);
    }

    async applyGravityWithAnimation() {
        let moved = false;

        for (let col = 0; col < this.cols; col++) {
            let emptyRow = this.rows - 1;
            for (let row = this.rows - 1; row >= 0; row--) {
                if (this.board[row][col] !== null) {
                    if (row !== emptyRow) {
                        this.board[emptyRow][col] = this.board[row][col];
                        this.board[row][col] = null;
                        moved = true;
                    }
                    emptyRow--;
                }
            }
        }

        if (moved) {
            this.renderBoard();
            const blocks = document.querySelectorAll('.block');
            blocks.forEach((block, index) => {
                block.classList.add('falling');
                block.style.animationDelay = `${index % this.cols * 30}ms`;
            });
            await this.delay(300);
        }
    }

    async fillEmptyBlocksWithAnimation() {
        let hasEmpty = false;

        for (let col = 0; col < this.cols; col++) {
            for (let row = 0; row < this.rows; row++) {
                if (this.board[row][col] === null) {
                    this.board[row][col] = Math.floor(Math.random() * this.colors);
                    hasEmpty = true;
                }
            }
        }

        if (hasEmpty) {
            this.renderBoard();
            const blocks = document.querySelectorAll('.block');
            blocks.forEach((block, index) => {
                block.classList.add('appearing');
                block.style.animationDelay = `${index * 10}ms`;
            });
            await this.delay(300);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    isGameOver() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col] !== null && 
                    this.findConnectedBlocks(row, col).length >= 2) {
                    return false;
                }
            }
        }
        return true;
    }

    async levelComplete() {
        const levelData = this.levels[this.currentLevel - 1];
        let earnedStars = 0;

        for (let i = 2; i >= 0; i--) {
            if (this.score >= levelData.stars[i]) {
                earnedStars = i + 1;
                break;
            }
        }

        const prevStars = this.gameProgress.stars[this.currentLevel] || 0;
        if (earnedStars > prevStars) {
            this.gameProgress.stars[this.currentLevel] = earnedStars;
        }

        const prevScore = this.gameProgress.highScores[this.currentLevel] || 0;
        if (this.score > prevScore) {
            this.gameProgress.highScores[this.currentLevel] = this.score;
        }

        if (this.currentLevel >= this.gameProgress.unlockedLevel && 
            this.currentLevel < this.maxLevels) {
            this.gameProgress.unlockedLevel = this.currentLevel + 1;
        }

        this.saveGameProgress();

        this.completedLevelElement.textContent = this.currentLevel;
        this.levelScoreElement.textContent = this.score;

        const starElements = this.starsElement.querySelectorAll('.star');
        starElements.forEach((star, index) => {
            star.classList.remove('earned');
            if (index < earnedStars) {
                setTimeout(() => {
                    star.classList.add('earned');
                    this.sound.playStar();
                }, index * 300);
            }
        });

        if (this.currentLevel >= this.maxLevels) {
            this.nextLevelBtn.textContent = '全部通关！';
            this.nextLevelBtn.disabled = true;
        } else {
            this.nextLevelBtn.textContent = '下一关';
            this.nextLevelBtn.disabled = false;
        }

        setTimeout(() => this.sound.playLevelComplete(), 500);
        this.showLevelCompleteScreen();
        this.isAnimating = false;

        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
            this.comboTimer = null;
        }
    }

    gameOver() {
        this.failedLevelElement.textContent = this.currentLevel;
        this.finalScoreElement.textContent = this.score;
        this.failedTargetElement.textContent = this.levels[this.currentLevel - 1].targetScore;
        this.showGameOverScreen();
        this.sound.playGameOver();
        this.isAnimating = false;

        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
            this.comboTimer = null;
        }
    }

    updateScoreDisplay() {
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }
        if (this.targetScoreElement && this.levels[this.currentLevel - 1]) {
            this.targetScoreElement.textContent = this.levels[this.currentLevel - 1].targetScore;
        }
        if (this.currentLevelElement) {
            this.currentLevelElement.textContent = this.currentLevel;
        }
        if (this.progressFill && this.levels[this.currentLevel - 1]) {
            const progress = Math.min(100, (this.score / this.levels[this.currentLevel - 1].targetScore) * 100);
            this.progressFill.style.width = `${progress}%`;
        }
    }

    showStartScreen() {
        this.startScreen.style.display = 'block';
        this.levelScreen.style.display = 'none';
        this.gameScreen.style.display = 'none';
        this.levelCompleteScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
    }

    showGameScreen() {
        this.startScreen.style.display = 'none';
        this.levelScreen.style.display = 'none';
        this.gameScreen.style.display = 'block';
        this.levelCompleteScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
    }

    showLevelCompleteScreen() {
        this.startScreen.style.display = 'none';
        this.levelScreen.style.display = 'none';
        this.gameScreen.style.display = 'none';
        this.levelCompleteScreen.style.display = 'block';
        this.gameOverScreen.style.display = 'none';
    }

    showGameOverScreen() {
        this.startScreen.style.display = 'none';
        this.levelScreen.style.display = 'none';
        this.gameScreen.style.display = 'none';
        this.levelCompleteScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BlockGame();
});