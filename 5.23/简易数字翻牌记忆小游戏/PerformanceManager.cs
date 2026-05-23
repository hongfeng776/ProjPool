using UnityEngine;
using System.Collections.Generic;

public class PerformanceManager : MonoBehaviour
{
    public static PerformanceManager Instance { get; private set; }
    
    [Header("帧率设置")]
    public int targetFrameRate = 60;
    public bool vSyncEnabled = true;
    
    [Header("内存优化")]
    public bool enableObjectPooling = true;
    public int initialCardPoolSize = 24;
    
    [Header("性能统计")]
    public bool showFPS = false;
    public float fpsUpdateInterval = 0.5f;
    
    private float fpsTimer;
    private int fpsFrameCount;
    private float currentFPS;
    
    private Queue<GameObject> cardObjectPool = new Queue<GameObject>();
    private GameObject cardPoolPrefab;
    private Transform cardPoolParent;
    
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
            return;
        }
        
        InitializePerformanceSettings();
    }
    
    private void InitializePerformanceSettings()
    {
        QualitySettings.vSyncCount = vSyncEnabled ? 1 : 0;
        Application.targetFrameRate = targetFrameRate;
        
        QualitySettings.maxQueuedFrames = 2;
        
        System.GC.Collect();
    }
    
    private void Update()
    {
        if (showFPS)
        {
            CalculateFPS();
        }
    }
    
    private void CalculateFPS()
    {
        fpsTimer += Time.unscaledDeltaTime;
        fpsFrameCount++;
        
        if (fpsTimer >= fpsUpdateInterval)
        {
            currentFPS = fpsFrameCount / fpsTimer;
            fpsTimer = 0f;
            fpsFrameCount = 0;
        }
    }
    
    public void InitializeCardPool(GameObject prefab, Transform parent, int size = 24)
    {
        if (!enableObjectPooling) return;
        
        cardPoolPrefab = prefab;
        cardPoolParent = parent;
        
        for (int i = 0; i < size; i++)
        {
            GameObject card = CreateNewCard();
            card.SetActive(false);
            cardObjectPool.Enqueue(card);
        }
    }
    
    public GameObject GetCardFromPool()
    {
        if (!enableObjectPooling || cardObjectPool.Count == 0)
        {
            return CreateNewCard();
        }
        
        GameObject card = cardObjectPool.Dequeue();
        card.SetActive(true);
        return card;
    }
    
    public void ReturnCardToPool(GameObject card)
    {
        if (!enableObjectPooling)
        {
            Destroy(card);
            return;
        }
        
        card.SetActive(false);
        cardObjectPool.Enqueue(card);
    }
    
    private GameObject CreateNewCard()
    {
        if (cardPoolPrefab == null) return null;
        
        GameObject card = Instantiate(cardPoolPrefab, cardPoolParent);
        return card;
    }
    
    public void ClearCardPool()
    {
        foreach (GameObject card in cardObjectPool)
        {
            if (card != null)
            {
                Destroy(card);
            }
        }
        cardObjectPool.Clear();
    }
    
    public float GetCurrentFPS()
    {
        return currentFPS;
    }
    
    public void ForceGarbageCollection()
    {
        System.GC.Collect();
        System.GC.WaitForPendingFinalizers();
        System.GC.Collect();
    }
    
    public void SetLowQuality(bool isLowQuality)
    {
        if (isLowQuality)
        {
            QualitySettings.SetQualityLevel(0, true);
            Application.targetFrameRate = 30;
        }
        else
        {
            QualitySettings.SetQualityLevel(2, true);
            Application.targetFrameRate = targetFrameRate;
        }
    }
    
    private void OnGUI()
    {
        if (showFPS)
        {
            GUIStyle style = new GUIStyle();
            style.fontSize = 24;
            style.normal.textColor = Color.white;
            GUI.Label(new Rect(10, 10, 200, 50), $"FPS: {currentFPS:F1}", style);
        }
    }
}
