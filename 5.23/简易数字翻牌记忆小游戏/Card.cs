using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

public class Card : MonoBehaviour, IPointerClickHandler, IPointerEnterHandler, IPointerExitHandler
{
    [Header("卡片数据")]
    public int cardID;
    public bool isFlipped = false;
    public bool isMatched = false;
    
    [Header("UI引用")]
    [SerializeField] private Image frontImage;
    [SerializeField] private Image backImage;
    [SerializeField] private Text cardNumberText;
    [SerializeField] private Image glowEffect;
    
    [Header("翻转动画")]
    [SerializeField] private float flipDuration = 0.35f;
    [SerializeField] private AnimationCurve flipCurve = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f);
    
    [Header("悬停效果")]
    [SerializeField] private bool enableHoverEffect = true;
    [SerializeField] private float hoverScale = 1.05f;
    [SerializeField] private float hoverDuration = 0.15f;
    [SerializeField] private Color hoverColor = new Color(0.95f, 0.95f, 1f);
    
    [Header("发光效果")]
    [SerializeField] private bool enableGlowEffect = true;
    [SerializeField] private float glowIntensity = 0.5f;
    
    [Header("测试模式")]
    [SerializeField] public bool testMode = false;
    
    private Coroutine flipCoroutine;
    private Coroutine hoverCoroutine;
    private CanvasGroup canvasGroup;
    private RectTransform rectTransform;
    private bool isHovering = false;
    private Vector3 originalScale = Vector3.one;
    private Color originalBackColor;
    
    private void Awake()
    {
        InitializeCard();
    }
    
    private void Start()
    {
        if (backImage != null)
        {
            originalBackColor = backImage.color;
        }
    }
    
    private void InitializeCard()
    {
        rectTransform = GetComponent<RectTransform>();
        canvasGroup = GetComponent<CanvasGroup>();
        
        if (canvasGroup == null)
        {
            canvasGroup = gameObject.AddComponent<CanvasGroup>();
        }
        
        canvasGroup.alpha = 1f;
        canvasGroup.blocksRaycasts = true;
        
        if (rectTransform != null)
        {
            originalScale = rectTransform.localScale;
        }
        else
        {
            originalScale = transform.localScale;
        }
        
        transform.rotation = Quaternion.identity;
        
        if (backImage != null)
        {
            backImage.gameObject.SetActive(true);
        }
        if (frontImage != null)
        {
            frontImage.gameObject.SetActive(false);
            frontImage.color = Color.white;
        }
        if (cardNumberText != null)
        {
            cardNumberText.gameObject.SetActive(false);
            cardNumberText.color = Color.black;
        }
        
        if (glowEffect != null)
        {
            glowEffect.gameObject.SetActive(false);
        }
    }
    
    public void OnPointerEnter(PointerEventData eventData)
    {
        if (enableHoverEffect && !isMatched && !isFlipped)
        {
            isHovering = true;
            StartHoverAnimation(true);
        }
    }
    
    public void OnPointerExit(PointerEventData eventData)
    {
        if (enableHoverEffect)
        {
            isHovering = false;
            StartHoverAnimation(false);
        }
    }
    
    private void StartHoverAnimation(bool isEnter)
    {
        if (hoverCoroutine != null)
        {
            StopCoroutine(hoverCoroutine);
        }
        hoverCoroutine = StartCoroutine(HoverAnimation(isEnter));
    }
    
    private System.Collections.IEnumerator HoverAnimation(bool isEnter)
    {
        float elapsedTime = 0f;
        Vector3 startScale = rectTransform != null ? rectTransform.localScale : transform.localScale;
        Vector3 targetScale = isEnter ? originalScale * hoverScale : originalScale;
        
        Color startColor = backImage != null ? backImage.color : originalBackColor;
        Color targetColor = isEnter ? hoverColor : originalBackColor;
        
        while (elapsedTime < hoverDuration)
        {
            elapsedTime += Time.deltaTime;
            float t = elapsedTime / hoverDuration;
            t = Mathf.SmoothStep(0f, 1f, t);
            
            Vector3 currentScale = Vector3.Lerp(startScale, targetScale, t);
            if (rectTransform != null)
            {
                rectTransform.localScale = currentScale;
            }
            else
            {
                transform.localScale = currentScale;
            }
            
            if (backImage != null)
            {
                backImage.color = Color.Lerp(startColor, targetColor, t);
            }
            
            yield return null;
        }
        
        if (rectTransform != null)
        {
            rectTransform.localScale = targetScale;
        }
        else
        {
            transform.localScale = targetScale;
        }
        
        if (backImage != null)
        {
            backImage.color = targetColor;
        }
    }
    
    public void OnPointerClick(PointerEventData eventData)
    {
        HandleCardClick();
    }
    
    private void HandleCardClick()
    {
        if (!isActiveAndEnabled)
        {
            return;
        }
        
        if (isMatched)
        {
            return;
        }
        
        if (testMode)
        {
            FlipCard();
            return;
        }
        
        if (isFlipped)
        {
            return;
        }
        
        if (GameManager.Instance != null && GameManager.Instance.CanFlipCard())
        {
            FlipCard();
            GameManager.Instance.OnCardFlipped(this);
        }
    }
    
    public void SetCardData(int id, Sprite frontSprite, int number)
    {
        cardID = id;
        
        if (frontImage != null)
        {
            if (frontSprite != null)
            {
                frontImage.sprite = frontSprite;
            }
            frontImage.enabled = true;
        }
        
        if (cardNumberText != null)
        {
            cardNumberText.text = number.ToString();
            cardNumberText.enabled = true;
        }
    }
    
    public void FlipCard()
    {
        if (flipCoroutine != null)
        {
            StopCoroutine(flipCoroutine);
        }
        
        isFlipped = !isFlipped;
        flipCoroutine = StartCoroutine(FlipAnimationOptimized(isFlipped));
    }
    
    private System.Collections.IEnumerator FlipAnimationOptimized(bool showFront)
    {
        float elapsedTime = 0f;
        
        while (elapsedTime < flipDuration)
        {
            elapsedTime += Time.deltaTime;
            float normalizedTime = elapsedTime / flipDuration;
            float curveValue = flipCurve.Evaluate(normalizedTime);
            
            float rotationAngle = Mathf.Lerp(0f, 180f, curveValue);
            if (!showFront)
            {
                rotationAngle = Mathf.Lerp(180f, 360f, curveValue);
            }
            
            transform.rotation = Quaternion.Euler(0f, rotationAngle, 0f);
            
            if (normalizedTime >= 0.5f)
            {
                bool shouldShowFront = showFront;
                if (backImage != null && backImage.gameObject.activeSelf == shouldShowFront)
                {
                    backImage.gameObject.SetActive(!shouldShowFront);
                }
                if (frontImage != null && frontImage.gameObject.activeSelf != shouldShowFront)
                {
                    frontImage.gameObject.SetActive(shouldShowFront);
                }
                if (cardNumberText != null && cardNumberText.gameObject.activeSelf != shouldShowFront)
                {
                    cardNumberText.gameObject.SetActive(shouldShowFront);
                }
            }
            
            yield return null;
        }
        
        transform.rotation = showFront ? Quaternion.Euler(0f, 180f, 0f) : Quaternion.identity;
        
        if (backImage != null)
        {
            backImage.gameObject.SetActive(!showFront);
        }
        if (frontImage != null)
        {
            frontImage.gameObject.SetActive(showFront);
        }
        if (cardNumberText != null)
        {
            cardNumberText.gameObject.SetActive(showFront);
        }
        
        flipCoroutine = null;
    }
    
    private System.Collections.IEnumerator FlipAnimationScale(bool showFront)
    {
        float elapsedTime = 0f;
        Vector3 startScale = transform.localScale;
        Vector3 midScale = new Vector3(0f, startScale.y, startScale.z);
        
        while (elapsedTime < flipDuration / 2f)
        {
            elapsedTime += Time.deltaTime;
            float t = elapsedTime / (flipDuration / 2f);
            if (useSmoothCurve)
            {
                t = Mathf.SmoothStep(0f, 1f, t);
            }
            transform.localScale = Vector3.Lerp(startScale, midScale, t);
            yield return null;
        }
        
        if (backImage != null)
        {
            backImage.gameObject.SetActive(!showFront);
        }
        if (frontImage != null)
        {
            frontImage.gameObject.SetActive(showFront);
        }
        if (cardNumberText != null)
        {
            cardNumberText.gameObject.SetActive(showFront);
        }
        
        elapsedTime = 0f;
        while (elapsedTime < flipDuration / 2f)
        {
            elapsedTime += Time.deltaTime;
            float t = elapsedTime / (flipDuration / 2f);
            if (useSmoothCurve)
            {
                t = Mathf.SmoothStep(0f, 1f, t);
            }
            transform.localScale = Vector3.Lerp(midScale, startScale, t);
            yield return null;
        }
        
        transform.localScale = startScale;
        flipCoroutine = null;
    }
    
    public void SetMatched()
    {
        isMatched = true;
        
        if (canvasGroup != null)
        {
            canvasGroup.blocksRaycasts = false;
        }
        
        StartCoroutine(MatchedAnimationEnhanced());
    }
    
    private System.Collections.IEnumerator MatchedAnimationEnhanced()
    {
        float elapsedTime = 0f;
        float duration = 0.4f;
        Vector3 startScale = transform.localScale;
        Vector3 pulseScale = startScale * 1.15f;
        Vector3 endScale = startScale * 1.05f;
        
        Color originalColor = frontImage != null ? frontImage.color : Color.white;
        Color targetColor = new Color(0.6f, 1f, 0.6f, 1f);
        Color glowColor = new Color(0.8f, 1f, 0.8f, 1f);
        
        while (elapsedTime < duration / 2f)
        {
            elapsedTime += Time.deltaTime;
            float t = elapsedTime / (duration / 2f);
            t = Mathf.SmoothStep(0f, 1f, t);
            
            transform.localScale = Vector3.Lerp(startScale, pulseScale, t);
            
            if (frontImage != null)
            {
                frontImage.color = Color.Lerp(originalColor, glowColor, t);
            }
            if (cardNumberText != null)
            {
                cardNumberText.color = Color.Lerp(cardNumberText.color, new Color(0f, 0.5f, 0f, 1f), t);
            }
            
            yield return null;
        }
        
        elapsedTime = 0f;
        while (elapsedTime < duration / 2f)
        {
            elapsedTime += Time.deltaTime;
            float t = elapsedTime / (duration / 2f);
            t = Mathf.SmoothStep(0f, 1f, t);
            
            transform.localScale = Vector3.Lerp(pulseScale, endScale, t);
            
            if (frontImage != null)
            {
                frontImage.color = Color.Lerp(glowColor, targetColor, t);
            }
            
            yield return null;
        }
    }
    
    private System.Collections.IEnumerator MatchedShakeAnimation()
    {
        float elapsedTime = 0f;
        float duration = 0.3f;
        Vector3 originalPosition = transform.localPosition;
        float shakeAmount = 5f;
        
        while (elapsedTime < duration)
        {
            elapsedTime += Time.deltaTime;
            float t = elapsedTime / duration;
            
            float offsetX = (Mathf.PerlinNoise(Time.time * 30f, 0f) - 0.5f) * shakeAmount * (1 - t);
            float offsetY = (Mathf.PerlinNoise(0f, Time.time * 30f) - 0.5f) * shakeAmount * (1 - t);
            
            transform.localPosition = originalPosition + new Vector3(offsetX, offsetY, 0f);
            
            yield return null;
        }
        
        transform.localPosition = originalPosition;
    }
    
    public void PlayMismatchAnimation()
    {
        if (!isActiveAndEnabled)
        {
            return;
        }
        StartCoroutine(MatchedShakeAnimation());
    }
    
    public void ResetCard()
    {
        StopAllCoroutines();
        
        isFlipped = false;
        isMatched = false;
        
        gameObject.SetActive(true);
        
        if (canvasGroup != null)
        {
            canvasGroup.alpha = 1f;
            canvasGroup.blocksRaycasts = true;
        }
        
        if (rectTransform != null)
        {
            rectTransform.localScale = Vector3.one;
            rectTransform.localRotation = Quaternion.identity;
        }
        else
        {
            transform.localScale = Vector3.one;
            transform.rotation = Quaternion.identity;
        }
        
        if (backImage != null)
        {
            backImage.gameObject.SetActive(true);
        }
        if (frontImage != null)
        {
            frontImage.gameObject.SetActive(false);
            frontImage.color = Color.white;
        }
        if (cardNumberText != null)
        {
            cardNumberText.gameObject.SetActive(false);
            cardNumberText.color = Color.black;
        }
        
        flipCoroutine = null;
    }
}
