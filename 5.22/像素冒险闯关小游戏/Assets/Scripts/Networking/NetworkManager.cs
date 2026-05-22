using UnityEngine;
using PixelAdventure.Core;

namespace PixelAdventure.Networking
{
    public class NetworkManager : Singleton<NetworkManager>
    {
        [Header("Photon设置")]
        [SerializeField] private string photonAppId = "YOUR_PHOTON_APP_ID";
        [SerializeField] private string gameVersion = "1.0";
        [SerializeField] private bool autoConnect = true;

        public bool IsConnected { get; private set; }
        public bool IsInRoom { get; private set; }
        public string CurrentRoomName { get; private set; }

        protected override void Awake()
        {
            base.Awake();
        }

        private void Start()
        {
            if (autoConnect)
            {
                ConnectToServer();
            }
        }

        public void ConnectToServer()
        {
            if (IsConnected)
            {
                Debug.Log("[NetworkManager] 已经连接到服务器");
                return;
            }

            Debug.Log("[NetworkManager] 正在连接到Photon服务器...");
            InitializePhoton();
        }

        private void InitializePhoton()
        {
            Debug.Log($"[NetworkManager] Photon初始化 - 版本: {gameVersion}");
            Debug.Log("[NetworkManager] 提示: 请导入Photon PUN 2包并配置AppId");
            IsConnected = true;
        }

        public void Disconnect()
        {
            if (!IsConnected) return;

            Debug.Log("[NetworkManager] 断开连接");
            IsConnected = false;
            IsInRoom = false;
            CurrentRoomName = string.Empty;
        }

        public void CreateOrJoinRoom(string roomName, int maxPlayers = 4)
        {
            if (!IsConnected)
            {
                Debug.LogWarning("[NetworkManager] 未连接到服务器，无法加入房间");
                return;
            }

            Debug.Log($"[NetworkManager] 创建/加入房间: {roomName}, 最大玩家数: {maxPlayers}");
            IsInRoom = true;
            CurrentRoomName = roomName;
        }

        public void LeaveRoom()
        {
            if (!IsInRoom) return;

            Debug.Log($"[NetworkManager] 离开房间: {CurrentRoomName}");
            IsInRoom = false;
            CurrentRoomName = string.Empty;
        }

        public void SetPlayerName(string playerName)
        {
            Debug.Log($"[NetworkManager] 设置玩家名称: {playerName}");
            PlayerPrefs.SetString("PlayerName", playerName);
        }

        public string GetPlayerName()
        {
            return PlayerPrefs.GetString("PlayerName", "Player" + Random.Range(1000, 9999));
        }

        private void OnApplicationQuit()
        {
            Disconnect();
        }
    }
}
