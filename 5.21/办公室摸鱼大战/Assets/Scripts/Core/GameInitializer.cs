using UnityEngine;
using OfficeFishing.Core;
using OfficeFishing.Network;
using OfficeFishing.Database;

namespace OfficeFishing.Core
{
    public class GameInitializer : MonoBehaviour
    {
        public bool initializeOnAwake = true;

        private void Awake()
        {
            if (initializeOnAwake)
            {
                InitializeGame();
            }
        }

        public void InitializeGame()
        {
            Debug.Log("[GameInitializer] Starting game initialization...");

            InitializeDatabase();
            InitializeNetwork();
            InitializeUI();

            GameManager.Instance.ChangeGameState(GameManager.GameState.MainMenu);

            Debug.Log("[GameInitializer] Game initialization completed");
        }

        private void InitializeDatabase()
        {
            if (DatabaseManager.Instance != null && DatabaseManager.Instance.IsInitialized)
            {
                Debug.Log("[GameInitializer] Database already initialized");
                return;
            }

            var dbManager = DatabaseManager.Instance;
            if (dbManager != null && dbManager.IsInitialized)
            {
                Debug.Log("[GameInitializer] Database initialized successfully");
            }
            else
            {
                Debug.LogWarning("[GameInitializer] Database initialization failed, some features may not work");
            }
        }

        private void InitializeNetwork()
        {
            if (NetworkManager.Instance != null)
            {
                Debug.Log("[GameInitializer] Network manager ready");
            }
        }

        private void InitializeUI()
        {
            if (UI.UIManager.Instance != null)
            {
                Debug.Log("[GameInitializer] UI manager ready");
            }
        }
    }
}
