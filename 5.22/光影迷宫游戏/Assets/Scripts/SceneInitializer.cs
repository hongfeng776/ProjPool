using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;

namespace LightAndShadowMaze
{
    public class SceneInitializer : MonoBehaviour
    {
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void OnSceneLoaded()
        {
            SetupGameManagers();
        }

        private static void SetupGameManagers()
        {
            if (GameManager.Instance == null)
            {
                GameObject gameManagerObj = new GameObject("GameManager");
                gameManagerObj.AddComponent<GameManager>();
            }

            if (UIManager.Instance == null)
            {
                CreateUIManager();
            }
        }

        private static void CreateUIManager()
        {
            GameObject uiManagerObj = new GameObject("UIManager");
            UIManager uiManager = uiManagerObj.AddComponent<UIManager>();

            GameObject canvasObj = new GameObject("Canvas");
            Canvas canvas = canvasObj.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvasObj.AddComponent<CanvasScaler>();
            canvasObj.AddComponent<GraphicRaycaster>();

            GameObject eventSystemObj = new GameObject("EventSystem");
            eventSystemObj.AddComponent<UnityEngine.EventSystems.EventSystem>();
            eventSystemObj.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();

            GameObject mainMenuPanel = CreatePanel(canvasObj.transform, "MainMenuPanel");
            GameObject gameUIPanel = CreatePanel(canvasObj.transform, "GameUIPanel");
            GameObject pausePanel = CreatePanel(canvasObj.transform, "PausePanel");
            GameObject gameOverPanel = CreatePanel(canvasObj.transform, "GameOverPanel");
            GameObject victoryPanel = CreatePanel(canvasObj.transform, "VictoryPanel");

            CreateMainMenuContent(mainMenuPanel.transform, uiManager);
            CreateGameUIContent(gameUIPanel.transform, uiManager);
            CreatePauseMenuContent(pausePanel.transform, uiManager);
            CreateGameOverContent(gameOverPanel.transform, uiManager);
            CreateVictoryContent(victoryPanel.transform, uiManager);

            SetPrivateField(uiManager, "mainMenuPanel", mainMenuPanel);
            SetPrivateField(uiManager, "gameUIPanel", gameUIPanel);
            SetPrivateField(uiManager, "pausePanel", pausePanel);
            SetPrivateField(uiManager, "gameOverPanel", gameOverPanel);
            SetPrivateField(uiManager, "victoryPanel", victoryPanel);
        }

        private static GameObject CreatePanel(Transform parent, string name)
        {
            GameObject panel = new GameObject(name);
            panel.transform.SetParent(parent, false);
            RectTransform rect = panel.AddComponent<RectTransform>();
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;

            Image image = panel.AddComponent<Image>();
            image.color = new Color(0.1f, 0.1f, 0.15f, 0.95f);

            return panel;
        }

        private static void CreateMainMenuContent(Transform parent, UIManager uiManager)
        {
            GameObject titleObj = new GameObject("Title");
            titleObj.transform.SetParent(parent, false);
            RectTransform titleRect = titleObj.AddComponent<RectTransform>();
            titleRect.anchoredPosition = new Vector2(0, 150);
            titleRect.sizeDelta = new Vector2(600, 80);

            TextMeshProUGUI titleText = titleObj.AddComponent<TextMeshProUGUI>();
            titleText.text = "光影迷宫";
            titleText.fontSize = 72;
            titleText.alignment = TextAlignmentOptions.Center;
            titleText.color = new Color(0.9f, 0.8f, 0.5f);

            GameObject subtitleObj = new GameObject("Subtitle");
            subtitleObj.transform.SetParent(parent, false);
            RectTransform subtitleRect = subtitleObj.AddComponent<RectTransform>();
            subtitleRect.anchoredPosition = new Vector2(0, 80);
            subtitleRect.sizeDelta = new Vector2(400, 40);

            TextMeshProUGUI subtitleText = subtitleObj.AddComponent<TextMeshProUGUI>();
            subtitleText.text = "Light and Shadow Maze";
            subtitleText.fontSize = 28;
            subtitleText.alignment = TextAlignmentOptions.Center;
            subtitleText.color = new Color(0.7f, 0.7f, 0.8f);

            Button startButton = CreateButton(parent, "StartButton", "开始游戏", new Vector2(0, -20), 200, 50);
            Button quitButton = CreateButton(parent, "QuitButton", "退出游戏", new Vector2(0, -90), 200, 50);

            SetPrivateField(uiManager, "startButton", startButton);
            SetPrivateField(uiManager, "quitButton", quitButton);
        }

        private static void CreateGameUIContent(Transform parent, UIManager uiManager)
        {
            Image image = parent.GetComponent<Image>();
            if (image != null) image.enabled = false;

            GameObject timeBgObj = new GameObject("TimeBackground");
            timeBgObj.transform.SetParent(parent, false);
            RectTransform timeBgRect = timeBgObj.AddComponent<RectTransform>();
            timeBgRect.anchorMin = new Vector2(0, 1);
            timeBgRect.anchorMax = new Vector2(0, 1);
            timeBgRect.pivot = new Vector2(0, 1);
            timeBgRect.anchoredPosition = new Vector2(20, -20);
            timeBgRect.sizeDelta = new Vector2(180, 50);

            Image timeBg = timeBgObj.AddComponent<Image>();
            timeBg.color = new Color(0f, 0f, 0f, 0.6f);

            GameObject timeTextObj = new GameObject("TimeText");
            timeTextObj.transform.SetParent(timeBgObj.transform, false);
            RectTransform timeTextRect = timeTextObj.AddComponent<RectTransform>();
            timeTextRect.anchorMin = Vector2.zero;
            timeTextRect.anchorMax = Vector2.one;
            timeTextRect.offsetMin = Vector2.zero;
            timeTextRect.offsetMax = Vector2.zero;

            TextMeshProUGUI timeText = timeTextObj.AddComponent<TextMeshProUGUI>();
            timeText.text = "05:00";
            timeText.fontSize = 36;
            timeText.alignment = TextAlignmentOptions.Center;
            timeText.color = Color.white;

            Button pauseButton = CreateButton(parent, "PauseButton", "❚❚", new Vector2(-20, -20), 60, 50);
            RectTransform pauseRect = pauseButton.GetComponent<RectTransform>();
            pauseRect.anchorMin = new Vector2(1, 1);
            pauseRect.anchorMax = new Vector2(1, 1);
            pauseRect.pivot = new Vector2(1, 1);

            GameObject hintTextObj = new GameObject("HintText");
            hintTextObj.transform.SetParent(parent, false);
            RectTransform hintTextRect = hintTextObj.AddComponent<RectTransform>();
            hintTextRect.anchoredPosition = new Vector2(0, -100);
            hintTextRect.sizeDelta = new Vector2(600, 60);

            TextMeshProUGUI hintText = hintTextObj.AddComponent<TextMeshProUGUI>();
            hintText.fontSize = 28;
            hintText.alignment = TextAlignmentOptions.Center;
            hintText.color = new Color(1f, 0.9f, 0.5f);
            hintTextObj.SetActive(false);

            SetPrivateField(uiManager, "timeText", timeText);
            SetPrivateField(uiManager, "hintText", hintText);
            SetPrivateField(uiManager, "pauseButton", pauseButton);
        }

        private static void CreatePauseMenuContent(Transform parent, UIManager uiManager)
        {
            GameObject titleObj = new GameObject("PauseTitle");
            titleObj.transform.SetParent(parent, false);
            RectTransform titleRect = titleObj.AddComponent<RectTransform>();
            titleRect.anchoredPosition = new Vector2(0, 100);
            titleRect.sizeDelta = new Vector2(300, 60);

            TextMeshProUGUI titleText = titleObj.AddComponent<TextMeshProUGUI>();
            titleText.text = "游戏暂停";
            titleText.fontSize = 48;
            titleText.alignment = TextAlignmentOptions.Center;
            titleText.color = Color.white;

            Button resumeButton = CreateButton(parent, "ResumeButton", "继续游戏", new Vector2(0, -20), 200, 50);
            Button restartButton = CreateButton(parent, "RestartButton", "重新开始", new Vector2(0, -90), 200, 50);
            Button mainMenuButton = CreateButton(parent, "MainMenuButton", "返回主菜单", new Vector2(0, -160), 200, 50);

            SetPrivateField(uiManager, "resumeButton", resumeButton);
            SetPrivateField(uiManager, "restartButton", restartButton);
            SetPrivateField(uiManager, "mainMenuButton", mainMenuButton);
        }

        private static void CreateGameOverContent(Transform parent, UIManager uiManager)
        {
            GameObject titleObj = new GameObject("GameOverTitle");
            titleObj.transform.SetParent(parent, false);
            RectTransform titleRect = titleObj.AddComponent<RectTransform>();
            titleRect.anchoredPosition = new Vector2(0, 100);
            titleRect.sizeDelta = new Vector2(400, 80);

            TextMeshProUGUI titleText = titleObj.AddComponent<TextMeshProUGUI>();
            titleText.text = "时间耗尽";
            titleText.fontSize = 56;
            titleText.alignment = TextAlignmentOptions.Center;
            titleText.color = new Color(1f, 0.4f, 0.4f);

            Button restartButton = CreateButton(parent, "RestartButton", "重新开始", new Vector2(0, -20), 200, 50);
            Button mainMenuButton = CreateButton(parent, "MainMenuButton", "返回主菜单", new Vector2(0, -90), 200, 50);

            SetPrivateField(uiManager, "restartButton", restartButton);
            SetPrivateField(uiManager, "mainMenuButton", mainMenuButton);
        }

        private static void CreateVictoryContent(Transform parent, UIManager uiManager)
        {
            GameObject titleObj = new GameObject("VictoryTitle");
            titleObj.transform.SetParent(parent, false);
            RectTransform titleRect = titleObj.AddComponent<RectTransform>();
            titleRect.anchoredPosition = new Vector2(0, 100);
            titleRect.sizeDelta = new Vector2(400, 80);

            TextMeshProUGUI titleText = titleObj.AddComponent<TextMeshProUGUI>();
            titleText.text = "恭喜通关！";
            titleText.fontSize = 56;
            titleText.alignment = TextAlignmentOptions.Center;
            titleText.color = new Color(0.4f, 1f, 0.6f);

            Button restartButton = CreateButton(parent, "RestartButton", "再玩一次", new Vector2(0, -20), 200, 50);
            Button mainMenuButton = CreateButton(parent, "MainMenuButton", "返回主菜单", new Vector2(0, -90), 200, 50);

            SetPrivateField(uiManager, "restartButton", restartButton);
            SetPrivateField(uiManager, "mainMenuButton", mainMenuButton);
        }

        private static Button CreateButton(Transform parent, string name, string text, Vector2 position, float width, float height)
        {
            GameObject buttonObj = new GameObject(name);
            buttonObj.transform.SetParent(parent, false);
            RectTransform buttonRect = buttonObj.AddComponent<RectTransform>();
            buttonRect.sizeDelta = new Vector2(width, height);
            buttonRect.anchoredPosition = position;

            Image image = buttonObj.AddComponent<Image>();
            image.color = new Color(0.3f, 0.4f, 0.6f, 0.9f);

            Button button = buttonObj.AddComponent<Button>();
            ColorBlock colors = button.colors;
            colors.normalColor = new Color(0.3f, 0.4f, 0.6f, 0.9f);
            colors.highlightedColor = new Color(0.4f, 0.5f, 0.8f, 1f);
            colors.pressedColor = new Color(0.2f, 0.3f, 0.5f, 1f);
            button.colors = colors;

            GameObject textObj = new GameObject("Text");
            textObj.transform.SetParent(buttonObj.transform, false);
            RectTransform textRect = textObj.AddComponent<RectTransform>();
            textRect.anchorMin = Vector2.zero;
            textRect.anchorMax = Vector2.one;
            textRect.offsetMin = Vector2.zero;
            textRect.offsetMax = Vector2.zero;

            TextMeshProUGUI buttonText = textObj.AddComponent<TextMeshProUGUI>();
            buttonText.text = text;
            buttonText.fontSize = 28;
            buttonText.alignment = TextAlignmentOptions.Center;
            buttonText.color = Color.white;

            return button;
        }

        private static void SetPrivateField(object obj, string fieldName, object value)
        {
            var field = obj.GetType().GetField(fieldName,
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            if (field != null)
            {
                field.SetValue(obj, value);
            }
        }
    }
}
