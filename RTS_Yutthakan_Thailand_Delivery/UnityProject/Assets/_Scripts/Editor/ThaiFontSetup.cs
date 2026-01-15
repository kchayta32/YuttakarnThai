#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using System.IO;
using System.Net;

namespace RTS.Editor
{
    /// <summary>
    /// ช่วยดาวน์โหลดและตั้งค่า Font ภาษาไทยสำหรับ TextMeshPro
    /// </summary>
    public class ThaiFontSetup : EditorWindow
    {
        private string fontName = "Sarabun";
        private bool downloadComplete = false;
        private string statusMessage = "";

        [MenuItem("RTS/Setup Thai Font")]
        public static void ShowWindow()
        {
            GetWindow<ThaiFontSetup>("Thai Font Setup");
        }

        private void OnGUI()
        {
            GUILayout.Label("🔤 ตั้งค่า Font ภาษาไทย", EditorStyles.boldLabel);
            GUILayout.Space(10);

            EditorGUILayout.HelpBox(
                "TextMeshPro ต้องใช้ Font ที่รองรับภาษาไทย\n" +
                "เราแนะนำ Sarabun หรือ Kanit จาก Google Fonts", 
                MessageType.Info);

            GUILayout.Space(10);

            // Font folder path
            string fontsPath = "Assets/Fonts";
            EditorGUILayout.LabelField("Fonts Folder:", fontsPath);

            if (!Directory.Exists(fontsPath))
            {
                if (GUILayout.Button("📁 สร้างโฟลเดอร์ Fonts"))
                {
                    AssetDatabase.CreateFolder("Assets", "Fonts");
                    statusMessage = "สร้างโฟลเดอร์ Assets/Fonts แล้ว";
                }
            }

            GUILayout.Space(10);
            GUILayout.Label("📥 ขั้นตอนที่ 1: ดาวน์โหลด Font", EditorStyles.boldLabel);

            if (GUILayout.Button("🌐 เปิด Google Fonts (Sarabun)", GUILayout.Height(30)))
            {
                Application.OpenURL("https://fonts.google.com/specimen/Sarabun");
            }

            if (GUILayout.Button("🌐 เปิด Google Fonts (Kanit)", GUILayout.Height(30)))
            {
                Application.OpenURL("https://fonts.google.com/specimen/Kanit");
            }

            EditorGUILayout.HelpBox(
                "1. คลิกปุ่มด้านบนเพื่อเปิด Google Fonts\n" +
                "2. กด 'Download family'\n" +
                "3. Extract แล้วลากไฟล์ .ttf มาใส่ Assets/Fonts/", 
                MessageType.None);

            GUILayout.Space(20);
            GUILayout.Label("📝 ขั้นตอนที่ 2: สร้าง TMP Font Asset", EditorStyles.boldLabel);

            if (GUILayout.Button("📖 เปิด TMP Font Asset Creator", GUILayout.Height(30)))
            {
                EditorApplication.ExecuteMenuItem("Window/TextMeshPro/Font Asset Creator");
            }

            EditorGUILayout.HelpBox(
                "1. Source Font File: ลาก Sarabun-Regular.ttf มาใส่\n" +
                "2. Atlas Population Mode: Dynamic\n" +
                "3. Character Set: Custom Characters\n" +
                "4. Custom Character List: (วางอักขระไทยด้านล่าง)\n" +
                "5. กด 'Generate Font Atlas'\n" +
                "6. กด 'Save' ตั้งชื่อ 'Sarabun SDF'", 
                MessageType.None);

            GUILayout.Space(10);
            if (GUILayout.Button("📋 Copy Thai Characters", GUILayout.Height(25)))
            {
                string thaiChars = GetThaiCharacterSet();
                EditorGUIUtility.systemCopyBuffer = thaiChars;
                statusMessage = "Copied Thai characters to clipboard!";
            }

            GUILayout.Space(20);
            GUILayout.Label("⚡ ขั้นตอนที่ 3: ใช้งาน Font", EditorStyles.boldLabel);

            if (GUILayout.Button("🔄 สร้าง TMP Settings ใหม่ (Optional)", GUILayout.Height(25)))
            {
                EditorApplication.ExecuteMenuItem("Edit/Project Settings...");
                statusMessage = "เปิด Project Settings แล้ว ไปที่ TextMesh Pro > Default Font Asset";
            }

            GUILayout.Space(10);
            if (!string.IsNullOrEmpty(statusMessage))
            {
                EditorGUILayout.HelpBox(statusMessage, MessageType.Info);
            }

            GUILayout.Space(20);
            GUILayout.Label("📌 Quick Reference", EditorStyles.miniBoldLabel);
            EditorGUILayout.TextArea(
                "Thai Unicode Range: 0E00-0E7F\n\n" +
                "Character Set ที่แนะนำ:\n" +
                "- Extended ASCII (32-126)\n" +
                "- Thai (0E00-0E7F)\n" +
                "- Thai Digits (0E50-0E59)",
                GUILayout.Height(80));
        }

        private string GetThaiCharacterSet()
        {
            // Basic ASCII + Thai characters
            string chars = "";
            
            // Basic ASCII (32-126)
            for (int i = 32; i <= 126; i++)
                chars += (char)i;
            
            // Thai characters (0x0E00 - 0x0E7F)
            for (int i = 0x0E00; i <= 0x0E7F; i++)
                chars += (char)i;
            
            // Common symbols
            chars += "+-<>=!?%";
            
            return chars;
        }

        [MenuItem("RTS/Apply Thai Font to All TMP")]
        public static void ApplyFontToAllTMP()
        {
            // Find Thai font asset
            string[] guids = AssetDatabase.FindAssets("t:TMP_FontAsset Sarabun");
            if (guids.Length == 0)
            {
                guids = AssetDatabase.FindAssets("t:TMP_FontAsset Kanit");
            }

            if (guids.Length == 0)
            {
                EditorUtility.DisplayDialog("Font Not Found", 
                    "ไม่พบ Thai Font Asset\nกรุณาสร้าง Font Asset ก่อน", "OK");
                return;
            }

            string fontPath = AssetDatabase.GUIDToAssetPath(guids[0]);
            var fontAsset = AssetDatabase.LoadAssetAtPath<TMPro.TMP_FontAsset>(fontPath);

            if (fontAsset == null)
            {
                Debug.LogError("Cannot load font asset");
                return;
            }

            // Find all TMP components in scene
            var tmpTexts = Object.FindObjectsOfType<TMPro.TextMeshProUGUI>(true);
            int count = 0;

            foreach (var tmp in tmpTexts)
            {
                Undo.RecordObject(tmp, "Apply Thai Font");
                tmp.font = fontAsset;
                EditorUtility.SetDirty(tmp);
                count++;
            }

            EditorUtility.DisplayDialog("Font Applied", 
                $"ใช้ Font กับ {count} TextMeshPro components แล้ว", "OK");
        }
    }
}
#endif
