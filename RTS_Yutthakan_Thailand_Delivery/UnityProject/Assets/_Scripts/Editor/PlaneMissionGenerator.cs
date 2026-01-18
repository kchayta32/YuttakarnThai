#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Mission Scene Generator that uses Plane instead of Terrain
/// ใช้ Plane แทน Terrain เพื่อหลีกเลี่ยงปัญหา disabled built-in package
/// </summary>
public class PlaneMissionGenerator : EditorWindow
{
    [MenuItem("Tools/RTS Thai/Generate Mission (No Terrain)")]
    public static void GenerateMission()
    {
        // Create new scene
        var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
        
        // Create Ground using Planes
        CreateGround();
        
        // Create River
        CreateRiver();
        
        // Create Spawn Points
        CreateSpawnPoints();
        
        // Create Objectives
        CreateObjectives();
        
        // Create Game Managers
        CreateManagers();
        
        // Setup Camera
        SetupCamera();
        
        // Setup Lighting
        SetupLighting();
        
        // Ensure folders exist
        if (!AssetDatabase.IsValidFolder("Assets/_Scenes"))
            AssetDatabase.CreateFolder("Assets", "_Scenes");
        
        // Save Scene
        EditorSceneManager.SaveScene(scene, "Assets/_Scenes/WhiteElephant_Mission1.unity");
        
        Debug.Log("✅ Mission Scene created successfully!");
        EditorUtility.DisplayDialog("Success", 
            "Mission Scene Created!\n\n" +
            "Scene: Assets/_Scenes/WhiteElephant_Mission1.unity\n\n" +
            "Contains:\n" +
            "• Ground (200x200 using Planes)\n" +
            "• River\n" +
            "• 4 Spawn Points\n" +
            "• 4 Objectives\n" +
            "• Game Managers", "OK");
    }
    
    static void CreateGround()
    {
        GameObject groundParent = new GameObject("Ground");
        
        // Create a large ground using multiple planes (10x10 grid of 20-unit planes = 200x200)
        Material groundMat = new Material(Shader.Find("Standard"));
        groundMat.color = new Color(0.4f, 0.55f, 0.3f); // Green grass color
        
        for (int x = 0; x < 10; x++)
        {
            for (int z = 0; z < 10; z++)
            {
                GameObject plane = GameObject.CreatePrimitive(PrimitiveType.Plane);
                plane.name = $"Ground_{x}_{z}";
                plane.transform.parent = groundParent.transform;
                
                // Position (Plane default is 10x10, so scale by 2 = 20x20 each)
                float posX = (x - 5) * 20 + 10;
                float posZ = (z - 5) * 20 + 10;
                plane.transform.position = new Vector3(posX, 0, posZ);
                plane.transform.localScale = new Vector3(2, 1, 2);
                
                // Apply material
                plane.GetComponent<Renderer>().sharedMaterial = groundMat;
            }
        }
        
        Debug.Log("[PlaneMissionGenerator] Created ground 200x200 units");
    }
    
    static void CreateRiver()
    {
        GameObject river = new GameObject("River");
        
        Material riverMat = new Material(Shader.Find("Standard"));
        riverMat.color = new Color(0.2f, 0.4f, 0.7f);
        
        // Create river segments along a curved path
        for (int i = 0; i < 12; i++)
        {
            GameObject seg = GameObject.CreatePrimitive(PrimitiveType.Cube);
            seg.name = $"RiverSeg_{i}";
            seg.transform.parent = river.transform;
            
            float t = i / 11f;
            float x = Mathf.Lerp(-50, 50, t) + Mathf.Sin(t * Mathf.PI * 2) * 20;
            float z = Mathf.Lerp(-80, 80, t);
            
            seg.transform.position = new Vector3(x, -0.3f, z);
            seg.transform.rotation = Quaternion.Euler(0, Mathf.Sin(t * Mathf.PI) * 30, 0);
            seg.transform.localScale = new Vector3(15, 1, 18);
            
            seg.GetComponent<Renderer>().sharedMaterial = riverMat;
        }
        
        Debug.Log("[PlaneMissionGenerator] Created river");
    }
    
    static void CreateSpawnPoints()
    {
        GameObject spawns = new GameObject("SpawnPoints");
        
        // Thai Army
        CreateMarker("Thai_Army_Spawn", new Vector3(-60, 2, -60), new Color(0.2f, 0.4f, 0.8f), spawns.transform, "ฝ่ายไทย");
        CreateMarker("Thai_Elephant_Spawn", new Vector3(-50, 2, -70), new Color(0.3f, 0.6f, 0.9f), spawns.transform, "ช้างศึก");
        
        // Burma Army
        CreateMarker("Burma_Army_Spawn", new Vector3(60, 2, 60), new Color(0.8f, 0.2f, 0.2f), spawns.transform, "ฝ่ายพม่า");
        CreateMarker("Burma_Siege_Spawn", new Vector3(50, 2, 70), new Color(0.9f, 0.4f, 0.1f), spawns.transform, "หอรบ");
        
        Debug.Log("[PlaneMissionGenerator] Created spawn points");
    }
    
    static void CreateMarker(string name, Vector3 pos, Color color, Transform parent, string label)
    {
        GameObject obj = new GameObject(name);
        obj.transform.parent = parent;
        obj.transform.position = pos;
        
        // Visual marker
        GameObject marker = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        marker.name = "Marker";
        marker.transform.parent = obj.transform;
        marker.transform.localPosition = Vector3.zero;
        marker.transform.localScale = new Vector3(3, 4, 3);
        
        var mat = new Material(Shader.Find("Standard"));
        mat.color = color;
        marker.GetComponent<Renderer>().sharedMaterial = mat;
        
        // Add label (3D Text)
        GameObject textObj = new GameObject("Label");
        textObj.transform.parent = obj.transform;
        textObj.transform.localPosition = new Vector3(0, 6, 0);
        var tm = textObj.AddComponent<TextMesh>();
        tm.text = label;
        tm.fontSize = 50;
        tm.characterSize = 0.2f;
        tm.alignment = TextAlignment.Center;
        tm.anchor = TextAnchor.MiddleCenter;
        tm.color = color;
    }
    
    static void CreateObjectives()
    {
        GameObject objectives = new GameObject("Objectives");
        
        CreateObjectiveArea("Obj_DefendVillage", new Vector3(-20, 0.1f, -30), 
            new Color(1f, 0.9f, 0.2f), objectives.transform, "ปกป้องหมู่บ้าน");
        
        CreateObjectiveArea("Obj_RiverCrossing", new Vector3(0, 0.1f, 0), 
            new Color(0.3f, 0.8f, 0.3f), objectives.transform, "ยึดจุดข้ามแม่น้ำ");
        
        CreateObjectiveArea("Obj_ElephantDuel", new Vector3(25, 0.1f, 35), 
            new Color(0.8f, 0.3f, 0.8f), objectives.transform, "ที่ดวลช้างศึก");
        
        CreateObjectiveArea("Obj_DefeatCommander", new Vector3(50, 0.1f, 55), 
            new Color(0.9f, 0.2f, 0.2f), objectives.transform, "ปราบแม่ทัพพม่า");
        
        Debug.Log("[PlaneMissionGenerator] Created objectives");
    }
    
    static void CreateObjectiveArea(string name, Vector3 pos, Color color, Transform parent, string label)
    {
        GameObject obj = new GameObject(name);
        obj.transform.parent = parent;
        obj.transform.position = pos;
        
        // Objective area (cylinder)
        GameObject area = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        area.name = "Area";
        area.transform.parent = obj.transform;
        area.transform.localPosition = Vector3.zero;
        area.transform.localScale = new Vector3(15, 0.2f, 15);
        
        var mat = new Material(Shader.Find("Standard"));
        mat.color = new Color(color.r, color.g, color.b, 0.5f);
        area.GetComponent<Renderer>().sharedMaterial = mat;
        
        // Flag pole
        GameObject pole = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        pole.name = "FlagPole";
        pole.transform.parent = obj.transform;
        pole.transform.localPosition = new Vector3(0, 4, 0);
        pole.transform.localScale = new Vector3(0.3f, 4, 0.3f);
        
        var poleMat = new Material(Shader.Find("Standard"));
        poleMat.color = new Color(0.4f, 0.3f, 0.2f);
        pole.GetComponent<Renderer>().sharedMaterial = poleMat;
        
        // Label
        GameObject textObj = new GameObject("Label");
        textObj.transform.parent = obj.transform;
        textObj.transform.localPosition = new Vector3(0, 10, 0);
        var tm = textObj.AddComponent<TextMesh>();
        tm.text = label;
        tm.fontSize = 50;
        tm.characterSize = 0.15f;
        tm.alignment = TextAlignment.Center;
        tm.anchor = TextAnchor.MiddleCenter;
        tm.color = color;
    }
    
    static void CreateManagers()
    {
        // Game Manager
        GameObject managers = new GameObject("_GameManagers");
        
        // Mission Objective Manager
        GameObject missionObj = new GameObject("MissionObjectiveManager");
        missionObj.transform.parent = managers.transform;
        // Add component if exists
        var missionManagerType = System.Type.GetType("RTS.Systems.MissionObjectiveManager,Assembly-CSharp");
        if (missionManagerType != null)
            missionObj.AddComponent(missionManagerType);
        
        // White Elephant Mission Controller
        GameObject missionCtrl = new GameObject("WhiteElephantMission1");
        missionCtrl.transform.parent = managers.transform;
        var missionType = System.Type.GetType("RTS.Campaigns.WhiteElephantMission1,Assembly-CSharp");
        if (missionType != null)
            missionCtrl.AddComponent(missionType);
        
        // Resource Manager
        GameObject resourceMgr = new GameObject("ResourceManager");
        resourceMgr.transform.parent = managers.transform;
        
        Debug.Log("[PlaneMissionGenerator] Created game managers");
    }
    
    static void SetupCamera()
    {
        Camera cam = Camera.main;
        if (cam != null)
        {
            cam.transform.position = new Vector3(0, 60, -70);
            cam.transform.rotation = Quaternion.Euler(45, 0, 0);
            cam.fieldOfView = 60;
            cam.farClipPlane = 500;
            cam.backgroundColor = new Color(0.5f, 0.6f, 0.8f);
        }
        
        // Create Minimap Camera
        GameObject minimapCamObj = new GameObject("MinimapCamera");
        Camera minimapCam = minimapCamObj.AddComponent<Camera>();
        minimapCam.transform.position = new Vector3(0, 150, 0);
        minimapCam.transform.rotation = Quaternion.Euler(90, 0, 0);
        minimapCam.orthographic = true;
        minimapCam.orthographicSize = 100;
        minimapCam.depth = -1;
        minimapCam.clearFlags = CameraClearFlags.SolidColor;
        minimapCam.backgroundColor = new Color(0.2f, 0.3f, 0.2f);
        
        Debug.Log("[PlaneMissionGenerator] Setup cameras");
    }
    
    static void SetupLighting()
    {
        var lights = Object.FindObjectsOfType<Light>();
        foreach (var light in lights)
        {
            if (light.type == LightType.Directional)
            {
                light.transform.rotation = Quaternion.Euler(50, -30, 0);
                light.intensity = 1.3f;
                light.color = new Color(1f, 0.95f, 0.85f); // Warm sunlight
                light.shadows = LightShadows.Soft;
            }
        }
        
        // Ambient
        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Trilight;
        RenderSettings.ambientSkyColor = new Color(0.6f, 0.7f, 0.9f);
        RenderSettings.ambientEquatorColor = new Color(0.5f, 0.5f, 0.4f);
        RenderSettings.ambientGroundColor = new Color(0.3f, 0.25f, 0.2f);
        
        // Fog
        RenderSettings.fog = true;
        RenderSettings.fogMode = FogMode.Linear;
        RenderSettings.fogColor = new Color(0.65f, 0.7f, 0.8f);
        RenderSettings.fogStartDistance = 80;
        RenderSettings.fogEndDistance = 250;
        
        Debug.Log("[PlaneMissionGenerator] Setup lighting");
    }
}
#endif
