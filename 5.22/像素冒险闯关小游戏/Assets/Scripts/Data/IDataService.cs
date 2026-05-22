using System.Collections.Generic;

namespace PixelAdventure.Data
{
    public interface IDataService
    {
        void Initialize();
        void Shutdown();
        
        SaveData GetSaveData(int saveId);
        List<SaveData> GetAllSaveData();
        bool SaveGame(SaveData saveData);
        bool DeleteSave(int saveId);
        bool HasSaveData(int saveId);
        
        SettingsData GetSettings();
        void SaveSettings(SettingsData settings);
    }
}
