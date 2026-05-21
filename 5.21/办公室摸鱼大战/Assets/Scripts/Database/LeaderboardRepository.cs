using System;
using System.Collections.Generic;
using UnityEngine;
using Mono.Data.Sqlite;

namespace OfficeFishing.Database
{
    public class LeaderboardRepository
    {
        public class LeaderboardEntry
        {
            public int Id;
            public int PlayerId;
            public string PlayerName;
            public int Score;
            public string GameMode;
            public DateTime PlayedAt;
            public int Rank;
        }

        public void AddScore(int playerId, string playerName, int score, string gameMode = "Default")
        {
            DatabaseManager.Instance.ExecuteNonQuery(
                "INSERT INTO Leaderboard (PlayerId, PlayerName, Score, GameMode, PlayedAt) VALUES (@PlayerId, @PlayerName, @Score, @GameMode, @PlayedAt)",
                new SqliteParameter("@PlayerId", playerId),
                new SqliteParameter("@PlayerName", playerName),
                new SqliteParameter("@Score", score),
                new SqliteParameter("@GameMode", gameMode),
                new SqliteParameter("@PlayedAt", DateTime.Now)
            );
        }

        public List<LeaderboardEntry> GetTopScores(int count = 10, string gameMode = null)
        {
            var entries = new List<LeaderboardEntry>();

            string query = "SELECT * FROM Leaderboard";
            if (!string.IsNullOrEmpty(gameMode))
            {
                query += " WHERE GameMode = @GameMode";
            }
            query += " ORDER BY Score DESC LIMIT @Count";

            using (var reader = string.IsNullOrEmpty(gameMode)
                ? DatabaseManager.Instance.ExecuteReader(
                    "SELECT * FROM Leaderboard ORDER BY Score DESC LIMIT @Count",
                    new SqliteParameter("@Count", count))
                : DatabaseManager.Instance.ExecuteReader(
                    "SELECT * FROM Leaderboard WHERE GameMode = @GameMode ORDER BY Score DESC LIMIT @Count",
                    new SqliteParameter("@GameMode", gameMode),
                    new SqliteParameter("@Count", count)))
            {
                int rank = 1;
                while (reader.Read())
                {
                    entries.Add(ReadEntry(reader, rank));
                    rank++;
                }
            }

            return entries;
        }

        public List<LeaderboardEntry> GetPlayerScores(int playerId, int count = 10)
        {
            var entries = new List<LeaderboardEntry>();

            using (var reader = DatabaseManager.Instance.ExecuteReader(
                "SELECT * FROM Leaderboard WHERE PlayerId = @PlayerId ORDER BY Score DESC LIMIT @Count",
                new SqliteParameter("@PlayerId", playerId),
                new SqliteParameter("@Count", count)))
            {
                int rank = 1;
                while (reader.Read())
                {
                    entries.Add(ReadEntry(reader, rank));
                    rank++;
                }
            }

            return entries;
        }

        public int GetPlayerRank(int playerId, string gameMode = null)
        {
            var player = new PlayerRepository().GetPlayerById(playerId);
            if (player == null) return -1;

            string query = "SELECT COUNT(*) FROM Leaderboard WHERE Score > @Score";
            if (!string.IsNullOrEmpty(gameMode))
            {
                query += " AND GameMode = @GameMode";
            }

            int count;
            if (string.IsNullOrEmpty(gameMode))
            {
                count = DatabaseManager.Instance.ExecuteScalar<int>(
                    query,
                    new SqliteParameter("@Score", player.HighScore));
            }
            else
            {
                count = DatabaseManager.Instance.ExecuteScalar<int>(
                    query,
                    new SqliteParameter("@Score", player.HighScore),
                    new SqliteParameter("@GameMode", gameMode));
            }

            return count + 1;
        }

        public void DeleteScore(int entryId)
        {
            DatabaseManager.Instance.ExecuteNonQuery(
                "DELETE FROM Leaderboard WHERE Id = @Id",
                new SqliteParameter("@Id", entryId)
            );
        }

        public void ClearLeaderboard(string gameMode = null)
        {
            if (string.IsNullOrEmpty(gameMode))
            {
                DatabaseManager.Instance.ExecuteNonQuery("DELETE FROM Leaderboard");
            }
            else
            {
                DatabaseManager.Instance.ExecuteNonQuery(
                    "DELETE FROM Leaderboard WHERE GameMode = @GameMode",
                    new SqliteParameter("@GameMode", gameMode)
                );
            }
        }

        private LeaderboardEntry ReadEntry(SqliteDataReader reader, int rank)
        {
            return new LeaderboardEntry
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                PlayerId = reader.GetInt32(reader.GetOrdinal("PlayerId")),
                PlayerName = reader.GetString(reader.GetOrdinal("PlayerName")),
                Score = reader.GetInt32(reader.GetOrdinal("Score")),
                GameMode = reader.GetString(reader.GetOrdinal("GameMode")),
                PlayedAt = reader.GetDateTime(reader.GetOrdinal("PlayedAt")),
                Rank = rank
            };
        }
    }
}
