using System;
using UnityEngine;

namespace OfficeFishing.Levels
{
    [Serializable]
    public class LevelData
    {
        public int levelId;
        public string levelName;
        public string description;
        
        [Header("老板设置")]
        public float bossPatrolSpeed = 3f;
        public float bossCheckInterval = 8f;
        public float bossDetectionRange = 5f;
        public float bossDetectionTime = 1f;
        public int bossPatrolPointCount = 4;
        
        [Header("游戏设置")]
        public int targetScore = 500;
        public float gameDuration = 120f;
        public int startingHealth = 3;
        
        [Header("物品设置")]
        public float itemSpawnInterval = 15f;
        public int maxItemCount = 3;
        
        [Header("奖励设置")]
        public int bonusScore = 100;
        public int unlockItems = 0;
    }
}
