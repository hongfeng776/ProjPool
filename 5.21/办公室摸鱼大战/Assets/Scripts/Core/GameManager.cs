using UnityEngine;

namespace OfficeFishing.Core
{
    public class GameManager : Singleton<GameManager>
    {
        public enum GameState
        {
            MainMenu,
            Loading,
            Playing,
            Paused,
            GameOver
        }

        public GameState CurrentState { get; private set; }

        public System.Action<GameState> OnGameStateChanged;

        protected override void OnDestroy()
        {
            base.OnDestroy();
        }

        public void ChangeGameState(GameState newState)
        {
            if (CurrentState == newState) return;

            CurrentState = newState;
            OnGameStateChanged?.Invoke(newState);
            Debug.Log($"[GameManager] Game state changed to: {newState}");
        }

        public void StartGame()
        {
            ChangeGameState(GameState.Loading);
        }

        public void PauseGame()
        {
            if (CurrentState == GameState.Playing)
            {
                Time.timeScale = 0f;
                ChangeGameState(GameState.Paused);
            }
        }

        public void ResumeGame()
        {
            if (CurrentState == GameState.Paused)
            {
                Time.timeScale = 1f;
                ChangeGameState(GameState.Playing);
            }
        }

        public void GameOver()
        {
            Time.timeScale = 1f;
            ChangeGameState(GameState.GameOver);
        }

        public void ReturnToMainMenu()
        {
            Time.timeScale = 1f;
            ChangeGameState(GameState.MainMenu);
        }
    }
}
