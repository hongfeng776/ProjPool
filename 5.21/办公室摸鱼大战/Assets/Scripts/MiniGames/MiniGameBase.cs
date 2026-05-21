using UnityEngine;
using UnityEngine.Events;
using OfficeFishing.Core;

namespace OfficeFishing.MiniGames
{
    public abstract class MiniGameBase : MonoBehaviour
    {
        [Header("小游戏设置")]
        public string gameId;
        public string gameName;
        public int baseScore = 10;
        public float gameDuration = 5f;
        public float difficultyMultiplier = 1f;

        [Header("事件")]
        public UnityEvent OnGameStart;
        public UnityEvent<int> OnGameComplete;
        public UnityEvent OnGameFail;
        public UnityEvent OnGameCancel;

        protected bool isPlaying;
        protected float gameTimer;
        protected int currentScore;
        protected bool isCompleted;

        public bool IsPlaying => isPlaying;
        public float Progress => Mathf.Clamp01(gameTimer / gameDuration);
        public int CurrentScore => currentScore;

        public virtual void StartGame()
        {
            if (isPlaying) return;

            isPlaying = true;
            isCompleted = false;
            gameTimer = 0f;
            currentScore = 0;

            OnGameStart?.Invoke();
            OnMiniGameStarted();

            Debug.Log($"[MiniGame] Started: {gameName}");
        }

        protected virtual void Update()
        {
            if (!isPlaying) return;

            gameTimer += Time.deltaTime;
            OnGameUpdate();

            if (gameTimer >= gameDuration && !isCompleted)
            {
                TimeUp();
            }
        }

        protected virtual void OnMiniGameStarted() { }

        protected virtual void OnGameUpdate() { }

        protected virtual void TimeUp()
        {
            if (!isPlaying) return;

            isCompleted = true;
            CompleteGame();
        }

        protected virtual void CompleteGame()
        {
            isPlaying = false;

            int finalScore = CalculateFinalScore();
            currentScore = finalScore;

            OnGameComplete?.Invoke(finalScore);
            OnMiniGameCompleted(finalScore);

            Debug.Log($"[MiniGame] Completed: {gameName}, Score: {finalScore}");
        }

        protected virtual int CalculateFinalScore()
        {
            return Mathf.RoundToInt(baseScore * difficultyMultiplier);
        }

        protected virtual void OnMiniGameCompleted(int score) { }

        public virtual void CancelGame()
        {
            if (!isPlaying) return;

            isPlaying = false;
            isCompleted = true;

            OnGameCancel?.Invoke();
            OnMiniGameCancelled();

            Debug.Log($"[MiniGame] Cancelled: {gameName}");
        }

        protected virtual void OnMiniGameCancelled() { }

        public virtual void ForceComplete()
        {
            if (!isPlaying) return;
            CompleteGame();
        }

        public virtual void ResetGame()
        {
            isPlaying = false;
            isCompleted = false;
            gameTimer = 0f;
            currentScore = 0;
        }
    }
}
