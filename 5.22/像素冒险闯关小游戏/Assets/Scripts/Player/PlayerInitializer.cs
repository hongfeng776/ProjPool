using UnityEngine;
using PixelAdventure.Core;

namespace PixelAdventure.Player
{
    public class PlayerInitializer : MonoBehaviour
    {
        [Header("玩家预制体")]
        [SerializeField] private GameObject playerPrefab;

        [Header("出生点设置")]
        [SerializeField] private Transform spawnPoint;
        [SerializeField] private Vector3 spawnPosition = Vector3.zero;

        [Header("边界设置")]
        [SerializeField] private bool setupBoundary = true;
        [SerializeField] private Vector2 boundaryMin = new Vector2(-10f, -5f);
        [SerializeField] private Vector2 boundaryMax = new Vector2(10f, 5f);

        [Header("图层设置")]
        [SerializeField] private string groundLayerName = "Ground";

        private GameObject _playerInstance;
        private PlayerController _playerController;

        private void Start()
        {
            InitializePlayer();
        }

        private void InitializePlayer()
        {
            if (playerPrefab == null)
            {
                CreateDefaultPlayer();
            }
            else
            {
                SpawnPlayerFromPrefab();
            }

            SetupPlayerBoundary();
        }

        private void CreateDefaultPlayer()
        {
            Debug.Log("[PlayerInitializer] 创建默认玩家对象");

            GameObject playerObject = new GameObject("Player");
            playerObject.tag = "Player";
            playerObject.layer = LayerMask.NameToLayer("Player");

            if (spawnPoint != null)
            {
                playerObject.transform.position = spawnPoint.position;
            }
            else
            {
                playerObject.transform.position = spawnPosition;
            }

            SpriteRenderer spriteRenderer = playerObject.AddComponent<SpriteRenderer>();
            spriteRenderer.sprite = CreateDefaultSprite();
            spriteRenderer.color = Color.cyan;

            Rigidbody2D rb = playerObject.AddComponent<Rigidbody2D>();
            rb.bodyType = RigidbodyType2D.Dynamic;
            rb.freezeRotation = true;
            rb.collisionDetectionMode = CollisionDetectionMode2D.Continuous;

            CapsuleCollider2D collider = playerObject.AddComponent<CapsuleCollider2D>();
            collider.size = new Vector2(0.8f, 1.6f);
            collider.offset = new Vector2(0f, 0.8f);

            _playerController = playerObject.AddComponent<PlayerController>();

            int groundLayer = LayerMask.NameToLayer(groundLayerName);
            if (groundLayer == -1)
            {
                Debug.LogWarning($"[PlayerInitializer] 图层 '{groundLayerName}' 不存在，请在 Project Settings 中创建");
                groundLayer = 1 << 0;
            }
            else
            {
                groundLayer = 1 << groundLayer;
            }

            _playerController.GetType()
                .GetField("groundLayer", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.SetValue(_playerController, groundLayer);

            _playerInstance = playerObject;
            _playerController = playerObject.GetComponent<PlayerController>();
        }

        private void SpawnPlayerFromPrefab()
        {
            Debug.Log("[PlayerInitializer] 从预制体生成玩家");

            Vector3 position = spawnPoint != null ? spawnPoint.position : spawnPosition;
            _playerInstance = Instantiate(playerPrefab, position, Quaternion.identity);
            _playerController = _playerInstance.GetComponent<PlayerController>();
        }

        private void SetupPlayerBoundary()
        {
            if (!setupBoundary || _playerController == null) return;

            _playerController.SetBoundary(boundaryMin, boundaryMax);
            _playerController.EnableBoundary(true);

            Debug.Log($"[PlayerInitializer] 设置玩家边界: Min={boundaryMin}, Max={boundaryMax}");
        }

        private Sprite CreateDefaultSprite()
        {
            Texture2D texture = new Texture2D(32, 32);
            Color[] colors = new Color[32 * 32];

            for (int i = 0; i < colors.Length; i++)
            {
                colors[i] = Color.clear;
            }

            for (int y = 8; y < 24; y++)
            {
                for (int x = 10; x < 22; x++)
                {
                    colors[y * 32 + x] = Color.white;
                }
            }

            texture.SetPixels(colors);
            texture.Apply();
            texture.filterMode = FilterMode.Point;

            Rect rect = new Rect(0, 0, 32, 32);
            Vector2 pivot = new Vector2(0.5f, 0.5f);
            return Sprite.Create(texture, rect, pivot, 16f);
        }

        public void RespawnPlayer()
        {
            if (_playerController != null)
            {
                Vector3 position = spawnPoint != null ? spawnPoint.position : spawnPosition;
                _playerController.Teleport(position);
            }
        }

        public GameObject GetPlayerInstance()
        {
            return _playerInstance;
        }

        public PlayerController GetPlayerController()
        {
            return _playerController;
        }
    }
}
