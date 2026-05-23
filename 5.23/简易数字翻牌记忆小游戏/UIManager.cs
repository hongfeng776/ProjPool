using UnityEngine;
using UnityEngine.UI;

public class UIManager : MonoBehaviour
{
    [Header("游戏信息面板")]
    public Text scoreText;
    public Text movesText;
    public Text timeText;
    
    [Header("游戏结束面板")]
    public GameObject gameCompletePanel;
    public Text finalScoreText;
    public Text finalMovesText;
    public Text finalTimeText;
    public Text highScoreText;
    public Text bestTimeText;
    
    [Header("按钮")]
    public Button restartButton;
    public Button easyButton;
    public Button mediumButton;
    public Button hardButton;
    
    [Header("历史记录面板")]
    public GameObject statsPanel;
    public Text statsGamesPlayed;
    public Text statsHighScore;
    public Text statsBestTime;
    public Text statsLeastMoves;
    public Text statsTotalScore;
    
    private void Start()
    {
        RegisterCallbacks();
        InitializeUI();
        UpdateStatsDisplay();
    }
    
    private void RegisterCallbacks()
    {
        if (GameManager.Instance != null)
        {
            GameManager.Instance.OnScoreChanged += UpdateScoreDisplay;
            GameManager.Instance.OnMovesChanged += UpdateMovesDisplay;
            GameManager.Instance.OnTimeChanged += UpdateTimeDisplay;
            GameManager.Instance.OnGameComplete += ShowGameCompletePanel;
        }
        
        if (restartButton != null)
        {
            restartButton.onClick.AddListener(OnRestartClicked);
        }
        
        if (easyButton != null)
        {
            easyButton.onClick.AddListener(() => SetDifficulty(2, 4));
        }
        
        if (mediumButton != null)
        {
            mediumButton.onClick.AddListener(() => SetDifficulty(4, 4));
        }
        
        if (hardButton != null)
        {
            hardButton.onClick.AddListener(() => SetDifficulty(4, 6));
        }
    }
    
    private void InitializeUI()
    {
        if (gameCompletePanel != null)
        {
            gameCompletePanel.SetActive(false);
        }
    }
    
    private void UpdateScoreDisplay(int score)
    {
        if (scoreText != null)
        {
            scoreText.text = $"分数: {score}";
        }
    }
    
    private void UpdateMovesDisplay(int moves)
    {
        if (movesText != null)
        {
            movesText.text = $"步数: {moves}";
        }
    }
    
    private void UpdateTimeDisplay(float time)
    {
        if (timeText != null && PlayerPrefsManager.Instance != null)
        {
            timeText.text = $"时间: {PlayerPrefsManager.Instance.FormatTime(time)}";
        }
    }
    
    private void ShowGameCompletePanel()
    {
        if (gameCompletePanel != null)
        {
            gameCompletePanel.SetActive(true);
        }
        
        if (GameManager.Instance != null)
        {
            if (finalScoreText != null)
            {
                finalScoreText.text = $"最终分数: {GameManager.Instance.GetScore()}";
            }
            
            if (finalMovesText != null)
            {
                finalMovesText.text = $"总步数: {GameManager.Instance.GetMoveCount()}";
            }
            
            if (finalTimeText != null && PlayerPrefsManager.Instance != null)
            {
                finalTimeText.text = $"用时: {PlayerPrefsManager.Instance.FormatTime(GameManager.Instance.GetGameTime())}";
            }
        }
        
        UpdateStatsDisplay();
    }
    
    private void UpdateStatsDisplay()
    {
        if (PlayerPrefsManager.Instance == null)
        {
            return;
        }
        
        if (highScoreText != null)
        {
            highScoreText.text = $"最高分: {PlayerPrefsManager.Instance.GetHighScore()}";
        }
        
        if (bestTimeText != null)
        {
            float bestTime = PlayerPrefsManager.Instance.GetBestTime();
            bestTimeText.text = bestTime > 0 
                ? $"最佳时间: {PlayerPrefsManager.Instance.FormatTime(bestTime)}" 
                : "最佳时间: --:--";
        }
        
        if (statsGamesPlayed != null)
        {
            statsGamesPlayed.text = $"游戏次数: {PlayerPrefsManager.Instance.GetGamesPlayed()}";
        }
        
        if (statsHighScore != null)
        {
            statsHighScore.text = $"最高分: {PlayerPrefsManager.Instance.GetHighScore()}";
        }
        
        if (statsBestTime != null)
        {
            float bestTime = PlayerPrefsManager.Instance.GetBestTime();
            statsBestTime.text = bestTime > 0 
                ? $"最佳时间: {PlayerPrefsManager.Instance.FormatTime(bestTime)}" 
                : "最佳时间: --:--";
        }
        
        if (statsLeastMoves != null)
        {
            int leastMoves = PlayerPrefsManager.Instance.GetLeastMoves();
            statsLeastMoves.text = leastMoves > 0 
                ? $"最少步数: {leastMoves}" 
                : "最少步数: --";
        }
        
        if (statsTotalScore != null)
        {
            statsTotalScore.text = $"累计分数: {PlayerPrefsManager.Instance.GetTotalScore()}";
        }
    }
    
    private void OnRestartClicked()
    {
        if (gameCompletePanel != null)
        {
            gameCompletePanel.SetActive(false);
        }
        
        if (GameManager.Instance != null)
        {
            GameManager.Instance.RestartGame();
        }
    }
    
    private void SetDifficulty(int rows, int columns)
    {
        if (gameCompletePanel != null)
        {
            gameCompletePanel.SetActive(false);
        }
        
        if (GameManager.Instance != null)
        {
            GameManager.Instance.SetDifficulty(rows, columns);
        }
    }
    
    public void ToggleStatsPanel()
    {
        if (statsPanel != null)
        {
            statsPanel.SetActive(!statsPanel.activeSelf);
            if (statsPanel.activeSelf)
            {
                UpdateStatsDisplay();
            }
        }
    }
    
    public void HideGameCompletePanel()
    {
        if (gameCompletePanel != null)
        {
            gameCompletePanel.SetActive(false);
        }
    }
    
    private void OnDestroy()
    {
        if (GameManager.Instance != null)
        {
            GameManager.Instance.OnScoreChanged -= UpdateScoreDisplay;
            GameManager.Instance.OnMovesChanged -= UpdateMovesDisplay;
            GameManager.Instance.OnTimeChanged -= UpdateTimeDisplay;
            GameManager.Instance.OnGameComplete -= ShowGameCompletePanel;
        }
    }
}
