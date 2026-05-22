using UnityEngine;

namespace LightAndShadowMaze
{
    public class LightingManager : MonoBehaviour
    {
        public static LightingManager Instance { get; private set; }

        [Header("Ambient Lighting")]
        public Color ambientColor = new Color(0.05f, 0.05f, 0.1f);
        public float ambientIntensity = 0.1f;

        [Header("Directional Light")]
        public Light directionalLight;
        public Color sunColor = new Color(0.3f, 0.35f, 0.5f);
        public float sunIntensity = 0.15f;
        public Vector3 sunRotation = new Vector3(50f, 30f, 0f);

        [Header("Fog")]
        public bool useFog = true;
        public Color fogColor = new Color(0.05f, 0.05f, 0.1f);
        public float fogDensity = 0.02f;

        [Header("Post Processing")]
        public bool useBloom = true;
        public float bloomIntensity = 0.5f;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
        }

        private void Start()
        {
            SetupLighting();
        }

        private void SetupLighting()
        {
            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
            RenderSettings.ambientLight = ambientColor * ambientIntensity;

            SetupDirectionalLight();
            SetupFog();
        }

        private void SetupDirectionalLight()
        {
            if (directionalLight == null)
            {
                Light[] lights = FindObjectsOfType<Light>();
                foreach (Light light in lights)
                {
                    if (light.type == LightType.Directional)
                    {
                        directionalLight = light;
                        break;
                    }
                }

                if (directionalLight == null)
                {
                    GameObject sunObj = new GameObject("Directional Light");
                    directionalLight = sunObj.AddComponent<Light>();
                    directionalLight.type = LightType.Directional;
                }
            }

            directionalLight.color = sunColor;
            directionalLight.intensity = sunIntensity;
            directionalLight.transform.rotation = Quaternion.Euler(sunRotation);
            directionalLight.shadows = LightShadows.Soft;
            directionalLight.shadowStrength = 0.8f;
        }

        private void SetupFog()
        {
            RenderSettings.fog = useFog;
            RenderSettings.fogColor = fogColor;
            RenderSettings.fogMode = FogMode.Exponential;
            RenderSettings.fogDensity = fogDensity;
        }

        public void SetAmbientIntensity(float intensity)
        {
            ambientIntensity = intensity;
            RenderSettings.ambientLight = ambientColor * ambientIntensity;
        }

        public void SetFogDensity(float density)
        {
            fogDensity = density;
            RenderSettings.fogDensity = fogDensity;
        }

        public void SetDarknessLevel(float level)
        {
            ambientIntensity = Mathf.Lerp(0.3f, 0.02f, level);
            fogDensity = Mathf.Lerp(0.005f, 0.05f, level);
            sunIntensity = Mathf.Lerp(0.5f, 0.05f, level);

            RenderSettings.ambientLight = ambientColor * ambientIntensity;
            RenderSettings.fogDensity = fogDensity;
            
            if (directionalLight != null)
            {
                directionalLight.intensity = sunIntensity;
            }
        }
    }
}
