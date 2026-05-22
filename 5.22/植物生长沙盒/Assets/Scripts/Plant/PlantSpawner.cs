using UnityEngine;

namespace PlantSandbox.Plant
{
    public class PlantSpawner : MonoBehaviour
    {
        [Header("植物预制体")]
        public GameObject[] plantPrefabs;

        [Header("生成设置")]
        public Transform spawnArea;
        public Vector2 spawnRange = new Vector2(5f, 5f);

        public GameObject SpawnPlant(int plantIndex, Vector3 position)
        {
            if (plantPrefabs == null || plantPrefabs.Length == 0)
            {
                Debug.LogWarning("没有设置植物预制体！");
                return null;
            }

            if (plantIndex < 0 || plantIndex >= plantPrefabs.Length)
            {
                Debug.LogWarning($"植物索引 {plantIndex} 超出范围！");
                return null;
            }

            GameObject plant = Instantiate(plantPrefabs[plantIndex], position, Quaternion.identity);
            return plant;
        }

        public GameObject SpawnRandomPlant()
        {
            Vector3 randomPosition = GetRandomPosition();
            int randomIndex = Random.Range(0, plantPrefabs.Length);
            return SpawnPlant(randomIndex, randomPosition);
        }

        private Vector3 GetRandomPosition()
        {
            Vector3 basePosition = spawnArea != null ? spawnArea.position : transform.position;
            float randomX = Random.Range(-spawnRange.x, spawnRange.x);
            float randomZ = Random.Range(-spawnRange.y, spawnRange.y);
            return new Vector3(basePosition.x + randomX, basePosition.y, basePosition.z + randomZ);
        }

        private void OnDrawGizmosSelected()
        {
            Gizmos.color = Color.green;
            Vector3 center = spawnArea != null ? spawnArea.position : transform.position;
            Gizmos.DrawWireCube(center, new Vector3(spawnRange.x * 2, 0.1f, spawnRange.y * 2));
        }
    }
}
