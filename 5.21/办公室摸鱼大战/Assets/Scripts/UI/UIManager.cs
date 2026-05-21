using UnityEngine;

namespace OfficeFishing.UI
{
    public class UIManager : OfficeFishing.Core.Singleton<UIManager>
    {
        public GameObject MainMenuPanel;
        public GameObject LeaderboardPanel;
        public GameObject SettingsPanel;
        public GameObject LoadingPanel;

        private GameObject _currentActivePanel;

        private void Start()
        {
            ShowMainMenu();
        }

        public void ShowMainMenu()
        {
            SetActivePanel(MainMenuPanel);
        }

        public void ShowLeaderboard()
        {
            SetActivePanel(LeaderboardPanel);
        }

        public void ShowSettings()
        {
            SetActivePanel(SettingsPanel);
        }

        public void ShowLoading()
        {
            SetActivePanel(LoadingPanel);
        }

        public void ShowPanel(GameObject panel)
        {
            SetActivePanel(panel);
        }

        public void HideAllPanels()
        {
            if (MainMenuPanel != null) MainMenuPanel.SetActive(false);
            if (LeaderboardPanel != null) LeaderboardPanel.SetActive(false);
            if (SettingsPanel != null) SettingsPanel.SetActive(false);
            if (LoadingPanel != null) LoadingPanel.SetActive(false);
            _currentActivePanel = null;
        }

        private void SetActivePanel(GameObject panel)
        {
            if (panel == null)
            {
                Debug.LogWarning("[UIManager] Panel is null");
                return;
            }

            if (_currentActivePanel != null && _currentActivePanel != panel)
            {
                _currentActivePanel.SetActive(false);
            }

            panel.SetActive(true);
            _currentActivePanel = panel;
        }
    }
}
