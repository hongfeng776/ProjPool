window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();

    game.registerScene('menu', MainMenuScene);
    game.registerScene('game', GameScene);

    game.loadScene('menu');

    game.start();

    console.log('🚀 星际快递员冒险游戏启动成功！');
    console.log('📖 操作说明:');
    console.log('   - WASD 或 方向键: 移动飞船');
    console.log('   - 收集包裹获得分数');
});
