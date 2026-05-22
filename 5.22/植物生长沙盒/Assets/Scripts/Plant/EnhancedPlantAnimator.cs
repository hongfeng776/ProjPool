using UnityEngine;
using System.Collections;

namespace PlantSandbox.Plant
{
    public class EnhancedPlantAnimator : MonoBehaviour
    {
        [Header("引用")]
        public PlantBase plantBase;
        public PlantGrowthAnimator baseAnimator;

        [Header("粒子效果")]
        public bool enableGrowthParticles = true;
        public ParticleSystem growthParticlePrefab;
        public float particleSpawnInterval = 0.5f;

        [Header("发光效果")]
        public bool enableGlowEffect = true;
        public float glowIntensity = 0.5f;
        public Color glowColor = new Color(0.5f, 1f, 0.5f);

        [Header("弹跳效果")]
        public bool enableBounceEffect = true;
        public float bounceAmount = 0.05f;
        public float bounceSpeed = 2f;

        [Header("生长抖动效果")]
        public bool enableGrowthShake = true;
        public float shakeAmount = 0.02f;
        public float shakeDuration = 0.3f;

        private float particleTimer;
        private float bounceTimer;
        private float shakeTimer;
        private Vector3 originalPosition;
        private ParticleSystem activeParticles;

        private void Start()
        {
            originalPosition = transform.localPosition;

            if (plantBase != null)
            {
                plantBase.OnStageChangedEvent += OnStageChanged;
            }

            if (enableGrowthParticles && growthParticlePrefab != null)
            {
                activeParticles = Instantiate(growthParticlePrefab, transform);
                activeParticles.transform.localPosition = Vector3.zero;
                activeParticles.Stop();
            }
        }

        private void Update()
        {
            if (plantBase == null) return;

            if (enableBounceEffect && plantBase.currentState >= PlantState.Sprout)
            {
                UpdateBounceEffect();
            }

            if (enableGrowthShake && shakeTimer > 0)
            {
                UpdateShakeEffect();
            }

            if (enableGrowthParticles && plantBase.growthMultiplier > 0.5f)
            {
                UpdateParticleEffect();
            }
        }

        private void OnStageChanged(PlantState oldState, PlantState newState)
        {
            if (oldState < newState)
            {
                TriggerGrowthEffect();
            }
        }

        private void TriggerGrowthEffect()
        {
            if (enableGrowthShake)
            {
                shakeTimer = shakeDuration;
            }

            if (enableGrowthParticles && activeParticles != null)
            {
                var emission = activeParticles.emission;
                emission.rateOverTime = 20;
                activeParticles.Play();
                StartCoroutine(StopParticlesAfterDelay(0.5f));
            }
        }

        private void UpdateBounceEffect()
        {
            bounceTimer += Time.deltaTime * bounceSpeed * plantBase.growthMultiplier;
            float bounce = Mathf.Sin(bounceTimer) * bounceAmount * plantBase.growthMultiplier;
            transform.localPosition = originalPosition + new Vector3(0f, bounce, 0f);
        }

        private void UpdateShakeEffect()
        {
            shakeTimer -= Time.deltaTime;
            float progress = 1f - (shakeTimer / shakeDuration);
            float currentShake = shakeAmount * (1f - progress);
            
            float offsetX = Random.Range(-currentShake, currentShake);
            float offsetY = Random.Range(-currentShake, currentShake);
            
            transform.localPosition = originalPosition + new Vector3(offsetX, offsetY, 0f);
        }

        private void UpdateParticleEffect()
        {
            particleTimer += Time.deltaTime;
            if (particleTimer >= particleSpawnInterval)
            {
                particleTimer = 0f;
                
                if (activeParticles != null)
                {
                    var emission = activeParticles.emission;
                    emission.rateOverTime = 5 * plantBase.growthMultiplier;
                    if (!activeParticles.isPlaying)
                    {
                        activeParticles.Play();
                    }
                }
            }
        }

        private IEnumerator StopParticlesAfterDelay(float delay)
        {
            yield return new WaitForSeconds(delay);
            if (activeParticles != null)
            {
                var emission = activeParticles.emission;
                emission.rateOverTime = 5 * plantBase.growthMultiplier;
            }
        }

        private void OnDestroy()
        {
            if (plantBase != null)
            {
                plantBase.OnStageChangedEvent -= OnStageChanged;
            }
        }
    }
}
