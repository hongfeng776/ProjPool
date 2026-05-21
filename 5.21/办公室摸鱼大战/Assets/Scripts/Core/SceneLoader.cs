using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace OfficeFishing.Core
{
    public class SceneLoader : Singleton<SceneLoader>
    {
        public const string MAIN_MENU_SCENE = "MainMenu";
        public const string GAME_SCENE = "GameScene";
        public const string LOADING_SCENE = "LoadingScene";

        public float LoadingProgress { get; private set; }
        public bool IsLoading { get; private set; }

        public System.Action<float> OnLoadingProgress;
        public System.Action<string> OnSceneLoaded;

        public void LoadMainMenu()
        {
            LoadScene(MAIN_MENU_SCENE);
        }

        public void LoadGameScene()
        {
            LoadScene(GAME_SCENE);
        }

        public void LoadScene(string sceneName)
        {
            if (IsLoading)
            {
                Debug.LogWarning("[SceneLoader] Already loading a scene");
                return;
            }

            StartCoroutine(LoadSceneAsync(sceneName));
        }

        public void LoadSceneWithLoading(string sceneName)
        {
            if (IsLoading) return;

            StartCoroutine(LoadSceneWithLoadingAsync(sceneName));
        }

        private IEnumerator LoadSceneAsync(string sceneName)
        {
            IsLoading = true;
            LoadingProgress = 0f;

            AsyncOperation asyncLoad = SceneManager.LoadSceneAsync(sceneName);

            while (!asyncLoad.isDone)
            {
                LoadingProgress = Mathf.Clamp01(asyncLoad.progress / 0.9f);
                OnLoadingProgress?.Invoke(LoadingProgress);
                yield return null;
            }

            LoadingProgress = 1f;
            OnLoadingProgress?.Invoke(LoadingProgress);
            OnSceneLoaded?.Invoke(sceneName);
            IsLoading = false;
        }

        private IEnumerator LoadSceneWithLoadingAsync(string sceneName)
        {
            IsLoading = true;
            LoadingProgress = 0f;

            AsyncOperation loadingSceneLoad = SceneManager.LoadSceneAsync(LOADING_SCENE);
            while (!loadingSceneLoad.isDone)
            {
                yield return null;
            }

            AsyncOperation asyncLoad = SceneManager.LoadSceneAsync(sceneName);
            asyncLoad.allowSceneActivation = false;

            while (asyncLoad.progress < 0.9f)
            {
                LoadingProgress = asyncLoad.progress / 0.9f;
                OnLoadingProgress?.Invoke(LoadingProgress);
                yield return null;
            }

            asyncLoad.allowSceneActivation = true;

            while (!asyncLoad.isDone)
            {
                LoadingProgress = 1f;
                OnLoadingProgress?.Invoke(LoadingProgress);
                yield return null;
            }

            OnSceneLoaded?.Invoke(sceneName);
            IsLoading = false;
        }

        public void ReloadCurrentScene()
        {
            string currentScene = SceneManager.GetActiveScene().name;
            LoadScene(currentScene);
        }
    }
}
