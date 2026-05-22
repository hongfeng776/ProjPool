using UnityEngine;

namespace PlantSandbox.Core
{
    public class CameraController : MonoBehaviour
    {
        [Header("移动设置")]
        public float moveSpeed = 10f;
        public float zoomSpeed = 5f;
        public bool enableMovement = true;

        [Header("边界设置")]
        public bool useBounds = false;
        public Vector2 minBounds = new Vector2(-10f, -10f);
        public Vector2 maxBounds = new Vector2(10f, 10f);

        [Header("缩放设置")]
        public float minZoom = 5f;
        public float maxZoom = 20f;

        private Camera cam;
        private Vector3 targetPosition;

        private void Start()
        {
            cam = GetComponent<Camera>();
            targetPosition = transform.position;
        }

        private void Update()
        {
            if (!enableMovement) return;

            HandleMovement();
            HandleZoom();
        }

        private void HandleMovement()
        {
            float horizontal = Input.GetAxis("Horizontal");
            float vertical = Input.GetAxis("Vertical");

            Vector3 moveDirection = new Vector3(horizontal, vertical, 0f);
            targetPosition += moveDirection * moveSpeed * Time.deltaTime;

            if (useBounds)
            {
                targetPosition.x = Mathf.Clamp(targetPosition.x, minBounds.x, maxBounds.x);
                targetPosition.y = Mathf.Clamp(targetPosition.y, minBounds.y, maxBounds.y);
            }

            transform.position = Vector3.Lerp(transform.position, targetPosition, Time.deltaTime * 5f);
        }

        private void HandleZoom()
        {
            if (cam == null) return;

            float scroll = Input.GetAxis("Mouse ScrollWheel");
            
            if (cam.orthographic)
            {
                cam.orthographicSize -= scroll * zoomSpeed;
                cam.orthographicSize = Mathf.Clamp(cam.orthographicSize, minZoom, maxZoom);
            }
            else
            {
                cam.fieldOfView -= scroll * zoomSpeed;
                cam.fieldOfView = Mathf.Clamp(cam.fieldOfView, minZoom, maxZoom);
            }
        }
    }
}
