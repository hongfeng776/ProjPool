using UnityEngine;
using System.Collections.Generic;
using PixelAdventure.Core;
using PixelAdventure.Data;

namespace PixelAdventure.Items
{
    public class ItemManager : Singleton<ItemManager>
    {
        [Header("设置")]
        [SerializeField] private bool saveProgress = true;

        private Dictionary<ItemType, int> _itemCounts = new Dictionary<ItemType, int>();
        private List<string> _collectedItemIds = new List<string>();
        private int _totalItemsCollected;
        private int _totalValueCollected;

        public System.Action<ItemType, int> OnItemCountChanged;
        public System.Action<PickupItem> OnItemCollected;
        public System.Action OnCollectionComplete;

        public int TotalItemsCollected => _totalItemsCollected;
        public int TotalValueCollected => _totalValueCollected;
        public IReadOnlyDictionary<ItemType, int> ItemCounts => _itemCounts;

        protected override void Awake()
        {
            base.Awake();
            InitializeItemCounts();
        }

        private void Start()
        {
            LoadProgress();
        }

        private void InitializeItemCounts()
        {
            foreach (ItemType type in System.Enum.GetValues(typeof(ItemType)))
            {
                if (!_itemCounts.ContainsKey(type))
                {
                    _itemCounts[type] = 0;
                }
            }
        }

        public void AddItem(PickupItem item)
        {
            if (item == null || item.IsPickedUp) return;

            ItemType itemType = item.ItemData != null ? item.ItemData.itemType : ItemType.Coin;
            int value = item.ItemData != null ? item.ItemData.value : 1;

            if (!string.IsNullOrEmpty(item.ItemId) && _collectedItemIds.Contains(item.ItemId))
            {
                Debug.LogWarning($"[ItemManager] 道具已收集过: {item.ItemId}");
                return;
            }

            _itemCounts[itemType]++;
            _totalItemsCollected++;
            _totalValueCollected += value;

            if (!string.IsNullOrEmpty(item.ItemId))
            {
                _collectedItemIds.Add(item.ItemId);
            }

            Debug.Log($"[ItemManager] 收集道具 - 类型: {itemType}, 数量: {_itemCounts[itemType]}, 总价值: {_totalValueCollected}");

            OnItemCollected?.Invoke(item);
            OnItemCountChanged?.Invoke(itemType, _itemCounts[itemType]);

            if (saveProgress)
            {
                SaveProgress();
            }
        }

        public int GetItemCount(ItemType type)
        {
            if (_itemCounts.TryGetValue(type, out int count))
            {
                return count;
            }
            return 0;
        }

        public bool HasCollectedItem(string itemId)
        {
            return _collectedItemIds.Contains(itemId);
        }

        public void RemoveItem(ItemType type, int amount = 1)
        {
            if (_itemCounts.TryGetValue(type, out int count) && count >= amount)
            {
                _itemCounts[type] -= amount;
                _totalItemsCollected -= amount;
                OnItemCountChanged?.Invoke(type, _itemCounts[type]);
            }
        }

        public void ResetAllCounts()
        {
            foreach (ItemType type in System.Enum.GetValues(typeof(ItemType)))
            {
                _itemCounts[type] = 0;
                OnItemCountChanged?.Invoke(type, 0);
            }

            _totalItemsCollected = 0;
            _totalValueCollected = 0;
            _collectedItemIds.Clear();

            Debug.Log("[ItemManager] 已重置所有道具计数");
        }

        public void ResetTypeCount(ItemType type)
        {
            if (_itemCounts.TryGetValue(type, out int count))
            {
                _totalItemsCollected -= count;
                _itemCounts[type] = 0;
                OnItemCountChanged?.Invoke(type, 0);
            }
        }

        public string GetFormattedCount(ItemType type)
        {
            return $"{GetItemCount(type):00}";
        }

        private void SaveProgress()
        {
            if (SaveManager.Instance != null && SaveManager.Instance.HasActiveSave)
            {
                SaveManager.Instance.UpdateCoins(GetItemCount(ItemType.Coin));
                SaveManager.Instance.UpdateScore(_totalValueCollected);
            }
        }

        private void LoadProgress()
        {
        }

        public string GetCollectionReport()
        {
            string report = $"道具收集报告:\n";
            report += $"总收集数: {_totalItemsCollected}\n";
            report += $"总价值: {_totalValueCollected}\n\n";

            foreach (var kvp in _itemCounts)
            {
                if (kvp.Value > 0)
                {
                    report += $"{kvp.Key}: {kvp.Value}\n";
                }
            }

            return report;
        }
    }
}
