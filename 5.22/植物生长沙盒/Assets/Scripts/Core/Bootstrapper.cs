using UnityEngine;

namespace PlantSandbox.Core
{
    public class Bootstrapper : MonoBehaviour
    {
        [SerializeField] private GameManager gameManagerPrefab;
        [SerializeField] private SceneLoader sceneLoaderPrefab;

        private static bool isBootstrapped = false;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        private static void InitializeBeforeSceneLoad()
        {
            if (isBootstrapped) return;

            GameObject bootstrapperObject = new GameObject("Bootstrapper");
            Bootstrapper bootstrapper = bootstrapperObject.AddComponent<Bootstrapper>();
            
            DontDestroyOnLoad(bootstrapperObject);
            bootstrapper.InitializeManagers();
            
            isBootstrapped = true;
        }

        private void InitializeManagers()
        {
            if (GameManager.Instance == null)
            {
                if (gameManagerPrefab != null)
                {
                    Instantiate(gameManagerPrefab);
                }
                else
                {
                    GameObject gameManagerObject = new GameObject("GameManager");
                    gameManagerObject.AddComponent<GameManager>();
                    DontDestroyOnLoad(gameManagerObject);
                }
            }

            if (SceneLoader.Instance == null)
            {
                if (sceneLoaderPrefab != null)
                {
                    Instantiate(sceneLoaderPrefab);
                }
                else
                {
                    GameObject sceneLoaderObject = new GameObject("SceneLoader");
                    sceneLoaderObject.AddComponent<SceneLoader>();
                    DontDestroyOnLoad(sceneLoaderObject);
                }
            }
        }
    }
}
