using System;
using System.IO;
using UnityEngine;
using Mono.Data.Sqlite;

namespace OfficeFishing.Database
{
    public class DatabaseManager : Singleton<DatabaseManager>
    {
        private string _dbPath;
        private SqliteConnection _connection;
        private bool _isInitialized = false;

        public bool IsInitialized => _isInitialized;

        private const string DB_NAME = "OfficeFishing.db";

        protected override void Awake()
        {
            base.Awake();
            InitializeDatabase();
        }

        private void InitializeDatabase()
        {
            try
            {
                _dbPath = GetDatabasePath();

                if (!File.Exists(_dbPath))
                {
                    CreateDatabase();
                }
                else
                {
                    OpenConnection();
                }

                CreateTables();
                _isInitialized = true;
                Debug.Log("[DatabaseManager] Database initialized successfully");
            }
            catch (Exception e)
            {
                Debug.LogError($"[DatabaseManager] Failed to initialize database: {e.Message}");
            }
        }

        private string GetDatabasePath()
        {
            string path;

            if (Application.isEditor)
            {
                path = Path.Combine(Application.dataPath, DB_NAME);
            }
            else if (Application.platform == RuntimePlatform.Android)
            {
                path = Path.Combine(Application.persistentDataPath, DB_NAME);
            }
            else if (Application.platform == RuntimePlatform.IPhonePlayer)
            {
                path = Path.Combine(Application.persistentDataPath, DB_NAME);
            }
            else
            {
                path = Path.Combine(Application.persistentDataPath, DB_NAME);
            }

            return path;
        }

        private void CreateDatabase()
        {
            SqliteConnection.CreateFile(_dbPath);
            OpenConnection();
            Debug.Log("[DatabaseManager] Database created");
        }

        private void OpenConnection()
        {
            try
            {
                _connection = new SqliteConnection($"URI=file:{_dbPath}");
                _connection.Open();
            }
            catch (Exception e)
            {
                Debug.LogError($"[DatabaseManager] Failed to open connection: {e.Message}");
                throw;
            }
        }

        private void CreateTables()
        {
            ExecuteNonQuery(@"
                CREATE TABLE IF NOT EXISTS Players (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Name TEXT NOT NULL,
                    HighScore INTEGER DEFAULT 0,
                    TotalGames INTEGER DEFAULT 0,
                    TotalScore INTEGER DEFAULT 0,
                    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            ");

            ExecuteNonQuery(@"
                CREATE TABLE IF NOT EXISTS Leaderboard (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    PlayerId INTEGER NOT NULL,
                    PlayerName TEXT NOT NULL,
                    Score INTEGER NOT NULL,
                    GameMode TEXT DEFAULT 'Default',
                    PlayedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (PlayerId) REFERENCES Players(Id)
                );
            ");

            ExecuteNonQuery(@"
                CREATE TABLE IF NOT EXISTS Settings (
                    Key TEXT PRIMARY KEY,
                    Value TEXT,
                    Description TEXT
                );
            ");

            Debug.Log("[DatabaseManager] Tables created/verified");
        }

        public SqliteConnection GetConnection()
        {
            if (_connection == null || _connection.State == System.Data.ConnectionState.Closed)
            {
                OpenConnection();
            }
            return _connection;
        }

        public int ExecuteNonQuery(string query, params SqliteParameter[] parameters)
        {
            using (var cmd = new SqliteCommand(query, GetConnection()))
            {
                if (parameters != null)
                {
                    cmd.Parameters.AddRange(parameters);
                }
                return cmd.ExecuteNonQuery();
            }
        }

        public SqliteDataReader ExecuteReader(string query, params SqliteParameter[] parameters)
        {
            var cmd = new SqliteCommand(query, GetConnection());
            if (parameters != null)
            {
                cmd.Parameters.AddRange(parameters);
            }
            return cmd.ExecuteReader();
        }

        public T ExecuteScalar<T>(string query, params SqliteParameter[] parameters)
        {
            using (var cmd = new SqliteCommand(query, GetConnection()))
            {
                if (parameters != null)
                {
                    cmd.Parameters.AddRange(parameters);
                }
                object result = cmd.ExecuteScalar();
                return result == null ? default(T) : (T)Convert.ChangeType(result, typeof(T));
            }
        }

        public void CloseConnection()
        {
            if (_connection != null && _connection.State == System.Data.ConnectionState.Open)
            {
                _connection.Close();
            }
        }

        private void OnApplicationQuit()
        {
            CloseConnection();
        }

        protected override void OnDestroy()
        {
            CloseConnection();
            base.OnDestroy();
        }
    }
}
