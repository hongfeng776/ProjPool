using UnityEngine;

namespace PlantSandbox.Plant
{
    public class ProceduralPlantGenerator : MonoBehaviour
    {
        [Header("种子设置")]
        public bool generateSeed = true;
        public float seedSize = 0.3f;
        public Color seedColor = new Color(0.6f, 0.4f, 0.2f);

        [Header("茎设置")]
        public bool generateStem = true;
        public float stemHeight = 2f;
        public float stemWidth = 0.1f;
        public Color stemColor = new Color(0.3f, 0.7f, 0.3f);

        [Header("叶子设置")]
        public int leafCount = 3;
        public float leafSize = 0.5f;
        public Color leafColor = new Color(0.2f, 0.8f, 0.3f);
        public float leafSpacing = 0.4f;

        [Header("生成的对象")]
        public GameObject seedObject;
        public GameObject stemObject;
        public GameObject[] leafObjects;

        [Header("材质")]
        public Material customMaterial;

        public void GeneratePlant()
        {
            ClearExisting();

            if (generateSeed)
                GenerateSeed();

            if (generateStem)
                GenerateStem();

            if (leafCount > 0)
                GenerateLeaves();
        }

        private void ClearExisting()
        {
            foreach (Transform child in transform)
            {
                DestroyImmediate(child.gameObject);
            }

            seedObject = null;
            stemObject = null;
            leafObjects = null;
        }

        private void GenerateSeed()
        {
            seedObject = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            seedObject.name = "Seed";
            seedObject.transform.SetParent(transform);
            seedObject.transform.localPosition = Vector3.zero;
            seedObject.transform.localScale = Vector3.one * seedSize;

            SetupRenderer(seedObject, seedColor);
            SetupCollider(seedObject);
        }

        private void GenerateStem()
        {
            stemObject = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            stemObject.name = "Stem";
            stemObject.transform.SetParent(transform);
            stemObject.transform.localPosition = new Vector3(0f, stemHeight * 0.5f, 0f);
            stemObject.transform.localScale = new Vector3(stemWidth, stemHeight * 0.5f, stemWidth);

            SetupRenderer(stemObject, stemColor);
            SetupCollider(stemObject);
        }

        private void GenerateLeaves()
        {
            leafObjects = new GameObject[leafCount];

            for (int i = 0; i < leafCount; i++)
            {
                GameObject leaf = GameObject.CreatePrimitive(PrimitiveType.Quad);
                leaf.name = $"Leaf_{i + 1}";
                leaf.transform.SetParent(transform);

                float height = leafSpacing + (i * leafSpacing);
                float side = (i % 2 == 0) ? 1f : -1f;
                float rotation = (i % 2 == 0) ? 45f : -45f;

                leaf.transform.localPosition = new Vector3(side * leafSize * 0.5f, height, 0f);
                leaf.transform.localScale = Vector3.one * leafSize;
                leaf.transform.localRotation = Quaternion.Euler(0f, 0f, rotation);

                SetupRenderer(leaf, leafColor);
                SetupCollider(leaf);

                leafObjects[i] = leaf;
            }
        }

        private void SetupRenderer(GameObject obj, Color color)
        {
            Renderer renderer = obj.GetComponent<Renderer>();
            if (renderer != null)
            {
                if (customMaterial != null)
                {
                    renderer.material = new Material(customMaterial);
                }
                else
                {
                    renderer.material = new Material(Shader.Find("Standard"));
                }
                renderer.material.color = color;
            }
        }

        private void SetupCollider(GameObject obj)
        {
            Collider collider = obj.GetComponent<Collider>();
            if (collider != null)
            {
                collider.isTrigger = true;
            }
        }

        public Transform GetSeedTransform()
        {
            return seedObject != null ? seedObject.transform : null;
        }

        public Transform GetStemTransform()
        {
            return stemObject != null ? stemObject.transform : null;
        }

        public Transform[] GetLeafTransforms()
        {
            if (leafObjects == null) return null;

            Transform[] transforms = new Transform[leafObjects.Length];
            for (int i = 0; i < leafObjects.Length; i++)
            {
                transforms[i] = leafObjects[i] != null ? leafObjects[i].transform : null;
            }
            return transforms;
        }
    }
}
