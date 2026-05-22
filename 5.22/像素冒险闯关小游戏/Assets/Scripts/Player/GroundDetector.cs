using UnityEngine;

namespace PixelAdventure.Player
{
    public class GroundDetector : MonoBehaviour
    {
        [Header("检测设置")]
        [SerializeField] private float checkRadius = 0.2f;
        [SerializeField] private LayerMask groundLayer;
        [SerializeField] private Transform[] checkPoints;

        [Header("事件")]
        public System.Action OnGrounded;
        public System.Action OnAirborne;

        private bool _isGrounded;
        private bool _wasGrounded;

        public bool IsGrounded => _isGrounded;
        public bool WasGrounded => _wasGrounded;

        private void Awake()
        {
            if (checkPoints == null || checkPoints.Length == 0)
            {
                checkPoints = new Transform[1];
                checkPoints[0] = transform;
            }
        }

        private void Update()
        {
            _wasGrounded = _isGrounded;
            _isGrounded = CheckGrounded();

            if (_isGrounded && !_wasGrounded)
            {
                OnGrounded?.Invoke();
            }
            else if (!_isGrounded && _wasGrounded)
            {
                OnAirborne?.Invoke();
            }
        }

        private bool CheckGrounded()
        {
            foreach (Transform point in checkPoints)
            {
                if (point == null) continue;

                Collider2D hit = Physics2D.OverlapCircle(point.position, checkRadius, groundLayer);
                if (hit != null)
                {
                    return true;
                }
            }
            return false;
        }

        public void SetGroundLayer(LayerMask layer)
        {
            groundLayer = layer;
        }

        public void SetCheckRadius(float radius)
        {
            checkRadius = radius;
        }

        private void OnDrawGizmosSelected()
        {
            if (checkPoints == null) return;

            Gizmos.color = _isGrounded ? Color.green : Color.red;
            foreach (Transform point in checkPoints)
            {
                if (point != null)
                {
                    Gizmos.DrawWireSphere(point.position, checkRadius);
                }
            }
        }
    }
}
