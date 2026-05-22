using UnityEngine;

namespace PixelAdventure.Player
{
    public class PlayerInput : MonoBehaviour
    {
        [Header("按键设置")]
        [SerializeField] private KeyCode jumpKey = KeyCode.Space;
        [SerializeField] private KeyCode leftKey = KeyCode.A;
        [SerializeField] private KeyCode rightKey = KeyCode.D;
        [SerializeField] private KeyCode altLeftKey = KeyCode.LeftArrow;
        [SerializeField] private KeyCode altRightKey = KeyCode.RightArrow;
        [SerializeField] private KeyCode pauseKey = KeyCode.Escape;

        [Header("轴设置")]
        [SerializeField] private bool useInputAxis = true;
        [SerializeField] private string horizontalAxis = "Horizontal";
        [SerializeField] private string jumpButton = "Jump";

        public float HorizontalInput { get; private set; }
        public bool JumpPressed { get; private set; }
        public bool JumpHeld { get; private set; }
        public bool JumpReleased { get; private set; }
        public bool PausePressed { get; private set; }

        public System.Action OnJumpPressed;
        public System.Action OnJumpReleased;
        public System.Action OnPausePressed;

        private void Update()
        {
            ReadInput();
            HandleEvents();
        }

        private void ReadInput()
        {
            if (useInputAxis)
            {
                HorizontalInput = Input.GetAxisRaw(horizontalAxis);
            }
            else
            {
                HorizontalInput = 0f;
                if (Input.GetKey(leftKey) || Input.GetKey(altLeftKey))
                {
                    HorizontalInput -= 1f;
                }
                if (Input.GetKey(rightKey) || Input.GetKey(altRightKey))
                {
                    HorizontalInput += 1f;
                }
            }

            if (useInputAxis)
            {
                JumpPressed = Input.GetButtonDown(jumpButton);
                JumpHeld = Input.GetButton(jumpButton);
                JumpReleased = Input.GetButtonUp(jumpButton);
            }
            else
            {
                JumpPressed = Input.GetKeyDown(jumpKey);
                JumpHeld = Input.GetKey(jumpKey);
                JumpReleased = Input.GetKeyUp(jumpKey);
            }

            PausePressed = Input.GetKeyDown(pauseKey);
        }

        private void HandleEvents()
        {
            if (JumpPressed)
            {
                OnJumpPressed?.Invoke();
            }

            if (JumpReleased)
            {
                OnJumpReleased?.Invoke();
            }

            if (PausePressed)
            {
                OnPausePressed?.Invoke();
            }
        }

        public void EnableInput()
        {
            enabled = true;
        }

        public void DisableInput()
        {
            enabled = false;
            HorizontalInput = 0f;
            JumpPressed = false;
            JumpHeld = false;
            JumpReleased = false;
        }

        public void ResetInput()
        {
            HorizontalInput = 0f;
            JumpPressed = false;
            JumpHeld = false;
            JumpReleased = false;
            PausePressed = false;
        }
    }
}
