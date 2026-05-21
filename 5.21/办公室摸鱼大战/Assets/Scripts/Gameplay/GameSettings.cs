using UnityEngine;

namespace OfficeFishing.Gameplay
{
    public class GameSettings
    {
        public const string GAME_NAME = "办公室摸鱼大战";
        public const string GAME_VERSION = "0.1.0";

        public const float DEFAULT_MUSIC_VOLUME = 0.8f;
        public const float DEFAULT_SFX_VOLUME = 1.0f;

        public const int DEFAULT_MAX_PLAYERS = 4;
        public const float DEFAULT_GAME_TIME = 120f;

        public const int LEADERBOARD_TOP_COUNT = 10;

        public const string DEFAULT_ROOM_PREFIX = "OfficeFishing_";

        public const string DATABASE_NAME = "OfficeFishing.db";
        public const string DEFAULT_PLAYER_NAME = "摸鱼达人";

        public const string PHOTON_APP_ID = "YOUR_PHOTON_APP_ID_HERE";

        public const float UI_FADE_DURATION = 0.3f;
        public const float UI_BUTTON_DELAY = 0.1f;
    }
}
