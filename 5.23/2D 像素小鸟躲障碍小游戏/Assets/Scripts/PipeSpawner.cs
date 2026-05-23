using UnityEngine;
using System.Collections;

public class PipeSpawner : MonoBehaviour
{
    [Header("管道设置")]
    public GameObject pipePrefab;
    public float spawnRate = 2f;
    public float minY = -2.5f;
    public float maxY = 2.5f;
    public float spawnXPosition = 12f;

    [Header("难度设置")]
    public float difficultyIncreaseInterval = 10f;
    public float spawnRateDecrease = 0.1f;
    public float minSpawnRate = 0.8f;
    public float gapHeightDecrease = 0.1f;
    public float minGapHeight = 2f;

    private float currentSpawnRate;
    private float currentGapHeight;
    private float difficultyTimer;
    private Coroutine spawnCoroutine;

    void Start()
    {
        currentSpawnRate = spawnRate;
        currentGapHeight = 3f;
        spawnCoroutine = StartCoroutine(SpawnPipes());
    }

    IEnumerator SpawnPipes()
    {
        while (true)
        {
            if (GameManager.Instance != null && GameManager.Instance.IsPlaying)
            {
                SpawnPipe();
                UpdateDifficulty();
            }
            yield return new WaitForSeconds(currentSpawnRate);
        }
    }

    void SpawnPipe()
    {
        if (pipePrefab == null)
        {
            Debug.LogWarning("Pipe prefab is not assigned!");
            return;
        }

        float randomY = Random.Range(minY, maxY);
        Vector2 spawnPosition = new Vector2(spawnXPosition, randomY);
        
        GameObject newPipe = Instantiate(pipePrefab, spawnPosition, Quaternion.identity);
        
        Pipe pipeScript = newPipe.GetComponent<Pipe>();
        if (pipeScript != null)
        {
            pipeScript.gapHeight = currentGapHeight;
        }
    }

    void UpdateDifficulty()
    {
        difficultyTimer += currentSpawnRate;
        
        if (difficultyTimer >= difficultyIncreaseInterval)
        {
            difficultyTimer = 0f;
            
            if (currentSpawnRate > minSpawnRate)
            {
                currentSpawnRate -= spawnRateDecrease;
                currentSpawnRate = Mathf.Max(currentSpawnRate, minSpawnRate);
            }
            
            if (currentGapHeight > minGapHeight)
            {
                currentGapHeight -= gapHeightDecrease;
                currentGapHeight = Mathf.Max(currentGapHeight, minGapHeight);
            }
        }
    }

    public void ClearAllPipes()
    {
        Pipe[] pipes = FindObjectsOfType<Pipe>();
        foreach (Pipe pipe in pipes)
        {
            if (pipe != null && pipe.gameObject != null)
            {
                Destroy(pipe.gameObject);
            }
        }
    }

    public void ResetSpawner()
    {
        currentSpawnRate = spawnRate;
        currentGapHeight = 3f;
        difficultyTimer = 0f;
        ClearAllPipes();
    }

    void OnDestroy()
    {
        if (spawnCoroutine != null)
        {
            StopCoroutine(spawnCoroutine);
        }
    }
}
