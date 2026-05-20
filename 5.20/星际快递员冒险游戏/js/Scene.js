class Scene {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
        this.uiLayer = game.uiLayer;
        this.active = false;
    }

    init() {
        this.active = true;
        this.createUI();
    }

    createUI() {
    }

    destroy() {
        this.active = false;
        this.clearUI();
    }

    clearUI() {
        this.uiLayer.innerHTML = '';
    }

    update(deltaTime) {
    }

    render() {
    }

    handleInput(event) {
    }
}
