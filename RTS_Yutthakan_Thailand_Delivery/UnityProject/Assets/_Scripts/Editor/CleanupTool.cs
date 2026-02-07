#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using System.Collections.Generic;

/// <summary>
/// Cleanup Tool - ลบ Missing Scripts และแก้ไขปัญหา
/// </summary>
public class CleanupTool : EditorWindow
{
    [MenuItem("Tools/RTS Thai/Cleanup Missing Scripts")]
    public static void CleanupMissingScripts()
    {
        int removedCount = 0;
        
        // Find all GameObjects in scene
        var allObjects = Resources.FindObjectsOfTypeAll<GameObject>();
        
        foreach (var go in allObjects)
        {
            // Skip prefabs
            if (PrefabUtility.IsPartOfPrefabAsset(go)) continue;
            
            // Get component count including missing
            var components = go.GetComponents<Component>();
            
            for (int i = components.Length - 1; i >= 0; i--)
            {
                if (components[i] == null)
                {
                    // Found missing script, remove it
                    GameObjectUtility.RemoveMonoBehavioursWithMissingScript(go);
                    removedCount++;
                    Debug.Log($"[Cleanup] Removed missing script from: {go.name}");
                    break;
                }
            }
        }
        
        // Also cleanup ambient effects that use particle system
        var ambientEffects = GameObject.Find("AmbientEffects");
        if (ambientEffects != null)
        {
            Object.DestroyImmediate(ambientEffects);
            Debug.Log("[Cleanup] Removed AmbientEffects (uses disabled ParticleSystem)");
        }
        
        // Remove DustParticles
        var dust = GameObject.Find("DustParticles");
        if (dust != null)
        {
            Object.DestroyImmediate(dust);
            Debug.Log("[Cleanup] Removed DustParticles");
        }
        
        // Mark scene dirty
        UnityEditor.SceneManagement.EditorSceneManager.MarkSceneDirty(
            UnityEditor.SceneManagement.EditorSceneManager.GetActiveScene());
        
        Debug.Log($"✅ Cleanup complete! Removed {removedCount} missing scripts.");
        EditorUtility.DisplayDialog("Cleanup Complete", 
            $"ลบ Missing Scripts เสร็จแล้ว!\n\n" +
            $"ลบ missing scripts: {removedCount} รายการ\n" +
            "ลบ particle effects ที่ disabled\n\n" +
            "กด Ctrl+S เพื่อ Save", "OK");
    }
    
    [MenuItem("Tools/RTS Thai/Fix All Issues")]
    public static void FixAllIssues()
    {
        CleanupMissingScripts();
        FixUIText();
        
        Debug.Log("✅ All issues fixed!");
    }
    
    static void FixUIText()
    {
        // Find UI texts with emoji and replace
        var allTexts = Resources.FindObjectsOfTypeAll<TMPro.TextMeshProUGUI>();
        int fixedCount = 0;
        
        foreach (var text in allTexts)
        {
            if (text == null) continue;
            
            string original = text.text;
            
            // Replace emojis with text
            string modified = original
                .Replace("🌾", "[R]")
                .Replace("📦", "[S]")
                .Replace("⚔️", "[U]")
                .Replace("🎯", "")
                .Replace("⚔", "[X]");
            
            if (modified != original)
            {
                text.text = modified;
                EditorUtility.SetDirty(text);
                fixedCount++;
            }
        }
        
        if (fixedCount > 0)
        {
            Debug.Log($"[Cleanup] Fixed {fixedCount} text objects with unsupported characters");
        }
    }
    
    [MenuItem("Tools/RTS Thai/Regenerate Scene (Clean Start)")]
    public static void RegenerateScene()
    {
        if (!EditorUtility.DisplayDialog("Confirm", 
            "จะลบ Scene ปัจจุบันแล้วสร้างใหม่\nต้องการดำเนินการต่อหรือไม่?", "ใช่ สร้างใหม่", "ยกเลิก"))
        {
            return;
        }
        
        // Call beautiful mission generator
        var genType = System.Type.GetType("BeautifulMissionGenerator");
        if (genType != null)
        {
            var method = genType.GetMethod("GenerateBeautifulScene", 
                System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static);
            if (method != null)
            {
                method.Invoke(null, null);
            }
        }
    }
}
#endif
