using UnityEngine;
using UnityEngine.UI;
using TMPro;
using OfficeFishing.Database;

namespace OfficeFishing.UI
{
    public class SettingsController : MonoBehaviour
    {
        [Header("UI Elements")]
        public Slider musicVolumeSlider;
        public Slider sfxVolumeSlider;
        public TMP_Dropdown qualityDropdown;
        public Toggle fullscreenToggle;
        public TMP_InputField playerNameInput;
        public Button backButton;
        public Button saveButton;

        private SettingsRepository _settingsRepository;

        private const string MUSIC_VOLUME_KEY = "MusicVolume";
        private const string SFX_VOLUME_KEY = "SFXVolume";
        private const string QUALITY_KEY = "Quality";
        private const string FULLSCREEN_KEY = "Fullscreen";
        private const string PLAYER_NAME_KEY = "PlayerName";

        private void Start()
        {
            _settingsRepository = new SettingsRepository();

            LoadSettings();

            if (backButton != null)
                backButton.onClick.AddListener(OnBackClicked);

            if (saveButton != null)
                saveButton.onClick.AddListener(OnSaveClicked);

            if (musicVolumeSlider != null)
                musicVolumeSlider.onValueChanged.AddListener(OnMusicVolumeChanged);

            if (sfxVolumeSlider != null)
                sfxVolumeSlider.onValueChanged.AddListener(OnSFXVolumeChanged);

            if (qualityDropdown != null)
                qualityDropdown.onValueChanged.AddListener(OnQualityChanged);

            if (fullscreenToggle != null)
                fullscreenToggle.onValueChanged.AddListener(OnFullscreenChanged);
        }

        private void OnDestroy()
        {
            if (backButton != null)
                backButton.onClick.RemoveListener(OnBackClicked);

            if (saveButton != null)
                saveButton.onClick.RemoveListener(OnSaveClicked);

            if (musicVolumeSlider != null)
                musicVolumeSlider.onValueChanged.RemoveListener(OnMusicVolumeChanged);

            if (sfxVolumeSlider != null)
                sfxVolumeSlider.onValueChanged.RemoveListener(OnSFXVolumeChanged);

            if (qualityDropdown != null)
                qualityDropdown.onValueChanged.RemoveListener(OnQualityChanged);

            if (fullscreenToggle != null)
                fullscreenToggle.onValueChanged.RemoveListener(OnFullscreenChanged);
        }

        private void LoadSettings()
        {
            if (musicVolumeSlider != null)
                musicVolumeSlider.value = _settingsRepository.GetFloatSetting(MUSIC_VOLUME_KEY, 0.8f);

            if (sfxVolumeSlider != null)
                sfxVolumeSlider.value = _settingsRepository.GetFloatSetting(SFX_VOLUME_KEY, 1.0f);

            if (qualityDropdown != null)
                qualityDropdown.value = _settingsRepository.GetIntSetting(QUALITY_KEY, 2);

            if (fullscreenToggle != null)
                fullscreenToggle.isOn = _settingsRepository.GetBoolSetting(FULLSCREEN_KEY, true);

            if (playerNameInput != null)
                playerNameInput.text = _settingsRepository.GetSetting(PLAYER_NAME_KEY, "Player");
        }

        private void OnBackClicked()
        {
            gameObject.SetActive(false);
            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowMainMenu();
            }
        }

        private void OnSaveClicked()
        {
            SaveSettings();
        }

        private void SaveSettings()
        {
            if (musicVolumeSlider != null)
                _settingsRepository.SetFloatSetting(MUSIC_VOLUME_KEY, musicVolumeSlider.value, "Music volume");

            if (sfxVolumeSlider != null)
                _settingsRepository.SetFloatSetting(SFX_VOLUME_KEY, sfxVolumeSlider.value, "SFX volume");

            if (qualityDropdown != null)
                _settingsRepository.SetIntSetting(QUALITY_KEY, qualityDropdown.value, "Quality level");

            if (fullscreenToggle != null)
                _settingsRepository.SetBoolSetting(FULLSCREEN_KEY, fullscreenToggle.isOn, "Fullscreen mode");

            if (playerNameInput != null && !string.IsNullOrEmpty(playerNameInput.text))
                _settingsRepository.SetSetting(PLAYER_NAME_KEY, playerNameInput.text, "Player name");

            Debug.Log("[Settings] Settings saved");
        }

        private void OnMusicVolumeChanged(float value)
        {
        }

        private void OnSFXVolumeChanged(float value)
        {
        }

        private void OnQualityChanged(int index)
        {
        }

        private void OnFullscreenChanged(bool isFullscreen)
        {
            Screen.fullScreen = isFullscreen;
        }
    }
}
