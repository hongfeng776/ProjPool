using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using UnityEngine.EventSystems;

namespace OfficeFishing.MiniGames
{
    public class SnackGame : MiniGameBase
    {
        [Header("Snack Game Settings")]
        public int targetSnacksEaten = 10;
        public float snackSpawnInterval = 0.6f;
        public int maxActiveSnacks = 6;
        public float snackLifetime = 3f;

        [Header("UI References")]
        public RectTransform bowlArea;
        public GameObject snackPrefab;
        public TMP_Text eatenCountText;
        public TMP_Text scoreDisplay;
        public Image stomachFill;
        public Slider hungerSlider;

        [Header("Snack Types")]
        public List<SnackType> snackTypes = new List<SnackType>();

        private List<GameObject> activeSnacks = new List<GameObject>();
        private Coroutine spawnCoroutine;
        private int snacksEaten;
        private float hungerLevel = 0.5f;

        [System.Serializable]
        public class SnackType
        {
            public string snackName;
            public Sprite icon;
            public int score;
            public float hungerFill;
            public float chanceWeight = 1f;
            public Color bgColor = Color.white;
        }

        protected override void OnMiniGameStarted()
        {
            base.OnMiniGameStarted();

            snacksEaten = 0;
            hungerLevel = 0.5f;
            activeSnacks.Clear();

            if (snackTypes.Count == 0)
            {
                Debug.LogWarning("[SnackGame] No snack types, using defaults");
                AddDefaultSnackTypes();
            }

            if (hungerSlider != null)
            {
                hungerSlider.value = hungerLevel;
            }

            spawnCoroutine = StartCoroutine(SpawnRoutine());
            UpdateUI();
        }

        private void AddDefaultSnackTypes()
        {
            snackTypes.Add(new SnackType
            {
                snackName = "薯片",
                score = 5,
                hungerFill = 0.05f,
                chanceWeight = 3f,
                bgColor = new Color(1f, 0.7f, 0.3f)
            });
            snackTypes.Add(new SnackType
            {
                snackName = "巧克力",
                score = 10,
                hungerFill = 0.1f,
                chanceWeight = 2f,
                bgColor = new Color(0.5f, 0.3f, 0.2f)
            });
            snackTypes.Add(new SnackType
            {
                snackName = "泡面",
                score = 15,
                hungerFill = 0.2f,
                chanceWeight = 1.5f,
                bgColor = new Color(1f, 0.5f, 0.2f)
            });
            snackTypes.Add(new SnackType
            {
                snackName = "水果",
                score = 8,
                hungerFill = 0.08f,
                chanceWeight = 2.5f,
                bgColor = new Color(0.8f, 0.3f, 0.4f)
            });
            snackTypes.Add(new SnackType
            {
                snackName = "奶茶",
                score = 12,
                hungerFill = 0.12f,
                chanceWeight = 1f,
                bgColor = new Color(0.9f, 0.7f, 0.5f)
            });
            snackTypes.Add(new SnackType
            {
                snackName = "黑暗料理",
                score = -10,
                hungerFill = -0.05f,
                chanceWeight = 0.5f,
                bgColor = new Color(0.4f, 0.8f, 0.4f)
            });
        }

        protected override void OnGameUpdate()
        {
            base.OnGameUpdate();

            hungerLevel = Mathf.Clamp(hungerLevel - Time.deltaTime * 0.05f, 0f, 1f);

            if (hungerSlider != null)
            {
                hungerSlider.value = hungerLevel;
                hungerSlider.fillRect.GetComponent<Image>().color =
                    hungerLevel > 0.5f ? Color.green :
                    hungerLevel > 0.2f ? Color.yellow : Color.red;
            }

            if (stomachFill != null)
            {
                stomachFill.fillAmount = (float)snacksEaten / targetSnacksEaten;
            }

            if (snacksEaten >= targetSnacksEaten)
            {
                ForceComplete();
            }
        }

        private IEnumerator SpawnRoutine()
        {
            while (isPlaying && !isCompleted)
            {
                if (activeSnacks.Count < maxActiveSnacks)
                {
                    SpawnSnack();
                }

                yield return new WaitForSeconds(snackSpawnInterval);
            }
        }

        private void SpawnSnack()
        {
            if (bowlArea == null || snackPrefab == null) return;

            GameObject snack = Instantiate(snackPrefab, bowlArea);
            activeSnacks.Add(snack);

            RectTransform rect = snack.GetComponent<RectTransform>();
            if (rect != null && bowlArea != null)
            {
                Vector2 contentSize = bowlArea.rect.size;
                float padding = 40f;
                rect.anchoredPosition = new Vector2(
                    Random.Range(-contentSize.x * 0.5f + padding, contentSize.x * 0.5f - padding),
                    Random.Range(-contentSize.y * 0.5f + padding, contentSize.y * 0.5f - padding));
            }

            SnackType type = GetRandomSnackType();
            var handler = snack.GetComponent<SnackHandler>();
            if (handler == null)
            {
                handler = snack.AddComponent<SnackHandler>();
            }
            handler.Initialize(this, type, snackLifetime);
        }

        private SnackType GetRandomSnackType()
        {
            if (snackTypes.Count == 0) return new SnackType { snackName = "零食", score = 5 };

            float totalWeight = 0f;
            foreach (var type in snackTypes)
            {
                totalWeight += type.chanceWeight;
            }

            float random = Random.Range(0f, totalWeight);
            float cumulative = 0f;

            foreach (var type in snackTypes)
            {
                cumulative += type.chanceWeight;
                if (random <= cumulative)
                {
                    return type;
                }
            }

            return snackTypes[snackTypes.Count - 1];
        }

        public void OnSnackEaten(SnackHandler handler)
        {
            if (!isPlaying || isCompleted) return;

            activeSnacks.Remove(handler.gameObject);
            Destroy(handler.gameObject);

            if (handler.SnackType.score > 0)
            {
                snacksEaten++;
                hungerLevel = Mathf.Clamp(hungerLevel + handler.SnackType.hungerFill, 0f, 1f);

                int comboBonus = Mathf.Min(snacksEaten, 5) * 2;
                currentScore += handler.SnackType.score + comboBonus;
            }
            else
            {
                currentScore = Mathf.Max(0, currentScore + handler.SnackType.score);
                hungerLevel = Mathf.Clamp(hungerLevel + handler.SnackType.hungerFill, 0f, 1f);
            }

            UpdateUI();
        }

        public void OnSnackExpired(SnackHandler handler)
        {
            if (!isPlaying) return;

            activeSnacks.Remove(handler.gameObject);
            Destroy(handler.gameObject);
        }

        private void UpdateUI()
        {
            if (eatenCountText != null)
            {
                eatenCountText.text = $"{snacksEaten}/{targetSnacksEaten}";
            }

            if (scoreDisplay != null)
            {
                scoreDisplay.text = currentScore.ToString();
            }
        }

        protected override int CalculateFinalScore()
        {
            int baseScore = currentScore > 0 ? currentScore : baseScore;
            int hungerBonus = Mathf.RoundToInt(hungerLevel * 20);
            int completenessBonus = Mathf.RoundToInt((float)snacksEaten / targetSnacksEaten * 30);

            return Mathf.RoundToInt((baseScore + hungerBonus + completenessBonus) * difficultyMultiplier);
        }

        protected override void OnMiniGameCompleted(int score)
        {
            base.OnMiniGameCompleted(score);

            if (spawnCoroutine != null)
            {
                StopCoroutine(spawnCoroutine);
            }

            foreach (var snack in activeSnacks)
            {
                if (snack != null)
                {
                    Destroy(snack);
                }
            }
            activeSnacks.Clear();
        }

        protected override void OnMiniGameCancelled()
        {
            base.OnMiniGameCancelled();

            if (spawnCoroutine != null)
            {
                StopCoroutine(spawnCoroutine);
            }

            foreach (var snack in activeSnacks)
            {
                if (snack != null)
                {
                    Destroy(snack);
                }
            }
            activeSnacks.Clear();
        }
    }

    public class SnackHandler : MonoBehaviour, IPointerClickHandler
    {
        private SnackGame game;
        private SnackGame.SnackType snackType;
        private float lifetime;
        private Image background;
        private TMP_Text snackNameText;

        public SnackGame.SnackType SnackType => snackType;

        public void Initialize(SnackGame game, SnackGame.SnackType type, float lifetime)
        {
            this.game = game;
            this.snackType = type;
            this.lifetime = lifetime;

            background = GetComponent<Image>();
            if (background == null)
            {
                background = gameObject.AddComponent<Image>();
            }

            if (snackType.icon != null)
            {
                background.sprite = snackType.icon;
                background.color = snackType.bgColor;
            }
            else
            {
                background.color = snackType.bgColor;
            }

            var texts = GetComponentsInChildren<TMP_Text>();
            if (texts.Length > 0)
            {
                snackNameText = texts[0];
                snackNameText.text = snackType.snackName;
            }

            StartCoroutine(ExpireRoutine());
        }

        public void OnPointerClick(PointerEventData eventData)
        {
            game?.OnSnackEaten(this);
        }

        private IEnumerator ExpireRoutine()
        {
            yield return new WaitForSeconds(lifetime);
            game?.OnSnackExpired(this);
        }
    }
}
