using UnityEngine;

namespace LightAndShadowMaze
{
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        public enum GameState
        {
            MainMenu,
            Playing,
            Paused,
            GameOver,
            Victory
        }

        [Header("Game Settings")]
        [SerializeField] private int mazeWidth = 15;
        [SerializeField] private int mazeHeight = 15;
        [SerializeField] private float gameTime = 300f;

        private GameState currentState;
        private float currentTime;

        public int MazeWidth => mazeWidth;
        public int MazeHeight => mazeHeight;
        public float CurrentTime => currentTime;
        public GameState CurrentState => currentState;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Start()
        {
            ChangeState(GameState.MainMenu);
        }

        private void Update()
        {
            if (currentState == GameState.Playing)
            {
                currentTime -= Time.deltaTime;
                if (currentTime <= 0)
                {
                    GameOver();
                }
            }
        }

        public void ChangeState(GameState newState)
        {
            currentState = newState;
            OnStateChanged(newState);
        }

        private void OnStateChanged(GameState state)
        {
            switch (state)
            {
                case GameState.MainMenu:
                    Time.timeScale = 1f;
                    break;
                case GameState.Playing:
                    currentTime = gameTime;
                    Time.timeScale = 1f;
                    break;
                case GameState.Paused:
                    Time.timeScale = 0f;
                    break;
                case GameState.GameOver:
                    Time.timeScale = 0f;
                    break;
                case GameState.Victory:
                    Time.timeScale = 0f;
                    break;
            }
        }

        public void StartGame()
        {
            ChangeState(GameState.Playing);
        }

        public void PauseGame()
        {
            if (currentState == GameState.Playing)
            {
                ChangeState(GameState.Paused);
            }
        }

        public void ResumeGame()
        {
            if (currentState == GameState.Paused)
            {
                ChangeState(GameState.Playing);
            }
        }

        public void GameOver()
        {
            ChangeState(GameState.GameOver);
        }

        public void Victory()
        {
            ChangeState(GameState.Victory);
        }

        public void ReturnToMainMenu()
        {
            ChangeState(GameState.MainMenu);
        }
    }
}
