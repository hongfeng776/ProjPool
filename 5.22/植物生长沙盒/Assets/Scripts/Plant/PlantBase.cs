using UnityEngine;

namespace PlantSandbox.Plant
{
    public enum PlantState
    {
        Seed,
        Sprout,
        Young,
        Mature,
        Flowering,
        Dead
    }

    public delegate void StageChanged(PlantState oldState, PlantState newState);
    public delegate void ParameterChanged(float newValue);

    public class PlantBase : MonoBehaviour
    {
        public event StageChanged OnStageChangedEvent;
        public event ParameterChanged OnSunlightChanged;
        public event ParameterChanged OnWaterChanged;
        public event ParameterChanged OnGrowthMultiplierChanged;

        [Header("植物基本属性")]
        public string plantName = "植物";
        public PlantState currentState = PlantState.Seed;
        public float growthProgress = 0f;
        public float maxGrowth = 100f;
        public float baseGrowthRate = 1f;

        [Header("环境参数")]
        [Range(0f, 2f)]
        public float sunlight = 1f;
        [Range(0f, 2f)]
        public float water = 1f;
        [Range(0f, 2f)]
        public float temperature = 1f;
        [Range(0f, 2f)]
        public float nutrients = 1f;

        [Header("参数权重")]
        public float sunlightWeight = 0.35f;
        public float waterWeight = 0.35f;
        public float temperatureWeight = 0.15f;
        public float nutrientsWeight = 0.15f;

        [Header("当前状态")]
        public float growthMultiplier = 1f;
        public float effectiveGrowthRate = 1f;

        [Header("生命值")]
        public float health = 100f;
        public float maxHealth = 100f;
        public float healthDecayRate = 2f;
        public float healthRecoveryRate = 1f;

        [Header("资源消耗")]
        public int waterCostPerSecond = 1;
        public int sunlightCostPerSecond = 1;
        public int nutrientsCostPerSecond = 1;

        [Header("生长阶段配置")]
        public float[] stageThresholds = { 0f, 15f, 35f, 60f, 85f, 100f };

        [Header("参数阈值")]
        public float minParameterThreshold = 0.2f;
        public float optimalParameterMin = 0.7f;
        public float optimalParameterMax = 1.3f;

        protected virtual void Update()
        {
            if (currentState != PlantState.Dead)
            {
                UpdateGrowthMultiplier();
                Grow();
                CheckStage();
                UpdateHealth();
            }
        }

        protected virtual void UpdateGrowthMultiplier()
        {
            float previousMultiplier = growthMultiplier;

            float sunlightFactor = CalculateParameterFactor(sunlight);
            float waterFactor = CalculateParameterFactor(water);
            float temperatureFactor = CalculateParameterFactor(temperature);
            float nutrientsFactor = CalculateParameterFactor(nutrients);

            growthMultiplier = 
                sunlightFactor * sunlightWeight +
                waterFactor * waterWeight +
                temperatureFactor * temperatureWeight +
                nutrientsFactor * nutrientsWeight;

            growthMultiplier = Mathf.Clamp(growthMultiplier, 0f, 2f);

            effectiveGrowthRate = baseGrowthRate * growthMultiplier;

            if (Mathf.Abs(growthMultiplier - previousMultiplier) > 0.001f)
            {
                OnGrowthMultiplierChanged?.Invoke(growthMultiplier);
            }
        }

        protected virtual float CalculateParameterFactor(float parameterValue)
        {
            if (parameterValue <= minParameterThreshold)
            {
                return 0f;
            }

            if (parameterValue >= optimalParameterMin && parameterValue <= optimalParameterMax)
            {
                return 1f + ((parameterValue - optimalParameterMin) / (optimalParameterMax - optimalParameterMin) * 0.5f);
            }

            if (parameterValue < optimalParameterMin)
            {
                return (parameterValue - minParameterThreshold) / (optimalParameterMin - minParameterThreshold);
            }

            float excess = parameterValue - optimalParameterMax;
            float maxExcess = 2f - optimalParameterMax;
            return 1.5f - (excess / maxExcess * 0.5f);
        }

        protected virtual void Grow()
        {
            if (CanGrow())
            {
                growthProgress += effectiveGrowthRate * Time.deltaTime;
                growthProgress = Mathf.Min(growthProgress, maxGrowth);
            }
        }

        protected virtual bool CanGrow()
        {
            return growthMultiplier > 0.1f;
        }

        protected virtual void UpdateHealth()
        {
            if (growthMultiplier <= 0.1f)
            {
                health -= healthDecayRate * Time.deltaTime;
                if (health <= 0)
                {
                    currentState = PlantState.Dead;
                    health = 0;
                }
            }
            else if (growthMultiplier >= 0.8f && health < maxHealth)
            {
                health += healthRecoveryRate * Time.deltaTime;
                health = Mathf.Min(health, maxHealth);
            }
        }

        protected virtual void CheckStage()
        {
            for (int i = stageThresholds.Length - 1; i >= 0; i--)
            {
                if (growthProgress >= stageThresholds[i])
                {
                    PlantState newState = (PlantState)i;
                    if (newState != currentState)
                    {
                        OnStageChanged(currentState, newState);
                        currentState = newState;
                    }
                    break;
                }
            }
        }

        protected virtual void OnStageChanged(PlantState oldState, PlantState newState)
        {
            Debug.Log($"{plantName} 从 {oldState} 生长到 {newState}");
            OnStageChangedEvent?.Invoke(oldState, newState);
        }

        public virtual void SetSunlight(float value)
        {
            sunlight = Mathf.Clamp(value, 0f, 2f);
            OnSunlightChanged?.Invoke(sunlight);
        }

        public virtual void SetWater(float value)
        {
            water = Mathf.Clamp(value, 0f, 2f);
            OnWaterChanged?.Invoke(water);
        }

        public virtual void SetTemperature(float value)
        {
            temperature = Mathf.Clamp(value, 0f, 2f);
        }

        public virtual void SetNutrients(float value)
        {
            nutrients = Mathf.Clamp(value, 0f, 2f);
        }

        public virtual void AddSunlight(float amount)
        {
            SetSunlight(sunlight + amount);
            Debug.Log($"{plantName} 获得了 {amount} 阳光，当前: {sunlight:F2}");
        }

        public virtual void AddWater(float amount)
        {
            SetWater(water + amount);
            Debug.Log($"{plantName} 获得了 {amount} 水分，当前: {water:F2}");
        }

        public virtual void Water(int amount)
        {
            AddWater(amount * 0.1f);
        }

        public virtual void AddNutrients(int amount)
        {
            SetNutrients(nutrients + amount * 0.1f);
            Debug.Log($"{plantName} 获得了 {amount} 养分，当前: {nutrients:F2}");
        }

        public float GetGrowthPercentage()
        {
            return growthProgress / maxGrowth * 100f;
        }

        public string GetHealthStatus()
        {
            if (health >= 80f) return "健康";
            if (health >= 50f) return "良好";
            if (health >= 20f) return "虚弱";
            return "危险";
        }

        public string GetGrowthStatus()
        {
            if (growthMultiplier >= 1.3f) return "快速生长";
            if (growthMultiplier >= 0.8f) return "正常生长";
            if (growthMultiplier >= 0.4f) return "生长缓慢";
            if (growthMultiplier > 0.1f) return "生长停滞";
            return "条件不足";
        }
    }
}
