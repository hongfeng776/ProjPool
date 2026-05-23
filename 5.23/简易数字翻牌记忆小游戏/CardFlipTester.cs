using UnityEngine;
using UnityEngine.UI;

public class CardFlipTester : MonoBehaviour
{
    [Header("测试设置")]
    public GameObject cardPrefab;
    public Transform testArea;
    public int testCardCount = 4;
    
    [Header("卡片外观")]
    public Sprite cardBackSprite;
    public Color cardBackColor = new Color(0.2f, 0.4f, 0.8f);
    public Color cardFrontColor = new Color(0.9f, 0.9f, 0.9f);
    public Color numberColor = Color.black;
    public int fontSize = 36;
    
    private void Start()
    {
        CreateTestCards();
    }
    
    private void CreateTestCards()
    {
        if (cardPrefab == null)
        {
            Debug.LogError("请指定卡片预制体！");
            return;
        }
        
        for (int i = 0; i < testCardCount; i++)
        {
            GameObject cardObject = Instantiate(cardPrefab, testArea);
            SetupCard(cardObject, i + 1);
        }
    }
    
    private void SetupCard(GameObject cardObject, int number)
    {
        Card card = cardObject.GetComponent<Card>();
        if (card != null)
        {
            card.testMode = true;
            card.SetCardData(number, null, number);
        }
        
        Image[] images = cardObject.GetComponentsInChildren<Image>();
        Text[] texts = cardObject.GetComponentsInChildren<Text>();
        
        foreach (Image img in images)
        {
            if (img.gameObject.name.Contains("Back") || img.gameObject.name.Contains("back"))
            {
                img.color = cardBackColor;
                if (cardBackSprite != null)
                {
                    img.sprite = cardBackSprite;
                }
            }
            else if (img.gameObject.name.Contains("Front") || img.gameObject.name.Contains("front"))
            {
                img.color = cardFrontColor;
            }
        }
        
        foreach (Text txt in texts)
        {
            txt.color = numberColor;
            txt.fontSize = fontSize;
            txt.alignment = TextAnchor.MiddleCenter;
        }
    }
    
    public void ResetAllCards()
    {
        Card[] allCards = FindObjectsOfType<Card>();
        foreach (Card card in allCards)
        {
            if (card.isFlipped)
            {
                card.FlipCard();
            }
        }
    }
    
    public void ShuffleAndReset()
    {
        Card[] allCards = FindObjectsOfType<Card>();
        int[] numbers = new int[allCards.Length];
        
        for (int i = 0; i < allCards.Length; i++)
        {
            numbers[i] = Random.Range(1, 100);
        }
        
        for (int i = 0; i < allCards.Length; i++)
        {
            if (allCards[i].isFlipped)
            {
                allCards[i].FlipCard();
            }
            allCards[i].SetCardData(numbers[i], null, numbers[i]);
        }
    }
}
