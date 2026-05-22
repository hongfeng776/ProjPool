using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace LightAndShadowMaze
{
    public class LightDirectionIndicator : MonoBehaviour
    {
        [Header("References")]
        public LightDirectionController lightController;
        public RectTransform indicatorPanel;
        public RectTransform indicatorArrow;
        public TextMeshProUGUI angleText;

        [Header("Settings")]
        public float indicatorSize = 80f;
        public Color indicatorColor = new Color(1f, 0.9f, 0.7f, 0.9f);
        public Color backgroundColor = new Color(0.1f, 0.1f, 0.15f, 0.6f);
        public bool showAngleText = true;

        private Image panelImage;
        private Image arrowImage;

        private void Awake()
        {
            InitializeIndicator();
        }

        private void Start()
        {
            if (lightController == null)
            {
                lightController = FindObjectOfType<LightDirectionController>();
            }
        }

        private void InitializeIndicator()
        {
            if (indicatorPanel == null)
            {
                CreateIndicatorUI();
            }
            else
            {
                panelImage = indicatorPanel.GetComponent<Image>();
                if (panelImage == null)
                {
                    panelImage = indicatorPanel.gameObject.AddComponent<Image>();
                }
                panelImage.color = backgroundColor;
            }

            if (indicatorArrow == null)
            {
                CreateArrow();
            }
            else
            {
                arrowImage = indicatorArrow.GetComponent<Image>();
                if (arrowImage == null)
                {
                    arrowImage = indicatorArrow.gameObject.AddComponent<Image>();
                }
                arrowImage.color = indicatorColor;
            }

            if (showAngleText && angleText == null)
            {
                CreateAngleText();
            }
        }

        private void CreateIndicatorUI()
        {
            Canvas canvas = FindObjectOfType<Canvas>();
            if (canvas == null)
            {
                GameObject canvasObj = new GameObject("LightIndicatorCanvas");
                canvas = canvasObj.AddComponent<Canvas>();
                canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                canvasObj.AddComponent<CanvasScaler>();
                canvasObj.AddComponent<GraphicRaycaster>();
            }

            GameObject panelObj = new GameObject("LightDirectionPanel");
            panelObj.transform.SetParent(canvas.transform, false);
            indicatorPanel = panelObj.AddComponent<RectTransform>();
            
            indicatorPanel.anchorMin = new Vector2(1, 0);
            indicatorPanel.anchorMax = new Vector2(1, 0);
            indicatorPanel.pivot = new Vector2(1, 0);
            indicatorPanel.anchoredPosition = new Vector2(-20, 20);
            indicatorPanel.sizeDelta = new Vector2(indicatorSize, indicatorSize);

            panelImage = panelObj.AddComponent<Image>();
            panelImage.color = backgroundColor;

            indicatorPanel = panelObj.GetComponent<RectTransform>();
        }

        private void CreateArrow()
        {
            if (indicatorPanel == null) return;

            GameObject arrowObj = new GameObject("Arrow");
            arrowObj.transform.SetParent(indicatorPanel, false);
            indicatorArrow = arrowObj.AddComponent<RectTransform>();
            indicatorArrow.sizeDelta = new Vector2(indicatorSize * 0.4f, indicatorSize * 0.5f);
            indicatorArrow.anchoredPosition = Vector2.zero;

            arrowImage = arrowObj.AddComponent<Image>();
            arrowImage.color = indicatorColor;
            arrowImage.sprite = CreateArrowSprite();
            arrowImage.useSpriteMesh = true;
        }

        private Sprite CreateArrowSprite()
        {
            Texture2D texture = new Texture2D(64, 64);
            Color[] colors = new Color[64 * 64];
            
            for (int i = 0; i < colors.Length; i++)
            {
                colors[i] = Color.clear;
            }

            Vector2 center = new Vector2(32, 32);
            for (int y = 0; y < 64; y++)
            {
                for (int x = 0; x < 64; x++)
                {
                    Vector2 point = new Vector2(x, y);
                    float dist = Vector2.Distance(point, center);
                    
                    if (y > 16 && y < 56)
                    {
                        float widthAtY = Mathf.Lerp(8, 20, (y - 16) / 40f);
                        if (Mathf.Abs(x - 32) < widthAtY)
                        {
                            colors[y * 64 + x] = Color.white;
                        }
                    }
                    
                    if (y >= 48 && y < 56)
                    {
                        float tipWidth = Mathf.Lerp(20, 0, (y - 48) / 8f);
                        if (Mathf.Abs(x - 32) < tipWidth)
                        {
                            colors[y * 64 + x] = Color.white;
                        }
                    }
                }
            }

            texture.SetPixels(colors);
            texture.Apply();

            return Sprite.Create(texture, new Rect(0, 0, 64, 64), new Vector2(0.5f, 0.5f));
        }

        private void CreateAngleText()
        {
            if (indicatorPanel == null) return;

            GameObject textObj = new GameObject("AngleText");
            textObj.transform.SetParent(indicatorPanel, false);
            RectTransform textRect = textObj.AddComponent<RectTransform>();
            textRect.anchoredPosition = new Vector2(0, -indicatorSize * 0.4f);
            textRect.sizeDelta = new Vector2(indicatorSize, 20);

            angleText = textObj.AddComponent<TextMeshProUGUI>();
            angleText.fontSize = 14;
            angleText.alignment = TextAlignmentOptions.Center;
            angleText.color = indicatorColor;
        }

        private void Update()
        {
            if (lightController == null) return;

            UpdateIndicator();
        }

        private void UpdateIndicator()
        {
            if (indicatorArrow != null)
            {
                float horizontal = lightController.GetHorizontalAngle();
                float vertical = lightController.GetVerticalAngle();
                
                indicatorArrow.localRotation = Quaternion.Euler(0, 0, -horizontal);
                
                Vector2 arrowPos = new Vector2(
                    Mathf.Sin(horizontal * Mathf.Deg2Rad) * 10f,
                    Mathf.Cos(horizontal * Mathf.Deg2Rad) * 10f
                );
                indicatorArrow.anchoredPosition = arrowPos;
                
                float scale = 1f + (vertical / 60f) * 0.3f;
                indicatorArrow.localScale = Vector3.one * Mathf.Clamp(scale, 0.7f, 1.3f);
            }

            if (showAngleText && angleText != null)
            {
                float h = lightController.GetHorizontalAngle();
                float v = lightController.GetVerticalAngle();
                angleText.text = $"H:{h:F0}° V:{v:F0}°";
            }
        }

        public void SetVisible(bool visible)
        {
            if (indicatorPanel != null)
            {
                indicatorPanel.gameObject.SetActive(visible);
            }
        }
    }
}
