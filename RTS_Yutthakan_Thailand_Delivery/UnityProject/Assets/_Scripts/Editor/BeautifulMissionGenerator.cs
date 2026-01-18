#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.UI;
using TMPro;
using System.Collections.Generic;

/// <summary>
/// สร้าง Mission Scene สวยงาม พร้อม Decorations และ Units
/// White Elephant Campaign - Battle of Kanchanaburi
/// </summary>
public class BeautifulMissionGenerator : EditorWindow
{
    // Materials
    static Material grassMat, darkGrassMat, sandMat, waterMat, riverBedMat;
    static Material woodMat, stoneMat, roofMat, goldMat;
    static Material treeTrunkMat, treeLeavesMat, bushMat, rockMat;
    
    [MenuItem("Tools/RTS Thai/Generate Beautiful Mission Scene")]
    public static void GenerateBeautifulScene()
    {
        // Create new scene
        var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
        
        // Initialize materials
        InitMaterials();
        
        // Generate scene elements
        CreateBeautifulGround();
        CreateBeautifulRiver();
        CreateEnvironmentDecorations();
        CreateVillages();
        CreateSpawnPoints();
        CreateObjectiveAreas();
        CreateGameManagers();
        SetupCamera();
        SetupBeautifulLighting();
        CreateUI();
        
        // Auto spawn units (need prefabs first)
        TryAutoSpawnUnits();
        
        // Ensure folder
        if (!AssetDatabase.IsValidFolder("Assets/_Scenes"))
            AssetDatabase.CreateFolder("Assets", "_Scenes");
        
        // Save
        EditorSceneManager.SaveScene(scene, "Assets/_Scenes/WhiteElephant_Mission1_Beautiful.unity");
        
        Debug.Log("✅ Beautiful Mission Scene created!");
        EditorUtility.DisplayDialog("Success", 
            "สร้าง Mission Scene สวยงามเสร็จแล้ว!\n\n" +
            "✅ Ground with grass variations\n" +
            "✅ Beautiful river with banks\n" +
            "✅ Trees & vegetation (50+)\n" +
            "✅ Thai villages (2)\n" +
            "✅ Rocks & decorations\n" +
            "✅ Spawn points with flags\n" +
            "✅ Objective markers\n" +
            "✅ Beautiful lighting & fog\n" +
            "✅ UI overlay\n" +
            "✅ Auto-spawned units\n\n" +
            "Scene: WhiteElephant_Mission1_Beautiful.unity", "OK");
    }
    
    static void InitMaterials()
    {
        // Ground materials
        grassMat = CreateMat(new Color(0.35f, 0.55f, 0.25f));
        darkGrassMat = CreateMat(new Color(0.28f, 0.45f, 0.2f));
        sandMat = CreateMat(new Color(0.76f, 0.7f, 0.5f));
        waterMat = CreateMat(new Color(0.2f, 0.45f, 0.7f, 0.85f));
        riverBedMat = CreateMat(new Color(0.35f, 0.3f, 0.25f));
        
        // Structure materials
        woodMat = CreateMat(new Color(0.5f, 0.35f, 0.2f));
        stoneMat = CreateMat(new Color(0.6f, 0.58f, 0.55f));
        roofMat = CreateMat(new Color(0.6f, 0.25f, 0.15f));
        goldMat = CreateMetallic(new Color(1f, 0.84f, 0f), 0.8f);
        
        // Nature materials
        treeTrunkMat = CreateMat(new Color(0.4f, 0.28f, 0.15f));
        treeLeavesMat = CreateMat(new Color(0.2f, 0.5f, 0.15f));
        bushMat = CreateMat(new Color(0.25f, 0.45f, 0.18f));
        rockMat = CreateMat(new Color(0.5f, 0.48f, 0.45f));
    }
    
    static Material CreateMat(Color c)
    {
        var m = new Material(Shader.Find("Standard"));
        m.color = c;
        return m;
    }
    
    static Material CreateMetallic(Color c, float metal)
    {
        var m = new Material(Shader.Find("Standard"));
        m.color = c;
        m.SetFloat("_Metallic", metal);
        m.SetFloat("_Glossiness", 0.7f);
        return m;
    }
    
    // ==================== GROUND ====================
    
    static void CreateBeautifulGround()
    {
        GameObject groundParent = new GameObject("Ground");
        
        // Main grass area (center)
        for (int x = 0; x < 10; x++)
        {
            for (int z = 0; z < 10; z++)
            {
                GameObject plane = GameObject.CreatePrimitive(PrimitiveType.Plane);
                plane.name = $"Grass_{x}_{z}";
                plane.transform.parent = groundParent.transform;
                
                float posX = (x - 5) * 20 + 10;
                float posZ = (z - 5) * 20 + 10;
                plane.transform.position = new Vector3(posX, 0, posZ);
                plane.transform.localScale = new Vector3(2, 1, 2);
                
                // Vary grass color slightly
                bool darker = (x + z) % 3 == 0;
                plane.GetComponent<Renderer>().sharedMaterial = darker ? darkGrassMat : grassMat;
            }
        }
        
        // Sand areas near river
        CreateGroundPatch(groundParent.transform, new Vector3(-30, 0.01f, 0), 15, sandMat, "SandArea1");
        CreateGroundPatch(groundParent.transform, new Vector3(20, 0.01f, 30), 12, sandMat, "SandArea2");
    }
    
    static void CreateGroundPatch(Transform parent, Vector3 pos, float size, Material mat, string name)
    {
        var patch = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        patch.name = name;
        patch.transform.parent = parent;
        patch.transform.position = pos;
        patch.transform.localScale = new Vector3(size, 0.05f, size);
        patch.GetComponent<Renderer>().sharedMaterial = mat;
    }
    
    // ==================== RIVER ====================
    
    static void CreateBeautifulRiver()
    {
        GameObject river = new GameObject("River");
        
        // River bed (darker underneath)
        for (int i = 0; i < 15; i++)
        {
            float t = i / 14f;
            float x = Mathf.Lerp(-60, 60, t) + Mathf.Sin(t * Mathf.PI * 1.5f) * 25;
            float z = Mathf.Lerp(-85, 85, t);
            
            // River bed
            var bed = CreateBox(river.transform, new Vector3(x, -0.8f, z), 
                new Vector3(18, 1, 22), riverBedMat, $"Bed_{i}");
            bed.transform.rotation = Quaternion.Euler(0, Mathf.Sin(t * Mathf.PI) * 25, 0);
            
            // Water surface
            var water = CreateBox(river.transform, new Vector3(x, -0.1f, z), 
                new Vector3(16, 0.3f, 20), waterMat, $"Water_{i}");
            water.transform.rotation = bed.transform.rotation;
        }
        
        // River banks (sand/mud)
        for (int i = 0; i < 12; i++)
        {
            float t = i / 11f;
            float x = Mathf.Lerp(-55, 55, t) + Mathf.Sin(t * Mathf.PI * 1.5f) * 25;
            float z = Mathf.Lerp(-80, 80, t);
            
            // Left bank
            CreateBox(river.transform, new Vector3(x - 12, 0.05f, z), 
                new Vector3(6, 0.15f, 18), sandMat, $"BankL_{i}");
            
            // Right bank
            CreateBox(river.transform, new Vector3(x + 12, 0.05f, z), 
                new Vector3(6, 0.15f, 18), sandMat, $"BankR_{i}");
        }
        
        // Bridge
        CreateBridge(river.transform, new Vector3(0, 0.5f, 0));
    }
    
    static void CreateBridge(Transform parent, Vector3 pos)
    {
        GameObject bridge = new GameObject("Bridge");
        bridge.transform.parent = parent;
        bridge.transform.position = pos;
        
        // Bridge deck
        CreateBox(bridge.transform, Vector3.zero, new Vector3(6, 0.4f, 22), woodMat, "Deck");
        
        // Railings
        CreateBox(bridge.transform, new Vector3(-2.5f, 0.6f, 0), new Vector3(0.3f, 0.8f, 22), woodMat, "RailL");
        CreateBox(bridge.transform, new Vector3(2.5f, 0.6f, 0), new Vector3(0.3f, 0.8f, 22), woodMat, "RailR");
        
        // Support pillars
        for (int i = -2; i <= 2; i++)
        {
            CreateCyl(bridge.transform, new Vector3(-2, -0.5f, i * 5), new Vector3(0.4f, 1.2f, 0.4f), woodMat, $"PillarL_{i}");
            CreateCyl(bridge.transform, new Vector3(2, -0.5f, i * 5), new Vector3(0.4f, 1.2f, 0.4f), woodMat, $"PillarR_{i}");
        }
    }
    
    // ==================== DECORATIONS ====================
    
    static void CreateEnvironmentDecorations()
    {
        GameObject decor = new GameObject("Decorations");
        
        // Trees
        GameObject trees = new GameObject("Trees");
        trees.transform.parent = decor.transform;
        
        // Forest areas
        CreateForest(trees.transform, new Vector3(-70, 0, -50), 15, 8);
        CreateForest(trees.transform, new Vector3(70, 0, 50), 12, 6);
        CreateForest(trees.transform, new Vector3(-60, 0, 60), 10, 5);
        CreateForest(trees.transform, new Vector3(60, 0, -60), 10, 5);
        
        // Scattered trees
        for (int i = 0; i < 20; i++)
        {
            Vector3 pos = new Vector3(
                Random.Range(-80f, 80f),
                0,
                Random.Range(-80f, 80f)
            );
            
            // Avoid river area
            if (Mathf.Abs(pos.x - Mathf.Sin(pos.z * 0.02f) * 25) < 20) continue;
            
            CreateTree(trees.transform, pos, Random.Range(0.8f, 1.3f));
        }
        
        // Bushes
        GameObject bushes = new GameObject("Bushes");
        bushes.transform.parent = decor.transform;
        
        for (int i = 0; i < 40; i++)
        {
            Vector3 pos = new Vector3(
                Random.Range(-85f, 85f),
                0,
                Random.Range(-85f, 85f)
            );
            CreateBush(bushes.transform, pos, Random.Range(0.5f, 1.2f));
        }
        
        // Rocks
        GameObject rocks = new GameObject("Rocks");
        rocks.transform.parent = decor.transform;
        
        for (int i = 0; i < 25; i++)
        {
            Vector3 pos = new Vector3(
                Random.Range(-85f, 85f),
                0,
                Random.Range(-85f, 85f)
            );
            CreateRock(rocks.transform, pos, Random.Range(0.8f, 2.5f));
        }
    }
    
    static void CreateForest(Transform parent, Vector3 center, float radius, int count)
    {
        for (int i = 0; i < count; i++)
        {
            Vector2 offset = Random.insideUnitCircle * radius;
            Vector3 pos = center + new Vector3(offset.x, 0, offset.y);
            CreateTree(parent, pos, Random.Range(0.9f, 1.4f));
        }
    }
    
    static void CreateTree(Transform parent, Vector3 pos, float scale)
    {
        GameObject tree = new GameObject("Tree");
        tree.transform.parent = parent;
        tree.transform.position = pos;
        
        // Trunk
        CreateCyl(tree.transform, Vector3.up * scale * 2, new Vector3(0.4f * scale, 2 * scale, 0.4f * scale), 
            treeTrunkMat, "Trunk");
        
        // Canopy (layered spheres for palm-like appearance)
        CreateSphere(tree.transform, Vector3.up * scale * 4.5f, Vector3.one * 2.5f * scale, treeLeavesMat, "Canopy1");
        CreateSphere(tree.transform, Vector3.up * scale * 5.5f, Vector3.one * 2f * scale, treeLeavesMat, "Canopy2");
        CreateSphere(tree.transform, Vector3.up * scale * 3.8f + Vector3.right * scale, 
            Vector3.one * 1.8f * scale, treeLeavesMat, "Canopy3");
    }
    
    static void CreateBush(Transform parent, Vector3 pos, float scale)
    {
        GameObject bush = new GameObject("Bush");
        bush.transform.parent = parent;
        bush.transform.position = pos;
        
        CreateSphere(bush.transform, Vector3.up * scale * 0.4f, Vector3.one * scale, bushMat, "Leaves");
        
        if (scale > 0.8f)
        {
            CreateSphere(bush.transform, Vector3.up * scale * 0.3f + Vector3.right * scale * 0.4f, 
                Vector3.one * scale * 0.6f, bushMat, "Leaves2");
        }
    }
    
    static void CreateRock(Transform parent, Vector3 pos, float scale)
    {
        GameObject rock = CreateSphere(parent, pos + Vector3.up * scale * 0.3f, 
            new Vector3(scale, scale * 0.6f, scale * 0.8f), rockMat, "Rock");
        rock.transform.rotation = Quaternion.Euler(Random.Range(-10f, 10f), Random.Range(0f, 360f), Random.Range(-10f, 10f));
    }
    
    // ==================== VILLAGES ====================
    
    static void CreateVillages()
    {
        GameObject villages = new GameObject("Villages");
        
        // Thai village (southwest)
        CreateVillage(villages.transform, new Vector3(-40, 0, -45), "ThaiVillage", true);
        
        // Contested village (center-west)
        CreateVillage(villages.transform, new Vector3(-25, 0, -20), "ContestedVillage", false);
    }
    
    static void CreateVillage(Transform parent, Vector3 center, string name, bool addTemple)
    {
        GameObject village = new GameObject(name);
        village.transform.parent = parent;
        village.transform.position = center;
        
        // Houses
        for (int i = 0; i < 5; i++)
        {
            Vector3 offset = new Vector3(
                Mathf.Cos(i * 72 * Mathf.Deg2Rad) * 12,
                0,
                Mathf.Sin(i * 72 * Mathf.Deg2Rad) * 12
            );
            CreateThaiHouse(village.transform, offset, 1f + i * 0.1f);
        }
        
        // Temple (if Thai village)
        if (addTemple)
        {
            CreateTemple(village.transform, Vector3.up * 0.5f);
        }
        
        // Village center decoration
        CreateCyl(village.transform, Vector3.up * 0.3f, new Vector3(3, 0.3f, 3), sandMat, "Plaza");
    }
    
    static void CreateThaiHouse(Transform parent, Vector3 pos, float scale)
    {
        GameObject house = new GameObject("House");
        house.transform.parent = parent;
        house.transform.position = pos;
        
        // Stilts
        for (int x = 0; x < 2; x++)
        {
            for (int z = 0; z < 2; z++)
            {
                CreateCyl(house.transform, 
                    new Vector3((x - 0.5f) * 2.5f * scale, 1 * scale, (z - 0.5f) * 3 * scale),
                    new Vector3(0.2f * scale, 1 * scale, 0.2f * scale), woodMat, $"Stilt_{x}{z}");
            }
        }
        
        // Floor
        CreateBox(house.transform, Vector3.up * 2 * scale, 
            new Vector3(3.5f * scale, 0.2f * scale, 4.5f * scale), woodMat, "Floor");
        
        // Walls
        CreateBox(house.transform, Vector3.up * 3 * scale, 
            new Vector3(3.2f * scale, 1.8f * scale, 4.2f * scale), woodMat, "Walls");
        
        // Roof (triangular - use two tilted cubes)
        var roofL = CreateBox(house.transform, new Vector3(-0.8f * scale, 4.3f * scale, 0), 
            new Vector3(2.2f * scale, 0.15f * scale, 5f * scale), roofMat, "RoofL");
        roofL.transform.localRotation = Quaternion.Euler(0, 0, 25);
        
        var roofR = CreateBox(house.transform, new Vector3(0.8f * scale, 4.3f * scale, 0), 
            new Vector3(2.2f * scale, 0.15f * scale, 5f * scale), roofMat, "RoofR");
        roofR.transform.localRotation = Quaternion.Euler(0, 0, -25);
    }
    
    static void CreateTemple(Transform parent, Vector3 pos)
    {
        GameObject temple = new GameObject("Temple");
        temple.transform.parent = parent;
        temple.transform.position = pos;
        
        // Base platform
        CreateBox(temple.transform, Vector3.up * 0.4f, new Vector3(12, 0.8f, 14), stoneMat, "Base");
        
        // Main building
        CreateBox(temple.transform, Vector3.up * 3, new Vector3(8, 4, 10), stoneMat, "MainHall");
        
        // Tiered roof
        CreateBox(temple.transform, Vector3.up * 5.5f, new Vector3(10, 0.5f, 12), roofMat, "Roof1");
        CreateBox(temple.transform, Vector3.up * 6.5f, new Vector3(7, 0.5f, 9), roofMat, "Roof2");
        CreateBox(temple.transform, Vector3.up * 7.3f, new Vector3(4, 0.5f, 6), roofMat, "Roof3");
        
        // Spire
        CreateCyl(temple.transform, Vector3.up * 9, new Vector3(0.5f, 2, 0.5f), goldMat, "Spire");
        CreateSphere(temple.transform, Vector3.up * 11.5f, Vector3.one * 0.8f, goldMat, "SpireTop");
        
        // Entrance columns
        CreateCyl(temple.transform, new Vector3(-3, 2.5f, 5.5f), new Vector3(0.6f, 2.5f, 0.6f), goldMat, "ColumnL");
        CreateCyl(temple.transform, new Vector3(3, 2.5f, 5.5f), new Vector3(0.6f, 2.5f, 0.6f), goldMat, "ColumnR");
    }
    
    // ==================== SPAWN POINTS ====================
    
    static void CreateSpawnPoints()
    {
        GameObject spawns = new GameObject("SpawnPoints");
        
        // Thai spawns
        CreateFlaggedSpawn(spawns.transform, "Thai_Army_Spawn", new Vector3(-60, 0, -60), 
            new Color(0.1f, 0.3f, 0.7f), "ฝ่ายไทย");
        CreateFlaggedSpawn(spawns.transform, "Thai_Elephant_Spawn", new Vector3(-50, 0, -70), 
            new Color(0.2f, 0.4f, 0.8f), "ช้างศึกไทย");
        
        // Burma spawns
        CreateFlaggedSpawn(spawns.transform, "Burma_Army_Spawn", new Vector3(60, 0, 60), 
            new Color(0.7f, 0.15f, 0.15f), "ฝ่ายพม่า");
        CreateFlaggedSpawn(spawns.transform, "Burma_Siege_Spawn", new Vector3(50, 0, 70), 
            new Color(0.8f, 0.2f, 0.1f), "หอรบพม่า");
    }
    
    static void CreateFlaggedSpawn(Transform parent, string name, Vector3 pos, Color color, string label)
    {
        GameObject spawn = new GameObject(name);
        spawn.transform.parent = parent;
        spawn.transform.position = pos;
        
        // Flag pole
        CreateCyl(spawn.transform, Vector3.up * 4, new Vector3(0.15f, 4, 0.15f), woodMat, "Pole");
        
        // Flag
        var flag = CreateBox(spawn.transform, new Vector3(1, 7, 0), new Vector3(2.5f, 1.5f, 0.05f), 
            CreateMat(color), "Flag");
        
        // Ground marker
        var marker = CreateCyl(spawn.transform, Vector3.up * 0.1f, new Vector3(5, 0.15f, 5), 
            CreateMat(new Color(color.r, color.g, color.b, 0.4f)), "Marker");
        
        // Label
        CreateTextLabel(spawn.transform, label, Vector3.up * 9, color);
    }
    
    // ==================== OBJECTIVES ====================
    
    static void CreateObjectiveAreas()
    {
        GameObject objectives = new GameObject("Objectives");
        
        CreateObjective(objectives.transform, "Obj_DefendVillage", new Vector3(-35, 0, -40),
            new Color(1f, 0.9f, 0.2f), "ปกป้องหมู่บ้าน", 12);
        
        CreateObjective(objectives.transform, "Obj_SecureBridge", new Vector3(0, 0, 0),
            new Color(0.3f, 0.8f, 0.3f), "ยึดสะพาน", 10);
        
        CreateObjective(objectives.transform, "Obj_ElephantDuel", new Vector3(25, 0, 35),
            new Color(0.8f, 0.3f, 0.8f), "ที่ดวลช้างศึก", 15);
        
        CreateObjective(objectives.transform, "Obj_DefeatEnemy", new Vector3(55, 0, 55),
            new Color(0.9f, 0.2f, 0.2f), "ปราบแม่ทัพพม่า", 12);
    }
    
    static void CreateObjective(Transform parent, string name, Vector3 pos, Color color, string label, float radius)
    {
        GameObject obj = new GameObject(name);
        obj.transform.parent = parent;
        obj.transform.position = pos;
        
        // Glowing ring
        var ring = CreateCyl(obj.transform, Vector3.up * 0.1f, new Vector3(radius, 0.1f, radius),
            CreateMat(new Color(color.r, color.g, color.b, 0.3f)), "Ring");
        
        // Flag pole
        CreateCyl(obj.transform, Vector3.up * 4, new Vector3(0.2f, 4, 0.2f), stoneMat, "Pole");
        
        // Banner
        var banner = CreateBox(obj.transform, new Vector3(0.8f, 7, 0), new Vector3(2f, 2f, 0.1f),
            CreateMat(color), "Banner");
        
        // Label
        CreateTextLabel(obj.transform, label, Vector3.up * 10, color);
    }
    
    // ==================== MANAGERS & CAMERA ====================
    
    static void CreateGameManagers()
    {
        GameObject managers = new GameObject("_GameManagers");
        
        new GameObject("MissionController").transform.parent = managers.transform;
        new GameObject("ResourceManager").transform.parent = managers.transform;
        new GameObject("SelectionManager").transform.parent = managers.transform;
        new GameObject("CombatManager").transform.parent = managers.transform;
    }
    
    static void SetupCamera()
    {
        Camera cam = Camera.main;
        if (cam)
        {
            cam.transform.position = new Vector3(-20, 50, -70);
            cam.transform.rotation = Quaternion.Euler(40, 20, 0);
            cam.fieldOfView = 55;
            cam.farClipPlane = 500;
            cam.backgroundColor = new Color(0.5f, 0.65f, 0.85f);
        }
        
        // Minimap camera
        GameObject minimapCam = new GameObject("MinimapCamera");
        var mc = minimapCam.AddComponent<Camera>();
        mc.transform.position = new Vector3(0, 150, 0);
        mc.transform.rotation = Quaternion.Euler(90, 0, 0);
        mc.orthographic = true;
        mc.orthographicSize = 100;
        mc.depth = -1;
        mc.clearFlags = CameraClearFlags.SolidColor;
        mc.backgroundColor = new Color(0.15f, 0.25f, 0.15f);
    }
    
    static void SetupBeautifulLighting()
    {
        // Find directional light
        var lights = Object.FindObjectsOfType<Light>();
        foreach (var light in lights)
        {
            if (light.type == LightType.Directional)
            {
                light.transform.rotation = Quaternion.Euler(45, -45, 0);
                light.intensity = 1.4f;
                light.color = new Color(1f, 0.95f, 0.85f); // Warm afternoon
                light.shadows = LightShadows.Soft;
                light.shadowStrength = 0.6f;
            }
        }
        
        // Ambient
        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Trilight;
        RenderSettings.ambientSkyColor = new Color(0.65f, 0.75f, 0.9f);
        RenderSettings.ambientEquatorColor = new Color(0.55f, 0.5f, 0.4f);
        RenderSettings.ambientGroundColor = new Color(0.3f, 0.35f, 0.25f);
        
        // Fog for depth
        RenderSettings.fog = true;
        RenderSettings.fogMode = FogMode.Linear;
        RenderSettings.fogColor = new Color(0.7f, 0.75f, 0.85f);
        RenderSettings.fogStartDistance = 100;
        RenderSettings.fogEndDistance = 300;
    }
    
    // ==================== UI ====================
    
    static void CreateUI()
    {
        GameObject canvas = new GameObject("GameUI");
        var c = canvas.AddComponent<Canvas>();
        c.renderMode = RenderMode.ScreenSpaceOverlay;
        var scaler = canvas.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1920, 1080);
        canvas.AddComponent<GraphicRaycaster>();
        
        // Title
        CreateUIText(canvas.transform, "MissionTitle", "ยุทธนาวี: สงครามช้างเผือก", 
            new Vector2(0.5f, 1), new Vector2(0, -30), 32, Color.white);
        
        // Objective panel (top-left)
        CreateUIPanel(canvas.transform, "ObjectivePanel", new Vector2(0, 1), new Vector2(10, -10),
            new Vector2(280, 120), new Color(0, 0, 0, 0.7f));
    }
    
    static void CreateUIText(Transform parent, string name, string text, Vector2 anchor, Vector2 pos, int size, Color color)
    {
        GameObject obj = new GameObject(name);
        obj.transform.SetParent(parent);
        var rect = obj.AddComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = anchor;
        rect.pivot = anchor;
        rect.anchoredPosition = pos;
        rect.sizeDelta = new Vector2(500, 50);
        
        var tmp = obj.AddComponent<TextMeshProUGUI>();
        tmp.text = text;
        tmp.fontSize = size;
        tmp.color = color;
        tmp.alignment = TextAlignmentOptions.Center;
    }
    
    static void CreateUIPanel(Transform parent, string name, Vector2 anchor, Vector2 pos, Vector2 size, Color color)
    {
        GameObject obj = new GameObject(name);
        obj.transform.SetParent(parent);
        var rect = obj.AddComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = anchor;
        rect.pivot = anchor;
        rect.anchoredPosition = pos;
        rect.sizeDelta = size;
        
        var img = obj.AddComponent<Image>();
        img.color = color;
    }
    
    // ==================== AUTO SPAWN ====================
    
    static void TryAutoSpawnUnits()
    {
        // Check if prefabs exist
        string[] thaiUnits = { "Thai_Swordsman", "Thai_Pikeman", "Thai_Archer", "Thai_WarElephant" };
        string[] burmaUnits = { "Burma_Swordsman", "Burma_Pikeman", "Burma_WarElephant" };
        
        GameObject unitsParent = new GameObject("Units");
        
        // Thai units
        SpawnSquad(unitsParent.transform, "Thai", new Vector3(-60, 0, -60), thaiUnits);
        
        // Burma units
        SpawnSquad(unitsParent.transform, "Burma", new Vector3(60, 0, 60), burmaUnits);
    }
    
    static void SpawnSquad(Transform parent, string team, Vector3 center, string[] unitNames)
    {
        int i = 0;
        foreach (var name in unitNames)
        {
            string path = $"Assets/_Prefabs/Units/{team}/{name}.prefab";
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(path);
            
            if (prefab != null)
            {
                Vector3 offset = new Vector3((i % 3 - 1) * 5, 0, (i / 3) * 5);
                var instance = (GameObject)PrefabUtility.InstantiatePrefab(prefab);
                instance.transform.parent = parent;
                instance.transform.position = center + offset;
                i++;
            }
        }
    }
    
    // ==================== HELPERS ====================
    
    static GameObject CreateBox(Transform parent, Vector3 pos, Vector3 scale, Material mat, string name)
    {
        var obj = GameObject.CreatePrimitive(PrimitiveType.Cube);
        obj.name = name;
        obj.transform.parent = parent;
        obj.transform.localPosition = pos;
        obj.transform.localScale = scale;
        obj.GetComponent<Renderer>().sharedMaterial = mat;
        return obj;
    }
    
    static GameObject CreateCyl(Transform parent, Vector3 pos, Vector3 scale, Material mat, string name)
    {
        var obj = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        obj.name = name;
        obj.transform.parent = parent;
        obj.transform.localPosition = pos;
        obj.transform.localScale = scale;
        obj.GetComponent<Renderer>().sharedMaterial = mat;
        return obj;
    }
    
    static GameObject CreateSphere(Transform parent, Vector3 pos, Vector3 scale, Material mat, string name)
    {
        var obj = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        obj.name = name;
        obj.transform.parent = parent;
        obj.transform.localPosition = pos;
        obj.transform.localScale = scale;
        obj.GetComponent<Renderer>().sharedMaterial = mat;
        return obj;
    }
    
    static void CreateTextLabel(Transform parent, string text, Vector3 pos, Color color)
    {
        GameObject obj = new GameObject("Label");
        obj.transform.parent = parent;
        obj.transform.localPosition = pos;
        
        var tm = obj.AddComponent<TextMesh>();
        tm.text = text;
        tm.fontSize = 48;
        tm.characterSize = 0.08f;
        tm.alignment = TextAlignment.Center;
        tm.anchor = TextAnchor.MiddleCenter;
        tm.color = color;
    }
}
#endif
