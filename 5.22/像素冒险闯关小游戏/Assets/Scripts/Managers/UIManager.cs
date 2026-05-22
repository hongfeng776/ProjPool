using UnityEngine;
using System.Collections.Generic;
using PixelAdventure.Core;

namespace PixelAdventure.Managers
{
    public class UIManager : Singleton<UIManager>
    {
        [Header("UI根节点")]
        [SerializeField] private Transform uiRoot;

        private Dictionary<string, GameObject> _panels = new Dictionary<string, GameObject>();
        private Stack<GameObject> _panelStack = new Stack<GameObject>();

        public GameObject CurrentPanel => _panelStack.Count > 0 ? _panelStack.Peek() : null;
        public int PanelCount => _panelStack.Count;

        protected override void Awake()
        {
            base.Awake();
            InitializeUIRoot();
        }

        private void InitializeUIRoot()
        {
            if (uiRoot == null)
            {
                GameObject rootObject = new GameObject("UIRoot");
                uiRoot = rootObject.transform;
                DontDestroyOnLoad(rootObject);
            }
        }

        public void RegisterPanel(string panelName, GameObject panel)
        {
            if (!_panels.ContainsKey(panelName))
            {
                _panels.Add(panelName, panel);
                panel.SetActive(false);
            }
        }

        public void ShowPanel(string panelName)
        {
            if (_panels.TryGetValue(panelName, out GameObject panel))
            {
                if (CurrentPanel != null)
                {
                    CurrentPanel.SetActive(false);
                }

                panel.SetActive(true);
                _panelStack.Push(panel);
            }
            else
            {
                Debug.LogWarning($"[UIManager] 面板未注册: {panelName}");
            }
        }

        public void HidePanel()
        {
            if (_panelStack.Count > 0)
            {
                GameObject panel = _panelStack.Pop();
                panel.SetActive(false);

                if (_panelStack.Count > 0)
                {
                    _panelStack.Peek().SetActive(true);
                }
            }
        }

        public void HideAllPanels()
        {
            while (_panelStack.Count > 0)
            {
                GameObject panel = _panelStack.Pop();
                panel.SetActive(false);
            }
        }

        public void ShowPopup(GameObject popup)
        {
            if (popup == null) return;

            GameObject instance = Instantiate(popup, uiRoot);
            instance.SetActive(true);
        }

        public void ClosePopup(GameObject popup)
        {
            if (popup != null)
            {
                Destroy(popup);
            }
        }
    }
}
