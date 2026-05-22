using UnityEngine;
using System.Collections.Generic;
using PlantSandbox.Plant;

namespace PlantSandbox.Testing
{
    public class PlantParameterTester : MonoBehaviour
    {
        [Header("测试设置")]
        public GameObject plantPrefab;
        public int plantCount = 4;
        public float spacing = 3f;
        public bool autoStartTest = true;
        public float testDuration = 30f;

        [Header("测试参数组合")]
        public List<TestParameterSet> parameterSets = new List<TestParameterSet>();

        [Header("结果显示")]
        public bool showResultsOnGUI = true;

        private List<BasicPlant> testPlants = new List<BasicPlant>();
        private List<float> initialProgress = new List<float>();
        private float testTimer;
        private bool isTesting;
        private Dictionary<int, TestResult> results = new Dictionary<int, TestResult>();

        [System.Serializable]
        public class TestParameterSet
        {
            public string name = "测试组";
            public float sunlight = 1f;
            public float water = 1f;
            public float temperature = 1f;
            public float nutrients = 1f;
        }

        public class TestResult
        {
            public string name;
            public float finalProgress;
            public float growthPerSecond;
            public float maxMultiplier;
            public float minMultiplier;
            public float avgMultiplier;
            public float finalHealth;
            public PlantState finalState;
            public List<float> multiplierHistory = new List<float>();
        }

        private void Start()
        {
            InitializeDefaultParameterSets();
            
            if (autoStartTest)
            {
                StartCoroutine(RunTestSequence());
            }
        }

        private void InitializeDefaultParameterSets()
        {
            if (parameterSets.Count == 0)
            {
                parameterSets.Add(new TestParameterSet { name = "最佳条件", sunlight = 1.0f, water = 1.0f, temperature = 1.0f, nutrients = 1.0f });
                parameterSets.Add(new TestParameterSet { name = "缺光", sunlight = 0.3f, water = 1.0f, temperature = 1.0f, nutrients = 1.0f });
                parameterSets.Add(new TestParameterSet { name = "缺水", sunlight = 1.0f, water = 0.3f, temperature = 1.0f, nutrients = 1.0f });
                parameterSets.Add(new TestParameterSet { name = "条件不足", sunlight = 0.2f, water = 0.2f, temperature = 0.5f, nutrients = 0.3f });
                parameterSets.Add(new TestParameterSet { name = "过度光照", sunlight = 2.0f, water = 1.0f, temperature = 1.0f, nutrients = 1.0f });
            }
        }

        private System.Collections.IEnumerator RunTestSequence()
        {
            yield return new WaitForSeconds(1f);
            
            CreateTestPlants();
            yield return new WaitForSeconds(0.5f);
            
            ApplyParameters();
            yield return new WaitForSeconds(0.5f);
            
            StartTest();
        }

        private void CreateTestPlants()
        {
            testPlants.Clear();
            initialProgress.Clear();

            for (int i = 0; i < parameterSets.Count; i++)
            {
                Vector3 position = new Vector3((i - (parameterSets.Count - 1) / 2f) * spacing, 0.1f, 0f);
                GameObject plantObj = new GameObject($"TestPlant_{parameterSets[i].name}");
                plantObj.transform.position = position;

                ProceduralPlantGenerator generator = plantObj.AddComponent<ProceduralPlantGenerator>();
                generator.seedSize = 0.3f;
                generator.stemHeight = 1.5f;
                generator.leafCount = 3;
                generator.leafSize = 0.4f;

                PlantGrowthAnimator animator = plantObj.AddComponent<PlantGrowthAnimator>();
                animator.animationSpeed = 0.5f;

                BasicPlant basicPlant = plantObj.AddComponent<BasicPlant>();
                basicPlant.plantName = parameterSets[i].name;
                basicPlant.baseGrowthRate = 5f;
                basicPlant.autoGenerateOnStart = true;
                basicPlant.enableSwaying = true;

                testPlants.Add(basicPlant);
                initialProgress.Add(0f);
                results[i] = new TestResult { name = parameterSets[i].name };
            }
        }

        private void ApplyParameters()
        {
            for (int i = 0; i < testPlants.Count && i < parameterSets.Count; i++)
            {
                if (testPlants[i] != null)
                {
                    testPlants[i].SetSunlight(parameterSets[i].sunlight);
                    testPlants[i].SetWater(parameterSets[i].water);
                    testPlants[i].SetTemperature(parameterSets[i].temperature);
                    testPlants[i].SetNutrients(parameterSets[i].nutrients);
                }
            }
        }

        public void StartTest()
        {
            testTimer = 0f;
            isTesting = true;

            for (int i = 0; i < testPlants.Count; i++)
            {
                if (testPlants[i] != null)
                {
                    initialProgress[i] = testPlants[i].GetGrowthPercentage();
                    results[i].multiplierHistory.Clear();
                    results[i].maxMultiplier = 0;
                    results[i].minMultiplier = 999;
                }
            }
        }

        public void StopTest()
        {
            isTesting = false;
            CalculateResults();
        }

        private void Update()
        {
            if (isTesting)
            {
                testTimer += Time.deltaTime;
                RecordData();

                if (testTimer >= testDuration)
                {
                    StopTest();
                }
            }
        }

        private void RecordData()
        {
            for (int i = 0; i < testPlants.Count; i++)
            {
                if (testPlants[i] != null && results.ContainsKey(i))
                {
                    float multiplier = testPlants[i].growthMultiplier;
                    results[i].multiplierHistory.Add(multiplier);
                    
                    if (multiplier > results[i].maxMultiplier)
                        results[i].maxMultiplier = multiplier;
                    if (multiplier < results[i].minMultiplier)
                        results[i].minMultiplier = multiplier;
                }
            }
        }

        private void CalculateResults()
        {
            for (int i = 0; i < testPlants.Count; i++)
            {
                if (testPlants[i] != null && results.ContainsKey(i))
                {
                    float progressDelta = testPlants[i].GetGrowthPercentage() - initialProgress[i];
                    
                    results[i].finalProgress = testPlants[i].GetGrowthPercentage();
                    results[i].growthPerSecond = progressDelta / testTimer;
                    results[i].finalHealth = testPlants[i].health;
                    results[i].finalState = testPlants[i].currentState;

                    if (results[i].multiplierHistory.Count > 0)
                    {
                        float sum = 0;
                        foreach (float m in results[i].multiplierHistory)
                        {
                            sum += m;
                        }
                        results[i].avgMultiplier = sum / results[i].multiplierHistory.Count;
                    }
                }
            }
        }

        private void OnGUI()
        {
            if (!showResultsOnGUI) return;

            GUILayout.BeginArea(new Rect(Screen.width - 300, 10, 290, 400));
            GUILayout.Label("=== 植物参数测试 ===");
            
            GUILayout.Label($"测试时间: {testTimer:F1}/{testDuration}秒");
            
            if (isTesting)
            {
                GUILayout.Label("状态: 测试中...");
                if (GUILayout.Button("停止测试", GUILayout.Width(280)))
                {
                    StopTest();
                }
            }
            else
            {
                GUILayout.Label("状态: 已完成");
                if (GUILayout.Button("重新开始测试", GUILayout.Width(280)))
                {
                    StartCoroutine(RunTestSequence());
                }
            }

            GUILayout.Space(10);
            GUILayout.Label("--- 测试结果 ---");

            foreach (var kvp in results)
            {
                if (kvp.Value == null) continue;

                GUILayout.Space(5);
                GUILayout.Label($"【{kvp.Value.name}】");
                
                if (testPlants.Count > kvp.Key && testPlants[kvp.Key] != null)
                {
                    GUILayout.Label($"  进度: {testPlants[kvp.Key].GetGrowthPercentage():F1}%");
                    GUILayout.Label($"  倍率: {testPlants[kvp.Key].growthMultiplier:F2}x");
                    GUILayout.Label($"  健康: {testPlants[kvp.Key].health:F0}");
                    GUILayout.Label($"  状态: {testPlants[kvp.Key].GetGrowthStatus()}");
                }

                if (!isTesting && kvp.Value.finalProgress > 0)
                {
                    GUILayout.Label($"  平均增长: {kvp.Value.growthPerSecond:F2}%/秒");
                    GUILayout.Label($"  平均倍率: {kvp.Value.avgMultiplier:F2}x");
                }
            }

            GUILayout.EndArea();

            DrawPlantLabels();
        }

        private void DrawPlantLabels()
        {
            for (int i = 0; i < testPlants.Count; i++)
            {
                if (testPlants[i] == null) continue;

                Vector3 worldPos = testPlants[i].transform.position + new Vector3(0, 2.5f, 0);
                Vector2 screenPos = Camera.main.WorldToScreenPoint(worldPos);
                
                if (screenPos.z > 0)
                {
                    string label = $"{testPlants[i].plantName}\n{testPlants[i].GetGrowthPercentage():F1}%";
                    float labelWidth = 120;
                    float labelHeight = 40;
                    
                    GUI.Label(new Rect(screenPos.x - labelWidth/2, Screen.height - screenPos.y - labelHeight/2, labelWidth, labelHeight), 
                              label, new GUIStyle(GUI.skin.label) { alignment = TextAnchor.MiddleCenter });
                }
            }
        }

        public void AddParameterSet(string name, float sunlight, float water, float temperature, float nutrients)
        {
            parameterSets.Add(new TestParameterSet
            {
                name = name,
                sunlight = sunlight,
                water = water,
                temperature = temperature,
                nutrients = nutrients
            });
        }

        public void ClearParameterSets()
        {
            parameterSets.Clear();
        }
    }
}
