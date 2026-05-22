using UnityEngine;
using UnityEngine.UI;
using TMPro;
using PlantSandbox.Core;
using PlantSandbox.Plant;

namespace PlantSandbox.UI
{
    public class EnvironmentPanelUI : MonoBehaviour
    {
        [Header("目标植物")]
        public PlantBase targetPlant;
        public bool useGlobalEnvironment = true;

        [Header("参数滑条")]
        public Slider sunlightSlider;
        public Slider waterSlider;
        public Slider temperatureSlider;
        public Slider nutrientsSlider;

        [Header("参数数值显示")]
        public TextMeshProUGUI sunlightValue;
        public TextMeshProUGUI waterValue;
        public TextMeshProUGUI temperatureValue;
        public TextMeshProUGUI nutrientsValue;

        [Header("生长状态显示")]
        public TextMeshProUGUI growthMultiplierText;
        public TextMeshProUGUI growthStatusText;
        public TextMeshProUGUI healthStatusText;
        public TextMeshProUGUI healthValueText;

        [Header("快捷按钮")]
        public Button resetButton;
        public Button optimalButton;
        public Button minimalButton;

        [Header("颜色指示器")]
        public Image sunlightIndicator;
        public Image waterIndicator;
        public Image temperatureIndicator;
        public Image nutrientsIndicator;
        public Image overallHealthIndicator;

        [Header("颜色设置")]
        public Color badColor = Color.red;
        public Color normalColor = Color.yellow;
        public Color goodColor = Color.green;
        public Color optimalColor = new Color(0f, 1f, 0.5f);

        private bool isUpdatingUI;

        private void Start()
        {
            SetupSliders();
            SetupButtons();
            UpdateUI();
        }

        private void SetupSliders()
        {
            if (sunlightSlider != null)
            {
                sunlightSlider.minValue = 0f;
                sunlightSlider.maxValue = 2f;
                sunlightSlider.onValueChanged.AddListener(OnSunlightChanged);
            }

            if (waterSlider != null)
            {
                waterSlider.minValue = 0f;
                waterSlider.maxValue = 2f;
                waterSlider.onValueChanged.AddListener(OnWaterChanged);
            }

            if (temperatureSlider != null)
            {
                temperatureSlider.minValue = 0f;
                temperatureSlider.maxValue = 2f;
                temperatureSlider.onValueChanged.AddListener(OnTemperatureChanged);
            }

            if (nutrientsSlider != null)
            {
                nutrientsSlider.minValue = 0f;
                nutrientsSlider.maxValue = 2f;
                nutrientsSlider.onValueChanged.AddListener(OnNutrientsChanged);
            }
        }

        private void SetupButtons()
        {
            if (resetButton != null)
                resetButton.onClick.AddListener(OnResetClicked);

            if (optimalButton != null)
                optimalButton.onClick.AddListener(OnOptimalClicked);

            if (minimalButton != null)
                minimalButton.onClick.AddListener(OnMinimalClicked);
        }

        private void Update()
        {
            UpdateUI();
        }

        private void UpdateUI()
        {
            if (targetPlant == null && !useGlobalEnvironment) return;

            isUpdatingUI = true;

            float sunlight = useGlobalEnvironment ? 
                (EnvironmentManager.Instance != null ? EnvironmentManager.Instance.globalSunlight : 1f) : 
                (targetPlant != null ? targetPlant.sunlight : 1f);

            float water = useGlobalEnvironment ? 
                (EnvironmentManager.Instance != null ? EnvironmentManager.Instance.globalWater : 1f) : 
                (targetPlant != null ? targetPlant.water : 1f);

            float temperature = useGlobalEnvironment ? 
                (EnvironmentManager.Instance != null ? EnvironmentManager.Instance.globalTemperature : 1f) : 
                (targetPlant != null ? targetPlant.temperature : 1f);

            float nutrients = useGlobalEnvironment ? 
                (EnvironmentManager.Instance != null ? EnvironmentManager.Instance.globalNutrients : 1f) : 
                (targetPlant != null ? targetPlant.nutrients : 1f);

            if (sunlightSlider != null) sunlightSlider.SetValueWithoutNotify(sunlight);
            if (waterSlider != null) waterSlider.SetValueWithoutNotify(water);
            if (temperatureSlider != null) temperatureSlider.SetValueWithoutNotify(temperature);
            if (nutrientsSlider != null) nutrientsSlider.SetValueWithoutNotify(nutrients);

            if (sunlightValue != null) sunlightValue.text = $"{sunlight:F2}";
            if (waterValue != null) waterValue.text = $"{water:F2}";
            if (temperatureValue != null) temperatureValue.text = $"{temperature:F2}";
            if (nutrientsValue != null) nutrientsValue.text = $"{nutrients:F2}";

            UpdateIndicatorColor(sunlightIndicator, sunlight);
            UpdateIndicatorColor(waterIndicator, water);
            UpdateIndicatorColor(temperatureIndicator, temperature);
            UpdateIndicatorColor(nutrientsIndicator, nutrients);

            if (targetPlant != null)
            {
                if (growthMultiplierText != null)
                    growthMultiplierText.text = $"生长倍率: {targetPlant.growthMultiplier:F2}x";

                if (growthStatusText != null)
                    growthStatusText.text = $"状态: {targetPlant.GetGrowthStatus()}";

                if (healthStatusText != null)
                    healthStatusText.text = $"健康: {targetPlant.GetHealthStatus()}";

                if (healthValueText != null)
                    healthValueText.text = $"{targetPlant.health:F0}/{targetPlant.maxHealth}";

                if (overallHealthIndicator != null)
                {
                    float healthFactor = targetPlant.health / targetPlant.maxHealth;
                    overallHealthIndicator.color = GetHealthColor(healthFactor);
                }
            }

            isUpdatingUI = false;
        }

        private void UpdateIndicatorColor(Image indicator, float value)
        {
            if (indicator == null) return;
            indicator.color = GetParameterColor(value);
        }

        private Color GetParameterColor(float value)
        {
            if (value <= 0.2f) return badColor;
            if (value < 0.7f) return Color.Lerp(badColor, normalColor, (value - 0.2f) / 0.5f);
            if (value <= 1.3f) return Color.Lerp(goodColor, optimalColor, (value - 0.7f) / 0.6f);
            return Color.Lerp(optimalColor, normalColor, (value - 1.3f) / 0.7f);
        }

        private Color GetHealthColor(float healthFactor)
        {
            if (healthFactor >= 0.8f) return goodColor;
            if (healthFactor >= 0.5f) return normalColor;
            return badColor;
        }

        private void OnSunlightChanged(float value)
        {
            if (isUpdatingUI) return;
            SetParameterValue("sunlight", value);
        }

        private void OnWaterChanged(float value)
        {
            if (isUpdatingUI) return;
            SetParameterValue("water", value);
        }

        private void OnTemperatureChanged(float value)
        {
            if (isUpdatingUI) return;
            SetParameterValue("temperature", value);
        }

        private void OnNutrientsChanged(float value)
        {
            if (isUpdatingUI) return;
            SetParameterValue("nutrients", value);
        }

        private void SetParameterValue(string parameter, float value)
        {
            if (useGlobalEnvironment && EnvironmentManager.Instance != null)
            {
                switch (parameter)
                {
                    case "sunlight": EnvironmentManager.Instance.SetSunlight(value); break;
                    case "water": EnvironmentManager.Instance.SetWater(value); break;
                    case "temperature": EnvironmentManager.Instance.SetTemperature(value); break;
                    case "nutrients": EnvironmentManager.Instance.SetNutrients(value); break;
                }
            }
            else if (targetPlant != null)
            {
                switch (parameter)
                {
                    case "sunlight": targetPlant.SetSunlight(value); break;
                    case "water": targetPlant.SetWater(value); break;
                    case "temperature": targetPlant.SetTemperature(value); break;
                    case "nutrients": targetPlant.SetNutrients(value); break;
                }
            }
        }

        private void OnResetClicked()
        {
            if (useGlobalEnvironment && EnvironmentManager.Instance != null)
            {
                EnvironmentManager.Instance.ResetToDefault();
            }
            else if (targetPlant != null)
            {
                targetPlant.SetSunlight(1f);
                targetPlant.SetWater(1f);
                targetPlant.SetTemperature(1f);
                targetPlant.SetNutrients(1f);
            }
        }

        private void OnOptimalClicked()
        {
            float optimalValue = 1.0f;
            SetAllParameters(optimalValue);
        }

        private void OnMinimalClicked()
        {
            float minimalValue = 0.3f;
            SetAllParameters(minimalValue);
        }

        private void SetAllParameters(float value)
        {
            if (useGlobalEnvironment && EnvironmentManager.Instance != null)
            {
                EnvironmentManager.Instance.SetSunlight(value);
                EnvironmentManager.Instance.SetWater(value);
                EnvironmentManager.Instance.SetTemperature(value);
                EnvironmentManager.Instance.SetNutrients(value);
            }
            else if (targetPlant != null)
            {
                targetPlant.SetSunlight(value);
                targetPlant.SetWater(value);
                targetPlant.SetTemperature(value);
                targetPlant.SetNutrients(value);
            }
        }

        public void SetTargetPlant(PlantBase plant)
        {
            targetPlant = plant;
        }
    }
}
