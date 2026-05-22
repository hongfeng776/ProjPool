using UnityEngine;
using System.Collections;

namespace LightAndShadowMaze
{
    public class Goal : MonoBehaviour
    {
        [Header("Settings")]
        public float rotateSpeed = 60f;
        public float bobAmount = 0.2f;
        public float bobSpeed = 2f;
        public Color goalColor = new Color(0f, 1f, 0.6f);
        public float triggerRadius = 1.5f;

        [Header("Victory Effect")]
        public bool playVictoryEffect = true;
        public float lightFlashIntensity = 20f;
        public float lightFlashDuration = 2f;
        public ParticleSystem victoryParticles;

        [Header("References")]
        public Light goalLight;
        public Renderer goalRenderer;

        private Vector3 startPosition;
        private float timeOffset;
        private bool hasTriggered = false;

        private void Start()
        {
            startPosition = transform.position;
            timeOffset = Random.Range(0f, Mathf.PI * 2f);
            gameObject.tag = "Goal";
            SetupGoalLight();
            SetupVisuals();
        }

        private void SetupGoalLight()
        {
            if (goalLight == null)
            {
                Transform lightTransform = transform.Find("GoalLight");
                if (lightTransform != null)
                {
                    goalLight = lightTransform.GetComponent<Light>();
                }
            }

            if (goalLight == null)
            {
                GameObject lightObj = new GameObject("GoalLight");
                lightObj.transform.SetParent(transform);
                lightObj.transform.localPosition = Vector3.zero;
                goalLight = lightObj.AddComponent<Light>();
                goalLight.type = LightType.Point;
                goalLight.shadows = LightShadows.Soft;
            }

            goalLight.color = goalColor;
            goalLight.intensity = 6f;
            goalLight.range = 12f;
        }

        private void SetupVisuals()
        {
            if (goalRenderer == null)
            {
                goalRenderer = GetComponent<Renderer>();
            }

            if (goalRenderer != null)
            {
                Material mat = new Material(Shader.Find("Standard"));
                mat.color = goalColor;
                mat.EnableKeyword("_EMISSION");
                mat.SetColor("_EmissionColor", goalColor * 0.6f);
                goalRenderer.material = mat;
            }
        }

        private void Update()
        {
            if (hasTriggered) return;

            transform.Rotate(Vector3.up, rotateSpeed * Time.deltaTime, Space.World);
            
            float newY = startPosition.y + Mathf.Sin(Time.time * bobSpeed + timeOffset) * bobAmount;
            transform.position = new Vector3(transform.position.x, newY, transform.position.z);

            CheckPlayerProximity();
        }

        private void CheckPlayerProximity()
        {
            PlayerController player = FindObjectOfType<PlayerController>();
            if (player != null)
            {
                float distance = Vector3.Distance(transform.position, player.transform.position);
                if (distance < triggerRadius)
                {
                    HandleVictory();
                }
            }
        }

        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Player") && !hasTriggered)
            {
                HandleVictory();
            }
        }

        private void OnCollisionEnter(Collision collision)
        {
            if (collision.collider.CompareTag("Player") && !hasTriggered)
            {
                HandleVictory();
            }
        }

        private void HandleVictory()
        {
            if (hasTriggered) return;
            hasTriggered = true;

            if (GameManager.Instance != null)
            {
                GameManager.Instance.Victory();
            }

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowVictory();
            }

            if (playVictoryEffect)
            {
                StartCoroutine(VictoryEffectRoutine());
            }

            Debug.Log("🎉 恭喜通关！到达终点！");
        }

        private IEnumerator VictoryEffectRoutine()
        {
            float originalIntensity = goalLight != null ? goalLight.intensity : 6f;
            
            if (goalLight != null)
            {
                goalLight.intensity = lightFlashIntensity;
            }

            if (victoryParticles != null)
            {
                victoryParticles.Play();
            }

            float elapsed = 0f;
            while (elapsed < lightFlashDuration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / lightFlashDuration;
                
                if (goalLight != null)
                {
                    goalLight.intensity = Mathf.Lerp(lightFlashIntensity, originalIntensity * 1.5f, t);
                }

                yield return null;
            }
        }

        private void OnDrawGizmosSelected()
        {
            Gizmos.color = Color.green;
            Gizmos.DrawWireSphere(transform.position, triggerRadius);
        }
    }
}
