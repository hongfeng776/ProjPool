using UnityEngine;

namespace PixelAdventure.Networking
{
    public class PlayerData
    {
        public string PlayerId { get; set; }
        public string PlayerName { get; set; }
        public int ActorNumber { get; set; }
        public bool IsLocal { get; set; }
        public bool IsMasterClient { get; set; }

        public PlayerData()
        {
            PlayerId = System.Guid.NewGuid().ToString();
            PlayerName = "Player";
            ActorNumber = -1;
            IsLocal = true;
            IsMasterClient = false;
        }

        public PlayerData(string playerName, bool isLocal = false)
        {
            PlayerId = System.Guid.NewGuid().ToString();
            PlayerName = playerName;
            ActorNumber = -1;
            IsLocal = isLocal;
            IsMasterClient = false;
        }
    }
}
