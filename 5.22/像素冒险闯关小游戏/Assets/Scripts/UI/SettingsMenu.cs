using UnityEngine;
using UnityEngine.UI;
using PixelAdventure.Data;
using PixelAdventure.Managers;

namespace PixelAdventure.UI
{
    public class SettingsMenu : MonoBehaviour
    {
        [Header("音量设置")]
        [SerializeField] private Slider musicVolumeSlider;
        [SerializeField] private Slider sfxVolumeSlider;

        [Header("画面设置")]
        [SerializeField] private Dropdown qualityDropdown;
        [SerializeField] private Toggle fullScreenToggle;

        [Header("语言设置")]
        [SerializeField] private Dropdown languageDropdown;

        [Header("按钮")]
        [SerializeField] private Button applyButton;
        [SerializeField] private Button backButton;
        [SerializeField] private Button resetButton;

        private SettingsData _tempSettings;

        private void Start()
        {
            InitializeUI();
            LoadCurrentSettings();
            SetupEventListeners();
        }

        private void InitializeUI()
        {
            if (qualityDropdown != null)
            {
                qualityDropdown.ClearOptions();
                qualityDropdown.AddOptions(new System.Collections.Generic.List<string>
                {
                    "低",
                    "中",
                    "高",
                    "极高"
                });
            }

            if (languageDropdown != null)
            {
                languageDropdown.ClearOptions();
                languageDropdown.AddOptions(new System.Collections.Generic.List<string>
                {
                    "简体中文",
                    "English"
                });
            }
        }

        private void LoadCurrentSettings()
        {
            _tempSettings = new SettingsData();

            if (SaveManager.Instance.Settings != null)
            {
                _tempSettings.MusicVolume = SaveManager.Instance.Settings.MusicVolume;
                _tempSettings.SfxVolume = SaveManager.Instance.Settings.SfxVolume;
                _tempSettings.QualityLevel = SaveManager.Instance.Settings.QualityLevel;
                _tempSettings.FullScreen = SaveManager.Instance.Settings.FullScreen;
                _tempSettings.Language = SaveManager.Instance.Settings.Language;
            }

            UpdateUIFromSettings();
        }

        private void UpdateUIFromSettings()
        {
            if (musicVolumeSlider != null)
            {
                musicVolumeSlider.value = _tempSettings.MusicVolume;
            }

            if (sfxVolumeSlider != null)
            {
                sfxVolumeSlider.value = _tempSettings.SfxVolume;
            }

            if (qualityDropdown != null)
            {
                qualityDropdown.value = _tempSettings.QualityLevel;
            }

            if (fullScreenToggle != null)
            {
                fullScreenToggle.isOn = _tempSettings.FullScreen;
            }

            if (languageDropdown != null)
            {
                languageDropdown.value = _tempSettings.Language == "zh-CN" ? 0 : 1;
            }
        }

        private void SetupEventListeners()
        {
            if (musicVolumeSlider != null)
            {
                musicVolumeSlider.onValueChanged.AddListener(OnMusicVolumeChanged);
            }

            if (sfxVolumeSlider != null)
            {
                sfxVolumeSlider.onValueChanged.AddListener(OnSfxVolumeChanged);
            }

            if (qualityDropdown != null)
            {
                qualityDropdown.onValueChanged.AddListener(OnQualityChanged);
            }

            if (fullScreenToggle != null)
            {
                fullScreenToggle.onValueChanged.AddListener(OnFullScreenChanged);
            }

            if (languageDropdown != null)
            {
                languageDropdown.onValueChanged.AddListener(OnLanguageChanged);
            }

            if (applyButton != null)
            {
                applyButton.onClick.AddListener(OnApplyClicked);
            }

            if (backButton != null)
            {
                backButton.onClick.AddListener(OnBackClicked);
            }

            if (resetButton != null)
            {
                resetButton.onClick.AddListener(OnResetClicked);
            }
        }

        private void OnMusicVolumeChanged(float value)
        {
            _tempSettings.MusicVolume = value;
        }

        private void OnSfxVolumeChanged(float value)
        {
            _tempSettings.SfxVolume = value;
        }

        private void OnQualityChanged(int value)
        {
            _tempSettings.QualityLevel = value;
        }

        private void OnFullScreenChanged(bool value)
        {
            _tempSettings.FullScreen = value;
        }

        private void OnLanguageChanged(int value)
        {
            _tempSettings.Language = value == 0 ? "zh-CN" : "en-US";
        }

        private void OnApplyClicked()
        {
            Debug.Log("[SettingsMenu] 应用设置");
            
            if (SaveManager.Instance.Settings != null)
            {
                SaveManager.Instance.Settings.MusicVolume = _tempSettings.MusicVolume;
                SaveManager.Instance.Settings.SfxVolume = _tempSettings.SfxVolume;
                SaveManager.Instance.Settings.QualityLevel = _tempSettings.QualityLevel;
                SaveManager.Instance.Settings.FullScreen = _tempSettings.FullScreen;
                SaveManager.Instance.Settings.Language = _tempSettings.Language;
                SaveManager.Instance.SaveSettings();
            }

            ApplySettings();
        }

        private void ApplySettings()
        {
            QualitySettings.SetQualityLevel(_tempSettings.QualityLevel);
            Screen.fullScreen = _tempSettings.FullScreen;
        }

        private void OnBackClicked()
        {
            Debug.Log("[SettingsMenu] 返回主菜单");
            gameObject.SetActive(false);
        }

        private void OnResetClicked()
        {
            Debug.Log("[SettingsMenu] 重置设置");
            _tempSettings = new SettingsData();
            UpdateUIFromSettings();
        }

        private void OnDestroy()
        {
            if (musicVolumeSlider != null)
            {
                musicVolumeSlider.onValueChanged.RemoveListener(OnMusicVolumeChanged);
            }

            if (sfxVolumeSlider != null)
            {
                sfxVolumeSlider.onValueChanged.RemoveListener(OnSfxVolumeChanged);
            }

            if (qualityDropdown != null)
            {
                qualityDropdown.onValueChanged.RemoveListener(OnQualityChanged);
            }

            if (fullScreenToggle != null)
            {
                fullScreenToggle.onValueChanged.RemoveListener(OnFullScreenChanged);
            }

            if (languageDropdown != null)
            {
                languageDropdown.onValueChanged.RemoveListener(OnLanguageChanged);
            }

            if (applyButton != null)
            {
                applyButton.onClick.RemoveListener(OnApplyClicked);
            }

            if (backButton != null)
            {
                backButton.onClick.RemoveListener(OnBackClicked);
            }

            if (resetButton != null)
            {
                resetButton.onClick.RemoveListener(OnResetClicked);
            }
        }
    }
}
