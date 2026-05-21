using System;
using UnityEngine;

namespace OfficeFishing.Gameplay
{
    public enum PlayerState
    {
        Working,
        Fishing,
        GettingCaught
    }

    public enum BossState
    {
        Patrolling,
        Checking,
        Returning
    }

    public enum InteractiveType
    {
        Computer,
        Phone,
        GameConsole,
        Comic,
        Snack,
        Tea,
        Custom
    }

    [Serializable]
    public class FishingAction
    {
        public string actionId;
        public string actionName;
        public InteractiveType type;
        public float duration;
        public int baseScore;
        public float riskLevel;
        public Sprite icon;
        public string description;
    }

    [Serializable]
    public class PatrolPoint
    {
        public Transform point;
        public float waitTime;
        public float detectionRadius;
    }

    public class GameEvents
    {
        public struct FishingStarted
        {
            public string ActionId;
            public string ActionName;
            public float Duration;
        }

        public struct FishingCompleted
        {
            public string ActionId;
            public int ScoreGained;
            public bool WasCaught;
        }

        public struct FishingInterrupted
        {
            public string Reason;
        }

        public struct PlayerCaught
        {
            public int Damage;
            public int RemainingHealth;
        }

        public struct ScoreChanged
        {
            public int NewScore;
            public int Delta;
        }

        public struct HealthChanged
        {
            public int NewHealth;
            public int Delta;
            public int MaxHealth;
        }

        public struct BossStateChanged
        {
            public BossState NewState;
            public BossState OldState;
        }

        public struct GameOver
        {
            public int FinalScore;
        }
    }
}
