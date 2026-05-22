using UnityEngine;
using UnityEngine.UI;
using TMPro;
using PlantSandbox.Plant;

namespace PlantSandbox.UI
{
    public class PlantStatusDisplay : MonoBehaviour
    {
        [Header("目标植物")]
        public PlantBase targetPlant;

        [Header("UI 元素 - 状态")]
        public TextMeshProUGUI plantNameText;
        public TextMeshProUGUI stageText;
        public TextMeshProUGUI growthStatusText;
        public TextMeshProUGUI healthStatusText;

        [Header("UI 元素 - 进度条")]
        public Slider growthProgressSlider;
        public Slider healthSlider;
        public Slider growthMultiplierSlider;

        [Header("UI 元素 - 数值显示")]
        public TextMeshProUGUI growthProgressValue;
        public TextMeshProUGUI healthValue;
        public TextMeshProUGUI growthMultiplierValue;
        public TextMeshProUGUI effectiveSpeedValue;

        [Header("UI 元素 - 参数显示")]
        public TextMeshProUGUI sunlightValue;
        public TextMeshProUGUI waterValue;
        public TextMeshProUGUI temperatureValue;
        public TextMeshProUGUI nutrientsValue;

        [Header("UI 元素 - 参数指示器")]
        public Image sunlightIndicator;
        public Image waterIndicator;
        public Image temperatureIndicator;
        public Image nutrientsIndicator;

        [Header("颜色设置")]
        public Color badColor = Color.red;
        public Color warningColor = new Color(1f, 0.5f, 0f);
        public Color normalColor = Color.yellow;
        public Color goodColor = Color.green;
        public Color optimalColor = new Color(0f, 1f, 0.5f);

        [Header("设置")]
        public bool followPlant = false;
        public Vector3 offset = new Vector3(0f, 2f, 0f);
        public float updateInterval = 0.1f;

        private float lastUpdateTime;
        private Camera mainCamera;

        private void Start()
        {
            mainCamera = Camera.main;
            InitializeSliders();
        }

        private void Update()
        {
            if (Time.time - lastUpdateTime >= updateInterval)
            {
                UpdateDisplay();
                lastUpdateTime = Time.time;
            }

            if (followPlant && targetPlant != null && mainCamera != null)
            {
                UpdatePosition();
            }
        }

        private void InitializeSliders()
        {
            if (growthProgressSlider != null)
            {
                growthProgressSlider.minValue = 0f;
                growthProgressSlider.maxValue = 100f;
            }

            if (healthSlider != null)
            {
                healthSlider.minValue = 0f;
                healthSlider.maxValue = 100f;
            }

            if (growthMultiplierSlider != null)
            {
                growthMultiplierSlider.minValue = 0f;
                growthMultiplierSlider.maxValue = 2f;
            }
        }

        private void UpdateDisplay()
        {
            if (targetPlant == null) return;

            if (plantNameText != null)
                plantNameText.text = targetPlant.plantName;

            if (stageText != null)
            {
                stageText.text = $"阶段: {GetStageName(targetPlant.currentState)}";
                stageText.color = GetStageColor(targetPlant.currentState);
            }

            if (growthStatusText != null)
            {
                growthStatusText.text = targetPlant.GetGrowthStatus();
                growthStatusText.color = GetMultiplierColor(targetPlant.growthMultiplier);
            }

            if (healthStatusText != null)
            {
                healthStatusText.text = targetPlant.GetHealthStatus();
                healthStatusText.color = GetHealthColor(targetPlant.health / targetPlant.maxHealth);
            }

            if (growthProgressSlider != null)
                growthProgressSlider.value = targetPlant.GetGrowthPercentage();
            
            if (growthProgressValue != null)
                growthProgressValue.text = $"{targetPlant.GetGrowthPercentage():F1}%";

            if (healthSlider != null)
                healthSlider.value = targetPlant.health;
            
            if (healthValue != null)
                healthValue.text = $"{targetPlant.health:F0}/{targetPlant.maxHealth}";

            if (growthMultiplierSlider != null)
                growthMultiplierSlider.value = targetPlant.growthMultiplier;
            
            if (growthMultiplierValue != null)
                growthMultiplierValue.text = $"{targetPlant.growthMultiplier:F2}x";

            if (effectiveSpeedValue != null)
                effectiveSpeedValue.text = $"{targetPlant.effectiveGrowthRate:F2}/秒";

            UpdateParameterDisplay();
        }

        private void UpdateParameterDisplay()
        {
            if (sunlightValue != null)
                sunlightValue.text = $"{targetPlant.sunlight:F2}";
            if (sunlightIndicator != null)
                sunlightIndicator.color = GetParameterColor(targetPlant.sunlight);

            if (waterValue != null)
                waterValue.text = $"{targetPlant.water:F2}";
            if (waterIndicator != null)
                waterIndicator.color = GetParameterColor(targetPlant.water);

            if (temperatureValue != null)
                temperatureValue.text = $"{targetPlant.temperature:F2}";
            if (temperatureIndicator != null)
                temperatureIndicator.color = GetParameterColor(targetPlant.temperature);

            if (nutrientsValue != null)
                nutrientsValue.text = $"{targetPlant.nutrients:F2}";
            if (nutrientsIndicator != null)
                nutrientsIndicator.color = GetParameterColor(targetPlant.nutrients);
        }

        private void UpdatePosition()
        {
            Vector3 worldPosition = targetPlant.transform.position + offset;
            transform.position = worldPosition;
            transform.LookAt(mainCamera.transform);
        }

        private string GetStageName(PlantState state)
        {
            switch (state)
            {
                case PlantState.Seed: return "种子";
                case PlantState.Sprout: return "发芽";
                case PlantState.Young: return "幼苗";
                case PlantState.Mature: return "成熟";
                case PlantState.Flowering: return "开花";
                case PlantState.Dead: return "死亡";
                default: return state.ToString();
            }
        }

        private Color GetStageColor(PlantState state)
        {
            switch (state)
            {
                case PlantState.Seed: return new Color(0.6f, 0.4f, 0.2f);
                case PlantState.Sprout: return new Color(0.7f, 0.9f, 0.5f);
                case PlantState.Young: return new Color(0.4f, 0.8f, 0.4f);
                case PlantState.Mature: return new Color(0.2f, 0.7f, 0.3f);
                case PlantState.Flowering: return new Color(1f, 0.5f, 0.8f);
                case PlantState.Dead: return new Color(0.3f, 0.3f, 0.3f);
                default: return Color.white;
            }
        }

        private Color GetParameterColor(float value)
        {
            if (value <= 0.2f) return badColor;
            if (value < 0.5f) return Color.Lerp(badColor, warningColor, (value - 0.2f) / 0.3f);
            if (value < 0.7f) return Color.Lerp(warningColor, normalColor, (value - 0.5f) / 0.2f);
            if (value <= 1.3f) return Color.Lerp(goodColor, optimalColor, (value - 0.7f) / 0.6f);
            return Color.Lerp(optimalColor, normalColor, (value - 1.3f) / 0.7f);
        }

        private Color GetMultiplierColor(float multiplier)
        {
            if (multiplier >= 1.3f) return optimalColor;
            if (multiplier >= 0.8f) return goodColor;
            if (multiplier >= 0.5f) return normalColor;
            if (multiplier >= 0.2f) return warningColor;
            return badColor;
        }

        private Color GetHealthColor(float healthFactor)
        {
            if (healthFactor >= 0.8f) return goodColor;
            if (healthFactor >= 0.5f) return normalColor;
            if (healthFactor >= 0.2f) return warningColor;
            return badColor;
        }

        public void SetTargetPlant(PlantBase plant)
        {
            targetPlant = plant;
        }
    }
}
