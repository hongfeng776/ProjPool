using System;
using System.Collections.Generic;

namespace OfficeFishing.Core
{
    public class EventSystem : Singleton<EventSystem>
    {
        private Dictionary<Type, Delegate> eventHandlers = new Dictionary<Type, Delegate>();

        public void Subscribe<T>(Action<T> handler) where T : struct
        {
            Type eventType = typeof(T);
            if (!eventHandlers.ContainsKey(eventType))
            {
                eventHandlers[eventType] = null;
            }
            eventHandlers[eventType] = Delegate.Combine(eventHandlers[eventType], handler);
        }

        public void Unsubscribe<T>(Action<T> handler) where T : struct
        {
            Type eventType = typeof(T);
            if (eventHandlers.TryGetValue(eventType, out Delegate existingDelegate))
            {
                Delegate newDelegate = Delegate.Remove(existingDelegate, handler);
                if (newDelegate == null)
                {
                    eventHandlers.Remove(eventType);
                }
                else
                {
                    eventHandlers[eventType] = newDelegate;
                }
            }
        }

        public void Publish<T>(T eventArgs) where T : struct
        {
            Type eventType = typeof(T);
            if (eventHandlers.TryGetValue(eventType, out Delegate handler))
            {
                (handler as Action<T>)?.Invoke(eventArgs);
            }
        }

        protected override void OnDestroy()
        {
            eventHandlers.Clear();
            base.OnDestroy();
        }
    }
}
