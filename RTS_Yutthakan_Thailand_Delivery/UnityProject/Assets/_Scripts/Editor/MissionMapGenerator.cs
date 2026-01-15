#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEditor.AI;
using UnityEngine.AI;
using System.Collections.Generic;

namespace RTS.Editor
{
    /// <summary>
    /// สร้าง Mission Map สำหรับแคมเปญสงครามช้างเผือก
    /// Terrain, River, Trees, Rocks, NavMesh และ Key Locations
    /// </summary>
    public class MissionMapGenerator : EditorWindow
    {
        // Map Settings
        private int mapSize = 200;
        private int terrainResolution = 513;
        private float maxHeight = 30f;
        private float riverWidth = 15f;
        private int treeCount = 150;
        private int rockCount = 50;

        [MenuItem("RTS/Generate Mission Map/White Elephant Map")]
        public static void ShowWindow()
        {
            GetWindow<MissionMapGenerator>("Mission Map Generator");
        }

        private void OnGUI()
        {
            GUILayout.Label("⚔️ White Elephant Mission Map Generator", EditorStyles.boldLabel);
            GUILayout.Space(10);

            mapSize = EditorGUILayout.IntSlider("Map Size", mapSize, 100, 500);
            terrainResolution = EditorGUILayout.IntPopup("Terrain Resolution", terrainResolution, 
                new string[] { "257", "513", "1025" }, new int[] { 257, 513, 1025 });
            maxHeight = EditorGUILayout.Slider("Max Height", maxHeight, 10f, 100f);
            riverWidth = EditorGUILayout.Slider("River Width", riverWidth, 5f, 30f);
            treeCount = EditorGUILayout.IntSlider("Tree Count", treeCount, 50, 500);
            rockCount = EditorGUILayout.IntSlider("Rock Count", rockCount, 20, 200);

            GUILayout.Space(20);

            if (GUILayout.Button("🗺️ Generate Complete Map", GUILayout.Height(40)))
            {
                GenerateCompleteMap();
            }

            GUILayout.Space(10);
            GUILayout.Label("หรือสร้างทีละส่วน:", EditorStyles.miniBoldLabel);

            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button("1. Terrain")) GenerateTerrain();
            if (GUILayout.Button("2. River")) GenerateRiver();
            EditorGUILayout.EndHorizontal();

            EditorGUILayout.BeginHorizontal();
            if (GUILayout.Button("3. Locations")) GenerateKeyLocations();
            if (GUILayout.Button("4. Decorations")) GenerateDecorations();
            EditorGUILayout.EndHorizontal();

            if (GUILayout.Button("5. Bake NavMesh"))
            {
                BakeNavMesh();
            }
        }

        [MenuItem("RTS/Generate Mission Map/Quick Generate (Default Settings)")]
        public static void QuickGenerate()
        {
            var generator = CreateInstance<MissionMapGenerator>();
            generator.GenerateCompleteMap();
        }

        public void GenerateCompleteMap()
        {
            // สร้าง Scene ใหม่
            EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);

            // ตั้งค่า Camera และ Lighting
            SetupCameraAndLighting();

            // สร้างทุกอย่าง
            GenerateTerrain();
            GenerateRiver();
            GenerateKeyLocations();
            GenerateDecorations();
            GenerateManagers();
            GenerateGameUI();

            // Bake NavMesh
            BakeNavMesh();

            // บันทึก Scene
            SaveScene();

            EditorUtility.DisplayDialog("สำเร็จ!", 
                "สร้าง Mission Map เสร็จสมบูรณ์!\n\n" +
                "- Terrain with hills\n" +
                "- River (center)\n" +
                "- Trees & Rocks\n" +
                "- NavMesh baked\n" +
                "- Key locations placed", "OK");
        }

        private void SetupCameraAndLighting()
        {
            // Camera (RTS View)
            Camera mainCam = Camera.main;
            if (mainCam != null)
            {
                mainCam.transform.position = new Vector3(mapSize / 2f, 60, mapSize * 0.2f);
                mainCam.transform.rotation = Quaternion.Euler(55, 0, 0);
                mainCam.fieldOfView = 60;
                mainCam.farClipPlane = 500;
            }

            // Directional Light (Warm Sunset)
            GameObject dirLight = GameObject.Find("Directional Light");
            if (dirLight != null)
            {
                dirLight.transform.rotation = Quaternion.Euler(35, 135, 0);
                var light = dirLight.GetComponent<Light>();
                light.color = new Color(1f, 0.92f, 0.8f);
                light.intensity = 1.3f;
                light.shadows = LightShadows.Soft;
            }

            // Skybox & Fog
            RenderSettings.fog = true;
            RenderSettings.fogColor = new Color(0.7f, 0.8f, 0.9f);
            RenderSettings.fogMode = FogMode.Linear;
            RenderSettings.fogStartDistance = 80;
            RenderSettings.fogEndDistance = 300;
        }

        private void GenerateTerrain()
        {
            // ลบ Terrain เก่าถ้ามี
            var oldTerrain = GameObject.Find("Terrain");
            if (oldTerrain != null) DestroyImmediate(oldTerrain);

            // สร้าง TerrainData
            TerrainData terrainData = new TerrainData();
            terrainData.heightmapResolution = terrainResolution;
            terrainData.size = new Vector3(mapSize, maxHeight, mapSize);

            // สร้าง Heightmap
            float[,] heights = new float[terrainResolution, terrainResolution];
            
            for (int x = 0; x < terrainResolution; x++)
            {
                for (int z = 0; z < terrainResolution; z++)
                {
                    float xNorm = (float)x / terrainResolution;
                    float zNorm = (float)z / terrainResolution;

                    // Base height
                    float height = 0.1f;

                    // ภูเขาขอบซ้าย (กาญจนบุรี)
                    if (xNorm < 0.15f)
                    {
                        height += Mathf.PerlinNoise(xNorm * 5, zNorm * 5) * 0.3f * (0.15f - xNorm) / 0.15f;
                    }

                    // ภูเขาขอบขวา (ทิศไปอยุธยา)
                    if (xNorm > 0.85f)
                    {
                        height += Mathf.PerlinNoise(xNorm * 5, zNorm * 5) * 0.25f * (xNorm - 0.85f) / 0.15f;
                    }

                    // ภูเขาขอบบน
                    if (zNorm > 0.9f)
                    {
                        height += 0.4f * (zNorm - 0.9f) / 0.1f;
                    }

                    // ภูเขาขอบล่าง
                    if (zNorm < 0.1f)
                    {
                        height += 0.35f * (0.1f - zNorm) / 0.1f;
                    }

                    // เนินเขาเล็กๆ กลางแผนที่
                    height += Mathf.PerlinNoise(xNorm * 3 + 100, zNorm * 3 + 100) * 0.08f;

                    // ร่องแม่น้ำ (กลางแผนที่ แนวทแยง)
                    float riverCenter = 0.5f + Mathf.Sin(zNorm * Mathf.PI * 2) * 0.08f;
                    float distFromRiver = Mathf.Abs(xNorm - riverCenter);
                    float riverWidthNorm = (riverWidth / mapSize) / 2f;
                    
                    if (distFromRiver < riverWidthNorm * 2)
                    {
                        float riverDepth = 1f - (distFromRiver / (riverWidthNorm * 2));
                        height -= riverDepth * 0.15f;
                        height = Mathf.Max(0, height);
                    }

                    heights[z, x] = height;
                }
            }

            terrainData.SetHeights(0, 0, heights);

            // สร้าง Terrain Layers (Textures)
            TerrainLayer[] layers = new TerrainLayer[3];
            
            // Grass Layer
            layers[0] = new TerrainLayer();
            layers[0].diffuseTexture = AssetDatabase.GetBuiltinExtraResource<Texture2D>("Default-Checker-Gray.png");
            layers[0].tileSize = new Vector2(10, 10);
            
            // Dirt Layer
            layers[1] = new TerrainLayer();
            layers[1].diffuseTexture = AssetDatabase.GetBuiltinExtraResource<Texture2D>("Default-Checker-Gray.png");
            layers[1].tileSize = new Vector2(8, 8);
            
            // Sand/Mud Layer
            layers[2] = new TerrainLayer();
            layers[2].diffuseTexture = AssetDatabase.GetBuiltinExtraResource<Texture2D>("Default-Checker-Gray.png");
            layers[2].tileSize = new Vector2(6, 6);

            terrainData.terrainLayers = layers;

            // Paint splatmap
            float[,,] splatmap = new float[terrainData.alphamapWidth, terrainData.alphamapHeight, 3];
            for (int x = 0; x < terrainData.alphamapWidth; x++)
            {
                for (int z = 0; z < terrainData.alphamapHeight; z++)
                {
                    float xNorm = (float)x / terrainData.alphamapWidth;
                    float zNorm = (float)z / terrainData.alphamapHeight;
                    
                    float riverCenter = 0.5f + Mathf.Sin(zNorm * Mathf.PI * 2) * 0.08f;
                    float distFromRiver = Mathf.Abs(xNorm - riverCenter);
                    float riverWidthNorm = (riverWidth / mapSize) / 2f;

                    if (distFromRiver < riverWidthNorm * 1.5f)
                    {
                        // Near river - Sand/Mud
                        splatmap[z, x, 0] = 0.2f;
                        splatmap[z, x, 1] = 0.3f;
                        splatmap[z, x, 2] = 0.5f;
                    }
                    else if (heights[z * terrainResolution / terrainData.alphamapHeight, 
                                      x * terrainResolution / terrainData.alphamapWidth] > 0.25f)
                    {
                        // High ground - Dirt/Rock
                        splatmap[z, x, 0] = 0.3f;
                        splatmap[z, x, 1] = 0.7f;
                        splatmap[z, x, 2] = 0f;
                    }
                    else
                    {
                        // Normal - Grass
                        splatmap[z, x, 0] = 1f;
                        splatmap[z, x, 1] = 0f;
                        splatmap[z, x, 2] = 0f;
                    }
                }
            }
            terrainData.SetAlphamaps(0, 0, splatmap);

            // บันทึก TerrainData
            string terrainPath = "Assets/Terrain/";
            if (!AssetDatabase.IsValidFolder("Assets/Terrain"))
                AssetDatabase.CreateFolder("Assets", "Terrain");
            AssetDatabase.CreateAsset(terrainData, terrainPath + "WhiteElephantTerrain.asset");

            // สร้าง Terrain GameObject
            GameObject terrainGO = Terrain.CreateTerrainGameObject(terrainData);
            terrainGO.name = "Terrain";
            terrainGO.isStatic = true;
            terrainGO.layer = LayerMask.NameToLayer("Default");

            Debug.Log("✓ Terrain สร้างเสร็จ!");
        }

        private void GenerateRiver()
        {
            // ลบ River เก่าถ้ามี
            var oldRiver = GameObject.Find("River");
            if (oldRiver != null) DestroyImmediate(oldRiver);

            GameObject riverParent = new GameObject("River");

            // สร้าง River Segments
            int segments = 10;
            for (int i = 0; i < segments; i++)
            {
                float z = (mapSize / segments) * i + (mapSize / segments / 2);
                float x = mapSize / 2f + Mathf.Sin((float)i / segments * Mathf.PI * 2) * (mapSize * 0.08f);

                GameObject waterSegment = GameObject.CreatePrimitive(PrimitiveType.Plane);
                waterSegment.name = $"WaterSegment_{i}";
                waterSegment.transform.SetParent(riverParent.transform);
                waterSegment.transform.position = new Vector3(x, 1.5f, z);
                waterSegment.transform.localScale = new Vector3(riverWidth / 10f, 1, mapSize / segments / 10f + 0.2f);

                // Water Material
                var renderer = waterSegment.GetComponent<MeshRenderer>();
                Material waterMat = new Material(Shader.Find("Standard"));
                waterMat.color = new Color(0.2f, 0.45f, 0.6f, 0.85f);
                waterMat.SetFloat("_Smoothness", 0.9f);
                waterMat.SetFloat("_Metallic", 0.1f);
                renderer.material = waterMat;

                // ลบ Collider เพื่อไม่ให้กระทบ NavMesh
                DestroyImmediate(waterSegment.GetComponent<Collider>());
            }

            // River Crossing Point (จุดข้ามแม่น้ำ)
            GameObject crossing = new GameObject("RiverCrossing");
            crossing.transform.SetParent(riverParent.transform);
            crossing.transform.position = new Vector3(mapSize / 2f, 0, mapSize / 2f);

            // Bridge placeholder
            GameObject bridge = GameObject.CreatePrimitive(PrimitiveType.Cube);
            bridge.name = "Bridge";
            bridge.transform.SetParent(crossing.transform);
            bridge.transform.position = new Vector3(mapSize / 2f, 2, mapSize / 2f);
            bridge.transform.localScale = new Vector3(riverWidth + 5, 0.5f, 8);
            bridge.isStatic = true;
            bridge.GetComponent<MeshRenderer>().material.color = new Color(0.4f, 0.3f, 0.2f);

            Debug.Log("✓ River สร้างเสร็จ!");
        }

        private void GenerateKeyLocations()
        {
            // ลบของเก่า
            var oldLocations = GameObject.Find("--- KEY LOCATIONS ---");
            if (oldLocations != null) DestroyImmediate(oldLocations);

            GameObject locationsParent = new GameObject("--- KEY LOCATIONS ---");

            // === จุดเกิดผู้เล่น (กาญจนบุรี - ซ้ายล่าง) ===
            GameObject playerStart = CreateLocationMarker("PlayerStart_Kanchanaburi", 
                new Vector3(25, 0, 25), Color.blue);
            playerStart.transform.SetParent(locationsParent.transform);

            // Rally Point
            GameObject rallyPoint = CreateLocationMarker("PlayerRallyPoint", 
                new Vector3(40, 0, 40), Color.cyan);
            rallyPoint.transform.SetParent(locationsParent.transform);

            // === จุดหมาย (อยุธยา - ขวาบน) ===
            GameObject destination = CreateLocationMarker("Destination_Ayutthaya", 
                new Vector3(mapSize - 25, 0, mapSize - 25), Color.green);
            destination.transform.SetParent(locationsParent.transform);

            // === จุดเกิดศัตรู ===
            GameObject enemySpawn1 = CreateLocationMarker("EnemySpawn_1", 
                new Vector3(mapSize - 30, 0, mapSize / 2f), Color.red);
            enemySpawn1.transform.SetParent(locationsParent.transform);

            GameObject enemySpawn2 = CreateLocationMarker("EnemySpawn_2", 
                new Vector3(mapSize - 40, 0, mapSize - 40), Color.red);
            enemySpawn2.transform.SetParent(locationsParent.transform);

            GameObject enemySpawn3 = CreateLocationMarker("EnemySpawn_3", 
                new Vector3(mapSize / 2f + 30, 0, mapSize - 30), Color.red);
            enemySpawn3.transform.SetParent(locationsParent.transform);

            // === จุดข้ามแม่น้ำ ===
            GameObject riverCrossing = CreateLocationMarker("RiverCrossingPoint", 
                new Vector3(mapSize / 2f, 0, mapSize / 2f), Color.yellow);
            riverCrossing.transform.SetParent(locationsParent.transform);

            // === เรือข้ามฟาก ===
            GameObject bargeSpawn = CreateLocationMarker("BargeSpawnPoint", 
                new Vector3(mapSize / 2f - 15, 2, mapSize / 2f - 20), Color.magenta);
            bargeSpawn.transform.SetParent(locationsParent.transform);

            Debug.Log("✓ Key Locations วางเสร็จ!");
        }

        private GameObject CreateLocationMarker(string name, Vector3 position, Color color)
        {
            GameObject marker = new GameObject(name);
            marker.transform.position = position;

            // Visual indicator (ลบได้ภายหลัง)
            GameObject visual = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            visual.name = "Visual";
            visual.transform.SetParent(marker.transform);
            visual.transform.localPosition = Vector3.up * 2;
            visual.transform.localScale = new Vector3(3, 0.1f, 3);
            visual.GetComponent<MeshRenderer>().material.color = color;
            DestroyImmediate(visual.GetComponent<Collider>());

            // Label
            GameObject labelGO = new GameObject("Label");
            labelGO.transform.SetParent(marker.transform);
            labelGO.transform.localPosition = Vector3.up * 5;

            return marker;
        }

        private void GenerateDecorations()
        {
            // ลบของเก่า
            var oldDeco = GameObject.Find("--- DECORATIONS ---");
            if (oldDeco != null) DestroyImmediate(oldDeco);

            GameObject decoParent = new GameObject("--- DECORATIONS ---");
            
            Terrain terrain = Terrain.activeTerrain;
            if (terrain == null)
            {
                Debug.LogError("ไม่พบ Terrain! สร้าง Terrain ก่อน");
                return;
            }

            // === ต้นไม้ ===
            GameObject treesParent = new GameObject("Trees");
            treesParent.transform.SetParent(decoParent.transform);

            List<Vector3> occupiedPositions = new List<Vector3>();

            for (int i = 0; i < treeCount; i++)
            {
                Vector3 pos = GetRandomValidPosition(terrain, occupiedPositions, 8f);
                if (pos == Vector3.zero) continue;

                // ไม่วางต้นไม้ใกล้แม่น้ำมากเกินไป
                float distFromCenter = Mathf.Abs(pos.x - mapSize / 2f);
                if (distFromCenter < riverWidth) continue;

                // ไม่วางบนเส้นทางหลัก (แนวทแยงจากซ้ายล่างไปขวาบน)
                float pathX = pos.z / mapSize * mapSize;
                if (Mathf.Abs(pos.x - pathX) < 20 && pos.x < mapSize / 2f - 10) continue;

                GameObject tree = GameObject.CreatePrimitive(PrimitiveType.Capsule);
                tree.name = $"Tree_{i}";
                tree.transform.SetParent(treesParent.transform);
                tree.transform.position = pos;
                tree.transform.localScale = new Vector3(2, Random.Range(4f, 7f), 2);
                tree.isStatic = true;

                // สีเขียว
                tree.GetComponent<MeshRenderer>().material.color = 
                    new Color(0.2f + Random.value * 0.1f, 0.5f + Random.value * 0.2f, 0.15f);

                occupiedPositions.Add(pos);
            }

            // === ก้อนหิน ===
            GameObject rocksParent = new GameObject("Rocks");
            rocksParent.transform.SetParent(decoParent.transform);

            for (int i = 0; i < rockCount; i++)
            {
                Vector3 pos = GetRandomValidPosition(terrain, occupiedPositions, 5f);
                if (pos == Vector3.zero) continue;

                // วางหินตามเนินเขา (สูงกว่าค่าเฉลี่ย)
                float height = terrain.SampleHeight(pos);
                if (height < 3f && Random.value > 0.3f) continue;

                GameObject rock = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                rock.name = $"Rock_{i}";
                rock.transform.SetParent(rocksParent.transform);
                rock.transform.position = pos;
                rock.transform.localScale = new Vector3(
                    Random.Range(1.5f, 4f),
                    Random.Range(1f, 2.5f),
                    Random.Range(1.5f, 4f)
                );
                rock.transform.rotation = Quaternion.Euler(
                    Random.Range(-10f, 10f),
                    Random.Range(0f, 360f),
                    Random.Range(-10f, 10f)
                );
                rock.isStatic = true;

                // สีหิน
                rock.GetComponent<MeshRenderer>().material.color = 
                    new Color(0.4f + Random.value * 0.15f, 0.38f + Random.value * 0.1f, 0.35f);

                occupiedPositions.Add(pos);
            }

            Debug.Log($"✓ Decorations วางเสร็จ! (Trees: {treesParent.transform.childCount}, Rocks: {rocksParent.transform.childCount})");
        }

        private Vector3 GetRandomValidPosition(Terrain terrain, List<Vector3> occupied, float minDist)
        {
            for (int attempt = 0; attempt < 20; attempt++)
            {
                float x = Random.Range(15f, mapSize - 15f);
                float z = Random.Range(15f, mapSize - 15f);
                float y = terrain.SampleHeight(new Vector3(x, 0, z));

                Vector3 pos = new Vector3(x, y, z);

                // เช็คว่าห่างจากจุดอื่นพอ
                bool valid = true;
                foreach (var occ in occupied)
                {
                    if (Vector3.Distance(pos, occ) < minDist)
                    {
                        valid = false;
                        break;
                    }
                }

                if (valid) return pos;
            }
            return Vector3.zero;
        }

        private void GenerateManagers()
        {
            GameObject managers = new GameObject("--- MANAGERS ---");

            string[] managerNames = {
                "GameManager",
                "ResourceManager", 
                "MissionController",
                "ObjectiveManager",
                "FogOfWarManager",
                "SelectionManager",
                "BuildManager",
                "AudioManager"
            };

            foreach (string name in managerNames)
            {
                GameObject go = new GameObject(name);
                go.transform.SetParent(managers.transform);
            }

            // AI Commander
            GameObject aiCommander = new GameObject("AICommander");
            aiCommander.transform.SetParent(managers.transform);

            Debug.Log("✓ Managers สร้างเสร็จ!");
        }

        private void GenerateGameUI()
        {
            // สร้าง Canvas
            GameObject canvasGO = new GameObject("GameUICanvas");
            var canvas = canvasGO.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvasGO.AddComponent<UnityEngine.UI.CanvasScaler>().uiScaleMode = 
                UnityEngine.UI.CanvasScaler.ScaleMode.ScaleWithScreenSize;
            canvasGO.GetComponent<UnityEngine.UI.CanvasScaler>().referenceResolution = 
                new Vector2(1920, 1080);
            canvasGO.AddComponent<UnityEngine.UI.GraphicRaycaster>();

            // Panels (placeholders)
            CreateUIPanel("ResourcePanel", canvasGO.transform, 
                new Vector2(0, 0.92f), new Vector2(0.25f, 1f), new Color(0.1f, 0.08f, 0.05f, 0.85f));
            CreateUIPanel("MinimapPanel", canvasGO.transform, 
                new Vector2(0.78f, 0f), new Vector2(1f, 0.28f), new Color(0.05f, 0.05f, 0.05f, 0.9f));
            CreateUIPanel("ObjectivePanel", canvasGO.transform, 
                new Vector2(0.72f, 0.75f), new Vector2(0.98f, 0.98f), new Color(0.1f, 0.1f, 0.1f, 0.8f));
            CreateUIPanel("CommandPanel", canvasGO.transform, 
                new Vector2(0.2f, 0f), new Vector2(0.78f, 0.12f), new Color(0.12f, 0.1f, 0.08f, 0.9f));

            // EventSystem
            if (FindObjectOfType<UnityEngine.EventSystems.EventSystem>() == null)
            {
                GameObject eventSystem = new GameObject("EventSystem");
                eventSystem.AddComponent<UnityEngine.EventSystems.EventSystem>();
                eventSystem.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();
            }

            // Minimap Camera
            GameObject minimapCamGO = new GameObject("MinimapCamera");
            var minimapCam = minimapCamGO.AddComponent<Camera>();
            minimapCamGO.transform.position = new Vector3(mapSize / 2f, 150, mapSize / 2f);
            minimapCamGO.transform.rotation = Quaternion.Euler(90, 0, 0);
            minimapCam.orthographic = true;
            minimapCam.orthographicSize = mapSize / 2f;
            minimapCam.depth = 1;
            minimapCam.clearFlags = CameraClearFlags.SolidColor;
            minimapCam.backgroundColor = new Color(0.1f, 0.15f, 0.1f);

            Debug.Log("✓ Game UI สร้างเสร็จ!");
        }

        private void CreateUIPanel(string name, Transform parent, Vector2 anchorMin, Vector2 anchorMax, Color color)
        {
            GameObject panel = new GameObject(name);
            panel.transform.SetParent(parent, false);
            var rect = panel.AddComponent<RectTransform>();
            rect.anchorMin = anchorMin;
            rect.anchorMax = anchorMax;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            var image = panel.AddComponent<UnityEngine.UI.Image>();
            image.color = color;
        }

        private void BakeNavMesh()
        {
            // Note: NavMeshSurface requires AI Navigation package
            // Using legacy NavMesh Obstacles approach
            
            // Set all decorations as NavMesh obstacles
            var trees = GameObject.Find("Trees");
            if (trees != null)
            {
                foreach (Transform child in trees.transform)
                {
                    child.gameObject.isStatic = true;
                    var col = child.GetComponent<Collider>();
                    if (col != null)
                    {
                        // Add NavMeshObstacle for runtime
                        if (child.gameObject.GetComponent<NavMeshObstacle>() == null)
                        {
                            var obstacle = child.gameObject.AddComponent<NavMeshObstacle>();
                            obstacle.carving = true;
                            obstacle.shape = NavMeshObstacleShape.Capsule;
                            obstacle.radius = 1.5f;
                        }
                    }
                }
            }

            var rocks = GameObject.Find("Rocks");
            if (rocks != null)
            {
                foreach (Transform child in rocks.transform)
                {
                    child.gameObject.isStatic = true;
                    if (child.gameObject.GetComponent<NavMeshObstacle>() == null)
                    {
                        var obstacle = child.gameObject.AddComponent<NavMeshObstacle>();
                        obstacle.carving = true;
                    }
                }
            }

            Debug.Log("✓ NavMesh obstacles กำหนดเสร็จ! กด Window > AI > Navigation > Bake เพื่อ Bake NavMesh");
            
            // เปิด Navigation window
            EditorApplication.ExecuteMenuItem("Window/AI/Navigation");
        }

        private void SaveScene()
        {
            string folderPath = "Assets/Scenes";
            if (!AssetDatabase.IsValidFolder(folderPath))
                AssetDatabase.CreateFolder("Assets", "Scenes");

            string scenePath = folderPath + "/WhiteElephant_Mission1.unity";
            EditorSceneManager.SaveScene(EditorSceneManager.GetActiveScene(), scenePath);

            // Add to Build Settings
            var buildScenes = new List<EditorBuildSettingsScene>(EditorBuildSettings.scenes);
            if (!buildScenes.Exists(s => s.path == scenePath))
            {
                buildScenes.Add(new EditorBuildSettingsScene(scenePath, true));
                EditorBuildSettings.scenes = buildScenes.ToArray();
            }

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log($"✓ Scene บันทึกที่: {scenePath}");
        }
    }
}
#endif
