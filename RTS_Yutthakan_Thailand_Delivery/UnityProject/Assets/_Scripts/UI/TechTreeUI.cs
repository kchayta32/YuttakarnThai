using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections.Generic;
using RTS.Core.Data;
using RTS.Systems;

namespace RTS.UI
{
    public class TechTreeUI : MonoBehaviour
    {
        [Header("Panel")]
        public GameObject TechTreePanel;
        public KeyCode ToggleKey = KeyCode.T;

        [Header("Tech List")]
        public Transform TechListContainer;
        public GameObject TechItemPrefab;

        [Header("Tech Detail")]
        public GameObject DetailPanel;
        public Image DetailIcon;
        public TextMeshProUGUI DetailName;
        public TextMeshProUGUI DetailDescription;
        public TextMeshProUGUI DetailCost;
        public TextMeshProUGUI DetailRequirements;
        public TextMeshProUGUI DetailEffects;
        public Button ResearchButton;
        public TextMeshProUGUI ResearchButtonText;

        [Header("Progress")]
        public GameObject ProgressPanel;
        public TextMeshProUGUI ResearchingName;
        public Slider ProgressSlider;
        public TextMeshProUGUI ProgressText;
        public Button CancelButton;

        [Header("Colors")]
        public Color UnlockedColor = Color.green;
        public Color AvailableColor = Color.white;
        public Color LockedColor = Color.gray;
        public Color ResearchingColor = Color.yellow;

        private TechData selectedTech;
        private Dictionary<string, GameObject> techItems = new Dictionary<string, GameObject>();

        private void Start()
        {
            if (TechTreePanel) TechTreePanel.SetActive(false);
            if (DetailPanel) DetailPanel.SetActive(false);
            
            if (ResearchButton) ResearchButton.onClick.AddListener(OnResearchClick);
            if (CancelButton) CancelButton.onClick.AddListener(OnCancelClick);

            PopulateTechList();
            
            // Subscribe to events
            if (TechTreeManager.Instance != null)
            {
                TechTreeManager.Instance.OnTechUnlocked += OnTechUnlocked;
                TechTreeManager.Instance.OnResearchStarted += OnResearchStarted;
                TechTreeManager.Instance.OnResearchComplete += OnResearchComplete;
            }
        }

        private void Update()
        {
            // Toggle panel
            if (UnityEngine.Input.GetKeyDown(ToggleKey))
            {
                TogglePanel();
            }

            // Update progress
            UpdateProgress();
        }

        public void TogglePanel()
        {
            if (TechTreePanel)
            {
                TechTreePanel.SetActive(!TechTreePanel.activeSelf);
                
                if (TechTreePanel.activeSelf)
                {
                    RefreshUI();
                }
            }
        }

        private void PopulateTechList()
        {
            if (TechTreeManager.Instance == null || TechListContainer == null || TechItemPrefab == null) return;

            foreach (var tech in TechTreeManager.Instance.AllTechs)
            {
                var item = Instantiate(TechItemPrefab, TechListContainer);
                
                // Setup display
                var nameText = item.GetComponentInChildren<TextMeshProUGUI>();
                if (nameText)
                {
                    nameText.text = tech.TechNameTH;
                }

                var icon = item.transform.Find("Icon")?.GetComponent<Image>();
                if (icon && tech.Icon != null)
                {
                    icon.sprite = tech.Icon;
                }

                // Setup button
                var button = item.GetComponent<Button>();
                if (button)
                {
                    TechData techRef = tech;
                    button.onClick.AddListener(() => SelectTech(techRef));
                }

                techItems[tech.TechID] = item;
            }
        }

        public void SelectTech(TechData tech)
        {
            selectedTech = tech;
            
            if (DetailPanel)
            {
                DetailPanel.SetActive(true);
                UpdateDetailPanel();
            }
        }

        private void UpdateDetailPanel()
        {
            if (selectedTech == null) return;

            if (DetailName) DetailName.text = selectedTech.TechNameTH;
            if (DetailDescription) DetailDescription.text = selectedTech.Description;
            if (DetailIcon && selectedTech.Icon) DetailIcon.sprite = selectedTech.Icon;
            
            if (DetailCost)
            {
                DetailCost.text = $"ต้นทุน: {selectedTech.CostRice} ข้าว, {selectedTech.CostSupplies} เสบียง\n" +
                                  $"เวลาวิจัย: {selectedTech.ResearchTime} วินาที";
            }

            // Requirements
            if (DetailRequirements)
            {
                if (selectedTech.Prerequisites != null && selectedTech.Prerequisites.Count > 0)
                {
                    string reqs = "ต้องการ: ";
                    foreach (var prereq in selectedTech.Prerequisites)
                    {
                        bool hasPrereq = TechTreeManager.Instance.UnlockedTechs.Contains(prereq);
                        reqs += $"{prereq.TechNameTH} {(hasPrereq ? "✓" : "✗")}, ";
                    }
                    DetailRequirements.text = reqs.TrimEnd(',', ' ');
                }
                else
                {
                    DetailRequirements.text = "ไม่มีเงื่อนไข";
                }
            }

            // Effects
            if (DetailEffects)
            {
                string effects = "";
                if (selectedTech.DamageBonus > 0)
                    effects += $"• เพิ่มพลังโจมตี +{selectedTech.DamageBonus}%\n";
                if (selectedTech.ArmorBonus > 0)
                    effects += $"• เพิ่มเกราะ +{selectedTech.ArmorBonus}\n";
                if (selectedTech.SpeedBonus > 0)
                    effects += $"• เพิ่มความเร็ว +{selectedTech.SpeedBonus}%\n";
                if (selectedTech.UnlockedUnits != null && selectedTech.UnlockedUnits.Count > 0)
                    effects += $"• ปลดล็อกหน่วย: {string.Join(", ", selectedTech.UnlockedUnits)}\n";
                
                DetailEffects.text = effects == "" ? "ไม่มีผลพิเศษ" : effects;
            }

            // Button state
            UpdateResearchButton();
        }

        private void UpdateResearchButton()
        {
            if (ResearchButton == null || selectedTech == null) return;

            bool isUnlocked = TechTreeManager.Instance.UnlockedTechs.Contains(selectedTech);
            bool canResearch = TechTreeManager.Instance.CanResearch(selectedTech);
            bool isResearching = TechTreeManager.Instance.CurrentlyResearching == selectedTech;

            if (isUnlocked)
            {
                ResearchButtonText.text = "วิจัยแล้ว";
                ResearchButton.interactable = false;
            }
            else if (isResearching)
            {
                ResearchButtonText.text = "กำลังวิจัย...";
                ResearchButton.interactable = false;
            }
            else if (canResearch)
            {
                ResearchButtonText.text = "เริ่มวิจัย";
                ResearchButton.interactable = true;
            }
            else
            {
                ResearchButtonText.text = "ไม่พร้อม";
                ResearchButton.interactable = false;
            }
        }

        private void UpdateProgress()
        {
            if (TechTreeManager.Instance == null) return;

            bool isResearching = TechTreeManager.Instance.CurrentlyResearching != null;
            
            if (ProgressPanel)
            {
                ProgressPanel.SetActive(isResearching);
            }

            if (isResearching)
            {
                var current = TechTreeManager.Instance.CurrentlyResearching;
                
                if (ResearchingName)
                    ResearchingName.text = current.TechNameTH;
                
                if (ProgressSlider)
                    ProgressSlider.value = TechTreeManager.Instance.GetResearchProgressPercent();
                
                if (ProgressText)
                {
                    float remaining = current.ResearchTime - TechTreeManager.Instance.ResearchProgress;
                    ProgressText.text = $"{Mathf.CeilToInt(remaining)} วินาที";
                }
            }
        }

        private void RefreshUI()
        {
            // Update colors for all tech items
            foreach (var kvp in techItems)
            {
                var tech = TechTreeManager.Instance.AllTechs.Find(t => t.TechID == kvp.Key);
                if (tech == null) continue;

                var image = kvp.Value.GetComponent<Image>();
                if (image == null) continue;

                bool isUnlocked = TechTreeManager.Instance.UnlockedTechs.Contains(tech);
                bool canResearch = TechTreeManager.Instance.CanResearch(tech);
                bool isResearching = TechTreeManager.Instance.CurrentlyResearching == tech;

                if (isUnlocked)
                    image.color = UnlockedColor;
                else if (isResearching)
                    image.color = ResearchingColor;
                else if (canResearch)
                    image.color = AvailableColor;
                else
                    image.color = LockedColor;
            }
        }

        private void OnResearchClick()
        {
            if (selectedTech != null)
            {
                TechTreeManager.Instance.StartResearch(selectedTech);
                UpdateDetailPanel();
                RefreshUI();
            }
        }

        private void OnCancelClick()
        {
            TechTreeManager.Instance.CancelResearch();
            RefreshUI();
        }

        private void OnTechUnlocked(TechData tech)
        {
            RefreshUI();
            if (selectedTech == tech)
            {
                UpdateDetailPanel();
            }
        }

        private void OnResearchStarted(TechData tech)
        {
            RefreshUI();
        }

        private void OnResearchComplete(TechData tech)
        {
            RefreshUI();
        }

        private void OnDestroy()
        {
            if (TechTreeManager.Instance != null)
            {
                TechTreeManager.Instance.OnTechUnlocked -= OnTechUnlocked;
                TechTreeManager.Instance.OnResearchStarted -= OnResearchStarted;
                TechTreeManager.Instance.OnResearchComplete -= OnResearchComplete;
            }
        }
    }
}
