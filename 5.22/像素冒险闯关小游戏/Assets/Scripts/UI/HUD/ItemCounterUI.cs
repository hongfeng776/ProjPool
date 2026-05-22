using UnityEngine;
using UnityEngine.UI;
using PixelAdventure.Items;

namespace PixelAdventure.UI.HUD
{
    public class ItemCounterUI : MonoBehaviour
    {
        [Header("显示设置")]
        [SerializeField] private ItemType displayType = ItemType.Coin;
        [SerializeField] private bool displayIcon = true;
        [SerializeField] private bool displayText = true;
        [SerializeField] private string formatString = "{0}";
        [SerializeField] private bool animateOnCollect = true;
        [SerializeField] private float animationScale = 1.2f;
        [SerializeField] private float animationDuration = 0.2f;

        [Header("引用")]
        [SerializeField] private Image iconImage;
        [SerializeField] private Text countText;
        [SerializeField] private Sprite defaultIcon;

        [Header("颜色设置")]
        [SerializeField] private Color defaultColor = Color.white;
        [SerializeField] private Color highlightColor = Color.yellow;

        private RectTransform _rectTransform;
        private Vector3 _originalScale;
        private Coroutine _animationCoroutine;
        private int _lastDisplayedCount = -1;

        private void Awake()
        {
            InitializeComponents();
        }

        private void Start()
        {
            InitializeUI();
            SubscribeToEvents();
            UpdateDisplay();
        }

        private void InitializeComponents()
        {
            _rectTransform = GetComponent<RectTransform>();
            if (_rectTransform != null)
            {
                _originalScale = _rectTransform.localScale;
            }

            if (iconImage == null)
            {
                Transform iconTransform = transform.Find("Icon");
                if (iconTransform != null)
                {
                    iconImage = iconTransform.GetComponent<Image>();
                }
            }

            if (countText == null)
            {
                Transform textTransform = transform.Find("CountText");
                if (textTransform != null)
                {
                    countText = textTransform.GetComponent<Text>();
                }
            }
        }

        private void InitializeUI()
        {
            if (iconImage != null && iconImage.sprite == null)
            {
                iconImage.sprite = defaultIcon != null ? defaultIcon : CreateDefaultIcon();
                iconImage.enabled = displayIcon;
            }

            if (countText != null)
            {
                countText.enabled = displayText;
                countText.color = defaultColor;
            }
        }

        private Sprite CreateDefaultIcon()
        {
            Texture2D texture = new Texture2D(16, 16);
            Color[] colors = new Color[16 * 16];

            for (int i = 0; i < colors.Length; i++)
            {
                colors[i] = Color.clear;
            }

            int cx = 8, cy = 8, r = 6;
            for (int y = 0; y < 16; y++)
            {
                for (int x = 0; x < 16; x++)
                {
                    int dx = x - cx;
                    int dy = y - cy;
                    if (dx * dx + dy * dy <= r * r)
                    {
                        colors[y * 16 + x] = GetColorForType(displayType);
                    }
                }
            }

            texture.SetPixels(colors);
            texture.Apply();
            texture.filterMode = FilterMode.Point;

            return Sprite.Create(texture, new Rect(0, 0, 16, 16), new Vector2(0.5f, 0.5f), 16f);
        }

        private Color GetColorForType(ItemType type)
        {
            switch (type)
            {
                case ItemType.Coin: return Color.yellow;
                case ItemType.Gem: return Color.cyan;
                case ItemType.Star: return Color.white;
                case ItemType.Key: return new Color(1f, 0.5f, 0f);
                case ItemType.Heart: return Color.red;
                case ItemType.PowerUp: return Color.green;
                default: return Color.gray;
            }
        }

        private void SubscribeToEvents()
        {
            if (ItemManager.Instance != null)
            {
                ItemManager.Instance.OnItemCountChanged += OnItemCountChanged;
                ItemManager.Instance.OnItemCollected += OnItemCollected;
            }
        }

        private void OnItemCountChanged(ItemType type, int count)
        {
            if (type == displayType)
            {
                UpdateDisplay();
            }
        }

        private void OnItemCollected(PickupItem item)
        {
            if (item.ItemData != null && item.ItemData.itemType == displayType && animateOnCollect)
            {
                PlayCollectAnimation();
            }
        }

        private void UpdateDisplay()
        {
            if (ItemManager.Instance == null) return;

            int count = ItemManager.Instance.GetItemCount(displayType);

            if (countText != null && displayText)
            {
                countText.text = string.Format(formatString, count);
            }

            _lastDisplayedCount = count;
        }

        private void PlayCollectAnimation()
        {
            if (_animationCoroutine != null)
            {
                StopCoroutine(_animationCoroutine);
            }

            _animationCoroutine = StartCoroutine(CollectAnimationCoroutine());
        }

        private System.Collections.IEnumerator CollectAnimationCoroutine()
        {
            if (_rectTransform == null) yield break;

            float elapsed = 0f;

            while (elapsed < animationDuration * 0.5f)
            {
                elapsed += Time.unscaledDeltaTime;
                float t = elapsed / (animationDuration * 0.5f);
                _rectTransform.localScale = Vector3.Lerp(_originalScale, _originalScale * animationScale, t);

                if (countText != null)
                {
                    countText.color = Color.Lerp(defaultColor, highlightColor, t);
                }

                yield return null;
            }

            elapsed = 0f;
            while (elapsed < animationDuration * 0.5f)
            {
                elapsed += Time.unscaledDeltaTime;
                float t = elapsed / (animationDuration * 0.5f);
                _rectTransform.localScale = Vector3.Lerp(_originalScale * animationScale, _originalScale, t);

                if (countText != null)
                {
                    countText.color = Color.Lerp(highlightColor, defaultColor, t);
                }

                yield return null;
            }

            _rectTransform.localScale = _originalScale;
            if (countText != null)
            {
                countText.color = defaultColor;
            }
        }

        public void SetDisplayType(ItemType type)
        {
            displayType = type;
            if (iconImage != null)
            {
                iconImage.sprite = CreateDefaultIcon();
            }
            UpdateDisplay();
        }

        public void Refresh()
        {
            UpdateDisplay();
        }

        private void OnDestroy()
        {
            if (ItemManager.Instance != null)
            {
                ItemManager.Instance.OnItemCountChanged -= OnItemCountChanged;
                ItemManager.Instance.OnItemCollected -= OnItemCollected;
            }
        }
    }
}
