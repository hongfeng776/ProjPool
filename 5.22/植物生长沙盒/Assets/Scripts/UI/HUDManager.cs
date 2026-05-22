using UnityEngine;
using UnityEngine.UI;
using TMPro;
using PlantSandbox.Core;

namespace PlantSandbox.UI
{
    public class HUDManager : MonoBehaviour
    {
        [Header("资源显示")]
        public TextMeshProUGUI waterText;
        public TextMeshProUGUI sunlightText;
        public TextMeshProUGUI nutrientsText;

        [Header("进度条")]
        public Slider waterSlider;
        public Slider sunlightSlider;
        public Slider nutrientsSlider;

        [Header("游戏时间")]
        public TextMeshProUGUI timeText;

        [Header("按钮")]
        public Button pauseButton;
        public Button menuButton;
        public GameObject pausePanel;

        private bool isPaused = false;

        private void Start()
        {
            if (pauseButton != null)
                pauseButton.onClick.AddListener(TogglePause);
            
            if (menuButton != null)
                menuButton.onClick.AddListener(ReturnToMenu);

            InitializeSliders();
        }

        private void Update()
        {
            UpdateHUD();
        }

        private void InitializeSliders()
        {
            if (waterSlider != null) waterSlider.maxValue = 200;
            if (sunlightSlider != null) sunlightSlider.maxValue = 200;
            if (nutrientsSlider != null) nutrientsSlider.maxValue = 200;
        }

        private void UpdateHUD()
        {
            if (GameManager.Instance == null) return;

            if (waterText != null)
                waterText.text = $"水: {GameManager.Instance.water}";
            
            if (sunlightText != null)
                sunlightText.text = $"光: {GameManager.Instance.sunlight}";
            
            if (nutrientsText != null)
                nutrientsText.text = $"养分: {GameManager.Instance.nutrients}";

            if (waterSlider != null)
                waterSlider.value = GameManager.Instance.water;
            
            if (sunlightSlider != null)
                sunlightSlider.value = GameManager.Instance.sunlight;
            
            if (nutrientsSlider != null)
                nutrientsSlider.value = GameManager.Instance.nutrients;

            if (timeText != null)
            {
                int minutes = Mathf.FloorToInt(GameManager.Instance.gameTime / 60);
                int seconds = Mathf.FloorToInt(GameManager.Instance.gameTime % 60);
                timeText.text = $"时间: {minutes:00}:{seconds:00}";
            }
        }

        private void TogglePause()
        {
            isPaused = !isPaused;
            
            if (GameManager.Instance != null)
            {
                if (isPaused)
                    GameManager.Instance.PauseGame();
                else
                    GameManager.Instance.ResumeGame();
            }
            else
            {
                Time.timeScale = isPaused ? 0f : 1f;
            }

            if (pausePanel != null)
                pausePanel.SetActive(isPaused);
        }

        private void ReturnToMenu()
        {
            Time.timeScale = 1f;
            
            if (SceneLoader.Instance != null)
            {
                SceneLoader.Instance.LoadScene("MenuScene");
            }
            else
            {
                UnityEngine.SceneManagement.SceneManager.LoadScene("MenuScene");
            }
        }
    }
}
