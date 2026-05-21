using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace OfficeFishing.MiniGames
{
    public class CardGame : MiniGameBase
    {
        [Header("Card Game Settings")]
        public int gridRows = 3;
        public int gridCols = 4;
        public float cardFlipTime = 0.3f;
        public float matchShowTime = 0.8f;

        [Header("UI References")]
        public GridLayoutGroup cardGrid;
        public GameObject cardPrefab;
        public TMP_Text matchCountText;
        public TMP_Text moveCountText;
        public Image cardBackImage;

        [Header("Card Types")]
        public List<CardType> cardTypes = new List<CardType>();

        private List<CardData> cards = new List<CardData>();
        private List<CardHandler> activeCards = new List<CardHandler>();
        private CardHandler firstFlipped;
        private CardHandler secondFlipped;
        private bool isProcessing;
        private int matchesFound;
        private int moveCount;
        private int totalPairs;

        [System.Serializable]
        public class CardType
        {
            public string typeId;
            public Sprite icon;
            public Color color = Color.white;
        }

        protected override void OnMiniGameStarted()
        {
            base.OnMiniGameStarted();

            matchesFound = 0;
            moveCount = 0;
            firstFlipped = null;
            secondFlipped = null;
            isProcessing = false;

            if (cardTypes.Count < 3)
            {
                Debug.LogWarning("[CardGame] Not enough card types, using defaults");
                AddDefaultCardTypes();
            }

            CreateCardPairs();
            InitializeGrid();
            UpdateUI();
        }

        private void AddDefaultCardTypes()
        {
            cardTypes.Add(new CardType { typeId = "heart", color = new Color(1f, 0.3f, 0.3f) });
            cardTypes.Add(new CardType { typeId = "star", color = new Color(1f, 0.8f, 0.2f) });
            cardTypes.Add(new CardType { typeId = "diamond", color = new Color(0.3f, 0.6f, 1f) });
            cardTypes.Add(new CardType { typeId = "club", color = new Color(0.3f, 0.8f, 0.3f) });
            cardTypes.Add(new CardType { typeId = "spade", color = new Color(0.3f, 0.3f, 0.3f) });
            cardTypes.Add(new CardType { typeId = "moon", color = new Color(0.8f, 0.6f, 1f) });
        }

        private void CreateCardPairs()
        {
            cards.Clear();

            int totalCards = gridRows * gridCols;
            totalPairs = totalCards / 2;

            List<CardType> selectedTypes = new List<CardType>();
            for (int i = 0; i < totalPairs; i++)
            {
                selectedTypes.Add(cardTypes[i % cardTypes.Count]);
            }

            for (int i = 0; i < totalPairs; i++)
            {
                cards.Add(new CardData { typeId = selectedTypes[i].typeId, pairIndex = i });
                cards.Add(new CardData { typeId = selectedTypes[i].typeId, pairIndex = i });
            }

            ShuffleCards();
        }

        private void ShuffleCards()
        {
            for (int i = cards.Count - 1; i > 0; i--)
            {
                int j = Random.Range(0, i + 1);
                CardData temp = cards[i];
                cards[i] = cards[j];
                cards[j] = temp;
            }
        }

        private void InitializeGrid()
        {
            if (cardGrid == null || cardPrefab == null)
            {
                Debug.LogError("[CardGame] Grid or CardPrefab not assigned!");
                return;
            }

            foreach (Transform child in cardGrid.transform)
            {
                Destroy(child.gameObject);
            }
            activeCards.Clear();

            cardGrid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
            cardGrid.constraintCount = gridCols;

            for (int i = 0; i < cards.Count; i++)
            {
                GameObject cardObj = Instantiate(cardPrefab, cardGrid.transform);
                var handler = cardObj.GetComponent<CardHandler>();
                if (handler == null)
                {
                    handler = cardObj.AddComponent<CardHandler>();
                }

                CardType cardType = GetCardTypeById(cards[i].typeId);
                handler.Initialize(this, cards[i], cardType, cardBackImage?.sprite);
                handler.OnCardFlipped += OnCardClicked;

                activeCards.Add(handler);
            }
        }

        private CardType GetCardTypeById(string typeId)
        {
            foreach (var type in cardTypes)
            {
                if (type.typeId == typeId) return type;
            }
            return cardTypes[0];
        }

        private void OnCardClicked(CardHandler handler)
        {
            if (!isPlaying || isCompleted || isProcessing) return;
            if (handler.IsFlipped || handler.IsMatched) return;

            handler.FlipCard();

            if (firstFlipped == null)
            {
                firstFlipped = handler;
            }
            else if (secondFlipped == null)
            {
                secondFlipped = handler;
                moveCount++;
                UpdateUI();

                StartCoroutine(CheckMatch());
            }
        }

        private IEnumerator CheckMatch()
        {
            isProcessing = true;

            if (firstFlipped?.CardData.pairIndex == secondFlipped?.CardData.pairIndex)
            {
                yield return new WaitForSeconds(matchShowTime);

                firstFlipped?.SetMatched();
                secondFlipped?.SetMatched();
                matchesFound++;
                currentScore += 20;

                if (matchesFound >= totalPairs)
                {
                    ForceComplete();
                }
            }
            else
            {
                yield return new WaitForSeconds(cardFlipTime);

                firstFlipped?.FlipBack();
                secondFlipped?.FlipBack();
                currentScore = Mathf.Max(0, currentScore - 2);
            }

            firstFlipped = null;
            secondFlipped = null;
            isProcessing = false;
            UpdateUI();
        }

        private void UpdateUI()
        {
            if (matchCountText != null)
            {
                matchCountText.text = $"{matchesFound}/{totalPairs}";
            }

            if (moveCountText != null)
            {
                moveCountText.text = moveCount.ToString();
            }
        }

        protected override int CalculateFinalScore()
        {
            int baseScore = matchesFound * 25;
            int efficiencyBonus = Mathf.Max(0, (totalPairs * 2 - moveCount) * 5);
            int timeBonus = Mathf.RoundToInt((gameDuration - gameTimer) * 2);

            return Mathf.RoundToInt((baseScore + efficiencyBonus + timeBonus) * difficultyMultiplier);
        }

        protected override void OnMiniGameCompleted(int score)
        {
            base.OnMiniGameCompleted(score);

            foreach (var handler in activeCards)
            {
                if (handler != null)
                {
                    handler.OnCardFlipped -= OnCardClicked;
                }
            }
        }

        protected override void OnMiniGameCancelled()
        {
            base.OnMiniGameCancelled();

            foreach (var handler in activeCards)
            {
                if (handler != null)
                {
                    handler.OnCardFlipped -= OnCardClicked;
                }
            }
        }
    }

    [System.Serializable]
    public class CardData
    {
        public string typeId;
        public int pairIndex;
    }

    public class CardHandler : MonoBehaviour
    {
        public System.Action<CardHandler> OnCardFlipped;

        private CardGame game;
        private CardData data;
        private CardGame.CardType type;
        private Image cardImage;
        private Sprite cardBack;
        private bool isFlipped;
        private bool isMatched;

        public CardData CardData => data;
        public bool IsFlipped => isFlipped;
        public bool IsMatched => isMatched;

        public void Initialize(CardGame game, CardData data, CardGame.CardType type, Sprite backSprite)
        {
            this.game = game;
            this.data = data;
            this.type = type;
            this.cardBack = backSprite;

            cardImage = GetComponent<Image>();
            if (cardImage == null)
            {
                cardImage = gameObject.AddComponent<Image>();
            }

            if (type.icon != null)
            {
                cardImage.sprite = type.icon;
            }
            else
            {
                cardImage.color = type.color;
            }

            FlipBack();
        }

        public void FlipCard()
        {
            if (isFlipped || isMatched) return;

            isFlipped = true;
            if (type.icon != null)
            {
                cardImage.sprite = type.icon;
            }
            cardImage.color = type.color;

            OnCardFlipped?.Invoke(this);
        }

        public void FlipBack()
        {
            if (isMatched) return;

            isFlipped = false;
            if (cardBack != null)
            {
                cardImage.sprite = cardBack;
                cardImage.color = Color.white;
            }
            else
            {
                cardImage.color = new Color(0.2f, 0.2f, 0.3f);
            }
        }

        public void SetMatched()
        {
            isMatched = true;
            cardImage.color = new Color(type.color.r * 0.5f, type.color.g * 0.5f, type.color.b * 0.5f, 0.5f);
        }

        private void OnMouseDown()
        {
            FlipCard();
        }
    }
}
