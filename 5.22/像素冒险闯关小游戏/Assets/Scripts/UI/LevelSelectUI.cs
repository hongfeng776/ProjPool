using UnityEngine;
using UnityEngine.UI;
using PixelAdventure.Levels;
using PixelAdventure.Managers;

namespace PixelAdventure.UI
{
    public class LevelSelectUI : MonoBehaviour
    {
        [Header("引用")]
        [SerializeField] private Transform levelButtonContainer;
        [SerializeField] private GameObject levelButtonPrefab;
        [SerializeField] private Button backButton;

        [Header("难度选择")]
        [SerializeField] private Dropdown difficultyDropdown;

        [Header("统计")]
        [SerializeField] private Text progressText;
        [SerializeField] private Text totalStarsText;

        private void Start()
        {
            InitializeUI();
            CreateLevelButtons();
            UpdateStats();
            SetupEvents();
        }

        private void InitializeUI()
        {
            Canvas canvas = GetComponent<Canvas>();
            if (canvas == null)
            {
                canvas = gameObject.AddComponent<Canvas>();
                canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                canvas.sortingOrder = 100;
                gameObject.AddComponent<GraphicRaycaster>();
            }

            if (levelButtonContainer == null)
            {
                GameObject container = new GameObject("LevelButtonContainer");
                container.transform.SetParent(transform, false);
                levelButtonContainer = container.transform;

                GridLayoutGroup grid = container.AddComponent<GridLayoutGroup>();
                grid.cellSize = new Vector2(150, 150);
                grid.spacing = new Vector2(20, 20);
                grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
                grid.constraintCount = 4;
                grid.childAlignment = TextAnchor.MiddleCenter;

                RectTransform rect = container.GetComponent<RectTransform>();
                rect.anchorMin = Vector2.zero;
                rect.anchorMax = Vector2.one;
                rect.offsetMin = new Vector2(50, 100);
                rect.offsetMax = new Vector2(-50, -150);
            }

            if (difficultyDropdown == null)
            {
                GameObject ddObj = new GameObject("DifficultyDropdown");
                ddObj.transform.SetParent(transform, false);
                difficultyDropdown = ddObj.AddComponent<Dropdown>();

                RectTransform rect = ddObj.GetComponent<RectTransform>();
                rect.anchorMin = new Vector2(0.5f, 0.9f);
                rect.anchorMax = new Vector2(0.5f, 0.9f);
                rect.sizeDelta = new Vector2(200, 40);
                rect.anchoredPosition = Vector2.zero;

                difficultyDropdown.options.Clear();
                difficultyDropdown.options.Add(new Dropdown.OptionData("简单"));
                difficultyDropdown.options.Add(new Dropdown.OptionData("普通"));
                difficultyDropdown.options.Add(new Dropdown.OptionData("困难"));
                difficultyDropdown.options.Add(new Dropdown.OptionData("专家"));

                if (LevelManager.Instance != null)
                {
                    difficultyDropdown.value = (int)LevelManager.Instance.GlobalDifficulty;
                }
            }

            if (backButton == null)
            {
                GameObject btnObj = new GameObject("BackButton");
                btnObj.transform.SetParent(transform, false);
                backButton = btnObj.AddComponent<Button>();
                Image img = btnObj.AddComponent<Image>();
                img.color = new Color(0.3f, 0.3f, 0.3f, 1f);

                RectTransform rect = btnObj.GetComponent<RectTransform>();
                rect.anchorMin = new Vector2(0f, 0f);
                rect.anchorMax = new Vector2(0f, 0f);
                rect.pivot = new Vector2(0f, 0f);
                rect.sizeDelta = new Vector2(150, 50);
                rect.anchoredPosition = new Vector2(20, 20);

                GameObject textObj = new GameObject("Text");
                textObj.transform.SetParent(btnObj.transform, false);
                Text txt = textObj.AddComponent<Text>();
                txt.text = "返回菜单";
                txt.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
                txt.fontSize = 18;
                txt.alignment = TextAnchor.MiddleCenter;
                txt.color = Color.white;

                RectTransform txtRect = textObj.GetComponent<RectTransform>();
                txtRect.anchorMin = Vector2.zero;
                txtRect.anchorMax = Vector2.one;
                txtRect.offsetMin = Vector2.zero;
                txtRect.offsetMax = Vector2.zero;
            }
        }

        private void CreateLevelButtons()
        {
            if (LevelManager.Instance == null || LevelManager.Instance.AllLevels == null)
            {
                CreateDemoLevelButtons();
                return;
            }

            for (int i = 0; i < LevelManager.Instance.AllLevels.Length; i++)
            {
                CreateLevelButton(i, LevelManager.Instance.AllLevels[i]);
            }
        }

        private void CreateDemoLevelButtons()
        {
            for (int i = 0; i < 6; i++)
            {
                GameObject btnObj = new GameObject($"LevelButton_{i + 1}");
                btnObj.transform.SetParent(levelButtonContainer, false);

                RectTransform rect = btnObj.AddComponent<RectTransform>();
                rect.sizeDelta = new Vector2(150, 150);

                Button button = btnObj.AddComponent<Button>();
                Image img = btnObj.AddComponent<Image>();
                img.color = i == 0 ? new Color(0.2f, 0.6f, 0.8f, 1f) : new Color(0.4f, 0.4f, 0.4f, 1f);

                GameObject textObj = new GameObject("Text");
                textObj.transform.SetParent(btnObj.transform, false);
                Text txt = textObj.AddComponent<Text>();
                txt.text = $"关卡 {i + 1}\n{(i == 0 ? "" : "🔒")}";
                txt.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
                txt.fontSize = 24;
                txt.alignment = TextAnchor.MiddleCenter;
                txt.color = Color.white;

                RectTransform txtRect = textObj.GetComponent<RectTransform>();
                txtRect.anchorMin = Vector2.zero;
                txtRect.anchorMax = Vector2.one;
                txtRect.offsetMin = Vector2.zero;
                txtRect.offsetMax = Vector2.zero;

                int levelIndex = i;
                button.onClick.AddListener(() => OnLevelClicked(levelIndex));
                button.interactable = i == 0;
            }
        }

        private void CreateLevelButton(int index, LevelData levelData)
        {
            if (levelButtonPrefab != null)
            {
                GameObject btnObj = Instantiate(levelButtonPrefab, levelButtonContainer);
                SetupButtonContent(btnObj, index, levelData);
            }
            else
            {
                GameObject btnObj = new GameObject($"LevelButton_{levelData.levelIndex}");
                btnObj.transform.SetParent(levelButtonContainer, false);

                RectTransform rect = btnObj.AddComponent<RectTransform>();
                rect.sizeDelta = new Vector2(150, 150);

                Button button = btnObj.AddComponent<Button>();
                Image img = btnObj.AddComponent<Image>();
                img.color = levelData.isUnlocked ? levelData.GetDifficultyColor() : new Color(0.4f, 0.4f, 0.4f, 1f);

                SetupButtonContent(btnObj, index, levelData);
            }
        }

        private void SetupButtonContent(GameObject buttonObj, int index, LevelData levelData)
        {
            Button button = buttonObj.GetComponent<Button>();
            if (button == null) return;

            Text[] texts = buttonObj.GetComponentsInChildren<Text>();
            if (texts.Length == 0)
            {
                GameObject textObj = new GameObject("Text");
                textObj.transform.SetParent(buttonObj.transform, false);
                Text txt = textObj.AddComponent<Text>();
                UpdateButtonText(txt, levelData);

                RectTransform txtRect = textObj.GetComponent<RectTransform>();
                txtRect.anchorMin = Vector2.zero;
                txtRect.anchorMax = Vector2.one;
                txtRect.offsetMin = Vector2.zero;
                txtRect.offsetMax = Vector2.zero;
            }
            else
            {
                foreach (var txt in texts)
                {
                    UpdateButtonText(txt, levelData);
                }
            }

            button.onClick.AddListener(() => OnLevelClicked(index));
            button.interactable = levelData.isUnlocked;
        }

        private void UpdateButtonText(Text text, LevelData levelData)
        {
            text.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            text.fontSize = 24;
            text.alignment = TextAnchor.MiddleCenter;
            text.color = Color.white;

            if (levelData.isUnlocked)
            {
                string info = levelData.isCompleted ? $"★ {levelData.bestScore}" : levelData.GetDifficultyText();
                text.text = $"{levelData.levelName}\n<size=16>{info}</size>";
            }
            else
            {
                text.text = $"{levelData.levelName}\n<size=20>🔒</size>";
            }
        }

        private void UpdateStats()
        {
            if (LevelManager.Instance == null) return;

            if (progressText != null)
            {
                int completed = LevelManager.Instance.GetCompletedLevelCount();
                int total = LevelManager.Instance.AllLevels != null ? LevelManager.Instance.AllLevels.Length : 0;
                progressText.text = $"进度: {completed}/{total}";
            }

            if (totalStarsText != null)
            {
                totalStarsText.text = $"星星: {LevelManager.Instance.GetTotalStars()}";
            }
        }

        private void SetupEvents()
        {
            if (backButton != null)
            {
                backButton.onClick.AddListener(OnBackClicked);
            }

            if (difficultyDropdown != null)
            {
                difficultyDropdown.onValueChanged.AddListener(OnDifficultyChanged);
            }
        }

        private void OnLevelClicked(int levelIndex)
        {
            Debug.Log($"[LevelSelectUI] 选择关卡: {levelIndex}");
            LevelManager.Instance?.StartLevel(levelIndex);
        }

        private void OnBackClicked()
        {
            SceneLoader.Instance.LoadMainMenu();
        }

        private void OnDifficultyChanged(int value)
        {
            LevelManager.Instance?.SetGlobalDifficulty((DifficultyLevel)value);
        }

        private void OnDestroy()
        {
            if (backButton != null)
            {
                backButton.onClick.RemoveListener(OnBackClicked);
            }

            if (difficultyDropdown != null)
            {
                difficultyDropdown.onValueChanged.RemoveListener(OnDifficultyChanged);
            }
        }
    }
}
