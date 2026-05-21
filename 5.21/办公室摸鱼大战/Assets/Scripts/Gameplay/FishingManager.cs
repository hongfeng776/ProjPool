using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using OfficeFishing.Core;

namespace OfficeFishing.Gameplay
{
    public class FishingManager : MonoBehaviour
    {
        [Header("摸鱼设置")]
        public float scoreMultiplier = 1f;
        public float comboMultiplier = 0.1f;
        public int maxCombo = 10;

        [Header("连续摸鱼奖励")]
        public bool enableCombo = true;
        public float comboResetTime = 5f;

        private bool _isFishing;
        private InteractiveItem _currentItem;
        private float _fishingTimer;
        private int _currentCombo;
        private float _lastFishingTime;
        private Coroutine _fishingCoroutine;

        public bool IsFishing => _isFishing;
        public float FishingProgress { get; private set; }
        public int CurrentCombo => _currentCombo;
        public string CurrentActionName => _currentItem?.fishingAction?.actionName ?? "";

        private void Update()
        {
            if (_isFishing && GameManager.Instance.CurrentState == GameManager.GameState.Playing)
            {
                UpdateFishingProgress();
            }

            if (enableCombo && _currentCombo > 0)
            {
                if (Time.time - _lastFishingTime > comboResetTime)
                {
                    ResetCombo();
                }
            }
        }

        public void StartFishing(InteractiveItem item)
        {
            if (item == null || item.fishingAction == null)
            {
                Debug.LogWarning("[FishingManager] Invalid fishing item");
                return;
            }

            _isFishing = true;
            _currentItem = item;
            _fishingTimer = 0f;
            FishingProgress = 0f;

            EventSystem.Instance.Publish(new GameEvents.FishingStarted
            {
                ActionId = item.fishingAction.actionId,
                ActionName = item.fishingAction.actionName,
                Duration = item.fishingAction.duration
            });

            Debug.Log($"[FishingManager] Started fishing: {item.fishingAction.actionName}");
        }

        public void StopFishing(bool wasCaught)
        {
            if (!_isFishing) return;

            _isFishing = false;

            if (wasCaught)
            {
                EventSystem.Instance.Publish(new GameEvents.FishingInterrupted
                {
                    Reason = "Caught by boss"
                });
                ResetCombo();
            }
            else
            {
                if (FishingProgress >= 1f)
                {
                    CompleteFishing();
                }
                else
                {
                    EventSystem.Instance.Publish(new GameEvents.FishingInterrupted
                    {
                        Reason = "Stopped by player"
                    });
                }
            }

            _currentItem = null;
            _fishingTimer = 0f;
            FishingProgress = 0f;
        }

        private void UpdateFishingProgress()
        {
            if (_currentItem?.fishingAction == null) return;

            _fishingTimer += Time.deltaTime;
            FishingProgress = Mathf.Clamp01(_fishingTimer / _currentItem.fishingAction.duration);

            if (FishingProgress >= 1f)
            {
                CompleteFishing();

                _fishingTimer = 0f;
                FishingProgress = 0f;

                if (_currentItem != null)
                {
                    EventSystem.Instance.Publish(new GameEvents.FishingStarted
                    {
                        ActionId = _currentItem.fishingAction.actionId,
                        ActionName = _currentItem.fishingAction.actionName,
                        Duration = _currentItem.fishingAction.duration
                    });
                }
            }
        }

        private void CompleteFishing()
        {
            if (_currentItem?.fishingAction == null) return;

            int baseScore = _currentItem.fishingAction.baseScore;
            float riskMultiplier = 1f + _currentItem.fishingAction.riskLevel;
            float comboBonus = enableCombo ? 1f + (_currentCombo * comboMultiplier) : 1f;

            int finalScore = Mathf.RoundToInt(baseScore * riskMultiplier * comboBonus * scoreMultiplier);

            if (enableCombo)
            {
                _currentCombo = Mathf.Min(_currentCombo + 1, maxCombo);
                _lastFishingTime = Time.time;
            }

            OfficeFishingGameManager.Instance.AddScore(finalScore);

            _currentItem.OnInteractComplete?.Invoke();

            EventSystem.Instance.Publish(new GameEvents.FishingCompleted
            {
                ActionId = _currentItem.fishingAction.actionId,
                ScoreGained = finalScore,
                WasCaught = false
            });

            Debug.Log($"[FishingManager] Fishing complete! +{finalScore} (Combo: {_currentCombo})");
        }

        public void ResetCombo()
        {
            _currentCombo = 0;
            Debug.Log("[FishingManager] Combo reset");
        }

        public void ResetManager()
        {
            _isFishing = false;
            _currentItem = null;
            _fishingTimer = 0f;
            FishingProgress = 0f;
            _currentCombo = 0;
            _lastFishingTime = 0f;
        }
    }
}
