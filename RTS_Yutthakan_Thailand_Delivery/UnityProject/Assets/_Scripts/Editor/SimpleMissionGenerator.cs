#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

/// <summary>
/// Simple Mission Map Generator - No dependencies on other scripts
/// สร้าง Mission Map สำหรับแคมเปญสงครามช้างเผือก
/// </summary>
public class SimpleMissionGenerator : EditorWindow
{
    [MenuItem("Tools/RTS Thai/Generate Mission Map")]
    public static void GenerateMissionMap()
    {
        // Create new scene
        Scene scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
        
        // Create Terrain
        TerrainData terrainData = new TerrainData();
        terrainData.heightmapResolution = 257;
        terrainData.size = new Vector3(200, 30, 200);
        
        // Ensure folder exists
        if (!AssetDatabase.IsValidFolder("Assets/_Data"))
            AssetDatabase.CreateFolder("Assets", "_Data");
        if (!AssetDatabase.IsValidFolder("Assets/_Data/Terrain"))
            AssetDatabase.CreateFolder("Assets/_Data", "Terrain");
            
        AssetDatabase.CreateAsset(terrainData, "Assets/_Data/Terrain/MissionTerrain.asset");
        
        GameObject terrain = Terrain.CreateTerrainGameObject(terrainData);
        terrain.name = "Terrain_Kanchanaburi";
        terrain.transform.position = new Vector3(-100, 0, -100);
        
        // Create River
        GameObject river = new GameObject("River");
        for (int i = 0; i < 8; i++)
        {
            GameObject seg = GameObject.CreatePrimitive(PrimitiveType.Cube);
            seg.name = $"RiverSeg_{i}";
            seg.transform.parent = river.transform;
            float t = i / 7f;
            seg.transform.position = new Vector3(
                Mathf.Lerp(-40, 40, t) + Mathf.Sin(t * 3.14f) * 15,
                -0.5f,
                Mathf.Lerp(-70, 70, t)
            );
            seg.transform.localScale = new Vector3(12, 1, 18);
            
            var r = seg.GetComponent<Renderer>();
            var mat = new Material(Shader.Find("Standard"));
            mat.color = new Color(0.2f, 0.4f, 0.7f);
            r.material = mat;
        }
        
        // Create Spawn Points
        GameObject spawns = new GameObject("SpawnPoints");
        CreateMarker("Thai_Spawn", new Vector3(-60, 1, -60), Color.blue, spawns.transform);
        CreateMarker("Thai_Elephants", new Vector3(-50, 1, -70), Color.cyan, spawns.transform);
        CreateMarker("Burma_Spawn", new Vector3(60, 1, 60), Color.red, spawns.transform);
        CreateMarker("Burma_Siege", new Vector3(50, 1, 70), new Color(1, 0.5f, 0), spawns.transform);
        
        // Create Objectives
        GameObject objectives = new GameObject("Objectives");
        CreateObjectiveArea("Obj_DefendVillage", new Vector3(-20, 0.2f, -30), Color.yellow, objectives.transform);
        CreateObjectiveArea("Obj_RiverCrossing", new Vector3(0, 0.2f, 0), Color.green, objectives.transform);
        CreateObjectiveArea("Obj_ElephantDuel", new Vector3(25, 0.2f, 35), Color.magenta, objectives.transform);
        CreateObjectiveArea("Obj_DefeatCommander", new Vector3(50, 0.2f, 55), Color.red, objectives.transform);
        
        // Setup Camera
        Camera.main.transform.position = new Vector3(0, 60, -60);
        Camera.main.transform.rotation = Quaternion.Euler(45, 0, 0);
        Camera.main.fieldOfView = 60;
        
        // Setup Lighting
        var lights = Object.FindObjectsOfType<Light>();
        foreach (var light in lights)
        {
            if (light.type == LightType.Directional)
            {
                light.transform.rotation = Quaternion.Euler(50, -30, 0);
                light.intensity = 1.2f;
                light.color = new Color(1f, 0.95f, 0.85f);
            }
        }
        
        // Fog
        RenderSettings.fog = true;
        RenderSettings.fogColor = new Color(0.6f, 0.7f, 0.8f);
        RenderSettings.fogMode = FogMode.Linear;
        RenderSettings.fogStartDistance = 60;
        RenderSettings.fogEndDistance = 180;
        
        // Save
        if (!AssetDatabase.IsValidFolder("Assets/_Scenes"))
            AssetDatabase.CreateFolder("Assets", "_Scenes");
            
        EditorSceneManager.SaveScene(scene, "Assets/_Scenes/WhiteElephant_Mission1.unity");
        
        Debug.Log("Mission Map created successfully!");
        EditorUtility.DisplayDialog("Success", 
            "Mission Map Created!\n\n" +
            "Scene: Assets/_Scenes/WhiteElephant_Mission1.unity\n\n" +
            "Contains:\n" +
            "• Terrain 200x200\n" +
            "• River\n" +
            "• 4 Spawn Points\n" +
            "• 4 Objectives", "OK");
    }
    
    static void CreateMarker(string name, Vector3 pos, Color color, Transform parent)
    {
        GameObject obj = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        obj.name = name;
        obj.transform.parent = parent;
        obj.transform.position = pos;
        obj.transform.localScale = new Vector3(3, 4, 3);
        
        var r = obj.GetComponent<Renderer>();
        var mat = new Material(Shader.Find("Standard"));
        mat.color = color;
        r.material = mat;
    }
    
    static void CreateObjectiveArea(string name, Vector3 pos, Color color, Transform parent)
    {
        GameObject obj = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        obj.name = name;
        obj.transform.parent = parent;
        obj.transform.position = pos;
        obj.transform.localScale = new Vector3(15, 0.3f, 15);
        
        var r = obj.GetComponent<Renderer>();
        var mat = new Material(Shader.Find("Standard"));
        color.a = 0.5f;
        mat.color = color;
        mat.SetFloat("_Mode", 3); // Transparent
        r.material = mat;
    }
    
    [MenuItem("Tools/RTS Thai/Setup Font Fallback")]
    public static void SetupFontFallback()
    {
        // Find fonts
        string[] sarabunGuids = AssetDatabase.FindAssets("Sarabun SDF t:TMP_FontAsset");
        string[] liberationGuids = AssetDatabase.FindAssets("LiberationSans SDF t:TMP_FontAsset");
        
        if (sarabunGuids.Length == 0)
        {
            EditorUtility.DisplayDialog("Error", "Sarabun SDF not found!", "OK");
            return;
        }
        
        if (liberationGuids.Length == 0)
        {
            EditorUtility.DisplayDialog("Error", "LiberationSans SDF not found!", "OK");
            return;
        }
        
        string sarabunPath = AssetDatabase.GUIDToAssetPath(sarabunGuids[0]);
        string libPath = AssetDatabase.GUIDToAssetPath(liberationGuids[0]);
        
        var sarabun = AssetDatabase.LoadAssetAtPath<TMPro.TMP_FontAsset>(sarabunPath);
        var liberation = AssetDatabase.LoadAssetAtPath<TMPro.TMP_FontAsset>(libPath);
        
        if (sarabun.fallbackFontAssetTable == null)
            sarabun.fallbackFontAssetTable = new System.Collections.Generic.List<TMPro.TMP_FontAsset>();
        
        if (!sarabun.fallbackFontAssetTable.Contains(liberation))
        {
            sarabun.fallbackFontAssetTable.Insert(0, liberation);
            EditorUtility.SetDirty(sarabun);
            AssetDatabase.SaveAssets();
            
            Debug.Log("Added LiberationSans SDF as fallback font");
            EditorUtility.DisplayDialog("Success", 
                "Added LiberationSans SDF as fallback!\n\nNumbers will now display correctly.", "OK");
        }
        else
        {
            EditorUtility.DisplayDialog("Info", "Fallback already configured.", "OK");
        }
    }
}
#endif
