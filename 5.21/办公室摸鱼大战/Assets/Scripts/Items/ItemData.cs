using System;
using UnityEngine;

namespace OfficeFishing.Items
{
    public enum ItemType
    {
        SlowBoss,
        Invisibility,
        ScoreBoost,
        TimeExtend,
        Heal
    }

    [Serializable]
    public class ItemData
    {
        public string itemId;
        public string itemName;
        public ItemType type;
        public Sprite icon;
        public float duration;
        public float value;
        public string description;
        public bool isConsumable = true;
    }

    [Serializable]
    public class ActiveItemEffect
    {
        public ItemType type;
        public float remainingTime;
        public float value;
        public Action onEnd;

        public ActiveItemEffect(ItemType type, float duration, float value, Action onEnd = null)
        {
            this.type = type;
            this.remainingTime = duration;
            this.value = value;
            this.onEnd = onEnd;
        }
    }
}
