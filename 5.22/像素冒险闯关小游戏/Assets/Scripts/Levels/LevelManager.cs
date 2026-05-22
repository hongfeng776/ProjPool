using UnityEngine;
using System.Collections.Generic;
using PixelAdventure.Core;
using PixelAdventure.Data;
using PixelAdventure.Items;
using PixelAdventure.Managers;

namespace PixelAdventure.Levels
{
    public class LevelManager : Singleton<LevelManager>
    {
        [Header("关卡设置")]
        [SerializeField] private LevelData[] allLevels;
        [SerializeField] private LevelData currentLevel;
        [SerializeField] private DifficultyLevel globalDifficulty = DifficultyLevel.Normal;

        [Header("游戏状态")]
        [SerializeField] private bool isLevelActive;
        [SerializeField] private float levelTime;
        [SerializeField] private int currentLives;

        private bool _isPaused;

        public LevelData CurrentLevel => currentLevel;
        public LevelData[] AllLevels => allLevels;
        public DifficultyLevel GlobalDifficulty => globalDifficulty;
        public bool IsLevelActive => isLevelActive;
        public float LevelTime => levelTime;
        public int CurrentLives => currentLives;
        public bool IsPaused => _isPaused;

        public System.Action<LevelData> OnLevelStart;
        public System.Action<LevelData> OnLevelComplete;
        public System.Action<LevelData> OnLevelFail;
        public System.Action OnGameOver;
        public System.Action<bool> OnPauseChanged;

        protected override void Awake()
        {
            base.Awake();
            LoadLevelProgress();
        }

        private void Update()
        {
            if (isLevelActive && !_isPaused)
            {
                levelTime += Time.deltaTime;

                if (currentLevel != null && currentLevel.timeLimit > 0)
                {
                    if (levelTime >= currentLevel.timeLimit)
                    {
                        FailLevel("时间耗尽");
                    }
                }
            }
        }

        public void SetGlobalDifficulty(DifficultyLevel difficulty)
        {
            globalDifficulty = difficulty;
            PlayerPrefs.SetInt("GlobalDifficulty", (int)difficulty);
            PlayerPrefs.Save();
        }

        public void StartLevel(int levelIndex)
        {
            if (levelIndex < 0 || levelIndex >= allLevels.Length)
            {
                Debug.LogError($"[LevelManager] 关卡索引无效: {levelIndex}");
                return;
            }

            LevelData level = allLevels[levelIndex];
            if (!level.isUnlocked)
            {
                Debug.LogWarning($"[LevelManager] 关卡未解锁: {level.levelName}");
                return;
            }

            StartLevel(level);
        }

        public void StartLevel(LevelData level)
        {
            currentLevel = level;
            isLevelActive = true;
            levelTime = 0f;
            currentLives = GetDifficultyAdjustedLives(level);
            _isPaused = false;

            Debug.Log($"[LevelManager] 开始关卡: {level.levelName}, 难度: {level.GetDifficultyText()}");

            OnLevelStart?.Invoke(level);

            if (!string.IsNullOrEmpty(level.sceneName))
            {
                SceneLoader.Instance.LoadScene(level.sceneName, OnLevelSceneLoaded);
            }
        }

        private void OnLevelSceneLoaded()
        {
            Debug.Log("[LevelManager] 关卡场景加载完成");
        }

        private int GetDifficultyAdjustedLives(LevelData level)
        {
            int baseLives = level.playerLives;

            switch (globalDifficulty)
            {
                case DifficultyLevel.Easy: return baseLives + 2;
                case DifficultyLevel.Normal: return baseLives;
                case DifficultyLevel.Hard: return Mathf.Max(1, baseLives - 1);
                case DifficultyLevel.Expert: return 1;
                default: return baseLives;
            }
        }

        public void CompleteLevel()
        {
            if (!isLevelActive || currentLevel == null) return;

            isLevelActive = false;

            int score = ItemManager.Instance != null ? ItemManager.Instance.TotalValueCollected : 0;

            if (score > currentLevel.bestScore)
            {
                currentLevel.bestScore = score;
            }

            if (currentLevel.timeLimit <= 0 || levelTime < currentLevel.bestTime || currentLevel.bestTime <= 0)
            {
                currentLevel.bestTime = levelTime;
            }

            currentLevel.isCompleted = true;

            UnlockNextLevel();
            SaveLevelProgress();

            Debug.Log($"[LevelManager] 关卡完成! 得分: {score}, 用时: {levelTime:F1}秒");

            OnLevelComplete?.Invoke(currentLevel);
        }

        public void FailLevel(string reason = "")
        {
            if (!isLevelActive || currentLevel == null) return;

            currentLives--;

            if (currentLives <= 0)
            {
                isLevelActive = false;
                Debug.Log($"[LevelManager] 关卡失败: {reason}");
                OnLevelFail?.Invoke(currentLevel);
                OnGameOver?.Invoke();
            }
            else
            {
                Debug.Log($"[LevelManager] 失去一条生命，剩余: {currentLives}");
                RespawnPlayer();
            }
        }

        private void RespawnPlayer()
        {
            if (Player.PlayerController.Instance != null && currentLevel != null)
            {
                Player.PlayerController.Instance.Teleport(currentLevel.playerSpawnPosition);
            }
        }

        public void RestartLevel()
        {
            if (currentLevel == null) return;

            Debug.Log("[LevelManager] 重新开始关卡");

            if (ItemManager.Instance != null)
            {
                ItemManager.Instance.ResetAllCounts();
            }

            StartLevel(currentLevel);
        }

        public void PauseGame()
        {
            if (!isLevelActive) return;

            _isPaused = true;
            Time.timeScale = 0f;
            OnPauseChanged?.Invoke(true);
        }

        public void ResumeGame()
        {
            _isPaused = false;
            Time.timeScale = 1f;
            OnPauseChanged?.Invoke(false);
        }

        public void TogglePause()
        {
            if (_isPaused)
            {
                ResumeGame();
            }
            else
            {
                    PauseGame();
            }
        }

        private void UnlockNextLevel()
        {
            int nextIndex = System.Array.IndexOf(allLevels, currentLevel) + 1;
            if (nextIndex < allLevels.Length)
            {
                allLevels[nextIndex].isUnlocked = true;
            }
        }

        public bool IsLevelUnlocked(int levelIndex)
        {
            if (levelIndex < 0 || levelIndex >= allLevels.Length) return false;
            return allLevels[levelIndex].isUnlocked;
        }

        public LevelData GetLevel(int levelIndex)
        {
            if (levelIndex < 0 || levelIndex >= allLevels.Length) return null;
            return allLevels[levelIndex];
        }

        public int GetCompletedLevelCount()
        {
            int count = 0;
            foreach (var level in allLevels)
            {
                if (level.isCompleted) count++;
            }
            return count;
        }

        public int GetTotalStars()
        {
            int total = 0;
            foreach (var level in allLevels)
            {
                total += level.starsCollected;
            }
            return total;
        }

        private void SaveLevelProgress()
        {
            for (int i = 0; i < allLevels.Length; i++)
            {
                string prefix = $"Level_{i}_";
                PlayerPrefs.SetInt(prefix + "Unlocked", allLevels[i].isUnlocked ? 1 : 0);
                PlayerPrefs.SetInt(prefix + "Completed", allLevels[i].isCompleted ? 1 : 0);
                PlayerPrefs.SetInt(prefix + "BestScore", allLevels[i].bestScore);
                PlayerPrefs.SetFloat(prefix + "BestTime", allLevels[i].bestTime);
                PlayerPrefs.SetInt(prefix + "Stars", allLevels[i].starsCollected);
            }
            PlayerPrefs.Save();
        }

        private void LoadLevelProgress()
        {
            for (int i = 0; i < allLevels.Length; i++)
            {
                string prefix = $"Level_{i}_";
                allLevels[i].isUnlocked = PlayerPrefs.GetInt(prefix + "Unlocked", i == 0 ? 1 : 0) == 1;
                allLevels[i].isCompleted = PlayerPrefs.GetInt(prefix + "Completed", 0) == 1;
                allLevels[i].bestScore = PlayerPrefs.GetInt(prefix + "BestScore", 0);
                allLevels[i].bestTime = PlayerPrefs.GetFloat(prefix + "BestTime", 0f);
                allLevels[i].starsCollected = PlayerPrefs.GetInt(prefix + "Stars", 0);
            }

            globalDifficulty = (DifficultyLevel)PlayerPrefs.GetInt("GlobalDifficulty", (int)DifficultyLevel.Normal);
        }

        public void ResetAllProgress()
        {
            PlayerPrefs.DeleteAll();
            LoadLevelProgress();
            Debug.Log("[LevelManager] 所有进度已重置");
        }

        private void OnDestroy()
        {
            Time.timeScale = 1f;
        }
    }
}
