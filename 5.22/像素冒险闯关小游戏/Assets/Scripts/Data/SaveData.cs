using System;

namespace PixelAdventure.Data
{
    [Serializable]
    public class SaveData
    {
        public int SaveId { get; set; }
        public string PlayerName { get; set; }
        public int Level { get; set; }
        public int Score { get; set; }
        public int Coins { get; set; }
        public float PlayTime { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string CurrentScene { get; set; }

        public SaveData()
        {
            SaveId = 0;
            PlayerName = "Player";
            Level = 1;
            Score = 0;
            Coins = 0;
            PlayTime = 0f;
            CreatedAt = DateTime.Now;
            UpdatedAt = DateTime.Now;
            CurrentScene = "MainMenu";
        }

        public SaveData(string playerName)
        {
            SaveId = 0;
            PlayerName = playerName;
            Level = 1;
            Score = 0;
            Coins = 0;
            PlayTime = 0f;
            CreatedAt = DateTime.Now;
            UpdatedAt = DateTime.Now;
            CurrentScene = "MainMenu";
        }
    }
}
