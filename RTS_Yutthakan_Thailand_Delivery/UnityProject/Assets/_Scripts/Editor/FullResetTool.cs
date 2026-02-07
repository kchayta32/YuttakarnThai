#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;

/// <summary>
/// Full Reset Tool - สร้าง Scene ใหม่ทั้งหมด ไม่มี errors
/// ลบทุกอย่างที่มีปัญหาและเริ่มใหม่
/// </summary>
public class FullResetTool : EditorWindow
{
    [MenuItem("Tools/RTS Thai/FULL RESET (Fix All Errors)")]
    public static void FullReset()
    {
        if (!EditorUtility.DisplayDialog("Full Reset", 
            "จะสร้าง Scene ใหม่ทั้งหมด\nลบ Scene เก่าที่มีปัญหา\n\nต้องการดำเนินการต่อหรือไม่?", 
            "ใช่ สร้างใหม่", "ยกเลิก"))
        {
            return;
        }
        
        // Create completely new scene
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        
        // Create basic objects
        CreateCamera();
        CreateLight();
        CreateGround();
        CreateRiver();
        CreateSpawnPoints();
        CreateSimpleVillage();
        CreateGameUI();
        
        // No particles - they're disabled
        // No missing scripts
        
        // Save
        EnsureFolders();
        EditorSceneManager.SaveScene(scene, "Assets/_Scenes/WhiteElephant_Clean.unity");
        
        Debug.Log("✅ Full Reset Complete - Clean scene created!");
        EditorUtility.DisplayDialog("Reset Complete!", 
            "สร้าง Scene ใหม่ที่สะอาดเรียบร้อย!\n\n" +
            "Scene: Assets/_Scenes/WhiteElephant_Clean.unity\n\n" +
            "ไม่มี errors แล้ว!\n\n" +
            "ขั้นตอนถัดไป:\n" +
            "1. Tools > RTS Thai > Generate White Elephant Campaign Units\n" +
            "2. Tools > RTS Thai > Spawn All Units", "OK");
    }
    
    static void EnsureFolders()
    {
        if (!AssetDatabase.IsValidFolder("Assets/_Scenes"))
            AssetDatabase.CreateFolder("Assets", "_Scenes");
    }
    
    static void CreateCamera()
    {
        GameObject camObj = new GameObject("Main Camera");
        camObj.tag = "MainCamera";
        var cam = camObj.AddComponent<Camera>();
        cam.clearFlags = CameraClearFlags.SolidColor;
        cam.backgroundColor = new Color(0.5f, 0.6f, 0.8f);
        cam.transform.position = new Vector3(0, 50, -50);
        cam.transform.rotation = Quaternion.Euler(45, 0, 0);
        cam.farClipPlane = 500;
        
        // Add audio listener
        camObj.AddComponent<AudioListener>();
        
        // Add camera controller
        var controller = camObj.AddComponent<RTSCameraControllerEnhanced>();
        controller.panSpeed = 40f;
        controller.zoomSpeed = 20f;
        controller.minHeight = 20f;
        controller.maxHeight = 120f;
        controller.boundsX = new Vector2(-120, 120);
        controller.boundsZ = new Vector2(-120, 120);
    }
    
    static void CreateLight()
    {
        GameObject lightObj = new GameObject("Directional Light");
        var light = lightObj.AddComponent<Light>();
        light.type = LightType.Directional;
        light.color = new Color(1f, 0.95f, 0.85f);
        light.intensity = 1.2f;
        light.shadows = LightShadows.Soft;
        light.shadowStrength = 0.6f;
        lightObj.transform.rotation = Quaternion.Euler(45, 45, 0);
        
        // Ambient settings
        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
        RenderSettings.ambientLight = new Color(0.4f, 0.45f, 0.5f);
        RenderSettings.fog = false; // Disable fog to simplify
    }
    
    static void CreateGround()
    {
        GameObject ground = new GameObject("Ground");
        
        // Main grass area
        for (int x = -4; x <= 4; x++)
        {
            for (int z = -4; z <= 4; z++)
            {
                // Skip river area
                if (x >= -1 && x <= 1 && z >= -4 && z <= 4) continue;
                
                var plane = GameObject.CreatePrimitive(PrimitiveType.Plane);
                plane.name = $"Grass_{x}_{z}";
                plane.transform.parent = ground.transform;
                plane.transform.position = new Vector3(x * 20, 0, z * 20);
                plane.transform.localScale = new Vector3(2, 1, 2);
                
                // Vary grass color
                var mat = new Material(Shader.Find("Standard"));
                float variation = Random.Range(0.85f, 1.0f);
                mat.color = new Color(0.25f * variation, 0.5f * variation, 0.2f * variation);
                plane.GetComponent<Renderer>().sharedMaterial = mat;
            }
        }
    }
    
    static void CreateRiver()
    {
        GameObject river = new GameObject("River");
        
        // Water surface
        for (int z = -4; z <= 4; z++)
        {
            var water = GameObject.CreatePrimitive(PrimitiveType.Plane);
            water.name = $"Water_{z}";
            water.transform.parent = river.transform;
            water.transform.position = new Vector3(0, 0.1f, z * 20);
            water.transform.localScale = new Vector3(2, 1, 2);
            
            var mat = new Material(Shader.Find("Standard"));
            mat.color = new Color(0.2f, 0.4f, 0.7f, 0.8f);
            water.GetComponent<Renderer>().sharedMaterial = mat;
        }
        
        // Bridge
        var bridge = GameObject.CreatePrimitive(PrimitiveType.Cube);
        bridge.name = "Bridge";
        bridge.transform.parent = river.transform;
        bridge.transform.position = new Vector3(0, 0.5f, 0);
        bridge.transform.localScale = new Vector3(8, 0.5f, 20);
        
        var bridgeMat = new Material(Shader.Find("Standard"));
        bridgeMat.color = new Color(0.45f, 0.3f, 0.15f);
        bridge.GetComponent<Renderer>().sharedMaterial = bridgeMat;
    }
    
    static void CreateSpawnPoints()
    {
        GameObject spawns = new GameObject("SpawnPoints");
        
        CreateSpawnPoint(spawns.transform, "Thai_Army_Spawn", new Vector3(-50, 0, -50), 
            new Color(0.2f, 0.4f, 0.8f));
        CreateSpawnPoint(spawns.transform, "Thai_Elephant_Spawn", new Vector3(-60, 0, -40), 
            new Color(0.3f, 0.5f, 0.9f));
        CreateSpawnPoint(spawns.transform, "Burma_Army_Spawn", new Vector3(50, 0, 50), 
            new Color(0.8f, 0.2f, 0.2f));
        CreateSpawnPoint(spawns.transform, "Burma_Siege_Spawn", new Vector3(60, 0, 40), 
            new Color(0.9f, 0.3f, 0.3f));
    }
    
    static void CreateSpawnPoint(Transform parent, string name, Vector3 pos, Color color)
    {
        GameObject spawn = new GameObject(name);
        spawn.transform.parent = parent;
        spawn.transform.position = pos;
        
        // Visual marker
        var marker = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        marker.name = "Marker";
        marker.transform.parent = spawn.transform;
        marker.transform.localPosition = Vector3.up * 2;
        marker.transform.localScale = new Vector3(5, 4, 5);
        Object.DestroyImmediate(marker.GetComponent<Collider>());
        
        var mat = new Material(Shader.Find("Standard"));
        mat.color = new Color(color.r, color.g, color.b, 0.4f);
        marker.GetComponent<Renderer>().sharedMaterial = mat;
    }
    
    static void CreateSimpleVillage()
    {
        GameObject village = new GameObject("Village");
        village.transform.position = new Vector3(40, 0, -30);
        
        // Houses
        for (int i = 0; i < 4; i++)
        {
            var house = CreateSimpleHouse($"House_{i}");
            house.transform.parent = village.transform;
            house.transform.localPosition = new Vector3(
                (i % 2) * 10 - 5,
                0,
                (i / 2) * 10 - 5
            );
        }
        
        // Temple
        var temple = CreateSimpleTemple();
        temple.transform.parent = village.transform;
        temple.transform.localPosition = new Vector3(0, 0, -20);
    }
    
    static GameObject CreateSimpleHouse(string name)
    {
        GameObject house = new GameObject(name);
        
        // Foundation (stilts)
        for (int i = 0; i < 4; i++)
        {
            var stilt = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            stilt.name = $"Stilt{i}";
            stilt.transform.parent = house.transform;
            stilt.transform.localPosition = new Vector3(
                (i % 2 == 0) ? -1.5f : 1.5f,
                1.5f,
                (i < 2) ? -1.5f : 1.5f
            );
            stilt.transform.localScale = new Vector3(0.3f, 1.5f, 0.3f);
            Object.DestroyImmediate(stilt.GetComponent<Collider>());
            
            var mat = new Material(Shader.Find("Standard"));
            mat.color = new Color(0.45f, 0.3f, 0.15f);
            stilt.GetComponent<Renderer>().sharedMaterial = mat;
        }
        
        // Floor/walls
        var floor = GameObject.CreatePrimitive(PrimitiveType.Cube);
        floor.name = "Floor";
        floor.transform.parent = house.transform;
        floor.transform.localPosition = new Vector3(0, 3, 0);
        floor.transform.localScale = new Vector3(4, 2, 4);
        Object.DestroyImmediate(floor.GetComponent<Collider>());
        
        var floorMat = new Material(Shader.Find("Standard"));
        floorMat.color = new Color(0.55f, 0.4f, 0.25f);
        floor.GetComponent<Renderer>().sharedMaterial = floorMat;
        
        // Roof
        var roof = GameObject.CreatePrimitive(PrimitiveType.Cube);
        roof.name = "Roof";
        roof.transform.parent = house.transform;
        roof.transform.localPosition = new Vector3(0, 5, 0);
        roof.transform.localScale = new Vector3(5, 1, 5);
        roof.transform.localRotation = Quaternion.Euler(0, 45, 0);
        Object.DestroyImmediate(roof.GetComponent<Collider>());
        
        var roofMat = new Material(Shader.Find("Standard"));
        roofMat.color = new Color(0.5f, 0.35f, 0.2f);
        roof.GetComponent<Renderer>().sharedMaterial = roofMat;
        
        return house;
    }
    
    static GameObject CreateSimpleTemple()
    {
        GameObject temple = new GameObject("Temple");
        
        // Base
        var bBase = GameObject.CreatePrimitive(PrimitiveType.Cube);
        bBase.name = "Base";
        bBase.transform.parent = temple.transform;
        bBase.transform.localPosition = new Vector3(0, 2, 0);
        bBase.transform.localScale = new Vector3(8, 4, 8);
        
        var baseMat = new Material(Shader.Find("Standard"));
        baseMat.color = new Color(0.85f, 0.75f, 0.6f);
        bBase.GetComponent<Renderer>().sharedMaterial = baseMat;
        
        // Roof 1
        var roof1 = GameObject.CreatePrimitive(PrimitiveType.Cube);
        roof1.name = "Roof1";
        roof1.transform.parent = temple.transform;
        roof1.transform.localPosition = new Vector3(0, 5, 0);
        roof1.transform.localScale = new Vector3(9, 1.5f, 9);
        
        var roofMat = new Material(Shader.Find("Standard"));
        roofMat.color = new Color(0.6f, 0.35f, 0.15f);
        roof1.GetComponent<Renderer>().sharedMaterial = roofMat;
        
        // Roof 2
        var roof2 = GameObject.CreatePrimitive(PrimitiveType.Cube);
        roof2.name = "Roof2";
        roof2.transform.parent = temple.transform;
        roof2.transform.localPosition = new Vector3(0, 7, 0);
        roof2.transform.localScale = new Vector3(6, 1.5f, 6);
        roof2.GetComponent<Renderer>().sharedMaterial = roofMat;
        
        // Spire
        var spire = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        spire.name = "Spire";
        spire.transform.parent = temple.transform;
        spire.transform.localPosition = new Vector3(0, 10, 0);
        spire.transform.localScale = new Vector3(0.8f, 3, 0.8f);
        Object.DestroyImmediate(spire.GetComponent<Collider>());
        
        var goldMat = new Material(Shader.Find("Standard"));
        goldMat.color = new Color(0.85f, 0.7f, 0.2f);
        spire.GetComponent<Renderer>().sharedMaterial = goldMat;
        
        return temple;
    }
    
    static void CreateGameUI()
    {
        // Create UI Canvas
        GameObject canvasObj = new GameObject("GameUI");
        var canvas = canvasObj.AddComponent<UnityEngine.Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        
        var scaler = canvasObj.AddComponent<UnityEngine.UI.CanvasScaler>();
        scaler.uiScaleMode = UnityEngine.UI.CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1920, 1080);
        
        canvasObj.AddComponent<UnityEngine.UI.GraphicRaycaster>();
        
        // Title panel
        CreateTitlePanel(canvasObj.transform);
        
        // Resource panel
        CreateResourcePanel(canvasObj.transform);
    }
    
    static void CreateTitlePanel(Transform canvas)
    {
        GameObject panel = new GameObject("TitlePanel");
        panel.transform.SetParent(canvas);
        
        var rect = panel.AddComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = new Vector2(0.5f, 1);
        rect.pivot = new Vector2(0.5f, 1);
        rect.anchoredPosition = new Vector2(0, -10);
        rect.sizeDelta = new Vector2(400, 50);
        
        var img = panel.AddComponent<UnityEngine.UI.Image>();
        img.color = new Color(0.15f, 0.1f, 0.05f, 0.85f);
        
        // Title text
        GameObject textObj = new GameObject("TitleText");
        textObj.transform.SetParent(panel.transform);
        
        var textRect = textObj.AddComponent<RectTransform>();
        textRect.anchorMin = Vector2.zero;
        textRect.anchorMax = Vector2.one;
        textRect.offsetMin = textRect.offsetMax = Vector2.zero;
        
        var tmp = textObj.AddComponent<TMPro.TextMeshProUGUI>();
        tmp.text = "สงครามช้างเผือก พ.ศ. 2091";
        tmp.fontSize = 24;
        tmp.color = new Color(0.85f, 0.7f, 0.3f);
        tmp.alignment = TMPro.TextAlignmentOptions.Center;
    }
    
    static void CreateResourcePanel(Transform canvas)
    {
        GameObject panel = new GameObject("ResourcePanel");
        panel.transform.SetParent(canvas);
        
        var rect = panel.AddComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = new Vector2(0, 1);
        rect.pivot = new Vector2(0, 1);
        rect.anchoredPosition = new Vector2(10, -70);
        rect.sizeDelta = new Vector2(200, 80);
        
        var img = panel.AddComponent<UnityEngine.UI.Image>();
        img.color = new Color(0, 0, 0, 0.7f);
        
        // Resource texts
        string[] resources = { "ข้าว: 500", "เสบียง: 300", "ทหาร: 0/50" };
        
        for (int i = 0; i < resources.Length; i++)
        {
            GameObject textObj = new GameObject($"Resource{i}");
            textObj.transform.SetParent(panel.transform);
            
            var textRect = textObj.AddComponent<RectTransform>();
            textRect.anchorMin = textRect.anchorMax = new Vector2(0, 1);
            textRect.pivot = new Vector2(0, 1);
            textRect.anchoredPosition = new Vector2(10, -10 - i * 22);
            textRect.sizeDelta = new Vector2(180, 20);
            
            var tmp = textObj.AddComponent<TMPro.TextMeshProUGUI>();
            tmp.text = resources[i];
            tmp.fontSize = 14;
            tmp.color = Color.white;
        }
    }
    
    [MenuItem("Tools/RTS Thai/Delete Corrupted Objects")]
    public static void DeleteCorruptedObjects()
    {
        int deleted = 0;
        
        // Find all GameObjects
        var allObjects = Resources.FindObjectsOfTypeAll<GameObject>();
        
        foreach (var obj in allObjects)
        {
            if (obj == null) continue;
            
            // Check for missing scripts
            var components = obj.GetComponents<Component>();
            foreach (var comp in components)
            {
                if (comp == null)
                {
                    GameObjectUtility.RemoveMonoBehavioursWithMissingScript(obj);
                    deleted++;
                    break;
                }
            }
        }
        
        // Delete specific problematic objects
        string[] problematicNames = { "AmbientEffects", "DustParticles" };
        foreach (var name in problematicNames)
        {
            var obj = GameObject.Find(name);
            if (obj != null)
            {
                Object.DestroyImmediate(obj);
                deleted++;
            }
        }
        
        Debug.Log($"✅ Deleted {deleted} corrupted objects");
        EditorUtility.DisplayDialog("Cleanup Done", 
            $"ลบ objects ที่มีปัญหา {deleted} รายการ\n\n" +
            "ถ้ายังมี errors ให้ใช้ FULL RESET", "OK");
    }
}
#endif
