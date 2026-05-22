using UnityEngine;

namespace LightAndShadowMaze
{
    public class LightDirectionController : MonoBehaviour
    {
        [Header("Target")]
        public Light targetLight;
        public Transform playerTransform;

        [Header("Control Settings")]
        public bool useMouseDrag = true;
        public bool autoFollowCamera = true;
        public float rotationSpeed = 5f;
        public float smoothSpeed = 15f;
        public float maxHorizontalAngle = 85f;
        public float maxVerticalAngle = 60f;

        [Header("Light Settings")]
        public LightType lightType = LightType.Spot;
        public float spotAngle = 50f;
        public float innerSpotAngle = 25f;
        public float lightHeightOffset = 0.5f;

        [Header("Input")]
        public KeyCode resetKey = KeyCode.R;
        public KeyCode toggleControlModeKey = KeyCode.T;

        private Transform lightPivot;
        private Vector2 currentAngles;
        private Vector2 targetAngles;
        private bool isDragging;
        private bool isControlEnabled = true;

        private void Awake()
        {
            SetupLightPivot();
        }

        private void Start()
        {
            if (playerTransform == null)
            {
                PlayerController player = FindObjectOfType<PlayerController>();
                if (player != null)
                {
                    playerTransform = player.transform;
                }
            }

            if (targetLight != null)
            {
                targetLight.type = lightType;
                if (lightType == LightType.Spot)
                {
                    targetLight.spotAngle = spotAngle;
                    targetLight.innerSpotAngle = innerSpotAngle;
                }
            }
        }

        private void SetupLightPivot()
        {
            if (lightPivot == null)
            {
                GameObject pivotObj = new GameObject("LightPivot");
                pivotObj.transform.SetParent(transform);
                lightPivot = pivotObj.transform;
            }

            if (targetLight != null)
            {
                targetLight.transform.SetParent(lightPivot);
                targetLight.transform.localPosition = new Vector3(0, lightHeightOffset, 0);
                targetLight.transform.localRotation = Quaternion.identity;
            }
        }

        private void Update()
        {
            if (playerTransform != null)
            {
                transform.position = playerTransform.position;
            }

            HandleInput();
            UpdateLightRotation();
        }

        private void HandleInput()
        {
            if (!isControlEnabled) return;

            if (useMouseDrag)
            {
                if (Input.GetMouseButtonDown(1))
                {
                    isDragging = true;
                }
                if (Input.GetMouseButtonUp(1))
                {
                    isDragging = false;
                }

                if (isDragging)
                {
                    float mouseX = Input.GetAxis("Mouse X") * rotationSpeed;
                    float mouseY = Input.GetAxis("Mouse Y") * rotationSpeed;

                    targetAngles.x -= mouseY;
                    targetAngles.y += mouseX;

                    targetAngles.x = Mathf.Clamp(targetAngles.x, -maxVerticalAngle, maxVerticalAngle);
                    targetAngles.y = Mathf.Clamp(targetAngles.y, -maxHorizontalAngle, maxHorizontalAngle);
                }
            }

            if (Input.GetKeyDown(resetKey))
            {
                ResetLightDirection();
            }

            if (Input.GetKeyDown(toggleControlModeKey))
            {
                autoFollowCamera = !autoFollowCamera;
                if (UIManager.Instance != null)
                {
                    UIManager.Instance.ShowHint(autoFollowCamera ? "光源跟随相机" : "光源手动控制");
                }
            }
        }

        private void UpdateLightRotation()
        {
            if (autoFollowCamera && !isDragging && Camera.main != null)
            {
                Vector3 cameraForward = Camera.main.transform.forward;
                cameraForward.y = 0;
                cameraForward.Normalize();

                Quaternion targetRotation = Quaternion.LookRotation(cameraForward);
                Vector3 euler = targetRotation.eulerAngles;
                
                targetAngles.x = Mathf.LerpAngle(targetAngles.x, 10f, smoothSpeed * Time.deltaTime * 0.5f);
                targetAngles.y = Mathf.LerpAngle(targetAngles.y, euler.y, smoothSpeed * Time.deltaTime);
            }

            currentAngles = Vector2.Lerp(currentAngles, targetAngles, smoothSpeed * Time.deltaTime);
            lightPivot.localRotation = Quaternion.Euler(currentAngles.x, currentAngles.y, 0);
        }

        public void ResetLightDirection()
        {
            targetAngles = Vector2.zero;
            currentAngles = Vector2.zero;
            lightPivot.localRotation = Quaternion.identity;

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowHint("光源方向已重置");
            }
        }

        public void SetLightIntensity(float intensity)
        {
            if (targetLight != null)
            {
                targetLight.intensity = intensity;
            }
        }

        public void SetLightRange(float range)
        {
            if (targetLight != null)
            {
                targetLight.range = range;
            }
        }

        public void SetSpotAngle(float angle)
        {
            if (targetLight != null && targetLight.type == LightType.Spot)
            {
                targetLight.spotAngle = angle;
                targetLight.innerSpotAngle = angle * 0.5f;
            }
        }

        public void ToggleLightType()
        {
            if (targetLight == null) return;

            if (targetLight.type == LightType.Spot)
            {
                targetLight.type = LightType.Point;
            }
            else
            {
                targetLight.type = LightType.Spot;
                targetLight.spotAngle = spotAngle;
                targetLight.innerSpotAngle = innerSpotAngle;
            }
        }

        public Vector2 GetLightAngles()
        {
            return currentAngles;
        }

        public float GetHorizontalAngle()
        {
            return currentAngles.y;
        }

        public float GetVerticalAngle()
        {
            return currentAngles.x;
        }

        public Transform GetLightPivot()
        {
            return lightPivot;
        }
    }
}
