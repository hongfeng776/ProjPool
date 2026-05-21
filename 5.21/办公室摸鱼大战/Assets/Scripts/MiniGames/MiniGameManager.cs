using System.Collections.Generic;
using UnityEngine;
using OfficeFishing.Core;
using OfficeFishing.Gameplay;

namespace OfficeFishing.MiniGames
{
    public class MiniGameManager : MonoBehaviour
    {
        [Header("UI 面板")]
        public GameObject miniGamePanel;
        public Transform gameContainer;

        [Header("游戏预制体")]
        public GameObject phoneGamePrefab;
        public GameObject cardGamePrefab;
        public GameObject snackGamePrefab;

        private GameObject currentGameInstance;
        private MiniGameBase currentMiniGame;
        private bool isGameActive;

        public bool IsGameActive => isGameActive;
        public MiniGameBase CurrentMiniGame => currentMiniGame;

        private void Start()
        {
            if (miniGamePanel != null)
            {
                miniGamePanel.SetActive(false);
            }
        }

        public bool StartMiniGame(string gameType)
        {
            if (isGameActive)
            {
                Debug.LogWarning("[MiniGameManager] Another game is already active!");
                return false;
            }

            GameObject prefab = GetGamePrefab(gameType);
            if (prefab == null)
            {
                Debug.LogError($"[MiniGameManager] No prefab found for game type: {gameType}");
                return false;
            }

            SpawnGame(prefab, gameType);
            return true;
        }

        private GameObject GetGamePrefab(string gameType)
        {
            switch (gameType.ToLower())
            {
                case "phone":
                case "phonegame":
                    return phoneGamePrefab;
                case "card":
                case "cardgame":
                    return cardGamePrefab;
                case "snack":
                case "snackgame":
                    return snackGamePrefab;
                default:
                    return null;
            }
        }

        private void SpawnGame(GameObject prefab, string gameType)
        {
            if (miniGamePanel != null)
            {
                miniGamePanel.SetActive(true);
            }

            currentGameInstance = Instantiate(prefab, gameContainer);
            currentMiniGame = currentGameInstance.GetComponent<MiniGameBase>();

            if (currentMiniGame == null)
            {
                Debug.LogError("[MiniGameManager] Prefab has no MiniGameBase component!");
                Destroy(currentGameInstance);
                return;
            }

            currentMiniGame.OnGameComplete.AddListener(OnMiniGameComplete);
            currentMiniGame.OnGameFail.AddListener(OnMiniGameFail);
            currentMiniGame.OnGameCancel.AddListener(OnMiniGameCancel);

            isGameActive = true;
            currentMiniGame.StartGame();

            EventSystem.Instance.Publish(new MiniGameEvents.GameStarted
            {
                GameId = currentMiniGame.gameId,
                GameName = currentMiniGame.gameName
            });
        }

        private void OnMiniGameComplete(int score)
        {
            Debug.Log($"[MiniGameManager] Game completed with score: {score}");

            EventSystem.Instance.Publish(new MiniGameEvents.GameCompleted
            {
                GameId = currentMiniGame?.gameId ?? "",
                Score = score
            });

            OfficeFishingGameManager.Instance?.AddScore(score);

            Invoke(nameof(CloseCurrentGame), 1f);
        }

        private void OnMiniGameFail()
        {
            Debug.Log("[MiniGameManager] Game failed");

            EventSystem.Instance.Publish(new MiniGameEvents.GameFailed
            {
                GameId = currentMiniGame?.gameId ?? ""
            });

            Invoke(nameof(CloseCurrentGame), 1f);
        }

        private void OnMiniGameCancel()
        {
            Debug.Log("[MiniGameManager] Game cancelled");

            EventSystem.Instance.Publish(new MiniGameEvents.GameCancelled
            {
                GameId = currentMiniGame?.gameId ?? ""
            });

            CloseCurrentGame();
        }

        public void CancelCurrentGame()
        {
            if (currentMiniGame != null && currentMiniGame.IsPlaying)
            {
                currentMiniGame.CancelGame();
            }
            else
            {
                CloseCurrentGame();
            }
        }

        private void CloseCurrentGame()
        {
            if (currentGameInstance != null)
            {
                Destroy(currentGameInstance);
                currentGameInstance = null;
            }

            currentMiniGame = null;
            isGameActive = false;

            if (miniGamePanel != null)
            {
                miniGamePanel.SetActive(false);
            }
        }

        private void OnDestroy()
        {
            if (currentMiniGame != null)
            {
                currentMiniGame.OnGameComplete.RemoveListener(OnMiniGameComplete);
                currentMiniGame.OnGameFail.RemoveListener(OnMiniGameFail);
                currentMiniGame.OnGameCancel.RemoveListener(OnMiniGameCancel);
            }
        }
    }

    public class MiniGameEvents
    {
        public struct GameStarted
        {
            public string GameId;
            public string GameName;
        }

        public struct GameCompleted
        {
            public string GameId;
            public int Score;
        }

        public struct GameFailed
        {
            public string GameId;
        }

        public struct GameCancelled
        {
            public string GameId;
        }
    }
}
