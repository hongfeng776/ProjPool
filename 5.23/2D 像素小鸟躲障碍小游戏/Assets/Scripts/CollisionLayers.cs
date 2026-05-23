using UnityEngine;

public static class CollisionLayers
{
    public const string Bird = "Bird";
    public const string Obstacle = "Obstacle";
    public const string Ground = "Ground";
    public const string Score = "Score";

    public static readonly int BirdLayer = LayerMask.NameToLayer(Bird);
    public static readonly int ObstacleLayer = LayerMask.NameToLayer(Obstacle);
    public static readonly int GroundLayer = LayerMask.NameToLayer(Ground);
    public static readonly int ScoreLayer = LayerMask.NameToLayer(Score);

    public static int BirdCollisionMask
    {
        get { return 1 << ObstacleLayer | 1 << GroundLayer; }
    }

    public static int BirdTriggerMask
    {
        get { return 1 << ScoreLayer; }
    }

    public static bool IsObstacle(GameObject obj)
    {
        return obj.layer == ObstacleLayer;
    }

    public static bool IsGround(GameObject obj)
    {
        return obj.layer == GroundLayer;
    }

    public static bool IsScoreZone(GameObject obj)
    {
        return obj.layer == ScoreLayer;
    }
}
