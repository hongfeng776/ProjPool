using UnityEngine;
using System.Collections.Generic;

namespace LightAndShadowMaze
{
    public class MazeLightingEnhancer : MonoBehaviour
    {
        [Header("Wall Lighting")]
        public bool addWallEmission = true;
        public Color wallEmissionColor = new Color(0.1f, 0.15f, 0.25f);
        public float wallEmissionIntensity = 0.1f;

        [Header("Torches")]
        public bool addTorches = true;
        public int torchCount = 8;
        public float torchIntensity = 4f;
        public float torchRange = 8f;
        public Color torchColor = new Color(1f, 0.6f, 0.3f);
        public bool torchFlicker = true;

        [Header("Fog")]
        public bool dynamicFog = true;
        public float minFogDensity = 0.01f;
        public float maxFogDensity = 0.04f;
        public float fogChangeSpeed = 0.5f;

        [Header("Player Light")]
        public bool enhancePlayerLight = true;
        public Color playerLightColor = new Color(1f, 0.9f, 0.7f);
        public float playerLightIntensity = 10f;
        public float playerLightRange = 15f;

        private List<Light> torches = new List<Light>();
        private MazeGenerator mazeGenerator;

        private void Start()
        {
            mazeGenerator = FindObjectOfType<MazeGenerator>();
            Invoke(nameof(ApplyEnhancements), 0.5f);
        }

        private void ApplyEnhancements()
        {
            if (mazeGenerator == null)
            {
                mazeGenerator = FindObjectOfType<MazeGenerator>();
            }

            if (addWallEmission)
            {
                ApplyWallEmission();
            }

            if (addTorches)
            {
                CreateTorches();
            }

            if (enhancePlayerLight)
            {
                EnhancePlayerLight();
            }
        }

        private void ApplyWallEmission()
        {
            if (mazeGenerator == null) return;

            Renderer[] renderers = mazeGenerator.GetComponentsInChildren<Renderer>();
            foreach (Renderer renderer in renderers)
            {
                if (renderer.gameObject.name.Contains("Wall"))
                {
                    Material mat = renderer.material;
                    if (mat != null)
                    {
                        mat.EnableKeyword("_EMISSION");
                        mat.SetColor("_EmissionColor", wallEmissionColor * wallEmissionIntensity);
                    }
                }
            }
        }

        private void CreateTorches()
        {
            if (mazeGenerator == null) return;

            int[,] mazeData = mazeGenerator.GetMazeData();
            if (mazeData == null) return;

            int width = mazeGenerator.width;
            int height = mazeGenerator.height;
            float cellSize = mazeGenerator.cellSize;

            List<Vector2Int> validPositions = new List<Vector2Int>();

            for (int x = 2; x < width - 2; x += 3)
            {
                for (int y = 2; y < height - 2; y += 3)
                {
                    if (mazeData[x, y] == 0)
                    {
                        validPositions.Add(new Vector2Int(x, y));
                    }
                }
            }

            for (int i = 0; i < Mathf.Min(torchCount, validPositions.Count); i++)
            {
                int index = Random.Range(0, validPositions.Count);
                Vector2Int pos = validPositions[index];
                validPositions.RemoveAt(index);

                Vector3 worldPos = new Vector3(pos.x * cellSize, 2.5f, pos.y * cellSize);
                CreateTorch(worldPos);
            }
        }

        private void CreateTorch(Vector3 position)
        {
            GameObject torchObj = new GameObject("Torch");
            torchObj.transform.position = position;

            GameObject visualObj = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            visualObj.transform.SetParent(torchObj.transform);
            visualObj.transform.localPosition = new Vector3(0, -0.5f, 0);
            visualObj.transform.localScale = new Vector3(0.15f, 0.5f, 0.15f);
            
            Renderer renderer = visualObj.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material.color = new Color(0.4f, 0.25f, 0.1f);
            }

            Destroy(visualObj.GetComponent<Collider>());

            Light torchLight = torchObj.AddComponent<Light>();
            torchLight.type = LightType.Point;
            torchLight.color = torchColor;
            torchLight.intensity = torchIntensity;
            torchLight.range = torchRange;
            torchLight.shadows = LightShadows.Soft;
            torchLight.shadowStrength = 0.5f;

            if (torchFlicker)
            {
                TorchFlicker flicker = torchObj.AddComponent<TorchFlicker>();
                flicker.baseIntensity = torchIntensity;
                flicker.flickerAmount = 0.5f;
                flicker.flickerSpeed = 5f;
            }

            torches.Add(torchLight);
        }

        private void EnhancePlayerLight()
        {
            PlayerController player = FindObjectOfType<PlayerController>();
            if (player != null)
            {
                player.SetLightIntensity(playerLightIntensity);
                player.SetLightRange(playerLightRange);
                player.SetLightColor(playerLightColor);
            }
        }

        private void Update()
        {
            if (dynamicFog)
            {
                float fogDensity = Mathf.PingPong(Time.time * fogChangeSpeed, maxFogDensity - minFogDensity) + minFogDensity;
                RenderSettings.fogDensity = fogDensity;
            }
        }

        public void SetDarknessLevel(float level)
        {
            float targetIntensity = Mathf.Lerp(torchIntensity * 1.5f, torchIntensity * 0.3f, level);
            foreach (Light torch in torches)
            {
                if (torch != null)
                {
                    torch.intensity = targetIntensity;
                }
            }

            if (LightingManager.Instance != null)
            {
                LightingManager.Instance.SetDarknessLevel(level);
            }
        }
    }

    public class TorchFlicker : MonoBehaviour
    {
        public float baseIntensity = 4f;
        public float flickerAmount = 0.5f;
        public float flickerSpeed = 5f;

        private Light torchLight;
        private float noiseOffset;

        private void Start()
        {
            torchLight = GetComponent<Light>();
            noiseOffset = Random.Range(0f, 1000f);
        }

        private void Update()
        {
            if (torchLight != null)
            {
                float noise = Mathf.PerlinNoise(noiseOffset, Time.time * flickerSpeed);
                torchLight.intensity = baseIntensity + (noise - 0.5f) * flickerAmount * 2f;
            }
        }
    }
}
