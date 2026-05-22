using UnityEngine;
using UnityEngine.UI;
using System.Collections;

namespace PixelAdventure.UI
{
    public class LoadingScreen : MonoBehaviour
    {
        [Header("UI引用")]
        [SerializeField] private CanvasGroup canvasGroup;
        [SerializeField] private Image progressBarFill;
        [SerializeField] private Text progressText;
        [SerializeField] private Text loadingTipText;
        [SerializeField] private Text sceneNameText;

        [Header("设置")]
        [SerializeField] private float fadeDuration = 0.3f;
        [SerializeField] private float smoothSpeed = 5f;
        [SerializeField] private string[] loadingTips;

        private float _targetProgress;
        private float _currentProgress;
        private Coroutine _fadeCoroutine;
        private Canvas _canvas;

        public bool IsVisible { get; private set; }
        public float CurrentProgress => _currentProgress;

        private void Awake()
        {
            InitializeComponents();
        }

        private void InitializeComponents()
        {
            if (_canvas == null)
            {
                _canvas = GetComponent<Canvas>();
                if (_canvas == null)
                {
                    _canvas = gameObject.AddComponent<Canvas>();
                    _canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                    _canvas.sortingOrder = 9999;
                }
            }

            if (canvasGroup == null)
            {
                canvasGroup = gameObject.AddComponent<CanvasGroup>();
            }

            if (progressBarFill == null)
            {
                CreateDefaultUI();
            }

            canvasGroup.alpha = 0f;
            canvasGroup.interactable = false;
            canvasGroup.blocksRaycasts = false;
            gameObject.SetActive(false);
        }

        private void CreateDefaultUI()
        {
            GameObject background = new GameObject("Background");
            background.transform.SetParent(transform, false);
            Image bgImage = background.AddComponent<Image>();
            bgImage.color = new Color(0.1f, 0.1f, 0.1f, 1f);
            RectTransform bgRect = background.GetComponent<RectTransform>();
            bgRect.anchorMin = Vector2.zero;
            bgRect.anchorMax = Vector2.one;
            bgRect.offsetMin = Vector2.zero;
            bgRect.offsetMax = Vector2.zero;

            GameObject progressBarBg = new GameObject("ProgressBarBg");
            progressBarBg.transform.SetParent(transform, false);
            Image pbbgImage = progressBarBg.AddComponent<Image>();
            pbbgImage.color = new Color(0.3f, 0.3f, 0.3f, 1f);
            RectTransform pbbgRect = progressBarBg.GetComponent<RectTransform>();
            pbbgRect.anchorMin = new Vector2(0.1f, 0.15f);
            pbbgRect.anchorMax = new Vector2(0.9f, 0.18f);
            pbbgRect.offsetMin = Vector2.zero;
            pbbgRect.offsetMax = Vector2.zero;

            GameObject progressBar = new GameObject("ProgressBarFill");
            progressBar.transform.SetParent(progressBarBg.transform, false);
            progressBarFill = progressBar.AddComponent<Image>();
            progressBarFill.color = new Color(0.3f, 0.7f, 0.9f, 1f);
            RectTransform pbRect = progressBar.GetComponent<RectTransform>();
            pbRect.anchorMin = Vector2.zero;
            pbRect.anchorMax = Vector2.one;
            pbRect.pivot = new Vector2(0f, 0.5f);
            pbRect.offsetMin = Vector2.zero;
            pbRect.offsetMax = Vector2.zero;

            GameObject textObj = new GameObject("ProgressText");
            textObj.transform.SetParent(transform, false);
            progressText = textObj.AddComponent<Text>();
            progressText.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            progressText.fontSize = 24;
            progressText.alignment = TextAnchor.MiddleCenter;
            progressText.color = Color.white;
            RectTransform textRect = textObj.GetComponent<RectTransform>();
            textRect.anchorMin = new Vector2(0.5f, 0.25f);
            textRect.anchorMax = new Vector2(0.5f, 0.25f);
            textRect.sizeDelta = new Vector2(200, 40);
            textRect.anchoredPosition = Vector2.zero;

            if (loadingTips == null || loadingTips.Length == 0)
            {
                loadingTips = new string[]
                {
                    "正在加载资源...",
                    "稍等片刻马上就好...",
                    "正在准备游戏内容..."
                };
            }

            GameObject tipObj = new GameObject("LoadingTip");
            tipObj.transform.SetParent(transform, false);
            loadingTipText = tipObj.AddComponent<Text>();
            loadingTipText.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            loadingTipText.fontSize = 18;
            loadingTipText.alignment = TextAnchor.MiddleCenter;
            loadingTipText.color = new Color(0.7f, 0.7f, 0.7f, 1f);
            RectTransform tipRect = tipObj.GetComponent<RectTransform>();
            tipRect.anchorMin = new Vector2(0.5f, 0.5f);
            tipRect.anchorMax = new Vector2(0.5f, 0.5f);
            tipRect.sizeDelta = new Vector2(500, 30);
            tipRect.anchoredPosition = Vector2.zero;
        }

        public void Show()
        {
            if (IsVisible) return;

            gameObject.SetActive(true);
            canvasGroup.interactable = true;
            canvasGroup.blocksRaycasts = true;
            IsVisible = true;
            _currentProgress = 0f;
            _targetProgress = 0f;

            if (loadingTipText != null && loadingTips != null && loadingTips.Length > 0)
            {
                loadingTipText.text = loadingTips[Random.Range(0, loadingTips.Length)];
            }

            if (_fadeCoroutine != null)
            {
                StopCoroutine(_fadeCoroutine);
            }
            _fadeCoroutine = StartCoroutine(Fade(0f, 1f, fadeDuration));

            UpdateProgress(0f);
        }

        public void Hide()
        {
            if (!IsVisible) return;

            if (_fadeCoroutine != null)
            {
                StopCoroutine(_fadeCoroutine);
            }
            _fadeCoroutine = StartCoroutine(Fade(1f, 0f, fadeDuration, OnHideComplete));
        }

        public void HideImmediate()
        {
            canvasGroup.alpha = 0f;
            canvasGroup.interactable = false;
            canvasGroup.blocksRaycasts = false;
            gameObject.SetActive(false);
            IsVisible = false;
        }

        private void OnHideComplete()
        {
            canvasGroup.interactable = false;
            canvasGroup.blocksRaycasts = false;
            gameObject.SetActive(false);
            IsVisible = false;
        }

        public void UpdateProgress(float progress)
        {
            _targetProgress = Mathf.Clamp01(progress);

            if (progressText != null)
            {
                progressText.text = $"{Mathf.RoundToInt(_targetProgress * 100)}%";
            }
        }

        public void SetSceneName(string sceneName)
        {
            if (sceneNameText != null)
            {
                sceneNameText.text = sceneName;
            }
        }

        private void Update()
        {
            if (IsVisible)
            {
                _currentProgress = Mathf.Lerp(_currentProgress, _targetProgress, Time.unscaledDeltaTime * smoothSpeed);

                if (progressBarFill != null)
                {
                    RectTransform rect = progressBarFill.GetComponent<RectTransform>();
                    rect.localScale = new Vector3(_currentProgress, 1f, 1f);
                }
            }
        }

        private IEnumerator Fade(float startAlpha, float endAlpha, float duration, System.Action onComplete = null)
        {
            float elapsed = 0f;

            while (elapsed < duration)
            {
                elapsed += Time.unscaledDeltaTime;
                float t = elapsed / duration;
                canvasGroup.alpha = Mathf.Lerp(startAlpha, endAlpha, t);
                yield return null;
            }

            canvasGroup.alpha = endAlpha;
            onComplete?.Invoke();
        }
    }
}
