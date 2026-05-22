using UnityEngine;
using System.Collections.Generic;
using PlantSandbox.Plant;

namespace PlantSandbox.Core
{
    public class EnvironmentManager : MonoBehaviour
    {
        public static EnvironmentManager Instance { get; private set; }

        [Header("全局环境参数")]
        [Range(0f, 2f)]
        public float globalSunlight = 1f;
        [Range(0f, 2f)]
        public float globalWater = 1f;
        [Range(0f, 2f)]
        public float globalTemperature = 1f;
        [Range(0f, 2f)]
        public float globalNutrients = 1f;

        [Header("参数变化设置")]
        public bool enableAutoChange = false;
        public float changeInterval = 30f;
        public float changeAmount = 0.2f;

        [Header("时间设置")]
        public float dayNightCycleDuration = 120f;
        public bool enableDayNightCycle = false;

        [Header("植物列表")]
        public List<PlantBase> plants = new List<PlantBase>();

        private float timer;
        private float dayNightTimer;
        private float baseSunlight;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
                return;
            }

            baseSunlight = globalSunlight;
        }

        private void Update()
        {
            if (enableAutoChange)
            {
                timer += Time.deltaTime;
                if (timer >= changeInterval)
                {
                    timer = 0f;
                    AutoChangeParameters();
                }
            }

            if (enableDayNightCycle)
            {
                UpdateDayNightCycle();
            }
        }

        private void AutoChangeParameters()
        {
            float delta = Random.Range(-changeAmount, changeAmount);
            SetSunlight(globalSunlight + delta);

            delta = Random.Range(-changeAmount, changeAmount);
            SetWater(globalWater + delta);

            delta = Random.Range(-changeAmount, changeAmount);
            SetTemperature(globalTemperature + delta);

            delta = Random.Range(-changeAmount, changeAmount);
            SetNutrients(globalNutrients + delta);
        }

        private void UpdateDayNightCycle()
        {
            dayNightTimer += Time.deltaTime;
            float cycleProgress = (dayNightTimer % dayNightCycleDuration) / dayNightCycleDuration;
            
            float dayNightFactor = Mathf.Sin(cycleProgress * Mathf.PI * 2f) * 0.5f + 0.5f;
            float targetSunlight = baseSunlight * (0.3f + dayNightFactor * 0.7f);
            
            globalSunlight = Mathf.Lerp(globalSunlight, targetSunlight, Time.deltaTime * 0.5f);
            
            UpdateAllPlants();
        }

        public void SetSunlight(float value)
        {
            globalSunlight = Mathf.Clamp(value, 0f, 2f);
            UpdateAllPlants();
        }

        public void SetWater(float value)
        {
            globalWater = Mathf.Clamp(value, 0f, 2f);
            UpdateAllPlants();
        }

        public void SetTemperature(float value)
        {
            globalTemperature = Mathf.Clamp(value, 0f, 2f);
            UpdateAllPlants();
        }

        public void SetNutrients(float value)
        {
            globalNutrients = Mathf.Clamp(value, 0f, 2f);
            UpdateAllPlants();
        }

        public void AddSunlight(float amount)
        {
            SetSunlight(globalSunlight + amount);
        }

        public void AddWater(float amount)
        {
            SetWater(globalWater + amount);
        }

        public void AddTemperature(float amount)
        {
            SetTemperature(globalTemperature + amount);
        }

        public void AddNutrients(float amount)
        {
            SetNutrients(globalNutrients + amount);
        }

        public void RegisterPlant(PlantBase plant)
        {
            if (!plants.Contains(plant))
            {
                plants.Add(plant);
                UpdatePlantParameters(plant);
            }
        }

        public void UnregisterPlant(PlantBase plant)
        {
            if (plants.Contains(plant))
            {
                plants.Remove(plant);
            }
        }

        private void UpdateAllPlants()
        {
            foreach (PlantBase plant in plants)
            {
                if (plant != null)
                {
                    UpdatePlantParameters(plant);
                }
            }
        }

        private void UpdatePlantParameters(PlantBase plant)
        {
            plant.SetSunlight(globalSunlight);
            plant.SetWater(globalWater);
            plant.SetTemperature(globalTemperature);
            plant.SetNutrients(globalNutrients);
        }

        public void ResetToDefault()
        {
            globalSunlight = 1f;
            globalWater = 1f;
            globalTemperature = 1f;
            globalNutrients = 1f;
            baseSunlight = 1f;
            timer = 0f;
            dayNightTimer = 0f;
            
            UpdateAllPlants();
        }
    }
}
