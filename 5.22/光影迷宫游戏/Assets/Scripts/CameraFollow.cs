using UnityEngine;

namespace LightAndShadowMaze
{
    public class CameraFollow : MonoBehaviour
    {
        [Header("Target")]
        public Transform target;
        public Vector3 offset = new Vector3(0f, 15f, -10f);

        [Header("Settings")]
        public float followSpeed = 8f;
        public float rotationSpeed = 5f;
        public bool useRotation = false;

        [Header("Zoom")]
        public float minZoom = 8f;
        public float maxZoom = 20f;
        public float zoomSpeed = 2f;
        private float currentZoom;

        [Header("Collision")]
        public bool avoidObstacles = true;
        public float collisionRadius = 0.5f;
        public LayerMask obstacleLayer;

        private Vector3 desiredPosition;
        private Vector3 smoothVelocity;

        private void Start()
        {
            currentZoom = offset.magnitude;
            
            if (target == null)
            {
                PlayerController player = FindObjectOfType<PlayerController>();
                if (player != null)
                {
                    target = player.GetCameraTarget() ?? player.transform;
                }
            }
        }

        private void LateUpdate()
        {
            if (target == null) return;

            HandleZoom();
            UpdateDesiredPosition();
            
            if (avoidObstacles)
            {
                HandleObstacleAvoidance();
            }

            UpdateCameraPosition();
            
            if (useRotation)
            {
                UpdateCameraRotation();
            }
            else
            {
                transform.LookAt(target.position + Vector3.up * 0.5f);
            }
        }

        private void HandleZoom()
        {
            float scrollInput = Input.GetAxis("Mouse ScrollWheel");
            currentZoom -= scrollInput * zoomSpeed;
            currentZoom = Mathf.Clamp(currentZoom, minZoom, maxZoom);
        }

        private void UpdateDesiredPosition()
        {
            Vector3 normalizedOffset = offset.normalized * currentZoom;
            desiredPosition = target.position + normalizedOffset;
        }

        private void HandleObstacleAvoidance()
        {
            Vector3 direction = desiredPosition - target.position;
            float distance = direction.magnitude;
            
            if (Physics.SphereCast(
                target.position,
                collisionRadius,
                direction.normalized,
                out RaycastHit hit,
                distance,
                obstacleLayer))
            {
                desiredPosition = hit.point - direction.normalized * collisionRadius;
            }
        }

        private void UpdateCameraPosition()
        {
            transform.position = Vector3.SmoothDamp(
                transform.position,
                desiredPosition,
                ref smoothVelocity,
                1f / followSpeed);
        }

        private void UpdateCameraRotation()
        {
            Quaternion targetRotation = Quaternion.LookRotation(target.position - transform.position);
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationSpeed * Time.deltaTime);
        }

        public void SetTarget(Transform newTarget)
        {
            target = newTarget;
        }
    }
}
