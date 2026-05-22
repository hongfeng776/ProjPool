using UnityEngine;
using UnityEngine.UI;
using PixelAdventure.Core;
using PixelAdventure.Managers;
using PixelAdventure.Data;
using PixelAdventure.Networking;
using PixelAdventure.Levels;

namespace PixelAdventure.UI
{
    public class MainMenu : MonoBehaviour
    {
        [Header("按钮引用")]
        [SerializeField] private Button startGameButton;
        [SerializeField] private Button continueButton;
        [SerializeField] private Button levelSelectButton;
        [SerializeField] private Button settingsButton;
        [SerializeField] private Button multiplayerButton;
        [SerializeField] private Button quitButton;

        [Header("面板引用")]
        [SerializeField] private GameObject mainMenuPanel;
        [SerializeField] private GameObject saveSelectPanel;
        [SerializeField] private GameObject settingsPanel;
        [SerializeField] private GameObject levelSelectPanel;

        [Header("存档位按钮")]
        [SerializeField] private Button[] saveSlotButtons;

        private int _selectedSaveSlot = -1;

        private void Start()
        {
            InitializeButtons();
            UpdateSaveSlots();
            ShowMainMenu();
        }

        private void InitializeButtons()
        {
            if (startGameButton != null)
            {
                startGameButton.onClick.AddListener(OnStartGameClicked);
            }

            if (continueButton != null)
            {
                continueButton.onClick.AddListener(OnContinueClicked);
                continueButton.interactable = HasAnySave();
            }

            if (levelSelectButton != null)
            {
                levelSelectButton.onClick.AddListener(OnLevelSelectClicked);
            }

            if (settingsButton != null)
            {
                settingsButton.onClick.AddListener(OnSettingsClicked);
            }

            if (multiplayerButton != null)
            {
                multiplayerButton.onClick.AddListener(OnMultiplayerClicked);
            }

            if (quitButton != null)
            {
                quitButton.onClick.AddListener(OnQuitClicked);
            }

            for (int i = 0; i < saveSlotButtons.Length; i++)
            {
                int slotIndex = i + 1;
                if (saveSlotButtons[i] != null)
                {
                    saveSlotButtons[i].onClick.AddListener(() => OnSaveSlotClicked(slotIndex));
                }
            }
        }

        public void ShowMainMenu()
        {
            if (mainMenuPanel != null) mainMenuPanel.SetActive(true);
            if (saveSelectPanel != null) saveSelectPanel.SetActive(false);
            if (settingsPanel != null) settingsPanel.SetActive(false);
            if (levelSelectPanel != null) levelSelectPanel.SetActive(false);
        }

        private void OnLevelSelectClicked()
        {
            Debug.Log("[MainMenu] 关卡选择");
            SceneLoader.Instance.LoadLevelSelect();
        }

        private void OnStartGameClicked()
        {
            Debug.Log("[MainMenu] 开始新游戏");
            ShowSaveSelect();
        }

        private void OnContinueClicked()
        {
            Debug.Log("[MainMenu] 继续游戏");
            
            for (int i = 1; i <= 3; i++)
            {
                if (SaveManager.Instance.HasSave(i))
                {
                    SaveManager.Instance.LoadGame(i);
                    EnterGame();
                    return;
                }
            }
        }

        private void OnSettingsClicked()
        {
            Debug.Log("[MainMenu] 打开设置");
            if (mainMenuPanel != null) mainMenuPanel.SetActive(false);
            if (settingsPanel != null) settingsPanel.SetActive(true);
        }

        private void OnMultiplayerClicked()
        {
            Debug.Log("[MainMenu] 多人游戏");
            NetworkManager.Instance.ConnectToServer();
        }

        private void OnQuitClicked()
        {
            Debug.Log("[MainMenu] 退出游戏");
            GameManager.Instance.QuitGame();
        }

        private void ShowSaveSelect()
        {
            if (mainMenuPanel != null) mainMenuPanel.SetActive(false);
            if (saveSelectPanel != null) saveSelectPanel.SetActive(true);
            UpdateSaveSlots();
        }

        private void OnSaveSlotClicked(int slotIndex)
        {
            Debug.Log($"[MainMenu] 选择存档位: {slotIndex}");
            _selectedSaveSlot = slotIndex;

            if (SaveManager.Instance.HasSave(slotIndex))
            {
                SaveManager.Instance.LoadGame(slotIndex);
            }
            else
            {
                string playerName = "Player" + Random.Range(1000, 9999);
                SaveManager.Instance.NewGame(slotIndex, playerName);
                SaveManager.Instance.SaveGame();
            }

            EnterGame();
        }

        private void EnterGame()
        {
            SceneLoader.Instance.LoadGameScene();
        }

        private bool HasAnySave()
        {
            for (int i = 1; i <= 3; i++)
            {
                if (SaveManager.Instance.HasSave(i))
                {
                    return true;
                }
            }
            return false;
        }

        private void UpdateSaveSlots()
        {
            for (int i = 0; i < saveSlotButtons.Length; i++)
            {
                int slotIndex = i + 1;
                if (saveSlotButtons[i] != null)
                {
                    Text buttonText = saveSlotButtons[i].GetComponentInChildren<Text>();
                    if (SaveManager.Instance.HasSave(slotIndex))
                    {
                        SaveData save = SaveManager.Instance.GetAllSaves().Find(s => s.SaveId == slotIndex);
                        if (buttonText != null && save != null)
                        {
                            buttonText.text = $"存档 {slotIndex}\n{save.PlayerName}\n关卡 {save.Level}";
                        }
                    }
                    else
                    {
                        if (buttonText != null)
                        {
                            buttonText.text = $"存档 {slotIndex}\n空";
                        }
                    }
                }
            }
        }

        private void OnDestroy()
        {
            if (startGameButton != null)
            {
                startGameButton.onClick.RemoveListener(OnStartGameClicked);
            }

            if (continueButton != null)
            {
                continueButton.onClick.RemoveListener(OnContinueClicked);
            }

            if (levelSelectButton != null)
            {
                levelSelectButton.onClick.RemoveListener(OnLevelSelectClicked);
            }

            if (settingsButton != null)
            {
                settingsButton.onClick.RemoveListener(OnSettingsClicked);
            }

            if (multiplayerButton != null)
            {
                multiplayerButton.onClick.RemoveListener(OnMultiplayerClicked);
            }

            if (quitButton != null)
            {
                quitButton.onClick.RemoveListener(OnQuitClicked);
            }
        }
    }
}
