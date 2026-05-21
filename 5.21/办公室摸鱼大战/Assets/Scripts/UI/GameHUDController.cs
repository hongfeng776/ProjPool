using UnityEngine;
using UnityEngine.UI;
using TMPro;
using OfficeFishing.Core;
using OfficeFishing.Gameplay;

namespace OfficeFishing.UI
{
    public class GameHUDController : MonoBehaviour
    {
        [Header("血量显示")]
        public Image[] healthHearts;
        public Sprite fullHeartSprite;
        public Sprite emptyHeartSprite;

        [Header("得分显示")]
        public TMP_Text scoreText;
        public Animator scoreAnimator;
        public string scorePopupTrigger = "ScorePopup";

        [Header("时间显示")]
        public TMP_Text timeText;
        public Image timeWarningImage;
        public float warningTimeThreshold = 30f;

        [Header("摸鱼进度")]
        public GameObject fishingProgressPanel;
        public TMP_Text fishingActionText;
        public Image fishingProgressBar;
        public TMP_Text comboText;

        [Header("老板检测")]
        public GameObject bossWarningPanel;
        public Image bossDetectionBar;

        [Header("暂停")]
        public Button pauseButton;
        public GameObject pausePanel;
        public Button resumeButton;
        public Button quitButton;

        [Header("游戏结束")]
        public GameObject gameOverPanel;
        public TMP_Text finalScoreText;
        public TMP_Text highScoreText;
        public TMP_Text isNewHighScoreText;
        public Button restartButton;
        public Button mainMenuButton;
        public Button leaderboardButton;

        private bool _isListening;

        private void Start()
        {
            RegisterEvents();
            SetupButtons();
            HideAllPanels();
        }

        private void OnDestroy()
        {
            UnregisterEvents();
        }

        private void RegisterEvents()
        {
            if (_isListening) return;

            EventSystem.Instance.Subscribe<GameEvents.HealthChanged>(OnHealthChanged);
            EventSystem.Instance.Subscribe<GameEvents.ScoreChanged>(OnScoreChanged);
            EventSystem.Instance.Subscribe<GameEvents.FishingStarted>(OnFishingStarted);
            EventSystem.Instance.Subscribe<GameEvents.FishingCompleted>(OnFishingCompleted);
            EventSystem.Instance.Subscribe<GameEvents.FishingInterrupted>(OnFishingInterrupted);
            EventSystem.Instance.Subscribe<GameEvents.PlayerCaught>(OnPlayerCaught);
            EventSystem.Instance.Subscribe<GameEvents.GameOver>(OnGameOver);

            _isListening = true;
        }

        private void UnregisterEvents()
        {
            if (!_isListening) return;

            EventSystem.Instance.Unsubscribe<GameEvents.HealthChanged>(OnHealthChanged);
            EventSystem.Instance.Unsubscribe<GameEvents.ScoreChanged>(OnScoreChanged);
            EventSystem.Instance.Unsubscribe<GameEvents.FishingStarted>(OnFishingStarted);
            EventSystem.Instance.Unsubscribe<GameEvents.FishingCompleted>(OnFishingCompleted);
            EventSystem.Instance.Unsubscribe<GameEvents.FishingInterrupted>(OnFishingInterrupted);
            EventSystem.Instance.Unsubscribe<GameEvents.PlayerCaught>(OnPlayerCaught);
            EventSystem.Instance.Unsubscribe<GameEvents.GameOver>(OnGameOver);

            _isListening = false;
        }

        private void SetupButtons()
        {
            if (pauseButton != null)
                pauseButton.onClick.AddListener(OnPauseClicked);

            if (resumeButton != null)
                resumeButton.onClick.AddListener(OnResumeClicked);

            if (quitButton != null)
                quitButton.onClick.AddListener(OnQuitClicked);

            if (restartButton != null)
                restartButton.onClick.AddListener(OnRestartClicked);

            if (mainMenuButton != null)
                mainMenuButton.onClick.AddListener(OnMainMenuClicked);

            if (leaderboardButton != null)
                leaderboardButton.onClick.AddListener(OnLeaderboardClicked);
        }

        private void Update()
        {
            UpdateTimeDisplay();
            UpdateFishingProgress();
            UpdateBossDetection();
        }

        private void UpdateTimeDisplay()
        {
            if (timeText == null) return;
            if (OfficeFishingGameManager.Instance == null) return;
            if (!OfficeFishingGameManager.Instance.IsGameActive) return;

            float remaining = OfficeFishingGameManager.Instance.TimeRemaining;
            int minutes = Mathf.FloorToInt(remaining / 60f);
            int seconds = Mathf.FloorToInt(remaining % 60f);
            timeText.text = $"{minutes:00}:{seconds:00}";

            if (timeWarningImage != null)
            {
                timeWarningImage.enabled = remaining <= warningTimeThreshold;
            }
        }

        private void UpdateFishingProgress()
        {
            if (fishingProgressBar == null) return;
            if (OfficeFishingGameManager.Instance?.FishingManager == null) return;

            var fishingManager = OfficeFishingGameManager.Instance.FishingManager;

            if (fishingManager.IsFishing)
            {
                if (fishingProgressPanel != null)
                {
                    fishingProgressPanel.SetActive(true);
                }

                fishingProgressBar.fillAmount = fishingManager.FishingProgress;

                if (comboText != null && fishingManager.CurrentCombo > 1)
                {
                    comboText.gameObject.SetActive(true);
                    comboText.text = $"x{fishingManager.CurrentCombo}";
                }
                else if (comboText != null)
                {
                    comboText.gameObject.SetActive(false);
                }
            }
            else
            {
                if (fishingProgressPanel != null)
                {
                    fishingProgressPanel.SetActive(false);
                }
            }
        }

        private void UpdateBossDetection()
        {
            if (bossWarningPanel == null || bossDetectionBar == null) return;
            if (OfficeFishingGameManager.Instance?.BossController == null) return;

            var bossController = OfficeFishingGameManager.Instance.BossController;

            if (bossController.DetectionProgress > 0f)
            {
                bossWarningPanel.SetActive(true);
                bossDetectionBar.fillAmount = bossController.DetectionProgress;
            }
            else
            {
                bossWarningPanel.SetActive(false);
            }
        }

        private void OnHealthChanged(GameEvents.HealthChanged evt)
        {
            UpdateHealthDisplay(evt.NewHealth, evt.MaxHealth);
        }

        private void OnScoreChanged(GameEvents.ScoreChanged evt)
        {
            UpdateScoreDisplay(evt.NewScore);

            if (evt.Delta > 0 && scoreAnimator != null)
            {
                scoreAnimator.SetTrigger(scorePopupTrigger);
            }
        }

        private void OnFishingStarted(GameEvents.FishingStarted evt)
        {
            if (fishingActionText != null)
            {
                fishingActionText.text = evt.ActionName;
            }
        }

        private void OnFishingCompleted(GameEvents.FishingCompleted evt)
        {
        }

        private void OnFishingInterrupted(GameEvents.FishingInterrupted evt)
        {
            if (fishingProgressPanel != null)
            {
                fishingProgressPanel.SetActive(false);
            }
        }

        private void OnPlayerCaught(GameEvents.PlayerCaught evt)
        {
            if (bossWarningPanel != null)
            {
                bossWarningPanel.SetActive(false);
            }
        }

        private void OnGameOver(GameEvents.GameOver evt)
        {
            ShowGameOver(evt.FinalScore);
        }

        public void UpdateHealthDisplay(int currentHealth, int maxHealth)
        {
            if (healthHearts == null || healthHearts.Length == 0) return;

            for (int i = 0; i < healthHearts.Length; i++)
            {
                if (i < currentHealth)
                {
                    healthHearts[i].sprite = fullHeartSprite;
                }
                else
                {
                    healthHearts[i].sprite = emptyHeartSprite;
                }

                healthHearts[i].gameObject.SetActive(i < maxHealth);
            }
        }

        public void UpdateScoreDisplay(int score)
        {
            if (scoreText != null)
            {
                scoreText.text = score.ToString("N0");
            }
        }

        private void OnPauseClicked()
        {
            GameManager.Instance.PauseGame();
            if (pausePanel != null)
            {
                pausePanel.SetActive(true);
            }
        }

        private void OnResumeClicked()
        {
            if (pausePanel != null)
            {
                pausePanel.SetActive(false);
            }
            GameManager.Instance.ResumeGame();
        }

        private void OnQuitClicked()
        {
            GameManager.Instance.ReturnToMainMenu();
            SceneLoader.Instance.LoadMainMenu();
        }

        private void OnRestartClicked()
        {
            OfficeFishingGameManager.Instance.ResetGame();
            SceneLoader.Instance.ReloadCurrentScene();
        }

        private void OnMainMenuClicked()
        {
            OfficeFishingGameManager.Instance.ResetGame();
            GameManager.Instance.ReturnToMainMenu();
            SceneLoader.Instance.LoadMainMenu();
        }

        private void OnLeaderboardClicked()
        {
            if (LeaderboardController.Instance != null)
            {
                LeaderboardController.Instance.Show();
            }
        }

        public void ShowGameOver(int finalScore)
        {
            if (gameOverPanel != null)
            {
                gameOverPanel.SetActive(true);
            }

            if (finalScoreText != null)
            {
                finalScoreText.text = $"本次摸鱼值: {finalScore:N0}";
            }

            var gameManager = OfficeFishingGameManager.Instance;
            if (gameManager != null)
            {
                int highScore = gameManager.HighScore;
                bool isNewHigh = finalScore >= highScore && finalScore > 0;

                if (highScoreText != null)
                {
                    highScoreText.text = isNewHigh ? $"历史最高: {finalScore:N0}" : $"历史最高: {highScore:N0}";
                }

                if (isNewHighScoreText != null)
                {
                    isNewHighScoreText.gameObject.SetActive(isNewHigh);
                    if (isNewHigh)
                    {
                        isNewHighScoreText.text = "🎉 新纪录！";
                    }
                }
            }
        }

        public void HideAllPanels()
        {
            if (pausePanel != null)
                pausePanel.SetActive(false);

            if (gameOverPanel != null)
                gameOverPanel.SetActive(false);

            if (fishingProgressPanel != null)
                fishingProgressPanel.SetActive(false);

            if (bossWarningPanel != null)
                bossWarningPanel.SetActive(false);
        }

        public void ResetHUD()
        {
            HideAllPanels();

            if (scoreText != null)
                scoreText.text = "0";

            if (timeText != null)
                timeText.text = "02:00";

            var gameManager = OfficeFishingGameManager.Instance;
            if (gameManager != null)
            {
                UpdateHealthDisplay(gameManager.startHealth, gameManager.maxHealth);
            }
        }
    }
}
