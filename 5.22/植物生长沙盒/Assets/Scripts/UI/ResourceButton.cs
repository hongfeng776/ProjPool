using UnityEngine;
using UnityEngine.UI;
using TMPro;
using PlantSandbox.Core;

namespace PlantSandbox.UI
{
    public class ResourceButton : MonoBehaviour
    {
        public enum ResourceType
        {
            Water,
            Sunlight,
            Nutrients
        }

        [Header("按钮设置")]
        public ResourceType resourceType;
        public int amount = 10;
        public Button button;
        public TextMeshProUGUI buttonText;

        private void Start()
        {
            if (button != null)
            {
                button.onClick.AddListener(OnButtonClicked);
            }
            UpdateButtonText();
        }

        private void OnButtonClicked()
        {
            if (GameManager.Instance == null) return;

            switch (resourceType)
            {
                case ResourceType.Water:
                    GameManager.Instance.AddWater(amount);
                    break;
                case ResourceType.Sunlight:
                    GameManager.Instance.AddSunlight(amount);
                    break;
                case ResourceType.Nutrients:
                    GameManager.Instance.AddNutrients(amount);
                    break;
            }
        }

        private void UpdateButtonText()
        {
            if (buttonText == null) return;

            string resourceName = "";
            switch (resourceType)
            {
                case ResourceType.Water:
                    resourceName = "水";
                    break;
                case ResourceType.Sunlight:
                    resourceName = "光";
                    break;
                case ResourceType.Nutrients:
                    resourceName = "养分";
                    break;
            }
            buttonText.text = $"+{amount} {resourceName}";
        }
    }
}
