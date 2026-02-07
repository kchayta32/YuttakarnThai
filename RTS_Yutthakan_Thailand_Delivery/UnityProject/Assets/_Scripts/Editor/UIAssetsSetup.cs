#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using RTS.Core.Data;

namespace RTS.Editor
{
    /// <summary>
    /// สร้างและกำหนดค่า UIAssetsData ScriptableObject โดยอัตโนมัติ
    /// </summary>
    public class UIAssetsSetup : EditorWindow
    {
        private UIAssetsData targetAsset;

        [MenuItem("RTS/Setup UI Assets")]
        public static void ShowWindow()
        {
            GetWindow<UIAssetsSetup>("UI Assets Setup");
        }

        [MenuItem("RTS/Create GameUIAssets")]
        public static void CreateUIAssetsData()
        {
            // Create new UIAssetsData
            UIAssetsData asset = ScriptableObject.CreateInstance<UIAssetsData>();
            
            // Ensure folder exists
            if (!AssetDatabase.IsValidFolder("Assets/Data"))
                AssetDatabase.CreateFolder("Assets", "Data");
            
            string path = "Assets/Data/GameUIAssets.asset";
            AssetDatabase.CreateAsset(asset, path);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            
            // Select the new asset
            Selection.activeObject = asset;
            EditorUtility.FocusProjectWindow();
            
            Debug.Log($"Created UIAssetsData at: {path}");
            EditorUtility.DisplayDialog("Success!", 
                "Created GameUIAssets.asset\n\nUse RTS > Setup UI Assets to auto-assign sprites", "OK");
        }

        private void OnGUI()
        {
            GUILayout.Label("UI Assets Setup", EditorStyles.boldLabel);
            GUILayout.Space(10);

            targetAsset = (UIAssetsData)EditorGUILayout.ObjectField(
                "Target Asset", targetAsset, typeof(UIAssetsData), false);

            if (targetAsset == null)
            {
                EditorGUILayout.HelpBox(
                    "Drag GameUIAssets here or click 'Find/Create Asset'", 
                    MessageType.Warning);

                if (GUILayout.Button("Find/Create Asset", GUILayout.Height(30)))
                {
                    FindOrCreateAsset();
                }
                return;
            }

            GUILayout.Space(20);

            if (GUILayout.Button("Auto-Assign All Sprites", GUILayout.Height(40)))
            {
                AutoAssignSprites();
            }

            GUILayout.Space(10);
            EditorGUILayout.HelpBox(
                "This will search Assets/UI/Icons and Assets/UI/Backgrounds\n" +
                "and auto-assign sprites based on filename matching.", 
                MessageType.Info);

            GUILayout.Space(20);
            GUILayout.Label("Manual Assignment", EditorStyles.boldLabel);

            if (GUILayout.Button("Open Asset in Inspector"))
            {
                Selection.activeObject = targetAsset;
            }
        }

        private void FindOrCreateAsset()
        {
            // Try to find existing
            string[] guids = AssetDatabase.FindAssets("t:UIAssetsData");
            if (guids.Length > 0)
            {
                string path = AssetDatabase.GUIDToAssetPath(guids[0]);
                targetAsset = AssetDatabase.LoadAssetAtPath<UIAssetsData>(path);
                Debug.Log($"Found existing UIAssetsData at: {path}");
                return;
            }

            // Create new
            CreateUIAssetsData();
            guids = AssetDatabase.FindAssets("t:UIAssetsData");
            if (guids.Length > 0)
            {
                string path = AssetDatabase.GUIDToAssetPath(guids[0]);
                targetAsset = AssetDatabase.LoadAssetAtPath<UIAssetsData>(path);
            }
        }

        private void AutoAssignSprites()
        {
            if (targetAsset == null)
            {
                Debug.LogError("No target asset selected!");
                return;
            }

            Undo.RecordObject(targetAsset, "Auto-Assign UI Sprites");

            int assigned = 0;

            // Resource Icons
            assigned += AssignSprite("RiceIcon", ref targetAsset.RiceIcon);
            assigned += AssignSprite("SuppliesIcon", ref targetAsset.SuppliesIcon);
            assigned += AssignSprite("FuelIcon", ref targetAsset.FuelIcon);
            assigned += AssignSprite("GoldIcon", ref targetAsset.GoldIcon);

            // Emblems
            assigned += AssignSprite("VictoryEmblem", ref targetAsset.VictoryEmblem);
            assigned += AssignSprite("DefeatEmblem", ref targetAsset.DefeatEmblem);

            // Unit Icons
            assigned += AssignSprite("InfantryIcon", ref targetAsset.InfantryIcon);
            assigned += AssignSprite("CavalryIcon", ref targetAsset.CavalryIcon);
            assigned += AssignSprite("ElephantIcon", ref targetAsset.ElephantIcon);
            assigned += AssignSprite("ArcherIcon", ref targetAsset.ArcherIcon);
            assigned += AssignSprite("SiegeIcon", ref targetAsset.SiegeIcon);

            // Building Icons
            assigned += AssignSprite("BarracksIcon", ref targetAsset.BarracksIcon);
            assigned += AssignSprite("TempleIcon", ref targetAsset.TempleIcon);
            assigned += AssignSprite("WorkshopIcon", ref targetAsset.WorkshopIcon);

            // Tech Icons
            assigned += AssignSprite("TechArmorIcon", ref targetAsset.TechArmorIcon);
            assigned += AssignSprite("TechWeaponIcon", ref targetAsset.TechWeaponIcon);

            EditorUtility.SetDirty(targetAsset);
            AssetDatabase.SaveAssets();

            Debug.Log($"Auto-assigned {assigned} sprites to UIAssetsData");
            EditorUtility.DisplayDialog("Complete!", 
                $"Assigned {assigned} sprites\n\nCheck Inspector for results.", "OK");
        }

        private int AssignSprite(string searchName, ref Sprite targetField)
        {
            // Search in Icons folder
            string[] guids = AssetDatabase.FindAssets($"t:Sprite {searchName}");
            
            foreach (string guid in guids)
            {
                string path = AssetDatabase.GUIDToAssetPath(guid);
                if (path.Contains("Icons") || path.Contains("Backgrounds"))
                {
                    Sprite sprite = AssetDatabase.LoadAssetAtPath<Sprite>(path);
                    if (sprite != null)
                    {
                        targetField = sprite;
                        Debug.Log($"  Assigned: {searchName} <- {path}");
                        return 1;
                    }
                }
            }

            // Alt search without "Icon" suffix
            string altName = searchName.Replace("Icon", "").Replace("Emblem", "");
            guids = AssetDatabase.FindAssets($"t:Sprite {altName}");
            
            foreach (string guid in guids)
            {
                string path = AssetDatabase.GUIDToAssetPath(guid);
                if (path.Contains("Icons") || path.Contains("Backgrounds"))
                {
                    Sprite sprite = AssetDatabase.LoadAssetAtPath<Sprite>(path);
                    if (sprite != null)
                    {
                        targetField = sprite;
                        Debug.Log($"  Assigned (alt): {searchName} <- {path}");
                        return 1;
                    }
                }
            }

            Debug.LogWarning($"  Not found: {searchName}");
            return 0;
        }
    }
}
#endif
