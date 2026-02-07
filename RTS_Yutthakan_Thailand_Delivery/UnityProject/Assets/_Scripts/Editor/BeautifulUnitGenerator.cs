#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using System.IO;
using System.Collections.Generic;

/// <summary>
/// สร้าง Unit Prefabs สวยๆ และวางตำแหน่งอัตโนมัติ
/// Auto-Spawn at SpawnPoints
/// </summary>
public class BeautifulUnitGenerator : EditorWindow
{
    static Material thaiPrimaryMat;
    static Material thaiSecondaryMat;
    static Material burmaPrimaryMat;
    static Material burmaSecondaryMat;
    static Material goldMat;
    static Material silverMat;
    static Material bronzeMat;
    static Material woodMat;
    static Material leatherMat;
    
    [MenuItem("Tools/RTS Thai/Generate Beautiful Units + Auto Spawn")]
    public static void GenerateAndSpawn()
    {
        InitMaterials();
        
        // Ensure folders exist
        EnsureFolders();
        
        // Generate prefabs
        GeneratePrefabs();
        
        // Auto spawn in scene
        AutoSpawnUnits();
        
        Debug.Log("✅ Generated beautiful units and auto-spawned!");
        EditorUtility.DisplayDialog("Success", 
            "สร้าง Unit Prefabs สวยๆ เสร็จแล้ว!\n\n" +
            "✅ Thai Units: 6 prefabs\n" +
            "✅ Burma Units: 4 prefabs\n" +
            "✅ Auto-spawned ที่ SpawnPoints\n\n" +
            "Location: Assets/_Prefabs/Units/", "OK");
    }
    
    [MenuItem("Tools/RTS Thai/Auto Spawn Units Only")]
    public static void AutoSpawnOnly()
    {
        AutoSpawnUnits();
        Debug.Log("✅ Auto-spawned units at SpawnPoints!");
    }
    
    static void InitMaterials()
    {
        // Thai colors (Blue/Gold theme)
        thaiPrimaryMat = CreateMaterial(new Color(0.15f, 0.35f, 0.7f)); // Royal Blue
        thaiSecondaryMat = CreateMaterial(new Color(0.1f, 0.25f, 0.5f)); // Dark Blue
        
        // Burma colors (Red/Black theme)
        burmaPrimaryMat = CreateMaterial(new Color(0.7f, 0.15f, 0.15f)); // Crimson
        burmaSecondaryMat = CreateMaterial(new Color(0.4f, 0.1f, 0.1f)); // Dark Red
        
        // Metallic materials
        goldMat = CreateMetallicMaterial(new Color(1f, 0.84f, 0f), 0.8f);
        silverMat = CreateMetallicMaterial(new Color(0.75f, 0.75f, 0.75f), 0.9f);
        bronzeMat = CreateMetallicMaterial(new Color(0.8f, 0.5f, 0.2f), 0.7f);
        
        // Natural materials
        woodMat = CreateMaterial(new Color(0.45f, 0.3f, 0.15f));
        leatherMat = CreateMaterial(new Color(0.5f, 0.35f, 0.2f));
    }
    
    static Material CreateMaterial(Color color)
    {
        var mat = new Material(Shader.Find("Standard"));
        mat.color = color;
        return mat;
    }
    
    static Material CreateMetallicMaterial(Color color, float metallic)
    {
        var mat = new Material(Shader.Find("Standard"));
        mat.color = color;
        mat.SetFloat("_Metallic", metallic);
        mat.SetFloat("_Glossiness", 0.8f);
        return mat;
    }
    
    static void EnsureFolders()
    {
        if (!AssetDatabase.IsValidFolder("Assets/_Prefabs"))
            AssetDatabase.CreateFolder("Assets", "_Prefabs");
        if (!AssetDatabase.IsValidFolder("Assets/_Prefabs/Units"))
            AssetDatabase.CreateFolder("Assets/_Prefabs", "Units");
        if (!AssetDatabase.IsValidFolder("Assets/_Prefabs/Units/Thai"))
            AssetDatabase.CreateFolder("Assets/_Prefabs/Units", "Thai");
        if (!AssetDatabase.IsValidFolder("Assets/_Prefabs/Units/Burma"))
            AssetDatabase.CreateFolder("Assets/_Prefabs/Units", "Burma");
    }
    
    static void GeneratePrefabs()
    {
        // Thai Units
        CreateBeautifulSwordsman("Thai", thaiPrimaryMat, thaiSecondaryMat);
        CreateBeautifulPikeman("Thai", thaiPrimaryMat, thaiSecondaryMat);
        CreateBeautifulArcher("Thai", thaiPrimaryMat, thaiSecondaryMat);
        CreateBeautifulElephant("Thai", thaiPrimaryMat, thaiSecondaryMat, "ช้างศึกไทย");
        CreateBeautifulHero("Thai", "Thai_King", "สมเด็จพระมหาจักรพรรดิ", thaiPrimaryMat);
        CreateBeautifulHero("Thai", "Thai_Queen", "สมเด็จพระสุริโยทัย", thaiPrimaryMat);
        
        // Burma Units
        CreateBeautifulSwordsman("Burma", burmaPrimaryMat, burmaSecondaryMat);
        CreateBeautifulPikeman("Burma", burmaPrimaryMat, burmaSecondaryMat);
        CreateBeautifulArcher("Burma", burmaPrimaryMat, burmaSecondaryMat);
        CreateBeautifulElephant("Burma", burmaPrimaryMat, burmaSecondaryMat, "ช้างศึกพม่า");
        CreateBeautifulHero("Burma", "Burma_King", "พระเจ้าตะเบ็งชะเวตี้", burmaPrimaryMat);
        
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
    }
    
    static void CreateBeautifulSwordsman(string team, Material primary, Material secondary)
    {
        string name = $"{team}_Swordsman";
        string nameTH = team == "Thai" ? "ดาบเล็ว" : "ทหารดาบพม่า";
        
        GameObject unit = new GameObject(name);
        
        // Torso
        var torso = CreateCapsule(unit.transform, Vector3.up * 1.2f, new Vector3(0.5f, 0.6f, 0.35f), primary);
        torso.name = "Torso";
        
        // Head
        var head = CreateSphere(unit.transform, Vector3.up * 2f, Vector3.one * 0.35f, secondary);
        head.name = "Head";
        
        // Helmet
        var helmet = CreateCylinder(unit.transform, Vector3.up * 2.2f, new Vector3(0.4f, 0.15f, 0.4f), bronzeMat);
        helmet.name = "Helmet";
        
        // Legs
        CreateCapsule(unit.transform, new Vector3(-0.15f, 0.4f, 0), new Vector3(0.18f, 0.4f, 0.18f), secondary);
        CreateCapsule(unit.transform, new Vector3(0.15f, 0.4f, 0), new Vector3(0.18f, 0.4f, 0.18f), secondary);
        
        // Arms
        CreateCapsule(unit.transform, new Vector3(-0.4f, 1.3f, 0), new Vector3(0.12f, 0.35f, 0.12f), secondary);
        CreateCapsule(unit.transform, new Vector3(0.4f, 1.3f, 0), new Vector3(0.12f, 0.35f, 0.12f), secondary);
        
        // Sword
        var sword = CreateCube(unit.transform, new Vector3(0.55f, 1f, 0.25f), new Vector3(0.06f, 0.7f, 0.02f), silverMat);
        sword.name = "Sword";
        sword.transform.localRotation = Quaternion.Euler(0, 0, -25);
        
        // Sword handle
        CreateCube(unit.transform, new Vector3(0.45f, 0.55f, 0.2f), new Vector3(0.08f, 0.18f, 0.08f), woodMat);
        
        // Shield
        var shield = CreateCylinder(unit.transform, new Vector3(-0.45f, 1.1f, 0.15f), new Vector3(0.4f, 0.05f, 0.4f), primary);
        shield.name = "Shield";
        shield.transform.localRotation = Quaternion.Euler(90, 0, 0);
        
        // Shield emblem
        CreateSphere(unit.transform, new Vector3(-0.45f, 1.1f, 0.2f), Vector3.one * 0.12f, goldMat);
        
        AddUnitComponents(unit, nameTH, 1.2f, primary.color);
        SavePrefab(unit, $"Assets/_Prefabs/Units/{team}/{name}.prefab");
    }
    
    static void CreateBeautifulPikeman(string team, Material primary, Material secondary)
    {
        string name = $"{team}_Pikeman";
        string nameTH = team == "Thai" ? "พลหอก" : "ทหารหอกพม่า";
        
        GameObject unit = new GameObject(name);
        
        // Body
        CreateCapsule(unit.transform, Vector3.up * 1.2f, new Vector3(0.45f, 0.55f, 0.3f), primary);
        CreateSphere(unit.transform, Vector3.up * 2f, Vector3.one * 0.32f, secondary);
        
        // Conical helmet
        var helmet = CreateCylinder(unit.transform, Vector3.up * 2.3f, new Vector3(0.25f, 0.2f, 0.25f), bronzeMat);
        
        // Legs
        CreateCapsule(unit.transform, new Vector3(-0.12f, 0.4f, 0), new Vector3(0.15f, 0.4f, 0.15f), secondary);
        CreateCapsule(unit.transform, new Vector3(0.12f, 0.4f, 0), new Vector3(0.15f, 0.4f, 0.15f), secondary);
        
        // Pike (long spear)
        var pike = CreateCylinder(unit.transform, new Vector3(0.35f, 1.8f, 0), new Vector3(0.04f, 1.5f, 0.04f), woodMat);
        pike.name = "Pike";
        pike.transform.localRotation = Quaternion.Euler(0, 0, 10);
        
        // Spearhead
        var tip = CreateCube(unit.transform, new Vector3(0.45f, 3.4f, 0), new Vector3(0.08f, 0.25f, 0.02f), silverMat);
        tip.transform.localRotation = Quaternion.Euler(0, 0, 10);
        
        AddUnitComponents(unit, nameTH, 1.3f, primary.color);
        SavePrefab(unit, $"Assets/_Prefabs/Units/{team}/{name}.prefab");
    }
    
    static void CreateBeautifulArcher(string team, Material primary, Material secondary)
    {
        string name = $"{team}_Archer";
        string nameTH = team == "Thai" ? "พลธนู" : "ทหารธนูพม่า";
        
        GameObject unit = new GameObject(name);
        
        // Slimmer body for archer
        CreateCapsule(unit.transform, Vector3.up * 1.2f, new Vector3(0.4f, 0.5f, 0.28f), primary);
        CreateSphere(unit.transform, Vector3.up * 1.95f, Vector3.one * 0.3f, secondary);
        
        // Bandana/headband
        CreateCylinder(unit.transform, Vector3.up * 1.95f, new Vector3(0.33f, 0.08f, 0.33f), leatherMat);
        
        // Legs
        CreateCapsule(unit.transform, new Vector3(-0.1f, 0.4f, 0), new Vector3(0.13f, 0.4f, 0.13f), secondary);
        CreateCapsule(unit.transform, new Vector3(0.1f, 0.4f, 0), new Vector3(0.13f, 0.4f, 0.13f), secondary);
        
        // Bow (curved)
        var bowBottom = CreateCylinder(unit.transform, new Vector3(-0.35f, 0.9f, 0.15f), new Vector3(0.03f, 0.4f, 0.03f), woodMat);
        bowBottom.transform.localRotation = Quaternion.Euler(0, 0, 15);
        
        var bowTop = CreateCylinder(unit.transform, new Vector3(-0.35f, 1.5f, 0.15f), new Vector3(0.03f, 0.4f, 0.03f), woodMat);
        bowTop.transform.localRotation = Quaternion.Euler(0, 0, -15);
        
        // Bowstring
        CreateCube(unit.transform, new Vector3(-0.32f, 1.2f, 0.15f), new Vector3(0.01f, 0.75f, 0.01f), CreateMaterial(Color.white));
        
        // Quiver on back
        var quiver = CreateCylinder(unit.transform, new Vector3(0.1f, 1.3f, -0.2f), new Vector3(0.12f, 0.35f, 0.12f), leatherMat);
        quiver.name = "Quiver";
        quiver.transform.localRotation = Quaternion.Euler(-20, 0, 0);
        
        // Arrows in quiver
        for (int i = 0; i < 3; i++)
        {
            var arrow = CreateCylinder(unit.transform, 
                new Vector3(0.08f + i * 0.03f, 1.55f, -0.22f), 
                new Vector3(0.015f, 0.25f, 0.015f), woodMat);
            arrow.transform.localRotation = Quaternion.Euler(-20, 0, 0);
        }
        
        AddUnitComponents(unit, nameTH, 1.1f, primary.color);
        SavePrefab(unit, $"Assets/_Prefabs/Units/{team}/{name}.prefab");
    }
    
    static void CreateBeautifulElephant(string team, Material primary, Material secondary, string nameTH)
    {
        string name = $"{team}_WarElephant";
        
        GameObject unit = new GameObject(name);
        
        // Main body (large ellipsoid)
        var body = CreateSphere(unit.transform, Vector3.up * 2.5f, new Vector3(2.2f, 1.8f, 2.8f), 
            CreateMaterial(new Color(0.45f, 0.45f, 0.48f))); // Elephant grey
        body.name = "Body";
        
        // Head
        var head = CreateSphere(unit.transform, new Vector3(0, 2.8f, 1.8f), new Vector3(1f, 0.9f, 0.9f),
            CreateMaterial(new Color(0.5f, 0.5f, 0.52f)));
        head.name = "Head";
        
        // Ears
        CreateSphere(unit.transform, new Vector3(-0.8f, 2.9f, 1.5f), new Vector3(0.6f, 0.7f, 0.15f),
            CreateMaterial(new Color(0.55f, 0.5f, 0.5f)));
        CreateSphere(unit.transform, new Vector3(0.8f, 2.9f, 1.5f), new Vector3(0.6f, 0.7f, 0.15f),
            CreateMaterial(new Color(0.55f, 0.5f, 0.5f)));
        
        // Trunk
        var trunk = CreateCapsule(unit.transform, new Vector3(0, 1.8f, 2.6f), new Vector3(0.25f, 0.8f, 0.25f),
            CreateMaterial(new Color(0.48f, 0.48f, 0.5f)));
        trunk.name = "Trunk";
        trunk.transform.localRotation = Quaternion.Euler(50, 0, 0);
        
        // Tusks (curved ivory)
        var tuskL = CreateCylinder(unit.transform, new Vector3(-0.35f, 2.2f, 2.35f), new Vector3(0.08f, 0.55f, 0.08f),
            CreateMaterial(new Color(1f, 0.98f, 0.9f)));
        tuskL.transform.localRotation = Quaternion.Euler(60, 0, -15);
        
        var tuskR = CreateCylinder(unit.transform, new Vector3(0.35f, 2.2f, 2.35f), new Vector3(0.08f, 0.55f, 0.08f),
            CreateMaterial(new Color(1f, 0.98f, 0.9f)));
        tuskR.transform.localRotation = Quaternion.Euler(60, 0, 15);
        
        // Four legs
        float legY = 0.8f;
        CreateCapsule(unit.transform, new Vector3(-0.7f, legY, 0.9f), new Vector3(0.35f, 0.8f, 0.35f),
            CreateMaterial(new Color(0.42f, 0.42f, 0.45f)));
        CreateCapsule(unit.transform, new Vector3(0.7f, legY, 0.9f), new Vector3(0.35f, 0.8f, 0.35f),
            CreateMaterial(new Color(0.42f, 0.42f, 0.45f)));
        CreateCapsule(unit.transform, new Vector3(-0.7f, legY, -0.8f), new Vector3(0.35f, 0.8f, 0.35f),
            CreateMaterial(new Color(0.42f, 0.42f, 0.45f)));
        CreateCapsule(unit.transform, new Vector3(0.7f, legY, -0.8f), new Vector3(0.35f, 0.8f, 0.35f),
            CreateMaterial(new Color(0.42f, 0.42f, 0.45f)));
        
        // Howdah (riding platform) - decorated
        var howdah = CreateCube(unit.transform, new Vector3(0, 4.2f, -0.3f), new Vector3(1.8f, 0.4f, 2.2f), primary);
        howdah.name = "Howdah";
        
        // Howdah decorative posts
        CreateCylinder(unit.transform, new Vector3(-0.7f, 4.8f, 0.6f), new Vector3(0.08f, 0.4f, 0.08f), goldMat);
        CreateCylinder(unit.transform, new Vector3(0.7f, 4.8f, 0.6f), new Vector3(0.08f, 0.4f, 0.08f), goldMat);
        CreateCylinder(unit.transform, new Vector3(-0.7f, 4.8f, -1f), new Vector3(0.08f, 0.4f, 0.08f), goldMat);
        CreateCylinder(unit.transform, new Vector3(0.7f, 4.8f, -1f), new Vector3(0.08f, 0.4f, 0.08f), goldMat);
        
        // Canopy roof
        CreateCube(unit.transform, new Vector3(0, 5.3f, -0.2f), new Vector3(2f, 0.15f, 2.4f), secondary);
        
        // Elephant armor
        CreateCube(unit.transform, new Vector3(0, 3.2f, 1.2f), new Vector3(1.4f, 0.2f, 0.8f), bronzeMat);
        
        AddUnitComponents(unit, nameTH, 3.5f, primary.color);
        SavePrefab(unit, $"Assets/_Prefabs/Units/{team}/{name}.prefab");
    }
    
    static void CreateBeautifulHero(string team, string name, string nameTH, Material primary)
    {
        GameObject unit = new GameObject(name);
        
        // Heroic body (larger)
        CreateCapsule(unit.transform, Vector3.up * 1.4f, new Vector3(0.55f, 0.7f, 0.4f), primary);
        CreateSphere(unit.transform, Vector3.up * 2.3f, Vector3.one * 0.38f, primary);
        
        // Royal crown
        var crown = CreateCylinder(unit.transform, Vector3.up * 2.65f, new Vector3(0.3f, 0.2f, 0.3f), goldMat);
        crown.name = "Crown";
        
        // Crown points
        for (int i = 0; i < 5; i++)
        {
            float angle = i * 72 * Mathf.Deg2Rad;
            var point = CreateCube(unit.transform, 
                new Vector3(Mathf.Sin(angle) * 0.25f, 2.9f, Mathf.Cos(angle) * 0.25f),
                new Vector3(0.06f, 0.15f, 0.06f), goldMat);
        }
        
        // Royal cape
        var cape = CreateCube(unit.transform, new Vector3(0, 1.2f, -0.35f), new Vector3(0.7f, 1.4f, 0.08f),
            CreateMaterial(new Color(0.7f, 0.1f, 0.15f)));
        cape.name = "Cape";
        
        // Ornate armor chest plate
        CreateCube(unit.transform, new Vector3(0, 1.4f, 0.12f), new Vector3(0.5f, 0.5f, 0.08f), goldMat);
        
        // Royal sword
        var sword = CreateCube(unit.transform, new Vector3(0.6f, 1.2f, 0.25f), new Vector3(0.08f, 0.9f, 0.025f), silverMat);
        sword.name = "RoyalSword";
        sword.transform.localRotation = Quaternion.Euler(0, 0, -20);
        
        // Sword handle (gold)
        CreateCube(unit.transform, new Vector3(0.5f, 0.55f, 0.2f), new Vector3(0.1f, 0.22f, 0.1f), goldMat);
        
        // Legs with armor
        CreateCapsule(unit.transform, new Vector3(-0.15f, 0.5f, 0), new Vector3(0.18f, 0.5f, 0.18f), bronzeMat);
        CreateCapsule(unit.transform, new Vector3(0.15f, 0.5f, 0), new Vector3(0.18f, 0.5f, 0.18f), bronzeMat);
        
        AddUnitComponents(unit, nameTH, 1.5f, primary.color);
        SavePrefab(unit, $"Assets/_Prefabs/Units/{team}/{name}.prefab");
    }
    
    // ==================== Helper Methods ====================
    
    static GameObject CreateSphere(Transform parent, Vector3 pos, Vector3 scale, Material mat)
    {
        var obj = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        obj.transform.parent = parent;
        obj.transform.localPosition = pos;
        obj.transform.localScale = scale;
        obj.GetComponent<Renderer>().sharedMaterial = mat;
        Object.DestroyImmediate(obj.GetComponent<Collider>());
        return obj;
    }
    
    static GameObject CreateCapsule(Transform parent, Vector3 pos, Vector3 scale, Material mat)
    {
        var obj = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        obj.transform.parent = parent;
        obj.transform.localPosition = pos;
        obj.transform.localScale = scale;
        obj.GetComponent<Renderer>().sharedMaterial = mat;
        Object.DestroyImmediate(obj.GetComponent<Collider>());
        return obj;
    }
    
    static GameObject CreateCube(Transform parent, Vector3 pos, Vector3 scale, Material mat)
    {
        var obj = GameObject.CreatePrimitive(PrimitiveType.Cube);
        obj.transform.parent = parent;
        obj.transform.localPosition = pos;
        obj.transform.localScale = scale;
        obj.GetComponent<Renderer>().sharedMaterial = mat;
        Object.DestroyImmediate(obj.GetComponent<Collider>());
        return obj;
    }
    
    static GameObject CreateCylinder(Transform parent, Vector3 pos, Vector3 scale, Material mat)
    {
        var obj = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        obj.transform.parent = parent;
        obj.transform.localPosition = pos;
        obj.transform.localScale = scale;
        obj.GetComponent<Renderer>().sharedMaterial = mat;
        Object.DestroyImmediate(obj.GetComponent<Collider>());
        return obj;
    }
    
    static void AddUnitComponents(GameObject unit, string nameTH, float scale, Color teamColor)
    {
        // Add collider to root
        var capsule = unit.AddComponent<CapsuleCollider>();
        capsule.height = 2f * scale;
        capsule.radius = 0.5f * scale;
        capsule.center = Vector3.up * scale;
        
        // Rigidbody
        var rb = unit.AddComponent<Rigidbody>();
        rb.constraints = RigidbodyConstraints.FreezeRotation;
        rb.mass = scale * 50f;
        
        // Health bar
        CreateHealthBar3D(unit.transform, 2.5f * scale, scale);
        
        // Selection circle
        CreateSelectionCircle(unit.transform, scale);
        
        // Name label
        CreateLabel(unit.transform, nameTH, 3f * scale, teamColor);
    }
    
    static void CreateHealthBar3D(Transform parent, float height, float scale)
    {
        GameObject hpParent = new GameObject("HealthBar");
        hpParent.transform.parent = parent;
        hpParent.transform.localPosition = Vector3.up * height;
        
        // Background
        var bg = CreateCube(hpParent.transform, Vector3.zero, new Vector3(1f * scale, 0.12f, 0.05f),
            CreateMaterial(Color.black));
        bg.name = "Background";
        
        // Fill
        var fill = CreateCube(hpParent.transform, new Vector3(0, 0, 0.03f), new Vector3(0.95f * scale, 0.1f, 0.04f),
            CreateMaterial(Color.green));
        fill.name = "Fill";
    }
    
    static void CreateSelectionCircle(Transform parent, float scale)
    {
        var circle = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        circle.name = "SelectionCircle";
        circle.transform.parent = parent;
        circle.transform.localPosition = Vector3.up * 0.02f;
        circle.transform.localScale = new Vector3(scale * 2f, 0.02f, scale * 2f);
        
        var mat = new Material(Shader.Find("Standard"));
        mat.color = new Color(0.2f, 1f, 0.2f, 0.6f);
        circle.GetComponent<Renderer>().sharedMaterial = mat;
        Object.DestroyImmediate(circle.GetComponent<Collider>());
        
        circle.SetActive(false); // Hidden by default
    }
    
    static void CreateLabel(Transform parent, string text, float height, Color color)
    {
        GameObject labelObj = new GameObject("Label");
        labelObj.transform.parent = parent;
        labelObj.transform.localPosition = Vector3.up * height;
        
        var tm = labelObj.AddComponent<TextMesh>();
        tm.text = text;
        tm.fontSize = 48;
        tm.characterSize = 0.06f;
        tm.alignment = TextAlignment.Center;
        tm.anchor = TextAnchor.MiddleCenter;
        tm.color = color;
    }
    
    static void SavePrefab(GameObject obj, string path)
    {
        if (File.Exists(path))
            AssetDatabase.DeleteAsset(path);
        
        PrefabUtility.SaveAsPrefabAsset(obj, path);
        Object.DestroyImmediate(obj);
        
        Debug.Log($"[BeautifulUnitGenerator] Created: {path}");
    }
    
    // ==================== Auto Spawn ====================
    
    static void AutoSpawnUnits()
    {
        // Find spawn points
        var thaiSpawn = GameObject.Find("Thai_Army_Spawn");
        var thaiElephantSpawn = GameObject.Find("Thai_Elephant_Spawn");
        var burmaSpawn = GameObject.Find("Burma_Army_Spawn");
        var burmaSiegeSpawn = GameObject.Find("Burma_Siege_Spawn");
        
        if (thaiSpawn == null && burmaSpawn == null)
        {
            // Try alternative names
            var spawnPoints = GameObject.Find("SpawnPoints");
            if (spawnPoints != null)
            {
                thaiSpawn = spawnPoints.transform.Find("Thai_Army_Spawn")?.gameObject;
                thaiElephantSpawn = spawnPoints.transform.Find("Thai_Elephant_Spawn")?.gameObject;
                burmaSpawn = spawnPoints.transform.Find("Burma_Army_Spawn")?.gameObject;
                burmaSiegeSpawn = spawnPoints.transform.Find("Burma_Siege_Spawn")?.gameObject;
            }
        }
        
        // Create units parent
        GameObject unitsParent = GameObject.Find("Units");
        if (unitsParent == null)
        {
            unitsParent = new GameObject("Units");
        }
        
        // Spawn Thai units
        if (thaiSpawn != null)
        {
            SpawnFormation(unitsParent.transform, "Thai", thaiSpawn.transform.position,
                new string[] { "Thai_Swordsman", "Thai_Swordsman", "Thai_Pikeman", "Thai_Archer", "Thai_Archer" });
        }
        
        if (thaiElephantSpawn != null)
        {
            SpawnUnit(unitsParent.transform, "Assets/_Prefabs/Units/Thai/Thai_WarElephant.prefab",
                thaiElephantSpawn.transform.position);
            SpawnUnit(unitsParent.transform, "Assets/_Prefabs/Units/Thai/Thai_King.prefab",
                thaiElephantSpawn.transform.position + Vector3.right * 5);
        }
        
        // Spawn Burma units
        if (burmaSpawn != null)
        {
            SpawnFormation(unitsParent.transform, "Burma", burmaSpawn.transform.position,
                new string[] { "Burma_Swordsman", "Burma_Pikeman", "Burma_Pikeman", "Burma_Archer" });
        }
        
        if (burmaSiegeSpawn != null)
        {
            SpawnUnit(unitsParent.transform, "Assets/_Prefabs/Units/Burma/Burma_WarElephant.prefab",
                burmaSiegeSpawn.transform.position);
            SpawnUnit(unitsParent.transform, "Assets/_Prefabs/Units/Burma/Burma_King.prefab",
                burmaSiegeSpawn.transform.position + Vector3.left * 5);
        }
        
        Debug.Log("[AutoSpawn] Units spawned at spawn points!");
    }
    
    static void SpawnFormation(Transform parent, string team, Vector3 center, string[] unitNames)
    {
        int cols = Mathf.CeilToInt(Mathf.Sqrt(unitNames.Length));
        float spacing = 3f;
        
        for (int i = 0; i < unitNames.Length; i++)
        {
            int row = i / cols;
            int col = i % cols;
            
            Vector3 offset = new Vector3(
                (col - cols / 2f) * spacing,
                0,
                (row - unitNames.Length / cols / 2f) * spacing
            );
            
            string path = $"Assets/_Prefabs/Units/{team}/{unitNames[i]}.prefab";
            SpawnUnit(parent, path, center + offset);
        }
    }
    
    static void SpawnUnit(Transform parent, string prefabPath, Vector3 position)
    {
        GameObject prefab = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
        if (prefab != null)
        {
            GameObject instance = (GameObject)PrefabUtility.InstantiatePrefab(prefab);
            instance.transform.parent = parent;
            instance.transform.position = position;
        }
        else
        {
            Debug.LogWarning($"Prefab not found: {prefabPath}");
        }
    }
}
#endif
