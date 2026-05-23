using UnityEngine;

public class Pipe : MonoBehaviour
{
    [Header("移动设置")]
    public float moveSpeed = 3f;
    public float destroyXPosition = -12f;

    [Header("管道设置")]
    public float gapHeight = 3f;

    void Update()
    {
        if (GameManager.Instance == null || !GameManager.Instance.IsPlaying) return;
        
        transform.Translate(Vector2.left * moveSpeed * Time.deltaTime);
        
        if (transform.position.x < destroyXPosition)
        {
            Destroy(gameObject);
        }
    }
}
