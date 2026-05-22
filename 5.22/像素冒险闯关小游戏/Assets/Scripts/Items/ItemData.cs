using UnityEngine;

namespace PixelAdventure.Items
{
    public enum ItemType
    {
        Coin,
        Gem,
        Star,
        Key,
        Heart,
        PowerUp,
        Custom
    }

    [CreateAssetMenu(fileName = "NewItem", menuName = "Pixel Adventure/Item Data")]
    public class ItemData : ScriptableObject
    {
        [Header("基础信息")]
        public string itemName = "New Item";
        public ItemType itemType = ItemType.Coin;
        public int value = 1;
        public Sprite icon;
        public Color color = Color.yellow;

        [Header("设置")]
        public bool destroyOnPickup = true;
        public float destroyDelay = 0f;
        public bool playSound = true;
        public bool showEffect = true;

        [Header("浮动动画")]
        public bool floatAnimation = true;
        public float floatSpeed = 2f;
        public float floatHeight = 0.3f;

        [Header("旋转动画")]
        public bool rotateAnimation = true;
        public float rotateSpeed = 90f;
    }
}
