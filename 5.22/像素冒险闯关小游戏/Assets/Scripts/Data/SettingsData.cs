using System;

namespace PixelAdventure.Data
{
    [Serializable]
    public class SettingsData
    {
        public float MusicVolume { get; set; }
        public float SfxVolume { get; set; }
        public int QualityLevel { get; set; }
        public bool FullScreen { get; set; }
        public int ResolutionWidth { get; set; }
        public int ResolutionHeight { get; set; }
        public string Language { get; set; }

        public SettingsData()
        {
            MusicVolume = 0.8f;
            SfxVolume = 1.0f;
            QualityLevel = 2;
            FullScreen = true;
            ResolutionWidth = 1920;
            ResolutionHeight = 1080;
            Language = "zh-CN";
        }
    }
}
