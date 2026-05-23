using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance;

    [Header("引用设置")]
    public BirdController bird;
    public PipeSpawner pipeSpawner;

    [Header("UI设置")]
    public Text scoreText;
    public Text highScoreText;
    public Text finalScoreText;
    public GameObject gameOverPanel;
    public GameObject startPanel;
    public Button restartButton;
    public Button startButton;

    [Header("调试设置")]
    public bool enableDebugLogs = true;

    public bool IsPlaying { get; private set; }
    public int score => _score;
    
    private int _score = 0;
    private int highScore = 0;

    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }

    void Start()
    {
        highScore = PlayerPrefs.GetInt("HighScore", 0);
        UpdateHighScoreText();
        ShowStartPanel();
        SetupButtons();
        
        if (enableDebugLogs)
        {
            Debug.Log("=== 游戏管理器初始化完成 ===");
            Debug.Log($"当前最高分: {highScore}");
        }
    }

    void SetupButtons()
    {
        if (restartButton != null)
        {
            restartButton.onClick.RemoveAllListeners();
            restartButton.onClick.AddListener(RestartGame);
            if (enableDebugLogs) Debug.Log("重启按钮已绑定");
        }
        
        if (startButton != null)
        {
            startButton.onClick.RemoveAllListeners();
            startButton.onClick.AddListener(() => StartGame());
            if (enableDebugLogs) Debug.Log("开始按钮已绑定");
        }
    }

    public void StartGame()
    {
        StartGame(false);
    }

    public void StartGame(bool skipBirdReset)
    {
        IsPlaying = true;
        _score = 0;
        UpdateScoreText();
        
        if (bird != null && !skipBirdReset)
        {
            bird.ResetBird();
        }
        
        if (pipeSpawner != null)
        {
            pipeSpawner.ResetSpawner();
        }
        
        HideStartPanel();
        HideGameOverPanel();
        
        if (enableDebugLogs)
        {
            Debug.Log("=== 游戏开始 ===");
        }
    }

    public void RestartGame()
    {
        if (enableDebugLogs)
        {
            Debug.Log("=== 重启游戏 ===");
        }
        
        IsPlaying = false;
        
        if (bird != null)
        {
            bird.ResetBird();
        }
        
        if (pipeSpawner != null)
        {
            pipeSpawner.ResetSpawner();
        }
        
        IsPlaying = true;
        _score = 0;
        UpdateScoreText();
        
        HideGameOverPanel();
        HideStartPanel();
        
        if (enableDebugLogs)
        {
            Debug.Log("游戏重启完成！");
        }
    }

    public void RestartScene()
    {
        if (enableDebugLogs)
        {
            Debug.Log("=== 重新加载场景 ===");
        }
        SceneManager.LoadScene(SceneManager.GetActiveScene().name);
    }

    public void GameOver()
    {
        IsPlaying = false;
        
        if (_score > highScore)
        {
            highScore = _score;
            PlayerPrefs.SetInt("HighScore", highScore);
            UpdateHighScoreText();
            
            if (enableDebugLogs)
            {
                Debug.Log($"🎉 新纪录！最高分: {highScore}");
            }
        }
        
        UpdateFinalScoreText();
        ShowGameOverPanel();
        
        if (enableDebugLogs)
        {
            Debug.Log($"=== 游戏结束 ===");
            Debug.Log($"得分: {_score} | 最高分: {highScore}");
        }
    }

    public void AddScore(int points)
    {
        _score += points;
        UpdateScoreText();
        
        if (enableDebugLogs)
        {
            Debug.Log($"得分 +{points}，当前分数: {_score}");
        }
    }

    void UpdateScoreText()
    {
        if (scoreText != null)
        {
            scoreText.text = _score.ToString();
        }
    }

    void UpdateHighScoreText()
    {
        if (highScoreText != null)
        {
            highScoreText.text = "最高分: " + highScore.ToString();
        }
    }

    void UpdateFinalScoreText()
    {
        if (finalScoreText != null)
        {
            finalScoreText.text = $"得分: {_score}\n最高分: {highScore}";
        }
    }

    void ShowStartPanel()
    {
        if (startPanel != null)
        {
            startPanel.SetActive(true);
        }
    }

    void HideStartPanel()
    {
        if (startPanel != null)
        {
            startPanel.SetActive(false);
        }
    }

    void ShowGameOverPanel()
    {
        if (gameOverPanel != null)
        {
            gameOverPanel.SetActive(true);
        }
    }

    void HideGameOverPanel()
    {
        if (gameOverPanel != null)
        {
            gameOverPanel.SetActive(false);
        }
    }
}
