using UnityEngine;
using PlantSandbox.Plant;
using PlantSandbox.Testing;

namespace PlantSandbox.Core
{
    public class TestSceneInitializer : MonoBehaviour
    {
        [Header("测试模式")]
        public TestMode testMode = TestMode.SinglePlant;

        [Header("单植物测试设置")]
        public bool createStatusDisplay = true;
        public bool createDataRecorder = true;

        [Header("多植物对比设置")]
        public int plantCount = 5;
        public float plantSpacing = 3f;
        public bool createParameterTester = true;

        [Header("通用设置")]
        public bool createCamera = true;
        public bool createGround = true;
        public bool createEnvironment = true;

        public enum TestMode
        {
            SinglePlant,
            MultiPlantComparison,
            ParameterTest
        }

        private void Awake()
        {
            InitializeTestScene();
        }

        private void InitializeTestScene()
        {
            if (createCamera) CreateCamera();
            if (createGround) CreateGround();
            if (createEnvironment) CreateEnvironment();

            switch (testMode)
            {
                case TestMode.SinglePlant:
                    CreateSinglePlantTest();
                    break;
                case TestMode.MultiPlantComparison:
                    CreateMultiPlantComparison();
                    break;
                case TestMode.ParameterTest:
                    CreateParameterTest();
                    break;
            }
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

            mainCamera.transform.position = new Vector3(0f, 8f, -12f);
            mainCamera.transform.rotation = Quaternion.Euler(35f, 0f, 0f);
            mainCamera.orthographic = true;
            mainCamera.orthographicSize = 8f;
            mainCamera.clearFlags = CameraClearFlags.SolidColor;
            mainCamera.backgroundColor = new Color(0.7f, 0.85f, 1f);

            CameraController controller = mainCamera.GetComponent<CameraController>();
            if (controller == null)
            {
                controller = mainCamera.gameObject.AddComponent<CameraController>();
            }
            controller.enableMovement = true;
            controller.minZoom = 3f;
            controller.maxZoom = 20f;
        }

        private void CreateGround()
        {
            GameObject ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
            ground.name = "Ground";
            ground.transform.position = Vector3.zero;
            ground.transform.localScale = new Vector3(10f, 1f, 10f);

            Renderer groundRenderer = ground.GetComponent<Renderer>();
            if (groundRenderer != null)
            {
                groundRenderer.material = new Material(Shader.Find("Standard"));
                groundRenderer.material.color = new Color(0.4f, 0.6f, 0.3f);
            }
        }

        private void CreateEnvironment()
        {
            if (EnvironmentManager.Instance != null) return;

            GameObject envObj = new GameObject("EnvironmentManager");
            EnvironmentManager envManager = envObj.AddComponent<EnvironmentManager>();
            envManager.globalSunlight = 1f;
            envManager.globalWater = 1f;
            envManager.globalTemperature = 1f;
            envManager.globalNutrients = 1f;
            envManager.enableDayNightCycle = false;
        }

        private void CreateSinglePlantTest()
        {
            GameObject plantObj = CreateTestPlant("测试植物", Vector3.zero, 1f, 1f, 1f, 1f);
            BasicPlant plant = plantObj.GetComponent<BasicPlant>();

            if (createStatusDisplay)
            {
                CreateStatusDisplay(plant);
            }

            if (createDataRecorder)
            {
                CreateDataRecorder(plant);
            }

            GameObject testerObj = new GameObject("GrowthTester");
            PlantGrowthTester tester = testerObj.AddComponent<PlantGrowthTester>();
            tester.targetPlant = plant;

            if (EnvironmentManager.Instance != null)
            {
                EnvironmentManager.Instance.RegisterPlant(plant);
            }
        }

        private void CreateMultiPlantComparison()
        {
            string[] plantNames = { "最佳条件", "缺光", "缺水", "条件不足", "过度光照" };
            float[] sunlightValues = { 1.0f, 0.3f, 1.0f, 0.2f, 2.0f };
            float[] waterValues = { 1.0f, 1.0f, 0.3f, 0.2f, 1.0f };
            float[] tempValues = { 1.0f, 1.0f, 1.0f, 0.5f, 1.0f };
            float[] nutrientValues = { 1.0f, 1.0f, 1.0f, 0.3f, 1.0f };

            for (int i = 0; i < plantCount && i < plantNames.Length; i++)
            {
                Vector3 position = new Vector3((i - (plantCount - 1) / 2f) * plantSpacing, 0.1f, 0f);
                GameObject plantObj = CreateTestPlant(plantNames[i], position, 
                    sunlightValues[i], waterValues[i], tempValues[i], nutrientValues[i]);
                
                BasicPlant plant = plantObj.GetComponent<BasicPlant>();
                
                if (EnvironmentManager.Instance != null)
                {
                    EnvironmentManager.Instance.RegisterPlant(plant);
                }
            }
        }

        private void CreateParameterTest()
        {
            GameObject testerObj = new GameObject("ParameterTester");
            PlantParameterTester parameterTester = testerObj.AddComponent<PlantParameterTester>();
            parameterTester.autoStartTest = true;
            parameterTester.testDuration = 30f;
            parameterTester.spacing = plantSpacing;
        }

        private GameObject CreateTestPlant(string name, Vector3 position, 
            float sunlight, float water, float temperature, float nutrients)
        {
            GameObject plantObj = new GameObject(name);
            plantObj.transform.position = position;

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
            basicPlant.plantName = name;
            basicPlant.baseGrowthRate = 5f;
            basicPlant.autoGenerateOnStart = true;
            basicPlant.enableSwaying = true;
            basicPlant.baseSwayAmount = 3f;
            basicPlant.baseSwaySpeed = 1.5f;

            basicPlant.SetSunlight(sunlight);
            basicPlant.SetWater(water);
            basicPlant.SetTemperature(temperature);
            basicPlant.SetNutrients(nutrients);

            EnhancedPlantAnimator enhancedAnimator = plantObj.AddComponent<EnhancedPlantAnimator>();
            enhancedAnimator.plantBase = basicPlant;
            enhancedAnimator.baseAnimator = animator;
            enhancedAnimator.enableBounceEffect = true;
            enhancedAnimator.enableGrowthShake = true;
            enhancedAnimator.enableGrowthParticles = false;

            return plantObj;
        }

        private void CreateStatusDisplay(BasicPlant targetPlant)
        {
            GameObject canvasObj = new GameObject("StatusDisplay");
            Canvas canvas = canvasObj.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvasObj.AddComponent<CanvasScaler>();
            canvasObj.AddComponent<GraphicRaycaster>();

            PlantSandbox.UI.PlantStatusDisplay statusDisplay = canvasObj.AddComponent<PlantSandbox.UI.PlantStatusDisplay>();
            statusDisplay.targetPlant = targetPlant;
            statusDisplay.followPlant = false;

            RectTransform rectTransform = canvasObj.GetComponent<RectTransform>();
            rectTransform.anchorMin = new Vector2(0f, 1f);
            rectTransform.anchorMax = new Vector2(0f, 1f);
            rectTransform.pivot = new Vector2(0f, 1f);
            rectTransform.anchoredPosition = new Vector2(20f, -20f);
            rectTransform.sizeDelta = new Vector2(280f, 200f);
        }

        private void CreateDataRecorder(BasicPlant targetPlant)
        {
            GameObject recorderObj = new GameObject("GrowthDataRecorder");
            GrowthDataRecorder recorder = recorderObj.AddComponent<GrowthDataRecorder>();
            recorder.targetPlant = targetPlant;
            recorder.autoStartRecording = true;
            recorder.recordInterval = 0.5f;
            recorder.showGraph = true;
        }
    }
}
