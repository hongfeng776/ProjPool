using UnityEngine;
using UnityEngine.SceneManagement;

namespace PlantSandbox.Core
{
    public class SceneLoader : MonoBehaviour
    {
        public static SceneLoader Instance { get; private set; }

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
            }
        }

        public void LoadScene(string sceneName)
        {
            SceneManager.LoadScene(sceneName);
        }

        public void LoadSceneAsync(string sceneName)
        {
            StartCoroutine(LoadSceneAsyncCoroutine(sceneName));
        }

        private System.Collections.IEnumerator LoadSceneAsyncCoroutine(string sceneName)
        {
            AsyncOperation asyncLoad = SceneManager.LoadSceneAsync(sceneName);
            
            while (!asyncLoad.isDone)
            {
                yield return null;
            }
        }

        public void ReloadCurrentScene()
        {
            SceneManager.LoadScene(SceneManager.GetActiveScene().name);
        }

        public void QuitGame()
        {
            Application.Quit();
        }
    }
}
