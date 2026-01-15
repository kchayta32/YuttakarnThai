using UnityEngine;

namespace RTS.Design
{
    public class LevelBuilder : MonoBehaviour
    {
        public int mapWidth = 100;
        public int mapDepth = 100;
        
        [ContextMenu("Build Greybox Level")]
        public void BuildLevel()
        {
            // Clear children
            for (int i = transform.childCount - 1; i >= 0; i--)
            {
                DestroyImmediate(transform.GetChild(i).gameObject);
            }

            // Create Ground
            GameObject ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
            ground.name = "Ground";
            ground.transform.SetParent(transform);
            ground.transform.localScale = new Vector3(mapWidth / 10f, 1, mapDepth / 10f);
            
            // Create River
            GameObject river = GameObject.CreatePrimitive(PrimitiveType.Cube);
            river.name = "River";
            river.transform.SetParent(transform);
            river.transform.position = new Vector3(0, 0.1f, 0);
            river.transform.localScale = new Vector3(mapWidth, 1, 15f); // Wide river across Z
            river.GetComponent<Renderer>().sharedMaterial = new Material(Shader.Find("Standard")); 
            river.GetComponent<Renderer>().sharedMaterial.color = Color.cyan;

            // Create Bridge
            GameObject bridge = GameObject.CreatePrimitive(PrimitiveType.Cube);
            bridge.name = "Bridge";
            bridge.transform.SetParent(transform);
            bridge.transform.position = new Vector3(0, 0.5f, 0);
            bridge.transform.localScale = new Vector3(10f, 1f, 20f);
            
            // Create Obstacles
            CreateObstacle("Mountain_Left", new Vector3(-30, 0, 30), new Vector3(20, 10, 20));
            CreateObstacle("Mountain_Right", new Vector3(30, 0, -30), new Vector3(20, 10, 20));
        }

        void CreateObstacle(string name, Vector3 pos, Vector3 scale)
        {
            GameObject obs = GameObject.CreatePrimitive(PrimitiveType.Cube);
            obs.name = name;
            obs.transform.SetParent(transform);
            obs.transform.position = pos + new Vector3(0, scale.y/2, 0);
            obs.transform.localScale = scale;
        }
    }
}
