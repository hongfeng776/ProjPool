using UnityEngine;
using UnityEngine.UI;
using PixelAdventure.Levels;
using PixelAdventure.Gameplay;
using PixelAdventure.Items;

namespace PixelAdventure.UI
{
    public class GameOverUI : MonoBehaviour
    {
        [Header("面板引用")]
        [SerializeField] private GameObject gameOverPanel;
        [SerializeField] private GameObject levelCompletePanel;
        [SerializeField] private GameObject pausePanel;

        [Header("通用")]
        [SerializeField] private Text titleText;
        [SerializeField] private Text scoreText;
        [SerializeField] private Text timeText;

        [Header("游戏结束")]
        [SerializeField] private Button retryButton;
        [SerializeField] private Button menuButton;

        [Header("关卡完成")]
        [SerializeField] private Image[] starImages;
        [SerializeField] private Button nextLevelButton;
        [SerializeField] private Button retryCompleteButton;
        [SerializeField] private Button menuCompleteButton;

        [Header("暂停")]
        [SerializeField] private Button resumeButton;
        [SerializeField] private Button restartButton;
        [SerializeField] private Button quitButton;

        [Header("设置")]
        [SerializeField] private Color starActiveColor = Color.yellow;
        [SerializeField] private Color starInactiveColor = Color.gray;

        private void Awake()
        {
            InitializeComponents();
        }

        private void Start()
        {
            SubscribeToEvents();
            HideAllPanels();
        }

        private void InitializeComponents()
        {
            if (gameOverPanel == null)
            {
                gameOverPanel = CreatePanel("GameOverPanel", "游戏结束");
                retryButton = CreateButton(gameOverPanel.transform, "重新开始", OnRetryClicked);
                menuButton = CreateButton(gameOverPanel.transform, "返回菜单", OnMenuClicked);
            }

            if (levelCompletePanel == null)
            {
                levelCompletePanel = CreatePanel("LevelCompletePanel", "关卡完成!");
                nextLevelButton = CreateButton(levelCompletePanel.transform, "下一关", OnNextLevelClicked);
                retryCompleteButton = CreateButton(levelCompletePanel.transform, "再玩一次", OnRetryClicked);
                menuCompleteButton = CreateButton(levelCompletePanel.transform, "返回菜单", OnMenuClicked);
            }

            if (pausePanel == null)
            {
                pausePanel = CreatePanel("PausePanel", "游戏暂停");
                resumeButton = CreateButton(pausePanel.transform, "继续游戏", OnResumeClicked);
                restartButton = CreateButton(pausePanel.transform, "重新开始", OnRetryClicked);
                quitButton = CreateButton(pausePanel.transform, "退出游戏", OnMenuClicked);
            }
        }

        private GameObject CreatePanel(string name, string title)
        {
            GameObject panel = new GameObject(name);
            panel.transform.SetParent(transform, false);

            Canvas canvas = GetComponent<Canvas>();
            if (canvas == null)
            {
                canvas = gameObject.AddComponent<Canvas>();
                canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                canvas.sortingOrder = 1000;
                gameObject.AddComponent<GraphicRaycaster>();
            }

            RectTransform rect = panel.AddComponent<RectTransform>();
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;

            Image bg = panel.AddComponent<Image>();
            bg.color = new Color(0f, 0f, 0f, 0.8f);

            GameObject titleObj = new GameObject("Title");
            titleObj.transform.SetParent(panel.transform, false);
            Text titleTxt = titleObj.AddComponent<Text>();
            titleTxt.text = title;
            titleTxt.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            titleTxt.fontSize = 48;
            titleTxt.alignment = TextAnchor.MiddleCenter;
            titleTxt.color = Color.white;

            RectTransform titleRect = titleObj.GetComponent<RectTransform>();
            titleRect.anchorMin = new Vector2(0.5f, 0.7f);
            titleRect.anchorMax = new Vector2(0.5f, 0.7f);
            titleRect.sizeDelta = new Vector2(400, 80);
            titleRect.anchoredPosition = Vector2.zero;

            return panel;
        }

        private Button CreateButton(Transform parent, string text, UnityEngine.Events.UnityAction onClick)
        {
            GameObject buttonObj = new GameObject("Button_" + text);
            buttonObj.transform.SetParent(parent, false);

            RectTransform rect = buttonObj.AddComponent<RectTransform>();
            rect.sizeDelta = new Vector2(200, 50);

            Button button = buttonObj.AddComponent<Button>();
            Image image = buttonObj.AddComponent<Image>();
            image.color = new Color(0.3f, 0.3f, 0.3f, 1f);

            ColorBlock colors = button.colors;
            colors.normalColor = new Color(0.3f, 0.3f, 0.3f, 1f);
            colors.highlightedColor = new Color(0.4f, 0.4f, 0.4f, 1f);
            colors.pressedColor = new Color(0.2f, 0.2f, 0.2f, 1f);
            button.colors = colors;

            GameObject textObj = new GameObject("Text");
            textObj.transform.SetParent(buttonObj.transform, false);
            Text btnText = textObj.AddComponent<Text>();
            btnText.text = text;
            btnText.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            btnText.fontSize = 20;
            btnText.alignment = TextAnchor.MiddleCenter;
            btnText.color = Color.white;

            RectTransform textRect = textObj.GetComponent<RectTransform>();
            textRect.anchorMin = Vector2.zero;
            textRect.anchorMax = Vector2.one;
            textRect.offsetMin = Vector2.zero;
            textRect.offsetMax = Vector2.zero;

            button.onClick.AddListener(onClick);

            return button;
        }

        private void SubscribeToEvents()
        {
            if (GameStateManager.Instance != null)
            {
                GameStateManager.Instance.OnStateChanged += OnGameStateChanged;
            }
        }

        private void OnGameStateChanged(GameState state)
        {
            HideAllPanels();

            switch (state)
            {
                case GameState.Paused:
                    ShowPausePanel();
                    break;
                case GameState.LevelComplete:
                    ShowLevelCompletePanel();
                    break;
                case GameState.GameOver:
                    ShowGameOverPanel();
                    break;
            }
        }

        private void HideAllPanels()
        {
            if (gameOverPanel != null) gameOverPanel.SetActive(false);
            if (levelCompletePanel != null) levelCompletePanel.SetActive(false);
            if (pausePanel != null) pausePanel.SetActive(false);
        }

        private void ShowGameOverPanel()
        {
            if (gameOverPanel == null) return;

            gameOverPanel.SetActive(true);
            UpdateScoreDisplay();
        }

        private void ShowLevelCompletePanel()
        {
            if (levelCompletePanel == null) return;

            levelCompletePanel.SetActive(true);
            UpdateScoreDisplay();
            UpdateStars();

            if (nextLevelButton != null)
            {
                bool hasNextLevel = LevelManager.Instance != null &&
                    System.Array.IndexOf(LevelManager.Instance.AllLevels, LevelManager.Instance.CurrentLevel) < LevelManager.Instance.AllLevels.Length - 1;
                nextLevelButton.gameObject.SetActive(hasNextLevel);
            }
        }

        private void ShowPausePanel()
        {
            if (pausePanel == null) return;

            pausePanel.SetActive(true);
        }

        private void UpdateScoreDisplay()
        {
            if (LevelManager.Instance == null) return;

            if (scoreText != null)
            {
                int score = ItemManager.Instance != null ? ItemManager.Instance.TotalValueCollected : 0;
                scoreText.text = $"得分: {score}";
            }

            if (timeText != null)
            {
                float time = LevelManager.Instance.LevelTime;
                timeText.text = $"用时: {time:F1}秒";
            }
        }

        private void UpdateStars()
        {
            if (starImages == null || LevelManager.Instance == null || LevelManager.Instance.CurrentLevel == null) return;

            int score = ItemManager.Instance != null ? ItemManager.Instance.TotalValueCollected : 0;
            int targetScore = LevelManager.Instance.CurrentLevel.targetScore;
            float ratio = targetScore > 0 ? (float)score / targetScore : 1f;

            int starCount = 1;
            if (ratio >= 1.5f) starCount = 3;
            else if (ratio >= 1.2f) starCount = 2;

            for (int i = 0; i < starImages.Length; i++)
            {
                if (starImages[i] != null)
                {
                    starImages[i].color = i < starCount ? starActiveColor : starInactiveColor;
                }
            }
        }

        private void OnRetryClicked()
        {
            GameStateManager.Instance?.RestartGame();
        }

        private void OnMenuClicked()
        {
            GameStateManager.Instance?.ReturnToMainMenu();
        }

        private void OnResumeClicked()
        {
            LevelManager.Instance?.ResumeGame();
        }

        private void OnNextLevelClicked()
        {
            GameStateManager.Instance?.NextLevel();
        }

        private void OnDestroy()
        {
            if (GameStateManager.Instance != null)
            {
                GameStateManager.Instance.OnStateChanged -= OnGameStateChanged;
            }
        }
    }
}
