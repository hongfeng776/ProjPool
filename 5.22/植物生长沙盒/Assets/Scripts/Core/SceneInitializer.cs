using UnityEngine;
using PlantSandbox.Plant;

namespace PlantSandbox.Core
{
    public class SceneInitializer : MonoBehaviour
    {
        [Header("初始化设置")]
        public bool createTestPlant = true;
        public bool createCamera = true;
        public bool createGround = true;
        public bool createEnvironment = true;
        public bool createTestingUI = true;
        public bool createEnvironmentUI = true;

        [Header("植物设置")]
        public int plantCount = 1;
        public float plantSpacing = 2f;

        [Header("相机设置")]
        public Vector3 cameraPosition = new Vector3(0f, 5f, -10f);
        public Vector3 cameraRotation = new Vector3(30f, 0f, 0f);

        [Header("环境设置")]
        public float initialSunlight = 1f;
        public float initialWater = 1f;
        public float initialTemperature = 1f;
        public float initialNutrients = 1f;
        public bool enableDayNightCycle = false;

        private GameObject testPlant;
        private PlantGrowthTester growthTester;
        private EnvironmentManager environmentManager;

        private void Awake()
        {
            InitializeScene();
        }

        private void InitializeScene()
        {
            if (createEnvironment)
                CreateEnvironmentManager();

            if (createCamera)
                CreateCamera();

            if (createGround)
                CreateGround();

            if (createTestPlant)
                CreateTestPlants();

            if (createTestingUI)
                CreateTestingUI();

            if (createEnvironmentUI)
                CreateEnvironmentUI();
        }

        private void CreateEnvironmentManager()
        {
            if (EnvironmentManager.Instance != null)
            {
                environmentManager = EnvironmentManager.Instance;
                return;
            }

            GameObject envObj = new GameObject("EnvironmentManager");
            environmentManager = envObj.AddComponent<EnvironmentManager>();
            
            environmentManager.globalSunlight = initialSunlight;
            environmentManager.globalWater = initialWater;
            environmentManager.globalTemperature = initialTemperature;
            environmentManager.globalNutrients = initialNutrients;
            environmentManager.enableDayNightCycle = enableDayNightCycle;
        }

        private void CreateCamera()
        {
            Camera mainCamera = Camera.main;
            if (mainCamera == null)
            {
                GameObject cameraObj = new GameObject("Main Camera");
                cameraObj.tag = "MainCamera";
                mainCamera = cameraObj.AddComponent<Camera>();
                cameraObj.AddComponent<AudioListener>();
            }

            mainCamera.transform.position = cameraPosition;
            mainCamera.transform.rotation = Quaternion.Euler(cameraRotation);
            mainCamera.orthographic = true;
            mainCamera.orthographicSize = 6f;
            mainCamera.clearFlags = CameraClearFlags.SolidColor;
            mainCamera.backgroundColor = new Color(0.7f, 0.85f, 1f);

            CameraController controller = mainCamera.GetComponent<CameraController>();
            if (controller == null)
            {
                controller = mainCamera.gameObject.AddComponent<CameraController>();
            }
            controller.enableMovement = true;
            controller.minZoom = 3f;
            controller.maxZoom = 15f;
        }

        private void CreateGround()
        {
            GameObject ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
            ground.name = "Ground";
            ground.transform.position = Vector3.zero;
            ground.transform.localScale = new Vector3(5f, 1f, 5f);

            Renderer groundRenderer = ground.GetComponent<Renderer>();
            if (groundRenderer != null)
            {
                groundRenderer.material = new Material(Shader.Find("Standard"));
                groundRenderer.material.color = new Color(0.4f, 0.6f, 0.3f);
            }

            Collider groundCollider = ground.GetComponent<Collider>();
            if (groundCollider != null)
            {
                groundCollider.isTrigger = false;
            }
        }

        private void CreateTestPlants()
        {
            for (int i = 0; i < plantCount; i++)
            {
                GameObject plantObj = new GameObject($"Plant_{i + 1}");
                float xPos = (i - (plantCount - 1) / 2f) * plantSpacing;
                plantObj.transform.position = new Vector3(xPos, 0.1f, 0f);

                ProceduralPlantGenerator generator = plantObj.AddComponent<ProceduralPlantGenerator>();
                generator.seedSize = 0.3f;
                generator.stemHeight = 1.5f;
                generator.stemWidth = 0.08f;
                generator.leafCount = 3;
                generator.leafSize = 0.4f;
                generator.leafSpacing = 0.35f;

                PlantGrowthAnimator animator = plantObj.AddComponent<PlantGrowthAnimator>();
                animator.animationSpeed = 0.5f;
                animator.seedMaxScale = Vector3.one * 0.3f;
                animator.stemMaxHeight = 1.5f;
                animator.leafMaxScale = Vector3.one * 0.4f;

                BasicPlant basicPlant = plantObj.AddComponent<BasicPlant>();
                basicPlant.baseGrowthRate = 5f;
                basicPlant.autoGenerateOnStart = true;
                basicPlant.enableSwaying = true;
                basicPlant.baseSwayAmount = 3f;
                basicPlant.baseSwaySpeed = 1.5f;

                if (environmentManager != null)
                {
                    environmentManager.RegisterPlant(basicPlant);
                }

                if (i == 0)
                {
                    testPlant = plantObj;
                }
            }
        }

        private void CreateTestingUI()
        {
            GameObject testerObj = new GameObject("GrowthTester");
            growthTester = testerObj.AddComponent<PlantGrowthTester>();
            
            if (testPlant != null)
            {
                growthTester.targetPlant = testPlant.GetComponent<BasicPlant>();
            }
        }

        private void CreateEnvironmentUI()
        {
            GameObject canvasObj = new GameObject("EnvironmentPanel");
            Canvas canvas = canvasObj.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvasObj.AddComponent<CanvasScaler>();
            canvasObj.AddComponent<GraphicRaycaster>();

            PlantSandbox.UI.EnvironmentPanelUI panelUI = canvasObj.AddComponent<PlantSandbox.UI.EnvironmentPanelUI>();
            panelUI.useGlobalEnvironment = true;
            
            if (testPlant != null)
            {
                panelUI.targetPlant = testPlant.GetComponent<BasicPlant>();
                panelUI.useGlobalEnvironment = false;
            }

            RectTransform rectTransform = canvasObj.GetComponent<RectTransform>();
            if (rectTransform != null)
            {
                rectTransform.anchorMin = new Vector2(1f, 1f);
                rectTransform.anchorMax = new Vector2(1f, 1f);
                rectTransform.pivot = new Vector2(1f, 1f);
                rectTransform.anchoredPosition = new Vector2(-20f, -20f);
                rectTransform.sizeDelta = new Vector2(250f, 400f);
            }
        }

        public BasicPlant GetFirstPlant()
        {
            return testPlant != null ? testPlant.GetComponent<BasicPlant>() : null;
        }

        public EnvironmentManager GetEnvironmentManager()
        {
            return environmentManager;
        }
    }
}
