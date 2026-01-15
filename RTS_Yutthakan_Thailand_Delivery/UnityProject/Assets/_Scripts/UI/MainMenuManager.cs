using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;

namespace RTS.UI
{
    public class MainMenuManager : MonoBehaviour
    {
        [Header("UI Panels")]
        public GameObject MainPanel;
        public GameObject SettingsPanel;
        public GameObject CreditsPanel;

        [Header("Main Menu Buttons")]
        public Button CampaignButton;
        public Button SkirmishButton;
        public Button SettingsButton;
        public Button CreditsButton;
        public Button QuitButton;

        [Header("Settings")]
        public Slider MusicVolumeSlider;
        public Slider SFXVolumeSlider;
        public TMP_Dropdown ResolutionDropdown;
        public TMP_Dropdown QualityDropdown;
        public Toggle FullscreenToggle;

        [Header("Animation")]
        public float FadeSpeed = 1f;
        public CanvasGroup MainCanvasGroup;

        private void Start()
        {
            // Show main panel
            ShowPanel(MainPanel);
            
            // Setup button listeners
            if (CampaignButton) CampaignButton.onClick.AddListener(OnCampaignClick);
            if (SkirmishButton) SkirmishButton.onClick.AddListener(OnSkirmishClick);
            if (SettingsButton) SettingsButton.onClick.AddListener(OnSettingsClick);
            if (CreditsButton) CreditsButton.onClick.AddListener(OnCreditsClick);
            if (QuitButton) QuitButton.onClick.AddListener(OnQuitClick);

            // Load saved settings
            LoadSettings();
            
            // Play menu music
            if (RTS.Systems.AudioManager.Instance != null)
            {
                // AudioManager.Instance.PlayMusic("MainTheme");
            }
        }

        private void ShowPanel(GameObject panel)
        {
            if (MainPanel) MainPanel.SetActive(panel == MainPanel);
            if (SettingsPanel) SettingsPanel.SetActive(panel == SettingsPanel);
            if (CreditsPanel) CreditsPanel.SetActive(panel == CreditsPanel);
        }

        #region Button Handlers
        
        public void OnCampaignClick()
        {
            Debug.Log("Opening Campaign Selection...");
            SceneManager.LoadScene("CampaignSelect");
        }

        public void OnSkirmishClick()
        {
            Debug.Log("Skirmish mode not available in this version.");
            // SceneManager.LoadScene("SkirmishSetup");
        }

        public void OnSettingsClick()
        {
            ShowPanel(SettingsPanel);
        }

        public void OnCreditsClick()
        {
            ShowPanel(CreditsPanel);
        }

        public void OnQuitClick()
        {
            Debug.Log("Quitting game...");
            #if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
            #else
            Application.Quit();
            #endif
        }

        public void OnBackToMainMenu()
        {
            ShowPanel(MainPanel);
        }

        #endregion

        #region Settings

        private void LoadSettings()
        {
            if (MusicVolumeSlider)
            {
                MusicVolumeSlider.value = PlayerPrefs.GetFloat("MusicVolume", 0.8f);
                MusicVolumeSlider.onValueChanged.AddListener(OnMusicVolumeChanged);
            }
            
            if (SFXVolumeSlider)
            {
                SFXVolumeSlider.value = PlayerPrefs.GetFloat("SFXVolume", 1f);
                SFXVolumeSlider.onValueChanged.AddListener(OnSFXVolumeChanged);
            }

            if (FullscreenToggle)
            {
                FullscreenToggle.isOn = Screen.fullScreen;
                FullscreenToggle.onValueChanged.AddListener(OnFullscreenChanged);
            }

            if (QualityDropdown)
            {
                QualityDropdown.value = QualitySettings.GetQualityLevel();
                QualityDropdown.onValueChanged.AddListener(OnQualityChanged);
            }
        }

        public void OnMusicVolumeChanged(float value)
        {
            PlayerPrefs.SetFloat("MusicVolume", value);
            // AudioManager.Instance?.SetMusicVolume(value);
        }

        public void OnSFXVolumeChanged(float value)
        {
            PlayerPrefs.SetFloat("SFXVolume", value);
            // AudioManager.Instance?.SetSFXVolume(value);
        }

        public void OnFullscreenChanged(bool isFullscreen)
        {
            Screen.fullScreen = isFullscreen;
        }

        public void OnQualityChanged(int quality)
        {
            QualitySettings.SetQualityLevel(quality);
        }

        #endregion
    }
}
