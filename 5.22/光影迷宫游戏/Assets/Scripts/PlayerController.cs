using UnityEngine;

namespace LightAndShadowMaze
{
    public class PlayerController : MonoBehaviour
    {
        [Header("Movement")]
        public float moveSpeed = 5f;
        public float rotationSpeed = 12f;
        public float groundCheckDistance = 0.2f;
        public LayerMask groundLayer;

        [Header("Collision")]
        public float collisionRadius = 0.4f;
        public float collisionHeight = 1.6f;
        public LayerMask wallLayer;
        public bool useGridCollisionCheck = true;

        [Header("Light Settings")]
        public Light playerLight;
        public float baseLightIntensity = 8f;
        public float baseLightRange = 12f;
        public Color lightColor = new Color(1f, 0.9f, 0.7f);
        public float lightHeight = 1.5f;
        public bool useSpotLight = true;
        public float spotAngle = 50f;

        [Header("Light Direction Control")]
        public LightDirectionController lightDirectionController;
        public bool enableMouseDragControl = true;
        public bool showLightIndicator = true;
        public KeyCode toggleLightTypeKey = KeyCode.L;

        [Header("References")]
        public Transform cameraTarget;

        private Rigidbody rb;
        private CapsuleCollider capsuleCollider;
        private Transform cameraTransform;
        private MazeGenerator mazeGenerator;

        private Vector3 moveDirection;
        private bool isGrounded;

        private void Awake()
        {
            SetupRigidbody();
            SetupCollider();
            SetupPlayerLight();
        }

        private void SetupRigidbody()
        {
            rb = GetComponent<Rigidbody>();
            if (rb == null)
            {
                rb = gameObject.AddComponent<Rigidbody>();
            }

            rb.mass = 1f;
            rb.drag = 8f;
            rb.angularDrag = 10f;
            rb.useGravity = true;
            rb.isKinematic = false;
            rb.interpolation = RigidbodyInterpolation.Interpolate;
            rb.collisionDetectionMode = CollisionDetectionMode.Continuous;
            rb.constraints = RigidbodyConstraints.FreezeRotation;
        }

        private void SetupCollider()
        {
            capsuleCollider = GetComponent<CapsuleCollider>();
            if (capsuleCollider == null)
            {
                capsuleCollider = gameObject.AddComponent<CapsuleCollider>();
            }

            capsuleCollider.height = collisionHeight;
            capsuleCollider.radius = collisionRadius;
            capsuleCollider.center = new Vector3(0, collisionHeight * 0.5f, 0);
            capsuleCollider.material = null;
            capsuleCollider.isTrigger = false;
        }

        private void SetupPlayerLight()
        {
            if (playerLight == null)
            {
                GameObject lightObj = new GameObject("PlayerLight");
                playerLight = lightObj.AddComponent<Light>();
                playerLight.type = useSpotLight ? LightType.Spot : LightType.Point;
                playerLight.shadows = LightShadows.Soft;
                playerLight.shadowStrength = 0.7f;
                playerLight.renderMode = LightRenderMode.Auto;
                
                if (useSpotLight)
                {
                    playerLight.spotAngle = spotAngle;
                    playerLight.innerSpotAngle = spotAngle * 0.5f;
                }
            }

            playerLight.intensity = baseLightIntensity;
            playerLight.range = baseLightRange;
            playerLight.color = lightColor;
        }

        private void SetupLightDirectionControl()
        {
            if (enableMouseDragControl && lightDirectionController == null)
            {
                GameObject controllerObj = new GameObject("LightDirectionController");
                lightDirectionController = controllerObj.AddComponent<LightDirectionController>();
                lightDirectionController.playerTransform = transform;
                lightDirectionController.targetLight = playerLight;
                lightDirectionController.useMouseDrag = enableMouseDragControl;
                lightDirectionController.autoFollowCamera = true;
                lightDirectionController.lightType = useSpotLight ? LightType.Spot : LightType.Point;
                lightDirectionController.spotAngle = spotAngle;
                lightDirectionController.innerSpotAngle = spotAngle * 0.5f;
                lightDirectionController.lightHeightOffset = lightHeight;
            }
        }

        private void Start()
        {
            cameraTransform = Camera.main?.transform;
            mazeGenerator = FindObjectOfType<MazeGenerator>();

            if (cameraTarget == null)
            {
                cameraTarget = new GameObject("CameraTarget").transform;
                cameraTarget.SetParent(transform);
                cameraTarget.localPosition = new Vector3(0, 1.5f, 0);
            }

            if (wallLayer == 0)
            {
                wallLayer = LayerMask.GetMask("Default");
            }

            SetupLightDirectionControl();
        }

        private void Update()
        {
            if (GameManager.Instance != null && 
                GameManager.Instance.CurrentState != GameManager.GameState.Playing)
            {
                return;
            }

            HandleInput();
            HandleLightControlInput();
            CheckGrounded();
        }

        private void HandleLightControlInput()
        {
            if (Input.GetKeyDown(toggleLightTypeKey))
            {
                ToggleLightType();
            }
        }

        private void ToggleLightType()
        {
            if (playerLight == null) return;

            useSpotLight = !useSpotLight;
            
            if (useSpotLight)
            {
                playerLight.type = LightType.Spot;
                playerLight.spotAngle = spotAngle;
                playerLight.innerSpotAngle = spotAngle * 0.5f;
            }
            else
            {
                playerLight.type = LightType.Point;
            }

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowHint(useSpotLight ? "聚光灯模式" : "泛光灯模式");
            }
        }

        private void FixedUpdate()
        {
            if (GameManager.Instance != null && 
                GameManager.Instance.CurrentState != GameManager.GameState.Playing)
            {
                rb.velocity = Vector3.zero;
                return;
            }

            if (moveDirection.magnitude > 0.1f)
            {
                HandleMovement();
                HandleRotation();
            }
            else
            {
                rb.velocity = new Vector3(0, rb.velocity.y, 0);
            }
        }

        private void HandleInput()
        {
            float horizontal = Input.GetAxis("Horizontal");
            float vertical = Input.GetAxis("Vertical");

            moveDirection = Vector3.zero;

            if (cameraTransform != null)
            {
                Vector3 forward = cameraTransform.forward;
                Vector3 right = cameraTransform.right;
                forward.y = 0;
                right.y = 0;
                forward.Normalize();
                right.Normalize();

                moveDirection = forward * vertical + right * horizontal;
            }
            else
            {
                moveDirection = new Vector3(horizontal, 0, vertical);
            }

            if (moveDirection.magnitude > 1f)
            {
                moveDirection.Normalize();
            }
        }

        private void HandleMovement()
        {
            Vector3 targetVelocity = moveDirection * moveSpeed;
            targetVelocity.y = rb.velocity.y;

            if (useGridCollisionCheck && mazeGenerator != null)
            {
                Vector3 nextPosition = transform.position + targetVelocity * Time.fixedDeltaTime;
                if (mazeGenerator.IsWallAtWorldPosition(nextPosition))
                {
                    return;
                }
            }

            if (CheckWallCollision(targetVelocity.normalized))
            {
                return;
            }

            rb.velocity = Vector3.Lerp(rb.velocity, targetVelocity, 15f * Time.fixedDeltaTime);
        }

        private bool CheckWallCollision(Vector3 direction)
        {
            float checkDistance = collisionRadius + 0.1f;
            Vector3 bottom = transform.position + Vector3.up * collisionRadius;
            Vector3 top = transform.position + Vector3.up * (collisionHeight - collisionRadius);

            if (Physics.CapsuleCast(bottom, top, collisionRadius * 0.8f, direction, checkDistance, wallLayer))
            {
                return true;
            }

            return false;
        }

        private void HandleRotation()
        {
            Quaternion targetRotation = Quaternion.LookRotation(moveDirection);
            rb.rotation = Quaternion.Slerp(rb.rotation, targetRotation, rotationSpeed * Time.fixedDeltaTime);
        }

        private void CheckGrounded()
        {
            isGrounded = Physics.Raycast(
                transform.position + Vector3.up * 0.1f,
                Vector3.down,
                groundCheckDistance + 0.1f,
                groundLayer
            );
        }

        public void SetLightIntensity(float intensity)
        {
            if (playerLight != null)
            {
                playerLight.intensity = intensity;
            }
        }

        public void SetLightRange(float range)
        {
            if (playerLight != null)
            {
                playerLight.range = range;
            }
        }

        public void SetLightColor(Color color)
        {
            if (playerLight != null)
            {
                playerLight.color = color;
            }
        }

        public void BoostLight(float intensityBoost, float rangeBoost, float duration)
        {
            if (playerLight != null)
            {
                playerLight.intensity = baseLightIntensity + intensityBoost;
                playerLight.range = baseLightRange + rangeBoost;
                CancelInvoke(nameof(ResetLight));
                Invoke(nameof(ResetLight), duration);
            }
        }

        private void ResetLight()
        {
            if (playerLight != null)
            {
                playerLight.intensity = baseLightIntensity;
                playerLight.range = baseLightRange;
            }
        }

        public void TeleportTo(Vector3 position)
        {
            if (rb != null)
            {
                rb.position = position;
                rb.velocity = Vector3.zero;
                rb.angularVelocity = Vector3.zero;
            }
            else
            {
                transform.position = position;
            }
        }

        public Transform GetCameraTarget()
        {
            return cameraTarget;
        }

        private void OnCollisionStay(Collision collision)
        {
            if (collision.gameObject.name.Contains("Wall") || collision.gameObject.name.Contains("wall"))
            {
                Vector3 pushDir = transform.position - collision.contacts[0].point;
                pushDir.y = 0;
                pushDir.Normalize();
                rb.AddForce(pushDir * 5f, ForceMode.VelocityChange);
            }
        }
    }
}
