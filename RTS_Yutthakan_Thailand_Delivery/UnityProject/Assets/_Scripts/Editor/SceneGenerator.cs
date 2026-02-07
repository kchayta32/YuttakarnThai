#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;

namespace RTS.Editor
{
    /// <summary>
    /// สร้าง Scene สำหรับเกม RTS ยุทธการไทย โดยอัตโนมัติ
    /// เรียกใช้จากเมนู RTS > Generate Scenes
    /// </summary>
    public class SceneGenerator : EditorWindow
    {
        [MenuItem("RTS/Generate All Scenes")]
        public static void GenerateAllScenes()
        {
            if (EditorUtility.DisplayDialog("สร้าง Scene ทั้งหมด",
                "ต้องการสร้าง Scene ต่อไปนี้?\n\n" +
                "- MainMenu\n" +
                "- CampaignSelect\n" +
                "- WhiteElephant_Mission1",
                "สร้างเลย", "ยกเลิก"))
            {
                GenerateMainMenuScene();
                GenerateCampaignSelectScene();
                GenerateMissionScene();
                
                EditorUtility.DisplayDialog("สำเร็จ!", "สร้าง Scene ทั้ง 3 ฉากเรียบร้อย\n\nไฟล์อยู่ที่: Assets/Scenes/", "OK");
            }
        }

        [MenuItem("RTS/Generate Scenes/Main Menu")]
        public static void GenerateMainMenuScene()
        {
            // สร้าง Scene ใหม่
            Scene newScene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
            
            // === Camera Setup ===
            Camera mainCam = Camera.main;
            if (mainCam != null)
            {
                mainCam.backgroundColor = new Color(0.1f, 0.05f, 0.15f); // สีม่วงเข้ม
                mainCam.clearFlags = CameraClearFlags.SolidColor;
            }

            // === Canvas ===
            GameObject canvasGO = CreateCanvas("MainMenuCanvas");
            
            // === Background Panel ===
            GameObject bgPanel = CreateUIElement<Image>("Background", canvasGO.transform);
            RectTransform bgRect = bgPanel.GetComponent<RectTransform>();
            bgRect.anchorMin = Vector2.zero;
            bgRect.anchorMax = Vector2.one;
            bgRect.offsetMin = Vector2.zero;
            bgRect.offsetMax = Vector2.zero;
            bgPanel.GetComponent<Image>().color = new Color(0.15f, 0.1f, 0.2f);

            // === Title ===
            GameObject titleGO = CreateUIElement<TextMeshProUGUI>("GameTitle", canvasGO.transform);
            RectTransform titleRect = titleGO.GetComponent<RectTransform>();
            titleRect.anchorMin = new Vector2(0.5f, 0.8f);
            titleRect.anchorMax = new Vector2(0.5f, 0.9f);
            titleRect.sizeDelta = new Vector2(800, 100);
            var titleText = titleGO.GetComponent<TextMeshProUGUI>();
            titleText.text = "ยุทธการไทย\nRTS: Yutthakan Thailand";
            titleText.fontSize = 48;
            titleText.alignment = TextAlignmentOptions.Center;
            titleText.color = new Color(1f, 0.85f, 0.4f); // สีทอง

            // === Button Panel ===
            GameObject buttonPanel = CreateUIElement<Image>("ButtonPanel", canvasGO.transform);
            RectTransform bpRect = buttonPanel.GetComponent<RectTransform>();
            bpRect.anchorMin = new Vector2(0.3f, 0.2f);
            bpRect.anchorMax = new Vector2(0.7f, 0.65f);
            bpRect.offsetMin = Vector2.zero;
            bpRect.offsetMax = Vector2.zero;
            buttonPanel.GetComponent<Image>().color = new Color(0, 0, 0, 0.5f);

            // === Buttons ===
            CreateMenuButton("CampaignButton", "แคมเปญ", buttonPanel.transform, 0);
            CreateMenuButton("SettingsButton", "ตั้งค่า", buttonPanel.transform, 1);
            CreateMenuButton("CreditsButton", "เครดิต", buttonPanel.transform, 2);
            CreateMenuButton("QuitButton", "ออกจากเกม", buttonPanel.transform, 3);

            // === Settings Panel (Hidden) ===
            GameObject settingsPanel = CreateUIElement<Image>("SettingsPanel", canvasGO.transform);
            RectTransform spRect = settingsPanel.GetComponent<RectTransform>();
            spRect.anchorMin = new Vector2(0.2f, 0.15f);
            spRect.anchorMax = new Vector2(0.8f, 0.85f);
            spRect.offsetMin = Vector2.zero;
            spRect.offsetMax = Vector2.zero;
            settingsPanel.GetComponent<Image>().color = new Color(0.1f, 0.1f, 0.15f, 0.95f);
            settingsPanel.SetActive(false);

            // === MainMenuManager Script ===
            GameObject managerGO = new GameObject("MainMenuManager");
            // Note: Script component will be added manually in Unity since we need to link references

            // === EventSystem ===
            CreateEventSystem();

            // บันทึก Scene
            SaveScene("MainMenu");
            Debug.Log("✓ MainMenu Scene สร้างเสร็จสมบูรณ์!");
        }

        [MenuItem("RTS/Generate Scenes/Campaign Select")]
        public static void GenerateCampaignSelectScene()
        {
            Scene newScene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
            
            Camera mainCam = Camera.main;
            if (mainCam != null)
            {
                mainCam.backgroundColor = new Color(0.05f, 0.08f, 0.12f);
            }

            // === Canvas ===
            GameObject canvasGO = CreateCanvas("CampaignCanvas");

            // === Header ===
            GameObject header = CreateUIElement<Image>("Header", canvasGO.transform);
            RectTransform headerRect = header.GetComponent<RectTransform>();
            headerRect.anchorMin = new Vector2(0, 0.85f);
            headerRect.anchorMax = Vector2.one;
            headerRect.offsetMin = Vector2.zero;
            headerRect.offsetMax = Vector2.zero;
            header.GetComponent<Image>().color = new Color(0.15f, 0.1f, 0.05f, 0.9f);

            GameObject headerTitle = CreateUIElement<TextMeshProUGUI>("Title", header.transform);
            var ht = headerTitle.GetComponent<TextMeshProUGUI>();
            ht.text = "เลือกแคมเปญ";
            ht.fontSize = 42;
            ht.alignment = TextAlignmentOptions.Center;
            ht.color = new Color(1f, 0.9f, 0.6f);
            headerTitle.GetComponent<RectTransform>().anchorMin = Vector2.zero;
            headerTitle.GetComponent<RectTransform>().anchorMax = Vector2.one;

            // === Campaign List (Left Panel) ===
            GameObject campaignList = CreateUIElement<Image>("CampaignListPanel", canvasGO.transform);
            RectTransform clRect = campaignList.GetComponent<RectTransform>();
            clRect.anchorMin = new Vector2(0.02f, 0.1f);
            clRect.anchorMax = new Vector2(0.38f, 0.83f);
            clRect.offsetMin = Vector2.zero;
            clRect.offsetMax = Vector2.zero;
            campaignList.GetComponent<Image>().color = new Color(0.1f, 0.08f, 0.06f, 0.85f);

            // Add Scroll View
            GameObject scrollView = new GameObject("ScrollView");
            scrollView.transform.SetParent(campaignList.transform, false);
            scrollView.AddComponent<RectTransform>();
            var sv = scrollView.AddComponent<ScrollRect>();
            
            GameObject content = CreateUIElement<Image>("Content", scrollView.transform);
            content.GetComponent<Image>().color = Color.clear;
            var vlg = content.AddComponent<VerticalLayoutGroup>();
            vlg.spacing = 10;
            vlg.padding = new RectOffset(10, 10, 10, 10);
            content.AddComponent<ContentSizeFitter>().verticalFit = ContentSizeFitter.FitMode.PreferredSize;
            sv.content = content.GetComponent<RectTransform>();

            // === Detail Panel (Right) ===
            GameObject detailPanel = CreateUIElement<Image>("DetailPanel", canvasGO.transform);
            RectTransform dpRect = detailPanel.GetComponent<RectTransform>();
            dpRect.anchorMin = new Vector2(0.4f, 0.1f);
            dpRect.anchorMax = new Vector2(0.98f, 0.83f);
            dpRect.offsetMin = Vector2.zero;
            dpRect.offsetMax = Vector2.zero;
            detailPanel.GetComponent<Image>().color = new Color(0.08f, 0.06f, 0.04f, 0.9f);

            // Detail Title
            GameObject detailTitle = CreateUIElement<TextMeshProUGUI>("CampaignTitle", detailPanel.transform);
            RectTransform dtRect = detailTitle.GetComponent<RectTransform>();
            dtRect.anchorMin = new Vector2(0.05f, 0.85f);
            dtRect.anchorMax = new Vector2(0.95f, 0.95f);
            var dt = detailTitle.GetComponent<TextMeshProUGUI>();
            dt.text = "สงครามช้างเผือก";
            dt.fontSize = 36;
            dt.color = new Color(1f, 0.85f, 0.5f);

            // Detail Description
            GameObject detailDesc = CreateUIElement<TextMeshProUGUI>("CampaignDescription", detailPanel.transform);
            RectTransform ddRect = detailDesc.GetComponent<RectTransform>();
            ddRect.anchorMin = new Vector2(0.05f, 0.3f);
            ddRect.anchorMax = new Vector2(0.95f, 0.8f);
            var dd = detailDesc.GetComponent<TextMeshProUGUI>();
            dd.text = "พ.ศ. 2090-2092\n\nปกป้องกรุงศรีอยุธยาจากการรุกรานของพม่า\nควบคุมกองทัพช้างศึกและทหารราบ\nเรียนรู้กลยุทธ์พื้นฐานของเกม";
            dd.fontSize = 22;
            dd.color = Color.white;

            // Start Button
            GameObject startBtn = CreateUIElement<Button>("StartButton", detailPanel.transform);
            RectTransform sbRect = startBtn.GetComponent<RectTransform>();
            sbRect.anchorMin = new Vector2(0.3f, 0.05f);
            sbRect.anchorMax = new Vector2(0.7f, 0.15f);
            startBtn.GetComponent<Image>().color = new Color(0.8f, 0.6f, 0.2f);
            
            GameObject sbText = CreateUIElement<TextMeshProUGUI>("Text", startBtn.transform);
            sbText.GetComponent<RectTransform>().anchorMin = Vector2.zero;
            sbText.GetComponent<RectTransform>().anchorMax = Vector2.one;
            var sbt = sbText.GetComponent<TextMeshProUGUI>();
            sbt.text = "เริ่มภารกิจ";
            sbt.fontSize = 28;
            sbt.alignment = TextAlignmentOptions.Center;
            sbt.color = Color.white;

            // === Back Button ===
            GameObject backBtn = CreateUIElement<Button>("BackButton", canvasGO.transform);
            RectTransform bbRect = backBtn.GetComponent<RectTransform>();
            bbRect.anchorMin = new Vector2(0.02f, 0.02f);
            bbRect.anchorMax = new Vector2(0.15f, 0.08f);
            backBtn.GetComponent<Image>().color = new Color(0.4f, 0.3f, 0.2f);
            
            GameObject bbText = CreateUIElement<TextMeshProUGUI>("Text", backBtn.transform);
            bbText.GetComponent<RectTransform>().anchorMin = Vector2.zero;
            bbText.GetComponent<RectTransform>().anchorMax = Vector2.one;
            bbText.GetComponent<TextMeshProUGUI>().text = "< กลับ";
            bbText.GetComponent<TextMeshProUGUI>().fontSize = 24;
            bbText.GetComponent<TextMeshProUGUI>().alignment = TextAlignmentOptions.Center;

            CreateEventSystem();
            SaveScene("CampaignSelect");
            Debug.Log("✓ CampaignSelect Scene สร้างเสร็จสมบูรณ์!");
        }

        [MenuItem("RTS/Generate Scenes/White Elephant Mission")]
        public static void GenerateMissionScene()
        {
            Scene newScene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
            
            // === Camera Setup (RTS Style) ===
            Camera mainCam = Camera.main;
            if (mainCam != null)
            {
                mainCam.transform.position = new Vector3(50, 40, -10);
                mainCam.transform.rotation = Quaternion.Euler(50, 0, 0);
                mainCam.fieldOfView = 60;
            }

            // === Lighting ===
            GameObject dirLight = GameObject.Find("Directional Light");
            if (dirLight != null)
            {
                dirLight.transform.rotation = Quaternion.Euler(45, 45, 0);
                var light = dirLight.GetComponent<Light>();
                light.color = new Color(1f, 0.95f, 0.85f); // Warm sunlight
                light.intensity = 1.2f;
            }

            // === Terrain ===
            GameObject terrainGO = new GameObject("Terrain");
            var terrain = terrainGO.AddComponent<Terrain>();
            var terrainCollider = terrainGO.AddComponent<TerrainCollider>();
            
            TerrainData terrainData = new TerrainData();
            terrainData.heightmapResolution = 513;
            terrainData.size = new Vector3(200, 30, 200);
            terrain.terrainData = terrainData;
            terrainCollider.terrainData = terrainData;
            
            // Save terrain data asset
            string terrainPath = "Assets/Terrain/";
            if (!AssetDatabase.IsValidFolder("Assets/Terrain"))
                AssetDatabase.CreateFolder("Assets", "Terrain");
            AssetDatabase.CreateAsset(terrainData, terrainPath + "MissionTerrain.asset");

            // === Water Plane (River) ===
            GameObject water = GameObject.CreatePrimitive(PrimitiveType.Plane);
            water.name = "River";
            water.transform.position = new Vector3(100, 1, 100);
            water.transform.localScale = new Vector3(5, 1, 20);
            var waterRenderer = water.GetComponent<MeshRenderer>();
            waterRenderer.material = new Material(Shader.Find("Standard"));
            waterRenderer.material.color = new Color(0.2f, 0.5f, 0.7f, 0.8f);

            // === Game Managers ===
            GameObject managers = new GameObject("--- MANAGERS ---");
            
            GameObject gameManager = new GameObject("GameManager");
            gameManager.transform.SetParent(managers.transform);
            
            GameObject missionController = new GameObject("MissionController");
            missionController.transform.SetParent(managers.transform);
            
            GameObject objectiveManager = new GameObject("ObjectiveManager");
            objectiveManager.transform.SetParent(managers.transform);

            GameObject resourceManager = new GameObject("ResourceManager");
            resourceManager.transform.SetParent(managers.transform);

            GameObject fogOfWar = new GameObject("FogOfWarManager");
            fogOfWar.transform.SetParent(managers.transform);

            // === Spawn Points ===
            GameObject spawnPoints = new GameObject("--- SPAWN POINTS ---");
            
            GameObject playerSpawn = new GameObject("PlayerSpawn");
            playerSpawn.transform.SetParent(spawnPoints.transform);
            playerSpawn.transform.position = new Vector3(20, 0, 20);
            
            GameObject enemySpawn1 = new GameObject("EnemySpawn_1");
            enemySpawn1.transform.SetParent(spawnPoints.transform);
            enemySpawn1.transform.position = new Vector3(180, 0, 180);
            
            GameObject enemySpawn2 = new GameObject("EnemySpawn_2");
            enemySpawn2.transform.SetParent(spawnPoints.transform);
            enemySpawn2.transform.position = new Vector3(180, 0, 100);

            // === Key Locations ===
            GameObject locations = new GameObject("--- KEY LOCATIONS ---");
            
            GameObject ayutthaya = new GameObject("Destination_Ayutthaya");
            ayutthaya.transform.SetParent(locations.transform);
            ayutthaya.transform.position = new Vector3(180, 0, 20);
            
            GameObject riverCrossing = new GameObject("RiverCrossing");
            riverCrossing.transform.SetParent(locations.transform);
            riverCrossing.transform.position = new Vector3(100, 0, 100);

            // === UI Canvas ===
            GameObject canvasGO = CreateCanvas("GameUICanvas");
            
            // Resource Panel (Top)
            GameObject resourcePanel = CreateUIElement<Image>("ResourcePanel", canvasGO.transform);
            RectTransform rpRect = resourcePanel.GetComponent<RectTransform>();
            rpRect.anchorMin = new Vector2(0, 0.92f);
            rpRect.anchorMax = new Vector2(0.3f, 1f);
            rpRect.offsetMin = Vector2.zero;
            rpRect.offsetMax = Vector2.zero;
            resourcePanel.GetComponent<Image>().color = new Color(0.1f, 0.08f, 0.06f, 0.85f);

            // Minimap Panel (Bottom Right)
            GameObject minimapPanel = CreateUIElement<Image>("MinimapPanel", canvasGO.transform);
            RectTransform mpRect = minimapPanel.GetComponent<RectTransform>();
            mpRect.anchorMin = new Vector2(0.75f, 0f);
            mpRect.anchorMax = new Vector2(1f, 0.3f);
            mpRect.offsetMin = Vector2.zero;
            mpRect.offsetMax = Vector2.zero;
            minimapPanel.GetComponent<Image>().color = new Color(0.05f, 0.05f, 0.05f, 0.9f);

            // Objective Panel (Top Right)
            GameObject objectivePanel = CreateUIElement<Image>("ObjectivePanel", canvasGO.transform);
            RectTransform opRect = objectivePanel.GetComponent<RectTransform>();
            opRect.anchorMin = new Vector2(0.7f, 0.75f);
            opRect.anchorMax = new Vector2(0.98f, 0.98f);
            opRect.offsetMin = Vector2.zero;
            opRect.offsetMax = Vector2.zero;
            objectivePanel.GetComponent<Image>().color = new Color(0.1f, 0.1f, 0.1f, 0.8f);

            // Unit Command Panel (Bottom)
            GameObject commandPanel = CreateUIElement<Image>("CommandPanel", canvasGO.transform);
            RectTransform cpRect = commandPanel.GetComponent<RectTransform>();
            cpRect.anchorMin = new Vector2(0.25f, 0f);
            cpRect.anchorMax = new Vector2(0.75f, 0.15f);
            cpRect.offsetMin = Vector2.zero;
            cpRect.offsetMax = Vector2.zero;
            commandPanel.GetComponent<Image>().color = new Color(0.12f, 0.1f, 0.08f, 0.9f);

            // === Minimap Camera ===
            GameObject minimapCamGO = new GameObject("MinimapCamera");
            var minimapCam = minimapCamGO.AddComponent<Camera>();
            minimapCamGO.transform.position = new Vector3(100, 100, 100);
            minimapCamGO.transform.rotation = Quaternion.Euler(90, 0, 0);
            minimapCam.orthographic = true;
            minimapCam.orthographicSize = 100;
            minimapCam.cullingMask = ~0; // Everything
            minimapCam.depth = 1;
            
            // Create RenderTexture for minimap
            RenderTexture minimapRT = new RenderTexture(256, 256, 16);
            minimapRT.name = "MinimapRenderTexture";
            minimapCam.targetTexture = minimapRT;
            
            string rtPath = "Assets/RenderTextures/";
            if (!AssetDatabase.IsValidFolder("Assets/RenderTextures"))
                AssetDatabase.CreateFolder("Assets", "RenderTextures");
            AssetDatabase.CreateAsset(minimapRT, rtPath + "MinimapRT.asset");

            CreateEventSystem();
            SaveScene("WhiteElephant_Mission1");
            Debug.Log("✓ WhiteElephant_Mission1 Scene สร้างเสร็จสมบูรณ์!");
        }

        #region Helper Methods

        private static GameObject CreateCanvas(string name)
        {
            GameObject canvasGO = new GameObject(name);
            var canvas = canvasGO.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvasGO.AddComponent<CanvasScaler>().uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            canvasGO.GetComponent<CanvasScaler>().referenceResolution = new Vector2(1920, 1080);
            canvasGO.AddComponent<GraphicRaycaster>();
            return canvasGO;
        }

        private static GameObject CreateUIElement<T>(string name, Transform parent) where T : Component
        {
            GameObject go = new GameObject(name);
            go.transform.SetParent(parent, false);
            go.AddComponent<RectTransform>();
            go.AddComponent<T>();
            return go;
        }

        private static void CreateMenuButton(string name, string text, Transform parent, int index)
        {
            GameObject btnGO = new GameObject(name);
            btnGO.transform.SetParent(parent, false);
            
            var rect = btnGO.AddComponent<RectTransform>();
            rect.anchorMin = new Vector2(0.1f, 0.75f - index * 0.2f);
            rect.anchorMax = new Vector2(0.9f, 0.9f - index * 0.2f);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;

            var image = btnGO.AddComponent<Image>();
            image.color = new Color(0.6f, 0.45f, 0.2f);
            
            btnGO.AddComponent<Button>();

            GameObject textGO = new GameObject("Text");
            textGO.transform.SetParent(btnGO.transform, false);
            var textRect = textGO.AddComponent<RectTransform>();
            textRect.anchorMin = Vector2.zero;
            textRect.anchorMax = Vector2.one;
            textRect.offsetMin = Vector2.zero;
            textRect.offsetMax = Vector2.zero;
            
            var tmp = textGO.AddComponent<TextMeshProUGUI>();
            tmp.text = text;
            tmp.fontSize = 32;
            tmp.alignment = TextAlignmentOptions.Center;
            tmp.color = Color.white;
        }

        private static void CreateEventSystem()
        {
            if (GameObject.FindObjectOfType<UnityEngine.EventSystems.EventSystem>() == null)
            {
                GameObject eventSystem = new GameObject("EventSystem");
                eventSystem.AddComponent<UnityEngine.EventSystems.EventSystem>();
                eventSystem.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();
            }
        }

        private static void SaveScene(string sceneName)
        {
            string folderPath = "Assets/Scenes";
            if (!AssetDatabase.IsValidFolder(folderPath))
            {
                AssetDatabase.CreateFolder("Assets", "Scenes");
            }
            
            string scenePath = folderPath + "/" + sceneName + ".unity";
            EditorSceneManager.SaveScene(EditorSceneManager.GetActiveScene(), scenePath);
            
            // Add to build settings
            var buildScenes = new System.Collections.Generic.List<EditorBuildSettingsScene>(EditorBuildSettings.scenes);
            if (!buildScenes.Exists(s => s.path == scenePath))
            {
                buildScenes.Add(new EditorBuildSettingsScene(scenePath, true));
                EditorBuildSettings.scenes = buildScenes.ToArray();
            }
        }

        #endregion
    }
}
#endif
