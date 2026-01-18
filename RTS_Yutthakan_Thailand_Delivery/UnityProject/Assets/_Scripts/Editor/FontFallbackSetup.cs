using UnityEngine;
using UnityEditor;
using TMPro;
using System.Collections.Generic;

/// <summary>
/// Editor script to setup fallback fonts for Thai font assets
/// This ensures numbers and Latin characters display correctly when using Thai fonts
/// </summary>
public class FontFallbackSetup : EditorWindow
{
    [MenuItem("RTS/Setup Font Fallback")]
    public static void SetupFallbackFont()
    {
        // Find Sarabun SDF font asset
        string[] sarabunGuids = AssetDatabase.FindAssets("Sarabun SDF t:TMP_FontAsset");
        
        if (sarabunGuids.Length == 0)
        {
            EditorUtility.DisplayDialog("Error", 
                "Sarabun SDF font asset not found!\n\nPlease generate the Thai font first using:\nTools > Thai Font > Setup Thai Font", 
                "OK");
            return;
        }
        
        // Find LiberationSans SDF font asset (comes with TextMeshPro)
        string[] liberationGuids = AssetDatabase.FindAssets("LiberationSans SDF t:TMP_FontAsset");
        
        if (liberationGuids.Length == 0)
        {
            EditorUtility.DisplayDialog("Error", 
                "LiberationSans SDF font asset not found!\n\nThis font should come with TextMeshPro package.", 
                "OK");
            return;
        }
        
        // Load both font assets
        string sarabunPath = AssetDatabase.GUIDToAssetPath(sarabunGuids[0]);
        TMP_FontAsset sarabunFont = AssetDatabase.LoadAssetAtPath<TMP_FontAsset>(sarabunPath);
        
        string liberationPath = AssetDatabase.GUIDToAssetPath(liberationGuids[0]);
        TMP_FontAsset liberationFont = AssetDatabase.LoadAssetAtPath<TMP_FontAsset>(liberationPath);
        
        if (sarabunFont == null || liberationFont == null)
        {
            EditorUtility.DisplayDialog("Error", "Failed to load font assets!", "OK");
            return;
        }
        
        // Check if fallback is already set
        if (sarabunFont.fallbackFontAssetTable != null && 
            sarabunFont.fallbackFontAssetTable.Contains(liberationFont))
        {
            EditorUtility.DisplayDialog("Info", 
                "LiberationSans SDF is already set as a fallback font for Sarabun SDF.", 
                "OK");
            return;
        }
        
        // Initialize fallback table if null
        if (sarabunFont.fallbackFontAssetTable == null)
        {
            sarabunFont.fallbackFontAssetTable = new List<TMP_FontAsset>();
        }
        
        // Add LiberationSans as fallback
        sarabunFont.fallbackFontAssetTable.Insert(0, liberationFont);
        
        // Mark asset as dirty and save
        EditorUtility.SetDirty(sarabunFont);
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        
        Debug.Log($"[FontFallbackSetup] Successfully added LiberationSans SDF as fallback font for Sarabun SDF");
        Debug.Log($"[FontFallbackSetup] Sarabun SDF path: {sarabunPath}");
        Debug.Log($"[FontFallbackSetup] LiberationSans SDF path: {liberationPath}");
        
        EditorUtility.DisplayDialog("Success", 
            "Successfully added LiberationSans SDF as fallback font!\n\n" +
            "Now numbers (0-9) and Latin characters will display correctly.\n\n" +
            "Please restart Play mode to see the changes.", 
            "OK");
    }
    
    [MenuItem("RTS/Check Font Status")]
    public static void CheckFontStatus()
    {
        // Find Sarabun SDF font asset
        string[] sarabunGuids = AssetDatabase.FindAssets("Sarabun SDF t:TMP_FontAsset");
        
        if (sarabunGuids.Length == 0)
        {
            Debug.LogWarning("[FontFallbackSetup] Sarabun SDF font asset not found!");
            EditorUtility.DisplayDialog("Font Status", "Sarabun SDF font asset not found!", "OK");
            return;
        }
        
        string sarabunPath = AssetDatabase.GUIDToAssetPath(sarabunGuids[0]);
        TMP_FontAsset sarabunFont = AssetDatabase.LoadAssetAtPath<TMP_FontAsset>(sarabunPath);
        
        if (sarabunFont == null)
        {
            Debug.LogError("[FontFallbackSetup] Failed to load Sarabun SDF font!");
            return;
        }
        
        string status = $"=== Sarabun SDF Font Status ===\n";
        status += $"Path: {sarabunPath}\n";
        status += $"Character Count: {sarabunFont.characterTable?.Count ?? 0}\n";
        status += $"Glyph Count: {sarabunFont.glyphTable?.Count ?? 0}\n";
        
        // Check for numbers
        bool hasNumbers = true;
        string missingNumbers = "";
        for (int i = 0x30; i <= 0x39; i++) // 0-9
        {
            if (!sarabunFont.HasCharacter((char)i))
            {
                hasNumbers = false;
                missingNumbers += (char)i + " ";
            }
        }
        
        status += $"Has Numbers (0-9): {(hasNumbers ? "Yes" : "No")}\n";
        if (!hasNumbers)
        {
            status += $"Missing Numbers: {missingNumbers}\n";
        }
        
        // Check fallback fonts
        status += $"\n=== Fallback Fonts ===\n";
        if (sarabunFont.fallbackFontAssetTable != null && sarabunFont.fallbackFontAssetTable.Count > 0)
        {
            foreach (var fallback in sarabunFont.fallbackFontAssetTable)
            {
                if (fallback != null)
                {
                    status += $"- {fallback.name}\n";
                }
            }
        }
        else
        {
            status += "No fallback fonts configured.\n";
        }
        
        Debug.Log(status);
        EditorUtility.DisplayDialog("Font Status", status, "OK");
    }
    
    [MenuItem("RTS/Remove Font Fallbacks")]
    public static void RemoveFallbackFonts()
    {
        string[] sarabunGuids = AssetDatabase.FindAssets("Sarabun SDF t:TMP_FontAsset");
        
        if (sarabunGuids.Length == 0)
        {
            EditorUtility.DisplayDialog("Error", "Sarabun SDF font asset not found!", "OK");
            return;
        }
        
        string sarabunPath = AssetDatabase.GUIDToAssetPath(sarabunGuids[0]);
        TMP_FontAsset sarabunFont = AssetDatabase.LoadAssetAtPath<TMP_FontAsset>(sarabunPath);
        
        if (sarabunFont == null)
        {
            EditorUtility.DisplayDialog("Error", "Failed to load Sarabun SDF font!", "OK");
            return;
        }
        
        if (sarabunFont.fallbackFontAssetTable != null)
        {
            sarabunFont.fallbackFontAssetTable.Clear();
            EditorUtility.SetDirty(sarabunFont);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            
            Debug.Log("[FontFallbackSetup] Removed all fallback fonts from Sarabun SDF");
            EditorUtility.DisplayDialog("Success", "Removed all fallback fonts from Sarabun SDF.", "OK");
        }
        else
        {
            EditorUtility.DisplayDialog("Info", "No fallback fonts to remove.", "OK");
        }
    }
}
