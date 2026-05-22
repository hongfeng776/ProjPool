using UnityEngine;
using System.Collections.Generic;

namespace PixelAdventure.Items
{
    public class ItemSpawner : MonoBehaviour
    {
        [Header("生成设置")]
        [SerializeField] private int itemCount = 10;
        [SerializeField] private bool spawnOnStart = true;
        [SerializeField] private bool randomRotation = true;
        [SerializeField] private float spawnDelay = 0f;

        [Header("生成区域")]
        [SerializeField] private Vector2 spawnAreaMin = new Vector2(-8f, -3f);
        [SerializeField] private Vector2 spawnAreaMax = new Vector2(8f, 3f);
        [SerializeField] private LayerMask obstacleLayer;
        [SerializeField] private float checkRadius = 0.5f;
        [SerializeField] private int maxSpawnAttempts = 10;

        [Header("道具预制体")]
        [SerializeField] private GameObject[] itemPrefabs;
        [SerializeField] private ItemData[] itemDatas;

        [Header("权重设置")]
        [SerializeField] private int[] itemWeights;

        [Header("已生成道具")]
        [SerializeField] private List<GameObject> spawnedItems = new List<GameObject>();

        public int SpawnedCount => spawnedItems.Count;
        public int CollectedCount { get; private set; }

        private void Start()
        {
            if (spawnOnStart)
            {
                if (spawnDelay > 0)
                {
                    Invoke(nameof(SpawnAllItems), spawnDelay);
                }
                else
                {
                    SpawnAllItems();
                }
            }
        }

        public void SpawnAllItems()
        {
            ClearSpawnedItems();

            for (int i = 0; i < itemCount; i++)
            {
                SpawnRandomItem();
            }

            Debug.Log($"[ItemSpawner] 生成了 {spawnedItems.Count} 个道具");
        }

        public void SpawnRandomItem()
        {
            Vector3 spawnPosition = GetValidSpawnPosition();
            if (spawnPosition == Vector3.zero)
            {
                Debug.LogWarning("[ItemSpawner] 无法找到有效的生成位置");
                return;
            }

            int itemIndex = GetRandomItemIndex();
            GameObject itemPrefab = GetItemPrefab(itemIndex);
            ItemData itemData = GetItemData(itemIndex);

            if (itemPrefab != null)
            {
                GameObject spawnedItem = Instantiate(itemPrefab, spawnPosition, GetSpawnRotation(), transform);
                SetupItem(spawnedItem, itemData);
                spawnedItems.Add(spawnedItem);
            }
        }

        private int GetRandomItemIndex()
        {
            if (itemPrefabs == null || itemPrefabs.Length == 0)
            {
                return 0;
            }

            if (itemWeights == null || itemWeights.Length != itemPrefabs.Length)
            {
                return Random.Range(0, itemPrefabs.Length);
            }

            int totalWeight = 0;
            foreach (int weight in itemWeights)
            {
                totalWeight += weight;
            }

            int randomValue = Random.Range(0, totalWeight);
            int cumulativeWeight = 0;

            for (int i = 0; i < itemWeights.Length; i++)
            {
                cumulativeWeight += itemWeights[i];
                if (randomValue < cumulativeWeight)
                {
                    return i;
                }
            }

            return 0;
        }

        private GameObject GetItemPrefab(int index)
        {
            if (itemPrefabs != null && index < itemPrefabs.Length && itemPrefabs[index] != null)
            {
                return itemPrefabs[index];
            }

            return CreateDefaultItemPrefab();
        }

        private ItemData GetItemData(int index)
        {
            if (itemDatas != null && index < itemDatas.Length && itemDatas[index] != null)
            {
                return itemDatas[index];
            }

            return null;
        }

        private GameObject CreateDefaultItemPrefab()
        {
            GameObject defaultItem = new GameObject("PickupItem");
            defaultItem.AddComponent<SpriteRenderer>();
            CircleCollider2D collider = defaultItem.AddComponent<CircleCollider2D>();
            collider.radius = 0.5f;
            collider.isTrigger = true;
            defaultItem.AddComponent<PickupItem>();

            return defaultItem;
        }

        private void SetupItem(GameObject item, ItemData itemData)
        {
            PickupItem pickupItem = item.GetComponent<PickupItem>();
            if (pickupItem != null && itemData != null)
            {
                pickupItem.SetItemData(itemData);
            }
        }

        private Vector3 GetValidSpawnPosition()
        {
            for (int i = 0; i < maxSpawnAttempts; i++)
            {
                Vector3 position = GetRandomPosition();
                if (IsValidPosition(position))
                {
                    return position;
                }
            }

            return Vector3.zero;
        }

        private Vector3 GetRandomPosition()
        {
            float x = Random.Range(spawnAreaMin.x, spawnAreaMax.x);
            float y = Random.Range(spawnAreaMin.y, spawnAreaMax.y);
            return new Vector3(x, y, 0f);
        }

        private bool IsValidPosition(Vector3 position)
        {
            Collider2D hit = Physics2D.OverlapCircle(position, checkRadius, obstacleLayer);
            return hit == null;
        }

        private Quaternion GetSpawnRotation()
        {
            if (randomRotation)
            {
                return Quaternion.Euler(0f, Random.Range(0f, 360f), 0f);
            }
            return Quaternion.identity;
        }

        public void ClearSpawnedItems()
        {
            foreach (GameObject item in spawnedItems)
            {
                if (item != null)
                {
                    Destroy(item);
                }
            }
            spawnedItems.Clear();
            CollectedCount = 0;
        }

        public void RespawnAllItems()
        {
            SpawnAllItems();
        }

        public void SetSpawnArea(Vector2 min, Vector2 max)
        {
            spawnAreaMin = min;
            spawnAreaMax = max;
        }

        private void OnDrawGizmosSelected()
        {
            Gizmos.color = Color.green;
            Vector3 center = (spawnAreaMin + spawnAreaMax) * 0.5f;
            Vector3 size = spawnAreaMax - spawnAreaMin;
            Gizmos.DrawWireCube(center, size);
        }
    }
}
