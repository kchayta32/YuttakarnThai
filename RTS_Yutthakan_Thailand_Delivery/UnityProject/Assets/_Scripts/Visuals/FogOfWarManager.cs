using UnityEngine;
using System.Collections.Generic;

namespace RTS.Visuals
{
    public class FogOfWarManager : MonoBehaviour
    {
        public static FogOfWarManager Instance;

        [Header("Settings")]
        public Texture2D fogTexture;
        public Material fogMaterial; // Assign the material using FOWMask.shader
        public LayerMask fogLayer;
        public float worldSize = 500f;
        public int resolution = 256;
        
        [Header("Runtime")]
        private Color[] mapColors;
        private List<Transform> visionSources = new List<Transform>();
        private float updateInterval = 0.1f;
        private float nextUpdateTime;

        void Awake()
        {
            Instance = this;
            InitializeTexture();
        }

        void InitializeTexture()
        {
            fogTexture = new Texture2D(resolution, resolution, TextureFormat.RGBA32, false);
            fogTexture.wrapMode = TextureWrapMode.Clamp;
            
            mapColors = new Color[resolution * resolution];
            // Black = Unexplored (Alpha 1)
            // Red Channel can be used for "Currently Visible", Green for "Explored"
            for (int i = 0; i < mapColors.Length; i++) 
            {
                mapColors[i] = new Color(0, 0, 0, 1); // Alpha 1 = Opaque Fog
            }
            
            fogTexture.SetPixels(mapColors);
            fogTexture.Apply();

            if (fogMaterial != null)
                fogMaterial.SetTexture("_MainTex", fogTexture);
        }

        public void RegisterVisionSource(Transform t)
        {
            if (!visionSources.Contains(t)) visionSources.Add(t);
        }

        void Update()
        {
            if (Time.time > nextUpdateTime)
            {
                UpdateFog();
                nextUpdateTime = Time.time + updateInterval;
            }
        }

        void UpdateFog()
        {
            bool textureChanged = false;

            // Simple implementation: Radius check converted to texture coords
            foreach (var unit in visionSources)
            {
                if (unit == null) continue;

                Vector3 pos = unit.position;
                int x = Mathf.FloorToInt(((pos.x / worldSize) + 0.5f) * resolution);
                int y = Mathf.FloorToInt(((pos.z / worldSize) + 0.5f) * resolution);
                int r = 5; // Vision Radius in pixels

                for (int i = -r; i <= r; i++)
                {
                    for (int j = -r; j <= r; j++)
                    {
                        if (i*i + j*j <= r*r)
                        {
                            int px = Mathf.Clamp(x + i, 0, resolution - 1);
                            int py = Mathf.Clamp(y + j, 0, resolution - 1);
                            
                            // Mark as Visible (Alpha 0) and Explored
                            mapColors[py * resolution + px] = new Color(0, 0, 0, 0); 
                            textureChanged = true;
                        }
                    }
                }
            }

            if (textureChanged)
            {
                fogTexture.SetPixels(mapColors);
                fogTexture.Apply();
            }
        }
    }
}
