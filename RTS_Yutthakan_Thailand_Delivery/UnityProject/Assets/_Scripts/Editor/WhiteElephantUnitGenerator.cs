#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using System.IO;

/// <summary>
/// สร้าง Unit Prefabs สวยงามสำหรับแคมเปญสงครามช้างเผือก
/// Historical Units: พ.ศ. 2091 - สมเด็จพระสุริโยทัย
/// </summary>
public class WhiteElephantUnitGenerator : EditorWindow
{
    // Thai Ayutthaya Colors
    static Color thaiGold = new Color(0.85f, 0.7f, 0.2f);
    static Color thaiBlue = new Color(0.15f, 0.3f, 0.6f);
    static Color thaiRed = new Color(0.7f, 0.15f, 0.1f);
    static Color darkBlue = new Color(0.1f, 0.2f, 0.4f);
    
    // Burma Colors
    static Color burmaRed = new Color(0.65f, 0.12f, 0.1f);
    static Color burmaGold = new Color(0.8f, 0.6f, 0.15f);
    static Color darkRed = new Color(0.35f, 0.08f, 0.05f);
    
    // Neutral Colors
    static Color skinTone = new Color(0.85f, 0.7f, 0.55f);
    static Color elephantGrey = new Color(0.45f, 0.45f, 0.48f);
    static Color ivory = new Color(1f, 0.98f, 0.9f);
    static Color bronze = new Color(0.7f, 0.45f, 0.2f);
    static Color steel = new Color(0.7f, 0.72f, 0.75f);
    static Color wood = new Color(0.45f, 0.3f, 0.15f);
    static Color leather = new Color(0.5f, 0.35f, 0.2f);
    
    [MenuItem("Tools/RTS Thai/Generate White Elephant Campaign Units")]
    public static void GenerateCampaignUnits()
    {
        EnsureFolders();
        
        // Thai Heroes
        CreateQueenSuriyothai();
        CreateKingMahaChakrapat();
        
        // Thai Units
        CreateThaiWarElephant();
        CreateThaiSwordsman();
        CreateThaiPikeman();
        CreateThaiArcher();
        CreateThaiCavalry();
        
        // Burma Heroes
        CreateKingTabinshwehti();
        
        // Burma Units
        CreateBurmaWarElephant();
        CreateBurmaSwordsman();
        CreateBurmaPikeman();
        CreateBurmaArcher();
        CreateBurmaCavalry();
        
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        
        Debug.Log("✅ White Elephant Campaign Units created!");
        EditorUtility.DisplayDialog("Units Created!", 
            "สร้าง Unit สำหรับแคมเปญสงครามช้างเผือก!\n\n" +
            "Thai Heroes:\n" +
            "- สมเด็จพระสุริโยทัย\n" +
            "- สมเด็จพระมหาจักรพรรดิ\n\n" +
            "Burma Hero:\n" +
            "- พระเจ้าตะเบ็งชะเวตี้\n\n" +
            "Units: Elephant, Sword, Pike, Archer, Cavalry\n\n" +
            "Location: Assets/_Prefabs/Units/", "OK");
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
    
    // ==================== QUEEN SURIYOTHAI ====================
    static void CreateQueenSuriyothai()
    {
        GameObject unit = new GameObject("Thai_QueenSuriyothai");
        
        // Elephant mount
        CreateDetailedElephant(unit.transform, elephantGrey, thaiGold, thaiBlue);
        
        // Queen figure on elephant
        CreateQueenFigure(unit.transform);
        
        // Royal howdah
        CreateRoyalHowdah(unit.transform, thaiGold, thaiBlue);
        
        // Royal banner
        CreateRoyalBanner(unit.transform, thaiBlue, thaiGold, "สุริโยทัย");
        
        AddUnitComponents(unit, "สมเด็จพระสุริโยทัย", 4f, thaiGold, 200, 80, 60);
        SavePrefab(unit, "Assets/_Prefabs/Units/Thai/Thai_QueenSuriyothai.prefab");
    }
    
    static void CreateQueenFigure(Transform parent)
    {
        GameObject queen = new GameObject("Queen");
        queen.transform.parent = parent;
        queen.transform.localPosition = new Vector3(0, 5.5f, 0);
        
        // Body
        CreateCapsule(queen.transform, Vector3.zero, new Vector3(0.4f, 0.6f, 0.3f), 
            CreateMat(thaiBlue), "Body");
        
        // Head
        CreateSphere(queen.transform, Vector3.up * 0.9f, Vector3.one * 0.28f, 
            CreateMat(skinTone), "Head");
        
        // Royal tiara
        CreateCylinder(queen.transform, Vector3.up * 1.15f, new Vector3(0.2f, 0.15f, 0.2f), 
            CreateMat(thaiGold), "Tiara");
        
        // Crown spire
        CreateCone(queen.transform, Vector3.up * 1.4f, 0.08f, 0.25f, thaiGold, "Spire");
        
        // Royal robe
        CreateCube(queen.transform, new Vector3(0, -0.2f, -0.15f), new Vector3(0.5f, 0.8f, 0.06f), 
            CreateMat(thaiRed), "Robe");
        
        // Sword
        CreateCube(queen.transform, new Vector3(0.4f, 0, 0.15f), new Vector3(0.05f, 0.8f, 0.02f), 
            CreateMat(steel), "Sword");
        CreateCube(queen.transform, new Vector3(0.4f, -0.35f, 0.15f), new Vector3(0.08f, 0.15f, 0.06f), 
            CreateMat(thaiGold), "SwordHandle");
    }
    
    // ==================== KING MAHA CHAKRAPAT ====================
    static void CreateKingMahaChakrapat()
    {
        GameObject unit = new GameObject("Thai_KingMahaChakrapat");
        
        // Elephant mount
        CreateDetailedElephant(unit.transform, elephantGrey, thaiGold, thaiBlue);
        
        // King figure on elephant
        CreateKingFigure(unit.transform, thaiGold, thaiBlue, "Thai");
        
        // Grand royal howdah
        CreateRoyalHowdah(unit.transform, thaiGold, thaiBlue);
        
        // Royal standard
        CreateRoyalBanner(unit.transform, thaiBlue, thaiGold, "มหาจักร");
        
        AddUnitComponents(unit, "สมเด็จพระมหาจักรพรรดิ", 4f, thaiGold, 250, 100, 70);
        SavePrefab(unit, "Assets/_Prefabs/Units/Thai/Thai_KingMahaChakrapat.prefab");
    }
    
    static void CreateKingFigure(Transform parent, Color primary, Color secondary, string team)
    {
        GameObject king = new GameObject("King");
        king.transform.parent = parent;
        king.transform.localPosition = new Vector3(0, 5.5f, 0);
        
        // Body - armor
        CreateCapsule(king.transform, Vector3.zero, new Vector3(0.5f, 0.65f, 0.35f), 
            CreateMat(primary), "ArmoredBody");
        
        // Head
        CreateSphere(king.transform, Vector3.up * 0.95f, Vector3.one * 0.3f, 
            CreateMat(skinTone), "Head");
        
        // Royal crown (elaborate)
        CreateCrown(king.transform, Vector3.up * 1.2f, primary);
        
        // Shoulder armor
        CreateSphere(king.transform, new Vector3(-0.35f, 0.4f, 0), Vector3.one * 0.2f, 
            CreateMat(primary), "ShoulderL");
        CreateSphere(king.transform, new Vector3(0.35f, 0.4f, 0), Vector3.one * 0.2f, 
            CreateMat(primary), "ShoulderR");
        
        // Royal sword
        CreateCube(king.transform, new Vector3(0.5f, 0.1f, 0.2f), new Vector3(0.06f, 1f, 0.025f), 
            CreateMat(steel), "RoyalSword");
        CreateCube(king.transform, new Vector3(0.5f, -0.45f, 0.2f), new Vector3(0.1f, 0.2f, 0.08f), 
            CreateMat(primary), "SwordHandle");
    }
    
    static void CreateCrown(Transform parent, Vector3 pos, Color color)
    {
        GameObject crown = new GameObject("Crown");
        crown.transform.parent = parent;
        crown.transform.localPosition = pos;
        
        // Crown base
        CreateCylinder(crown.transform, Vector3.zero, new Vector3(0.25f, 0.12f, 0.25f), 
            CreateMat(color), "Base");
        
        // Crown spires (5 points)
        for (int i = 0; i < 5; i++)
        {
            float angle = i * 72 * Mathf.Deg2Rad;
            Vector3 spirePos = new Vector3(Mathf.Sin(angle) * 0.18f, 0.2f, Mathf.Cos(angle) * 0.18f);
            CreateCone(crown.transform, spirePos, 0.04f, 0.15f, color, $"Spire{i}");
        }
        
        // Central tall spire
        CreateCone(crown.transform, Vector3.up * 0.25f, 0.06f, 0.3f, color, "CentralSpire");
    }
    
    // ==================== THAI WAR ELEPHANT ====================
    static void CreateThaiWarElephant()
    {
        GameObject unit = new GameObject("Thai_WarElephant");
        
        CreateDetailedElephant(unit.transform, elephantGrey, thaiGold, thaiBlue);
        CreateElephantRiders(unit.transform, thaiBlue, thaiGold, 2);
        CreateRoyalHowdah(unit.transform, thaiGold, thaiBlue);
        
        AddUnitComponents(unit, "ช้างศึกไทย", 3.5f, thaiBlue, 300, 60, 80);
        SavePrefab(unit, "Assets/_Prefabs/Units/Thai/Thai_WarElephant.prefab");
    }
    
    static void CreateDetailedElephant(Transform parent, Color bodyColor, Color decorColor, Color clothColor)
    {
        GameObject elephant = new GameObject("Elephant");
        elephant.transform.parent = parent;
        
        // Main body
        CreateSphere(elephant.transform, new Vector3(0, 2.5f, 0), new Vector3(2.2f, 1.8f, 2.8f), 
            CreateMat(bodyColor), "Body");
        
        // Head
        CreateSphere(elephant.transform, new Vector3(0, 2.9f, 1.8f), new Vector3(1f, 0.9f, 0.95f),
            CreateMat(bodyColor), "Head");
        
        // Ears
        CreateSphere(elephant.transform, new Vector3(-0.75f, 3f, 1.5f), new Vector3(0.5f, 0.65f, 0.12f),
            CreateMat(new Color(bodyColor.r * 1.1f, bodyColor.g * 1.05f, bodyColor.b)), "EarL");
        CreateSphere(elephant.transform, new Vector3(0.75f, 3f, 1.5f), new Vector3(0.5f, 0.65f, 0.12f),
            CreateMat(new Color(bodyColor.r * 1.1f, bodyColor.g * 1.05f, bodyColor.b)), "EarR");
        
        // Trunk
        CreateCapsule(elephant.transform, new Vector3(0, 1.8f, 2.6f), new Vector3(0.22f, 0.9f, 0.22f),
            CreateMat(bodyColor), "Trunk");
        elephant.transform.Find("Trunk").localRotation = Quaternion.Euler(55, 0, 0);
        
        // Tusks
        CreateCylinder(elephant.transform, new Vector3(-0.3f, 2.3f, 2.4f), new Vector3(0.07f, 0.5f, 0.07f),
            CreateMat(ivory), "TuskL");
        elephant.transform.Find("TuskL").localRotation = Quaternion.Euler(65, 0, -12);
        
        CreateCylinder(elephant.transform, new Vector3(0.3f, 2.3f, 2.4f), new Vector3(0.07f, 0.5f, 0.07f),
            CreateMat(ivory), "TuskR");
        elephant.transform.Find("TuskR").localRotation = Quaternion.Euler(65, 0, 12);
        
        // Legs
        float[] legX = { -0.7f, 0.7f, -0.7f, 0.7f };
        float[] legZ = { 0.9f, 0.9f, -0.9f, -0.9f };
        for (int i = 0; i < 4; i++)
        {
            CreateCapsule(elephant.transform, new Vector3(legX[i], 0.8f, legZ[i]), 
                new Vector3(0.35f, 0.8f, 0.35f), CreateMat(bodyColor), $"Leg{i}");
        }
        
        // Tail
        CreateCylinder(elephant.transform, new Vector3(0, 2f, -1.6f), new Vector3(0.08f, 0.5f, 0.08f),
            CreateMat(bodyColor), "Tail");
        elephant.transform.Find("Tail").localRotation = Quaternion.Euler(-50, 0, 0);
        
        // Decorative cloth/blanket
        CreateCube(elephant.transform, new Vector3(0, 3.3f, 0), new Vector3(1.8f, 0.15f, 2.2f),
            CreateMat(clothColor), "Blanket");
        
        // Forehead decoration
        CreateSphere(elephant.transform, new Vector3(0, 3.3f, 1.9f), Vector3.one * 0.25f,
            CreateMat(decorColor), "ForeheadDecor");
        
        // Head armor
        CreateCube(elephant.transform, new Vector3(0, 3.1f, 1.65f), new Vector3(0.8f, 0.15f, 0.5f),
            CreateMat(decorColor), "HeadArmor");
    }
    
    static void CreateElephantRiders(Transform parent, Color armorColor, Color accentColor, int count)
    {
        for (int i = 0; i < count; i++)
        {
            float zOffset = i == 0 ? 0.3f : -0.5f;
            GameObject rider = new GameObject($"Rider{i}");
            rider.transform.parent = parent;
            rider.transform.localPosition = new Vector3(0, 5f, zOffset);
            
            // Body
            CreateCapsule(rider.transform, Vector3.zero, new Vector3(0.3f, 0.45f, 0.22f),
                CreateMat(armorColor), "Body");
            
            // Head
            CreateSphere(rider.transform, Vector3.up * 0.65f, Vector3.one * 0.2f,
                CreateMat(skinTone), "Head");
            
            // Helmet
            CreateCylinder(rider.transform, Vector3.up * 0.8f, new Vector3(0.18f, 0.12f, 0.18f),
                CreateMat(accentColor), "Helmet");
            
            // Weapon (front rider has pike, back has bow)
            if (i == 0)
            {
                CreateCylinder(rider.transform, new Vector3(0.25f, 0.8f, 0), new Vector3(0.03f, 1.2f, 0.03f),
                    CreateMat(wood), "Pike");
                CreateCube(rider.transform, new Vector3(0.25f, 1.5f, 0), new Vector3(0.06f, 0.2f, 0.015f),
                    CreateMat(steel), "PikeHead");
            }
            else
            {
                CreateCylinder(rider.transform, new Vector3(-0.2f, 0.4f, 0.1f), new Vector3(0.02f, 0.5f, 0.02f),
                    CreateMat(wood), "Bow");
            }
        }
    }
    
    static void CreateRoyalHowdah(Transform parent, Color primary, Color secondary)
    {
        GameObject howdah = new GameObject("Howdah");
        howdah.transform.parent = parent;
        howdah.transform.localPosition = new Vector3(0, 4.2f, 0);
        
        // Platform
        CreateCube(howdah.transform, Vector3.zero, new Vector3(1.6f, 0.3f, 2f),
            CreateMat(primary), "Platform");
        
        // Corner posts
        float[] px = { -0.6f, 0.6f, -0.6f, 0.6f };
        float[] pz = { 0.7f, 0.7f, -0.7f, -0.7f };
        for (int i = 0; i < 4; i++)
        {
            CreateCylinder(howdah.transform, new Vector3(px[i], 0.6f, pz[i]), 
                new Vector3(0.08f, 0.4f, 0.08f), CreateMat(primary), $"Post{i}");
        }
        
        // Canopy frame
        CreateCube(howdah.transform, new Vector3(0, 1.1f, 0), new Vector3(1.5f, 0.08f, 1.8f),
            CreateMat(secondary), "CanopyFrame");
        
        // Canopy roof
        CreateCube(howdah.transform, new Vector3(0, 1.25f, 0), new Vector3(1.7f, 0.12f, 2f),
            CreateMat(secondary), "Canopy");
        
        // Decorative spire
        CreateCone(howdah.transform, new Vector3(0, 1.6f, 0), 0.1f, 0.4f, primary, "Spire");
    }
    
    static void CreateRoyalBanner(Transform parent, Color bgColor, Color accentColor, string text)
    {
        GameObject banner = new GameObject("Banner");
        banner.transform.parent = parent;
        banner.transform.localPosition = new Vector3(-1.2f, 6f, 0);
        
        // Pole
        CreateCylinder(banner.transform, Vector3.zero, new Vector3(0.05f, 2f, 0.05f),
            CreateMat(wood), "Pole");
        
        // Flag
        CreateCube(banner.transform, new Vector3(0.6f, 1.5f, 0), new Vector3(1f, 1.2f, 0.03f),
            CreateMat(bgColor), "Flag");
        
        // Flag decoration
        CreateCube(banner.transform, new Vector3(0.6f, 1.5f, 0.02f), new Vector3(0.3f, 0.3f, 0.02f),
            CreateMat(accentColor), "Emblem");
    }
    
    // ==================== BURMA KING ====================
    static void CreateKingTabinshwehti()
    {
        GameObject unit = new GameObject("Burma_KingTabinshwehti");
        
        CreateDetailedElephant(unit.transform, elephantGrey, burmaGold, burmaRed);
        CreateKingFigure(unit.transform, burmaGold, burmaRed, "Burma");
        CreateRoyalHowdah(unit.transform, burmaGold, burmaRed);
        CreateRoyalBanner(unit.transform, burmaRed, burmaGold, "Burma");
        
        AddUnitComponents(unit, "พระเจ้าตะเบ็งชะเวตี้", 4f, burmaRed, 280, 110, 75);
        SavePrefab(unit, "Assets/_Prefabs/Units/Burma/Burma_KingTabinshwehti.prefab");
    }
    
    // ==================== BURMA WAR ELEPHANT ====================
    static void CreateBurmaWarElephant()
    {
        GameObject unit = new GameObject("Burma_WarElephant");
        
        CreateDetailedElephant(unit.transform, elephantGrey, burmaGold, burmaRed);
        CreateElephantRiders(unit.transform, burmaRed, burmaGold, 2);
        CreateRoyalHowdah(unit.transform, burmaGold, burmaRed);
        
        AddUnitComponents(unit, "ช้างศึกพม่า", 3.5f, burmaRed, 320, 65, 85);
        SavePrefab(unit, "Assets/_Prefabs/Units/Burma/Burma_WarElephant.prefab");
    }
    
    // ==================== INFANTRY ====================
    static void CreateThaiSwordsman()
    {
        CreateSwordsman("Thai", "ดาบเล็วไทย", thaiBlue, thaiGold);
    }
    
    static void CreateBurmaSwordsman()
    {
        CreateSwordsman("Burma", "ดาบพม่า", burmaRed, burmaGold);
    }
    
    static void CreateSwordsman(string team, string nameTH, Color primary, Color accent)
    {
        GameObject unit = new GameObject($"{team}_Swordsman");
        
        // Body
        CreateCapsule(unit.transform, Vector3.up * 1.1f, new Vector3(0.45f, 0.55f, 0.3f),
            CreateMat(primary), "Body");
        
        // Head
        CreateSphere(unit.transform, Vector3.up * 1.9f, Vector3.one * 0.25f,
            CreateMat(skinTone), "Head");
        
        // Helmet
        CreateCylinder(unit.transform, Vector3.up * 2.1f, new Vector3(0.22f, 0.12f, 0.22f),
            CreateMat(accent), "Helmet");
        CreateCone(unit.transform, Vector3.up * 2.25f, 0.08f, 0.15f, accent, "HelmetSpike");
        
        // Legs
        CreateCapsule(unit.transform, new Vector3(-0.12f, 0.4f, 0), new Vector3(0.14f, 0.4f, 0.14f),
            CreateMat(primary), "LegL");
        CreateCapsule(unit.transform, new Vector3(0.12f, 0.4f, 0), new Vector3(0.14f, 0.4f, 0.14f),
            CreateMat(primary), "LegR");
        
        // Arms
        CreateCapsule(unit.transform, new Vector3(-0.32f, 1.2f, 0), new Vector3(0.1f, 0.3f, 0.1f),
            CreateMat(primary), "ArmL");
        CreateCapsule(unit.transform, new Vector3(0.32f, 1.2f, 0), new Vector3(0.1f, 0.3f, 0.1f),
            CreateMat(primary), "ArmR");
        
        // Sword
        CreateCube(unit.transform, new Vector3(0.45f, 1f, 0.18f), new Vector3(0.04f, 0.7f, 0.015f),
            CreateMat(steel), "Sword");
        CreateCube(unit.transform, new Vector3(0.45f, 0.55f, 0.18f), new Vector3(0.07f, 0.12f, 0.05f),
            CreateMat(accent), "SwordHandle");
        
        // Shield
        CreateCylinder(unit.transform, new Vector3(-0.4f, 1.05f, 0.12f), new Vector3(0.35f, 0.04f, 0.35f),
            CreateMat(primary), "Shield");
        unit.transform.Find("Shield").localRotation = Quaternion.Euler(90, 0, 0);
        CreateSphere(unit.transform, new Vector3(-0.4f, 1.05f, 0.16f), Vector3.one * 0.1f,
            CreateMat(accent), "ShieldBoss");
        
        AddUnitComponents(unit, nameTH, 1.2f, primary, 100, 40, 45);
        SavePrefab(unit, $"Assets/_Prefabs/Units/{team}/{team}_Swordsman.prefab");
    }
    
    static void CreateThaiPikeman() { CreatePikeman("Thai", "พลหอกไทย", thaiBlue, thaiGold); }
    static void CreateBurmaPikeman() { CreatePikeman("Burma", "พลหอกพม่า", burmaRed, burmaGold); }
    
    static void CreatePikeman(string team, string nameTH, Color primary, Color accent)
    {
        GameObject unit = new GameObject($"{team}_Pikeman");
        
        CreateCapsule(unit.transform, Vector3.up * 1.1f, new Vector3(0.4f, 0.5f, 0.28f),
            CreateMat(primary), "Body");
        CreateSphere(unit.transform, Vector3.up * 1.85f, Vector3.one * 0.24f,
            CreateMat(skinTone), "Head");
        CreateCylinder(unit.transform, Vector3.up * 2.05f, new Vector3(0.2f, 0.1f, 0.2f),
            CreateMat(accent), "Helmet");
        
        // Legs
        CreateCapsule(unit.transform, new Vector3(-0.1f, 0.38f, 0), new Vector3(0.12f, 0.38f, 0.12f),
            CreateMat(primary), "LegL");
        CreateCapsule(unit.transform, new Vector3(0.1f, 0.38f, 0), new Vector3(0.12f, 0.38f, 0.12f),
            CreateMat(primary), "LegR");
        
        // Pike
        CreateCylinder(unit.transform, new Vector3(0.3f, 1.8f, 0), new Vector3(0.03f, 1.5f, 0.03f),
            CreateMat(wood), "Pike");
        CreateCube(unit.transform, new Vector3(0.3f, 3.4f, 0), new Vector3(0.06f, 0.25f, 0.015f),
            CreateMat(steel), "PikeHead");
        
        AddUnitComponents(unit, nameTH, 1.1f, primary, 90, 50, 55);
        SavePrefab(unit, $"Assets/_Prefabs/Units/{team}/{team}_Pikeman.prefab");
    }
    
    static void CreateThaiArcher() { CreateArcher("Thai", "พลธนูไทย", thaiBlue, thaiGold); }
    static void CreateBurmaArcher() { CreateArcher("Burma", "พลธนูพม่า", burmaRed, burmaGold); }
    
    static void CreateArcher(string team, string nameTH, Color primary, Color accent)
    {
        GameObject unit = new GameObject($"{team}_Archer");
        
        CreateCapsule(unit.transform, Vector3.up * 1.05f, new Vector3(0.35f, 0.48f, 0.25f),
            CreateMat(primary), "Body");
        CreateSphere(unit.transform, Vector3.up * 1.75f, Vector3.one * 0.22f,
            CreateMat(skinTone), "Head");
        CreateCylinder(unit.transform, Vector3.up * 1.9f, new Vector3(0.2f, 0.06f, 0.2f),
            CreateMat(leather), "Headband");
        
        // Legs
        CreateCapsule(unit.transform, new Vector3(-0.09f, 0.35f, 0), new Vector3(0.1f, 0.35f, 0.1f),
            CreateMat(primary), "LegL");
        CreateCapsule(unit.transform, new Vector3(0.09f, 0.35f, 0), new Vector3(0.1f, 0.35f, 0.1f),
            CreateMat(primary), "LegR");
        
        // Bow
        CreateCylinder(unit.transform, new Vector3(-0.32f, 0.85f, 0.12f), new Vector3(0.025f, 0.4f, 0.025f),
            CreateMat(wood), "BowLower");
        unit.transform.Find("BowLower").localRotation = Quaternion.Euler(0, 0, 12);
        
        CreateCylinder(unit.transform, new Vector3(-0.32f, 1.35f, 0.12f), new Vector3(0.025f, 0.4f, 0.025f),
            CreateMat(wood), "BowUpper");
        unit.transform.Find("BowUpper").localRotation = Quaternion.Euler(0, 0, -12);
        
        // Quiver
        CreateCylinder(unit.transform, new Vector3(0.12f, 1.15f, -0.18f), new Vector3(0.1f, 0.3f, 0.1f),
            CreateMat(leather), "Quiver");
        unit.transform.Find("Quiver").localRotation = Quaternion.Euler(-15, 0, 0);
        
        AddUnitComponents(unit, nameTH, 1f, primary, 70, 25, 25);
        SavePrefab(unit, $"Assets/_Prefabs/Units/{team}/{team}_Archer.prefab");
    }
    
    static void CreateThaiCavalry() { CreateCavalry("Thai", "ทหารม้าไทย", thaiBlue, thaiGold); }
    static void CreateBurmaCavalry() { CreateCavalry("Burma", "ทหารม้าพม่า", burmaRed, burmaGold); }
    
    static void CreateCavalry(string team, string nameTH, Color primary, Color accent)
    {
        GameObject unit = new GameObject($"{team}_Cavalry");
        
        // Horse
        CreateHorse(unit.transform, primary, accent);
        
        // Rider
        GameObject rider = new GameObject("Rider");
        rider.transform.parent = unit.transform;
        rider.transform.localPosition = new Vector3(0, 2f, -0.1f);
        
        CreateCapsule(rider.transform, Vector3.zero, new Vector3(0.35f, 0.45f, 0.25f),
            CreateMat(primary), "Body");
        CreateSphere(rider.transform, Vector3.up * 0.65f, Vector3.one * 0.22f,
            CreateMat(skinTone), "Head");
        CreateCylinder(rider.transform, Vector3.up * 0.82f, new Vector3(0.18f, 0.1f, 0.18f),
            CreateMat(accent), "Helmet");
        
        // Lance
        CreateCylinder(rider.transform, new Vector3(0.25f, 0.6f, 0), new Vector3(0.025f, 1.2f, 0.025f),
            CreateMat(wood), "Lance");
        CreateCube(rider.transform, new Vector3(0.25f, 1.3f, 0), new Vector3(0.05f, 0.15f, 0.012f),
            CreateMat(steel), "LanceHead");
        
        AddUnitComponents(unit, nameTH, 1.8f, primary, 120, 55, 35);
        SavePrefab(unit, $"Assets/_Prefabs/Units/{team}/{team}_Cavalry.prefab");
    }
    
    static void CreateHorse(Transform parent, Color saddleColor, Color accentColor)
    {
        Color horseColor = new Color(0.45f, 0.35f, 0.25f);
        
        GameObject horse = new GameObject("Horse");
        horse.transform.parent = parent;
        
        // Body
        CreateSphere(horse.transform, new Vector3(0, 1.2f, 0), new Vector3(0.9f, 0.7f, 1.5f),
            CreateMat(horseColor), "Body");
        
        // Neck
        CreateCapsule(horse.transform, new Vector3(0, 1.6f, 0.7f), new Vector3(0.3f, 0.5f, 0.3f),
            CreateMat(horseColor), "Neck");
        horse.transform.Find("Neck").localRotation = Quaternion.Euler(-40, 0, 0);
        
        // Head
        CreateCapsule(horse.transform, new Vector3(0, 2f, 1.1f), new Vector3(0.2f, 0.35f, 0.25f),
            CreateMat(horseColor), "Head");
        horse.transform.Find("Head").localRotation = Quaternion.Euler(-70, 0, 0);
        
        // Legs
        CreateCapsule(horse.transform, new Vector3(-0.3f, 0.5f, 0.5f), new Vector3(0.12f, 0.5f, 0.12f),
            CreateMat(horseColor), "LegFL");
        CreateCapsule(horse.transform, new Vector3(0.3f, 0.5f, 0.5f), new Vector3(0.12f, 0.5f, 0.12f),
            CreateMat(horseColor), "LegFR");
        CreateCapsule(horse.transform, new Vector3(-0.3f, 0.5f, -0.5f), new Vector3(0.12f, 0.5f, 0.12f),
            CreateMat(horseColor), "LegBL");
        CreateCapsule(horse.transform, new Vector3(0.3f, 0.5f, -0.5f), new Vector3(0.12f, 0.5f, 0.12f),
            CreateMat(horseColor), "LegBR");
        
        // Saddle
        CreateCube(horse.transform, new Vector3(0, 1.65f, -0.1f), new Vector3(0.5f, 0.15f, 0.6f),
            CreateMat(saddleColor), "Saddle");
    }
    
    // ==================== HELPERS ====================
    static Material CreateMat(Color c)
    {
        var m = new Material(Shader.Find("Standard"));
        m.color = c;
        return m;
    }
    
    static GameObject CreateSphere(Transform p, Vector3 pos, Vector3 scale, Material m, string name)
    {
        var o = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        o.name = name;
        o.transform.parent = p;
        o.transform.localPosition = pos;
        o.transform.localScale = scale;
        o.GetComponent<Renderer>().sharedMaterial = m;
        Object.DestroyImmediate(o.GetComponent<Collider>());
        return o;
    }
    
    static GameObject CreateCapsule(Transform p, Vector3 pos, Vector3 scale, Material m, string name)
    {
        var o = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        o.name = name;
        o.transform.parent = p;
        o.transform.localPosition = pos;
        o.transform.localScale = scale;
        o.GetComponent<Renderer>().sharedMaterial = m;
        Object.DestroyImmediate(o.GetComponent<Collider>());
        return o;
    }
    
    static GameObject CreateCube(Transform p, Vector3 pos, Vector3 scale, Material m, string name)
    {
        var o = GameObject.CreatePrimitive(PrimitiveType.Cube);
        o.name = name;
        o.transform.parent = p;
        o.transform.localPosition = pos;
        o.transform.localScale = scale;
        o.GetComponent<Renderer>().sharedMaterial = m;
        Object.DestroyImmediate(o.GetComponent<Collider>());
        return o;
    }
    
    static GameObject CreateCylinder(Transform p, Vector3 pos, Vector3 scale, Material m, string name)
    {
        var o = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        o.name = name;
        o.transform.parent = p;
        o.transform.localPosition = pos;
        o.transform.localScale = scale;
        o.GetComponent<Renderer>().sharedMaterial = m;
        Object.DestroyImmediate(o.GetComponent<Collider>());
        return o;
    }
    
    static void CreateCone(Transform parent, Vector3 pos, float radius, float height, Color color, string name)
    {
        // Approximate cone with cylinder
        var o = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        o.name = name;
        o.transform.parent = parent;
        o.transform.localPosition = pos;
        o.transform.localScale = new Vector3(radius * 2, height * 0.5f, radius * 2);
        o.GetComponent<Renderer>().sharedMaterial = CreateMat(color);
        Object.DestroyImmediate(o.GetComponent<Collider>());
    }
    
    static void AddUnitComponents(GameObject unit, string nameTH, float scale, Color teamColor, int hp, int atk, int def)
    {
        // Collider
        var capsule = unit.AddComponent<CapsuleCollider>();
        capsule.height = 2f * scale;
        capsule.radius = 0.5f * scale;
        capsule.center = Vector3.up * scale;
        
        // Rigidbody
        var rb = unit.AddComponent<Rigidbody>();
        rb.constraints = RigidbodyConstraints.FreezeRotation;
        rb.mass = scale * 50f;
        
        // Selection circle
        CreateSelectionCircle(unit.transform, scale);
        
        // Health bar
        CreateHealthBar3D(unit.transform, 2.5f * scale, scale);
        
        // Name label
        CreateLabel(unit.transform, nameTH, 3.2f * scale, teamColor);
        
        // Add selectable component
        var selectable = unit.AddComponent<SelectableUnit>();
        selectable.teamId = unit.name.StartsWith("Thai") ? "Thai" : "Burma";
        
        // Add mover
        var mover = unit.AddComponent<SimpleUnitMover>();
        mover.moveSpeed = unit.name.Contains("Elephant") ? 4f : (unit.name.Contains("Cavalry") ? 10f : 7f);
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
        
        circle.SetActive(false);
    }
    
    static void CreateHealthBar3D(Transform parent, float height, float scale)
    {
        GameObject hpParent = new GameObject("HealthBar");
        hpParent.transform.parent = parent;
        hpParent.transform.localPosition = Vector3.up * height;
        
        var bg = CreateCube(hpParent.transform, Vector3.zero, new Vector3(1f * scale, 0.12f, 0.05f),
            CreateMat(Color.black), "Background");
        var fill = CreateCube(hpParent.transform, new Vector3(0, 0, 0.03f), new Vector3(0.95f * scale, 0.1f, 0.04f),
            CreateMat(Color.green), "Fill");
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
        
        Debug.Log($"[WhiteElephantUnits] Created: {path}");
    }
}
#endif
