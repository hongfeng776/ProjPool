using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using OfficeFishing.Core;

namespace OfficeFishing.Gameplay
{
    public class BossController : MonoBehaviour
    {
        [Header("巡逻设置")]
        public List<PatrolPoint> patrolPoints = new List<PatrolPoint>();
        public float moveSpeed = 2f;
        public float rotationSpeed = 5f;
        public float minMoveDistance = 0.1f;

        [Header("检测设置")]
        public float defaultDetectionRadius = 3f;
        public float fieldOfView = 60f;
        public LayerMask playerLayer;
        public LayerMask obstacleLayer;

        [Header("状态设置")]
        public float checkInterval = 5f;
        public float checkChance = 0.3f;

        [Header("卡住检测")]
        public bool enableStuckDetection = true;
        public float stuckCheckInterval = 2f;
        public float stuckThreshold = 0.05f;

        [Header("引用")]
        public Transform bossTransform;
        public Animator bossAnimator;

        private BossState _currentState;
        private int _currentPatrolIndex;
        private Coroutine _currentCoroutine;
        private Coroutine _stuckCheckCoroutine;
        private bool _isPlayerVisible;
        private float _detectionTimer;
        private Vector3 _lastPosition;
        private float _lastMoveTime;
        private bool _isPaused;
        private float _baseMoveSpeed = 2f;
        private float _currentSpeedMultiplier = 1f;
        private float _currentDetectionRange;
        private float _currentDetectionTime;
        private const float DETECTION_TIME = 0.5f;

        public BossState CurrentState
        {
            get => _currentState;
            private set
            {
                if (_currentState != value)
                {
                    BossState oldState = _currentState;
                    _currentState = value;
                    EventSystem.Instance.Publish(new GameEvents.BossStateChanged
                    {
                        NewState = _currentState,
                        OldState = oldState
                    });
                }
            }
        }

        public bool IsPlayerVisible => _isPlayerVisible;
        public float DetectionProgress { get; private set; }
        public bool IsPatrolling => CurrentState == BossState.Patrolling && !_isPaused;

        private void Start()
        {
            if (bossTransform == null)
            {
                bossTransform = transform;
            }

            _baseMoveSpeed = moveSpeed;
            _currentDetectionRange = defaultDetectionRadius;
            _currentDetectionTime = DETECTION_TIME;

            _lastPosition = bossTransform.position;
            _lastMoveTime = Time.time;

            if (patrolPoints.Count == 0)
            {
                Debug.LogWarning("[BossController] No patrol points set! Boss will not move.");
                return;
            }

            ValidatePatrolPoints();

            StartPatrol();

            if (enableStuckDetection)
            {
                _stuckCheckCoroutine = StartCoroutine(StuckDetectionRoutine());
            }
        }

        private void OnDestroy()
        {
            StopAllCoroutines();
        }

        private void ValidatePatrolPoints()
        {
            for (int i = patrolPoints.Count - 1; i >= 0; i--)
            {
                if (patrolPoints[i] == null || patrolPoints[i].point == null)
                {
                    Debug.LogWarning($"[BossController] Patrol point {i} has null transform, removing.");
                    patrolPoints.RemoveAt(i);
                }
            }

            for (int i = 0; i < patrolPoints.Count; i++)
            {
                if (patrolPoints[i].detectionRadius <= 0)
                {
                    patrolPoints[i].detectionRadius = defaultDetectionRadius;
                }
                if (patrolPoints[i].waitTime < 0)
                {
                    patrolPoints[i].waitTime = 0;
                }
            }

            if (patrolPoints.Count == 0)
            {
                Debug.LogError("[BossController] All patrol points are invalid!");
            }
        }

        private void Update()
        {
            CheckPlayerVisibility();

            if (CurrentState == BossState.Patrolling && !_isPaused)
            {
                UpdateStuckTracking();
            }
        }

        private void UpdateStuckTracking()
        {
            if (bossTransform == null) return;

            float distanceSq = (bossTransform.position - _lastPosition).sqrMagnitude;
            if (distanceSq > stuckThreshold * stuckThreshold)
            {
                _lastPosition = bossTransform.position;
                _lastMoveTime = Time.time;
            }
        }

        private void CheckPlayerVisibility()
        {
            if (GameManager.Instance == null || 
                GameManager.Instance.CurrentState != GameManager.GameState.Playing) return;

            var playerController = OfficeFishingGameManager.Instance?.PlayerController;
            if (playerController == null) return;

            if (playerController.IsInvisible)
            {
                _isPlayerVisible = false;
                DetectionProgress = 0f;
                _detectionTimer = 0f;
                return;
            }

            if (playerController.CurrentState == PlayerState.Working)
            {
                _isPlayerVisible = false;
                DetectionProgress = 0f;
                _detectionTimer = 0f;
                return;
            }

            if (bossTransform == null) return;

            Vector3 directionToPlayer = playerController.transform.position - bossTransform.position;
            directionToPlayer.y = 0;

            float distance = directionToPlayer.magnitude;
            float currentDetectionRadius = GetCurrentDetectionRadius();

            if (distance > currentDetectionRadius)
            {
                _isPlayerVisible = false;
                DetectionProgress = 0f;
                _detectionTimer = 0f;
                return;
            }

            if (directionToPlayer.sqrMagnitude < 0.001f)
            {
                _isPlayerVisible = false;
                DetectionProgress = 0f;
                _detectionTimer = 0f;
                return;
            }

            float angle = Vector3.Angle(bossTransform.forward, directionToPlayer.normalized);
            if (angle > fieldOfView * 0.5f)
            {
                _isPlayerVisible = false;
                DetectionProgress = 0f;
                _detectionTimer = 0f;
                return;
            }

            if (Physics.Linecast(
                bossTransform.position + Vector3.up,
                playerController.transform.position + Vector3.up * 0.5f,
                obstacleLayer))
            {
                _isPlayerVisible = false;
                DetectionProgress = 0f;
                _detectionTimer = 0f;
                return;
            }

            _detectionTimer += Time.deltaTime;
            DetectionProgress = Mathf.Clamp01(_detectionTimer / _currentDetectionTime);

            if (_detectionTimer >= _currentDetectionTime)
            {
                _isPlayerVisible = true;
                OnPlayerDetected();
            }
        }

        private float GetCurrentDetectionRadius()
        {
            if (patrolPoints.Count == 0) return _currentDetectionRange;
            if (_currentPatrolIndex < 0 || _currentPatrolIndex >= patrolPoints.Count)
                return _currentDetectionRange;

            var currentPoint = patrolPoints[_currentPatrolIndex];
            if (currentPoint != null && currentPoint.detectionRadius > 0)
            {
                return currentPoint.detectionRadius;
            }
            return _currentDetectionRange;
        }

        private void OnPlayerDetected()
        {
            Debug.Log("[BossController] Player detected fishing!");

            StopPatrolCoroutines();
            CurrentState = BossState.Checking;

            if (bossAnimator != null)
            {
                bossAnimator.SetTrigger("Angry");
            }

            OfficeFishingGameManager.Instance.OnPlayerCaught();
            _detectionTimer = 0f;
            DetectionProgress = 0f;
        }

        public void StartPatrol()
        {
            if (patrolPoints.Count == 0)
            {
                Debug.LogWarning("[BossController] Cannot start patrol: no valid points.");
                return;
            }

            StopPatrolCoroutines();

            CurrentState = BossState.Patrolling;
            _isPaused = false;
            _currentPatrolIndex = FindNearestPatrolPointIndex();
            _currentCoroutine = StartCoroutine(PatrolRoutine());

            Debug.Log($"[BossController] Starting patrol from index {_currentPatrolIndex}");
        }

        private int FindNearestPatrolPointIndex()
        {
            if (patrolPoints.Count == 0 || bossTransform == null) return 0;

            int nearestIndex = 0;
            float nearestDistance = float.MaxValue;

            for (int i = 0; i < patrolPoints.Count; i++)
            {
                if (patrolPoints[i]?.point == null) continue;

                float distance = Vector3.Distance(
                    bossTransform.position,
                    patrolPoints[i].point.position);

                if (distance < nearestDistance)
                {
                    nearestDistance = distance;
                    nearestIndex = i;
                }
            }

            return nearestIndex;
        }

        private IEnumerator PatrolRoutine()
        {
            while (true)
            {
                if (_isPaused)
                {
                    yield return null;
                    continue;
                }

                if (_currentPatrolIndex < 0 || _currentPatrolIndex >= patrolPoints.Count)
                {
                    _currentPatrolIndex = 0;
                }

                var targetPoint = patrolPoints[_currentPatrolIndex];

                if (targetPoint?.point == null)
                {
                    Debug.LogWarning("[BossController] Invalid patrol point, skipping.");
                    _currentPatrolIndex = (_currentPatrolIndex + 1) % patrolPoints.Count;
                    yield return null;
                    continue;
                }

                yield return MoveToPoint(targetPoint.point.position, targetPoint.waitTime);

                if (_isPaused) continue;

                if (Random.value < checkChance)
                {
                    CurrentState = BossState.Checking;
                    float elapsed = 0f;
                    while (elapsed < checkInterval)
                    {
                        if (!_isPaused)
                        {
                            elapsed += Time.deltaTime;
                        }
                        yield return null;
                    }
                    CurrentState = BossState.Patrolling;
                }
                else
                {
                    float waitTime = targetPoint.waitTime;
                    float elapsed = 0f;
                    while (elapsed < waitTime)
                    {
                        if (!_isPaused)
                        {
                            elapsed += Time.deltaTime;
                        }
                        yield return null;
                    }
                }

                _currentPatrolIndex = (_currentPatrolIndex + 1) % patrolPoints.Count;
            }
        }

        private IEnumerator MoveToPoint(Vector3 targetPosition, float waitTimeAtPoint)
        {
            if (bossTransform == null) yield break;

            targetPosition.y = bossTransform.position.y;

            float distanceToTarget = Vector3.Distance(bossTransform.position, targetPosition);

            if (distanceToTarget < minMoveDistance)
            {
                Debug.Log($"[BossController] Already at target point (distance: {distanceToTarget:F2}), waiting...");
                if (bossAnimator != null)
                {
                    bossAnimator.SetFloat("Speed", 0);
                }

                float elapsed = 0f;
                while (elapsed < waitTimeAtPoint)
                {
                    if (!_isPaused)
                    {
                        elapsed += Time.deltaTime;
                    }
                    yield return null;
                }
                yield break;
            }

            float timeout = distanceToTarget / Mathf.Max(moveSpeed, 0.1f) + 5f;
            float startTime = Time.time;

            while (Vector3.Distance(bossTransform.position, targetPosition) > minMoveDistance)
            {
                if (_isPaused)
                {
                    if (bossAnimator != null)
                    {
                        bossAnimator.SetFloat("Speed", 0);
                    }
                    yield return null;
                    continue;
                }

                if (Time.time - startTime > timeout)
                {
                    Debug.LogWarning($"[BossController] MoveToPoint timed out! Forcing completion.");
                    bossTransform.position = targetPosition;
                    break;
                }

                Vector3 direction = targetPosition - bossTransform.position;
                direction.y = 0;

                if (direction.sqrMagnitude > 0.001f)
                {
                    Quaternion targetRotation = Quaternion.LookRotation(direction);
                    bossTransform.rotation = Quaternion.Lerp(
                        bossTransform.rotation,
                        targetRotation,
                        rotationSpeed * Time.deltaTime);
                }

                bossTransform.position = Vector3.MoveTowards(
                    bossTransform.position,
                    targetPosition,
                    moveSpeed * _currentSpeedMultiplier * Time.deltaTime);

                if (bossAnimator != null)
                {
                    bossAnimator.SetFloat("Speed", moveSpeed * _currentSpeedMultiplier);
                }

                yield return null;
            }

            if (bossAnimator != null)
            {
                bossAnimator.SetFloat("Speed", 0);
            }

            _lastPosition = bossTransform.position;
            _lastMoveTime = Time.time;

            Debug.Log($"[BossController] Reached target point #{_currentPatrolIndex}");
        }

        private IEnumerator StuckDetectionRoutine()
        {
            WaitForSeconds wait = new WaitForSeconds(stuckCheckInterval);

            while (true)
            {
                yield return wait;

                if (!enableStuckDetection || _isPaused || CurrentState != BossState.Patrolling)
                {
                    continue;
                }

                if (Time.time - _lastMoveTime > stuckCheckInterval * 2f)
                {
                    if (bossTransform != null)
                    {
                        float distance = Vector3.Distance(bossTransform.position, _lastPosition);
                        if (distance < stuckThreshold)
                        {
                            Debug.LogWarning($"[BossController] Boss appears to be stuck! Attempting recovery...");
                            RecoverFromStuck();
                        }
                    }
                }
            }
        }

        private void RecoverFromStuck()
        {
            if (patrolPoints.Count == 0) return;

            _currentPatrolIndex = (_currentPatrolIndex + 1) % patrolPoints.Count;

            StopPatrolCoroutines();

            if (patrolPoints[_currentPatrolIndex]?.point != null && bossTransform != null)
            {
                bossTransform.position = Vector3.Lerp(
                    bossTransform.position,
                    patrolPoints[_currentPatrolIndex].point.position,
                    0.5f);
            }

            _lastPosition = bossTransform != null ? bossTransform.position : Vector3.zero;
            _lastMoveTime = Time.time;

            CurrentState = BossState.Patrolling;
            _isPaused = false;
            _currentCoroutine = StartCoroutine(PatrolRoutine());

            Debug.Log($"[BossController] Recovered from stuck, moving to point #{_currentPatrolIndex}");
        }

        private void StopPatrolCoroutines()
        {
            if (_currentCoroutine != null)
            {
                StopCoroutine(_currentCoroutine);
                _currentCoroutine = null;
            }
        }

        public void PausePatrol()
        {
            _isPaused = true;

            if (bossAnimator != null)
            {
                bossAnimator.SetFloat("Speed", 0);
            }
        }

        public void ResumePatrol()
        {
            if (_currentState == BossState.Patrolling && !_isPaused)
            {
                return;
            }

            _isPaused = false;
            _detectionTimer = 0f;
            DetectionProgress = 0f;

            if (CurrentState != BossState.Patrolling)
            {
                if (patrolPoints.Count == 0)
                {
                    StartPatrol();
                }
                else
                {
                    CurrentState = BossState.Patrolling;

                    if (_currentCoroutine == null)
                    {
                        _currentCoroutine = StartCoroutine(PatrolRoutine());
                    }
                }
            }

            _lastPosition = bossTransform != null ? bossTransform.position : Vector3.zero;
            _lastMoveTime = Time.time;

            Debug.Log($"[BossController] Patrol resumed");
        }

        public void ForceResumePatrol()
        {
            _isPaused = false;
            StopPatrolCoroutines();
            StartPatrol();
        }

        public void ApplySpeedMultiplier(float multiplier)
        {
            _currentSpeedMultiplier = Mathf.Max(0.1f, multiplier);
            Debug.Log($"[BossController] Speed multiplier applied: {_currentSpeedMultiplier}");
        }

        public void ResetSpeedMultiplier()
        {
            _currentSpeedMultiplier = 1f;
            Debug.Log("[BossController] Speed multiplier reset");
        }

        public void SetPatrolSpeed(float speed)
        {
            _baseMoveSpeed = speed;
            moveSpeed = speed;
            Debug.Log($"[BossController] Patrol speed set to: {speed}");
        }

        public void SetDetectionRange(float range)
        {
            _currentDetectionRange = Mathf.Max(1f, range);
            Debug.Log($"[BossController] Detection range set to: {_currentDetectionRange}");
        }

        public void SetDetectionTime(float time)
        {
            _currentDetectionTime = Mathf.Max(0.1f, time);
            Debug.Log($"[BossController] Detection time set to: {_currentDetectionTime}");
        }

        public float GetCurrentSpeedMultiplier()
        {
            return _currentSpeedMultiplier;
        }

        public void SetCheckInterval(float interval)
        {
            checkInterval = Mathf.Max(1f, interval);
            Debug.Log($"[BossController] Check interval set to: {checkInterval}");
        }

        private void OnDrawGizmosSelected()
        {
            if (bossTransform == null) return;

            Gizmos.color = Color.yellow;
            Gizmos.DrawWireSphere(bossTransform.position, GetCurrentDetectionRadius());

            Vector3 forward = bossTransform.forward * GetCurrentDetectionRadius();
            Quaternion leftRayRotation = Quaternion.AngleAxis(-fieldOfView * 0.5f, Vector3.up);
            Quaternion rightRayRotation = Quaternion.AngleAxis(fieldOfView * 0.5f, Vector3.up);
            Vector3 leftRayDirection = leftRayRotation * forward;
            Vector3 rightRayDirection = rightRayRotation * forward;

            Gizmos.color = Color.red;
            Gizmos.DrawRay(bossTransform.position, forward);
            Gizmos.DrawRay(bossTransform.position, leftRayDirection);
            Gizmos.DrawRay(bossTransform.position, rightRayDirection);

            if (patrolPoints.Count > 1)
            {
                Gizmos.color = Color.blue;
                for (int i = 0; i < patrolPoints.Count; i++)
                {
                    if (patrolPoints[i]?.point != null)
                    {
                        Gizmos.DrawSphere(patrolPoints[i].point.position, 0.3f);
                        int nextIndex = (i + 1) % patrolPoints.Count;
                        if (patrolPoints[nextIndex]?.point != null)
                        {
                            Gizmos.DrawLine(
                                patrolPoints[i].point.position,
                                patrolPoints[nextIndex].point.position);
                        }
                    }
                }
            }

            if (_currentPatrolIndex >= 0 && _currentPatrolIndex < patrolPoints.Count)
            {
                var current = patrolPoints[_currentPatrolIndex];
                if (current?.point != null)
                {
                    Gizmos.color = Color.green;
                    Gizmos.DrawSphere(current.point.position, 0.4f);
                }
            }
        }
    }
}
