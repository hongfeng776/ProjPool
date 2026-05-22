using UnityEngine;
using PixelAdventure.Core;

namespace PixelAdventure.Player
{
    [RequireComponent(typeof(Rigidbody2D))]
    [RequireComponent(typeof(CapsuleCollider2D))]
    public class PlayerController : Singleton<PlayerController>
    {
        [Header("移动设置")]
        [SerializeField] private float moveSpeed = 5f;
        [SerializeField] private float acceleration = 15f;
        [SerializeField] private float deceleration = 20f;
        [SerializeField] private float velocityPower = 0.9f;
        [SerializeField] private float frictionAmount = 0.2f;

        [Header("跳跃设置")]
        [SerializeField] private float jumpForce = 12f;
        [SerializeField] private float jumpCutMultiplier = 0.5f;
        [SerializeField] private float coyoteTime = 0.1f;
        [SerializeField] private float jumpBufferTime = 0.1f;
        [SerializeField] private int maxJumps = 2;
        [SerializeField] private float fallGravityMultiplier = 1.5f;

        [Header("重力设置")]
        [SerializeField] private float gravityScale = 3f;

        [Header("检测设置")]
        [SerializeField] private Transform groundCheckPoint;
        [SerializeField] private float groundCheckRadius = 0.2f;
        [SerializeField] private LayerMask groundLayer;

        [Header("翻转设置")]
        [SerializeField] private bool flipOnMove = true;

        [Header("边界设置")]
        [SerializeField] private bool useBoundary = true;
        [SerializeField] private Vector2 boundaryMin;
        [SerializeField] private Vector2 boundaryMax;

        private Rigidbody2D _rb;
        private CapsuleCollider2D _collider;
        private SpriteRenderer _spriteRenderer;
        private Animator _animator;

        private Vector2 _moveInput;
        private bool _isGrounded;
        private bool _isJumping;
        private int _jumpCount;
        private float _coyoteTimeCounter;
        private float _jumpBufferCounter;
        private float _lastGroundedTime;
        private bool _isFacingRight = true;

        public float MoveSpeed => moveSpeed;
        public bool IsGrounded => _isGrounded;
        public bool IsJumping => _isJumping;
        public bool IsFalling => _rb.velocity.y < 0;
        public Vector2 Velocity => _rb.velocity;
        public bool IsFacingRight => _isFacingRight;

        protected override void Awake()
        {
            base.Awake();
            InitializeComponents();
        }

        private void InitializeComponents()
        {
            _rb = GetComponent<Rigidbody2D>();
            _collider = GetComponent<CapsuleCollider2D>();
            _spriteRenderer = GetComponent<SpriteRenderer>();
            _animator = GetComponent<Animator>();

            _rb.gravityScale = gravityScale;
            _rb.collisionDetectionMode = CollisionDetectionMode2D.Continuous;
            _rb.freezeRotation = true;

            if (groundCheckPoint == null)
            {
                GameObject checkPoint = new GameObject("GroundCheck");
                checkPoint.transform.SetParent(transform);
                checkPoint.transform.localPosition = new Vector3(0, -0.5f, 0);
                groundCheckPoint = checkPoint.transform;
            }
        }

        private void Update()
        {
            HandleInput();
            CheckGround();
            UpdateTimers();
            HandleJumpBuffer();
            UpdateAnimations();
        }

        private void FixedUpdate()
        {
            HandleMovement();
            HandleJump();
            ApplyGravity();
            ApplyFriction();
            ClampToBoundary();
        }

        private void HandleInput()
        {
            float horizontalInput = Input.GetAxisRaw("Horizontal");
            _moveInput = new Vector2(horizontalInput, 0f);

            if (Input.GetButtonDown("Jump"))
            {
                _jumpBufferCounter = jumpBufferTime;
            }

            if (Input.GetButtonUp("Jump"))
            {
                if (_rb.velocity.y > 0)
                {
                    _rb.velocity = new Vector2(_rb.velocity.x, _rb.velocity.y * jumpCutMultiplier);
                }
            }
        }

        private void HandleMovement()
        {
            float targetSpeed = _moveInput.x * moveSpeed;
            float speedDifference = targetSpeed - _rb.velocity.x;
            float accelerationRate = Mathf.Abs(targetSpeed) > 0.01f ? acceleration : deceleration;
            float movement = Mathf.Pow(Mathf.Abs(speedDifference) * accelerationRate, velocityPower) * Mathf.Sign(speedDifference);

            _rb.AddForce(movement * Vector2.right);

            if (Mathf.Abs(_rb.velocity.x) > moveSpeed)
            {
                _rb.velocity = new Vector2(Mathf.Sign(_rb.velocity.x) * moveSpeed, _rb.velocity.y);
            }

            if (flipOnMove && Mathf.Abs(_moveInput.x) > 0.01f)
            {
                Flip(_moveInput.x > 0);
            }
        }

        private void HandleJump()
        {
            if (_jumpBufferCounter > 0 && (_coyoteTimeCounter > 0 || _jumpCount < maxJumps))
            {
                PerformJump();
                _jumpBufferCounter = 0;
            }
        }

        private void PerformJump()
        {
            _rb.velocity = new Vector2(_rb.velocity.x, 0f);
            _rb.AddForce(Vector2.up * jumpForce, ForceMode2D.Impulse);
            _isJumping = true;
            _jumpCount++;
            _coyoteTimeCounter = 0;
            _jumpBufferCounter = 0;
        }

        private void CheckGround()
        {
            bool wasGrounded = _isGrounded;
            _isGrounded = Physics2D.OverlapCircle(groundCheckPoint.position, groundCheckRadius, groundLayer);

            if (_isGrounded)
            {
                _isJumping = false;
                _jumpCount = 0;
                _lastGroundedTime = Time.time;
                _coyoteTimeCounter = coyoteTime;
            }
            else if (wasGrounded)
            {
                _lastGroundedTime = Time.time;
            }
        }

        private void UpdateTimers()
        {
            if (!_isGrounded)
            {
                _coyoteTimeCounter -= Time.deltaTime;
            }
            _jumpBufferCounter -= Time.deltaTime;
        }

        private void HandleJumpBuffer()
        {
        }

        private void ApplyGravity()
        {
            if (_rb.velocity.y < 0)
            {
                _rb.gravityScale = gravityScale * fallGravityMultiplier;
            }
            else
            {
                _rb.gravityScale = gravityScale;
            }
        }

        private void ApplyFriction()
        {
            if (_isGrounded && Mathf.Abs(_moveInput.x) < 0.01f)
            {
                float friction = Mathf.Min(Mathf.Abs(_rb.velocity.x), frictionAmount);
                _rb.AddForce(-friction * Mathf.Sign(_rb.velocity.x) * Vector2.right, ForceMode2D.Impulse);
            }
        }

        private void ClampToBoundary()
        {
            if (!useBoundary) return;

            Vector3 position = transform.position;
            position.x = Mathf.Clamp(position.x, boundaryMin.x, boundaryMax.x);
            position.y = Mathf.Clamp(position.y, boundaryMin.y, boundaryMax.y);
            transform.position = position;

            if (position.x <= boundaryMin.x || position.x >= boundaryMax.x)
            {
                _rb.velocity = new Vector2(0, _rb.velocity.y);
            }

            if (position.y <= boundaryMin.y || position.y >= boundaryMax.y)
            {
                _rb.velocity = new Vector2(_rb.velocity.x, 0);
            }
        }

        public void Flip(bool faceRight)
        {
            if (_isFacingRight != faceRight)
            {
                _isFacingRight = faceRight;
                transform.localScale = new Vector3(faceRight ? 1 : -1, 1, 1);
            }
        }

        public void SetMoveSpeed(float speed)
        {
            moveSpeed = speed;
        }

        public void SetJumpForce(float force)
        {
            jumpForce = force;
        }

        public void SetBoundary(Vector2 min, Vector2 max)
        {
            boundaryMin = min;
            boundaryMax = max;
        }

        public void EnableBoundary(bool enable)
        {
            useBoundary = enable;
        }

        public void ResetVelocity()
        {
            _rb.velocity = Vector2.zero;
            _rb.angularVelocity = 0f;
        }

        public void Teleport(Vector3 position)
        {
            transform.position = position;
            ResetVelocity();
        }

        private void UpdateAnimations()
        {
            if (_animator == null) return;

            _animator.SetFloat("Speed", Mathf.Abs(_rb.velocity.x));
            _animator.SetBool("IsGrounded", _isGrounded);
            _animator.SetFloat("VelocityY", _rb.velocity.y);
            _animator.SetBool("IsJumping", _isJumping);
        }

        private void OnDrawGizmosSelected()
        {
            if (groundCheckPoint != null)
            {
                Gizmos.color = Color.red;
                Gizmos.DrawWireSphere(groundCheckPoint.position, groundCheckRadius);
            }

            if (useBoundary)
            {
                Gizmos.color = Color.yellow;
                Vector3 center = (boundaryMin + boundaryMax) * 0.5f;
                Vector3 size = boundaryMax - boundaryMin;
                Gizmos.DrawWireCube(center, size);
            }
        }
    }
}
