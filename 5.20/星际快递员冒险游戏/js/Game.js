class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.uiLayer = document.getElementById('ui-layer');
        
        this.canvas.width = 1280;
        this.canvas.height = 720;
        
        this.currentScene = null;
        this.scenes = {};
        this.lastTime = 0;
        this.isRunning = false;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            this.handleKeyDown(e);
        });
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.setAttribute('tabindex', '0');
        this.canvas.style.outline = 'none';
    }

    registerScene(name, sceneClass) {
        this.scenes[name] = sceneClass;
    }

    loadScene(sceneName, params = null) {
        if (this.currentScene) {
            this.currentScene.destroy();
        }

        const SceneClass = this.scenes[sceneName];
        if (SceneClass) {
            this.playTransition(() => {
                this.currentScene = new SceneClass(this);
                this.currentScene.init(params);
            });
        } else {
            console.error(`Scene "${sceneName}" not found`);
        }
    }

    playTransition(callback) {
        const transition = document.createElement('div');
        transition.className = 'scene-transition';
        document.body.appendChild(transition);

        setTimeout(() => {
            if (callback) callback();
            transition.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => {
                document.body.removeChild(transition);
            }, 500);
        }, 500);
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    stop() {
        this.isRunning = false;
    }

    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.currentScene) {
            this.currentScene.render();
        }
    }

    handleKeyDown(e) {
        if (this.currentScene) {
            this.currentScene.handleInput({ type: 'keydown', key: e.key, event: e });
        }
    }

    handleKeyUp(e) {
        if (this.currentScene) {
            this.currentScene.handleInput({ type: 'keyup', key: e.key, event: e });
        }
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.currentScene) {
            this.currentScene.handleInput({ type: 'click', x, y, event: e });
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.currentScene) {
            this.currentScene.handleInput({ type: 'mousemove', x, y, event: e });
        }
    }
}
