using UnityEngine;

namespace PlantSandbox.Core
{
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("游戏状态")]
        public bool isPaused = false;
        public float gameTime = 0f;
        public float timeScale = 1f;

        [Header("资源管理")]
        public int water = 100;
        public int sunlight = 100;
        public int nutrients = 100;

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
            }
        }

        private void Update()
        {
            if (!isPaused)
            {
                gameTime += Time.deltaTime * timeScale;
            }
        }

        public void PauseGame()
        {
            isPaused = true;
            Time.timeScale = 0f;
        }

        public void ResumeGame()
        {
            isPaused = false;
            Time.timeScale = 1f;
        }

        public void AddWater(int amount)
        {
            water += amount;
            water = Mathf.Max(0, water);
        }

        public void AddSunlight(int amount)
        {
            sunlight += amount;
            sunlight = Mathf.Max(0, sunlight);
        }

        public void AddNutrients(int amount)
        {
            nutrients += amount;
            nutrients = Mathf.Max(0, nutrients);
        }

        public bool ConsumeResources(int waterCost, int sunlightCost, int nutrientsCost)
        {
            if (water >= waterCost && sunlight >= sunlightCost && nutrients >= nutrientsCost)
            {
                water -= waterCost;
                sunlight -= sunlightCost;
                nutrients -= nutrientsCost;
                return true;
            }
            return false;
        }
    }
}
