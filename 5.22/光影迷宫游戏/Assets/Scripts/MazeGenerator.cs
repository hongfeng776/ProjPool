using UnityEngine;
using System.Collections.Generic;

namespace LightAndShadowMaze
{
    public class MazeGenerator : MonoBehaviour
    {
        [Header("Maze Settings")]
        public int width = 15;
        public int height = 15;
        public float cellSize = 2f;
        public GameObject wallPrefab;
        public GameObject floorPrefab;
        public Transform mazeParent;

        [Header("Materials")]
        public Material wallMaterial;
        public Material floorMaterial;

        private int[,] mazeData;
        private List<GameObject> spawnedWalls = new List<GameObject>();
        private List<GameObject> spawnedFloors = new List<GameObject>();

        private void Awake()
        {
            if (mazeParent == null)
            {
                mazeParent = new GameObject("Maze").transform;
                mazeParent.SetParent(transform);
            }
        }

        public void Generate()
        {
            ClearMaze();
            GenerateMazeData();
            SpawnMazeObjects();
        }

        private void GenerateMazeData()
        {
            mazeData = new int[width, height];
            
            for (int x = 0; x < width; x++)
            {
                for (int y = 0; y < height; y++)
                {
                    mazeData[x, y] = 1;
                }
            }

            Stack<Vector2Int> stack = new Stack<Vector2Int>();
            Vector2Int start = new Vector2Int(1, 1);
            mazeData[start.x, start.y] = 0;
            stack.Push(start);

            while (stack.Count > 0)
            {
                Vector2Int current = stack.Peek();
                List<Vector2Int> neighbors = GetUnvisitedNeighbors(current.x, current.y);

                if (neighbors.Count > 0)
                {
                    Vector2Int next = neighbors[Random.Range(0, neighbors.Count)];
                    Vector2Int between = (current + next) / 2;
                    
                    mazeData[between.x, between.y] = 0;
                    mazeData[next.x, next.y] = 0;
                    stack.Push(next);
                }
                else
                {
                    stack.Pop();
                }
            }
        }

        private List<Vector2Int> GetUnvisitedNeighbors(int x, int y)
        {
            List<Vector2Int> neighbors = new List<Vector2Int>();
            
            if (y + 2 < height - 1 && mazeData[x, y + 2] == 1)
                neighbors.Add(new Vector2Int(x, y + 2));
            if (x + 2 < width - 1 && mazeData[x + 2, y] == 1)
                neighbors.Add(new Vector2Int(x + 2, y));
            if (y - 2 > 0 && mazeData[x, y - 2] == 1)
                neighbors.Add(new Vector2Int(x, y - 2));
            if (x - 2 > 0 && mazeData[x - 2, y] == 1)
                neighbors.Add(new Vector2Int(x - 2, y));

            return neighbors;
        }

        private void SpawnMazeObjects()
        {
            for (int x = 0; x < width; x++)
            {
                for (int y = 0; y < height; y++)
                {
                    Vector3 worldPos = new Vector3(x * cellSize, 0, y * cellSize);
                    
                    GameObject floor = CreateFloor(worldPos);
                    spawnedFloors.Add(floor);

                    if (mazeData[x, y] == 1)
                    {
                        GameObject wall = CreateWall(worldPos + Vector3.up * cellSize * 0.5f);
                        spawnedWalls.Add(wall);
                    }
                }
            }
        }

        private GameObject CreateFloor(Vector3 position)
        {
            GameObject floor;
            
            if (floorPrefab != null)
            {
                floor = Instantiate(floorPrefab, position, Quaternion.identity, mazeParent);
            }
            else
            {
                floor = GameObject.CreatePrimitive(PrimitiveType.Plane);
                floor.transform.SetParent(mazeParent);
                floor.transform.position = position;
                floor.transform.localScale = new Vector3(cellSize * 0.1f, 1, cellSize * 0.1f);
                
                Renderer renderer = floor.GetComponent<Renderer>();
                if (renderer != null && floorMaterial != null)
                {
                    renderer.material = floorMaterial;
                }
                else if (renderer != null)
                {
                    renderer.material.color = new Color(0.15f, 0.15f, 0.2f);
                }
            }
            
            floor.isStatic = true;
            return floor;
        }

        private GameObject CreateWall(Vector3 position)
        {
            GameObject wall;
            
            if (wallPrefab != null)
            {
                wall = Instantiate(wallPrefab, position, Quaternion.identity, mazeParent);
                wall.transform.localScale = new Vector3(cellSize, cellSize, cellSize);
            }
            else
            {
                wall = GameObject.CreatePrimitive(PrimitiveType.Cube);
                wall.transform.SetParent(mazeParent);
                wall.transform.position = position;
                wall.transform.localScale = new Vector3(cellSize, cellSize, cellSize);
                wall.name = "Wall_" + Mathf.RoundToInt(position.x) + "_" + Mathf.RoundToInt(position.z);
                
                Renderer renderer = wall.GetComponent<Renderer>();
                if (renderer != null && wallMaterial != null)
                {
                    renderer.material = wallMaterial;
                }
                else if (renderer != null)
                {
                    renderer.material.color = new Color(0.3f, 0.3f, 0.35f);
                }
            }
            
            wall.isStatic = true;
            
            BoxCollider collider = wall.GetComponent<BoxCollider>();
            if (collider == null)
            {
                collider = wall.AddComponent<BoxCollider>();
            }
            collider.enabled = true;
            collider.isTrigger = false;
            
            Rigidbody rb = wall.GetComponent<Rigidbody>();
            if (rb == null)
            {
                rb = wall.AddComponent<Rigidbody>();
            }
            rb.isKinematic = true;
            rb.useGravity = false;
            
            return wall;
        }

        public void ClearMaze()
        {
            foreach (var wall in spawnedWalls)
            {
                if (wall != null) Destroy(wall);
            }
            spawnedWalls.Clear();

            foreach (var floor in spawnedFloors)
            {
                if (floor != null) Destroy(floor);
            }
            spawnedFloors.Clear();
        }

        public Vector3 GetStartWorldPosition()
        {
            return new Vector3(cellSize, cellSize * 0.5f + 1f, cellSize);
        }

        public Vector3 GetEndWorldPosition()
        {
            return new Vector3((width - 2) * cellSize, cellSize * 0.5f + 1f, (height - 2) * cellSize);
        }

        public bool IsWallAtWorldPosition(Vector3 worldPos)
        {
            int gridX = Mathf.RoundToInt(worldPos.x / cellSize);
            int gridY = Mathf.RoundToInt(worldPos.z / cellSize);
            
            if (gridX < 0 || gridX >= width || gridY < 0 || gridY >= height)
                return true;
            
            return mazeData[gridX, gridY] == 1;
        }

        public int[,] GetMazeData()
        {
            return mazeData;
        }
    }
}
