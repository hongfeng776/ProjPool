using System;
using System.Collections.Generic;
using UnityEngine;
using OfficeFishing.Core;

namespace OfficeFishing.Levels
{
    public class LevelManager : Singleton<LevelManager>
    {
        [Header("关卡配置")]
        public List<LevelData> levels = new List<LevelData>();
        
        private int _currentLevelIndex = 0;
        private int _unlockedLevelIndex = 0;

        public event Action<LevelData> OnLevelChanged;
        public event Action<int> OnLevelUnlocked;

        public LevelData CurrentLevel => GetCurrentLevel();
        public int CurrentLevelIndex => _currentLevelIndex;
        public int UnlockedLevelIndex => _unlockedLevelIndex;
        public int TotalLevels => levels.Count;

        protected override void Awake()
        {
            base.Awake();
            InitializeLevels();
            LoadProgress();
        }

        private void InitializeLevels()
        {
            if (levels.Count == 0)
            {
                CreateDefaultLevels();
            }
        }

        private void CreateDefaultLevels()
        {
            levels.Clear();
            
            for (int i = 1; i <= 10; i++)
            {
                var level = new LevelData
                {
                    levelId = i,
                    levelName = $"第 {i} 关",
                    description = GetLevelDescription(i),
                    bossPatrolSpeed = 2f + i * 0.2f,
                    bossCheckInterval = Mathf.Max(4f, 10f - i * 0.6f),
                    bossDetectionRange = 4f + i * 0.15f,
                    bossDetectionTime = Mathf.Max(0.3f, 1f - i * 0.07f),
                    bossPatrolPointCount = Mathf.Min(8, 4 + i / 2),
                    targetScore = 300 + i * 150,
                    gameDuration = 120f + i * 10f,
                    startingHealth = 3,
                    itemSpawnInterval = Mathf.Max(8f, 15f - i * 0.7f),
                    maxItemCount = Mathf.Min(5, 3 + i / 3),
                    bonusScore = 100 + i * 50
                };
                levels.Add(level);
            }
        }

        private string GetLevelDescription(int level)
        {
            switch (level)
            {
                case 1:
                    return "新手入门，老板巡逻较慢";
                case 2:
                    return "老板开始加快巡逻速度";
                case 3:
                    return "老板检测范围扩大";
                case 4:
                    return "挑战开始，老板更频繁了";
                case 5:
                    return "中等级别，小心被抓";
                case 6:
                    return "老板变得非常敏锐";
                case 7:
                    return "高难度，需要技巧";
                case 8:
                    return "专家级，全神贯注";
                case 9:
                    return "大师级，极限挑战";
                case 10:
                    return "传说级，摸鱼之王";
                default:
                    return "未知关卡";
            }
        }

        public void SelectLevel(int levelIndex)
        {
            if (levelIndex < 0 || levelIndex >= levels.Count)
            {
                Debug.LogError($"[LevelManager] Invalid level index: {levelIndex}");
                return;
            }

            if (levelIndex > _unlockedLevelIndex)
            {
                Debug.LogWarning($"[LevelManager] Level {levelIndex + 1} is locked");
                return;
            }

            _currentLevelIndex = levelIndex;
            OnLevelChanged?.Invoke(CurrentLevel);
            Debug.Log($"[LevelManager] Selected level: {CurrentLevel.levelName}");
        }

        public LevelData GetLevel(int levelIndex)
        {
            if (levelIndex < 0 || levelIndex >= levels.Count)
            {
                return null;
            }
            return levels[levelIndex];
        }

        public LevelData GetCurrentLevel()
        {
            return GetLevel(_currentLevelIndex);
        }

        public void UnlockNextLevel()
        {
            if (_unlockedLevelIndex < levels.Count - 1)
            {
                _unlockedLevelIndex++;
                OnLevelUnlocked?.Invoke(_unlockedLevelIndex);
                SaveProgress();
                Debug.Log($"[LevelManager] Unlocked level: {_unlockedLevelIndex + 1}");
            }
        }

        public bool IsLevelUnlocked(int levelIndex)
        {
            return levelIndex <= _unlockedLevelIndex;
        }

        public void ApplyLevelSettings()
        {
            var level = CurrentLevel;
            if (level == null) return;

            var boss = FindObjectOfType<Gameplay.BossController>();
            if (boss != null)
            {
                boss.SetPatrolSpeed(level.bossPatrolSpeed);
                boss.SetDetectionRange(level.bossDetectionRange);
                boss.SetDetectionTime(level.bossDetectionTime);
            }

            var gameManager = FindObjectOfType<Gameplay.OfficeFishingGameManager>();
            if (gameManager != null)
            {
                gameManager.SetGameDuration(level.gameDuration);
                gameManager.SetTargetScore(level.targetScore);
            }

            Debug.Log($"[LevelManager] Applied settings for level: {level.levelName}");
        }

        private void SaveProgress()
        {
            PlayerPrefs.SetInt("UnlockedLevel", _unlockedLevelIndex);
            PlayerPrefs.Save();
        }

        private void LoadProgress()
        {
            _unlockedLevelIndex = PlayerPrefs.GetInt("UnlockedLevel", 0);
            Debug.Log($"[LevelManager] Loaded progress: unlocked level {_unlockedLevelIndex + 1}");
        }

        public void ResetProgress()
        {
            _unlockedLevelIndex = 0;
            _currentLevelIndex = 0;
            SaveProgress();
            OnLevelChanged?.Invoke(CurrentLevel);
            Debug.Log("[LevelManager] Progress reset");
        }

        public float GetBossSpeedMultiplier()
        {
            var level = CurrentLevel;
            return level != null ? level.bossPatrolSpeed / 2f : 1f;
        }

        public float GetBossFrequencyMultiplier()
        {
            var level = CurrentLevel;
            return level != null ? 8f / level.bossCheckInterval : 1f;
        }
    }
}
