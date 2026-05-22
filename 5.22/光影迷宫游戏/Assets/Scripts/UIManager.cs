using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace LightAndShadowMaze
{
    public class UIManager : MonoBehaviour
    {
        public static UIManager Instance { get; private set; }

        [Header("Panels")]
        [SerializeField] private GameObject mainMenuPanel;
        [SerializeField] private GameObject gameUIPanel;
        [SerializeField] private GameObject pausePanel;
        [SerializeField] private GameObject gameOverPanel;
        [SerializeField] private GameObject victoryPanel;

        [Header("Game UI")]
        [SerializeField] private TextMeshProUGUI timeText;
        [SerializeField] private TextMeshProUGUI hintText;

        [Header("Buttons")]
        [SerializeField] private Button startButton;
        [SerializeField] private Button resumeButton;
        [SerializeField] private Button restartButton;
        [SerializeField] private Button mainMenuButton;
        [SerializeField] private Button quitButton;
        [SerializeField] private Button pauseButton;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
        }

        private void Start()
        {
            InitializeButtons();
            ShowMainMenu();
        }

        private void Update()
        {
            if (GameManager.Instance != null && 
                GameManager.Instance.CurrentState == GameManager.GameState.Playing)
            {
                UpdateTimeDisplay();
            }
        }

        private void InitializeButtons()
        {
            if (startButton != null)
                startButton.onClick.AddListener(OnStartButtonClicked);
            
            if (resumeButton != null)
                resumeButton.onClick.AddListener(OnResumeButtonClicked);
            
            if (restartButton != null)
                restartButton.onClick.AddListener(OnRestartButtonClicked);
            
            if (mainMenuButton != null)
                mainMenuButton.onClick.AddListener(OnMainMenuButtonClicked);
            
            if (quitButton != null)
                quitButton.onClick.AddListener(OnQuitButtonClicked);
            
            if (pauseButton != null)
                pauseButton.onClick.AddListener(OnPauseButtonClicked);
        }

        public void ShowMainMenu()
        {
            HideAllPanels();
            if (mainMenuPanel != null)
                mainMenuPanel.SetActive(true);
        }

        public void ShowGameUI()
        {
            HideAllPanels();
            if (gameUIPanel != null)
                gameUIPanel.SetActive(true);
        }

        public void ShowPauseMenu()
        {
            if (pausePanel != null)
                pausePanel.SetActive(true);
        }

        public void HidePauseMenu()
        {
            if (pausePanel != null)
                pausePanel.SetActive(false);
        }

        public void ShowGameOver()
        {
            HideAllPanels();
            if (gameOverPanel != null)
                gameOverPanel.SetActive(true);
        }

        public void ShowVictory()
        {
            HideAllPanels();
            if (victoryPanel != null)
                victoryPanel.SetActive(true);
        }

        private void HideAllPanels()
        {
            if (mainMenuPanel != null) mainMenuPanel.SetActive(false);
            if (gameUIPanel != null) gameUIPanel.SetActive(false);
            if (pausePanel != null) pausePanel.SetActive(false);
            if (gameOverPanel != null) gameOverPanel.SetActive(false);
            if (victoryPanel != null) victoryPanel.SetActive(false);
        }

        private void UpdateTimeDisplay()
        {
            if (timeText != null && GameManager.Instance != null)
            {
                float time = GameManager.Instance.CurrentTime;
                int minutes = Mathf.FloorToInt(time / 60f);
                int seconds = Mathf.FloorToInt(time % 60f);
                timeText.text = $"{minutes:00}:{seconds:00}";
            }
        }

        public void ShowHint(string message)
        {
            if (hintText != null)
            {
                hintText.text = message;
                hintText.gameObject.SetActive(true);
                CancelInvoke(nameof(HideHint));
                Invoke(nameof(HideHint), 3f);
            }
        }

        private void HideHint()
        {
            if (hintText != null)
            {
                hintText.gameObject.SetActive(false);
            }
        }

        private void OnStartButtonClicked()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.StartGame();
                ShowGameUI();
            }
        }

        private void OnResumeButtonClicked()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.ResumeGame();
                HidePauseMenu();
            }
        }

        private void OnRestartButtonClicked()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.StartGame();
                ShowGameUI();
            }
        }

        private void OnMainMenuButtonClicked()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.ReturnToMainMenu();
                ShowMainMenu();
            }
        }

        private void OnQuitButtonClicked()
        {
            Application.Quit();
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#endif
        }

        private void OnPauseButtonClicked()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.PauseGame();
                ShowPauseMenu();
            }
        }
    }
}
