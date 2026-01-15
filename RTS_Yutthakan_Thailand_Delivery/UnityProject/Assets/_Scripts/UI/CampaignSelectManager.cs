using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;
using System.Collections.Generic;

namespace RTS.UI
{
    [System.Serializable]
    public class CampaignData
    {
        public string CampaignID;
        public string TitleTH;
        public string TitleEN;
        public string Year;
        public string Description;
        public string SceneName;
        public Sprite Thumbnail;
        public bool IsUnlocked;
        public bool IsCompleted;
    }

    public class CampaignSelectManager : MonoBehaviour
    {
        [Header("Campaign Data")]
        public List<CampaignData> Campaigns = new List<CampaignData>();

        [Header("UI References")]
        public Transform CampaignListContainer;
        public GameObject CampaignButtonPrefab;
        
        [Header("Detail Panel")]
        public GameObject DetailPanel;
        public Image DetailThumbnail;
        public TextMeshProUGUI DetailTitle;
        public TextMeshProUGUI DetailYear;
        public TextMeshProUGUI DetailDescription;
        public Button PlayButton;
        public Button BackButton;
        public GameObject LockedOverlay;

        [Header("Briefing Panel")]
        public GameObject BriefingPanel;
        public TextMeshProUGUI BriefingTitle;
        public TextMeshProUGUI BriefingText;
        public TextMeshProUGUI ObjectivesText;
        public Button StartMissionButton;
        public Button BriefingBackButton;

        private CampaignData selectedCampaign;

        private void Awake()
        {
            InitializeCampaigns();
        }

        private void Start()
        {
            PopulateCampaignList();
            
            if (BackButton) BackButton.onClick.AddListener(OnBackClick);
            if (PlayButton) PlayButton.onClick.AddListener(OnPlayClick);
            if (StartMissionButton) StartMissionButton.onClick.AddListener(OnStartMission);
            if (BriefingBackButton) BriefingBackButton.onClick.AddListener(OnBriefingBack);

            // Hide panels initially
            if (DetailPanel) DetailPanel.SetActive(false);
            if (BriefingPanel) BriefingPanel.SetActive(false);
        }

        private void InitializeCampaigns()
        {
            // Initialize default campaigns if empty
            if (Campaigns.Count == 0)
            {
                Campaigns = new List<CampaignData>
                {
                    new CampaignData {
                        CampaignID = "white_elephant",
                        TitleTH = "สงครามช้างเผือก",
                        TitleEN = "War of the White Elephants",
                        Year = "1547-1549",
                        Description = "พระเจ้าตะเบ็งชะเวตี้แห่งตองอู บุกสยามผ่านด่านเจดีย์สามองค์ พระสุริโยทัยทรงขี่ช้างออกรบเพื่อปกป้องพระราชสวามี ภารกิจนี้เป็นบทเรียนพื้นฐานการรบและควบคุมหน่วย",
                        SceneName = "WhiteElephant_Mission1",
                        IsUnlocked = true,
                        IsCompleted = false
                    },
                    new CampaignData {
                        CampaignID = "tha_din_daeng",
                        TitleTH = "สงครามท่าดินแดง",
                        TitleEN = "Battle of Tha Din Daeng",
                        Year = "1786",
                        Description = "พระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช นำทัพรัตนโกสินทร์สกัดกองทัพพม่าขนาดใหญ่",
                        SceneName = "ThaDinDaeng_Mission1",
                        IsUnlocked = false,
                        IsCompleted = false
                    },
                    new CampaignData {
                        CampaignID = "paknam",
                        TitleTH = "วิกฤตการณ์ปากน้ำ",
                        TitleEN = "The Paknam Incident",
                        Year = "1893",
                        Description = "เรือรบฝรั่งเศสบุกขึ้นแม่น้ำเจ้าพระยา สยามต้องป้องกันเมืองหลวงในวิกฤตการณ์ทางการทูต",
                        SceneName = "Paknam_Mission1",
                        IsUnlocked = false,
                        IsCompleted = false
                    },
                    new CampaignData {
                        CampaignID = "wwi",
                        TitleTH = "กองกำลังทหารอาสา",
                        TitleEN = "The Expeditionary Force",
                        Year = "1918",
                        Description = "กองทหารอาสาสยามเดินทางไปฝรั่งเศส ต้องปรับตัวกับสงครามสนามเพลาะ",
                        SceneName = "WWI_Mission1",
                        IsUnlocked = false,
                        IsCompleted = false
                    },
                    new CampaignData {
                        CampaignID = "boworadet",
                        TitleTH = "กบฏบวรเดช",
                        TitleEN = "Boworadet Rebellion",
                        Year = "1933",
                        Description = "พระองค์เจ้าบวรเดชนำกำลังจากโคราชเข้ากรุงเทพฯ เพื่อโค่นล้มรัฐบาล",
                        SceneName = "Boworadet_Mission1",
                        IsUnlocked = false,
                        IsCompleted = false
                    },
                    new CampaignData {
                        CampaignID = "franco_thai",
                        TitleTH = "ยุทธนาวีเกาะช้าง",
                        TitleEN = "Franco-Thai War",
                        Year = "1940-1941",
                        Description = "กองทัพไทยบุกอินโดจีนของฝรั่งเศสเพื่อเรียกคืนดินแดนที่สูญเสีย",
                        SceneName = "FrancoThai_Mission1",
                        IsUnlocked = false,
                        IsCompleted = false
                    },
                    new CampaignData {
                        CampaignID = "ao_manao",
                        TitleTH = "วีรชนอ่าวมะนาว",
                        TitleEN = "Heroes of Ao Manao",
                        Year = "1941",
                        Description = "8 ธันวาคม 1941 กองทัพญี่ปุ่นบุกขึ้นที่ประจวบคีรีขันธ์ กองกำลังเล็กๆ ต้องยันไว้",
                        SceneName = "AoManao_Mission1",
                        IsUnlocked = false,
                        IsCompleted = false
                    },
                    new CampaignData {
                        CampaignID = "korean",
                        TitleTH = "พยัคฆ์น้อย",
                        TitleEN = "Little Tigers",
                        Year = "1950-1953",
                        Description = "กรมทหารราบที่ 21 ร่วมกองกำลังสหประชาชาติป้องกันเกาหลีใต้",
                        SceneName = "Korean_Mission1",
                        IsUnlocked = false,
                        IsCompleted = false
                    },
                    new CampaignData {
                        CampaignID = "modern",
                        TitleTH = "ปฏิบัติการนาคราช",
                        TitleEN = "Operation Naga Protect",
                        Year = "2025",
                        Description = "สถานการณ์สมมติ - กองทัพบกไทยปฏิบัติการรักษาสันติภาพ",
                        SceneName = "Modern_Mission1",
                        IsUnlocked = false,
                        IsCompleted = false
                    }
                };
            }
        }

        private void PopulateCampaignList()
        {
            if (CampaignListContainer == null || CampaignButtonPrefab == null) return;

            // Clear existing
            foreach (Transform child in CampaignListContainer)
            {
                Destroy(child.gameObject);
            }

            // Create buttons for each campaign
            for (int i = 0; i < Campaigns.Count; i++)
            {
                var campaign = Campaigns[i];
                var buttonGO = Instantiate(CampaignButtonPrefab, CampaignListContainer);
                
                // Setup button display
                var buttonText = buttonGO.GetComponentInChildren<TextMeshProUGUI>();
                if (buttonText)
                {
                    buttonText.text = $"{i + 1}. {campaign.TitleTH}\n<size=70%>{campaign.Year}</size>";
                }

                // Setup thumbnail if available
                var buttonImage = buttonGO.transform.Find("Thumbnail")?.GetComponent<Image>();
                if (buttonImage && campaign.Thumbnail)
                {
                    buttonImage.sprite = campaign.Thumbnail;
                }

                // Setup locked state
                var lockIcon = buttonGO.transform.Find("LockIcon");
                if (lockIcon)
                {
                    lockIcon.gameObject.SetActive(!campaign.IsUnlocked);
                }

                // Setup button click
                var button = buttonGO.GetComponent<Button>();
                if (button)
                {
                    int index = i; // Capture for closure
                    button.onClick.AddListener(() => OnCampaignSelected(index));
                    
                    // Visual feedback for locked campaigns
                    if (!campaign.IsUnlocked)
                    {
                        var colors = button.colors;
                        colors.normalColor = new Color(0.5f, 0.5f, 0.5f, 0.7f);
                        button.colors = colors;
                    }
                }
            }
        }

        public void OnCampaignSelected(int index)
        {
            if (index < 0 || index >= Campaigns.Count) return;

            selectedCampaign = Campaigns[index];
            
            // Update detail panel
            if (DetailPanel)
            {
                DetailPanel.SetActive(true);
                
                if (DetailTitle) DetailTitle.text = selectedCampaign.TitleTH;
                if (DetailYear) DetailYear.text = selectedCampaign.Year;
                if (DetailDescription) DetailDescription.text = selectedCampaign.Description;
                if (DetailThumbnail && selectedCampaign.Thumbnail)
                    DetailThumbnail.sprite = selectedCampaign.Thumbnail;

                // Show/hide locked overlay
                if (LockedOverlay)
                    LockedOverlay.SetActive(!selectedCampaign.IsUnlocked);
                
                if (PlayButton)
                    PlayButton.interactable = selectedCampaign.IsUnlocked;
            }
        }

        public void OnPlayClick()
        {
            if (selectedCampaign == null || !selectedCampaign.IsUnlocked) return;

            // Show briefing panel
            ShowBriefing();
        }

        private void ShowBriefing()
        {
            if (BriefingPanel)
            {
                BriefingPanel.SetActive(true);
                if (DetailPanel) DetailPanel.SetActive(false);

                if (BriefingTitle) 
                    BriefingTitle.text = $"ภารกิจ: {selectedCampaign.TitleTH}";
                
                if (BriefingText)
                    BriefingText.text = GetBriefingText(selectedCampaign.CampaignID);

                if (ObjectivesText)
                    ObjectivesText.text = GetObjectivesText(selectedCampaign.CampaignID);
            }
        }

        private string GetBriefingText(string campaignID)
        {
            switch (campaignID)
            {
                case "white_elephant":
                    return "ปี พ.ศ. 2090 พระเจ้าตะเบ็งชะเวตี้แห่งราชวงศ์ตองอู ยกทัพบุกกรุงศรีอยุธยา\n\n" +
                           "กองทัพพม่าข้ามด่านเจดีย์สามองค์เข้าสู่ที่ราบกาญจนบุรี พระมหาจักรพรรดิทรงนำทัพออกสู้ศึก " +
                           "พร้อมด้วยพระสุริโยทัยพระมเหสี\n\n" +
                           "ท่านคือผู้บัญชาการกองทัพสยาม จงป้องกันจุดข้ามแม่น้ำ และนำพระราชวงศ์กลับพระนครให้ปลอดภัย";
                default:
                    return selectedCampaign.Description;
            }
        }

        private string GetObjectivesText(string campaignID)
        {
            switch (campaignID)
            {
                case "white_elephant":
                    return "◆ ภารกิจหลัก:\n" +
                           "  1. ป้องกันจุดข้ามแม่น้ำ (ยันไว้ 5 นาที)\n" +
                           "  2. คุ้มกันเรือพระที่นั่งไปยังพระนคร\n" +
                           "  3. ปราบแม่ทัพหน้าของพม่า\n\n" +
                           "◆ ภารกิจเสริม:\n" +
                           "  - รักษาช้างศึกไว้อย่างน้อย 3 เชือก";
                default:
                    return "ไม่มีข้อมูลภารกิจ";
            }
        }

        public void OnStartMission()
        {
            if (selectedCampaign != null)
            {
                Debug.Log($"Loading mission: {selectedCampaign.SceneName}");
                SceneManager.LoadScene(selectedCampaign.SceneName);
            }
        }

        public void OnBriefingBack()
        {
            if (BriefingPanel) BriefingPanel.SetActive(false);
            if (DetailPanel) DetailPanel.SetActive(true);
        }

        public void OnBackClick()
        {
            SceneManager.LoadScene("MainMenu");
        }
    }
}
