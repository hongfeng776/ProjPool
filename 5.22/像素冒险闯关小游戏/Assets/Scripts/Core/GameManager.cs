using UnityEngine;

namespace PixelAdventure.Core
{
    public class GameManager : Singleton<GameManager>
    {
        [Header("游戏设置")]
        [SerializeField] private string gameVersion = "1.0.0";
        [SerializeField] private int targetFrameRate = 60;

        public string GameVersion => gameVersion;
        public bool IsGamePaused { get; private set; }

        protected override void Awake()
        {
            base.Awake();
            InitializeGameSettings();
        }

        private void Start()
        {
            Debug.Log($"[GameManager] 像素冒险游戏启动 - 版本: {gameVersion}");
        }

        private void InitializeGameSettings()
        {
            Application.targetFrameRate = targetFrameRate;
            QualitySettings.vSyncCount = 1;
            IsGamePaused = false;
        }

        public void PauseGame()
        {
            IsGamePaused = true;
            Time.timeScale = 0f;
        }

        public void ResumeGame()
        {
            IsGamePaused = false;
            Time.timeScale = 1f;
        }

        public void QuitGame()
        {
            Debug.Log("[GameManager] 退出游戏");
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
            Application.Quit();
#endif
        }
    }
}
