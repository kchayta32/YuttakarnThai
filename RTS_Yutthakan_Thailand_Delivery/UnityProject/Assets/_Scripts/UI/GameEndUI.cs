using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;
using System.Collections;
using RTS.Core.Data;

namespace RTS.UI
{
    public enum GameResult
    {
        Victory,
        Defeat
    }

    public class GameEndUI : MonoBehaviour
    {
        [Header("Panel References")]
        public GameObject EndGamePanel;
        public CanvasGroup PanelCanvasGroup;

        [Header("Victory UI")]
        public GameObject VictoryPanel;
        public TextMeshProUGUI VictoryTitle;
        public TextMeshProUGUI VictoryMessage;
        public Image VictoryIcon;

        [Header("Defeat UI")]
        public GameObject DefeatPanel;
        public TextMeshProUGUI DefeatTitle;
        public TextMeshProUGUI DefeatMessage;
        public Image DefeatIcon;

        [Header("Stats")]
        public TextMeshProUGUI UnitsLostText;
        public TextMeshProUGUI EnemiesDestroyedText;
        public TextMeshProUGUI TimeElapsedText;
        public TextMeshProUGUI ObjectivesCompletedText;

        [Header("Buttons")]
        public Button ContinueButton;
        public Button RetryButton;
        public Button MainMenuButton;

        [Header("Historical Info")]
        public GameObject HistoricalPanel;
        public TextMeshProUGUI HistoricalTitle;
        public TextMeshProUGUI HistoricalText;

        [Header("Animation")]
        public float FadeInDuration = 1f;

        [Header("UI Assets")]
        public UIAssetsData UIAssets;

        // Stats tracking
        private int unitsLost = 0;
        private int enemiesDestroyed = 0;
        private float gameStartTime;
        private int objectivesCompleted = 0;
        private int totalObjectives = 3;

        private void Start()
        {
            gameStartTime = Time.time;
            
            if (EndGamePanel) EndGamePanel.SetActive(false);
            
            // Setup icons from UIAssets
            SetupIcons();
            
            // Setup button listeners
            if (ContinueButton) ContinueButton.onClick.AddListener(OnContinue);
            if (RetryButton) RetryButton.onClick.AddListener(OnRetry);
            if (MainMenuButton) MainMenuButton.onClick.AddListener(OnMainMenu);
        }

        private void SetupIcons()
        {
            if (UIAssets == null) return;

            if (VictoryIcon != null && UIAssets.VictoryEmblem != null)
                VictoryIcon.sprite = UIAssets.VictoryEmblem;

            if (DefeatIcon != null && UIAssets.DefeatEmblem != null)
                DefeatIcon.sprite = UIAssets.DefeatEmblem;
        }

        public void ShowResult(GameResult result)
        {
            Time.timeScale = 0f; // Pause game
            
            if (EndGamePanel) EndGamePanel.SetActive(true);
            
            if (result == GameResult.Victory)
            {
                ShowVictory();
            }
            else
            {
                ShowDefeat();
            }

            UpdateStats();
            StartCoroutine(FadeIn());
        }

        private void ShowVictory()
        {
            if (VictoryPanel) VictoryPanel.SetActive(true);
            if (DefeatPanel) DefeatPanel.SetActive(false);
            
            if (VictoryTitle) VictoryTitle.text = "ชัยชนะ!";
            if (VictoryMessage) VictoryMessage.text = GetVictoryMessage();
            
            if (ContinueButton) ContinueButton.gameObject.SetActive(true);
            
            // Show historical info
            ShowHistoricalInfo(true);
        }

        private void ShowDefeat()
        {
            if (DefeatPanel) DefeatPanel.SetActive(true);
            if (VictoryPanel) VictoryPanel.SetActive(false);
            
            if (DefeatTitle) DefeatTitle.text = "พ่ายแพ้";
            if (DefeatMessage) DefeatMessage.text = GetDefeatMessage();
            
            if (ContinueButton) ContinueButton.gameObject.SetActive(false);
            
            ShowHistoricalInfo(false);
        }

        private void UpdateStats()
        {
            float elapsedTime = Time.time - gameStartTime;
            int minutes = Mathf.FloorToInt(elapsedTime / 60f);
            int seconds = Mathf.FloorToInt(elapsedTime % 60f);

            if (UnitsLostText) 
                UnitsLostText.text = $"หน่วยที่สูญเสีย: {unitsLost}";
            if (EnemiesDestroyedText) 
                EnemiesDestroyedText.text = $"ศัตรูที่ปราบ: {enemiesDestroyed}";
            if (TimeElapsedText) 
                TimeElapsedText.text = $"เวลา: {minutes:00}:{seconds:00}";
            if (ObjectivesCompletedText) 
                ObjectivesCompletedText.text = $"ภารกิจสำเร็จ: {objectivesCompleted}/{totalObjectives}";
        }

        private void ShowHistoricalInfo(bool isVictory)
        {
            if (HistoricalPanel == null) return;
            
            HistoricalPanel.SetActive(true);
            
            string sceneName = SceneManager.GetActiveScene().name;
            
            if (sceneName.Contains("WhiteElephant"))
            {
                if (HistoricalTitle) 
                    HistoricalTitle.text = "บันทึกประวัติศาสตร์";
                    
                if (HistoricalText)
                {
                    HistoricalText.text = "สงครามช้างเผือก (พ.ศ. 2090-2092)\n\n" +
                        "พระสุริโยทัยทรงเป็นพระมเหสีในสมเด็จพระมหาจักรพรรดิ " +
                        "เมื่อกองทัพพม่าบุกกรุงศรีอยุธยา พระนางทรงแต่งพระองค์เป็นชาย " +
                        "ขี่ช้างออกศึกเคียงข้างพระราชสวามี\n\n" +
                        "เมื่อพระราชสวามีทรงตกอยู่ในอันตราย พระนางทรงขับช้างเข้าขวาง " +
                        "และถูกพระแสงของข้าศึกสิ้นพระชนม์ในสนามรบ\n\n" +
                        "การสละพระชนม์ชีพของพระนางเป็นที่ยกย่องในฐานะวีรสตรีของชาติไทย";
                }
            }
        }

        private string GetVictoryMessage()
        {
            string sceneName = SceneManager.GetActiveScene().name;
            
            if (sceneName.Contains("WhiteElephant"))
            {
                return "ท่านได้ปกป้องพระราชวงศ์และนำกองทัพกลับพระนครอย่างปลอดภัย\n" +
                       "แม้การต่อสู้ยังไม่จบ แต่ท่านได้สร้างตำนานแห่งความกล้าหาญ";
            }
            return "ภารกิจสำเร็จ!";
        }

        private string GetDefeatMessage()
        {
            return "กองทัพของท่านพ่ายแพ้ ประวัติศาสตร์อาจเปลี่ยนแปลงไป...\n" +
                   "ลองอีกครั้งเพื่อพลิกกลับชัยชนะ";
        }

        private IEnumerator FadeIn()
        {
            if (PanelCanvasGroup == null) yield break;
            
            PanelCanvasGroup.alpha = 0f;
            float elapsed = 0f;
            
            while (elapsed < FadeInDuration)
            {
                elapsed += Time.unscaledDeltaTime;
                PanelCanvasGroup.alpha = elapsed / FadeInDuration;
                yield return null;
            }
            
            PanelCanvasGroup.alpha = 1f;
        }

        #region Button Handlers

        public void OnContinue()
        {
            Time.timeScale = 1f;
            
            // Load next mission or return to campaign select
            // For now, just go to campaign select
            SceneManager.LoadScene("CampaignSelect");
        }

        public void OnRetry()
        {
            Time.timeScale = 1f;
            SceneManager.LoadScene(SceneManager.GetActiveScene().name);
        }

        public void OnMainMenu()
        {
            Time.timeScale = 1f;
            SceneManager.LoadScene("MainMenu");
        }

        #endregion

        #region Stats Tracking (Called from other scripts)

        public void RecordUnitLost()
        {
            unitsLost++;
        }

        public void RecordEnemyDestroyed()
        {
            enemiesDestroyed++;
        }

        public void RecordObjectiveComplete()
        {
            objectivesCompleted++;
        }

        public void SetTotalObjectives(int total)
        {
            totalObjectives = total;
        }

        #endregion
    }
}
