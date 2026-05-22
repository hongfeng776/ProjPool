using UnityEngine;
using System.Collections.Generic;
using PixelAdventure.Items;

namespace PixelAdventure.UI.HUD
{
    public class HUDController : MonoBehaviour
    {
        [Header("HUD设置")]
        [SerializeField] private bool showOnStart = true;
        [SerializeField] private Transform counterContainer;

        [Header("道具计数器")]
        [SerializeField] private List<ItemCounterUI> itemCounters = new List<ItemCounterUI>();

        [Header("预设")]
        [SerializeField] private GameObject itemCounterPrefab;

        private Canvas _canvas;

        public bool IsVisible { get; private set; }

        private void Awake()
        {
            InitializeComponents();
        }

        private void Start()
        {
            InitializeCounters();
            SetVisible(showOnStart);
        }

        private void InitializeComponents()
        {
            _canvas = GetComponent<Canvas>();
            if (_canvas == null)
            {
                _canvas = gameObject.AddComponent<Canvas>();
                _canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                _canvas.sortingOrder = 100;
            }

            if (counterContainer == null)
            {
                GameObject container = new GameObject("CounterContainer");
                container.transform.SetParent(transform, false);
                counterContainer = container.transform;

                RectTransform rect = container.AddComponent<RectTransform>();
                rect.anchorMin = new Vector2(0f, 1f);
                rect.anchorMax = new Vector2(1f, 1f);
                rect.pivot = new Vector2(0.5f, 1f);
                rect.anchoredPosition = new Vector2(0f, -10f);
                rect.sizeDelta = new Vector2(0f, 60f);
            }
        }

        private void InitializeCounters()
        {
            if (itemCounters.Count == 0)
            {
                CreateDefaultCounters();
            }
        }

        private void CreateDefaultCounters()
        {
            CreateCounter(ItemType.Coin, new Vector2(-150f, 0f));
            CreateCounter(ItemType.Gem, new Vector2(0f, 0f));
            CreateCounter(ItemType.Star, new Vector2(150f, 0f));
        }

        private void CreateCounter(ItemType type, Vector2 position)
        {
            if (itemCounterPrefab != null)
            {
                GameObject counterObj = Instantiate(itemCounterPrefab, counterContainer);
                RectTransform rect = counterObj.GetComponent<RectTransform>();
                rect.anchoredPosition = position;

                ItemCounterUI counter = counterObj.GetComponent<ItemCounterUI>();
                if (counter != null)
                {
                    counter.SetDisplayType(type);
                    itemCounters.Add(counter);
                }
            }
            else
            {
                GameObject counterObj = new GameObject($"Counter_" + type.ToString());
                counterObj.transform.SetParent(counterContainer, false);

                RectTransform rect = counterObj.AddComponent<RectTransform>();
                rect.sizeDelta = new Vector2(120f, 50f);
                rect.anchoredPosition = position;

                ItemCounterUI counter = counterObj.AddComponent<ItemCounterUI>();
                counter.SetDisplayType(type);
                itemCounters.Add(counter);
            }
        }

        public void SetVisible(bool visible)
        {
            IsVisible = visible;
            gameObject.SetActive(visible);
        }

        public void Show()
        {
            SetVisible(true);
        }

        public void Hide()
        {
            SetVisible(false);
        }

        public void RefreshAllCounters()
        {
            foreach (ItemCounterUI counter in itemCounters)
            {
                counter.Refresh();
            }
        }

        public void AddCounter(ItemType type)
        {
            CreateCounter(type, Vector2.zero);
        }

        public void RemoveCounter(ItemType type)
        {
            for (int i = itemCounters.Count - 1; i >= 0; i--)
            {
                if (itemCounters[i] != null)
                {
                    Destroy(itemCounters[i].gameObject);
                }
            }
            itemCounters.Clear();
        }
    }
}
