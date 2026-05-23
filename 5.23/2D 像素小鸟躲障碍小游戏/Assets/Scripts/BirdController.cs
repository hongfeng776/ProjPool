using UnityEngine;

public class BirdController : MonoBehaviour
{
    [Header("跳跃设置")]
    public float jumpForce = 7.5f;
    public float maxFallSpeed = -15f;
    public float jumpCooldown = 0.1f;
    
    [Header("旋转设置")]
    public float rotationSpeed = 8f;
    public float maxFallRotation = -75f;
    public float maxRiseRotation = 45f;
    
    [Header("碰撞设置")]
    public float collisionRadius = 0.4f;
    public Vector2 collisionOffset = Vector2.zero;
    public bool showCollisionGizmo = true;
    
    [Header("视觉效果")]
    public SpriteRenderer spriteRenderer;
    public Color jumpColor = Color.yellow;
    public float colorChangeDuration = 0.1f;
    public Color hitColor = Color.red;
    
    private Rigidbody2D rb;
    private bool isDead = false;
    private bool canJump = true;
    private float lastJumpTime;
    private Color originalColor;
    private CircleCollider2D circleCollider;

    void Start()
    {
        rb = GetComponent<Rigidbody2D>();
        circleCollider = GetComponent<CircleCollider2D>();
        
        if (spriteRenderer == null)
        {
            spriteRenderer = GetComponent<SpriteRenderer>();
        }
        
        if (spriteRenderer != null)
        {
            originalColor = spriteRenderer.color;
        }
        
        gameObject.layer = LayerMask.NameToLayer("Bird");
        
        if (circleCollider == null)
        {
            circleCollider = gameObject.AddComponent<CircleCollider2D>();
            circleCollider.radius = collisionRadius;
            circleCollider.offset = collisionOffset;
        }
    }

    void Update()
    {
        if (isDead) return;
        
        CheckJumpInput();
        UpdateRotation();
        LimitFallSpeed();
    }

    void CheckJumpInput()
    {
        bool jumpPressed = Input.GetMouseButtonDown(0) || 
                           Input.GetKeyDown(KeyCode.Space) ||
                           (Input.touchCount > 0 && Input.GetTouch(0).phase == TouchPhase.Began);
        
        bool canJumpNow = canJump && Time.time >= lastJumpTime + jumpCooldown;
        
        if (GameManager.Instance != null)
        {
            canJumpNow = canJumpNow && (!GameManager.Instance.IsPlaying || !isDead);
        }
        
        if (jumpPressed && canJumpNow)
        {
            Jump();
        }
    }

    void Jump()
    {
        if (GameManager.Instance != null && !GameManager.Instance.IsPlaying)
        {
            GameManager.Instance.StartGame(true);
        }
        
        if (rb == null)
        {
            rb = GetComponent<Rigidbody2D>();
        }
        
        if (rb != null)
        {
            rb.velocity = Vector2.up * jumpForce;
            lastJumpTime = Time.time;
            JumpEffect();
        }
    }

    void JumpEffect()
    {
        if (spriteRenderer != null)
        {
            StopAllCoroutines();
            StartCoroutine(JumpColorEffect());
        }
    }

    System.Collections.IEnumerator JumpColorEffect()
    {
        spriteRenderer.color = jumpColor;
        yield return new WaitForSeconds(colorChangeDuration);
        spriteRenderer.color = originalColor;
    }

    void UpdateRotation()
    {
        if (rb == null) return;
        
        float velocityY = rb.velocity.y;
        float targetRotation = Mathf.Lerp(maxFallRotation, maxRiseRotation, 
                                         Mathf.InverseLerp(maxFallSpeed, jumpForce, velocityY));
        
        transform.rotation = Quaternion.Lerp(transform.rotation, 
                                            Quaternion.Euler(0, 0, targetRotation), 
                                            rotationSpeed * Time.deltaTime);
    }

    void LimitFallSpeed()
    {
        if (rb == null) return;
        
        if (rb.velocity.y < maxFallSpeed)
        {
            rb.velocity = new Vector2(rb.velocity.x, maxFallSpeed);
        }
    }

    void OnCollisionEnter2D(Collision2D collision)
    {
        Die();
    }

    void OnTriggerEnter2D(Collider2D other)
    {
    }

    void Die()
    {
        if (isDead) return;
        
        isDead = true;
        canJump = false;
        
        if (spriteRenderer != null)
        {
            StopAllCoroutines();
            spriteRenderer.color = hitColor;
        }
        
        if (rb != null)
        {
            rb.velocity = new Vector2(0, 5f);
            rb.gravityScale = 3f;
        }
        
        Debug.Log($"小鸟死亡！最终得分: {GameManager.Instance?.score}");
        
        if (GameManager.Instance != null)
        {
            GameManager.Instance.GameOver();
        }
    }

    void OnCollisionEnter2D(Collision2D collision)
    {
        string colliderName = collision.collider.name;
        string layerName = LayerMask.LayerToName(collision.gameObject.layer);
        
        Debug.Log($"碰撞检测: {colliderName} (层: {layerName})");
        
        if (collision.gameObject.layer == LayerMask.NameToLayer("Obstacle") ||
            collision.gameObject.layer == LayerMask.NameToLayer("Ground"))
        {
            Die();
        }
    }

    void OnDrawGizmos()
    {
        if (showCollisionGizmo)
        {
            Gizmos.color = isDead ? Color.red : Color.green;
            Vector2 center = (Vector2)transform.position + collisionOffset;
            Gizmos.DrawWireSphere(center, collisionRadius);
        }
    }

    public void ResetBird()
    {
        isDead = false;
        canJump = true;
        
        transform.position = new Vector3(-2f, 0, 0);
        transform.rotation = Quaternion.identity;
        
        if (rb == null)
        {
            rb = GetComponent<Rigidbody2D>();
        }
        
        if (rb != null)
        {
            rb.velocity = Vector2.zero;
            rb.gravityScale = 2f;
        }
        
        if (spriteRenderer != null)
        {
            spriteRenderer.color = originalColor;
        }
    }
}
