#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using System.IO;

/// <summary>
/// สร้าง Unit Prefabs สำหรับเกม RTS ยุทธการไทย
/// สร้าง Prefabs พื้นฐานพร้อม visual และ components
/// </summary>
public class UnitPrefabGenerator : EditorWindow
{
    [MenuItem("Tools/RTS Thai/Generate Unit Prefabs")]
    public static void GenerateUnitPrefabs()
    {
        // Ensure prefab folder exists
        string prefabPath = "Assets/_Prefabs/Units";
        if (!AssetDatabase.IsValidFolder("Assets/_Prefabs"))
            AssetDatabase.CreateFolder("Assets", "_Prefabs");
        if (!AssetDatabase.IsValidFolder(prefabPath))
            AssetDatabase.CreateFolder("Assets/_Prefabs", "Units");
        
        // Thai Units (Blue Team)
        CreateUnitPrefab(prefabPath, "Thai_Swordsman", "ดาบเล็ว", UnitType.Infantry, Team.Thai);
        CreateUnitPrefab(prefabPath, "Thai_Pikeman", "พลหอก", UnitType.Infantry, Team.Thai);
        CreateUnitPrefab(prefabPath, "Thai_Archer", "พลธนู", UnitType.Ranged, Team.Thai);
        CreateUnitPrefab(prefabPath, "Thai_WarElephant", "ช้างศึก", UnitType.Elephant, Team.Thai);
        CreateUnitPrefab(prefabPath, "Thai_King", "สมเด็จพระมหาจักรพรรดิ", UnitType.Hero, Team.Thai);
        CreateUnitPrefab(prefabPath, "Thai_Queen", "สมเด็จพระสุริโยทัย", UnitType.Hero, Team.Thai);
        
        // Burma Units (Red Team)
        CreateUnitPrefab(prefabPath, "Burma_Lancer", "ทหารหอกพม่า", UnitType.Infantry, Team.Burma);
        CreateUnitPrefab(prefabPath, "Burma_Matchlock", "ทหารปืนคาบศิลา", UnitType.Ranged, Team.Burma);
        CreateUnitPrefab(prefabPath, "Burma_WarElephant", "ช้างศึกพม่า", UnitType.Elephant, Team.Burma);
        CreateUnitPrefab(prefabPath, "Burma_King", "พระเจ้าตะเบ็งชะเวตี้", UnitType.Hero, Team.Burma);
        
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        
        Debug.Log("✅ Generated 10 unit prefabs in " + prefabPath);
        EditorUtility.DisplayDialog("Success", 
            "Created 10 Unit Prefabs!\n\n" +
            "Thai Units: 6\n" +
            "Burma Units: 4\n\n" +
            "Location: Assets/_Prefabs/Units/\n\n" +
            "วิธีใช้:\n" +
            "1. ลาก Prefab จาก Project ไปวางใน Scene\n" +
            "2. วางไว้ใกล้ SpawnPoint ของฝ่ายตัวเอง", "OK");
    }
    
    enum UnitType { Infantry, Ranged, Cavalry, Elephant, Hero }
    enum Team { Thai, Burma }
    
    static void CreateUnitPrefab(string path, string name, string nameTH, UnitType type, Team team)
    {
        // Create root object
        GameObject unit = new GameObject(name);
        
        // Create body based on unit type
        GameObject body;
        float scale = 1f;
        float height = 2f;
        
        switch (type)
        {
            case UnitType.Elephant:
                body = CreateElephantMesh(unit.transform);
                scale = 3f;
                height = 4f;
                break;
            case UnitType.Hero:
                body = CreateHeroMesh(unit.transform);
                scale = 1.5f;
                height = 3f;
                break;
            case UnitType.Ranged:
                body = CreateArcherMesh(unit.transform);
                scale = 1f;
                height = 2f;
                break;
            default:
                body = CreateInfantryMesh(unit.transform);
                scale = 1f;
                height = 2f;
                break;
        }
        
        // Apply team color
        Color teamColor = team == Team.Thai ? 
            new Color(0.2f, 0.4f, 0.8f) : // Blue for Thai
            new Color(0.8f, 0.2f, 0.2f);  // Red for Burma
        
        ApplyTeamColor(body, teamColor);
        
        // Add selection circle
        CreateSelectionCircle(unit.transform, scale);
        
        // Add health bar
        CreateHealthBar(unit.transform, height + 0.5f);
        
        // Add unit name label
        CreateLabel(unit.transform, nameTH, height + 1f, teamColor);
        
        // Add components
        var rb = unit.AddComponent<Rigidbody>();
        rb.constraints = RigidbodyConstraints.FreezeRotation;
        rb.useGravity = true;
        
        unit.AddComponent<CapsuleCollider>();
        
        // Try to add UnitController if it exists
        var unitControllerType = System.Type.GetType("RTS.Units.UnitController,Assembly-CSharp");
        if (unitControllerType != null)
        {
            unit.AddComponent(unitControllerType);
        }
        
        // Set layer
        unit.layer = LayerMask.NameToLayer("Default");
        
        // Create prefab
        string prefabFilePath = $"{path}/{name}.prefab";
        
        // Remove existing prefab if exists
        if (File.Exists(prefabFilePath))
        {
            AssetDatabase.DeleteAsset(prefabFilePath);
        }
        
        PrefabUtility.SaveAsPrefabAsset(unit, prefabFilePath);
        
        // Clean up scene object
        Object.DestroyImmediate(unit);
        
        Debug.Log($"[UnitPrefabGenerator] Created prefab: {name} ({nameTH})");
    }
    
    static GameObject CreateInfantryMesh(Transform parent)
    {
        // Body - capsule
        GameObject body = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        body.name = "Body";
        body.transform.parent = parent;
        body.transform.localPosition = new Vector3(0, 1, 0);
        body.transform.localScale = new Vector3(0.6f, 1f, 0.6f);
        
        // Weapon - cube (sword)
        GameObject weapon = GameObject.CreatePrimitive(PrimitiveType.Cube);
        weapon.name = "Weapon";
        weapon.transform.parent = parent;
        weapon.transform.localPosition = new Vector3(0.5f, 0.8f, 0.3f);
        weapon.transform.localScale = new Vector3(0.1f, 0.8f, 0.1f);
        weapon.transform.localRotation = Quaternion.Euler(0, 0, -30);
        
        var weaponMat = new Material(Shader.Find("Standard"));
        weaponMat.color = new Color(0.6f, 0.6f, 0.6f);
        weapon.GetComponent<Renderer>().sharedMaterial = weaponMat;
        
        return body;
    }
    
    static GameObject CreateArcherMesh(Transform parent)
    {
        // Body
        GameObject body = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        body.name = "Body";
        body.transform.parent = parent;
        body.transform.localPosition = new Vector3(0, 1, 0);
        body.transform.localScale = new Vector3(0.5f, 0.9f, 0.5f);
        
        // Bow - torus approximation with cylinder
        GameObject bow = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        bow.name = "Bow";
        bow.transform.parent = parent;
        bow.transform.localPosition = new Vector3(-0.4f, 1f, 0.2f);
        bow.transform.localScale = new Vector3(0.05f, 0.6f, 0.05f);
        bow.transform.localRotation = Quaternion.Euler(0, 0, 20);
        
        var bowMat = new Material(Shader.Find("Standard"));
        bowMat.color = new Color(0.5f, 0.3f, 0.1f);
        bow.GetComponent<Renderer>().sharedMaterial = bowMat;
        
        return body;
    }
    
    static GameObject CreateElephantMesh(Transform parent)
    {
        // Body - large sphere
        GameObject body = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        body.name = "Body";
        body.transform.parent = parent;
        body.transform.localPosition = new Vector3(0, 2, 0);
        body.transform.localScale = new Vector3(2.5f, 2f, 3f);
        
        // Head
        GameObject head = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        head.name = "Head";
        head.transform.parent = parent;
        head.transform.localPosition = new Vector3(0, 2.5f, 1.8f);
        head.transform.localScale = new Vector3(1.2f, 1f, 1f);
        
        // Trunk
        GameObject trunk = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        trunk.name = "Trunk";
        trunk.transform.parent = parent;
        trunk.transform.localPosition = new Vector3(0, 1.5f, 2.5f);
        trunk.transform.localScale = new Vector3(0.3f, 1f, 0.3f);
        trunk.transform.localRotation = Quaternion.Euler(40, 0, 0);
        
        // Legs (4)
        for (int i = 0; i < 4; i++)
        {
            GameObject leg = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            leg.name = $"Leg_{i}";
            leg.transform.parent = parent;
            float x = (i % 2 == 0) ? -0.8f : 0.8f;
            float z = (i < 2) ? 1f : -1f;
            leg.transform.localPosition = new Vector3(x, 0.8f, z);
            leg.transform.localScale = new Vector3(0.4f, 0.8f, 0.4f);
            
            var legMat = new Material(Shader.Find("Standard"));
            legMat.color = new Color(0.5f, 0.5f, 0.5f);
            leg.GetComponent<Renderer>().sharedMaterial = legMat;
        }
        
        // Tusks
        for (int i = 0; i < 2; i++)
        {
            GameObject tusk = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            tusk.name = $"Tusk_{i}";
            tusk.transform.parent = parent;
            float x = (i == 0) ? -0.4f : 0.4f;
            tusk.transform.localPosition = new Vector3(x, 1.8f, 2.8f);
            tusk.transform.localScale = new Vector3(0.1f, 0.5f, 0.1f);
            tusk.transform.localRotation = Quaternion.Euler(60, 0, (i == 0) ? -20 : 20);
            
            var tuskMat = new Material(Shader.Find("Standard"));
            tuskMat.color = Color.white;
            tusk.GetComponent<Renderer>().sharedMaterial = tuskMat;
        }
        
        // Rider platform
        GameObject platform = GameObject.CreatePrimitive(PrimitiveType.Cube);
        platform.name = "Platform";
        platform.transform.parent = parent;
        platform.transform.localPosition = new Vector3(0, 3.5f, 0);
        platform.transform.localScale = new Vector3(1.5f, 0.3f, 2f);
        
        var platMat = new Material(Shader.Find("Standard"));
        platMat.color = new Color(0.6f, 0.4f, 0.2f);
        platform.GetComponent<Renderer>().sharedMaterial = platMat;
        
        return body;
    }
    
    static GameObject CreateHeroMesh(Transform parent)
    {
        // Body
        GameObject body = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        body.name = "Body";
        body.transform.parent = parent;
        body.transform.localPosition = new Vector3(0, 1.2f, 0);
        body.transform.localScale = new Vector3(0.8f, 1.2f, 0.8f);
        
        // Crown
        GameObject crown = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        crown.name = "Crown";
        crown.transform.parent = parent;
        crown.transform.localPosition = new Vector3(0, 2.8f, 0);
        crown.transform.localScale = new Vector3(0.4f, 0.3f, 0.4f);
        
        var crownMat = new Material(Shader.Find("Standard"));
        crownMat.color = new Color(1f, 0.85f, 0f); // Gold
        crown.GetComponent<Renderer>().sharedMaterial = crownMat;
        
        // Cape
        GameObject cape = GameObject.CreatePrimitive(PrimitiveType.Cube);
        cape.name = "Cape";
        cape.transform.parent = parent;
        cape.transform.localPosition = new Vector3(0, 1f, -0.4f);
        cape.transform.localScale = new Vector3(0.8f, 1.5f, 0.1f);
        
        var capeMat = new Material(Shader.Find("Standard"));
        capeMat.color = new Color(0.6f, 0.1f, 0.1f); // Red cape
        cape.GetComponent<Renderer>().sharedMaterial = capeMat;
        
        // Royal sword
        GameObject sword = GameObject.CreatePrimitive(PrimitiveType.Cube);
        sword.name = "RoyalSword";
        sword.transform.parent = parent;
        sword.transform.localPosition = new Vector3(0.6f, 1f, 0.3f);
        sword.transform.localScale = new Vector3(0.12f, 1.2f, 0.08f);
        sword.transform.localRotation = Quaternion.Euler(0, 0, -30);
        
        var swordMat = new Material(Shader.Find("Standard"));
        swordMat.color = new Color(0.9f, 0.9f, 1f);
        sword.GetComponent<Renderer>().sharedMaterial = swordMat;
        
        return body;
    }
    
    static void ApplyTeamColor(GameObject body, Color color)
    {
        var mat = new Material(Shader.Find("Standard"));
        mat.color = color;
        
        var renderer = body.GetComponent<Renderer>();
        if (renderer != null)
        {
            renderer.sharedMaterial = mat;
        }
    }
    
    static void CreateSelectionCircle(Transform parent, float scale)
    {
        GameObject circle = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        circle.name = "SelectionCircle";
        circle.transform.parent = parent;
        circle.transform.localPosition = new Vector3(0, 0.02f, 0);
        circle.transform.localScale = new Vector3(scale * 1.5f, 0.02f, scale * 1.5f);
        
        var mat = new Material(Shader.Find("Standard"));
        mat.color = new Color(0f, 1f, 0f, 0.5f); // Green selection
        circle.GetComponent<Renderer>().sharedMaterial = mat;
        
        // Disable by default (enable when selected)
        circle.SetActive(false);
    }
    
    static void CreateHealthBar(Transform parent, float height)
    {
        // Background
        GameObject bg = GameObject.CreatePrimitive(PrimitiveType.Cube);
        bg.name = "HealthBarBG";
        bg.transform.parent = parent;
        bg.transform.localPosition = new Vector3(0, height, 0);
        bg.transform.localScale = new Vector3(1.2f, 0.15f, 0.1f);
        
        var bgMat = new Material(Shader.Find("Standard"));
        bgMat.color = Color.black;
        bg.GetComponent<Renderer>().sharedMaterial = bgMat;
        
        // Foreground (health)
        GameObject fg = GameObject.CreatePrimitive(PrimitiveType.Cube);
        fg.name = "HealthBarFG";
        fg.transform.parent = parent;
        fg.transform.localPosition = new Vector3(0, height, 0.05f);
        fg.transform.localScale = new Vector3(1.1f, 0.12f, 0.08f);
        
        var fgMat = new Material(Shader.Find("Standard"));
        fgMat.color = Color.green;
        fg.GetComponent<Renderer>().sharedMaterial = fgMat;
        
        Object.DestroyImmediate(bg.GetComponent<Collider>());
        Object.DestroyImmediate(fg.GetComponent<Collider>());
    }
    
    static void CreateLabel(Transform parent, string text, float height, Color color)
    {
        GameObject labelObj = new GameObject("Label");
        labelObj.transform.parent = parent;
        labelObj.transform.localPosition = new Vector3(0, height, 0);
        
        var tm = labelObj.AddComponent<TextMesh>();
        tm.text = text;
        tm.fontSize = 40;
        tm.characterSize = 0.08f;
        tm.alignment = TextAlignment.Center;
        tm.anchor = TextAnchor.MiddleCenter;
        tm.color = color;
    }
}
#endif
