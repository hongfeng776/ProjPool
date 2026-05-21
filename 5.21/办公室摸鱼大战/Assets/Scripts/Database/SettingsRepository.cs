using System.Collections.Generic;
using Mono.Data.Sqlite;

namespace OfficeFishing.Database
{
    public class SettingsRepository
    {
        private Dictionary<string, string> _cache = new Dictionary<string, string>();

        public string GetSetting(string key, string defaultValue = null)
        {
            if (_cache.TryGetValue(key, out string cachedValue))
            {
                return cachedValue;
            }

            using (var reader = DatabaseManager.Instance.ExecuteReader(
                "SELECT Value FROM Settings WHERE Key = @Key",
                new SqliteParameter("@Key", key)))
            {
                if (reader.Read())
                {
                    string value = reader.GetString(reader.GetOrdinal("Value"));
                    _cache[key] = value;
                    return value;
                }
            }

            if (defaultValue != null)
            {
                SetSetting(key, defaultValue);
            }

            return defaultValue;
        }

        public void SetSetting(string key, string value, string description = null)
        {
            _cache[key] = value;

            var existing = GetSetting(key);
            if (existing == null)
            {
                DatabaseManager.Instance.ExecuteNonQuery(
                    "INSERT INTO Settings (Key, Value, Description) VALUES (@Key, @Value, @Description)",
                    new SqliteParameter("@Key", key),
                    new SqliteParameter("@Value", value),
                    new SqliteParameter("@Description", description ?? "")
                );
            }
            else
            {
                DatabaseManager.Instance.ExecuteNonQuery(
                    "UPDATE Settings SET Value = @Value, Description = @Description WHERE Key = @Key",
                    new SqliteParameter("@Key", key),
                    new SqliteParameter("@Value", value),
                    new SqliteParameter("@Description", description ?? "")
                );
            }
        }

        public int GetIntSetting(string key, int defaultValue = 0)
        {
            string value = GetSetting(key);
            return value != null ? int.Parse(value) : defaultValue;
        }

        public void SetIntSetting(string key, int value, string description = null)
        {
            SetSetting(key, value.ToString(), description);
        }

        public float GetFloatSetting(string key, float defaultValue = 0f)
        {
            string value = GetSetting(key);
            return value != null ? float.Parse(value) : defaultValue;
        }

        public void SetFloatSetting(string key, float value, string description = null)
        {
            SetSetting(key, value.ToString("R"), description);
        }

        public bool GetBoolSetting(string key, bool defaultValue = false)
        {
            string value = GetSetting(key);
            return value != null ? bool.Parse(value) : defaultValue;
        }

        public void SetBoolSetting(string key, bool value, string description = null)
        {
            SetSetting(key, value.ToString(), description);
        }

        public void ClearCache()
        {
            _cache.Clear();
        }
    }
}
