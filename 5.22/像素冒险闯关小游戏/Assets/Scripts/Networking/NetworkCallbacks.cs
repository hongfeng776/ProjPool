using UnityEngine;
using System;

namespace PixelAdventure.Networking
{
    public class NetworkCallbacks : MonoBehaviour
    {
        public event Action OnConnected;
        public event Action OnDisconnected;
        public event Action OnJoinedRoom;
        public event Action OnLeftRoom;
        public event Action OnPlayerJoined;
        public event Action OnPlayerLeft;

        public static NetworkCallbacks Instance { get; private set; }

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
            }
        }

        public void TriggerConnected()
        {
            Debug.Log("[NetworkCallbacks] OnConnected");
            OnConnected?.Invoke();
        }

        public void TriggerDisconnected()
        {
            Debug.Log("[NetworkCallbacks] OnDisconnected");
            OnDisconnected?.Invoke();
        }

        public void TriggerJoinedRoom()
        {
            Debug.Log("[NetworkCallbacks] OnJoinedRoom");
            OnJoinedRoom?.Invoke();
        }

        public void TriggerLeftRoom()
        {
            Debug.Log("[NetworkCallbacks] OnLeftRoom");
            OnLeftRoom?.Invoke();
        }

        public void TriggerPlayerJoined()
        {
            Debug.Log("[NetworkCallbacks] OnPlayerJoined");
            OnPlayerJoined?.Invoke();
        }

        public void TriggerPlayerLeft()
        {
            Debug.Log("[NetworkCallbacks] OnPlayerLeft");
            OnPlayerLeft?.Invoke();
        }
    }
}
