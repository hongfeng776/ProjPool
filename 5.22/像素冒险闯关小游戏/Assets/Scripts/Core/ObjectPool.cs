using UnityEngine;
using System.Collections.Generic;

namespace PixelAdventure.Core
{
    public class ObjectPool<T> where T : Component
    {
        private readonly T _prefab;
        private readonly Transform _parent;
        private readonly Queue<T> _objects = new Queue<T>();
        private readonly List<T> _activeObjects = new List<T>();

        public int PoolSize => _objects.Count;
        public int ActiveCount => _activeObjects.Count;

        public ObjectPool(T prefab, int initialSize = 10, Transform parent = null)
        {
            _prefab = prefab;
            _parent = parent;

            for (int i = 0; i < initialSize; i++)
            {
                CreateNewObject();
            }
        }

        private T CreateNewObject()
        {
            T newObject = Object.Instantiate(_prefab, _parent);
            newObject.gameObject.SetActive(false);
            _objects.Enqueue(newObject);
            return newObject;
        }

        public T Get()
        {
            if (_objects.Count == 0)
            {
                CreateNewObject();
            }

            T obj = _objects.Dequeue();
            obj.gameObject.SetActive(true);
            _activeObjects.Add(obj);
            return obj;
        }

        public T Get(Vector3 position, Quaternion rotation)
        {
            T obj = Get();
            obj.transform.position = position;
            obj.transform.rotation = rotation;
            return obj;
        }

        public void Return(T obj)
        {
            if (obj == null) return;

            obj.gameObject.SetActive(false);
            _activeObjects.Remove(obj);
            _objects.Enqueue(obj);
        }

        public void ReturnAll()
        {
            for (int i = _activeObjects.Count - 1; i >= 0; i--)
            {
                Return(_activeObjects[i]);
            }
        }

        public void Clear()
        {
            ReturnAll();

            while (_objects.Count > 0)
            {
                T obj = _objects.Dequeue();
                Object.Destroy(obj.gameObject);
            }

            _activeObjects.Clear();
        }

        public void Expand(int count)
        {
            for (int i = 0; i < count; i++)
            {
                CreateNewObject();
            }
        }
    }

    public class ObjectPoolManager : Singleton<ObjectPoolManager>
    {
        private Dictionary<string, object> _pools = new Dictionary<string, object>();

        public ObjectPool<T> CreatePool<T>(string poolName, T prefab, int initialSize = 10, Transform parent = null) where T : Component
        {
            if (_pools.ContainsKey(poolName))
            {
                Debug.LogWarning($"[ObjectPoolManager] 池已存在: {poolName}");
                return _pools[poolName] as ObjectPool<T>;
            }

            var pool = new ObjectPool<T>(prefab, initialSize, parent);
            _pools.Add(poolName, pool);
            return pool;
        }

        public ObjectPool<T> GetPool<T>(string poolName) where T : Component
        {
            if (_pools.TryGetValue(poolName, out object pool))
            {
                return pool as ObjectPool<T>;
            }

            Debug.LogWarning($"[ObjectPoolManager] 池不存在: {poolName}");
            return null;
        }

        public void DestroyPool(string poolName)
        {
            if (_pools.TryGetValue(poolName, out object pool))
            {
                (pool as System.IDisposable)?.Dispose();
                _pools.Remove(poolName);
            }
        }

        public void ClearAllPools()
        {
            foreach (var pool in _pools.Values)
            {
                (pool as System.IDisposable)?.Dispose();
            }
            _pools.Clear();
        }
    }
}
