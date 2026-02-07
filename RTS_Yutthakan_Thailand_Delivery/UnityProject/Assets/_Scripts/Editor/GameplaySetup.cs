#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using System.Collections.Generic;

/// <summary>
/// Auto Setup Game Play - Camera Controls + Units
/// ตั้งค่ากล้องและวาง Units อัตโนมัติ
/// </summary>
public class GameplaySetup : EditorWindow
{
    [MenuItem("Tools/RTS Thai/Setup Camera Controls")]
    public static void SetupCameraControls()
    {
        Camera mainCam = Camera.main;
        if (mainCam == null)
        {
            Debug.LogError("No Main Camera found!");
            return;
        }
        
        // Remove old controller if exists
        var oldController = mainCam.GetComponent<RTSCameraControllerEnhanced>();
        if (oldController != null)
        {
            Object.DestroyImmediate(oldController);
        }
        
        // Add new controller
        var controller = mainCam.gameObject.AddComponent<RTSCameraControllerEnhanced>();
        
        // Configure for this map
        controller.panSpeed = 40f;
        controller.zoomSpeed = 20f;
        controller.minHeight = 20f;
        controller.maxHeight = 100f;
        controller.boundsX = new Vector2(-100, 100);
        controller.boundsZ = new Vector2(-100, 100);
        controller.rotateSpeed = 80f;
        controller.enableEdgeScroll = true;
        
        // Set camera position
        mainCam.transform.position = new Vector3(0, 50, -50);
        mainCam.transform.rotation = Quaternion.Euler(45, 0, 0);
        
        EditorUtility.SetDirty(mainCam.gameObject);
        
        Debug.Log("✅ Camera Controls setup complete!");
        EditorUtility.DisplayDialog("Success", 
            "Camera Controls ตั้งค่าเสร็จแล้ว!\n\n" +
            "การควบคุม:\n" +
            "• WASD / Arrow Keys - เลื่อนกล้อง\n" +
            "• Mouse Wheel - ซูม\n" +
            "• Q/E - หมุนกล้อง\n" +
            "• ขอบจอ - เลื่อนกล้อง\n" +
            "• Middle Mouse Drag - ลากเลื่อน", "OK");
    }
    
    [MenuItem("Tools/RTS Thai/Spawn All Units (Auto Formation)")]
    public static void SpawnAllUnits()
    {
        // Check if prefabs exist
        if (!AssetDatabase.IsValidFolder("Assets/_Prefabs/Units/Thai"))
        {
            if (EditorUtility.DisplayDialog("Prefabs Not Found", 
                "ยังไม่มี Unit Prefabs!\n\nต้องการสร้าง Prefabs ก่อนหรือไม่?", "ใช่ สร้างเลย", "ยกเลิก"))
            {
                // Generate prefabs first
                var generatorType = System.Type.GetType("BeautifulUnitGenerator");
                if (generatorType != null)
                {
                    var method = generatorType.GetMethod("GenerateAndSpawn", 
                        System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static);
                    if (method != null)
                    {
                        method.Invoke(null, null);
                        return;
                    }
                }
                Debug.LogError("Cannot find BeautifulUnitGenerator!");
            }
            return;
        }
        
        // Find spawn points
        var spawnPoints = GameObject.Find("SpawnPoints");
        if (spawnPoints == null)
        {
            Debug.LogError("SpawnPoints not found in scene!");
            return;
        }
        
        // Create or find Units parent
        GameObject unitsParent = GameObject.Find("Units");
        if (unitsParent == null)
        {
            unitsParent = new GameObject("Units");
        }
        
        // Clear existing units
        while (unitsParent.transform.childCount > 0)
        {
            Object.DestroyImmediate(unitsParent.transform.GetChild(0).gameObject);
        }
        
        // Find Thai spawn
        Transform thaiSpawn = spawnPoints.transform.Find("Thai_Army_Spawn");
        Transform thaiElephantSpawn = spawnPoints.transform.Find("Thai_Elephant_Spawn");
        Transform burmaSpawn = spawnPoints.transform.Find("Burma_Army_Spawn");
        Transform burmaSiegeSpawn = spawnPoints.transform.Find("Burma_Siege_Spawn");
        
        int thaiCount = 0;
        int burmaCount = 0;
        
        // Spawn Thai Army
        if (thaiSpawn != null)
        {
            thaiCount += SpawnFormation(unitsParent.transform, thaiSpawn.position, "Thai", new string[] {
                "Thai_Swordsman", "Thai_Swordsman", "Thai_Swordsman",
                "Thai_Pikeman", "Thai_Pikeman",
                "Thai_Archer", "Thai_Archer", "Thai_Archer"
            }, 3.5f);
        }
        
        // Spawn Thai Elephants & Heroes
        if (thaiElephantSpawn != null)
        {
            thaiCount += SpawnFormation(unitsParent.transform, thaiElephantSpawn.position, "Thai", new string[] {
                "Thai_WarElephant", "Thai_WarElephant",
                "Thai_King", "Thai_Queen"
            }, 6f);
        }
        
        // Spawn Burma Army
        if (burmaSpawn != null)
        {
            burmaCount += SpawnFormation(unitsParent.transform, burmaSpawn.position, "Burma", new string[] {
                "Burma_Swordsman", "Burma_Swordsman", "Burma_Swordsman",
                "Burma_Pikeman", "Burma_Pikeman", "Burma_Pikeman",
                "Burma_Archer", "Burma_Archer"
            }, 3.5f);
        }
        
        // Spawn Burma Siege
        if (burmaSiegeSpawn != null)
        {
            burmaCount += SpawnFormation(unitsParent.transform, burmaSiegeSpawn.position, "Burma", new string[] {
                "Burma_WarElephant", "Burma_WarElephant",
                "Burma_King"
            }, 6f);
        }
        
        Debug.Log($"✅ Spawned {thaiCount} Thai units and {burmaCount} Burma units!");
        EditorUtility.DisplayDialog("Units Spawned", 
            $"วาง Units เสร็จแล้ว!\n\n" +
            $"ฝ่ายไทย: {thaiCount} หน่วย\n" +
            $"ฝ่ายพม่า: {burmaCount} หน่วย\n\n" +
            "Units จะอยู่ใน Hierarchy > Units", "OK");
    }
    
    static int SpawnFormation(Transform parent, Vector3 center, string team, string[] unitNames, float spacing)
    {
        int spawned = 0;
        int cols = Mathf.CeilToInt(Mathf.Sqrt(unitNames.Length));
        
        for (int i = 0; i < unitNames.Length; i++)
        {
            string prefabPath = $"Assets/_Prefabs/Units/{team}/{unitNames[i]}.prefab";
            GameObject prefab = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
            
            if (prefab == null)
            {
                Debug.LogWarning($"Prefab not found: {prefabPath}");
                continue;
            }
            
            int row = i / cols;
            int col = i % cols;
            
            Vector3 offset = new Vector3(
                (col - cols / 2f) * spacing,
                0,
                (row - unitNames.Length / cols / 2f) * spacing
            );
            
            GameObject instance = (GameObject)PrefabUtility.InstantiatePrefab(prefab);
            instance.transform.parent = parent;
            instance.transform.position = center + offset;
            
            // Face the enemy
            if (team == "Thai")
                instance.transform.rotation = Quaternion.Euler(0, 45, 0);
            else
                instance.transform.rotation = Quaternion.Euler(0, -135, 0);
            
            spawned++;
        }
        
        return spawned;
    }
    
    [MenuItem("Tools/RTS Thai/Complete Game Setup (All-in-One)")]
    public static void CompleteSetup()
    {
        SetupCameraControls();
        SpawnAllUnits();
        
        // Mark scene dirty
        UnityEditor.SceneManagement.EditorSceneManager.MarkSceneDirty(
            UnityEditor.SceneManagement.EditorSceneManager.GetActiveScene());
        
        Debug.Log("✅ Complete game setup done!");
        EditorUtility.DisplayDialog("Complete!", 
            "Setup ทั้งหมดเสร็จแล้ว!\n\n" +
            "✅ Camera Controls\n" +
            "✅ Unit Formations\n\n" +
            "กด Ctrl+S เพื่อ Save\n" +
            "กด Play เพื่อทดสอบ!", "OK");
    }
}
#endif
