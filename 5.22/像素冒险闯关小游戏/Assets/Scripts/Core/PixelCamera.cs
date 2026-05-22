using UnityEngine;

namespace PixelAdventure.Core
{
    [RequireComponent(typeof(Camera))]
    public class PixelCamera : MonoBehaviour
    {
        [Header("像素设置")]
        [SerializeField] private int pixelsPerUnit = 16;
        [SerializeField] private int targetHeight = 240;
        [SerializeField] private bool forceIntegerScale = true;

        private Camera _camera;
        private float _baseOrthographicSize;

        private void Awake()
        {
            _camera = GetComponent<Camera>();
            _camera.orthographic = true;
            
            CalculateOrthographicSize();
        }

        private void CalculateOrthographicSize()
        {
            _baseOrthographicSize = targetHeight / (pixelsPerUnit * 2f);
            _camera.orthographicSize = _baseOrthographicSize;
            
            if (forceIntegerScale)
            {
                float scale = Screen.height / (float)targetHeight;
                int integerScale = Mathf.Max(1, Mathf.FloorToInt(scale));
                _camera.orthographicSize = _baseOrthographicSize * (scale / integerScale);
            }
            
            Debug.Log($"[PixelCamera] 正交尺寸: {_camera.orthographicSize}");
        }

        private void OnPreRender()
        {
            _camera.transform.position = SnapToPixelGrid(_camera.transform.position);
        }

        private Vector3 SnapToPixelGrid(Vector3 position)
        {
            float pixelSize = 1f / pixelsPerUnit;
            position.x = Mathf.Round(position.x / pixelSize) * pixelSize;
            position.y = Mathf.Round(position.y / pixelSize) * pixelSize;
            return position;
        }

        private void OnValidate()
        {
            if (_camera == null)
            {
                _camera = GetComponent<Camera>();
            }
            CalculateOrthographicSize();
        }
    }
}
