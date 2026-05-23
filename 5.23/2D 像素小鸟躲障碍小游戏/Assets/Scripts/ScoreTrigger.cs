using UnityEngine;

public class ScoreTrigger : MonoBehaviour
{
    private bool hasScored = false;

    void OnTriggerEnter2D(Collider2D other)
    {
        if (hasScored) return;
        
        if (other.CompareTag("Player"))
        {
            hasScored = true;
            
            if (GameManager.Instance != null)
            {
                GameManager.Instance.AddScore(1);
            }
        }
    }

    void OnEnable()
    {
        hasScored = false;
    }
}
