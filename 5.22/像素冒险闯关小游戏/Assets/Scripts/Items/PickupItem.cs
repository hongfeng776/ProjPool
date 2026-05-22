using UnityEngine;

namespace PixelAdventure.Items
{
    [RequireComponent(typeof(Collider2D))]
    public class PickupItem : MonoBehaviour
    {
        [Header("道具数据")]
        [SerializeField] private ItemData itemData;
        [SerializeField] private string itemId;

        [Header("引用")]
        [SerializeField] private SpriteRenderer spriteRenderer;
        [SerializeField] private Collider2D pickupCollider;

        [Header("设置")]
        [SerializeField] private LayerMask playerLayer;
        [SerializeField] private string playerTag = "Player";

        private Vector3 _startPosition;
        private float _floatOffset;
        private bool _isPickedUp;

        public ItemData ItemData => itemData;
        public string ItemId => itemId;
        public bool IsPickedUp => _isPickedUp;

        private void Awake()
        {
            InitializeComponents();
            _startPosition = transform.position;
            _floatOffset = Random.Range(0f, Mathf.PI * 2f);
        }

        private void InitializeComponents()
        {
            if (spriteRenderer == null)
            {
                spriteRenderer = GetComponent<SpriteRenderer>();
                if (spriteRenderer == null)
                {
                    spriteRenderer = gameObject.AddComponent<SpriteRenderer>();
                }
            }

            if (pickupCollider == null)
            {
                pickupCollider = GetComponent<Collider2D>();
                if (pickupCollider != null)
                {
                    pickupCollider.isTrigger = true;
                }
            }

            if (itemData != null)
            {
                ApplyItemData();
            }
            else
            {
                CreateDefaultItem();
            }

            if (string.IsNullOrEmpty(itemId))
            {
                itemId = System.Guid.NewGuid().ToString();
            }
        }

        private void CreateDefaultItem()
        {
            spriteRenderer.sprite = CreateDefaultSprite();
            spriteRenderer.color = Color.yellow;
        }

        private Sprite CreateDefaultSprite()
        {
            Texture2D texture = new Texture2D(16, 16);
            Color[] colors = new Color[16 * 16];

            for (int i = 0; i < colors.Length; i++)
            {
                colors[i] = Color.clear;
            }

            int centerX = 8, centerY = 8, radius = 6;
            for (int y = 0; y < 16; y++)
            {
                for (int x = 0; x < 16; x++)
                {
                    int dx = x - centerX;
                    int dy = y - centerY;
                    if (dx * dx + dy * dy <= radius * radius)
                    {
                        colors[y * 16 + x] = Color.yellow;
                    }
                }
            }

            texture.SetPixels(colors);
            texture.Apply();
            texture.filterMode = FilterMode.Point;

            Rect rect = new Rect(0, 0, 16, 16);
            Vector2 pivot = new Vector2(0.5f, 0.5f);
            return Sprite.Create(texture, rect, pivot, 16f);
        }

        private void ApplyItemData()
        {
            if (itemData.icon != null)
            {
                spriteRenderer.sprite = itemData.icon;
            }
            spriteRenderer.color = itemData.color;
        }

        public void SetItemData(ItemData data)
        {
            itemData = data;
            ApplyItemData();
        }

        private void Update()
        {
            if (_isPickedUp) return;

            PlayAnimation();
        }

        private void PlayAnimation()
        {
            if (itemData == null) return;

            if (itemData.floatAnimation)
            {
                float y = _startPosition.y + Mathf.Sin(Time.time * itemData.floatSpeed + _floatOffset) * itemData.floatHeight;
                transform.position = new Vector3(transform.position.x, y, transform.position.z);
            }

            if (itemData.rotateAnimation)
            {
                transform.Rotate(0, itemData.rotateSpeed * Time.deltaTime, 0);
            }
        }

        private void OnTriggerEnter2D(Collider2D other)
        {
            if (_isPickedUp) return;

            if (other.CompareTag(playerTag) || IsInLayerMask(other.gameObject.layer, playerLayer))
            {
                OnPickedUp(other.gameObject);
            }
        }

        private bool IsInLayerMask(int layer, LayerMask layerMask)
        {
            return ((1 << layer) & layerMask) != 0;
        }

        private void OnPickedUp(GameObject player)
        {
            _isPickedUp = true;
            Debug.Log($"[PickupItem] 拾取道具: {itemData?.itemName ?? itemId}, 价值: {itemData?.value ?? 1}");

            ItemManager.Instance?.AddItem(this);

            if (itemData != null && itemData.playSound)
            {
            }

            if (itemData != null && itemData.showEffect)
            {
            }

            if (itemData != null && itemData.destroyOnPickup)
            {
                if (itemData.destroyDelay > 0)
                {
                    Destroy(gameObject, itemData.destroyDelay);
                }
                else
                {
                    Destroy(gameObject);
                }
            }
            else
            {
                gameObject.SetActive(false);
            }
        }

        public void Respawn()
        {
            _isPickedUp = false;
            gameObject.SetActive(true);
            transform.position = _startPosition;
        }

        private void OnDrawGizmosSelected()
        {
            if (pickupCollider != null)
            {
                Gizmos.color = Color.yellow;
                Gizmos.DrawWireSphere(transform.position, 0.5f);
            }
        }
    }
}
