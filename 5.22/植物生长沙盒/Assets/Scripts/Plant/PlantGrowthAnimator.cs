using UnityEngine;
using System.Collections;

namespace PlantSandbox.Plant
{
    public class PlantGrowthAnimator : MonoBehaviour
    {
        [Header("引用")]
        public PlantBase plantBase;
        public Transform seedTransform;
        public Transform stemTransform;
        public Transform[] leafTransforms;

        [Header("动画设置")]
        public float animationSpeed = 1f;
        public AnimationCurve growthCurve = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f);

        [Header("种子设置")]
        public Vector3 seedMinScale = Vector3.zero;
        public Vector3 seedMaxScale = new Vector3(0.5f, 0.5f, 0.5f);
        public Color seedColor = new Color(0.6f, 0.4f, 0.2f);

        [Header("茎设置")]
        public float stemMinHeight = 0f;
        public float stemMaxHeight = 2f;
        public Color stemColor = Color.green;

        [Header("叶子设置")]
        public Vector3 leafMinScale = Vector3.zero;
        public Vector3 leafMaxScale = new Vector3(1f, 1f, 1f);
        public Color leafColor = new Color(0.2f, 0.8f, 0.3f);
        public float leafRotationRange = 30f;

        [Header("当前状态")]
        public float animationProgress = 0f;
        private bool isAnimating = false;
        private Coroutine currentAnimation;

        private Renderer seedRenderer;
        private Renderer stemRenderer;
        private Renderer[] leafRenderers;

        private void Awake()
        {
            InitializeComponents();
            InitializeVisuals();
        }

        private void Start()
        {
            if (plantBase != null)
            {
                plantBase.OnStageChangedEvent += OnPlantStageChanged;
            }
        }

        private void Update()
        {
            if (plantBase != null && !isAnimating)
            {
                float targetProgress = plantBase.GetGrowthPercentage() / 100f;
                if (Mathf.Abs(animationProgress - targetProgress) > 0.001f)
                {
                    animationProgress = Mathf.Lerp(animationProgress, targetProgress, Time.deltaTime * 2f);
                    UpdateVisuals(animationProgress);
                }
            }
        }

        private void InitializeComponents()
        {
            if (seedTransform != null)
                seedRenderer = seedTransform.GetComponent<Renderer>();
            
            if (stemTransform != null)
                stemRenderer = stemTransform.GetComponent<Renderer>();

            if (leafTransforms != null && leafTransforms.Length > 0)
            {
                leafRenderers = new Renderer[leafTransforms.Length];
                for (int i = 0; i < leafTransforms.Length; i++)
                {
                    if (leafTransforms[i] != null)
                        leafRenderers[i] = leafTransforms[i].GetComponent<Renderer>();
                }
            }
        }

        private void InitializeVisuals()
        {
            if (seedTransform != null)
                seedTransform.localScale = seedMinScale;
            
            if (stemTransform != null)
            {
                Vector3 stemScale = stemTransform.localScale;
                stemScale.y = stemMinHeight;
                stemTransform.localScale = stemScale;
            }

            if (leafTransforms != null)
            {
                foreach (Transform leaf in leafTransforms)
                {
                    if (leaf != null)
                        leaf.localScale = leafMinScale;
                }
            }

            UpdateColors(0f);
        }

        private void OnPlantStageChanged(PlantState oldState, PlantState newState)
        {
            float targetProgress = GetProgressForStage(newState);
            PlayGrowthAnimation(targetProgress);
        }

        private float GetProgressForStage(PlantState state)
        {
            switch (state)
            {
                case PlantState.Seed: return 0f;
                case PlantState.Sprout: return 0.25f;
                case PlantState.Young: return 0.5f;
                case PlantState.Mature: return 0.75f;
                case PlantState.Flowering: return 1f;
                case PlantState.Dead: return 0f;
                default: return 0f;
            }
        }

        public void PlayGrowthAnimation(float targetProgress)
        {
            if (currentAnimation != null)
                StopCoroutine(currentAnimation);

            currentAnimation = StartCoroutine(GrowthAnimationCoroutine(targetProgress));
        }

        private IEnumerator GrowthAnimationCoroutine(float targetProgress)
        {
            isAnimating = true;
            float startProgress = animationProgress;
            float elapsedTime = 0f;
            float duration = Mathf.Abs(targetProgress - startProgress) / animationSpeed;

            while (elapsedTime < duration)
            {
                elapsedTime += Time.deltaTime;
                float t = elapsedTime / duration;
                float curvedT = growthCurve.Evaluate(t);
                
                animationProgress = Mathf.Lerp(startProgress, targetProgress, curvedT);
                UpdateVisuals(animationProgress);
                
                yield return null;
            }

            animationProgress = targetProgress;
            UpdateVisuals(animationProgress);
            isAnimating = false;
        }

        private void UpdateVisuals(float progress)
        {
            UpdateSeedVisual(progress);
            UpdateStemVisual(progress);
            UpdateLeafVisuals(progress);
            UpdateColors(progress);
        }

        private void UpdateSeedVisual(float progress)
        {
            if (seedTransform == null) return;

            float seedProgress = Mathf.Clamp01(progress * 4f);
            float curvedProgress = growthCurve.Evaluate(seedProgress);
            
            seedTransform.localScale = Vector3.Lerp(seedMinScale, seedMaxScale, curvedProgress);

            if (progress > 0.25f)
            {
                float fadeProgress = Mathf.Clamp01((progress - 0.25f) * 4f);
                seedTransform.localScale = Vector3.Lerp(seedMaxScale, seedMinScale, fadeProgress);
            }
        }

        private void UpdateStemVisual(float progress)
        {
            if (stemTransform == null) return;

            float stemProgress = Mathf.Clamp01((progress - 0.1f) * 2f);
            float curvedProgress = growthCurve.Evaluate(stemProgress);
            
            Vector3 stemScale = stemTransform.localScale;
            stemScale.y = Mathf.Lerp(stemMinHeight, stemMaxHeight, curvedProgress);
            stemTransform.localScale = stemScale;
        }

        private void UpdateLeafVisuals(float progress)
        {
            if (leafTransforms == null || leafTransforms.Length == 0) return;

            float leafStartProgress = 0.3f;
            float leavesPerStage = (1f - leafStartProgress) / leafTransforms.Length;

            for (int i = 0; i < leafTransforms.Length; i++)
            {
                if (leafTransforms[i] == null) continue;

                float leafStart = leafStartProgress + (i * leavesPerStage * 0.5f);
                float leafProgress = Mathf.Clamp01((progress - leafStart) / leavesPerStage);
                float curvedProgress = growthCurve.Evaluate(leafProgress);

                leafTransforms[i].localScale = Vector3.Lerp(leafMinScale, leafMaxScale, curvedProgress);

                float rotationZ = Mathf.Sin(i * 1.5f + progress * 2f) * leafRotationRange;
                leafTransforms[i].localRotation = Quaternion.Euler(0f, 0f, rotationZ);
            }
        }

        private void UpdateColors(float progress)
        {
            float colorProgress = Mathf.Clamp01(progress);

            if (seedRenderer != null && seedRenderer.material != null)
            {
                Color finalSeedColor = Color.Lerp(seedColor, seedColor * 0.7f, colorProgress);
                seedRenderer.material.color = finalSeedColor;
            }

            if (stemRenderer != null && stemRenderer.material != null)
            {
                Color finalStemColor = Color.Lerp(Color.Lerp(stemColor, Color.white, 0.5f), stemColor, colorProgress);
                stemRenderer.material.color = finalStemColor;
            }

            if (leafRenderers != null)
            {
                for (int i = 0; i < leafRenderers.Length; i++)
                {
                    if (leafRenderers[i] != null && leafRenderers[i].material != null)
                    {
                        float leafColorProgress = Mathf.Clamp01((progress - 0.3f) * 2f);
                        Color finalLeafColor = Color.Lerp(Color.Lerp(leafColor, Color.white, 0.7f), leafColor, leafColorProgress);
                        leafRenderers[i].material.color = finalLeafColor;
                    }
                }
            }
        }

        public void SetProgressInstant(float progress)
        {
            animationProgress = progress;
            UpdateVisuals(progress);
        }

        public void ResetAnimation()
        {
            if (currentAnimation != null)
                StopCoroutine(currentAnimation);

            animationProgress = 0f;
            InitializeVisuals();
            isAnimating = false;
        }

        private void OnDestroy()
        {
            if (plantBase != null)
            {
                plantBase.OnStageChangedEvent -= OnPlantStageChanged;
            }
        }
    }
}
