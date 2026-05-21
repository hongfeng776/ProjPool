using UnityEngine;
using OfficeFishing.Core;

namespace OfficeFishing.Gameplay
{
    public class PlayerController : MonoBehaviour
    {
        [Header("引用")]
        public Transform playerTransform;
        public Animator playerAnimator;
        public Camera mainCamera;

        [Header("设置")]
        public LayerMask interactiveLayer;
        public float interactDistance = 5f;

        private PlayerState _currentState;
        private InteractiveItem _currentInteractingItem;
        private bool _canInteract = true;
        private bool _isInvisible = false;

        public PlayerState CurrentState
        {
            get => _currentState;
            private set
            {
                _currentState = value;
                UpdateAnimationState();
            }
        }

        public InteractiveItem CurrentInteractingItem => _currentInteractingItem;
        public bool CanInteract => _canInteract && CurrentState != PlayerState.GettingCaught;
        public bool IsInvisible => _isInvisible;

        private void Start()
        {
            CurrentState = PlayerState.Working;
        }

        private void Update()
        {
            if (GameManager.Instance.CurrentState != GameManager.GameState.Playing) return;
            if (!_canInteract) return;

            if (Input.GetMouseButtonDown(0))
            {
                HandleClick();
            }
        }

        private void HandleClick()
        {
            Ray ray = mainCamera.ScreenPointToRay(Input.mousePosition);
            if (Physics.Raycast(ray, out RaycastHit hit, interactDistance, interactiveLayer))
            {
                var interactiveItem = hit.collider.GetComponent<InteractiveItem>();
                if (interactiveItem != null && interactiveItem.CanInteract)
                {
                    TryInteract(interactiveItem);
                }
            }
        }

        public void TryInteract(InteractiveItem item)
        {
            if (!CanInteract) return;

            Debug.Log($"[PlayerController] Interacting with: {item.ItemName}");

            if (item.Type == InteractiveType.Computer)
            {
                if (CurrentState == PlayerState.Fishing)
                {
                    StopFishing();
                }
                StartWorking(item);
            }
            else
            {
                if (CurrentState == PlayerState.Working)
                {
                    StartFishing(item);
                }
                else if (CurrentState == PlayerState.Fishing && _currentInteractingItem != item)
                {
                    StopFishing();
                    StartFishing(item);
                }
            }
        }

        private void StartWorking(InteractiveItem computer)
        {
            CurrentState = PlayerState.Working;
            _currentInteractingItem = computer;

            if (playerAnimator != null)
            {
                playerAnimator.SetTrigger("Work");
            }

            Debug.Log("[PlayerController] Started working!");
        }

        private void StartFishing(InteractiveItem item)
        {
            CurrentState = PlayerState.Fishing;
            _currentInteractingItem = item;
            item.OnStartInteract?.Invoke();

            if (playerAnimator != null)
            {
                playerAnimator.SetTrigger("Fish");
            }

            if (item.enableMiniGame && !string.IsNullOrEmpty(item.MiniGameType))
            {
                var miniGameManager = FindObjectOfType<OfficeFishing.MiniGames.MiniGameManager>();
                if (miniGameManager != null)
                {
                    bool gameStarted = miniGameManager.StartMiniGame(item.MiniGameType);
                    if (!gameStarted)
                    {
                        OfficeFishingGameManager.Instance.FishingManager.StartFishing(item);
                    }
                }
                else
                {
                    OfficeFishingGameManager.Instance.FishingManager.StartFishing(item);
                }
            }
            else
            {
                OfficeFishingGameManager.Instance.FishingManager.StartFishing(item);
            }
        }

        public void StopFishing()
        {
            if (CurrentState != PlayerState.Fishing) return;

            if (_currentInteractingItem != null)
            {
                _currentInteractingItem.OnStopInteract?.Invoke();
            }

            OfficeFishingGameManager.Instance.FishingManager.StopFishing(false);

            CurrentState = PlayerState.Working;
            _currentInteractingItem = null;
        }

        public void OnCaught()
        {
            CurrentState = PlayerState.GettingCaught;
            _canInteract = false;

            if (playerAnimator != null)
            {
                playerAnimator.SetTrigger("Caught");
            }

            if (_currentInteractingItem != null)
            {
                _currentInteractingItem.OnStopInteract?.Invoke();
            }

            Invoke(nameof(RecoverFromCaught), 2f);
        }

        private void RecoverFromCaught()
        {
            _canInteract = true;
            CurrentState = PlayerState.Working;
            _currentInteractingItem = null;

            if (OfficeFishingGameManager.Instance?.BossController != null)
            {
                OfficeFishingGameManager.Instance.BossController.ForceResumePatrol();
            }
        }

        private void UpdateAnimationState()
        {
            if (playerAnimator == null) return;

            playerAnimator.SetInteger("State", (int)CurrentState);
        }

        public void ResetPlayer()
        {
            _canInteract = true;
            _isInvisible = false;
            CurrentState = PlayerState.Working;
            _currentInteractingItem = null;
        }

        public void SetInvisible(bool invisible)
        {
            _isInvisible = invisible;

            var renderers = GetComponentsInChildren<Renderer>();
            foreach (var renderer in renderers)
            {
                renderer.enabled = !invisible;
            }

            Debug.Log($"[PlayerController] Set invisible: {invisible}");
        }

        public void Heal(int amount)
        {
            if (OfficeFishingGameManager.Instance != null)
            {
                OfficeFishingGameManager.Instance.Heal(amount);
            }
        }
    }
}
