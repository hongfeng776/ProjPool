using UnityEngine;
using System.Collections.Generic;
using PlantSandbox.Plant;

namespace PlantSandbox.Testing
{
    public class GrowthDataRecorder : MonoBehaviour
    {
        [Header("目标植物")]
        public PlantBase targetPlant;

        [Header("记录设置")]
        public float recordInterval = 0.5f;
        public int maxRecordCount = 120;
        public bool autoStartRecording = true;

        [Header("显示设置")]
        public bool showGraph = true;
        public Vector2 graphPosition = new Vector2(10, 450);
        public Vector2 graphSize = new Vector2(400, 150);

        [Header("数据")]
        public List<float> growthProgressHistory = new List<float>();
        public List<float> growthMultiplierHistory = new List<float>();
        public List<float> healthHistory = new List<float>();

        private float recordTimer;
        private bool isRecording;

        private void Start()
        {
            if (autoStartRecording)
            {
                StartRecording();
            }
        }

        private void Update()
        {
            if (isRecording && targetPlant != null)
            {
                recordTimer += Time.deltaTime;
                if (recordTimer >= recordInterval)
                {
                    RecordData();
                    recordTimer = 0f;
                }
            }
        }

        public void StartRecording()
        {
            isRecording = true;
            recordTimer = 0f;
            ClearData();
        }

        public void StopRecording()
        {
            isRecording = false;
        }

        public void ClearData()
        {
            growthProgressHistory.Clear();
            growthMultiplierHistory.Clear();
            healthHistory.Clear();
        }

        private void RecordData()
        {
            if (targetPlant == null) return;

            growthProgressHistory.Add(targetPlant.GetGrowthPercentage());
            growthMultiplierHistory.Add(targetPlant.growthMultiplier);
            healthHistory.Add(targetPlant.health);

            if (growthProgressHistory.Count > maxRecordCount)
            {
                growthProgressHistory.RemoveAt(0);
                growthMultiplierHistory.RemoveAt(0);
                healthHistory.RemoveAt(0);
            }
        }

        private void OnGUI()
        {
            if (!showGraph || targetPlant == null) return;

            GUILayout.BeginArea(new Rect(graphPosition.x, graphPosition.y, graphSize.x + 20, graphSize.y + 60));
            
            GUILayout.Label("=== 生长数据记录 ===");
            
            GUILayout.BeginHorizontal();
            if (isRecording)
            {
                if (GUILayout.Button("停止", GUILayout.Width(60))) StopRecording();
            }
            else
            {
                if (GUILayout.Button("开始", GUILayout.Width(60))) StartRecording();
            }
            if (GUILayout.Button("清空", GUILayout.Width(60))) ClearData();
            GUILayout.EndHorizontal();

            DrawGraph();
            
            GUILayout.EndArea();
        }

        private void DrawGraph()
        {
            if (growthProgressHistory.Count < 2) return;

            float graphWidth = graphSize.x;
            float graphHeight = graphSize.y;
            float startX = 0;
            float startY = 30;

            GUI.Box(new Rect(startX, startY, graphWidth, graphHeight), "");

            DrawGrid(startX, startY, graphWidth, graphHeight);

            if (growthMultiplierHistory.Count > 0)
            {
                DrawCurve(startX, startY, graphWidth, graphHeight, growthMultiplierHistory, 2f, Color.green, 0f, 2f);
            }

            if (growthProgressHistory.Count > 0)
            {
                DrawCurve(startX, startY, graphWidth, graphHeight, growthProgressHistory, 2f, Color.blue, 0f, 100f);
            }

            DrawLegend(startX, startY + graphHeight + 5);
        }

        private void DrawGrid(float x, float y, float width, float height)
        {
            Color originalColor = GUI.color;
            GUI.color = new Color(0.5f, 0.5f, 0.5f, 0.3f);

            int gridLines = 5;
            for (int i = 0; i <= gridLines; i++)
            {
                float lineY = y + (height / gridLines) * i;
                DrawLine(new Vector2(x, lineY), new Vector2(x + width, lineY), 1f);
            }

            for (int i = 0; i <= gridLines * 2; i++)
            {
                float lineX = x + (width / (gridLines * 2)) * i;
                DrawLine(new Vector2(lineX, y), new Vector2(lineX, y + height), 1f);
            }

            GUI.color = originalColor;
        }

        private void DrawCurve(float x, float y, float width, float height, List<float> data, float thickness, Color color, float minValue, float maxValue)
        {
            if (data.Count < 2) return;

            Color originalColor = GUI.color;
            GUI.color = color;

            float stepX = width / (maxRecordCount - 1);
            float valueRange = maxValue - minValue;

            for (int i = 0; i < data.Count - 1; i++)
            {
                float normalizedValue1 = (data[i] - minValue) / valueRange;
                float normalizedValue2 = (data[i + 1] - minValue) / valueRange;

                float x1 = x + i * stepX;
                float y1 = y + height - (normalizedValue1 * height);
                float x2 = x + (i + 1) * stepX;
                float y2 = y + height - (normalizedValue2 * height);

                DrawLine(new Vector2(x1, y1), new Vector2(x2, y2), thickness);
            }

            GUI.color = originalColor;
        }

        private void DrawLine(Vector2 start, Vector2 end, float thickness)
        {
            Vector2 delta = end - start;
            float angle = Mathf.Atan2(delta.y, delta.x) * Mathf.Rad2Deg;
            
            GUIUtility.RotateAroundPivot(angle, start);
            GUI.DrawTexture(new Rect(start.x, start.y - thickness / 2f, delta.magnitude, thickness), Texture2D.whiteTexture);
            GUIUtility.RotateAroundPivot(-angle, start);
        }

        private void DrawLegend(float x, float y)
        {
            Color originalColor = GUI.color;
            
            GUI.color = Color.green;
            GUILayout.BeginArea(new Rect(x, y, 200, 20));
            GUILayout.Label("绿色: 生长倍率    蓝色: 生长进度");
            GUILayout.EndArea();
            
            GUI.color = originalColor;
        }

        public void SetTargetPlant(PlantBase plant)
        {
            targetPlant = plant;
            ClearData();
        }
    }
}
