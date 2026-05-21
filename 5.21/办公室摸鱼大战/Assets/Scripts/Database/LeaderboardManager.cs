using System;
using System.Collections.Generic;
using UnityEngine;
using OfficeFishing.Core;

namespace OfficeFishing.Database
{
    public class LeaderboardManager : Singleton<LeaderboardManager>
    {
        private LeaderboardRepository _leaderboardRepository;
        private PlayerRepository _playerRepository;

        public event Action<List<LeaderboardRepository.LeaderboardEntry>> OnLeaderboardUpdated;

        protected override void Awake()
        {
            base.Awake();
            _leaderboardRepository = new LeaderboardRepository();
            _playerRepository = new PlayerRepository();
        }

        public void AddScore(int playerId, string playerName, int score, string gameMode = "Default")
        {
            _leaderboardRepository.AddScore(playerId, playerName, score, gameMode);
            OnLeaderboardUpdated?.Invoke(GetTopScores(10, gameMode));
        }

        public List<LeaderboardRepository.LeaderboardEntry> GetTopScores(int count = 10, string gameMode = null)
        {
            return _leaderboardRepository.GetTopScores(count, gameMode);
        }

        public List<LeaderboardRepository.LeaderboardEntry> GetPlayerScores(int playerId, int count = 10)
        {
            return _leaderboardRepository.GetPlayerScores(playerId, count);
        }

        public int GetPlayerRank(int playerId, string gameMode = null)
        {
            return _leaderboardRepository.GetPlayerRank(playerId, gameMode);
        }

        public int GetHighScore(int playerId)
        {
            var player = _playerRepository.GetPlayerById(playerId);
            return player?.HighScore ?? 0;
        }

        public void ClearLeaderboard(string gameMode = null)
        {
            _leaderboardRepository.ClearLeaderboard(gameMode);
            OnLeaderboardUpdated?.Invoke(GetTopScores(10, gameMode));
        }

        public List<string> GetAvailableGameModes()
        {
            var modes = new List<string> { "Default", "Phone", "Card", "Snack" };
            return modes;
        }

        public LeaderboardRepository.LeaderboardEntry GetHighestScore(string gameMode = null)
        {
            var topScores = _leaderboardRepository.GetTopScores(1, gameMode);
            return topScores.Count > 0 ? topScores[0] : null;
        }

        public string GetFormattedTime(DateTime dateTime)
        {
            return dateTime.ToString("yyyy/MM/dd HH:mm");
        }

        public string GetRankSuffix(int rank)
        {
            switch (rank)
            {
                case 1:
                    return "st";
                case 2:
                    return "nd";
                case 3:
                    return "rd";
                default:
                    return "th";
            }
        }

        public Color GetRankColor(int rank)
        {
            switch (rank)
            {
                case 1:
                    return new Color(1f, 0.84f, 0f);
                case 2:
                    return new Color(0.75f, 0.75f, 0.75f);
                case 3:
                    return new Color(0.8f, 0.5f, 0.2f);
                default:
                    return Color.white;
            }
        }
    }
}
