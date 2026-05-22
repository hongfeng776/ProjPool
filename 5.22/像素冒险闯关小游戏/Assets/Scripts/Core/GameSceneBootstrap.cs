using UnityEngine;
using PixelAdventure.Managers;
using PixelAdventure.Data;
using PixelAdventure.Player;
using PixelAdventure.Items;
using PixelAdventure.UI.HUD;

namespace PixelAdventure.Core
{
    public class GameSceneBootstrap : MonoBehaviour
    {
        [Header("管理器引用")]
        [SerializeField] private PlayerInitializer playerInitializer;
        [SerializeField] private ItemSpawner itemSpawner;
        [SerializeField] private HUDController hudController;
        [SerializeField] private SceneBoundary sceneBoundary;

        [Header("返回按钮")]
        [SerializeField] private UnityEngine.UI.Button backToMenuButton;

        [Header("场景设置")]
        [SerializeField] private Vector3 playerSpawnPosition = new Vector3(0f, 0f, 0f);
        [SerializeField] private Vector2 spawnAreaMin = new Vector2(-8f, -3f);
        [SerializeField] private Vector2 spawnAreaMax = new Vector2(8f, 3f);
        [SerializeField] private int itemCount = 10;

        private void Awake()
        {
            InitializeManagers();
        }

        private void Start()
        {
            Debug.Log("[GameSceneBootstrap] 游戏场景加载完成");

            SetupBoundary();
            SpawnPlayer();
            SpawnItems();
            SetupHUD();
            SetupBackButton();

            if (SaveManager.Instance.HasActiveSave)
            {
                Debug.Log($"[GameSceneBootstrap] 当前玩家: {SaveManager.Instance.CurrentSave.PlayerName}, 关卡: {SaveManager.Instance.CurrentSave.Level}");
            }
        }

        private void InitializeManagers()
        {
            if (GameManager.Instance == null)
            {
                GameObject gameManager = new GameObject("GameManager");
                gameManager.AddComponent<GameManager>();
            }

            if (ItemManager.Instance == null)
            {
                GameObject itemManager = new GameObject("ItemManager");
                itemManager.AddComponent<ItemManager>();
            }
        }

        private void SetupBoundary()
        {
            if (sceneBoundary == null)
            {
                GameObject boundaryObj = new GameObject("SceneBoundary");
                sceneBoundary = boundaryObj.AddComponent<SceneBoundary>();
            }

            sceneBoundary.SetBoundary(spawnAreaMin - new Vector2(1f, 1f), spawnAreaMax + new Vector2(1f, 1f));
        }

        private void SpawnPlayer()
        {
            if (playerInitializer == null)
            {
                GameObject playerObj = new GameObject("PlayerInitializer");
                playerInitializer = playerObj.AddComponent<PlayerInitializer>();
            }

            playerInitializer.GetType()
                .GetField("spawnPosition", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(playerInitializer, playerSpawnPosition);

            playerInitializer.GetType()
                .GetField("boundaryMin", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(playerInitializer, spawnAreaMin);

            playerInitializer.GetType()
                .GetField("boundaryMax", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(playerInitializer, spawnAreaMax);
        }

        private void SpawnItems()
        {
            if (itemSpawner == null)
            {
                GameObject spawnerObj = new GameObject("ItemSpawner");
                itemSpawner = spawnerObj.AddComponent<ItemSpawner>();
            }

            itemSpawner.SetSpawnArea(spawnAreaMin, spawnAreaMax);
            itemSpawner.GetType()
                .GetField("itemCount", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(itemSpawner, itemCount);
        }

        private void SetupHUD()
        {
            if (hudController == null)
            {
                GameObject hudObj = new GameObject("HUD");
                hudController = hudObj.AddComponent<HUDController>();
            }

            hudController.Show();
        }

        private void SetupBackButton()
        {
            if (backToMenuButton != null)
            {
                backToMenuButton.onClick.AddListener(OnBackToMenu);
            }
            else
            {
                CreateBackButton();
            }
        }

        private void CreateBackButton()
        {
            GameObject canvasObj = new GameObject("BackButtonCanvas");
            Canvas canvas = canvasObj.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 1000;
            canvasObj.AddComponent<UnityEngine.UI.CanvasScaler>();
            canvasObj.AddComponent<UnityEngine.UI.GraphicRaycaster>();

            GameObject buttonObj = new GameObject("BackButton");
            buttonObj.transform.SetParent(canvasObj.transform, false);

            RectTransform rect = buttonObj.AddComponent<RectTransform>();
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = new Vector2(10f, -10f);
            rect.sizeDelta = new Vector2(100f, 40f);

            UnityEngine.UI.Button button = buttonObj.AddComponent<UnityEngine.UI.Button>();
            UnityEngine.UI.Image image = buttonObj.AddComponent<UnityEngine.UI.Image>();
            image.color = new Color(0.2f, 0.2f, 0.2f, 0.8f);

            GameObject textObj = new GameObject("Text");
            textObj.transform.SetParent(buttonObj.transform, false);
            UnityEngine.UI.Text text = textObj.AddComponent<UnityEngine.UI.Text>();
            text.text = "返回菜单";
            text.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            text.fontSize = 16;
            text.alignment = TextAnchor.MiddleCenter;
            text.color = Color.white;

            RectTransform textRect = textObj.GetComponent<RectTransform>();
            textRect.anchorMin = Vector2.zero;
            textRect.anchorMax = Vector2.one;
            textRect.offsetMin = Vector2.zero;
            textRect.offsetMax = Vector2.zero;

            button.onClick.AddListener(OnBackToMenu);
            backToMenuButton = button;
        }

        private void OnBackToMenu()
        {
            Debug.Log("[GameSceneBootstrap] 返回主菜单");

            if (SaveManager.Instance.HasActiveSave)
            {
                SaveManager.Instance.SaveGame();
            }

            SceneLoader.Instance.LoadMainMenu();
        }

        private void OnDestroy()
        {
            if (backToMenuButton != null)
            {
                backToMenuButton.onClick.RemoveListener(OnBackToMenu);
            }
        }
    }
}
