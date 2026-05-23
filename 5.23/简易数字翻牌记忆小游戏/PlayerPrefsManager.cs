using UnityEngine;

public class PlayerPrefsManager : MonoBehaviour
{
    public static PlayerPrefsManager Instance { get; private set; }
    
    private const string HIGH_SCORE_KEY = "HighScore";
    private const string BEST_TIME_KEY = "BestTime";
    private const string LEAST_MOVES_KEY = "LeastMoves";
    private const string GAMES_PLAYED_KEY = "GamesPlayed";
    private const string TOTAL_SCORE_KEY = "TotalScore";
    
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
        }
    }
    
    public void SaveGameScore(int score, int moves, float time)
    {
        int currentHighScore = GetHighScore();
        if (score > currentHighScore)
        {
            SetHighScore(score);
        }
        
        float currentBestTime = GetBestTime();
        if (currentBestTime <= 0 || time < currentBestTime)
        {
            SetBestTime(time);
        }
        
        int currentLeastMoves = GetLeastMoves();
        if (currentLeastMoves <= 0 || moves < currentLeastMoves)
        {
            SetLeastMoves(moves);
        }
        
        int gamesPlayed = GetGamesPlayed() + 1;
        SetGamesPlayed(gamesPlayed);
        
        int totalScore = GetTotalScore() + score;
        SetTotalScore(totalScore);
    }
    
    public int GetHighScore()
    {
        return PlayerPrefs.GetInt(HIGH_SCORE_KEY, 0);
    }
    
    public void SetHighScore(int score)
    {
        PlayerPrefs.SetInt(HIGH_SCORE_KEY, score);
        PlayerPrefs.Save();
    }
    
    public float GetBestTime()
    {
        return PlayerPrefs.GetFloat(BEST_TIME_KEY, 0f);
    }
    
    public void SetBestTime(float time)
    {
        PlayerPrefs.SetFloat(BEST_TIME_KEY, time);
        PlayerPrefs.Save();
    }
    
    public int GetLeastMoves()
    {
        return PlayerPrefs.GetInt(LEAST_MOVES_KEY, 0);
    }
    
    public void SetLeastMoves(int moves)
    {
        PlayerPrefs.SetInt(LEAST_MOVES_KEY, moves);
        PlayerPrefs.Save();
    }
    
    public int GetGamesPlayed()
    {
        return PlayerPrefs.GetInt(GAMES_PLAYED_KEY, 0);
    }
    
    public void SetGamesPlayed(int count)
    {
        PlayerPrefs.SetInt(GAMES_PLAYED_KEY, count);
        PlayerPrefs.Save();
    }
    
    public int GetTotalScore()
    {
        return PlayerPrefs.GetInt(TOTAL_SCORE_KEY, 0);
    }
    
    public void SetTotalScore(int score)
    {
        PlayerPrefs.SetInt(TOTAL_SCORE_KEY, score);
        PlayerPrefs.Save();
    }
    
    public string FormatTime(float timeInSeconds)
    {
        int minutes = (int)(timeInSeconds / 60);
        int seconds = (int)(timeInSeconds % 60);
        return $"{minutes:00}:{seconds:00}";
    }
    
    public void ResetAllStats()
    {
        PlayerPrefs.DeleteKey(HIGH_SCORE_KEY);
        PlayerPrefs.DeleteKey(BEST_TIME_KEY);
        PlayerPrefs.DeleteKey(LEAST_MOVES_KEY);
        PlayerPrefs.DeleteKey(GAMES_PLAYED_KEY);
        PlayerPrefs.DeleteKey(TOTAL_SCORE_KEY);
        PlayerPrefs.Save();
    }
    
    public bool HasAnyRecord()
    {
        return GetHighScore() > 0 || GetBestTime() > 0 || GetLeastMoves() > 0;
    }
}
