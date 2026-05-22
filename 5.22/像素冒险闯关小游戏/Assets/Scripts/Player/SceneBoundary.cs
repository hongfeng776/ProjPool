using UnityEngine;

namespace PixelAdventure.Player
{
    public class SceneBoundary : MonoBehaviour
    {
        [Header("边界设置")]
        [SerializeField] private Vector2 boundaryMin;
        [SerializeField] private Vector2 boundaryMax;
        [SerializeField] private bool autoCalculate = true;
        [SerializeField] private float padding = 0.5f;

        [Header("碰撞器")]
        [SerializeField] private bool createEdgeColliders = true;
        [SerializeField] private bool useTrigger = false;

        [Header("调试")]
        [SerializeField] private bool showGizmos = true;
        [SerializeField] private Color gizmoColor = Color.yellow;

        private EdgeCollider2D _edgeCollider;

        public Vector2 BoundaryMin => boundaryMin;
        public Vector2 BoundaryMax => boundaryMax;

        private void Awake()
        {
            if (autoCalculate)
            {
                CalculateBoundary();
            }

            if (createEdgeColliders)
            {
                CreateEdgeCollider();
            }
        }

        private void CalculateBoundary()
        {
            Camera mainCamera = Camera.main;
            if (mainCamera == null)
            {
                Debug.LogWarning("[SceneBoundary] 没有找到主摄像机");
                return;
            }

            float cameraHeight = mainCamera.orthographicSize * 2f;
            float cameraWidth = cameraHeight * mainCamera.aspect;

            boundaryMin = new Vector2(
                mainCamera.transform.position.x - cameraWidth / 2f + padding,
                mainCamera.transform.position.y - cameraHeight / 2f + padding
            );

            boundaryMax = new Vector2(
                mainCamera.transform.position.x + cameraWidth / 2f - padding,
                mainCamera.transform.position.y + cameraHeight / 2f - padding
            );

            Debug.Log($"[SceneBoundary] 自动计算边界: Min={boundaryMin}, Max={boundaryMax}");
        }

        private void CreateEdgeCollider()
        {
            _edgeCollider = gameObject.AddComponent<EdgeCollider2D>();
            _edgeCollider.isTrigger = useTrigger;

            Vector2[] points = new Vector2[]
            {
                new Vector2(boundaryMin.x, boundaryMin.y),
                new Vector2(boundaryMax.x, boundaryMin.y),
                new Vector2(boundaryMax.x, boundaryMax.y),
                new Vector2(boundaryMin.x, boundaryMax.y),
                new Vector2(boundaryMin.x, boundaryMin.y)
            };

            _edgeCollider.points = points;
        }

        public bool IsInsideBoundary(Vector2 position)
        {
            return position.x >= boundaryMin.x && position.x <= boundaryMax.x &&
                   position.y >= boundaryMin.y && position.y <= boundaryMax.y;
        }

        public Vector2 ClampToBoundary(Vector2 position)
        {
            position.x = Mathf.Clamp(position.x, boundaryMin.x, boundaryMax.x);
            position.y = Mathf.Clamp(position.y, boundaryMin.y, boundaryMax.y);
            return position;
        }

        public void SetBoundary(Vector2 min, Vector2 max)
        {
            boundaryMin = min;
            boundaryMax = max;

            if (_edgeCollider != null)
            {
                UpdateEdgeCollider();
            }
        }

        private void UpdateEdgeCollider()
        {
            Vector2[] points = new Vector2[]
            {
                new Vector2(boundaryMin.x, boundaryMin.y),
                new Vector2(boundaryMax.x, boundaryMin.y),
                new Vector2(boundaryMax.x, boundaryMax.y),
                new Vector2(boundaryMin.x, boundaryMax.y),
                new Vector2(boundaryMin.x, boundaryMin.y)
            };

            _edgeCollider.points = points;
        }

        private void OnTriggerEnter2D(Collider2D other)
        {
            if (!useTrigger) return;

            if (other.CompareTag("Player"))
            {
                Rigidbody2D rb = other.GetComponent<Rigidbody2D>();
                if (rb != null)
                {
                    Vector2 clampedPosition = ClampToBoundary(other.transform.position);
                    other.transform.position = clampedPosition;
                    rb.velocity = Vector2.zero;
                }
            }
        }

        private void OnDrawGizmos()
        {
            if (!showGizmos) return;

            Gizmos.color = gizmoColor;
            Vector3 center = (boundaryMin + boundaryMax) * 0.5f;
            Vector3 size = boundaryMax - boundaryMin;
            Gizmos.DrawWireCube(center, size);
        }
    }
}
