using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using OfficeFishing.Core;
using OfficeFishing.Database;

namespace OfficeFishing.UI
{
    public class LeaderboardController : MonoBehaviour
    {
        public static LeaderboardController Instance { get; private set; }

        [Header("UI Elements")]
        public GameObject leaderboardEntryPrefab;
        public Transform leaderboardContainer;
        public Button backButton;
        public Button refreshButton;
        public TMP_Dropdown gameModeDropdown;

        [Header("Settings")]
        public int displayCount = 10;

        private LeaderboardRepository _leaderboardRepository;
        private PlayerRepository _playerRepository;
        private List<GameObject> _entryObjects = new List<GameObject>();

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
            _leaderboardRepository = new LeaderboardRepository();
            _playerRepository = new PlayerRepository();

            if (backButton != null)
                backButton.onClick.AddListener(OnBackClicked);

            if (refreshButton != null)
                refreshButton.onClick.AddListener(OnRefreshClicked);

            if (gameModeDropdown != null)
                gameModeDropdown.onValueChanged.AddListener(OnGameModeChanged);

            RefreshLeaderboard();
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }

            if (backButton != null)
                backButton.onClick.RemoveListener(OnBackClicked);

            if (refreshButton != null)
                refreshButton.onClick.RemoveListener(OnRefreshClicked);

            if (gameModeDropdown != null)
                gameModeDropdown.onValueChanged.RemoveListener(OnGameModeChanged);
        }

        public void Show()
        {
            gameObject.SetActive(true);
            RefreshLeaderboard();
        }

        public void Hide()
        {
            gameObject.SetActive(false);
        }

        public void RefreshLeaderboard()
        {
            ClearLeaderboard();

            string gameMode = null;
            if (gameModeDropdown != null && gameModeDropdown.value > 0)
            {
                gameMode = gameModeDropdown.options[gameModeDropdown.value].text;
            }

            var entries = _leaderboardRepository.GetTopScores(displayCount, gameMode);

            foreach (var entry in entries)
            {
                GameObject entryObj = Instantiate(leaderboardEntryPrefab, leaderboardContainer);
                var entryController = entryObj.GetComponent<LeaderboardEntryUI>();
                if (entryController != null)
                {
                    entryController.SetData(entry);
                }
                _entryObjects.Add(entryObj);
            }
        }

        private void ClearLeaderboard()
        {
            foreach (var obj in _entryObjects)
            {
                if (obj != null)
                    Destroy(obj);
            }
            _entryObjects.Clear();
        }

        private void OnBackClicked()
        {
            gameObject.SetActive(false);
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowMainMenu();
            }
        }

        private void OnRefreshClicked()
        {
            RefreshLeaderboard();
        }

        private void OnGameModeChanged(int index)
        {
            RefreshLeaderboard();
        }
    }
}
