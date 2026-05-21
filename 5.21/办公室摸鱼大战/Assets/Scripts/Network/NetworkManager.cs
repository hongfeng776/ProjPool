using UnityEngine;
using Photon.Pun;
using Photon.Realtime;
using OfficeFishing.Core;

namespace OfficeFishing.Network
{
    public class NetworkManager : SingletonPun<NetworkManager>
    {
        public bool IsConnected { get; private set; }
        public bool IsInRoom { get; private set; }
        public string CurrentRoomName { get; private set; }

        public System.Action<bool> OnConnected;
        public System.Action<string> OnDisconnected;
        public System.Action<bool, string> OnJoinRoom;
        public System.Action OnLeftRoom;

        private TypedLobby _defaultLobby;

        protected override void Awake()
        {
            base.Awake();
            _defaultLobby = new TypedLobby("DefaultLobby", LobbyType.Default);
        }

        public void ConnectToServer()
        {
            if (IsConnected)
            {
                Debug.Log("[NetworkManager] Already connected to server");
                OnConnected?.Invoke(true);
                return;
            }

            PhotonNetwork.ConnectUsingSettings();
            Debug.Log("[NetworkManager] Connecting to Photon server...");
        }

        public void Disconnect()
        {
            if (PhotonNetwork.IsConnected)
            {
                PhotonNetwork.Disconnect();
                Debug.Log("[NetworkManager] Disconnecting from server...");
            }
        }

        public void CreateRoom(string roomName, int maxPlayers = 4)
        {
            if (!IsConnected)
            {
                Debug.LogError("[NetworkManager] Not connected to server");
                return;
            }

            RoomOptions roomOptions = new RoomOptions
            {
                MaxPlayers = (byte)maxPlayers,
                IsOpen = true,
                IsVisible = true
            };

            PhotonNetwork.CreateRoom(roomName, roomOptions, _defaultLobby);
        }

        public void JoinRoom(string roomName)
        {
            if (!IsConnected)
            {
                Debug.LogError("[NetworkManager] Not connected to server");
                return;
            }

            PhotonNetwork.JoinRoom(roomName);
        }

        public void JoinRandomRoom()
        {
            if (!IsConnected)
            {
                Debug.LogError("[NetworkManager] Not connected to server");
                return;
            }

            PhotonNetwork.JoinRandomRoom();
        }

        public void CreateOrJoinRoom(string roomName, int maxPlayers = 4)
        {
            if (!IsConnected)
            {
                Debug.LogError("[NetworkManager] Not connected to server");
                return;
            }

            RoomOptions roomOptions = new RoomOptions
            {
                MaxPlayers = (byte)maxPlayers,
                IsOpen = true,
                IsVisible = true
            };

            PhotonNetwork.JoinOrCreateRoom(roomName, roomOptions, _defaultLobby);
        }

        public void LeaveRoom()
        {
            if (IsInRoom)
            {
                PhotonNetwork.LeaveRoom();
            }
        }

        #region Photon Callbacks

        public override void OnConnected()
        {
            base.OnConnected();
            IsConnected = true;
            Debug.Log("[NetworkManager] Connected to Photon server");
            OnConnected?.Invoke(true);
        }

        public override void OnDisconnected(DisconnectCause cause)
        {
            base.OnDisconnected(cause);
            IsConnected = false;
            IsInRoom = false;
            CurrentRoomName = null;
            Debug.Log($"[NetworkManager] Disconnected: {cause}");
            OnDisconnected?.Invoke(cause.ToString());
        }

        public override void OnJoinedRoom()
        {
            base.OnJoinedRoom();
            IsInRoom = true;
            CurrentRoomName = PhotonNetwork.CurrentRoom.Name;
            Debug.Log($"[NetworkManager] Joined room: {CurrentRoomName}");
            OnJoinRoom?.Invoke(true, CurrentRoomName);
        }

        public override void OnJoinRoomFailed(short returnCode, string message)
        {
            base.OnJoinRoomFailed(returnCode, message);
            IsInRoom = false;
            Debug.LogError($"[NetworkManager] Failed to join room: {message}");
            OnJoinRoom?.Invoke(false, message);
        }

        public override void OnJoinRandomFailed(short returnCode, string message)
        {
            base.OnJoinRandomFailed(returnCode, message);
            Debug.LogWarning($"[NetworkManager] Failed to join random room: {message}");
            OnJoinRoom?.Invoke(false, message);
        }

        public override void OnCreateRoomFailed(short returnCode, string message)
        {
            base.OnCreateRoomFailed(returnCode, message);
            Debug.LogError($"[NetworkManager] Failed to create room: {message}");
            OnJoinRoom?.Invoke(false, message);
        }

        public override void OnLeftRoom()
        {
            base.OnLeftRoom();
            IsInRoom = false;
            CurrentRoomName = null;
            Debug.Log("[NetworkManager] Left room");
            OnLeftRoom?.Invoke();
        }

        #endregion
    }
}
