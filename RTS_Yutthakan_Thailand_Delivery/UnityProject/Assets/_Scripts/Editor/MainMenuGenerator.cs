#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Main Menu Scene Generator - สร้าง Main Menu สวยงาม
/// พร้อม Campaign Selection
/// </summary>
public class MainMenuGenerator : EditorWindow
{
    static Material bgMat;
    static Color goldColor = new Color(0.85f, 0.7f, 0.3f);
    static Color darkBrown = new Color(0.15f, 0.1f, 0.05f);
    static Color lightBrown = new Color(0.4f, 0.25f, 0.15f);
    
    [MenuItem("Tools/RTS Thai/Generate Main Menu Scene")]
    public static void GenerateMainMenu()
    {
        // Create new scene
        var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
        
        // Setup camera for menu
        SetupMenuCamera();
        
        // Create background
        CreateBackground();
        
        // Create main menu UI
        CreateMainMenuUI();
        
        // Create campaign selection (hidden by default)
        CreateCampaignSelectionUI();
        
        // Create settings panel (hidden by default)
        CreateSettingsUI();
        
        // Add menu controller
        AddMenuController();
        
        // Setup lighting
        SetupMenuLighting();
        
        // Ensure folder
        if (!AssetDatabase.IsValidFolder("Assets/_Scenes"))
            AssetDatabase.CreateFolder("Assets", "_Scenes");
        
        // Save
        EditorSceneManager.SaveScene(scene, "Assets/_Scenes/MainMenu.unity");
        
        Debug.Log("✅ Main Menu Scene created!");
        EditorUtility.DisplayDialog("Main Menu Created!", 
            "สร้าง Main Menu เสร็จแล้ว!\n\n" +
            "Scene: Assets/_Scenes/MainMenu.unity\n\n" +
            "Features:\n" +
            "- หน้า Main Menu สวยงาม\n" +
            "- ปุ่ม New Game -> Campaign Selection\n" +
            "- 4 แคมเปญให้เลือก\n" +
            "- หน้า Settings\n" +
            "- ปุ่ม Exit Game", "OK");
    }
    
    static void SetupMenuCamera()
    {
        Camera cam = Camera.main;
        if (cam != null)
        {
            cam.transform.position = new Vector3(0, 0, -10);
            cam.transform.rotation = Quaternion.identity;
            cam.orthographic = true;
            cam.orthographicSize = 5;
            cam.backgroundColor = darkBrown;
            cam.clearFlags = CameraClearFlags.SolidColor;
        }
    }
    
    static void CreateBackground()
    {
        // Background gradient using UI
        // This will be handled by UI canvas
    }
    
    static void SetupMenuLighting()
    {
        var lights = Object.FindObjectsOfType<Light>();
        foreach (var light in lights)
        {
            if (light.type == LightType.Directional)
            {
                light.intensity = 0.8f;
                light.color = new Color(1f, 0.95f, 0.9f);
            }
        }
        
        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
        RenderSettings.ambientLight = new Color(0.3f, 0.25f, 0.2f);
    }
    
    static void CreateMainMenuUI()
    {
        // Create main canvas
        GameObject canvasObj = new GameObject("MainMenuCanvas");
        var canvas = canvasObj.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        var scaler = canvasObj.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1920, 1080);
        canvasObj.AddComponent<GraphicRaycaster>();
        
        // Background panel
        CreateBackgroundPanel(canvasObj.transform);
        
        // Main Menu Panel
        GameObject mainPanel = CreatePanel(canvasObj.transform, "MainMenuPanel", 
            Vector2.zero, new Vector2(500, 700), new Color(0, 0, 0, 0.6f));
        
        // Title
        CreateTitle(mainPanel.transform);
        
        // Menu buttons
        CreateMenuButtons(mainPanel.transform);
        
        // Version text
        CreateVersionText(canvasObj.transform);
    }
    
    static void CreateBackgroundPanel(Transform parent)
    {
        // Full screen background
        GameObject bg = new GameObject("Background");
        bg.transform.SetParent(parent);
        var rect = bg.AddComponent<RectTransform>();
        rect.anchorMin = Vector2.zero;
        rect.anchorMax = Vector2.one;
        rect.offsetMin = Vector2.zero;
        rect.offsetMax = Vector2.zero;
        
        var img = bg.AddComponent<Image>();
        img.color = new Color(0.12f, 0.08f, 0.05f);
        
        // Decorative border
        CreateDecorativeBorder(parent);
    }
    
    static void CreateDecorativeBorder(Transform parent)
    {
        float borderWidth = 8f;
        Color borderColor = goldColor;
        
        // Top border
        CreateBorderLine(parent, "TopBorder", new Vector2(0.5f, 1), new Vector2(0, -20), 
            new Vector2(-40, borderWidth), borderColor);
        
        // Bottom border
        CreateBorderLine(parent, "BottomBorder", new Vector2(0.5f, 0), new Vector2(0, 20), 
            new Vector2(-40, borderWidth), borderColor);
        
        // Left border
        CreateBorderLineVertical(parent, "LeftBorder", new Vector2(0, 0.5f), new Vector2(20, 0), 
            new Vector2(borderWidth, -40), borderColor);
        
        // Right border
        CreateBorderLineVertical(parent, "RightBorder", new Vector2(1, 0.5f), new Vector2(-20, 0), 
            new Vector2(borderWidth, -40), borderColor);
    }
    
    static void CreateBorderLine(Transform parent, string name, Vector2 anchor, Vector2 pos, Vector2 sizeDelta, Color color)
    {
        GameObject line = new GameObject(name);
        line.transform.SetParent(parent);
        var rect = line.AddComponent<RectTransform>();
        rect.anchorMin = new Vector2(0, anchor.y);
        rect.anchorMax = new Vector2(1, anchor.y);
        rect.pivot = anchor;
        rect.anchoredPosition = pos;
        rect.sizeDelta = sizeDelta;
        
        var img = line.AddComponent<Image>();
        img.color = color;
    }
    
    static void CreateBorderLineVertical(Transform parent, string name, Vector2 anchor, Vector2 pos, Vector2 sizeDelta, Color color)
    {
        GameObject line = new GameObject(name);
        line.transform.SetParent(parent);
        var rect = line.AddComponent<RectTransform>();
        rect.anchorMin = new Vector2(anchor.x, 0);
        rect.anchorMax = new Vector2(anchor.x, 1);
        rect.pivot = anchor;
        rect.anchoredPosition = pos;
        rect.sizeDelta = sizeDelta;
        
        var img = line.AddComponent<Image>();
        img.color = color;
    }
    
    static void CreateTitle(Transform parent)
    {
        // Main title
        GameObject titleObj = new GameObject("Title");
        titleObj.transform.SetParent(parent);
        var rect = titleObj.AddComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = new Vector2(0.5f, 1);
        rect.pivot = new Vector2(0.5f, 1);
        rect.anchoredPosition = new Vector2(0, -30);
        rect.sizeDelta = new Vector2(450, 80);
        
        var title = titleObj.AddComponent<TextMeshProUGUI>();
        title.text = "ยุทธการไทย";
        title.fontSize = 56;
        title.fontStyle = FontStyles.Bold;
        title.color = goldColor;
        title.alignment = TextAlignmentOptions.Center;
        
        // Subtitle
        GameObject subObj = new GameObject("Subtitle");
        subObj.transform.SetParent(parent);
        var subRect = subObj.AddComponent<RectTransform>();
        subRect.anchorMin = subRect.anchorMax = new Vector2(0.5f, 1);
        subRect.pivot = new Vector2(0.5f, 1);
        subRect.anchoredPosition = new Vector2(0, -110);
        subRect.sizeDelta = new Vector2(450, 40);
        
        var subtitle = subObj.AddComponent<TextMeshProUGUI>();
        subtitle.text = "RTS: Thai History Wars";
        subtitle.fontSize = 22;
        subtitle.color = new Color(0.9f, 0.85f, 0.7f);
        subtitle.alignment = TextAlignmentOptions.Center;
        
        // Decorative line under title
        GameObject line = new GameObject("TitleLine");
        line.transform.SetParent(parent);
        var lineRect = line.AddComponent<RectTransform>();
        lineRect.anchorMin = lineRect.anchorMax = new Vector2(0.5f, 1);
        lineRect.pivot = new Vector2(0.5f, 0.5f);
        lineRect.anchoredPosition = new Vector2(0, -150);
        lineRect.sizeDelta = new Vector2(300, 3);
        
        var lineImg = line.AddComponent<Image>();
        lineImg.color = goldColor;
    }
    
    static void CreateMenuButtons(Transform parent)
    {
        float startY = -200;
        float spacing = 70;
        
        string[] buttonTexts = { "เริ่มเกมใหม่", "ดำเนินเกมต่อ", "ตั้งค่า", "เครดิต", "ออกจากเกม" };
        string[] buttonNames = { "NewGameBtn", "ContinueBtn", "SettingsBtn", "CreditsBtn", "ExitBtn" };
        
        for (int i = 0; i < buttonTexts.Length; i++)
        {
            CreateMenuButton(parent, buttonNames[i], buttonTexts[i], 
                new Vector2(0, startY - i * spacing));
        }
    }
    
    static void CreateMenuButton(Transform parent, string name, string text, Vector2 pos)
    {
        GameObject btnObj = new GameObject(name);
        btnObj.transform.SetParent(parent);
        
        var rect = btnObj.AddComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = new Vector2(0.5f, 1);
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = pos;
        rect.sizeDelta = new Vector2(350, 55);
        
        // Button background
        var bg = btnObj.AddComponent<Image>();
        bg.color = new Color(0.2f, 0.15f, 0.1f, 0.9f);
        
        var btn = btnObj.AddComponent<Button>();
        var colors = btn.colors;
        colors.normalColor = new Color(0.2f, 0.15f, 0.1f);
        colors.highlightedColor = new Color(0.35f, 0.25f, 0.15f);
        colors.pressedColor = new Color(0.15f, 0.1f, 0.05f);
        btn.colors = colors;
        
        // Border
        GameObject border = new GameObject("Border");
        border.transform.SetParent(btnObj.transform);
        var borderRect = border.AddComponent<RectTransform>();
        borderRect.anchorMin = Vector2.zero;
        borderRect.anchorMax = Vector2.one;
        borderRect.offsetMin = Vector2.zero;
        borderRect.offsetMax = Vector2.zero;
        
        var outline = border.AddComponent<Outline>();
        outline.effectColor = goldColor;
        outline.effectDistance = new Vector2(2, 2);
        
        // Text
        GameObject textObj = new GameObject("Text");
        textObj.transform.SetParent(btnObj.transform);
        var textRect = textObj.AddComponent<RectTransform>();
        textRect.anchorMin = Vector2.zero;
        textRect.anchorMax = Vector2.one;
        textRect.offsetMin = new Vector2(10, 5);
        textRect.offsetMax = new Vector2(-10, -5);
        
        var tmp = textObj.AddComponent<TextMeshProUGUI>();
        tmp.text = text;
        tmp.fontSize = 24;
        tmp.color = new Color(0.95f, 0.9f, 0.8f);
        tmp.alignment = TextAlignmentOptions.Center;
    }
    
    static void CreateVersionText(Transform parent)
    {
        GameObject verObj = new GameObject("VersionText");
        verObj.transform.SetParent(parent);
        var rect = verObj.AddComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = new Vector2(1, 0);
        rect.pivot = new Vector2(1, 0);
        rect.anchoredPosition = new Vector2(-20, 10);
        rect.sizeDelta = new Vector2(200, 30);
        
        var tmp = verObj.AddComponent<TextMeshProUGUI>();
        tmp.text = "Version 1.0.0";
        tmp.fontSize = 14;
        tmp.color = new Color(0.6f, 0.55f, 0.5f);
        tmp.alignment = TextAlignmentOptions.Right;
    }
    
    static void CreateCampaignSelectionUI()
    {
        var canvas = Object.FindObjectOfType<Canvas>();
        if (canvas == null) return;
        
        // Campaign Panel (hidden by default)
        GameObject campaignPanel = CreatePanel(canvas.transform, "CampaignPanel", 
            Vector2.zero, new Vector2(900, 650), new Color(0, 0, 0, 0.85f));
        campaignPanel.SetActive(false);
        
        // Title
        GameObject titleObj = new GameObject("CampaignTitle");
        titleObj.transform.SetParent(campaignPanel.transform);
        var titleRect = titleObj.AddComponent<RectTransform>();
        titleRect.anchorMin = titleRect.anchorMax = new Vector2(0.5f, 1);
        titleRect.pivot = new Vector2(0.5f, 1);
        titleRect.anchoredPosition = new Vector2(0, -20);
        titleRect.sizeDelta = new Vector2(800, 60);
        
        var title = titleObj.AddComponent<TextMeshProUGUI>();
        title.text = "เลือกแคมเปญ";
        title.fontSize = 42;
        title.fontStyle = FontStyles.Bold;
        title.color = goldColor;
        title.alignment = TextAlignmentOptions.Center;
        
        // Campaign cards
        CreateCampaignCards(campaignPanel.transform);
        
        // Back button
        CreateBackButton(campaignPanel.transform);
    }
    
    static void CreateCampaignCards(Transform parent)
    {
        string[] campaigns = {
            "สงครามช้างเผือก",
            "ศึกบางระจัน", 
            "กู้แผ่นดิน",
            "พระเจ้าตากสิน"
        };
        
        string[] descriptions = {
            "พ.ศ. 2091 - สมเด็จพระสุริโยทัยสละพระชนม์ชีพ\nปกป้องสมเด็จพระมหาจักรพรรดิ",
            "พ.ศ. 2308 - วีรกรรมของชาวบ้านบางระจัน\nต้านทานกองทัพพม่า",
            "พ.ศ. 2310 - การต่อสู้เพื่อรวมแผ่นดิน\nหลังเสียกรุงศรีอยุธยา",
            "พ.ศ. 2310-2325 - การสถาปนากรุงธนบุรี\nและการรวมชาติ"
        };
        
        string[] years = { "2091", "2308", "2310", "2310-2325" };
        
        float startX = -320;
        float cardWidth = 200;
        float spacing = 20;
        
        for (int i = 0; i < campaigns.Length; i++)
        {
            CreateCampaignCard(parent, campaigns[i], descriptions[i], years[i],
                new Vector2(startX + i * (cardWidth + spacing), -50));
        }
    }
    
    static void CreateCampaignCard(Transform parent, string title, string desc, string year, Vector2 pos)
    {
        string safeName = title.Replace(" ", "_");
        
        GameObject card = new GameObject($"Campaign_{safeName}");
        card.transform.SetParent(parent);
        
        var rect = card.AddComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = new Vector2(0.5f, 0.5f);
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = pos;
        rect.sizeDelta = new Vector2(200, 400);
        
        // Card background
        var bg = card.AddComponent<Image>();
        bg.color = new Color(0.18f, 0.12f, 0.08f);
        
        var btn = card.AddComponent<Button>();
        var colors = btn.colors;
        colors.highlightedColor = new Color(0.3f, 0.2f, 0.12f);
        colors.pressedColor = new Color(0.15f, 0.1f, 0.05f);
        btn.colors = colors;
        
        // Image placeholder
        GameObject imgHolder = new GameObject("ImageHolder");
        imgHolder.transform.SetParent(card.transform);
        var imgRect = imgHolder.AddComponent<RectTransform>();
        imgRect.anchorMin = imgRect.anchorMax = new Vector2(0.5f, 1);
        imgRect.pivot = new Vector2(0.5f, 1);
        imgRect.anchoredPosition = new Vector2(0, -10);
        imgRect.sizeDelta = new Vector2(180, 140);
        
        var imgBg = imgHolder.AddComponent<Image>();
        imgBg.color = new Color(0.3f, 0.25f, 0.2f);
        
        // Year badge
        GameObject yearBadge = new GameObject("Year");
        yearBadge.transform.SetParent(card.transform);
        var yearRect = yearBadge.AddComponent<RectTransform>();
        yearRect.anchorMin = yearRect.anchorMax = new Vector2(0.5f, 1);
        yearRect.pivot = new Vector2(0.5f, 0.5f);
        yearRect.anchoredPosition = new Vector2(0, -160);
        yearRect.sizeDelta = new Vector2(100, 28);
        
        var yearBg = yearBadge.AddComponent<Image>();
        yearBg.color = goldColor;
        
        GameObject yearText = new GameObject("YearText");
        yearText.transform.SetParent(yearBadge.transform);
        var ytRect = yearText.AddComponent<RectTransform>();
        ytRect.anchorMin = Vector2.zero;
        ytRect.anchorMax = Vector2.one;
        ytRect.offsetMin = ytRect.offsetMax = Vector2.zero;
        
        var yt = yearText.AddComponent<TextMeshProUGUI>();
        yt.text = $"พ.ศ. {year}";
        yt.fontSize = 12;
        yt.color = darkBrown;
        yt.alignment = TextAlignmentOptions.Center;
        
        // Campaign title
        GameObject titleObj = new GameObject("Title");
        titleObj.transform.SetParent(card.transform);
        var titleRect = titleObj.AddComponent<RectTransform>();
        titleRect.anchorMin = titleRect.anchorMax = new Vector2(0.5f, 1);
        titleRect.pivot = new Vector2(0.5f, 1);
        titleRect.anchoredPosition = new Vector2(0, -185);
        titleRect.sizeDelta = new Vector2(180, 50);
        
        var titleTmp = titleObj.AddComponent<TextMeshProUGUI>();
        titleTmp.text = title;
        titleTmp.fontSize = 18;
        titleTmp.fontStyle = FontStyles.Bold;
        titleTmp.color = goldColor;
        titleTmp.alignment = TextAlignmentOptions.Center;
        
        // Description
        GameObject descObj = new GameObject("Description");
        descObj.transform.SetParent(card.transform);
        var descRect = descObj.AddComponent<RectTransform>();
        descRect.anchorMin = descRect.anchorMax = new Vector2(0.5f, 1);
        descRect.pivot = new Vector2(0.5f, 1);
        descRect.anchoredPosition = new Vector2(0, -240);
        descRect.sizeDelta = new Vector2(180, 110);
        
        var descTmp = descObj.AddComponent<TextMeshProUGUI>();
        descTmp.text = desc;
        descTmp.fontSize = 12;
        descTmp.color = new Color(0.8f, 0.75f, 0.7f);
        descTmp.alignment = TextAlignmentOptions.Center;
        
        // Play button
        GameObject playBtn = new GameObject("PlayButton");
        playBtn.transform.SetParent(card.transform);
        var playRect = playBtn.AddComponent<RectTransform>();
        playRect.anchorMin = playRect.anchorMax = new Vector2(0.5f, 0);
        playRect.pivot = new Vector2(0.5f, 0);
        playRect.anchoredPosition = new Vector2(0, 15);
        playRect.sizeDelta = new Vector2(120, 35);
        
        var playBg = playBtn.AddComponent<Image>();
        playBg.color = new Color(0.6f, 0.4f, 0.1f);
        
        var playBtnComp = playBtn.AddComponent<Button>();
        
        GameObject playText = new GameObject("Text");
        playText.transform.SetParent(playBtn.transform);
        var ptRect = playText.AddComponent<RectTransform>();
        ptRect.anchorMin = Vector2.zero;
        ptRect.anchorMax = Vector2.one;
        ptRect.offsetMin = ptRect.offsetMax = Vector2.zero;
        
        var pt = playText.AddComponent<TextMeshProUGUI>();
        pt.text = "เล่น";
        pt.fontSize = 16;
        pt.color = Color.white;
        pt.alignment = TextAlignmentOptions.Center;
    }
    
    static void CreateBackButton(Transform parent)
    {
        GameObject backBtn = new GameObject("BackButton");
        backBtn.transform.SetParent(parent);
        
        var rect = backBtn.AddComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = new Vector2(0, 0);
        rect.pivot = new Vector2(0, 0);
        rect.anchoredPosition = new Vector2(20, 20);
        rect.sizeDelta = new Vector2(120, 45);
        
        var bg = backBtn.AddComponent<Image>();
        bg.color = new Color(0.3f, 0.2f, 0.15f);
        
        backBtn.AddComponent<Button>();
        
        GameObject textObj = new GameObject("Text");
        textObj.transform.SetParent(backBtn.transform);
        var textRect = textObj.AddComponent<RectTransform>();
        textRect.anchorMin = Vector2.zero;
        textRect.anchorMax = Vector2.one;
        textRect.offsetMin = textRect.offsetMax = Vector2.zero;
        
        var tmp = textObj.AddComponent<TextMeshProUGUI>();
        tmp.text = "< กลับ";
        tmp.fontSize = 18;
        tmp.color = new Color(0.9f, 0.85f, 0.8f);
        tmp.alignment = TextAlignmentOptions.Center;
    }
    
    static void CreateSettingsUI()
    {
        var canvas = Object.FindObjectOfType<Canvas>();
        if (canvas == null) return;
        
        // Settings Panel (hidden by default)
        GameObject settingsPanel = CreatePanel(canvas.transform, "SettingsPanel", 
            Vector2.zero, new Vector2(600, 500), new Color(0, 0, 0, 0.9f));
        settingsPanel.SetActive(false);
        
        // Title
        CreateSettingsTitle(settingsPanel.transform);
        
        // Settings options
        CreateSettingsOptions(settingsPanel.transform);
        
        // Back button
        CreateBackButton(settingsPanel.transform);
    }
    
    static void CreateSettingsTitle(Transform parent)
    {
        GameObject titleObj = new GameObject("SettingsTitle");
        titleObj.transform.SetParent(parent);
        var titleRect = titleObj.AddComponent<RectTransform>();
        titleRect.anchorMin = titleRect.anchorMax = new Vector2(0.5f, 1);
        titleRect.pivot = new Vector2(0.5f, 1);
        titleRect.anchoredPosition = new Vector2(0, -20);
        titleRect.sizeDelta = new Vector2(500, 50);
        
        var title = titleObj.AddComponent<TextMeshProUGUI>();
        title.text = "ตั้งค่า";
        title.fontSize = 36;
        title.fontStyle = FontStyles.Bold;
        title.color = goldColor;
        title.alignment = TextAlignmentOptions.Center;
    }
    
    static void CreateSettingsOptions(Transform parent)
    {
        string[] settings = { "เสียงเพลง", "เสียงเอฟเฟกต์", "ความยาก", "ภาษา" };
        float startY = -100;
        float spacing = 80;
        
        for (int i = 0; i < settings.Length; i++)
        {
            CreateSettingRow(parent, settings[i], new Vector2(0, startY - i * spacing));
        }
    }
    
    static void CreateSettingRow(Transform parent, string label, Vector2 pos)
    {
        GameObject row = new GameObject($"Setting_{label}");
        row.transform.SetParent(parent);
        var rect = row.AddComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = new Vector2(0.5f, 1);
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = pos;
        rect.sizeDelta = new Vector2(500, 50);
        
        // Label
        GameObject labelObj = new GameObject("Label");
        labelObj.transform.SetParent(row.transform);
        var labelRect = labelObj.AddComponent<RectTransform>();
        labelRect.anchorMin = new Vector2(0, 0.5f);
        labelRect.anchorMax = new Vector2(0.4f, 0.5f);
        labelRect.pivot = new Vector2(0, 0.5f);
        labelRect.anchoredPosition = Vector2.zero;
        labelRect.sizeDelta = new Vector2(0, 40);
        
        var labelTmp = labelObj.AddComponent<TextMeshProUGUI>();
        labelTmp.text = label;
        labelTmp.fontSize = 20;
        labelTmp.color = new Color(0.9f, 0.85f, 0.8f);
        
        // Slider background
        GameObject sliderBg = new GameObject("SliderBG");
        sliderBg.transform.SetParent(row.transform);
        var sliderRect = sliderBg.AddComponent<RectTransform>();
        sliderRect.anchorMin = new Vector2(0.45f, 0.5f);
        sliderRect.anchorMax = new Vector2(1f, 0.5f);
        sliderRect.pivot = new Vector2(0, 0.5f);
        sliderRect.anchoredPosition = Vector2.zero;
        sliderRect.sizeDelta = new Vector2(0, 20);
        
        var bgImg = sliderBg.AddComponent<Image>();
        bgImg.color = new Color(0.3f, 0.25f, 0.2f);
    }
    
    static GameObject CreatePanel(Transform parent, string name, Vector2 pos, Vector2 size, Color color)
    {
        GameObject panel = new GameObject(name);
        panel.transform.SetParent(parent);
        
        var rect = panel.AddComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = new Vector2(0.5f, 0.5f);
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = pos;
        rect.sizeDelta = size;
        
        var img = panel.AddComponent<Image>();
        img.color = color;
        
        return panel;
    }
    
    static void AddMenuController()
    {
        GameObject controller = new GameObject("MenuController");
        controller.AddComponent<MainMenuController>();
    }
}
#endif
