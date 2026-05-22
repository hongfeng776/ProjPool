using UnityEngine;

namespace PlantSandbox.Plant
{
    public class BasicPlant : PlantBase
    {
        [Header("植物生成设置")]
        public bool autoGenerateOnStart = true;
        public ProceduralPlantGenerator generator;
        public PlantGrowthAnimator animator;

        [Header("摆动效果")]
        public bool enableSwaying = true;
        public float baseSwayAmount = 3f;
        public float baseSwaySpeed = 1f;
        private float swayOffset;

        [Header("视觉效果")]
        public bool enableParameterVisuals = true;
        public Color unhealthyColor = new Color(0.6f, 0.4f, 0.2f);
        public Color healthyColor = new Color(0.2f, 0.8f, 0.3f);

        private void Awake()
        {
            swayOffset = Random.value * 100f;
        }

        private void Start()
        {
            if (autoGenerateOnStart)
            {
                InitializePlant();
            }
        }

        public void InitializePlant()
        {
            if (generator == null)
            {
                generator = GetComponent<ProceduralPlantGenerator>();
                if (generator == null)
                {
                    generator = gameObject.AddComponent<ProceduralPlantGenerator>();
                }
            }

            generator.GeneratePlant();

            if (animator == null)
            {
                animator = GetComponent<PlantGrowthAnimator>();
                if (animator == null)
                {
                    animator = gameObject.AddComponent<PlantGrowthAnimator>();
                }
            }

            animator.plantBase = this;
            animator.seedTransform = generator.GetSeedTransform();
            animator.stemTransform = generator.GetStemTransform();
            animator.leafTransforms = generator.GetLeafTransforms();

            animator.ResetAnimation();
        }

        protected override void Update()
        {
            base.Update();

            if (currentState != PlantState.Dead)
            {
                if (enableSwaying && currentState >= PlantState.Sprout)
                {
                    UpdateSwaying();
                }

                if (enableParameterVisuals)
                {
                    UpdateVisualEffects();
                }
            }
        }

        private void UpdateSwaying()
        {
            if (animator != null && animator.stemTransform != null)
            {
                float currentSwayAmount = baseSwayAmount * (0.5f + growthMultiplier * 0.5f);
                float currentSwaySpeed = baseSwaySpeed * (0.7f + growthMultiplier * 0.3f);
                
                float sway = Mathf.Sin(Time.time * currentSwaySpeed + swayOffset) * currentSwayAmount;
                animator.stemTransform.localRotation = Quaternion.Euler(sway, 0f, 0f);
            }
        }

        private void UpdateVisualEffects()
        {
            if (animator == null) return;

            float healthFactor = health / maxHealth;
            Color currentColor = Color.Lerp(unhealthyColor, healthyColor, healthFactor * growthMultiplier);

            if (animator.stemTransform != null)
            {
                Renderer stemRenderer = animator.stemTransform.GetComponent<Renderer>();
                if (stemRenderer != null && stemRenderer.material != null)
                {
                    Color stemColor = Color.Lerp(stemRenderer.material.color, currentColor * 0.8f, Time.deltaTime);
                    stemRenderer.material.color = stemColor;
                }
            }

            if (animator.leafTransforms != null)
            {
                foreach (Transform leaf in animator.leafTransforms)
                {
                    if (leaf != null)
                    {
                        Renderer leafRenderer = leaf.GetComponent<Renderer>();
                        if (leafRenderer != null && leafRenderer.material != null)
                        {
                            Color leafColor = Color.Lerp(leafRenderer.material.color, currentColor, Time.deltaTime);
                            leafRenderer.material.color = leafColor;
                        }
                    }
                }
            }
        }

        public void ForceGrowToStage(PlantState targetState)
        {
            if (targetState <= currentState) return;

            float targetProgress = 0f;
            switch (targetState)
            {
                case PlantState.Seed: targetProgress = 0f; break;
                case PlantState.Sprout: targetProgress = stageThresholds[1] + 1f; break;
                case PlantState.Young: targetProgress = stageThresholds[2] + 1f; break;
                case PlantState.Mature: targetProgress = stageThresholds[3] + 1f; break;
                case PlantState.Flowering: targetProgress = stageThresholds[4] + 1f; break;
            }

            growthProgress = targetProgress;
            CheckStage();
        }

        public void ResetGrowth()
        {
            growthProgress = 0f;
            currentState = PlantState.Seed;
            health = maxHealth;

            sunlight = 1f;
            water = 1f;
            temperature = 1f;
            nutrients = 1f;

            if (animator != null)
            {
                animator.ResetAnimation();
            }
        }
    }
}
