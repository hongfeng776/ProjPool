using UnityEngine;
using System.Collections;

namespace PixelAdventure.Core
{
    public class PerformanceOptimizer : Singleton<PerformanceOptimizer>
    {
        [Header("内存管理")]
        [SerializeField] private float memoryCheckInterval = 30f;
        [SerializeField] private float memoryThreshold = 0.7f;

        [Header("帧率控制")]
        [SerializeField] private int targetFrameRate = 60;
        [SerializeField] private int lowPowerFrameRate = 30;

        [Header("GC控制")]
        [SerializeField] private bool autoGC = true;
        [SerializeField] private float gcInterval = 60f;

        private float _lastMemoryCheck;
        private float _lastGCCall;
        private bool _isLowPowerMode;

        public bool IsLowPowerMode => _isLowPowerMode;

        protected override void Awake()
        {
            base.Awake();
            InitializeSettings();
        }

        private void Start()
        {
            StartCoroutine(PerformanceMonitor());
        }

        private void InitializeSettings()
        {
            Application.targetFrameRate = targetFrameRate;
            QualitySettings.vSyncCount = 1;
        }

        private IEnumerator PerformanceMonitor()
        {
            while (true)
            {
                CheckMemoryUsage();
                CheckAutoGC();
                yield return new WaitForSeconds(memoryCheckInterval);
            }
        }

        private void CheckMemoryUsage()
        {
            if (Time.unscaledTime - _lastMemoryCheck < memoryCheckInterval) return;
            _lastMemoryCheck = Time.unscaledTime;

            float usedMemory = (float)System.GC.GetTotalMemory(false) / (1024 * 1024);
            float systemMemory = SystemInfo.systemMemorySize;
            float memoryRatio = usedMemory / systemMemory;

            if (memoryRatio > memoryThreshold)
            {
                Debug.LogWarning($"[PerformanceOptimizer] 内存使用率过高: {memoryRatio:P2}");
                ReleaseMemory();
            }
        }

        private void CheckAutoGC()
        {
            if (!autoGC) return;
            if (Time.unscaledTime - _lastGCCall < gcInterval) return;

            ForceGC();
        }

        public void ForceGC()
        {
            _lastGCCall = Time.unscaledTime;
            System.GC.Collect();
            StartCoroutine(UnloadUnusedAssetsCoroutine());
        }

        private IEnumerator UnloadUnusedAssetsCoroutine()
        {
            AsyncOperation asyncOp = Resources.UnloadUnusedAssets();
            while (!asyncOp.isDone)
            {
                yield return null;
            }
            Debug.Log("[PerformanceOptimizer] 未使用资源已卸载");
        }

        public void ReleaseMemory()
        {
            ForceGC();
            Shader.WarmupAllShaders();
        }

        public void SetLowPowerMode(bool enable)
        {
            _isLowPowerMode = enable;
            Application.targetFrameRate = enable ? lowPowerFrameRate : targetFrameRate;
            QualitySettings.vSyncCount = enable ? 0 : 1;
            Debug.Log($"[PerformanceOptimizer] 低功耗模式: {enable}");
        }

        public void SetQualityLevel(int level)
        {
            QualitySettings.SetQualityLevel(level, true);
            Debug.Log($"[PerformanceOptimizer] 画质等级设置为: {level}");
        }

        public string GetPerformanceReport()
        {
            float usedMemory = (float)System.GC.GetTotalMemory(false) / (1024 * 1024);
            return $"内存使用: {usedMemory:F2}MB\n帧率: {Application.targetFrameRate}\n低功耗: {_isLowPowerMode}";
        }
    }
}
