using System;
using System.Collections.Generic;
using UnityEngine;
using Mono.Data.Sqlite;

namespace OfficeFishing.Database
{
    public class PlayerRepository
    {
        public class PlayerRecord
        {
            public int Id;
            public string Name;
            public int HighScore;
            public int TotalGames;
            public int TotalScore;
            public DateTime CreatedAt;
            public DateTime UpdatedAt;
        }

        public int AddOrUpdatePlayer(string playerName)
        {
            var existingPlayer = GetPlayerByName(playerName);
            if (existingPlayer != null)
            {
                return existingPlayer.Id;
            }

            DatabaseManager.Instance.ExecuteNonQuery(
                "INSERT INTO Players (Name, CreatedAt, UpdatedAt) VALUES (@Name, @CreatedAt, @UpdatedAt)",
                new SqliteParameter("@Name", playerName),
                new SqliteParameter("@CreatedAt", DateTime.Now),
                new SqliteParameter("@UpdatedAt", DateTime.Now)
            );

            var player = GetPlayerByName(playerName);
            return player?.Id ?? -1;
        }

        public PlayerRecord GetPlayerByName(string playerName)
        {
            using (var reader = DatabaseManager.Instance.ExecuteReader(
                "SELECT * FROM Players WHERE Name = @Name",
                new SqliteParameter("@Name", playerName)))
            {
                if (reader.Read())
                {
                    return ReadPlayer(reader);
                }
            }
            return null;
        }

        public PlayerRecord GetPlayerById(int playerId)
        {
            using (var reader = DatabaseManager.Instance.ExecuteReader(
                "SELECT * FROM Players WHERE Id = @Id",
                new SqliteParameter("@Id", playerId)))
            {
                if (reader.Read())
                {
                    return ReadPlayer(reader);
                }
            }
            return null;
        }

        public void UpdatePlayerScore(int playerId, int score)
        {
            var player = GetPlayerById(playerId);
            if (player == null) return;

            int newHighScore = Math.Max(player.HighScore, score);
            int newTotalScore = player.TotalScore + score;
            int newTotalGames = player.TotalGames + 1;

            DatabaseManager.Instance.ExecuteNonQuery(
                "UPDATE Players SET HighScore = @HighScore, TotalScore = @TotalScore, TotalGames = @TotalGames, UpdatedAt = @UpdatedAt WHERE Id = @Id",
                new SqliteParameter("@HighScore", newHighScore),
                new SqliteParameter("@TotalScore", newTotalScore),
                new SqliteParameter("@TotalGames", newTotalGames),
                new SqliteParameter("@UpdatedAt", DateTime.Now),
                new SqliteParameter("@Id", playerId)
            );
        }

        public List<PlayerRecord> GetAllPlayers()
        {
            var players = new List<PlayerRecord>();

            using (var reader = DatabaseManager.Instance.ExecuteReader("SELECT * FROM Players ORDER BY HighScore DESC"))
            {
                while (reader.Read())
                {
                    players.Add(ReadPlayer(reader));
                }
            }

            return players;
        }

        private PlayerRecord ReadPlayer(SqliteDataReader reader)
        {
            return new PlayerRecord
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                Name = reader.GetString(reader.GetOrdinal("Name")),
                HighScore = reader.GetInt32(reader.GetOrdinal("HighScore")),
                TotalGames = reader.GetInt32(reader.GetOrdinal("TotalGames")),
                TotalScore = reader.GetInt32(reader.GetOrdinal("TotalScore")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                UpdatedAt = reader.GetDateTime(reader.GetOrdinal("UpdatedAt"))
            };
        }
    }
}
