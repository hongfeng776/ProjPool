using UnityEngine;
using System;
using System.Text;
using PixelAdventure.Managers;

namespace PixelAdventure.Core
{
    public class ErrorHandler : Singleton<ErrorHandler>
    {
        [Header("设置")]
        [SerializeField] private bool catchUnhandledExceptions = true;
        [SerializeField] private bool logToFile = true;
        [SerializeField] private bool showErrorPopup = true;
        [SerializeField] private int maxLogFiles = 5;

        [Header("引用")]
        [SerializeField] private GameObject errorPopupPrefab;

        private StringBuilder _errorLog = new StringBuilder();
        private bool _hasFatalError;

        public event Action<string, string> OnError;
        public bool HasFatalError => _hasFatalError;

        protected override void Awake()
        {
            base.Awake();
            InitializeExceptionHandling();
        }

        private void InitializeExceptionHandling()
        {
            if (catchUnhandledExceptions)
            {
                Application.logMessageReceived += OnLogMessageReceived;
                AppDomain.CurrentDomain.UnhandledException += OnUnhandledException;
            }
        }

        private void OnLogMessageReceived(string condition, string stackTrace, LogType type)
        {
            if (type == LogType.Exception || type == LogType.Error)
            {
                HandleError(condition, stackTrace, type == LogType.Fatal);
            }
        }

        private void OnUnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            Exception ex = e.ExceptionObject as Exception;
            HandleError(ex?.Message ?? "未知异常", ex?.StackTrace ?? "", true);
        }

        private void HandleError(string message, string stackTrace, bool isFatal)
        {
            string timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            string errorEntry = $"[{timestamp}] {message}\n{stackTrace}\n";

            _errorLog.Append(errorEntry);

            Debug.LogError(errorEntry);

            if (isFatal)
            {
                _hasFatalError = true;
            }

            OnError?.Invoke(message, stackTrace);

            if (logToFile)
            {
                WriteLogToFile();
            }

            if (showErrorPopup && isFatal)
            {
                ShowErrorPopup(message);
            }
        }

        private void WriteLogToFile()
        {
            try
            {
                string logPath = System.IO.Path.Combine(Application.persistentDataPath, "error_log.txt");
                System.IO.File.WriteAllText(logPath, _errorLog.ToString());
            }
            catch
            {
            }
        }

        private void ShowErrorPopup(string message)
        {
            if (errorPopupPrefab != null)
            {
                Instantiate(errorPopupPrefab);
            }
            else
            {
                CreateDefaultErrorPopup(message);
            }
        }

        private void CreateDefaultErrorPopup(string message)
        {
            GameObject popupObj = new GameObject("ErrorPopup");
            Canvas canvas = popupObj.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 9999;
            popupObj.AddComponent<GraphicRaycaster>();

            RectTransform rect = popupObj.GetComponent<RectTransform>();
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;

            GameObject bgObj = new GameObject("Background");
            bgObj.transform.SetParent(popupObj.transform, false);
            Image bgImage = bgObj.AddComponent<Image>();
            bgImage.color = new Color(0.7f, 0.2f, 0.2f, 0.95f);
            RectTransform bgRect = bgObj.GetComponent<RectTransform>();
            bgRect.anchorMin = new Vector2(0.25f, 0.25f);
            bgRect.anchorMax = new Vector2(0.75f, 0.75f);
            bgRect.offsetMin = Vector2.zero;
            bgRect.offsetMax = Vector2.zero;

            GameObject titleObj = new GameObject("Title");
            titleObj.transform.SetParent(bgObj.transform, false);
            Text titleTxt = titleObj.AddComponent<Text>();
            titleTxt.text = "发生错误";
            titleTxt.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            titleTxt.fontSize = 32;
            titleTxt.alignment = TextAnchor.MiddleCenter;
            titleTxt.color = Color.white;
            RectTransform titleRect = titleObj.GetComponent<RectTransform>();
            titleRect.anchorMin = new Vector2(0.5f, 0.8f);
            titleRect.anchorMax = new Vector2(0.5f, 0.8f);
            titleRect.sizeDelta = new Vector2(300, 50);
            titleRect.anchoredPosition = Vector2.zero;

            GameObject msgObj = new GameObject("Message");
            msgObj.transform.SetParent(bgObj.transform, false);
            Text msgTxt = msgObj.AddComponent<Text>();
            msgTxt.text = message;
            msgTxt.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            msgTxt.fontSize = 16;
            msgTxt.alignment = TextAnchor.MiddleCenter;
            msgTxt.color = Color.white;
            msgTxt.horizontalOverflow = HorizontalWrapMode.Wrap;
            RectTransform msgRect = msgObj.GetComponent<RectTransform>();
            msgRect.anchorMin = new Vector2(0.1f, 0.3f);
            msgRect.anchorMax = new Vector2(0.9f, 0.6f);
            msgRect.offsetMin = Vector2.zero;
            msgRect.offsetMax = Vector2.zero;

            GameObject btnObj = new GameObject("RestartButton");
            btnObj.transform.SetParent(bgObj.transform, false);
            Button btn = btnObj.AddComponent<Button>();
            Image btnImg = btnObj.AddComponent<Image>();
            btnImg.color = new Color(0.3f, 0.3f, 0.3f, 1f);
            RectTransform btnRect = btnObj.GetComponent<RectTransform>();
            btnRect.anchorMin = new Vector2(0.5f, 0.15f);
            btnRect.anchorMax = new Vector2(0.5f, 0.15f);
            btnRect.sizeDelta = new Vector2(200, 50);
            btnRect.anchoredPosition = Vector2.zero;

            GameObject btnTxtObj = new GameObject("Text");
            btnTxtObj.transform.SetParent(btnObj.transform, false);
            Text btnTxt = btnTxtObj.AddComponent<Text>();
            btnTxt.text = "重新开始";
            btnTxt.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            btnTxt.fontSize = 20;
            btnTxt.alignment = TextAnchor.MiddleCenter;
            btnTxt.color = Color.white;
            RectTransform btnTxtRect = btnTxtObj.GetComponent<RectTransform>();
            btnTxtRect.anchorMin = Vector2.zero;
            btnTxtRect.anchorMax = Vector2.one;
            btnTxtRect.offsetMin = Vector2.zero;
            btnTxtRect.offsetMax = Vector2.zero;

            btn.onClick.AddListener(() =>
            {
                SceneLoader.Instance?.ReloadCurrentScene();
                Destroy(popupObj);
            });
        }

        public string GetErrorLog()
        {
            return _errorLog.ToString();
        }

        public void ClearErrorLog()
        {
            _errorLog.Clear();
            _hasFatalError = false;
        }

        public void SafeAction(Action action, string actionName = "Action")
        {
            try
            {
                action?.Invoke();
            }
            catch (Exception ex)
            {
                HandleError($"{actionName} 失败: {ex.Message}", ex.StackTrace, false);
            }
        }

        public T SafeFunc<T>(Func<T> func, T defaultValue = default(T), string funcName = "Func")
        {
            try
            {
                return func != null ? func() : defaultValue;
            }
            catch (Exception ex)
            {
                HandleError($"{funcName} 失败: {ex.Message}", ex.StackTrace, false);
                return defaultValue;
            }
        }

        private void OnDestroy()
        {
            if (catchUnhandledExceptions)
            {
                Application.logMessageReceived -= OnLogMessageReceived;
                AppDomain.CurrentDomain.UnhandledException -= OnUnhandledException;
            }
        }
    }
}
