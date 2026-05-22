using UnityEngine;
using UnityEngine.UI;

namespace PlantSandbox.Plant
{
    public class PlantGrowthTester : MonoBehaviour
    {
        [Header("目标植物")]
        public BasicPlant targetPlant;

        [Header("测试按钮")]
        public Button growToSeedButton;
        public Button growToSproutButton;
        public Button growToYoungButton;
        public Button growToMatureButton;
        public Button growToFloweringButton;
        public Button resetButton;
        public Slider growthSlider;

        [Header("参数快捷按钮")]
        public Button addSunlightButton;
        public Button removeSunlightButton;
        public Button addWaterButton;
        public Button removeWaterButton;
        public Button optimalParamsButton;
        public Button minimalParamsButton;

        [Header("信息显示")]
        public Text stageText;
        public Text progressText;
        public Text sunlightText;
        public Text waterText;
        public Text multiplierText;

        private void Start()
        {
            SetupButtons();
            SetupSlider();
        }

        private void Update()
        {
            UpdateDisplay();
        }

        private void SetupButtons()
        {
            if (growToSeedButton != null)
                growToSeedButton.onClick.AddListener(() => GrowToStage(PlantState.Seed));
            
            if (growToSproutButton != null)
                growToSproutButton.onClick.AddListener(() => GrowToStage(PlantState.Sprout));
            
            if (growToYoungButton != null)
                growToYoungButton.onClick.AddListener(() => GrowToStage(PlantState.Young));
            
            if (growToMatureButton != null)
                growToMatureButton.onClick.AddListener(() => GrowToStage(PlantState.Mature));
            
            if (growToFloweringButton != null)
                growToFloweringButton.onClick.AddListener(() => GrowToStage(PlantState.Flowering));
            
            if (resetButton != null)
                resetButton.onClick.AddListener(ResetPlant);

            if (addSunlightButton != null)
                addSunlightButton.onClick.AddListener(() => AdjustParameter("sunlight", 0.2f));
            
            if (removeSunlightButton != null)
                removeSunlightButton.onClick.AddListener(() => AdjustParameter("sunlight", -0.2f));
            
            if (addWaterButton != null)
                addWaterButton.onClick.AddListener(() => AdjustParameter("water", 0.2f));
            
            if (removeWaterButton != null)
                removeWaterButton.onClick.AddListener(() => AdjustParameter("water", -0.2f));

            if (optimalParamsButton != null)
                optimalParamsButton.onClick.AddListener(SetOptimalParameters);
            
            if (minimalParamsButton != null)
                minimalParamsButton.onClick.AddListener(SetMinimalParameters);
        }

        private void SetupSlider()
        {
            if (growthSlider != null)
            {
                growthSlider.minValue = 0f;
                growthSlider.maxValue = 100f;
                growthSlider.onValueChanged.AddListener(OnSliderChanged);
            }
        }

        private void OnSliderChanged(float value)
        {
            if (targetPlant == null) return;

            PlantGrowthAnimator animator = targetPlant.GetComponent<PlantGrowthAnimator>();
            if (animator != null)
            {
                animator.PlayGrowthAnimation(value / 100f);
            }
        }

        private void AdjustParameter(string parameter, float amount)
        {
            if (targetPlant == null) return;

            switch (parameter)
            {
                case "sunlight":
                    targetPlant.AddSunlight(amount);
                    break;
                case "water":
                    targetPlant.AddWater(amount);
                    break;
                case "temperature":
                    targetPlant.SetTemperature(targetPlant.temperature + amount);
                    break;
                case "nutrients":
                    targetPlant.SetNutrients(targetPlant.nutrients + amount);
                    break;
            }
        }

        private void SetOptimalParameters()
        {
            if (targetPlant == null) return;

            targetPlant.SetSunlight(1.0f);
            targetPlant.SetWater(1.0f);
            targetPlant.SetTemperature(1.0f);
            targetPlant.SetNutrients(1.0f);
        }

        private void SetMinimalParameters()
        {
            if (targetPlant == null) return;

            targetPlant.SetSunlight(0.3f);
            targetPlant.SetWater(0.3f);
            targetPlant.SetTemperature(0.5f);
            targetPlant.SetNutrients(0.3f);
        }

        private void GrowToStage(PlantState stage)
        {
            if (targetPlant == null)
            {
                Debug.LogWarning("没有设置目标植物！");
                return;
            }

            targetPlant.ForceGrowToStage(stage);
            UpdateSliderValue();
        }

        private void ResetPlant()
        {
            if (targetPlant == null) return;

            targetPlant.ResetGrowth();
            UpdateSliderValue();
        }

        private void UpdateDisplay()
        {
            if (targetPlant == null) return;

            if (stageText != null)
                stageText.text = $"阶段: {targetPlant.currentState}";
            
            if (progressText != null)
                progressText.text = $"进度: {targetPlant.GetGrowthPercentage():F1}%";
            
            if (sunlightText != null)
                sunlightText.text = $"光照: {targetPlant.sunlight:F2}";
            
            if (waterText != null)
                waterText.text = $"水分: {targetPlant.water:F2}";
            
            if (multiplierText != null)
                multiplierText.text = $"倍率: {targetPlant.growthMultiplier:F2}x\n状态: {targetPlant.GetGrowthStatus()}";
        }

        private void UpdateSliderValue()
        {
            if (growthSlider != null && targetPlant != null)
            {
                growthSlider.SetValueWithoutNotify(targetPlant.GetGrowthPercentage());
            }
        }

        private void OnGUI()
        {
            GUILayout.BeginArea(new Rect(10, 10, 240, 460));
            GUILayout.Label("植物生长测试", GUILayout.Width(220));
            
            GUILayout.Space(10);
            GUILayout.Label("=== 生长阶段 ===");
            
            if (GUILayout.Button("种子阶段", GUILayout.Width(220))) GrowToStage(PlantState.Seed);
            if (GUILayout.Button("发芽阶段", GUILayout.Width(220))) GrowToStage(PlantState.Sprout);
            if (GUILayout.Button("幼苗阶段", GUILayout.Width(220))) GrowToStage(PlantState.Young);
            if (GUILayout.Button("成熟阶段", GUILayout.Width(220))) GrowToStage(PlantState.Mature);
            if (GUILayout.Button("开花阶段", GUILayout.Width(220))) GrowToStage(PlantState.Flowering);
            if (GUILayout.Button("重置生长", GUILayout.Width(220))) ResetPlant();
            
            GUILayout.Space(10);
            GUILayout.Label("=== 环境参数调整 ===");
            
            GUILayout.BeginHorizontal();
            if (GUILayout.Button("阳光 -0.2", GUILayout.Width(110))) AdjustParameter("sunlight", -0.2f);
            if (GUILayout.Button("阳光 +0.2", GUILayout.Width(110))) AdjustParameter("sunlight", 0.2f);
            GUILayout.EndHorizontal();
            
            GUILayout.BeginHorizontal();
            if (GUILayout.Button("水分 -0.2", GUILayout.Width(110))) AdjustParameter("water", -0.2f);
            if (GUILayout.Button("水分 +0.2", GUILayout.Width(110))) AdjustParameter("water", 0.2f);
            GUILayout.EndHorizontal();
            
            GUILayout.BeginHorizontal();
            if (GUILayout.Button("阳光=0.1", GUILayout.Width(110))) { targetPlant?.SetSunlight(0.1f); }
            if (GUILayout.Button("阳光=2.0", GUILayout.Width(110))) { targetPlant?.SetSunlight(2.0f); }
            GUILayout.EndHorizontal();
            
            GUILayout.Space(5);
            if (GUILayout.Button("最佳参数 (1.0)", GUILayout.Width(220))) SetOptimalParameters();
            if (GUILayout.Button("最低参数 (0.3)", GUILayout.Width(220))) SetMinimalParameters();
            
            GUILayout.Space(10);
            GUILayout.Label("=== 当前状态 ===");
            
            if (targetPlant != null)
            {
                GUI.color = targetPlant.sunlight >= 0.7f && targetPlant.sunlight <= 1.3f ? Color.green : Color.yellow;
                GUILayout.Label($"光照: {targetPlant.sunlight:F2}");
                GUI.color = targetPlant.water >= 0.7f && targetPlant.water <= 1.3f ? Color.green : Color.yellow;
                GUILayout.Label($"水分: {targetPlant.water:F2}");
                GUI.color = Color.white;
                
                GUILayout.Label($"生长倍率: {targetPlant.growthMultiplier:F2}x");
                
                GUI.color = GetStatusColor(targetPlant.growthMultiplier);
                GUILayout.Label($"生长状态: {targetPlant.GetGrowthStatus()}");
                GUI.color = Color.white;
                
                GUILayout.Label($"进度: {targetPlant.GetGrowthPercentage():F1}%");
                GUILayout.Label($"实际速度: {targetPlant.effectiveGrowthRate:F2}/秒");
                GUILayout.Label($"健康: {targetPlant.GetHealthStatus()} ({targetPlant.health:F0}/{targetPlant.maxHealth})");
            }
            else
            {
                GUILayout.Label("未找到目标植物");
            }
            
            GUILayout.EndArea();
        }

        private Color GetStatusColor(float multiplier)
        {
            if (multiplier >= 1.3f) return Color.green;
            if (multiplier >= 0.8f) return Color.cyan;
            if (multiplier >= 0.4f) return Color.yellow;
            if (multiplier > 0.1f) return new Color(1f, 0.5f, 0f);
            return Color.red;
        }
    }
}
