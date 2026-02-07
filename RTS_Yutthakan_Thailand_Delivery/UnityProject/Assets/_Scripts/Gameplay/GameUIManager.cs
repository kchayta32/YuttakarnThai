using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Game UI Manager - Resource Display, Minimap, Unit Info
/// แสดง UI สำหรับเกม RTS
/// </summary>
public class GameUIManager : MonoBehaviour
{
    [Header("Resource Panel")]
    public TextMeshProUGUI riceText;
    public TextMeshProUGUI suppliesText;
    public TextMeshProUGUI populationText;
    
    [Header("Unit Info Panel")]
    public GameObject unitInfoPanel;
    public TextMeshProUGUI unitNameText;
    public Image unitHealthBar;
    public TextMeshProUGUI unitStatsText;
    
    [Header("Objective Panel")]
    public GameObject objectivePanel;
    public TextMeshProUGUI objectiveText;
    
    [Header("Minimap")]
    public RawImage minimapImage;
    public Camera minimapCamera;
    
    // Resources
    private int rice = 500;
    private int supplies = 300;
    private int population = 0;
    private int maxPopulation = 50;
    
    // Selected unit
    private GameObject currentSelectedUnit;
    
    void Start()
    {
        UpdateResourceUI();
        SetObjective("ภารกิจ: ปกป้องหมู่บ้านจากกองทัพพม่า");
    }
    
    void Update()
    {
        UpdateSelectedUnitInfo();
    }
    
    public void AddResource(string type, int amount)
    {
        switch (type.ToLower())
        {
            case "rice":
                rice += amount;
                break;
            case "supplies":
                supplies += amount;
                break;
        }
        UpdateResourceUI();
    }
    
    public bool SpendResource(string type, int amount)
    {
        switch (type.ToLower())
        {
            case "rice":
                if (rice >= amount)
                {
                    rice -= amount;
                    UpdateResourceUI();
                    return true;
                }
                break;
            case "supplies":
                if (supplies >= amount)
                {
                    supplies -= amount;
                    UpdateResourceUI();
                    return true;
                }
                break;
        }
        return false;
    }
    
    void UpdateResourceUI()
    {
        if (riceText != null)
            riceText.text = $"ข้าว: {rice}";
        if (suppliesText != null)
            suppliesText.text = $"เสบียง: {supplies}";
        if (populationText != null)
            populationText.text = $"ทหาร: {population}/{maxPopulation}";
    }
    
    public void SetSelectedUnit(GameObject unit)
    {
        currentSelectedUnit = unit;
        
        if (unitInfoPanel != null)
        {
            unitInfoPanel.SetActive(unit != null);
        }
    }
    
    void UpdateSelectedUnitInfo()
    {
        if (currentSelectedUnit == null)
        {
            if (unitInfoPanel != null)
                unitInfoPanel.SetActive(false);
            return;
        }
        
        // Get unit data (simplified)
        if (unitNameText != null)
        {
            // Try to get name from TextMesh label
            var label = currentSelectedUnit.transform.Find("Label");
            if (label != null)
            {
                var tm = label.GetComponent<TextMesh>();
                if (tm != null)
                {
                    unitNameText.text = tm.text;
                }
            }
        }
    }
    
    public void SetObjective(string objective)
    {
        if (objectiveText != null)
        {
            objectiveText.text = objective;
        }
    }
    
    public void ShowVictory()
    {
        ShowEndScreen("ชัยชนะ!", new Color(0.2f, 0.6f, 0.2f));
    }
    
    public void ShowDefeat()
    {
        ShowEndScreen("พ่ายแพ้...", new Color(0.6f, 0.2f, 0.2f));
    }
    
    void ShowEndScreen(string message, Color bgColor)
    {
        // Create end screen overlay
        GameObject overlay = new GameObject("EndScreen");
        overlay.transform.SetParent(transform);
        
        var rect = overlay.AddComponent<RectTransform>();
        rect.anchorMin = Vector2.zero;
        rect.anchorMax = Vector2.one;
        rect.offsetMin = Vector2.zero;
        rect.offsetMax = Vector2.zero;
        
        var img = overlay.AddComponent<Image>();
        img.color = new Color(bgColor.r, bgColor.g, bgColor.b, 0.8f);
        
        // Add text
        GameObject textObj = new GameObject("Text");
        textObj.transform.SetParent(overlay.transform);
        
        var textRect = textObj.AddComponent<RectTransform>();
        textRect.anchorMin = new Vector2(0.5f, 0.5f);
        textRect.anchorMax = new Vector2(0.5f, 0.5f);
        textRect.sizeDelta = new Vector2(600, 200);
        
        var tmp = textObj.AddComponent<TextMeshProUGUI>();
        tmp.text = message;
        tmp.fontSize = 72;
        tmp.alignment = TextAlignmentOptions.Center;
        tmp.color = Color.white;
        
        // Pause game
        Time.timeScale = 0;
    }
}
