using UnityEngine;

namespace PixelAdventure.Levels
{
    public enum DifficultyLevel
    {
        Easy,
        Normal,
        Hard,
        Expert
    }

    [CreateAssetMenu(fileName = "NewLevel", menuName = "Pixel Adventure/Level Data")]
    public class LevelData : ScriptableObject
    {
        [Header("基础信息")]
        public string levelName = "Level 1";
        public int levelIndex = 1;
        public string sceneName = "GameScene";
        public DifficultyLevel difficulty = DifficultyLevel.Normal;

        [Header("关卡目标")]
        public int targetScore = 100;
        public int coinsRequired = 0;
        public float timeLimit = 0f;

        [Header("难度设置")]
        public int itemCount = 10;
        public float enemySpeed = 1f;
        public float playerDamage = 1f;
        public int playerLives = 3;

        [Header("生成设置")]
        public Vector3 playerSpawnPosition = Vector3.zero;
        public Vector2 spawnAreaMin = new Vector2(-8f, -3f);
        public Vector2 spawnAreaMax = new Vector2(8f, 3f);

        [Header("解锁条件")]
        public int requiredLevel = 0;
        public int requiredScore = 0;
        public bool isUnlocked = true;

        [Header("关卡状态")]
        public int bestScore = 0;
        public float bestTime = 0f;
        public int starsCollected = 0;
        public bool isCompleted = false;

        public string GetDifficultyText()
        {
            switch (difficulty)
            {
                case DifficultyLevel.Easy: return "简单";
                case DifficultyLevel.Normal: return "普通";
                case DifficultyLevel.Hard: return "困难";
                case DifficultyLevel.Expert: return "专家";
                default: return "普通";
            }
        }

        public Color GetDifficultyColor()
        {
            switch (difficulty)
            {
                case DifficultyLevel.Easy: return Color.green;
                case DifficultyLevel.Normal: return Color.yellow;
                case DifficultyLevel.Hard: return new Color(1f, 0.5f, 0f);
                case DifficultyLevel.Expert: return Color.red;
                default: return Color.white;
            }
        }
    }
}
