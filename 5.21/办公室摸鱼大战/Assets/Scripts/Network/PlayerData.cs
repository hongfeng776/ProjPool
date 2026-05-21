using UnityEngine;
using Photon.Pun;

namespace OfficeFishing.Network
{
    public class PlayerData : MonoBehaviourPun
    {
        public string PlayerName { get; private set; }
        public int PlayerScore { get; private set; }
        public int PlayerId { get; private set; }
        public bool IsReady { get; private set; }

        public System.Action<string> OnPlayerNameChanged;
        public System.Action<int> OnPlayerScoreChanged;
        public System.Action<bool> OnPlayerReadyChanged;

        private void Start()
        {
            if (photonView.IsMine)
            {
                PlayerId = PhotonNetwork.LocalPlayer.ActorNumber;
                PlayerName = PhotonNetwork.LocalPlayer.NickName;
            }
        }

        public void SetPlayerName(string name)
        {
            if (photonView.IsMine)
            {
                PlayerName = name;
                photonView.RPC("RPC_UpdatePlayerName", RpcTarget.All, name);
            }
        }

        public void AddScore(int score)
        {
            if (photonView.IsMine)
            {
                PlayerScore += score;
                photonView.RPC("RPC_UpdatePlayerScore", RpcTarget.All, PlayerScore);
            }
        }

        public void SetReady(bool ready)
        {
            if (photonView.IsMine)
            {
                IsReady = ready;
                photonView.RPC("RPC_UpdatePlayerReady", RpcTarget.All, ready);
            }
        }

        public void ResetScore()
        {
            if (photonView.IsMine)
            {
                PlayerScore = 0;
                photonView.RPC("RPC_UpdatePlayerScore", RpcTarget.All, 0);
            }
        }

        #region RPC

        [PunRPC]
        private void RPC_UpdatePlayerName(string name)
        {
            PlayerName = name;
            OnPlayerNameChanged?.Invoke(name);
        }

        [PunRPC]
        private void RPC_UpdatePlayerScore(int score)
        {
            PlayerScore = score;
            OnPlayerScoreChanged?.Invoke(score);
        }

        [PunRPC]
        private void RPC_UpdatePlayerReady(bool ready)
        {
            IsReady = ready;
            OnPlayerReadyChanged?.Invoke(ready);
        }

        #endregion
    }
}
