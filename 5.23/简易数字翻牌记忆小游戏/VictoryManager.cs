using UnityEngine;
using UnityEngine.UI;
using System.Collections;

public class VictoryManager : MonoBehaviour
{
    [Header("胜利界面引用")]
    public GameObject victoryPanel;
    public Text titleText;
    public Text scoreText;
    public Text movesText;
    public Text timeText;
    public Text highScoreText;
    public Text bestTimeText;
    
    [Header("动画设置")]
    public float panelFadeDuration = 0.5f;
    public float elementDelay = 0.2f;
    public float scaleDuration = 0.5f;
    public Vector3 titleScaleTarget = new Vector3(1.2f, 1.2f, 1f);
    
    [Header("粒子特效")]
    public GameObject[] confettiPrefabs;
    public Transform confettiSpawnPoint;
    public int confettiCount = 5;
    
    [Header("星星评分")]
    public Image[] starImages;
    public Sprite starFilledSprite;
    public Sprite starEmptySprite;
    public float starAnimDelay = 0.3f;
    
    [Header("按钮")]
    public Button playAgainButton;
    public Button mainMenuButton;
    
    private CanvasGroup victoryCanvasGroup;
    private Coroutine showCoroutine;
    
    private void Awake()
    {
        InitializeVictoryPanel();
    }
    
    private void Start()
    {
        RegisterGameEvents();
    }
    
    private void InitializeVictoryPanel()
    {
        if (victoryPanel == null)
        {
            victoryPanel = gameObject;
        }
        
        victoryCanvasGroup = victoryPanel.GetComponent<CanvasGroup>();
        if (victoryCanvasGroup == null)
        {
            victoryCanvasGroup = victoryPanel.AddComponent<CanvasGroup>();
        }
        
        victoryCanvasGroup.alpha = 0f;
        victoryCanvasGroup.blocksRaycasts = false;
        victoryPanel.SetActive(false);
        
        if (playAgainButton != null)
        {
            playAgainButton.onClick.AddListener(OnPlayAgainClicked);
        }
        
        if (mainMenuButton != null)
        {
            mainMenuButton.onClick.AddListener(OnMainMenuClicked);
        }
    }
    
    private void RegisterGameEvents()
    {
        if (GameManager.Instance != null)
        {
            GameManager.Instance.OnGameComplete += OnGameComplete;
        }
    }
    
    private void OnGameComplete()
    {
        ShowVictoryPanel();
    }
    
    public void ShowVictoryPanel()
    {
        if (showCoroutine != null)
        {
            StopCoroutine(showCoroutine);
        }
        
        UpdateVictoryStats();
        victoryPanel.SetActive(true);
        showCoroutine = StartCoroutine(ShowVictoryAnimation());
    }
    
    private void UpdateVictoryStats()
    {
        if (GameManager.Instance == null) return;
        
        int score = GameManager.Instance.GetScore();
        int moves = GameManager.Instance.GetMoveCount();
        float time = GameManager.Instance.GetGameTime();
        
        if (scoreText != null)
        {
            scoreText.text = $"得分: {score}";
        }
        
        if (movesText != null)
        {
            movesText.text = $"步数: {moves}";
        }
        
        if (timeText != null && PlayerPrefsManager.Instance != null)
        {
            timeText.text = $"用时: {PlayerPrefsManager.Instance.FormatTime(time)}";
        }
        
        if (PlayerPrefsManager.Instance != null)
        {
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
        }
        
        UpdateStarRating(moves, time);
    }
    
    private void UpdateStarRating(int moves, float time)
    {
        if (starImages == null || starImages.Length == 0) return;
        
        int stars = CalculateStarRating(moves, time);
        
        for (int i = 0; i < starImages.Length; i++)
        {
            if (starImages[i] != null)
            {
                if (starEmptySprite != null)
                {
                    starImages[i].sprite = starEmptySprite;
                }
                starImages[i].color = new Color(1f, 1f, 1f, 0.3f);
            }
        }
    }
    
    private int CalculateStarRating(int moves, float time)
    {
        int totalPairs = (GameManager.Instance != null) 
            ? (GameManager.Instance.gridRows * GameManager.Instance.gridColumns) / 2 
            : 8;
        
        float perfectMoves = totalPairs * 2;
        float moveRatio = moves / perfectMoves;
        
        float perfectTime = totalPairs * 3f;
        float timeRatio = time / perfectTime;
        
        if (moveRatio <= 1.5f && timeRatio <= 2f) return 3;
        if (moveRatio <= 2f && timeRatio <= 3f) return 2;
        return 1;
    }
    
    private System.Collections.IEnumerator ShowVictoryAnimation()
    {
        victoryCanvasGroup.alpha = 0f;
        victoryCanvasGroup.blocksRaycasts = true;
        
        float elapsedTime = 0f;
        while (elapsedTime < panelFadeDuration)
        {
            elapsedTime += Time.deltaTime;
            float t = elapsedTime / panelFadeDuration;
            victoryCanvasGroup.alpha = Mathf.Lerp(0f, 1f, t);
            yield return null;
        }
        
        victoryCanvasGroup.alpha = 1f;
        
        SpawnConfetti();
        
        if (titleText != null)
        {
            yield return StartCoroutine(TitleAnimation());
        }
        
        yield return new WaitForSeconds(elementDelay);
        
        int stars = CalculateStarRating(
            GameManager.Instance != null ? GameManager.Instance.GetMoveCount() : 0,
            GameManager.Instance != null ? GameManager.Instance.GetGameTime() : 0f
        );
        yield return StartCoroutine(StarAnimation(stars));
        
        yield return new WaitForSeconds(elementDelay);
        
        if (scoreText != null)
        {
            yield return StartCoroutine(FadeInElement(scoreText.GetComponent<CanvasGroup>() ?? scoreText.gameObject.AddComponent<CanvasGroup>()));
        }
        
        yield return new WaitForSeconds(elementDelay * 0.5f);
        
        if (movesText != null)
        {
            yield return StartCoroutine(FadeInElement(movesText.GetComponent<CanvasGroup>() ?? movesText.gameObject.AddComponent<CanvasGroup>()));
        }
        
        yield return new WaitForSeconds(elementDelay * 0.5f);
        
        if (timeText != null)
        {
            yield return StartCoroutine(FadeInElement(timeText.GetComponent<CanvasGroup>() ?? timeText.gameObject.AddComponent<CanvasGroup>()));
        }
        
        yield return new WaitForSeconds(elementDelay);
        
        if (playAgainButton != null)
        {
            yield return StartCoroutine(FadeInElement(playAgainButton.GetComponent<CanvasGroup>() ?? playAgainButton.gameObject.AddComponent<CanvasGroup>()));
        }
        
        if (mainMenuButton != null)
        {
            yield return StartCoroutine(FadeInElement(mainMenuButton.GetComponent<CanvasGroup>() ?? mainMenuButton.gameObject.AddComponent<CanvasGroup>()));
        }
    }
    
    private System.Collections.IEnumerator TitleAnimation()
    {
        RectTransform rectTransform = titleText.GetComponent<RectTransform>();
        Vector3 originalScale = rectTransform != null ? rectTransform.localScale : titleText.transform.localScale;
        
        float elapsedTime = 0f;
        while (elapsedTime < scaleDuration)
        {
            elapsedTime += Time.deltaTime;
            float t = elapsedTime / scaleDuration;
            t = Mathf.Sin(t * Mathf.PI);
            
            Vector3 currentScale = Vector3.Lerp(originalScale, titleScaleTarget, t);
            if (rectTransform != null)
            {
                rectTransform.localScale = currentScale;
            }
            else
            {
                titleText.transform.localScale = currentScale;
            }
            
            yield return null;
        }
        
        if (rectTransform != null)
        {
            rectTransform.localScale = originalScale;
        }
        else
        {
            titleText.transform.localScale = originalScale;
        }
    }
    
    private System.Collections.IEnumerator StarAnimation(int starCount)
    {
        for (int i = 0; i < starCount && i < starImages.Length; i++)
        {
            if (starImages[i] != null)
            {
                StartCoroutine(StarPopAnimation(starImages[i]));
            }
            yield return new WaitForSeconds(starAnimDelay);
        }
    }
    
    private System.Collections.IEnumerator StarPopAnimation(Image starImage)
    {
        if (starFilledSprite != null)
        {
            starImage.sprite = starFilledSprite;
        }
        
        RectTransform rectTransform = starImage.GetComponent<RectTransform>();
        Vector3 originalScale = rectTransform != null ? rectTransform.localScale : starImage.transform.localScale;
        Vector3 popScale = originalScale * 1.5f;
        
        float elapsedTime = 0f;
        float duration = 0.3f;
        
        while (elapsedTime < duration)
        {
            elapsedTime += Time.deltaTime;
            float t = elapsedTime / duration;
            
            if (t < 0.5f)
            {
                float scaleT = t * 2f;
                Vector3 currentScale = Vector3.Lerp(originalScale, popScale, scaleT);
                if (rectTransform != null)
                {
                    rectTransform.localScale = currentScale;
                }
                else
                {
                    starImage.transform.localScale = currentScale;
                }
            }
            else
            {
                float scaleT = (t - 0.5f) * 2f;
                Vector3 currentScale = Vector3.Lerp(popScale, originalScale, scaleT);
                if (rectTransform != null)
                {
                    rectTransform.localScale = currentScale;
                }
                else
                {
                    starImage.transform.localScale = currentScale;
                }
            }
            
            starImage.color = Color.Lerp(new Color(1f, 1f, 1f, 0.3f), Color.white, t);
            yield return null;
        }
        
        starImage.color = Color.white;
    }
    
    private System.Collections.IEnumerator FadeInElement(CanvasGroup element)
    {
        if (element == null) yield break;
        
        element.alpha = 0f;
        float elapsedTime = 0f;
        float duration = 0.3f;
        
        while (elapsedTime < duration)
        {
            elapsedTime += Time.deltaTime;
            float t = elapsedTime / duration;
            element.alpha = Mathf.Lerp(0f, 1f, t);
            yield return null;
        }
        
        element.alpha = 1f;
    }
    
    private void SpawnConfetti()
    {
        if (confettiPrefabs == null || confettiPrefabs.Length == 0) return;
        
        Vector3 spawnPos = confettiSpawnPoint != null ? confettiSpawnPoint.position : transform.position;
        
        for (int i = 0; i < confettiCount; i++)
        {
            int prefabIndex = Random.Range(0, confettiPrefabs.Length);
            if (confettiPrefabs[prefabIndex] != null)
            {
                Vector3 randomOffset = new Vector3(
                    Random.Range(-100f, 100f),
                    Random.Range(-50f, 50f),
                    0f
                );
                
                GameObject confetti = Instantiate(
                    confettiPrefabs[prefabIndex],
                    spawnPos + randomOffset,
                    Quaternion.identity
                );
                
                Destroy(confetti, 3f);
            }
        }
    }
    
    public void HideVictoryPanel()
    {
        if (showCoroutine != null)
        {
            StopCoroutine(showCoroutine);
        }
        
        if (victoryCanvasGroup != null)
        {
            victoryCanvasGroup.alpha = 0f;
            victoryCanvasGroup.blocksRaycasts = false;
        }
        
        victoryPanel.SetActive(false);
    }
    
    private void OnPlayAgainClicked()
    {
        HideVictoryPanel();
        
        if (GameManager.Instance != null)
        {
            GameManager.Instance.RestartGame();
        }
    }
    
    private void OnMainMenuClicked()
    {
        HideVictoryPanel();
    }
    
    private void OnDestroy()
    {
        if (GameManager.Instance != null)
        {
            GameManager.Instance.OnGameComplete -= OnGameComplete;
        }
    }
}
