using System;
using System.Collections.Generic;
using UnityEngine;
using OfficeFishing.Core;

namespace OfficeFishing.Items
{
    public class ItemManager : Singleton<ItemManager>
    {
        [Header("道具配置")]
        public List<ItemData> availableItems = new List<ItemData>();

        private Dictionary<ItemType, ActiveItemEffect> _activeEffects = new Dictionary<ItemType, ActiveItemEffect>();
        private Dictionary<ItemType, int> _inventory = new Dictionary<ItemType, int>();

        public event Action<ItemType, float> OnItemActivated;
        public event Action<ItemType> OnItemEnded;
        public event Action<ItemType, int> OnInventoryChanged;

        protected override void Awake()
        {
            base.Awake();
            InitializeInventory();
        }

        private void InitializeInventory()
        {
            foreach (ItemType type in Enum.GetValues(typeof(ItemType)))
            {
                _inventory[type] = 0;
            }
        }

        private void Update()
        {
            UpdateActiveEffects();
        }

        private void UpdateActiveEffects()
        {
            List<ItemType> endedEffects = new List<ItemType>();

            foreach (var kvp in _activeEffects)
            {
                kvp.Value.remainingTime -= Time.deltaTime;
                if (kvp.Value.remainingTime <= 0)
                {
                    endedEffects.Add(kvp.Key);
                }
            }

            foreach (var type in endedEffects)
            {
                EndEffect(type);
            }
        }

        public void AddItem(ItemType type, int count = 1)
        {
            if (_inventory.ContainsKey(type))
            {
                _inventory[type] += count;
            }
            else
            {
                _inventory[type] = count;
            }
            OnInventoryChanged?.Invoke(type, _inventory[type]);
            Debug.Log($"[ItemManager] Added item: {type}, count: {count}, total: {_inventory[type]}");
        }

        public bool UseItem(ItemType type)
        {
            if (!_inventory.ContainsKey(type) || _inventory[type] <= 0)
            {
                Debug.LogWarning($"[ItemManager] No item available: {type}");
                return false;
            }

            ItemData itemData = GetItemData(type);
            if (itemData == null)
            {
                Debug.LogWarning($"[ItemManager] Item data not found: {type}");
                return false;
            }

            _inventory[type]--;
            OnInventoryChanged?.Invoke(type, _inventory[type]);

            ActivateEffect(type, itemData);
            return true;
        }

        private void ActivateEffect(ItemType type, ItemData itemData)
        {
            if (_activeEffects.ContainsKey(type))
            {
                _activeEffects[type].remainingTime = Mathf.Max(_activeEffects[type].remainingTime, itemData.duration);
                _activeEffects[type].value = itemData.value;
            }
            else
            {
                _activeEffects[type] = new ActiveItemEffect(type, itemData.duration, itemData.value);
            }

            ApplyEffect(type, itemData.value);
            OnItemActivated?.Invoke(type, itemData.duration);
            Debug.Log($"[ItemManager] Activated effect: {type}, duration: {itemData.duration}s");
        }

        private void ApplyEffect(ItemType type, float value)
        {
            switch (type)
            {
                case ItemType.SlowBoss:
                    var boss = FindObjectOfType<Gameplay.BossController>();
                    if (boss != null)
                    {
                        boss.ApplySpeedMultiplier(1f - value);
                    }
                    break;
                case ItemType.Invisibility:
                    var player = FindObjectOfType<Gameplay.PlayerController>();
                    if (player != null)
                    {
                        player.SetInvisible(true);
                    }
                    break;
                case ItemType.ScoreBoost:
                    var gameManager = FindObjectOfType<Gameplay.OfficeFishingGameManager>();
                    if (gameManager != null)
                    {
                        gameManager.SetScoreMultiplier(1f + value);
                    }
                    break;
                case ItemType.Heal:
                    var playerHp = FindObjectOfType<Gameplay.PlayerController>();
                    if (playerHp != null)
                    {
                        playerHp.Heal((int)value);
                    }
                    break;
                case ItemType.TimeExtend:
                    var gameTimer = FindObjectOfType<Gameplay.OfficeFishingGameManager>();
                    if (gameTimer != null)
                    {
                        gameTimer.AddTime(value);
                    }
                    break;
            }
        }

        private void EndEffect(ItemType type)
        {
            if (!_activeEffects.ContainsKey(type)) return;

            var effect = _activeEffects[type];
            _activeEffects.Remove(type);

            RemoveEffect(type);
            effect.onEnd?.Invoke();
            OnItemEnded?.Invoke(type);
            Debug.Log($"[ItemManager] Effect ended: {type}");
        }

        private void RemoveEffect(ItemType type)
        {
            switch (type)
            {
                case ItemType.SlowBoss:
                    var boss = FindObjectOfType<Gameplay.BossController>();
                    if (boss != null)
                    {
                        boss.ResetSpeedMultiplier();
                    }
                    break;
                case ItemType.Invisibility:
                    var player = FindObjectOfType<Gameplay.PlayerController>();
                    if (player != null)
                    {
                        player.SetInvisible(false);
                    }
                    break;
                case ItemType.ScoreBoost:
                    var gameManager = FindObjectOfType<Gameplay.OfficeFishingGameManager>();
                    if (gameManager != null)
                    {
                        gameManager.SetScoreMultiplier(1f);
                    }
                    break;
            }
        }

        public bool HasItem(ItemType type)
        {
            return _inventory.ContainsKey(type) && _inventory[type] > 0;
        }

        public int GetItemCount(ItemType type)
        {
            return _inventory.ContainsKey(type) ? _inventory[type] : 0;
        }

        public bool IsEffectActive(ItemType type)
        {
            return _activeEffects.ContainsKey(type);
        }

        public float GetEffectRemainingTime(ItemType type)
        {
            return _activeEffects.ContainsKey(type) ? _activeEffects[type].remainingTime : 0f;
        }

        public ItemData GetItemData(ItemType type)
        {
            return availableItems.Find(item => item.type == type);
        }

        public List<ItemType> GetActiveItemTypes()
        {
            return new List<ItemType>(_activeEffects.Keys);
        }

        public void ClearAllEffects()
        {
            List<ItemType> types = new List<ItemType>(_activeEffects.Keys);
            foreach (var type in types)
            {
                EndEffect(type);
            }
        }

        public void ClearInventory()
        {
            foreach (ItemType type in Enum.GetValues(typeof(ItemType)))
            {
                _inventory[type] = 0;
                OnInventoryChanged?.Invoke(type, 0);
            }
        }
    }
}
