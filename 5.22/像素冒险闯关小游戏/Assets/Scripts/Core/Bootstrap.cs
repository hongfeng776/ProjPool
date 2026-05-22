using UnityEngine;
using PixelAdventure.Managers;
using PixelAdventure.Data;
using PixelAdventure.Networking;
using PixelAdventure.UI;
using PixelAdventure.Levels;
using PixelAdventure.Gameplay;
using System.Collections;

namespace PixelAdventure.Core
{
    public class Bootstrap : MonoBehaviour
    {
        [Header("管理器预制体")]
        [SerializeField] private GameObject gameManagerPrefab;
        [SerializeField] private GameObject sceneLoaderPrefab;
        [SerializeField] private GameObject uiManagerPrefab;
        [SerializeField] private GameObject saveManagerPrefab;
        [SerializeField] private GameObject networkManagerPrefab;
        [SerializeField] private GameObject networkCallbacksPrefab;
        [SerializeField] private GameObject loadingScreenPrefab;
        [SerializeField] private GameObject fadeTransitionPrefab;
        [SerializeField] private GameObject levelManagerPrefab;
        [SerializeField] private GameObject gameStateManagerPrefab;
        [SerializeField] private GameObject errorHandlerPrefab;
        [SerializeField] private GameObject gameOverUIPrefab;

        [Header("性能设置")]
        [SerializeField] private bool preloadCommonAssets = true;
        [SerializeField] private bool gcCollectOnStartup = true;
        [SerializeField] private bool optimizeForMobile = false;
        [SerializeField] private bool createDefaultLevels = true;

        private void Awake()
        {
            Application.targetFrameRate = 60;
            QualitySettings.vSyncCount = 1;
            QualitySettings.maxQueuedFrames = 2;

            if (optimizeForMobile)
            {
                Screen.sleepTimeout = SleepTimeout.NeverSleep;
            }
        }

        private IEnumerator Start()
        {
            Debug.Log("[Bootstrap] 开始初始化游戏...");

            InitializeManagers();

            yield return null;

            if (preloadCommonAssets)
            {
                yield return PreloadCommonAssets();
            }

            if (gcCollectOnStartup)
            {
                System.GC.Collect();
                yield return Resources.UnloadUnusedAssets();
            }

            Debug.Log("[Bootstrap] 游戏初始化完成");

            yield return new WaitForSeconds(0.3f);

            SceneLoader.Instance.LoadMainMenu();
        }

        private void InitializeManagers()
        {
            CreateManagerIfNotExists<GameManager>(gameManagerPrefab, "GameManager");
            CreateManagerIfNotExists<SceneLoader>(sceneLoaderPrefab, "SceneLoader");
            CreateManagerIfNotExists<UIManager>(uiManagerPrefab, "UIManager");
            CreateManagerIfNotExists<SaveManager>(saveManagerPrefab, "SaveManager");
            CreateManagerIfNotExists<SQLiteDataService>(null, "SQLiteDataService");
            CreateManagerIfNotExists<NetworkManager>(networkManagerPrefab, "NetworkManager");
            CreateManagerIfNotExists<NetworkCallbacks>(networkCallbacksPrefab, "NetworkCallbacks");
            CreateManagerIfNotExists<LevelManager>(levelManagerPrefab, "LevelManager");
            CreateManagerIfNotExists<GameStateManager>(gameStateManagerPrefab, "GameStateManager");
            CreateManagerIfNotExists<ErrorHandler>(errorHandlerPrefab, "ErrorHandler");
            CreateManagerIfNotExists<GameOverUI>(gameOverUIPrefab, "GameOverUI");

            if (createDefaultLevels && LevelManager.Instance != null)
            {
                SetupDefaultLevels();
            }
        }

        private void SetupDefaultLevels()
        {
            LevelData[] existingLevels = LevelManager.Instance.AllLevels;
            if (existingLevels != null && existingLevels.Length > 0) return;

            LevelData[] defaultLevels = new LevelData[6];
            for (int i = 0; i < 6; i++)
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
                defaultLevels[i] = level;
            }

            var fieldInfo = typeof(LevelManager).GetField("allLevels",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            fieldInfo?.SetValue(LevelManager.Instance, defaultLevels);

            Debug.Log($"[Bootstrap] 创建了 {defaultLevels.Length} 个默认关卡");
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
                Debug.Log($"[Bootstrap] 创建管理器: {typeof(T).Name}");
            }
        }

        private IEnumerator PreloadCommonAssets()
        {
            Debug.Log("[Bootstrap] 预加载通用资源...");

            yield return null;

            var asyncOperation = Resources.LoadAsync<GameObject>("CommonAssets");
            yield return asyncOperation;

            if (asyncOperation.asset != null)
            {
                Debug.Log("[Bootstrap] 通用资源预加载完成");
            }
        }
    }
}
