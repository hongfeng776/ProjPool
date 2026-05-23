using UnityEngine;
using System.Collections.Generic;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }
    
    [Header("游戏设置")]
    public int gridRows = 4;
    public int gridColumns = 4;
    public float matchCheckDelay = 0.8f;
    public float matchAnimationDelay = 0.5f;
    
    [Header("匹配效果设置")]
    public bool playMatchSound = true;
    public bool showMatchEffect = true;
    public float fadeOutDuration = 0.5f;
    public float scaleUpAmount = 1.2f;
    
    [Header("引用")]
    public GameObject cardPrefab;
    public Transform cardGridParent;
    public Sprite[] cardFrontSprites;
    public AudioClip matchSuccessSound;
    public AudioClip matchFailSound;
    public GameObject matchEffectPrefab;
    
    private List<Card> allCards = new List<Card>();
    private Card firstFlippedCard;
    private Card secondFlippedCard;
    private bool isCheckingMatch = false;
    private int matchedPairs = 0;
    private int totalPairs;
    private int moveCount = 0;
    private int score = 0;
    private float gameTime = 0f;
    private bool isGamePlaying = false;
    private AudioSource audioSource;
    
    public System.Action<int> OnScoreChanged;
    public System.Action<int> OnMovesChanged;
    public System.Action<float> OnTimeChanged;
    public System.Action OnGameComplete;
    public System.Action<Card, Card, bool> OnMatchChecked;
    
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
        
        audioSource = GetComponent<AudioSource>();
        if (audioSource == null)
        {
            audioSource = gameObject.AddComponent<AudioSource>();
        }
    }
    
    private void Start()
    {
        if (cardPrefab != null && cardGridParent != null)
        {
            InitializeGame();
        }
    }
    
    private void Update()
    {
        if (isGamePlaying)
        {
            gameTime += Time.deltaTime;
            OnTimeChanged?.Invoke(gameTime);
        }
    }
    
    public void InitializeGame()
    {
        Debug.Log("=== 游戏初始化开始 ===");
        
        ClearCards();
        
        totalPairs = (gridRows * gridColumns) / 2;
        matchedPairs = 0;
        moveCount = 0;
        score = 0;
        gameTime = 0f;
        firstFlippedCard = null;
        secondFlippedCard = null;
        isCheckingMatch = false;
        
        CreateCardGrid();
        isGamePlaying = true;
        
        Debug.Log($"游戏初始化完成！总卡片数: {gridRows * gridColumns}, 总对数: {totalPairs}");
        
        OnMovesChanged?.Invoke(moveCount);
        OnScoreChanged?.Invoke(score);
        OnTimeChanged?.Invoke(gameTime);
    }
    
    private void ClearCards()
    {
        if (cardGridParent == null)
        {
            Debug.LogError("卡片网格父对象未设置！");
            return;
        }
        
        int count = 0;
        foreach (Transform child in cardGridParent)
        {
            Destroy(child.gameObject);
            count++;
        }
        allCards.Clear();
        
        if (count > 0)
        {
            Debug.Log($"已清理 {count} 张旧卡片");
        }
    }
    
    private void CreateCardGrid()
    {
        if (cardPrefab == null)
        {
            Debug.LogError("卡片预制体未设置！无法创建卡片网格！");
            return;
        }
        
        if (cardGridParent == null)
        {
            Debug.LogError("卡片网格父对象未设置！无法创建卡片网格！");
            return;
        }
        
        int totalCards = gridRows * gridColumns;
        int[] cardIDs = GenerateCardIDs(totalCards);
        ShuffleArray(cardIDs);
        
        Debug.Log($"开始生成 {totalCards} 张卡片...");
        
        for (int i = 0; i < totalCards; i++)
        {
            GameObject cardObject = Instantiate(cardPrefab, cardGridParent);
            
            if (cardObject == null)
            {
                Debug.LogError($"第 {i} 张卡片生成失败！");
                continue;
            }
            
            cardObject.SetActive(true);
            
            Card card = cardObject.GetComponent<Card>();
            
            if (card == null)
            {
                Debug.LogWarning($"卡片 {i} 没有 Card 组件，自动添加");
                card = cardObject.AddComponent<Card>();
            }
            
            int cardID = cardIDs[i];
            Sprite frontSprite = GetCardSprite(cardID);
            int displayNumber = cardID + 1;
            
            card.SetCardData(cardID, frontSprite, displayNumber);
            allCards.Add(card);
        }
        
        Debug.Log($"卡片生成完成！共生成 {allCards.Count} 张卡片");
    }
    
    private int[] GenerateCardIDs(int totalCards)
    {
        int[] ids = new int[totalCards];
        int pairCount = totalCards / 2;
        
        for (int i = 0; i < pairCount; i++)
        {
            ids[i * 2] = i;
            ids[i * 2 + 1] = i;
        }
        
        return ids;
    }
    
    private void ShuffleArray(int[] array)
    {
        for (int i = array.Length - 1; i > 0; i--)
        {
            int randomIndex = Random.Range(0, i + 1);
            (array[i], array[randomIndex]) = (array[randomIndex], array[i]);
        }
    }
    
    private Sprite GetCardSprite(int cardID)
    {
        if (cardFrontSprites != null && cardFrontSprites.Length > 0)
        {
            int index = cardID % cardFrontSprites.Length;
            return cardFrontSprites[index];
        }
        return null;
    }
    
    public bool CanFlipCard()
    {
        return !isCheckingMatch && secondFlippedCard == null;
    }
    
    public void OnCardFlipped(Card card)
    {
        if (firstFlippedCard == null)
        {
            firstFlippedCard = card;
        }
        else if (secondFlippedCard == null)
        {
            secondFlippedCard = card;
            moveCount++;
            OnMovesChanged?.Invoke(moveCount);
            StartCoroutine(CheckMatch());
        }
    }
    
    private System.Collections.IEnumerator CheckMatch()
    {
        isCheckingMatch = true;
        
        yield return new WaitForSeconds(matchCheckDelay);
        
        bool isMatch = firstFlippedCard.cardID == secondFlippedCard.cardID;
        
        OnMatchChecked?.Invoke(firstFlippedCard, secondFlippedCard, isMatch);
        
        if (isMatch)
        {
            PlayMatchSuccessEffect();
            yield return StartCoroutine(ProcessMatchSuccess());
        }
        else
        {
            PlayMatchFailEffect();
            yield return StartCoroutine(ProcessMatchFail());
        }
        
        firstFlippedCard = null;
        secondFlippedCard = null;
        isCheckingMatch = false;
    }
    
    private System.Collections.IEnumerator ProcessMatchSuccess()
    {
        if (firstFlippedCard == null || secondFlippedCard == null)
        {
            Debug.LogError("匹配卡片引用丢失！");
            yield break;
        }
        
        Debug.Log($"匹配成功！卡片ID: {firstFlippedCard.cardID}");
        
        if (showMatchEffect)
        {
            SpawnMatchEffect(firstFlippedCard.transform.position);
            SpawnMatchEffect(secondFlippedCard.transform.position);
        }
        
        matchedPairs++;
        
        int bonusScore = CalculateScore();
        score += bonusScore;
        OnScoreChanged?.Invoke(score);
        
        yield return StartCoroutine(FadeOutAndRemoveCard(firstFlippedCard));
        yield return StartCoroutine(FadeOutAndRemoveCard(secondFlippedCard));
        
        if (matchedPairs >= totalPairs)
        {
            GameComplete();
        }
    }
    
    private System.Collections.IEnumerator ProcessMatchFail()
    {
        if (firstFlippedCard == null || secondFlippedCard == null)
        {
            Debug.LogError("不匹配卡片引用丢失！");
            yield break;
        }
        
        Debug.Log($"匹配失败！卡片1: {firstFlippedCard.cardID}, 卡片2: {secondFlippedCard.cardID}");
        
        firstFlippedCard.PlayMismatchAnimation();
        secondFlippedCard.PlayMismatchAnimation();
        
        yield return new WaitForSeconds(0.5f);
        
        if (firstFlippedCard != null && firstFlippedCard.isFlipped)
        {
            firstFlippedCard.FlipCard();
        }
        if (secondFlippedCard != null && secondFlippedCard.isFlipped)
        {
            secondFlippedCard.FlipCard();
        }
    }
    
    private System.Collections.IEnumerator FadeOutAndRemoveCard(Card card)
    {
        if (card == null || !card.gameObject.activeSelf)
        {
            Debug.LogWarning("卡片为空或已禁用");
            yield break;
        }
        
        card.StopAllCoroutines();
        card.isMatched = true;
        
        float elapsedTime = 0f;
        CanvasGroup canvasGroup = card.GetComponent<CanvasGroup>();
        
        if (canvasGroup == null)
        {
            canvasGroup = card.gameObject.AddComponent<CanvasGroup>();
        }
        
        canvasGroup.blocksRaycasts = false;
        
        RectTransform rectTransform = card.GetComponent<RectTransform>();
        Vector3 startScale = rectTransform != null ? rectTransform.localScale : card.transform.localScale;
        Vector3 pulseScale = startScale * 1.2f;
        
        while (elapsedTime < fadeOutDuration / 2f)
        {
            if (card == null) yield break;
            elapsedTime += Time.deltaTime;
            float t = elapsedTime / (fadeOutDuration / 2f);
            t = Mathf.SmoothStep(0f, 1f, t);
            
            Vector3 currentScale = Vector3.Lerp(startScale, pulseScale, t);
            if (rectTransform != null)
            {
                rectTransform.localScale = currentScale;
            }
            else
            {
                card.transform.localScale = currentScale;
            }
            yield return null;
        }
        
        elapsedTime = 0f;
        while (elapsedTime < fadeOutDuration / 2f)
        {
            if (card == null) yield break;
            elapsedTime += Time.deltaTime;
            float t = elapsedTime / (fadeOutDuration / 2f);
            t = Mathf.SmoothStep(0f, 1f, t);
            
            canvasGroup.alpha = Mathf.Lerp(1f, 0f, t);
            Vector3 currentScale = Vector3.Lerp(pulseScale, Vector3.zero, t);
            
            if (rectTransform != null)
            {
                rectTransform.localScale = currentScale;
            }
            else
            {
                card.transform.localScale = currentScale;
            }
            yield return null;
        }
        
        if (card != null)
        {
            canvasGroup.alpha = 0f;
            card.gameObject.SetActive(false);
            Debug.Log($"卡片 {card.cardID} 已消除");
        }
    }
    
    private void PlayMatchSuccessEffect()
    {
        if (playMatchSound && matchSuccessSound != null && audioSource != null)
        {
            audioSource.PlayOneShot(matchSuccessSound);
        }
    }
    
    private void PlayMatchFailEffect()
    {
        if (playMatchSound && matchFailSound != null && audioSource != null)
        {
            audioSource.PlayOneShot(matchFailSound);
        }
    }
    
    private void SpawnMatchEffect(Vector3 position)
    {
        if (matchEffectPrefab != null)
        {
            GameObject effect = Instantiate(matchEffectPrefab, position, Quaternion.identity);
            Destroy(effect, 1f);
        }
    }
    
    private int CalculateScore()
    {
        int baseScore = 100;
        float timeBonus = Mathf.Max(0, 50 - (int)(gameTime / 10f));
        float movePenalty = moveCount * 2;
        return Mathf.Max(10, (int)(baseScore + timeBonus - movePenalty));
    }
    
    private void GameComplete()
    {
        isGamePlaying = false;
        
        PlayerPrefsManager.Instance.SaveGameScore(score, moveCount, gameTime);
        OnGameComplete?.Invoke();
    }
    
    public void RestartGame()
    {
        InitializeGame();
    }
    
    public void SetDifficulty(int rows, int columns)
    {
        gridRows = rows;
        gridColumns = columns;
        InitializeGame();
    }
    
    public int GetScore()
    {
        return score;
    }
    
    public int GetMoveCount()
    {
        return moveCount;
    }
    
    public float GetGameTime()
    {
        return gameTime;
    }
}
