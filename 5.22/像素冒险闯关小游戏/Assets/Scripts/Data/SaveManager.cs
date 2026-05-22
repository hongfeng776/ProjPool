using UnityEngine;
using System.Collections.Generic;
using PixelAdventure.Core;

namespace PixelAdventure.Data
{
    public class SaveManager : Singleton<SaveManager>
    {
        private IDataService _dataService;
        private SaveData _currentSave;
        private SettingsData _settings;

        public SaveData CurrentSave => _currentSave;
        public SettingsData Settings => _settings;
        public bool HasActiveSave => _currentSave != null;

        protected override void Awake()
        {
            base.Awake();
            _dataService = SQLiteDataService.Instance;
        }

        private void Start()
        {
            _dataService.Initialize();
            LoadSettings();
        }

        public void NewGame(int saveSlot, string playerName)
        {
            _currentSave = new SaveData(playerName)
            {
                SaveId = saveSlot
            };
            
            Debug.Log($"[SaveManager] 新游戏 - 存档位: {saveSlot}, 玩家: {playerName}");
        }

        public void LoadGame(int saveSlot)
        {
            _currentSave = _dataService.GetSaveData(saveSlot);
            
            if (_currentSave != null)
            {
                Debug.Log($"[SaveManager] 加载存档成功 - 存档位: {saveSlot}, 关卡: {_currentSave.Level}");
            }
            else
            {
                Debug.LogWarning($"[SaveManager] 存档不存在: {saveSlot}");
            }
        }

        public void SaveGame()
        {
            if (_currentSave == null)
            {
                Debug.LogWarning("[SaveManager] 没有活动存档可保存");
                return;
            }

            _dataService.SaveGame(_currentSave);
        }

        public void DeleteSave(int saveSlot)
        {
            _dataService.DeleteSave(saveSlot);
            
            if (_currentSave != null && _currentSave.SaveId == saveSlot)
            {
                _currentSave = null;
            }
        }

        public List<SaveData> GetAllSaves()
        {
            return _dataService.GetAllSaveData();
        }

        public bool HasSave(int saveSlot)
        {
            return _dataService.HasSaveData(saveSlot);
        }

        public void LoadSettings()
        {
            _settings = _dataService.GetSettings();
            ApplySettings();
        }

        public void SaveSettings()
        {
            if (_settings != null)
            {
                _dataService.SaveSettings(_settings);
            }
        }

        private void ApplySettings()
        {
            if (_settings == null) return;

            QualitySettings.SetQualityLevel(_settings.QualityLevel);
            Screen.fullScreen = _settings.FullScreen;
            
            if (_settings.ResolutionWidth > 0 && _settings.ResolutionHeight > 0)
            {
                Screen.SetResolution(_settings.ResolutionWidth, _settings.ResolutionHeight, _settings.FullScreen);
            }
        }

        public void UpdateScore(int score)
        {
            if (_currentSave != null)
            {
                _currentSave.Score += score;
            }
        }

        public void UpdateCoins(int coins)
        {
            if (_currentSave != null)
            {
                _currentSave.Coins += coins;
            }
        }

        public void UpdateLevel(int level)
        {
            if (_currentSave != null)
            {
                _currentSave.Level = level;
            }
        }

        public void UpdateCurrentScene(string sceneName)
        {
            if (_currentSave != null)
            {
                _currentSave.CurrentScene = sceneName;
            }
        }
    }
}
