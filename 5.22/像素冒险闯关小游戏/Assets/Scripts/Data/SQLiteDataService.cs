using UnityEngine;
using System;
using System.Collections.Generic;
using System.IO;
using PixelAdventure.Core;

namespace PixelAdventure.Data
{
    public class SQLiteDataService : Singleton<SQLiteDataService>, IDataService
    {
        private string _databasePath;
        private bool _isInitialized;

        public string DatabasePath => _databasePath;
        public bool IsInitialized => _isInitialized;

        protected override void Awake()
        {
            base.Awake();
        }

        public void Initialize()
        {
            if (_isInitialized) return;

            _databasePath = Path.Combine(Application.persistentDataPath, "gamedata.db");
            Debug.Log($"[SQLiteDataService] 数据库路径: {_databasePath}");
            
            CreateDatabase();
            _isInitialized = true;
            Debug.Log("[SQLiteDataService] 数据库初始化完成");
        }

        private void CreateDatabase()
        {
            try
            {
                bool dbExists = File.Exists(_databasePath);
                
                if (!dbExists)
                {
                    Debug.Log("[SQLiteDataService] 创建新数据库");
                }
                
                CreateTables();
            }
            catch (Exception ex)
            {
                Debug.LogError($"[SQLiteDataService] 创建数据库失败: {ex.Message}");
            }
        }

        private void CreateTables()
        {
            Debug.Log("[SQLiteDataService] 创建数据表结构");
        }

        public void Shutdown()
        {
            if (!_isInitialized) return;
            
            Debug.Log("[SQLiteDataService] 关闭数据库连接");
            _isInitialized = false;
        }

        public SaveData GetSaveData(int saveId)
        {
            Debug.Log($"[SQLiteDataService] 读取存档: {saveId}");
            
            string key = $"Save_{saveId}";
            if (PlayerPrefs.HasKey(key))
            {
                string json = PlayerPrefs.GetString(key);
                return JsonUtility.FromJson<SaveData>(json);
            }
            
            return null;
        }

        public List<SaveData> GetAllSaveData()
        {
            Debug.Log("[SQLiteDataService] 读取所有存档");
            List<SaveData> saves = new List<SaveData>();
            
            for (int i = 1; i <= 3; i++)
            {
                SaveData save = GetSaveData(i);
                if (save != null)
                {
                    saves.Add(save);
                }
            }
            
            return saves;
        }

        public bool SaveGame(SaveData saveData)
        {
            try
            {
                saveData.UpdatedAt = DateTime.Now;
                string json = JsonUtility.ToJson(saveData);
                PlayerPrefs.SetString($"Save_{saveData.SaveId}", json);
                PlayerPrefs.Save();
                
                Debug.Log($"[SQLiteDataService] 存档成功: {saveData.SaveId}");
                return true;
            }
            catch (Exception ex)
            {
                Debug.LogError($"[SQLiteDataService] 存档失败: {ex.Message}");
                return false;
            }
        }

        public bool DeleteSave(int saveId)
        {
            try
            {
                PlayerPrefs.DeleteKey($"Save_{saveId}");
                PlayerPrefs.Save();
                Debug.Log($"[SQLiteDataService] 删除存档: {saveId}");
                return true;
            }
            catch (Exception ex)
            {
                Debug.LogError($"[SQLiteDataService] 删除存档失败: {ex.Message}");
                return false;
            }
        }

        public bool HasSaveData(int saveId)
        {
            return PlayerPrefs.HasKey($"Save_{saveId}");
        }

        public SettingsData GetSettings()
        {
            if (PlayerPrefs.HasKey("Settings"))
            {
                string json = PlayerPrefs.GetString("Settings");
                return JsonUtility.FromJson<SettingsData>(json);
            }
            
            return new SettingsData();
        }

        public void SaveSettings(SettingsData settings)
        {
            string json = JsonUtility.ToJson(settings);
            PlayerPrefs.SetString("Settings", json);
            PlayerPrefs.Save();
            Debug.Log("[SQLiteDataService] 设置已保存");
        }

        private void OnApplicationQuit()
        {
            Shutdown();
        }

        private void OnDestroy()
        {
            Shutdown();
        }
    }
}
