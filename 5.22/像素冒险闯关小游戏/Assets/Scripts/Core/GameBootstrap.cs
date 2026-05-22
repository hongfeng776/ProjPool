using UnityEngine;
using PixelAdventure.Levels;
using PixelAdventure.Gameplay;
using PixelAdventure.UI;

namespace PixelAdventure.Core
{
    public class GameBootstrap : MonoBehaviour
    {
        [Header("管理器预制体")]
        [SerializeField] private GameObject levelManagerPrefab;
        [SerializeField] private GameObject gameStateManagerPrefab;
        [SerializeField] private GameObject errorHandlerPrefab;
        [SerializeField] private GameObject gameOverUIPrefab;

        [Header("设置")]
        [SerializeField] private bool createDefaultLevels = true;
        [SerializeField] private int defaultLevelCount = 6;

        private void Awake()
        {
            InitializeManagers();
        }

        private void Start()
        {
            SetupDefaultLevels();
            Debug.Log("[GameBootstrap] 游戏核心系统初始化完成");
        }

        private void InitializeManagers()
        {
            CreateManagerIfNotExists<LevelManager>(levelManagerPrefab, "LevelManager");
            CreateManagerIfNotExists<GameStateManager>(gameStateManagerPrefab, "GameStateManager");
            CreateManagerIfNotExists<ErrorHandler>(errorHandlerPrefab, "ErrorHandler");
            CreateManagerIfNotExists<GameOverUI>(gameOverUIPrefab, "GameOverUI");
        }

        private void CreateManagerIfNotExists<T>(GameObject prefab, string name) where T : MonoBehaviour
        {
            T instance = FindObjectOfType<T>();
            if (instance == null)
            {
                GameObject managerObject;
                if (prefab != null)
                {
                    managerObject = Instantiate(prefab);
                }
                else
                {
                    managerObject = new GameObject(name);
                    managerObject.AddComponent<T>();
                }
                managerObject.name = name;
                DontDestroyOnLoad(managerObject);
                Debug.Log($"[GameBootstrap] 创建管理器: {typeof(T).Name}");
            }
        }

        private void SetupDefaultLevels()
        {
            if (!createDefaultLevels || LevelManager.Instance == null) return;

            LevelData[] existingLevels = LevelManager.Instance.AllLevels;
            if (existingLevels != null && existingLevels.Length > 0) return;

            LevelData[] defaultLevels = CreateDefaultLevels();
            SetLevelsToManager(defaultLevels);
        }

        private LevelData[] CreateDefaultLevels()
        {
            LevelData[] levels = new LevelData[defaultLevelCount];
            string[] difficultyNames = { "简单", "普通", "困难", "专家" };

            for (int i = 0; i < defaultLevelCount; i++)
            {
                LevelData level = ScriptableObject.CreateInstance<LevelData>();
                level.name = $"Level_{i + 1}";
                level.levelName = $"关卡 {i + 1}";
                level.levelIndex = i + 1;
                level.sceneName = "GameScene";
                level.isUnlocked = i == 0;
                level.isCompleted = false;

                level.targetScore = 50 * (i + 1);
                level.itemCount = 8 + i * 2;
                level.playerLives = 3;

                level.difficulty = (DifficultyLevel)Mathf.Min(i / 2, 3);

                levels[i] = level;
            }

            return levels;
        }

        private void SetLevelsToManager(LevelData[] levels)
        {
            var fieldInfo = typeof(LevelManager).GetField("allLevels",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);

            fieldInfo?.SetValue(LevelManager.Instance, levels);

            Debug.Log($"[GameBootstrap] 创建了 {levels.Length} 个默认关卡");
        }
    }
}
