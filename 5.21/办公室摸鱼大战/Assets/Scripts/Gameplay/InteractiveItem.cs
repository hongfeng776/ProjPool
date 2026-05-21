using UnityEngine;
using UnityEngine.Events;
using UnityEngine.EventSystems;
using OfficeFishing.MiniGames;

namespace OfficeFishing.Gameplay
{
    public class InteractiveItem : MonoBehaviour
    {
        [Header("物品设置")]
        public string itemId;
        public string itemName;
        public InteractiveType type;
        public bool canInteract = true;

        [Header("摸鱼设置")]
        public FishingAction fishingAction;

        [Header("小游戏设置")]
        public bool enableMiniGame = true;
        public string miniGameType = "";

        [Header("提示")]
        public string hoverText;
        public Sprite icon;

        [Header("事件")]
        public UnityEvent OnStartInteract;
        public UnityEvent OnStopInteract;
        public UnityEvent OnInteractComplete;

        [Header("视觉反馈")]
        public Renderer itemRenderer;
        public Color highlightColor = Color.yellow;
        public Color normalColor = Color.white;

        private bool _isHighlighted;

        public string ItemName => itemName;
        public InteractiveType Type => type;
        public bool CanInteract => canInteract;
        public string MiniGameType => GetMiniGameType();

        private string GetMiniGameType()
        {
            if (!string.IsNullOrEmpty(miniGameType))
            {
                return miniGameType;
            }

            switch (type)
            {
                case InteractiveType.Phone:
                    return "phone";
                case InteractiveType.GameConsole:
                    return "card";
                case InteractiveType.Snack:
                    return "snack";
                default:
                    return "";
            }
        }

        private void Start()
        {
            if (string.IsNullOrEmpty(itemId))
            {
                itemId = $"item_{gameObject.GetInstanceID()}";
            }

            if (fishingAction == null)
            {
                fishingAction = new FishingAction
                {
                    actionId = itemId,
                    actionName = itemName,
                    type = type,
                    duration = 3f,
                    baseScore = 10,
                    riskLevel = 0.5f
                };
            }
        }

        public void SetHighlight(bool highlighted)
        {
            _isHighlighted = highlighted;

            if (itemRenderer != null)
            {
                itemRenderer.material.color = highlighted ? highlightColor : normalColor;
            }
        }

        public void SetCanInteract(bool value)
        {
            canInteract = value;
            if (!canInteract && _isHighlighted)
            {
                SetHighlight(false);
            }
        }

        private void OnMouseEnter()
        {
            if (canInteract && !EventSystem.current.IsPointerOverGameObject())
            {
                SetHighlight(true);
            }
        }

        private void OnMouseExit()
        {
            if (_isHighlighted)
            {
                SetHighlight(false);
            }
        }
    }
}
