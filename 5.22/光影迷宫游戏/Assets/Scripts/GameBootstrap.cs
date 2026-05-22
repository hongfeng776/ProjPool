using UnityEngine;

namespace LightAndShadowMaze
{
    public class GameBootstrap : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private GameObject playerPrefab;
        [SerializeField] private GameObject wallPrefab;
        [SerializeField] private GameObject floorPrefab;
        [SerializeField] private GameObject goalPrefab;
        [SerializeField] private GameObject lightOrbPrefab;
        [SerializeField] private Camera mainCamera;

        [Header("Camera Settings")]
        [SerializeField] private Vector3 cameraOffset = new Vector3(0f, 20f, -15f);
        [SerializeField] private float cameraFollowSpeed = 5f;

        private MazeGenerator mazeGenerator;
        private PlayerController playerController;
        private GameObject playerObject;
        private GameObject goalObject;

        private void Awake()
        {
            InitializeGame();
        }

        private void InitializeGame()
        {
            SetupCamera();
            SetupMazeGenerator();
            SetupLighting();
        }

        private void Start()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.StartGame();
                StartNewGame();
            }
        }

        private void SetupCamera()
        {
            if (mainCamera == null)
            {
                mainCamera = Camera.main;
                if (mainCamera == null)
                {
                    GameObject camObj = new GameObject("Main Camera");
                    mainCamera = camObj.AddComponent<Camera>();
                    camObj.AddComponent<AudioListener>();
                }
            }

            mainCamera.clearFlags = CameraClearFlags.SolidColor;
            mainCamera.backgroundColor = new Color(0.05f, 0.05f, 0.1f);
            mainCamera.orthographic = false;
            mainCamera.fieldOfView = 60f;
        }

        private void SetupMazeGenerator()
        {
            GameObject mazeObj = new GameObject("MazeGenerator");
            mazeGenerator = mazeObj.AddComponent<MazeGenerator>();

            if (wallPrefab == null)
            {
                wallPrefab = CreatePrimitiveCube("WallPrefab", new Color(0.3f, 0.3f, 0.35f));
            }

            if (floorPrefab == null)
            {
                floorPrefab = CreatePrimitivePlane("FloorPrefab", new Color(0.15f, 0.15f, 0.2f));
            }

            SetPrivateField(mazeGenerator, "wallPrefab", wallPrefab);
            SetPrivateField(mazeGenerator, "floorPrefab", floorPrefab);
        }

        private void SetupLighting()
        {
            Light ambientLight = RenderSettings.ambientLight;
            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
            RenderSettings.ambientLight = new Color(0.05f, 0.05f, 0.08f);

            Light[] lights = FindObjectsOfType<Light>();
            foreach (Light light in lights)
            {
                if (light.type == LightType.Directional)
                {
                    light.intensity = 0.1f;
                    light.color = new Color(0.3f, 0.35f, 0.5f);
                }
            }
        }

        public void StartNewGame()
        {
            mazeGenerator.GenerateMaze();
            SpawnPlayer();
            SpawnGoal();
            SpawnLightOrbs(5);
        }

        private void SpawnPlayer()
        {
            if (playerObject != null)
            {
                Destroy(playerObject);
            }

            if (playerPrefab != null)
            {
                playerObject = Instantiate(playerPrefab, mazeGenerator.GetStartPosition(), Quaternion.identity);
            }
            else
            {
                playerObject = new GameObject("Player");
                playerObject.transform.position = mazeGenerator.GetStartPosition();
                playerObject.tag = "Player";

                playerObject.AddComponent<Rigidbody>().isKinematic = true;
                CapsuleCollider collider = playerObject.AddComponent<CapsuleCollider>();
                collider.radius = 0.5f;
                collider.height = 1.8f;
                collider.center = new Vector3(0, 0.9f, 0);
            }

            playerController = playerObject.GetComponent<PlayerController>();
            if (playerController == null)
            {
                playerController = playerObject.AddComponent<PlayerController>();
            }
        }

        private void SpawnGoal()
        {
            if (goalObject != null)
            {
                Destroy(goalObject);
            }

            Vector3 endPos = mazeGenerator.GetEndPosition();

            if (goalPrefab != null)
            {
                goalObject = Instantiate(goalPrefab, endPos, Quaternion.identity);
            }
            else
            {
                goalObject = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                goalObject.name = "Goal";
                goalObject.transform.position = endPos;
                goalObject.transform.localScale = Vector3.one * 1.5f;

                Collider collider = goalObject.GetComponent<Collider>();
                if (collider != null)
                {
                    collider.isTrigger = true;
                }
            }

            Goal goal = goalObject.GetComponent<Goal>();
            if (goal == null)
            {
                goal = goalObject.AddComponent<Goal>();
            }
        }

        private void SpawnLightOrbs(int count)
        {
            for (int i = 0; i < count; i++)
            {
                int x, y;
                do
                {
                    x = Random.Range(1, mazeGenerator.Width - 1);
                    y = Random.Range(1, mazeGenerator.Height - 1);
                } while (mazeGenerator.IsWall(x, y));

                Vector3 position = new Vector3(
                    x * mazeGenerator.CellSize,
                    1.5f,
                    y * mazeGenerator.CellSize
                );

                GameObject orb;
                if (lightOrbPrefab != null)
                {
                    orb = Instantiate(lightOrbPrefab, position, Quaternion.identity);
                }
                else
                {
                    orb = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                    orb.name = "LightOrb";
                    orb.transform.position = position;
                    orb.transform.localScale = Vector3.one * 0.5f;

                    Renderer renderer = orb.GetComponent<Renderer>();
                    if (renderer != null)
                    {
                        renderer.material = new Material(Shader.Find("Standard"));
                        renderer.material.color = new Color(1f, 0.9f, 0.5f);
                        renderer.material.EnableKeyword("_EMISSION");
                        renderer.material.SetColor("_EmissionColor", new Color(1f, 0.8f, 0.3f) * 0.5f);
                    }

                    Collider collider = orb.GetComponent<Collider>();
                    if (collider != null)
                    {
                        collider.isTrigger = true;
                    }
                }

                if (orb.GetComponent<LightOrb>() == null)
                {
                    orb.AddComponent<LightOrb>();
                }
            }
        }

        private void LateUpdate()
        {
            if (playerObject != null && mainCamera != null)
            {
                Vector3 targetPosition = playerObject.transform.position + cameraOffset;
                mainCamera.transform.position = Vector3.Lerp(
                    mainCamera.transform.position,
                    targetPosition,
                    cameraFollowSpeed * Time.deltaTime
                );

                mainCamera.transform.LookAt(playerObject.transform.position + Vector3.up * 1f);
            }
        }

        private GameObject CreatePrimitiveCube(string name, Color color)
        {
            GameObject obj = GameObject.CreatePrimitive(PrimitiveType.Cube);
            obj.name = name;
            obj.SetActive(false);

            Renderer renderer = obj.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material = new Material(Shader.Find("Standard"));
                renderer.material.color = color;
            }

            return obj;
        }

        private GameObject CreatePrimitivePlane(string name, Color color)
        {
            GameObject obj = GameObject.CreatePrimitive(PrimitiveType.Plane);
            obj.name = name;
            obj.SetActive(false);
            obj.transform.localScale = new Vector3(0.1f, 1f, 0.1f);

            Renderer renderer = obj.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material = new Material(Shader.Find("Standard"));
                renderer.material.color = color;
            }

            return obj;
        }

        private void SetPrivateField(object obj, string fieldName, object value)
        {
            var field = obj.GetType().GetField(fieldName,
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            if (field != null)
            {
                field.SetValue(obj, value);
            }
        }
    }
}
