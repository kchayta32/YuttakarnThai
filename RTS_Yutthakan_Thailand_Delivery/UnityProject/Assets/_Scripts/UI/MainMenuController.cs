using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using TMPro;

/// <summary>
/// Main Menu Controller - จัดการหน้าเมนูหลัก
/// เชื่อมต่อปุ่มและ panels
/// </summary>
public class MainMenuController : MonoBehaviour
{
    [Header("Panels")]
    public GameObject mainMenuPanel;
    public GameObject campaignPanel;
    public GameObject settingsPanel;
    public GameObject creditsPanel;
    
    [Header("Audio")]
    public AudioSource bgmSource;
    public AudioClip buttonClickSound;
    
    private AudioSource sfxSource;
    
    void Start()
    {
        // Auto-find panels if not assigned
        FindPanels();
        
        // Setup button listeners
        SetupButtons();
        
        // Show main menu
        ShowMainMenu();
        
        // Setup audio
        sfxSource = gameObject.AddComponent<AudioSource>();
        sfxSource.playOnAwake = false;
    }
    
    void FindPanels()
    {
        if (mainMenuPanel == null)
            mainMenuPanel = GameObject.Find("MainMenuPanel");
        if (campaignPanel == null)
            campaignPanel = GameObject.Find("CampaignPanel");
        if (settingsPanel == null)
            settingsPanel = GameObject.Find("SettingsPanel");
        if (creditsPanel == null)
            creditsPanel = GameObject.Find("CreditsPanel");
    }
    
    void SetupButtons()
    {
        // Main menu buttons
        SetupButton("NewGameBtn", OnNewGameClicked);
        SetupButton("ContinueBtn", OnContinueClicked);
        SetupButton("SettingsBtn", OnSettingsClicked);
        SetupButton("CreditsBtn", OnCreditsClicked);
        SetupButton("ExitBtn", OnExitClicked);
        
        // Back buttons
        SetupButtonInPanel(campaignPanel, "BackButton", OnBackClicked);
        SetupButtonInPanel(settingsPanel, "BackButton", OnBackClicked);
        
        // Campaign play buttons
        SetupCampaignPlayButtons();
    }
    
    void SetupButton(string buttonName, UnityEngine.Events.UnityAction action)
    {
        var btn = FindButtonByName(buttonName);
        if (btn != null)
        {
            btn.onClick.AddListener(action);
            btn.onClick.AddListener(PlayClickSound);
        }
    }
    
    void SetupButtonInPanel(GameObject panel, string buttonName, UnityEngine.Events.UnityAction action)
    {
        if (panel == null) return;
        
        var btn = panel.GetComponentInChildren<Button>();
        Transform backBtn = panel.transform.Find(buttonName);
        if (backBtn != null)
        {
            var button = backBtn.GetComponent<Button>();
            if (button != null)
            {
                button.onClick.AddListener(action);
                button.onClick.AddListener(PlayClickSound);
            }
        }
    }
    
    void SetupCampaignPlayButtons()
    {
        if (campaignPanel == null) return;
        
        // Find all campaign cards
        foreach (Transform child in campaignPanel.transform)
        {
            if (child.name.StartsWith("Campaign_"))
            {
                var playBtn = child.Find("PlayButton");
                if (playBtn != null)
                {
                    var button = playBtn.GetComponent<Button>();
                    if (button != null)
                    {
                        string campaignName = child.name.Replace("Campaign_", "");
                        button.onClick.AddListener(() => OnCampaignSelected(campaignName));
                        button.onClick.AddListener(PlayClickSound);
                    }
                }
            }
        }
    }
    
    Button FindButtonByName(string name)
    {
        var obj = GameObject.Find(name);
        return obj != null ? obj.GetComponent<Button>() : null;
    }
    
    // ==================== Button Handlers ====================
    
    public void OnNewGameClicked()
    {
        Debug.Log("[Menu] New Game clicked");
        ShowCampaignSelection();
    }
    
    public void OnContinueClicked()
    {
        Debug.Log("[Menu] Continue clicked");
        // Load last saved game (not implemented yet)
        ShowMessage("ยังไม่มี Save Game");
    }
    
    public void OnSettingsClicked()
    {
        Debug.Log("[Menu] Settings clicked");
        ShowSettings();
    }
    
    public void OnCreditsClicked()
    {
        Debug.Log("[Menu] Credits clicked");
        ShowMessage("เครดิต:\n\nRTS ยุทธการไทย\nพัฒนาโดยทีมนักศึกษา\n\nUnity Engine");
    }
    
    public void OnExitClicked()
    {
        Debug.Log("[Menu] Exit clicked");
        #if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
        #else
            Application.Quit();
        #endif
    }
    
    public void OnBackClicked()
    {
        Debug.Log("[Menu] Back clicked");
        ShowMainMenu();
    }
    
    public void OnCampaignSelected(string campaignName)
    {
        Debug.Log($"[Menu] Campaign selected: {campaignName}");
        
        // Map campaign to scene
        string sceneName = GetSceneForCampaign(campaignName);
        
        if (!string.IsNullOrEmpty(sceneName))
        {
            LoadScene(sceneName);
        }
        else
        {
            ShowMessage($"เริ่มแคมเปญ: {campaignName}");
            // Default to White Elephant mission
            LoadScene("WhiteElephant_Mission1_Beautiful");
        }
    }
    
    string GetSceneForCampaign(string campaignName)
    {
        // Map Thai campaign names to scene files
        if (campaignName.Contains("ช้างเผือก"))
            return "WhiteElephant_Mission1_Beautiful";
        if (campaignName.Contains("บางระจัน"))
            return "BangRachan_Mission1";
        if (campaignName.Contains("กู้แผ่นดิน"))
            return "Liberation_Mission1";
        if (campaignName.Contains("ตากสิน"))
            return "Taksin_Mission1";
        
        return null;
    }
    
    void LoadScene(string sceneName)
    {
        // Check if scene exists
        if (Application.CanStreamedLevelBeLoaded(sceneName))
        {
            SceneManager.LoadScene(sceneName);
        }
        else
        {
            Debug.LogWarning($"Scene not found: {sceneName}");
            ShowMessage($"กำลังโหลด...\n(Scene: {sceneName})");
            
            // Try to load anyway
            try
            {
                SceneManager.LoadScene(sceneName);
            }
            catch
            {
                ShowMessage($"ไม่พบ Scene: {sceneName}");
            }
        }
    }
    
    // ==================== Panel Management ====================
    
    void HideAllPanels()
    {
        if (mainMenuPanel != null) mainMenuPanel.SetActive(false);
        if (campaignPanel != null) campaignPanel.SetActive(false);
        if (settingsPanel != null) settingsPanel.SetActive(false);
        if (creditsPanel != null) creditsPanel.SetActive(false);
    }
    
    public void ShowMainMenu()
    {
        HideAllPanels();
        if (mainMenuPanel != null) mainMenuPanel.SetActive(true);
    }
    
    public void ShowCampaignSelection()
    {
        HideAllPanels();
        if (campaignPanel != null) campaignPanel.SetActive(true);
    }
    
    public void ShowSettings()
    {
        HideAllPanels();
        if (settingsPanel != null) settingsPanel.SetActive(true);
    }
    
    // ==================== Audio ====================
    
    void PlayClickSound()
    {
        if (sfxSource != null && buttonClickSound != null)
        {
            sfxSource.PlayOneShot(buttonClickSound);
        }
    }
    
    // ==================== Message Popup ====================
    
    void ShowMessage(string message)
    {
        Debug.Log($"[Menu Message] {message}");
        
        // Create simple popup
        StartCoroutine(ShowMessageCoroutine(message));
    }
    
    System.Collections.IEnumerator ShowMessageCoroutine(string message)
    {
        var canvas = FindObjectOfType<Canvas>();
        if (canvas == null) yield break;
        
        // Create popup
        GameObject popup = new GameObject("MessagePopup");
        popup.transform.SetParent(canvas.transform);
        
        var rect = popup.AddComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = new Vector2(0.5f, 0.5f);
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.anchoredPosition = Vector2.zero;
        rect.sizeDelta = new Vector2(400, 200);
        
        var bg = popup.AddComponent<Image>();
        bg.color = new Color(0.1f, 0.08f, 0.05f, 0.95f);
        
        // Text
        GameObject textObj = new GameObject("Text");
        textObj.transform.SetParent(popup.transform);
        var textRect = textObj.AddComponent<RectTransform>();
        textRect.anchorMin = Vector2.zero;
        textRect.anchorMax = Vector2.one;
        textRect.offsetMin = new Vector2(20, 20);
        textRect.offsetMax = new Vector2(-20, -20);
        
        var tmp = textObj.AddComponent<TextMeshProUGUI>();
        tmp.text = message;
        tmp.fontSize = 20;
        tmp.color = new Color(0.9f, 0.85f, 0.8f);
        tmp.alignment = TextAlignmentOptions.Center;
        
        // Wait and destroy
        yield return new WaitForSeconds(2f);
        Destroy(popup);
    }
}
