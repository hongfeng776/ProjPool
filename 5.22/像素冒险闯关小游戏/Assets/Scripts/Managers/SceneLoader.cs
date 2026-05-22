using UnityEngine;
using UnityEngine.SceneManagement;
using System.Collections;
using PixelAdventure.Core;
using PixelAdventure.Data;
using PixelAdventure.UI;

namespace PixelAdventure.Managers
{
    public class SceneLoader : Singleton<SceneLoader>
    {
        public const string BOOT_SCENE = "Boot";
        public const string MAIN_MENU_SCENE = "MainMenu";
        public const string GAME_SCENE = "GameScene";
        public const string LEVEL_SELECT_SCENE = "LevelSelect";

        [Header("加载设置")]
        [SerializeField] private float minimumLoadTime = 0.8f;
        [SerializeField] private bool showLoadingScreen = true;
        [SerializeField] private bool useFadeTransition = true;
        [SerializeField] private float fadeDuration = 0.3f;

        [Header("性能设置")]
        [SerializeField] private bool gcCollectOnLoad = true;
        [SerializeField] private bool unloadUnusedAssets = true;

        [Header("引用")]
        [SerializeField] private LoadingScreen loadingScreenPrefab;
        [SerializeField] private FadeTransition fadeTransitionPrefab;

        private LoadingScreen _loadingScreen;
        private FadeTransition _fadeTransition;
        private System.Action _onLoadComplete;

        public bool IsLoading { get; private set; }
        public float LoadProgress { get; private set; }
        public string CurrentSceneName { get; private set; }
        public string TargetSceneName { get; private set; }

        protected override void Awake()
        {
            base.Awake();
            CurrentSceneName = SceneManager.GetActiveScene().name;
            InitializeTransitionUI();
        }

        private void Start()
        {
            SceneManager.sceneLoaded += OnSceneLoaded;
            SceneManager.sceneUnloaded += OnSceneUnloaded;
        }

        private void InitializeTransitionUI()
        {
            if (useFadeTransition && fadeTransitionPrefab != null)
            {
                _fadeTransition = Instantiate(fadeTransitionPrefab, transform);
                _fadeTransition.transform.SetAsLastSibling();
            }
            else if (useFadeTransition)
            {
                GameObject fadeObj = new GameObject("FadeTransition");
                fadeObj.transform.SetParent(transform);
                _fadeTransition = fadeObj.AddComponent<FadeTransition>();
                _fadeTransition.Initialize();
            }

            if (showLoadingScreen && loadingScreenPrefab != null)
            {
                _loadingScreen = Instantiate(loadingScreenPrefab, transform);
                _loadingScreen.HideImmediate();
            }
        }

        public void LoadScene(string sceneName, System.Action onComplete = null)
        {
            if (IsLoading)
            {
                Debug.LogWarning("[SceneLoader] 正在加载场景中，请稍候");
                return;
            }

            if (!SceneExists(sceneName))
            {
                Debug.LogError($"[SceneLoader] 场景不存在: {sceneName}");
                return;
            }

            _onLoadComplete = onComplete;
            StartCoroutine(LoadSceneSequence(sceneName));
        }

        public void LoadMainMenu(System.Action onComplete = null)
        {
            LoadScene(MAIN_MENU_SCENE, onComplete);
        }

        public void LoadGameScene(System.Action onComplete = null)
        {
            LoadScene(GAME_SCENE, onComplete);
        }

        public void LoadLevelSelect(System.Action onComplete = null)
        {
            LoadScene(LEVEL_SELECT_SCENE, onComplete);
        }

        public void ReloadCurrentScene(System.Action onComplete = null)
        {
            LoadScene(CurrentSceneName, onComplete);
        }

        private IEnumerator LoadSceneSequence(string sceneName)
        {
            IsLoading = true;
            LoadProgress = 0f;
            TargetSceneName = sceneName;

            Debug.Log($"[SceneLoader] 开始加载场景: {sceneName}");

            if (SaveManager.Instance.HasActiveSave)
            {
                SaveManager.Instance.UpdateCurrentScene(sceneName);
            }

            if (useFadeTransition && _fadeTransition != null)
            {
                yield return _fadeTransition.FadeOut(fadeDuration);
            }

            if (showLoadingScreen && _loadingScreen != null)
            {
                _loadingScreen.Show();
            }

            if (useFadeTransition && _fadeTransition != null)
            {
                yield return _fadeTransition.FadeIn(fadeDuration);
            }

            yield return LoadSceneAsync(sceneName);

            if (gcCollectOnLoad)
            {
                System.GC.Collect();
            }

            if (unloadUnusedAssets)
            {
                yield return Resources.UnloadUnusedAssets();
            }

            if (showLoadingScreen && _loadingScreen != null)
            {
                _loadingScreen.Hide();
            }

            if (useFadeTransition && _fadeTransition != null)
            {
                yield return _fadeTransition.FadeOut(fadeDuration);
            }

            IsLoading = false;
            LoadProgress = 1f;

            _onLoadComplete?.Invoke();
            _onLoadComplete = null;

            Debug.Log($"[SceneLoader] 场景加载完成: {sceneName}");
        }

        private IEnumerator LoadSceneAsync(string sceneName)
        {
            AsyncOperation asyncOperation = SceneManager.LoadSceneAsync(sceneName);
            asyncOperation.allowSceneActivation = false;

            float timer = 0f;
            while (!asyncOperation.isDone)
            {
                timer += Time.unscaledDeltaTime;
                LoadProgress = Mathf.Clamp01(asyncOperation.progress / 0.9f);

                if (_loadingScreen != null)
                {
                    _loadingScreen.UpdateProgress(LoadProgress);
                }

                if (asyncOperation.progress >= 0.9f && timer >= minimumLoadTime)
                {
                    asyncOperation.allowSceneActivation = true;
                }

                yield return null;
            }

            CurrentSceneName = sceneName;
            TargetSceneName = null;
        }

        private void OnSceneLoaded(Scene scene, LoadSceneMode mode)
        {
            CurrentSceneName = scene.name;
            Debug.Log($"[SceneLoader] 场景已激活: {scene.name}");

            StartCoroutine(PreloadCommonAssets());
        }

        private void OnSceneUnloaded(Scene scene)
        {
            Debug.Log($"[SceneLoader] 场景已卸载: {scene.name}");
        }

        private IEnumerator PreloadCommonAssets()
        {
            yield return null;

            if (gcCollectOnLoad)
            {
                System.GC.Collect();
            }
        }

        public void PreloadSceneAsync(string sceneName)
        {
            StartCoroutine(PreloadSceneCoroutine(sceneName));
        }

        private IEnumerator PreloadSceneCoroutine(string sceneName)
        {
            if (!SceneExists(sceneName))
            {
                yield break;
            }

            AsyncOperation asyncOperation = SceneManager.LoadSceneAsync(sceneName, LoadSceneMode.Additive);
            asyncOperation.allowSceneActivation = false;

            while (!asyncOperation.isDone)
            {
                yield return null;
            }

            Debug.Log($"[SceneLoader] 场景预加载完成: {sceneName}");
        }

        private bool SceneExists(string sceneName)
        {
            for (int i = 0; i < SceneManager.sceneCountInBuildSettings; i++)
            {
                string path = SceneUtility.GetScenePathByBuildIndex(i);
                string name = System.IO.Path.GetFileNameWithoutExtension(path);
                if (name == sceneName)
                {
                    return true;
                }
            }
            return false;
        }

        private void OnDestroy()
        {
            SceneManager.sceneLoaded -= OnSceneLoaded;
            SceneManager.sceneUnloaded -= OnSceneUnloaded;
        }
    }
}
