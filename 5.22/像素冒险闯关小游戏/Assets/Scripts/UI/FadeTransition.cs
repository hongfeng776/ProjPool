using UnityEngine;
using UnityEngine.UI;
using System.Collections;

namespace PixelAdventure.UI
{
    public class FadeTransition : MonoBehaviour
    {
        [Header("引用")]
        [SerializeField] private CanvasGroup canvasGroup;
        [SerializeField] private Image fadeImage;

        [Header("设置")]
        [SerializeField] private Color fadeColor = Color.black;
        [SerializeField] private float defaultDuration = 0.3f;

        private Coroutine _fadeCoroutine;
        private Canvas _canvas;

        public bool IsFading { get; private set; }
        public float CurrentAlpha => canvasGroup != null ? canvasGroup.alpha : 0f;

        public void Initialize()
        {
            if (_canvas == null)
            {
                _canvas = GetComponent<Canvas>();
                if (_canvas == null)
                {
                    _canvas = gameObject.AddComponent<Canvas>();
                    _canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                    _canvas.sortingOrder = 10000;
                }
            }

            if (canvasGroup == null)
            {
                canvasGroup = gameObject.AddComponent<CanvasGroup>();
            }

            if (fadeImage == null)
            {
                GameObject imageObj = new GameObject("FadeImage");
                imageObj.transform.SetParent(transform, false);
                fadeImage = imageObj.AddComponent<Image>();
                fadeImage.color = fadeColor;
                RectTransform rect = imageObj.GetComponent<RectTransform>();
                rect.anchorMin = Vector2.zero;
                rect.anchorMax = Vector2.one;
                rect.offsetMin = Vector2.zero;
                rect.offsetMax = Vector2.zero;
            }

            canvasGroup.alpha = 0f;
            canvasGroup.interactable = false;
            canvasGroup.blocksRaycasts = false;
        }

        public IEnumerator FadeOut(float duration = -1f)
        {
            return Fade(0f, 1f, duration <= 0 ? defaultDuration : duration);
        }

        public IEnumerator FadeIn(float duration = -1f)
        {
            return Fade(1f, 0f, duration <= 0 ? defaultDuration : duration);
        }

        public IEnumerator Fade(float startAlpha, float endAlpha, float duration)
        {
            if (duration <= 0f)
            {
                SetAlpha(endAlpha);
                yield break;
            }

            IsFading = true;
            canvasGroup.interactable = true;
            canvasGroup.blocksRaycasts = true;

            if (_fadeCoroutine != null)
            {
                StopCoroutine(_fadeCoroutine);
            }

            _fadeCoroutine = StartCoroutine(FadeCoroutine(startAlpha, endAlpha, duration));
            yield return _fadeCoroutine;

            canvasGroup.interactable = false;
            canvasGroup.blocksRaycasts = false;
            IsFading = false;
        }

        private IEnumerator FadeCoroutine(float startAlpha, float endAlpha, float duration)
        {
            SetAlpha(startAlpha);

            float elapsed = 0f;

            while (elapsed < duration)
            {
                elapsed += Time.unscaledDeltaTime;
                float t = elapsed / duration;
                SetAlpha(Mathf.Lerp(startAlpha, endAlpha, t));
                yield return null;
            }

            SetAlpha(endAlpha);
        }

        public void SetAlpha(float alpha)
        {
            if (canvasGroup != null)
            {
                canvasGroup.alpha = alpha;
            }
        }

        public void SetColor(Color color)
        {
            fadeColor = color;
            if (fadeImage != null)
            {
                fadeImage.color = color;
            }
        }

        public void StopFade()
        {
            if (_fadeCoroutine != null)
            {
                StopCoroutine(_fadeCoroutine);
                _fadeCoroutine = null;
            }
            IsFading = false;
        }

        private void Awake()
        {
            Initialize();
        }
    }
}
