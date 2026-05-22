using UnityEngine;

namespace LightAndShadowMaze
{
    public class GameLauncher : MonoBehaviour
    {
        [Header("Maze Settings")]
        public int mazeWidth = 15;
        public int mazeHeight = 15;
        public float cellSize = 2f;

        [Header("Player Settings")]
        public GameObject playerPrefab;
        public float playerMoveSpeed = 5f;

        [Header("Game Objects")]
        public GameObject goalPrefab;
        public GameObject lightOrbPrefab;
        public int lightOrbCount = 5;

        [Header("Lighting")]
        public bool enableLightingEnhancer = true;
        public bool addTorches = true;
        public int torchCount = 8;

        [Header("Camera")]
        public Vector3 cameraOffset = new Vector3(0f, 12f, -8f);
        public float cameraFollowSpeed = 8f;

        [Header("UI")]
        public bool autoCreateUI = true;

        private MazeGenerator mazeGenerator;
        private MazeLightingEnhancer lightingEnhancer;
        private PlayerController player;
        private GameObject goal;
        private bool isGameStarted = false;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void AutoInitialize()
        {
            if (FindObjectOfType<GameLauncher>() == null)
            {
                GameObject launcherObj = new GameObject("GameLauncher");
                launcherObj.AddComponent<GameLauncher>();
            }
        }

        private void Awake()
        {
            InitializeGame();
        }

        private void Start()
        {
            Invoke(nameof(StartGame), 0.5f);
        }

        private void InitializeGame()
        {
            CreateGameManager();
            CreateLightingManager();
            CreateMazeGenerator();
            SetupCamera();

            if (autoCreateUI)
            {
                CreateUI();
            }

            if (enableLightingEnhancer)
            {
                CreateLightingEnhancer();
            }
        }

        private void CreateGameManager()
        {
            if (GameManager.Instance == null)
            {
                GameObject gmObj = new GameObject("GameManager");
                gmObj.AddComponent<GameManager>();
            }
        }

        private void CreateLightingManager()
        {
            if (LightingManager.Instance == null)
            {
                GameObject lmObj = new GameObject("LightingManager");
                lmObj.AddComponent<LightingManager>();
            }
        }

        private void CreateMazeGenerator()
        {
            GameObject mazeObj = new GameObject("MazeGenerator");
            mazeObj.transform.SetParent(transform);
            mazeGenerator = mazeObj.AddComponent<MazeGenerator>();
            
            mazeGenerator.width = mazeWidth;
            mazeGenerator.height = mazeHeight;
            mazeGenerator.cellSize = cellSize;
        }

        private void CreateLightingEnhancer()
        {
            GameObject enhancerObj = new GameObject("LightingEnhancer");
            enhancerObj.transform.SetParent(transform);
            lightingEnhancer = enhancerObj.AddComponent<MazeLightingEnhancer>();
            lightingEnhancer.addTorches = addTorches;
            lightingEnhancer.torchCount = torchCount;
        }

        private void CreateUI()
        {
            if (UIManager.Instance == null)
            {
                GameObject uiObj = new GameObject("UIManager");
                UIManager uiManager = uiObj.AddComponent<UIManager>();
            }
        }

        private void SetupCamera()
        {
            Camera mainCam = Camera.main;
            if (mainCam == null)
            {
                GameObject camObj = new GameObject("Main Camera");
                camObj.tag = "MainCamera";
                mainCam = camObj.AddComponent<Camera>();
                camObj.AddComponent<AudioListener>();
            }

            mainCam.clearFlags = CameraClearFlags.SolidColor;
            mainCam.backgroundColor = new Color(0.03f, 0.03f, 0.06f);
            mainCam.fieldOfView = 60f;
            mainCam.nearClipPlane = 0.1f;
            mainCam.farClipPlane = 150f;

            CameraFollow cameraFollow = mainCam.GetComponent<CameraFollow>();
            if (cameraFollow == null)
            {
                cameraFollow = mainCam.gameObject.AddComponent<CameraFollow>();
            }

            cameraFollow.offset = cameraOffset;
            cameraFollow.followSpeed = cameraFollowSpeed;
            cameraFollow.avoidObstacles = false;
        }

        public void StartGame()
        {
            if (isGameStarted)
            {
                RestartGame();
                return;
            }

            isGameStarted = true;
            mazeGenerator.Generate();
            SpawnPlayer();
            SpawnGoal();
            SpawnLightOrbs();
            PositionCamera();

            if (GameManager.Instance != null)
            {
                GameManager.Instance.ChangeState(GameManager.GameState.Playing);
            }

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowGameUI();
            }

            Debug.Log("🎮 光影迷宫游戏开始！找到绿色终点即可通关！");
            Debug.Log("⌨️  WASD移动 | 鼠标右键拖动光源 | L切换光源类型 | R重置光源");
        }

        public void RestartGame()
        {
            ClearGame();
            mazeGenerator.Generate();
            SpawnPlayer();
            SpawnGoal();
            SpawnLightOrbs();
            PositionCamera();

            if (GameManager.Instance != null)
            {
                GameManager.Instance.ChangeState(GameManager.GameState.Playing);
            }

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowGameUI();
            }
        }

        private void ClearGame()
        {
            if (player != null)
            {
                Destroy(player.gameObject);
            }

            if (goal != null)
            {
                Destroy(goal);
            }

            LightOrb[] orbs = FindObjectsOfType<LightOrb>();
            foreach (LightOrb orb in orbs)
            {
                Destroy(orb.gameObject);
            }
        }

        private void SpawnPlayer()
        {
            Vector3 spawnPos = mazeGenerator.GetStartWorldPosition();

            if (playerPrefab != null)
            {
                GameObject playerObj = Instantiate(playerPrefab, spawnPos, Quaternion.identity);
                player = playerObj.GetComponent<PlayerController>();
            }
            else
            {
                GameObject playerObj = CreatePlayerObject(spawnPos);
                player = playerObj.GetComponent<PlayerController>();
            }

            if (player != null)
            {
                player.moveSpeed = playerMoveSpeed;
                player.tag = "Player";
            }

            CameraFollow cameraFollow = Camera.main.GetComponent<CameraFollow>();
            if (cameraFollow != null && player != null)
            {
                cameraFollow.SetTarget(player.GetCameraTarget() ?? player.transform);
            }
        }

        private GameObject CreatePlayerObject(Vector3 position)
        {
            GameObject playerObj = new GameObject("Player");
            playerObj.transform.position = position;
            playerObj.tag = "Player";

            GameObject visual = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            visual.transform.SetParent(playerObj.transform);
            visual.transform.localPosition = new Vector3(0, 0.9f, 0);
            visual.transform.localScale = new Vector3(0.8f, 0.9f, 0.8f);
            
            Renderer renderer = visual.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material.color = new Color(0.2f, 0.6f, 1f);
            }

            Collider visualCollider = visual.GetComponent<Collider>();
            if (visualCollider != null)
            {
                Destroy(visualCollider);
            }

            PlayerController controller = playerObj.AddComponent<PlayerController>();
            
            return playerObj;
        }

        private void SpawnGoal()
        {
            Vector3 endPos = mazeGenerator.GetEndWorldPosition();

            if (goalPrefab != null)
            {
                goal = Instantiate(goalPrefab, endPos, Quaternion.identity);
            }
            else
            {
                goal = CreateGoalObject(endPos);
            }

            Goal goalScript = goal.GetComponent<Goal>();
            if (goalScript == null)
            {
                goalScript = goal.AddComponent<Goal>();
            }
        }

        private GameObject CreateGoalObject(Vector3 position)
        {
            GameObject goalObj = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            goalObj.name = "Goal";
            goalObj.transform.position = position;
            goalObj.transform.localScale = Vector3.one * 1.2f;

            Renderer renderer = goalObj.GetComponent<Renderer>();
            if (renderer != null)
            {
                Material mat = new Material(Shader.Find("Standard"));
                mat.color = new Color(0f, 1f, 0.6f);
                mat.EnableKeyword("_EMISSION");
                mat.SetColor("_EmissionColor", new Color(0f, 0.8f, 0.5f) * 0.6f);
                renderer.material = mat;
            }

            Collider collider = goalObj.GetComponent<Collider>();
            if (collider != null)
            {
                collider.isTrigger = true;
            }

            return goalObj;
        }

        private void SpawnLightOrbs()
        {
            for (int i = 0; i < lightOrbCount; i++)
            {
                Vector3? spawnPos = GetRandomValidPosition();
                if (spawnPos.HasValue)
                {
                    SpawnLightOrb(spawnPos.Value + Vector3.up * 1.2f);
                }
            }
        }

        private Vector3? GetRandomValidPosition()
        {
            int attempts = 100;
            for (int i = 0; i < attempts; i++)
            {
                int gridX = Random.Range(2, mazeWidth - 2);
                int gridY = Random.Range(2, mazeHeight - 2);

                if (!mazeGenerator.IsWallAtWorldPosition(new Vector3(gridX * cellSize, 0, gridY * cellSize)))
                {
                    return new Vector3(gridX * cellSize, 0, gridY * cellSize);
                }
            }
            return null;
        }

        private void SpawnLightOrb(Vector3 position)
        {
            GameObject orb;
            
            if (lightOrbPrefab != null)
            {
                orb = Instantiate(lightOrbPrefab, position, Quaternion.identity);
            }
            else
            {
                orb = CreateLightOrbObject(position);
            }

            if (orb.GetComponent<LightOrb>() == null)
            {
                orb.AddComponent<LightOrb>();
            }
        }

        private GameObject CreateLightOrbObject(Vector3 position)
        {
            GameObject orbObj = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            orbObj.name = "LightOrb";
            orbObj.transform.position = position;
            orbObj.transform.localScale = Vector3.one * 0.5f;

            Renderer renderer = orbObj.GetComponent<Renderer>();
            if (renderer != null)
            {
                Material mat = new Material(Shader.Find("Standard"));
                mat.color = new Color(1f, 0.9f, 0.4f);
                mat.EnableKeyword("_EMISSION");
                mat.SetColor("_EmissionColor", new Color(1f, 0.8f, 0.2f) * 0.8f);
                renderer.material = mat;
            }

            Collider collider = orbObj.GetComponent<Collider>();
            if (collider != null)
            {
                collider.isTrigger = true;
            }

            GameObject lightObj = new GameObject("OrbLight");
            lightObj.transform.SetParent(orbObj.transform);
            lightObj.transform.localPosition = Vector3.zero;
            
            Light orbLight = lightObj.AddComponent<Light>();
            orbLight.type = LightType.Point;
            orbLight.color = new Color(1f, 0.9f, 0.5f);
            orbLight.intensity = 3f;
            orbLight.range = 6f;

            return orbObj;
        }

        private void PositionCamera()
        {
            if (Camera.main != null && player != null)
            {
                Camera.main.transform.position = player.transform.position + cameraOffset;
                Camera.main.transform.LookAt(player.transform.position + Vector3.up * 1f);
            }
        }

        private void Update()
        {
            if (Input.GetKeyDown(KeyCode.Escape))
            {
                TogglePause();
            }

            if (GameManager.Instance != null && GameManager.Instance.CurrentState == GameManager.GameState.Playing)
            {
                UpdateGameUI();
            }

            if (Input.GetKeyDown(KeyCode.F5))
            {
                RestartGame();
            }
        }

        private void UpdateGameUI()
        {
            if (UIManager.Instance != null && GameManager.Instance != null)
            {
                float time = GameManager.Instance.CurrentTime;
                if (time <= 0)
                {
                    GameManager.Instance.GameOver();
                    UIManager.Instance.ShowGameOver();
                }
            }
        }

        private void TogglePause()
        {
            if (GameManager.Instance == null) return;

            if (GameManager.Instance.CurrentState == GameManager.GameState.Playing)
            {
                GameManager.Instance.PauseGame();
                if (UIManager.Instance != null)
                {
                    UIManager.Instance.ShowPauseMenu();
                }
            }
            else if (GameManager.Instance.CurrentState == GameManager.GameState.Paused)
            {
                GameManager.Instance.ResumeGame();
                if (UIManager.Instance != null)
                {
                    UIManager.Instance.HidePauseMenu();
                }
            }
        }
    }
}
