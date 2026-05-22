using UnityEngine;
using UnityEngine.UI;
using PlantSandbox.Core;

namespace PlantSandbox.UI
{
    public class MainMenuUI : MonoBehaviour
    {
        [Header("UI 引用")]
        public Button startButton;
        public Button quitButton;
        public Button settingsButton;
        public GameObject settingsPanel;

        private void Start()
        {
            if (startButton != null)
                startButton.onClick.AddListener(OnStartClicked);
            
            if (quitButton != null)
                quitButton.onClick.AddListener(OnQuitClicked);
            
            if (settingsButton != null)
                settingsButton.onClick.AddListener(OnSettingsClicked);
        }

        private void OnStartClicked()
        {
            if (SceneLoader.Instance != null)
            {
                SceneLoader.Instance.LoadScene("MainScene");
            }
            else
            {
                UnityEngine.SceneManagement.SceneManager.LoadScene("MainScene");
            }
        }

        private void OnQuitClicked()
        {
            if (SceneLoader.Instance != null)
            {
                SceneLoader.Instance.QuitGame();
            }
            else
            {
                Application.Quit();
            }
        }

        private void OnSettingsClicked()
        {
            if (settingsPanel != null)
            {
                settingsPanel.SetActive(!settingsPanel.activeSelf);
            }
        }
    }
}
