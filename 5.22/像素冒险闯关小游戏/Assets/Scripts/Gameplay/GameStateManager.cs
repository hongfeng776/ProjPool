using UnityEngine;
using PixelAdventure.Core;
using PixelAdventure.Levels;
using PixelAdventure.Items;
using PixelAdventure.Managers;

namespace PixelAdventure.Gameplay
{
    public enum GameState
    {
        None,
        Playing,
        Paused,
        LevelComplete,
        GameOver
    }

    public class GameStateManager : Singleton<GameStateManager>
    {
        [Header("状态设置")]
        [SerializeField] private GameState currentState = GameState.None;

        [Header("胜利条件")]
        [SerializeField] private bool useScoreTarget = true;
        [SerializeField] private bool useCoinTarget = false;
        [SerializeField] private bool useTimeLimit = false;

        [Header("失败条件")]
        [SerializeField] private bool checkFallDeath = true;
        [SerializeField] private float fallDeathY = -10f;

        private float _stateEnterTime;

        public GameState CurrentState => currentState;
        public float TimeInState => Time.time - _stateEnterTime;

        public System.Action<GameState> OnStateChanged;

        protected override void Awake()
        {
            base.Awake();
        }

        private void Start()
        {
            SubscribeToEvents();
        }

        private void SubscribeToEvents()
        {
            if (LevelManager.Instance != null)
            {
                LevelManager.Instance.OnLevelStart += OnLevelStart;
                LevelManager.Instance.OnLevelComplete += OnLevelComplete;
                LevelManager.Instance.OnLevelFail += OnLevelFail;
                LevelManager.Instance.OnGameOver += OnGameOver;
                LevelManager.Instance.OnPauseChanged += OnPauseChanged;
            }
        }

        private void Update()
        {
            if (currentState == GameState.Playing)
            {
                CheckWinConditions();
                CheckLoseConditions();
            }

            if (Input.GetKeyDown(KeyCode.Escape))
            {
                if (currentState == GameState.Playing)
                {
                    LevelManager.Instance?.PauseGame();
                }
                else if (currentState == GameState.Paused)
                {
                    LevelManager.Instance?.ResumeGame();
                }
            }
        }

        private void OnLevelStart(LevelData level)
        {
            ChangeState(GameState.Playing);
        }

        private void OnLevelComplete(LevelData level)
        {
            ChangeState(GameState.LevelComplete);
        }

        private void OnLevelFail(LevelData level)
        {
            ChangeState(GameState.GameOver);
        }

        private void OnGameOver()
        {
            ChangeState(GameState.GameOver);
        }

        private void OnPauseChanged(bool isPaused)
        {
            ChangeState(isPaused ? GameState.Paused : GameState.Playing);
        }

        private void ChangeState(GameState newState)
        {
            if (currentState == newState) return;

            GameState oldState = currentState;
            currentState = newState;
            _stateEnterTime = Time.time;

            Debug.Log($"[GameStateManager] 状态变化: {oldState} -> {newState}");

            OnStateChanged?.Invoke(newState);
        }

        private void CheckWinConditions()
        {
            if (LevelManager.Instance == null || LevelManager.Instance.CurrentLevel == null) return;

            LevelData level = LevelManager.Instance.CurrentLevel;
            bool allConditionsMet = true;

            if (useScoreTarget && level.targetScore > 0)
            {
                int score = ItemManager.Instance != null ? ItemManager.Instance.TotalValueCollected : 0;
                if (score < level.targetScore)
                {
                    allConditionsMet = false;
                }
            }

            if (useCoinTarget && level.coinsRequired > 0)
            {
                int coins = ItemManager.Instance != null ? ItemManager.Instance.GetItemCount(ItemType.Coin) : 0;
                if (coins < level.coinsRequired)
                {
                    allConditionsMet = false;
                }
            }

            if (allConditionsMet && (useScoreTarget || useCoinTarget))
            {
                LevelManager.Instance.CompleteLevel();
            }
        }

        private void CheckLoseConditions()
        {
            if (checkFallDeath && Player.PlayerController.Instance != null)
            {
                if (Player.PlayerController.Instance.transform.position.y < fallDeathY)
                {
                    LevelManager.Instance.FailLevel("掉落深渊");
                }
            }
        }

        public void RestartGame()
        {
            if (LevelManager.Instance != null)
            {
                LevelManager.Instance.RestartLevel();
            }
            else
            {
                SceneLoader.Instance.ReloadCurrentScene();
            }
        }

        public void ReturnToMainMenu()
        {
            if (LevelManager.Instance != null)
            {
                LevelManager.Instance.ResumeGame();
            }

            if (ItemManager.Instance != null)
            {
                ItemManager.Instance.ResetAllCounts();
            }

            SceneLoader.Instance.LoadMainMenu();
        }

        public void NextLevel()
        {
            if (LevelManager.Instance == null || LevelManager.Instance.AllLevels == null) return;

            int currentIndex = System.Array.IndexOf(LevelManager.Instance.AllLevels, LevelManager.Instance.CurrentLevel);
            int nextIndex = currentIndex + 1;

            if (nextIndex < LevelManager.Instance.AllLevels.Length)
            {
                if (ItemManager.Instance != null)
                {
                    ItemManager.Instance.ResetAllCounts();
                }

                LevelManager.Instance.StartLevel(nextIndex);
            }
            else
            {
                ReturnToMainMenu();
            }
        }

        public void TriggerLevelComplete()
        {
            if (currentState == GameState.Playing && LevelManager.Instance != null)
            {
                LevelManager.Instance.CompleteLevel();
            }
        }

        public void TriggerGameOver(string reason = "")
        {
            if (currentState == GameState.Playing && LevelManager.Instance != null)
            {
                LevelManager.Instance.FailLevel(reason);
            }
        }

        private void OnDestroy()
        {
            if (LevelManager.Instance != null)
            {
                LevelManager.Instance.OnLevelStart -= OnLevelStart;
                LevelManager.Instance.OnLevelComplete -= OnLevelComplete;
                LevelManager.Instance.OnLevelFail -= OnLevelFail;
                LevelManager.Instance.OnGameOver -= OnGameOver;
                LevelManager.Instance.OnPauseChanged -= OnPauseChanged;
            }

            Time.timeScale = 1f;
        }
    }
}
