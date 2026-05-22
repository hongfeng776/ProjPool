using UnityEngine;

namespace LightAndShadowMaze
{
    public class LightOrb : MonoBehaviour
    {
        [Header("Animation")]
        public float rotateSpeed = 90f;
        public float bobAmount = 0.2f;
        public float bobSpeed = 2.5f;

        [Header("Effect")]
        public float intensityBoost = 5f;
        public float rangeBoost = 4f;
        public float duration = 6f;

        private Vector3 startPosition;
        private float timeOffset;

        private void Start()
        {
            startPosition = transform.position;
            timeOffset = Random.Range(0f, Mathf.PI * 2f);
        }

        private void Update()
        {
            transform.Rotate(Vector3.up, rotateSpeed * Time.deltaTime, Space.World);
            
            float newY = startPosition.y + Mathf.Sin(Time.time * bobSpeed + timeOffset) * bobAmount;
            transform.position = new Vector3(transform.position.x, newY, transform.position.z);
        }

        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Player"))
            {
                PlayerController player = other.GetComponent<PlayerController>();
                if (player != null)
                {
                    player.BoostLight(intensityBoost, rangeBoost, duration);
                }

                Destroy(gameObject);
            }
        }
    }
}
