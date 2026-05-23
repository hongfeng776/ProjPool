using UnityEngine;
using UnityEngine.UI;

public class GameDebugger : MonoBehaviour
{
    [Header("调试面板")]
    public bool showDebugPanel = true;
    public KeyCode toggleKey = KeyCode.F12;
    
    [Header("快捷操作")]
    public KeyCode restartKey = KeyCode.R;
    public KeyCode pauseKey = KeyCode.P;
    public KeyCode scoreAddKey = KeyCode.Equals;
    public KeyCode scoreSubKey = KeyCode.Minus;
    
    [Header("引用检查")]
    public bool autoCheckReferences = true;
    
    private GameObject debugPanel;
    private Text debugText;
    private float fps;
    private float deltaTime;

    void Start()
    {
        if (showDebugPanel)
        {
            CreateDebugPanel();
        }
        
        if (autoCheckReferences)
        {
            CheckGameSetup();
        }
        
        Debug.Log("=== 游戏调试器已启动 ===");
        Debug.Log($"按 {toggleKey} 切换调试面板");
        Debug.Log($"按 {restartKey} 重启游戏");
        Debug.Log($"按 {pauseKey} 暂停/继续");
    }

    void Update()
    {
        if (Input.GetKeyDown(toggleKey))
        {
            ToggleDebugPanel();
        }
        
        if (Input.GetKeyDown(restartKey))
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.RestartGame();
                Debug.Log("快捷键: 重启游戏");
            }
        }
        
        if (Input.GetKeyDown(pauseKey))
        {
            Time.timeScale = Time.timeScale > 0 ? 0 : 1;
            Debug.Log($"游戏{(Time.timeScale > 0 ? "继续" : "暂停")}");
        }
        
        if (GameManager.Instance != null && GameManager.Instance.IsPlaying)
        {
            if (Input.GetKeyDown(scoreAddKey))
            {
                GameManager.Instance.AddScore(10);
                Debug.Log("快捷键: +10分");
            }
            
            if (Input.GetKeyDown(scoreSubKey))
            {
                GameManager.Instance.AddScore(-1);
                Debug.Log("快捷键: -1分");
            }
        }

        if (debugPanel != null && debugPanel.activeSelf)
        {
            UpdateDebugInfo();
        }
    }

    void CreateDebugPanel()
    {
        Canvas canvas = FindObjectOfType<Canvas>();
        if (canvas == null)
        {
            GameObject canvasObj = new GameObject("DebugCanvas");
            canvas = canvasObj.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvasObj.AddComponent<CanvasScaler>();
            canvasObj.AddComponent<GraphicRaycaster>();
        }

        debugPanel = new GameObject("DebugPanel");
        debugPanel.transform.SetParent(canvas.transform, false);
        
        RectTransform panelRect = debugPanel.AddComponent<RectTransform>();
        panelRect.anchorMin = new Vector2(0, 1);
        panelRect.anchorMax = new Vector2(0, 1);
        panelRect.pivot = new Vector2(0, 1);
        panelRect.anchoredPosition = new Vector2(10, -10);
        panelRect.sizeDelta = new Vector2(300, 200);

        Image panelImage = debugPanel.AddComponent<Image>();
        panelImage.color = new Color(0, 0, 0, 0.7f);

        GameObject textObj = new GameObject("DebugText");
        textObj.transform.SetParent(debugPanel.transform, false);
        
        debugText = textObj.AddComponent<Text>();
        debugText.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
        debugText.fontSize = 12;
        debugText.color = Color.white;
        debugText.alignment = TextAnchor.UpperLeft;
        
        RectTransform textRect = debugText.GetComponent<RectTransform>();
        textRect.anchorMin = Vector2.zero;
        textRect.anchorMax = Vector2.one;
        textRect.offsetMin = new Vector2(10, 10);
        textRect.offsetMax = new Vector2(-10, -10);
    }

    void ToggleDebugPanel()
    {
        if (debugPanel == null)
        {
            CreateDebugPanel();
        }
        debugPanel.SetActive(!debugPanel.activeSelf);
    }

    void UpdateDebugInfo()
    {
        deltaTime += (Time.unscaledDeltaTime - deltaTime) * 0.1f;
        fps = 1.0f / deltaTime;

        string debugInfo = "=== 调试信息 ===\n";
        debugInfo += $"FPS: {fps:0.0}\n";
        debugInfo += $"时间缩放: {Time.timeScale:0.00}\n\n";
        
        if (GameManager.Instance != null)
        {
            debugInfo += $"游戏状态: {(GameManager.Instance.IsPlaying ? "进行中" : "等待")}\n";
            debugInfo += $"当前分数: {GameManager.Instance.score}\n";
        }
        else
        {
            debugInfo += "⚠️ GameManager 未找到!\n";
        }

        BirdController bird = FindObjectOfType<BirdController>();
        if (bird != null)
        {
            Rigidbody2D rb = bird.GetComponent<Rigidbody2D>();
            if (rb != null)
            {
                debugInfo += $"小鸟速度: {rb.velocity.y:0.00}\n";
                debugInfo += $"小鸟位置: {bird.transform.position:0.00}\n";
            }
        }

        Pipe[] pipes = FindObjectsOfType<Pipe>();
        debugInfo += $"管道数量: {pipes.Length}\n";

        debugText.text = debugInfo;
    }

    void CheckGameSetup()
    {
        Debug.Log("\n=== 游戏配置检查 ===");
        
        int errorCount = 0;
        
        if (GameManager.Instance == null)
        {
            Debug.LogError("❌ GameManager 未在场景中找到!");
            errorCount++;
        }
        else
        {
            Debug.Log("✅ GameManager 已配置");
            
            if (GameManager.Instance.bird == null)
            {
                Debug.LogWarning("⚠️ GameManager.bird 未赋值!");
                errorCount++;
            }
            else Debug.Log("✅ Bird 引用已配置");
            
            if (GameManager.Instance.pipeSpawner == null)
            {
                Debug.LogWarning("⚠️ GameManager.pipeSpawner 未赋值!");
                errorCount++;
            }
            else Debug.Log("✅ PipeSpawner 引用已配置");
        }
        
        BirdController birdObj = FindObjectOfType<BirdController>();
        if (birdObj == null)
        {
            Debug.LogWarning("⚠️ 场景中未找到小鸟对象!");
            errorCount++;
        }
        else
        {
            Debug.Log("✅ 小鸟对象已配置");
            
            if (birdObj.gameObject.layer == LayerMask.NameToLayer("Bird"))
            {
                Debug.Log("✅ 小鸟层级正确");
            }
            else
            {
                Debug.LogWarning("⚠️ 小鸟层级不是 'Bird'");
            }
        }
        
        PipeSpawner spawner = FindObjectOfType<PipeSpawner>();
        if (spawner == null)
        {
            Debug.LogWarning("⚠️ 场景中未找到 PipeSpawner!");
            errorCount++;
        }
        else
        {
            Debug.Log("✅ PipeSpawner 已配置");
            
            if (spawner.pipePrefab == null)
            {
                Debug.LogWarning("⚠️ PipeSpawner.pipePrefab 未赋值!");
                errorCount++;
            }
            else Debug.Log("✅ 管道预制体已配置");
        }
        
        if (errorCount == 0)
        {
            Debug.Log("\n✅ 所有检查通过! 游戏配置完整。");
        }
        else
        {
            Debug.LogWarning($"\n⚠️ 发现 {errorCount} 个问题需要解决");
        }
    }
}
