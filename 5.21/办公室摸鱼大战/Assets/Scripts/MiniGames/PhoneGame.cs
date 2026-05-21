using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using UnityEngine.EventSystems;

namespace OfficeFishing.MiniGames
{
    public class PhoneGame : MiniGameBase
    {
        [Header("Phone Game Settings")]
        public int targetScore = 100;
        public float spawnInterval = 0.8f;
        public int maxActiveTargets = 5;
        public float targetLifetime = 2.5f;
        public float minSpawnDelay = 0.3f;
        public float maxSpawnDelay = 1.2f;

        [Header("UI References")]
        public RectTransform contentArea;
        public GameObject targetPrefab;
        public TMP_Text comboText;
        public TMP_Text scoreDisplay;
        public Image phoneScreen;
        public Sprite normalScreen;
        public Sprite happyScreen;

        [Header("Target Types")]
        public List<TargetConfig> targetConfigs = new List<TargetConfig>();

        private List<GameObject> activeTargets = new List<GameObject>();
        private Coroutine spawnCoroutine;
        private int currentCombo;
        private float comboTimer;
        public float comboResetTime = 1.5f;

        [System.Serializable]
        public class TargetConfig
        {
            public string targetName;
            public Sprite icon;
            public int score;
            public float chanceWeight = 1f;
            public Color bgColor = Color.white;
        }

        protected override void OnMiniGameStarted()
        {
            base.OnMiniGameStarted();

            currentCombo = 0;
            comboTimer = 0f;

            if (targetConfigs.Count == 0)
            {
                Debug.LogWarning("[PhoneGame] No target configs, using defaults");
                AddDefaultConfigs();
            }

            spawnCoroutine = StartCoroutine(SpawnRoutine());
        }

        private void AddDefaultConfigs()
        {
            targetConfigs.Add(new TargetConfig
            {
                targetName = "Funny Meme",
                score = 10,
                chanceWeight = 3f,
                bgColor = new Color(1f, 0.8f, 0.4f)
            });
            targetConfigs.Add(new TargetConfig
            {
                targetName = "Viral Video",
                score = 20,
                chanceWeight = 1.5f,
                bgColor = new Color(0.8f, 0.9f, 1f)
            });
            targetConfigs.Add(new TargetConfig
            {
                targetName = "Work Email",
                score = -5,
                chanceWeight = 1f,
                bgColor = new Color(1f, 0.5f, 0.5f)
            });
            targetConfigs.Add(new TargetConfig
            {
                targetName = "Cat Video",
                score = 15,
                chanceWeight = 2f,
                bgColor = new Color(1f, 0.6f, 0.8f)
            });
        }

        protected override void OnGameUpdate()
        {
            base.OnGameUpdate();

            if (comboTimer > 0f)
            {
                comboTimer -= Time.deltaTime;
                if (comboTimer <= 0f)
                {
                    currentCombo = 0;
                    UpdateComboDisplay();
                }
            }

            if (scoreDisplay != null)
            {
                scoreDisplay.text = currentScore.ToString();
            }

            if (currentScore >= targetScore)
            {
                ForceComplete();
            }
        }

        private IEnumerator SpawnRoutine()
        {
            while (isPlaying && !isCompleted)
            {
                if (activeTargets.Count < maxActiveTargets)
                {
                    SpawnTarget();
                }

                float delay = Random.Range(minSpawnDelay, maxSpawnDelay);
                yield return new WaitForSeconds(delay);
            }
        }

        private void SpawnTarget()
        {
            if (contentArea == null || targetPrefab == null) return;

            GameObject target = Instantiate(targetPrefab, contentArea);
            activeTargets.Add(target);

            RectTransform rect = target.GetComponent<RectTransform>();
            if (rect != null && contentArea != null)
            {
                float padding = 50f;
                Vector2 contentSize = contentArea.rect.size;
                rect.anchoredPosition = new Vector2(
                    Random.Range(-contentSize.x * 0.5f + padding, contentSize.x * 0.5f - padding),
                    Random.Range(-contentSize.y * 0.5f + padding, contentSize.y * 0.5f - padding));
            }

            TargetConfig config = GetRandomTargetConfig();
            var targetHandler = target.GetComponent<PhoneTargetHandler>();
            if (targetHandler == null)
            {
                targetHandler = target.AddComponent<PhoneTargetHandler>();
            }
            targetHandler.Initialize(this, config, targetLifetime);

            UpdatePhoneScreen(happyScreen);
        }

        private TargetConfig GetRandomTargetConfig()
        {
            if (targetConfigs.Count == 0) return new TargetConfig { targetName = "Default", score = 10 };

            float totalWeight = 0f;
            foreach (var config in targetConfigs)
            {
                totalWeight += config.chanceWeight;
            }

            float random = Random.Range(0f, totalWeight);
            float cumulative = 0f;

            foreach (var config in targetConfigs)
            {
                cumulative += config.chanceWeight;
                if (random <= cumulative)
                {
                    return config;
                }
            }

            return targetConfigs[targetConfigs.Count - 1];
        }

        public void OnTargetHit(PhoneTargetHandler handler)
        {
            if (!isPlaying || isCompleted) return;

            activeTargets.Remove(handler.gameObject);
            Destroy(handler.gameObject);

            if (handler.Config.score > 0)
            {
                currentCombo++;
                comboTimer = comboResetTime;

                int comboBonus = Mathf.Min(currentCombo * 2, 20);
                currentScore += handler.Config.score + comboBonus;

                UpdateComboDisplay();
                UpdatePhoneScreen(happyScreen);
            }
            else
            {
                currentCombo = 0;
                comboTimer = 0f;
                currentScore += handler.Config.score;
                currentScore = Mathf.Max(0, currentScore);

                UpdateComboDisplay();
            }
        }

        public void OnTargetExpired(PhoneTargetHandler handler)
        {
            if (!isPlaying) return;

            activeTargets.Remove(handler.gameObject);
            Destroy(handler.gameObject);
        }

        private void UpdateComboDisplay()
        {
            if (comboText != null)
            {
                if (currentCombo > 1)
                {
                    comboText.gameObject.SetActive(true);
                    comboText.text = $"x{currentCombo}";
                }
                else
                {
                    comboText.gameObject.SetActive(false);
                }
            }
        }

        private void UpdatePhoneScreen(Sprite sprite)
        {
            if (phoneScreen != null)
            {
                phoneScreen.sprite = sprite;
            }
        }

        protected override int CalculateFinalScore()
        {
            int finalScore = currentScore > 0 ? currentScore : baseScore;
            return Mathf.RoundToInt(finalScore * difficultyMultiplier);
        }

        protected override void OnMiniGameCompleted(int score)
        {
            base.OnMiniGameCompleted(score);

            if (spawnCoroutine != null)
            {
                StopCoroutine(spawnCoroutine);
            }

            foreach (var target in activeTargets)
            {
                if (target != null)
                {
                    Destroy(target);
                }
            }
            activeTargets.Clear();

            UpdatePhoneScreen(normalScreen);
        }

        protected override void OnMiniGameCancelled()
        {
            base.OnMiniGameCancelled();

            if (spawnCoroutine != null)
            {
                StopCoroutine(spawnCoroutine);
            }

            foreach (var target in activeTargets)
            {
                if (target != null)
                {
                    Destroy(target);
                }
            }
            activeTargets.Clear();

            UpdatePhoneScreen(normalScreen);
        }
    }

    public class PhoneTargetHandler : MonoBehaviour, IPointerClickHandler
    {
        private PhoneGame game;
        private PhoneGame.TargetConfig config;
        private float lifetime;
        private Image background;
        private TMP_Text targetText;

        public PhoneGame.TargetConfig Config => config;

        public void Initialize(PhoneGame game, PhoneGame.TargetConfig config, float lifetime)
        {
            this.game = game;
            this.config = config;
            this.lifetime = lifetime;

            background = GetComponent<Image>();
            if (background == null)
            {
                background = gameObject.AddComponent<Image>();
            }

            if (background != null)
            {
                background.color = config.bgColor;
            }

            var texts = GetComponentsInChildren<TMP_Text>();
            if (texts.Length > 0)
            {
                targetText = texts[0];
                targetText.text = config.targetName;
            }

            StartCoroutine(ExpireRoutine());
        }

        public void OnPointerClick(PointerEventData eventData)
        {
            game?.OnTargetHit(this);
        }

        private IEnumerator ExpireRoutine()
        {
            yield return new WaitForSeconds(lifetime);
            game?.OnTargetExpired(this);
        }
    }
}
