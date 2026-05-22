using UnityEngine;

namespace PixelAdventure.Player
{
    [RequireComponent(typeof(Rigidbody2D))]
    public class PlatformerPhysics : MonoBehaviour
    {
        [Header("移动参数")]
        [SerializeField] private float maxSpeed = 7f;
        [SerializeField] private float acceleration = 0.3f;
        [SerializeField] private float groundDeceleration = 0.5f;
        [SerializeField] private float airDeceleration = 0.2f;
        [SerializeField] private float maxFallSpeed = 16f;

        [Header("跳跃参数")]
        [SerializeField] private float jumpHeight = 3f;
        [SerializeField] private float jumpTime = 0.4f;
        [SerializeField] private float jumpApexBonus = 0.5f;
        [SerializeField] private float fallGravityMultiplier = 2f;

        [Header("墙跳参数")]
        [SerializeField] private bool enableWallJump = true;
        [SerializeField] private float wallJumpForce = 10f;
        [SerializeField] private float wallSlideSpeed = 2f;
        [SerializeField] private float wallStickTime = 0.1f;

        [Header("冲刺参数")]
        [SerializeField] private bool enableDash = true;
        [SerializeField] private float dashSpeed = 20f;
        [SerializeField] private float dashTime = 0.1f;
        [SerializeField] private float dashCooldown = 1f;
        [SerializeField] private int dashAmount = 1;

        private Rigidbody2D _rb;
        private Vector2 _velocity;
        private float _gravity;
        private float _jumpForce;
        private int _dashesRemaining;
        private float _dashCooldownTimer;
        private bool _isDashing;
        private float _dashDirection;
        private float _wallStickTimer;
        private bool _isWallSliding;

        public bool IsGrounded { get; set; }
        public bool IsTouchingWall { get; set; }
        public int WallDirection { get; set; }
        public float HorizontalInput { get; set; }
        public bool JumpPressed { get; set; }
        public bool JumpHeld { get; set; }
        public bool DashPressed { get; set; }

        private void Awake()
        {
            _rb = GetComponent<Rigidbody2D>();
            CalculatePhysicsValues();
        }

        private void CalculatePhysicsValues()
        {
            _gravity = -(2 * jumpHeight) / Mathf.Pow(jumpTime, 2);
            _jumpForce = Mathf.Abs(_gravity) * jumpTime;
        }

        public void UpdatePhysics()
        {
            if (_isDashing)
            {
                return;
            }

            UpdateDashCooldown();
            HandleHorizontalMovement();
            HandleJump();
            HandleGravity();
            HandleWallSlide();

            _velocity.y = Mathf.Max(_velocity.y, -maxFallSpeed);
            _rb.velocity = _velocity;
        }

        private void HandleHorizontalMovement()
        {
            float targetSpeed = HorizontalInput * maxSpeed;
            float deceleration = IsGrounded ? groundDeceleration : airDeceleration;

            if (Mathf.Abs(HorizontalInput) > 0.01f)
            {
                _velocity.x = Mathf.Lerp(_velocity.x, targetSpeed, acceleration);
            }
            else
            {
                _velocity.x = Mathf.Lerp(_velocity.x, 0f, deceleration);
            }

            if (Mathf.Abs(_velocity.x) < 0.01f)
            {
                _velocity.x = 0f;
            }
        }

        private void HandleJump()
        {
            if (JumpPressed)
            {
                if (IsGrounded)
                {
                    PerformJump();
                }
                else if (enableWallJump && IsTouchingWall)
                {
                    PerformWallJump();
                }
            }

            if (JumpHeld && _velocity.y > 0)
            {
                _velocity.y += jumpApexBonus * _gravity * Time.fixedDeltaTime;
            }
        }

        private void PerformJump()
        {
            _velocity.y = _jumpForce;
            _dashesRemaining = dashAmount;
        }

        private void PerformWallJump()
        {
            _velocity = new Vector2(-WallDirection * wallJumpForce * 0.7f, wallJumpForce);
            _dashesRemaining = dashAmount;
        }

        private void HandleGravity()
        {
            if (_velocity.y < 0)
            {
                _velocity.y += _gravity * fallGravityMultiplier * Time.fixedDeltaTime;
            }
            else
            {
                _velocity.y += _gravity * Time.fixedDeltaTime;
            }
        }

        private void HandleWallSlide()
        {
            if (!enableWallJump) return;

            if (IsTouchingWall && !IsGrounded && _velocity.y < 0)
            {
                _isWallSliding = true;
                _velocity.y = Mathf.Max(_velocity.y, -wallSlideSpeed);

                if (Mathf.Abs(HorizontalInput) < 0.01f)
                {
                    _wallStickTimer = wallStickTime;
                }
            }
            else
            {
                _isWallSliding = false;
            }

            if (_wallStickTimer > 0)
            {
                _wallStickTimer -= Time.fixedDeltaTime;
                _velocity.x = 0f;
            }
        }

        public void TryDash()
        {
            if (!enableDash || _dashCooldownTimer > 0 || _dashesRemaining <= 0) return;

            StartCoroutine(DashCoroutine());
        }

        private System.Collections.IEnumerator DashCoroutine()
        {
            _isDashing = true;
            _dashesRemaining--;
            _dashCooldownTimer = dashCooldown;

            float originalGravity = _rb.gravityScale;
            _rb.gravityScale = 0f;

            _dashDirection = HorizontalInput != 0 ? Mathf.Sign(HorizontalInput) : transform.localScale.x;
            _velocity = new Vector2(_dashDirection * dashSpeed, 0f);

            yield return new WaitForSeconds(dashTime);

            _rb.gravityScale = originalGravity;
            _isDashing = false;
            _velocity = Vector2.zero;
        }

        private void UpdateDashCooldown()
        {
            if (_dashCooldownTimer > 0)
            {
                _dashCooldownTimer -= Time.fixedDeltaTime;
            }
        }

        public void ResetVelocity()
        {
            _velocity = Vector2.zero;
            _rb.velocity = Vector2.zero;
        }

        public void SetVelocity(Vector2 velocity)
        {
            _velocity = velocity;
        }

        public Vector2 GetVelocity()
        {
            return _velocity;
        }

        private void OnValidate()
        {
            if (_rb != null)
            {
                CalculatePhysicsValues();
            }
        }
    }
}
