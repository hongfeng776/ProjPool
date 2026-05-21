using UnityEngine;
using OfficeFishing.Core;
using OfficeFishing.Database;

namespace OfficeFishing.Gameplay
{
    public class OfficeFishingGameManager : Singleton<OfficeFishingGameManager>
    {
        [Header("游戏设置")]
        public int maxHealth = 3;
        public int startHealth = 3;
        public float gameTime = 120f;
        public bool enableTimer = true;

        [Header("伤害设置")]
        public int baseDamage = 1;
        public float scorePenaltyOnCaught = 0.1f;

        [Header("引用")]
        public PlayerController PlayerController;
        public BossController BossController;
        public FishingManager FishingManager;

        private int _currentHealth;
        private int _currentScore;
        private float _currentTime;
        private bool _isGameActive;
        private bool _isPaused;
        private float _scoreMultiplier = 1f;

        private PlayerRepository _playerRepository;
        private LeaderboardRepository _leaderboardRepository;
        private int _playerId;
        private int _highScore;

        public int CurrentHealth
        {
            get => _currentHealth;
            private set
            {
                int delta = value - _currentHealth;
                _currentHealth = Mathf.Clamp(value, 0, maxHealth);
                EventSystem.Instance.Publish(new GameEvents.HealthChanged
                {
                    NewHealth = _currentHealth,
                    Delta = delta,
                    MaxHealth = maxHealth
                });
            }
        }

        public int CurrentScore
        {
            get => _currentScore;
            private set
            {
                int delta = value - _currentScore;
                _currentScore = Mathf.Max(0, value);
                EventSystem.Instance.Publish(new GameEvents.ScoreChanged
                {
                    NewScore = _currentScore,
                    Delta = delta
                });
            }
        }

        public float CurrentTime => _currentTime;
        public float TimeRemaining => enableTimer ? Mathf.Max(0, gameTime - _currentTime) : 0f;
        public bool IsGameActive => _isGameActive;
        public bool IsPaused => _isPaused;
        public int HighScore => _highScore;
        public float ScoreMultiplier => _scoreMultiplier;

        protected override void Awake()
        {
            base.Awake();
            InitializeRepositories();
        }

        private void Start()
        {
            GameManager.Instance.OnGameStateChanged += OnGameStateChanged;
        }

        private void OnGameStateChanged(GameManager.GameState state)
        {
            if (state == GameManager.GameState.Playing)
            {
                StartGame();
            }
            else if (state == GameManager.GameState.Paused)
            {
                PauseGame();
            }
            else if (state == GameManager.GameState.MainMenu || state == GameManager.GameState.GameOver)
            {
                EndGame();
            }
        }

        private void InitializeRepositories()
        {
            _playerRepository = new PlayerRepository();
            _leaderboardRepository = new LeaderboardRepository();
        }

        public void StartGame()
        {
            if (_isGameActive) return;

            _isGameActive = true;
            _isPaused = false;
            _currentHealth = startHealth;
            _currentScore = 0;
            _currentTime = 0f;
            _scoreMultiplier = 1f;

            var settingsRepo = new SettingsRepository();
            string playerName = settingsRepo.GetSetting("PlayerName", "摸鱼达人");
            _playerId = _playerRepository.AddOrUpdatePlayer(playerName);
            var playerRecord = _playerRepository.GetPlayerById(_playerId);
            _highScore = playerRecord?.HighScore ?? 0;

            if (PlayerController != null)
            {
                PlayerController.ResetPlayer();
            }

            if (FishingManager != null)
            {
                FishingManager.ResetManager();
            }

            if (BossController != null)
            {
                BossController.StartPatrol();
            }

            Debug.Log("[OfficeFishingGameManager] Game started!");
        }

        public void PauseGame()
        {
            _isPaused = true;

            if (BossController != null)
            {
                BossController.PausePatrol();
            }

            Time.timeScale = 0f;
        }

        public void ResumeGame()
        {
            _isPaused = false;
            Time.timeScale = 1f;

            if (BossController != null)
            {
                BossController.ResumePatrol();
            }
        }

        public void EndGame()
        {
            if (!_isGameActive) return;

            _isGameActive = false;
            _isPaused = false;

            SaveScoreToDatabase();

            if (BossController != null)
            {
                BossController.PausePatrol();
            }

            if (FishingManager != null)
            {
                FishingManager.StopFishing(false);
            }

            EventSystem.Instance.Publish(new GameEvents.GameOver
            {
                FinalScore = _currentScore
            });

            Debug.Log($"[OfficeFishingGameManager] Game ended! Final score: {_currentScore}");
        }

        private void Update()
        {
            if (!_isGameActive || _isPaused) return;
            if (GameManager.Instance.CurrentState != GameManager.GameState.Playing) return;

            if (enableTimer)
            {
                _currentTime += Time.deltaTime;
                if (_currentTime >= gameTime)
                {
                    OnTimeUp();
                }
            }
        }

        private void OnTimeUp()
        {
            GameManager.Instance.ChangeGameState(GameManager.GameState.GameOver);
        }

        public void AddScore(int amount)
        {
            if (!_isGameActive) return;
            int finalAmount = Mathf.RoundToInt(amount * _scoreMultiplier);
            CurrentScore += finalAmount;
        }

        public void RemoveScore(int amount)
        {
            if (!_isGameActive) return;
            CurrentScore -= amount;
        }

        public void OnPlayerCaught()
        {
            if (!_isGameActive) return;

            CurrentHealth -= baseDamage;

            int penalty = Mathf.RoundToInt(_currentScore * scorePenaltyOnCaught);
            if (penalty > 0)
            {
                RemoveScore(penalty);
            }

            if (FishingManager != null)
            {
                FishingManager.StopFishing(true);
            }

            if (PlayerController != null)
            {
                PlayerController.OnCaught();
            }

            EventSystem.Instance.Publish(new GameEvents.PlayerCaught
            {
                Damage = baseDamage,
                RemainingHealth = _currentHealth
            });

            if (_currentHealth <= 0)
            {
                GameManager.Instance.ChangeGameState(GameManager.GameState.GameOver);
            }
        }

        private void SaveScoreToDatabase()
        {
            if (_playerId <= 0 || _currentScore <= 0) return;

            _playerRepository.UpdatePlayerScore(_playerId, _currentScore);
            _leaderboardRepository.AddScore(_playerId, GetPlayerName(), _currentScore, "Default");

            if (_currentScore > _highScore)
            {
                _highScore = _currentScore;
            }
        }

        private string GetPlayerName()
        {
            var settingsRepo = new SettingsRepository();
            return settingsRepo.GetSetting("PlayerName", "摸鱼达人");
        }

        public void Heal(int amount)
        {
            if (!_isGameActive) return;
            CurrentHealth += amount;
        }

        public void SetMaxHealth(int newMax)
        {
            maxHealth = newMax;
            if (_currentHealth > maxHealth)
            {
                _currentHealth = maxHealth;
            }
        }

        public void SetScoreMultiplier(float multiplier)
        {
            _scoreMultiplier = Mathf.Max(0.1f, multiplier);
            Debug.Log($"[OfficeFishingGameManager] Score multiplier set to: {_scoreMultiplier}");
        }

        public void AddTime(float seconds)
        {
            if (!_isGameActive) return;
            _currentTime = Mathf.Max(0, _currentTime - seconds);
            Debug.Log($"[OfficeFishingGameManager] Added {seconds} seconds, time remaining: {TimeRemaining:F1}s");
        }

        public void SetGameDuration(float duration)
        {
            gameTime = duration;
            Debug.Log($"[OfficeFishingGameManager] Game duration set to: {duration}s");
        }

        public void SetTargetScore(int score)
        {
            Debug.Log($"[OfficeFishingGameManager] Target score set to: {score}");
        }

        public void ResetGame()
        {
            _isGameActive = false;
            _isPaused = false;
            _currentHealth = startHealth;
            _currentScore = 0;
            _currentTime = 0f;
            _scoreMultiplier = 1f;

            if (FishingManager != null)
            {
                FishingManager.ResetManager();
            }

            if (PlayerController != null)
            {
                PlayerController.ResetPlayer();
            }

            Time.timeScale = 1f;
        }

        protected override void OnDestroy()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnGameStateChanged -= OnGameStateChanged;
            }
            base.OnDestroy();
        }
    }
}
