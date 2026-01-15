#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using RTS.Core.Data;

namespace RTS.Editor
{
    public class UnitDataGenerator : EditorWindow
    {
        [MenuItem("RTS/Generate White Elephant Units")]
        public static void GenerateWhiteElephantUnits()
        {
            string path = "Assets/_Data/Units/WhiteElephant/";
            
            // Create folder if not exists
            if (!AssetDatabase.IsValidFolder("Assets/_Data"))
                AssetDatabase.CreateFolder("Assets", "_Data");
            if (!AssetDatabase.IsValidFolder("Assets/_Data/Units"))
                AssetDatabase.CreateFolder("Assets/_Data", "Units");
            if (!AssetDatabase.IsValidFolder("Assets/_Data/Units/WhiteElephant"))
                AssetDatabase.CreateFolder("Assets/_Data/Units", "WhiteElephant");

            // Siam Units
            CreateUnit(path + "Swordsman.asset", "Swordsman", "ดาบเล็ว", 50, 0, 80, 0, 12, 1, 5);
            CreateUnit(path + "Pikeman.asset", "Pikeman", "พลหอก", 60, 10, 100, 1, 10, 2, 4);
            CreateUnit(path + "Archer.asset", "Archer", "พลธนู", 40, 20, 60, 0, 8, 12, 5);
            CreateUnit(path + "WarElephant.asset", "War Elephant", "ช้างศึก", 300, 50, 1200, 5, 60, 2, 6);
            CreateUnit(path + "RoyalBarge.asset", "Royal Barge", "เรือพระที่นั่ง", 200, 100, 500, 3, 0, 0, 4);
            CreateUnit(path + "KingMahachakraphat.asset", "King Mahachakraphat", "สมเด็จพระมหาจักรพรรดิ", 0, 0, 1500, 8, 80, 2, 5);
            CreateUnit(path + "QueenSuriyothai.asset", "Queen Suriyothai", "สมเด็จพระสุริโยทัย", 0, 0, 1200, 6, 70, 2, 6);

            // Burma Units
            CreateUnit(path + "BurmaMercenary.asset", "Portuguese Matchlock", "ทหารปืนคาบศิลาโปรตุเกส", 70, 30, 90, 0, 25, 10, 4);
            CreateUnit(path + "BurmaLancer.asset", "Burma Lancer", "ทหารหอกพม่า", 60, 20, 100, 1, 15, 2, 5);
            CreateUnit(path + "BurmaElephant.asset", "Burma War Elephant", "ช้างศึกพม่า", 300, 50, 1100, 4, 55, 2, 6);
            CreateUnit(path + "SiegeTower.asset", "Siege Tower", "หอรบ", 150, 100, 400, 8, 0, 0, 2);
            CreateUnit(path + "TabinshwehtiKing.asset", "King Tabinshwehti", "พระเจ้าตะเบ็งชะเวตี้", 0, 0, 1400, 7, 75, 2, 5);

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            
            Debug.Log("White Elephant campaign units generated successfully!");
            EditorUtility.DisplayDialog("Unit Generator", "Created 12 unit data assets in " + path, "OK");
        }

        private static void CreateUnit(string assetPath, string nameEN, string nameTH, 
            int costRice, int costSupplies, float hp, float armor, float damage, float range, float speed)
        {
            UnitData unit = ScriptableObject.CreateInstance<UnitData>();
            
            unit.UnitName = nameTH;
            unit.CostRice = costRice;
            unit.CostSupplies = costSupplies;
            unit.MaxHP = hp;
            unit.Armor = armor;
            unit.Damage = damage;
            unit.AttackRange = range;
            unit.AttackRate = 1.5f;
            unit.MoveSpeed = speed;

            AssetDatabase.CreateAsset(unit, assetPath);
        }

        [MenuItem("RTS/Generate Buildings Data")]
        public static void GenerateBuildingsData()
        {
            string path = "Assets/_Data/Buildings/";
            
            if (!AssetDatabase.IsValidFolder("Assets/_Data/Buildings"))
                AssetDatabase.CreateFolder("Assets/_Data", "Buildings");

            CreateBuilding(path + "Barracks.asset", "Barracks", "ค่ายทหาร", 100, 50, 500);
            CreateBuilding(path + "Stables.asset", "Stables", "โรงช้าง", 150, 75, 400);
            CreateBuilding(path + "Tower.asset", "Defense Tower", "หอคอย", 75, 100, 300);
            CreateBuilding(path + "Dock.asset", "Dock", "ท่าเรือ", 100, 100, 400);
            CreateBuilding(path + "Palace.asset", "Palace", "พระราชวัง", 500, 300, 2000);

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            
            Debug.Log("Building data assets generated successfully!");
        }

        private static void CreateBuilding(string assetPath, string nameEN, string nameTH,
            int costRice, int costSupplies, float hp)
        {
            // Using a simple ScriptableObject for buildings
            // In practice, you'd create a BuildingData class similar to UnitData
            var building = ScriptableObject.CreateInstance<BuildingData>();
            building.BuildingName = nameTH;
            building.BuildingNameEN = nameEN;
            building.CostRice = costRice;
            building.CostSupplies = costSupplies;
            building.MaxHP = hp;
            
            AssetDatabase.CreateAsset(building, assetPath);
        }
    }
}
#endif
