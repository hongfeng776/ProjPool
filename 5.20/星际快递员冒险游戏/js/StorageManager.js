class StorageManager {
    constructor() {
        this.SAVE_KEY = 'space_courier_save';
        this.LEADERBOARD_KEY = 'space_courier_leaderboard';
        this.MAX_LEADERBOARD_ENTRIES = 10;
    }

    saveGame(gameData) {
        const saveData = {
            score: gameData.score || 0,
            deliveries: gameData.deliveries || 0,
            missions: gameData.missions || 0,
            playerX: gameData.playerX || 200,
            playerY: gameData.playerY || 360,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        try {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error('保存游戏失败:', e);
            return false;
        }
    }

    loadGame() {
        try {
            const data = localStorage.getItem(this.SAVE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('读取存档失败:', e);
        }
        return null;
    }

    hasSaveData() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    }

    deleteSave() {
        localStorage.removeItem(this.SAVE_KEY);
    }

    addToLeaderboard(playerName, score, deliveries, missions) {
        const entry = {
            name: playerName || '匿名快递员',
            score: score,
            deliveries: deliveries,
            missions: missions,
            date: new Date().toLocaleDateString('zh-CN'),
            timestamp: Date.now()
        };

        let leaderboard = this.getLeaderboard();
        leaderboard.push(entry);
        
        leaderboard.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (b.missions !== a.missions) return b.missions - a.missions;
            return b.deliveries - a.deliveries;
        });

        leaderboard = leaderboard.slice(0, this.MAX_LEADERBOARD_ENTRIES);

        try {
            localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(leaderboard));
            return true;
        } catch (e) {
            console.error('保存排行榜失败:', e);
            return false;
        }
    }

    getLeaderboard() {
        try {
            const data = localStorage.getItem(this.LEADERBOARD_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('读取排行榜失败:', e);
        }
        return [];
    }

    clearLeaderboard() {
        localStorage.removeItem(this.LEADERBOARD_KEY);
    }

    getPlayerRank(score) {
        const leaderboard = this.getLeaderboard();
        let rank = 1;
        for (const entry of leaderboard) {
            if (entry.score > score) {
                rank++;
            } else {
                break;
            }
        }
        return rank;
    }
}

const storageManager = new StorageManager();
