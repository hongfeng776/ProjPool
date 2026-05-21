using UnityEngine;
using UnityEngine.UI;
using OfficeFishing.Core;

namespace OfficeFishing.UI
{
    public class MainMenuController : MonoBehaviour
    {
        [Header("Buttons")]
        public Button startGameButton;
        public Button leaderboardButton;
        public Button settingsButton;
        public Button quitButton;

        [Header("UI Manager")]
        public UIManager uiManager;

        private void Start()
        {
            if (startGameButton != null)
                startGameButton.onClick.AddListener(OnStartGameClicked);

            if (leaderboardButton != null)
                leaderboardButton.onClick.AddListener(OnLeaderboardClicked);

            if (settingsButton != null)
                settingsButton.onClick.AddListener(OnSettingsClicked);

            if (quitButton != null)
                quitButton.onClick.AddListener(OnQuitClicked);
        }

        private void OnDestroy()
        {
            if (startGameButton != null)
                startGameButton.onClick.RemoveListener(OnStartGameClicked);

            if (leaderboardButton != null)
                leaderboardButton.onClick.RemoveListener(OnLeaderboardClicked);

            if (settingsButton != null)
                settingsButton.onClick.RemoveListener(OnSettingsClicked);

            if (quitButton != null)
                quitButton.onClick.RemoveListener(OnQuitClicked);
        }

        private void OnStartGameClicked()
        {
            Debug.Log("[MainMenu] Start Game clicked");
            GameManager.Instance.StartGame();
        }

        private void OnLeaderboardClicked()
        {
            Debug.Log("[MainMenu] Leaderboard clicked");
            if (uiManager != null)
            {
                uiManager.ShowLeaderboard();
            }
        }

        private void OnSettingsClicked()
        {
            Debug.Log("[MainMenu] Settings clicked");
            if (uiManager != null)
            {
                uiManager.ShowSettings();
            }
        }

        private void OnQuitClicked()
        {
            Debug.Log("[MainMenu] Quit clicked");

#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
            Application.Quit();
#endif
        }
    }
}
