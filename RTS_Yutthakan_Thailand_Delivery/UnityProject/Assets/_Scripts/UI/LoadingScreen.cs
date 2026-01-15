using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;
using System.Collections;

namespace RTS.UI
{
    public class LoadingScreen : MonoBehaviour
    {
        [Header("UI Elements")]
        public Image BackgroundImage;
        public Slider ProgressBar;
        public TextMeshProUGUI ProgressText;
        public TextMeshProUGUI LoadingTipText;
        public TextMeshProUGUI SceneNameText;
        public Image LoadingIcon;

        [Header("Animation")]
        public float RotationSpeed = 100f;
        public float FadeOutDuration = 0.5f;
        public CanvasGroup CanvasGroup;

        [Header("Historical Tips")]
        public string[] HistoricalTips = new string[]
        {
            "ทราบหรือไม่? สมเด็จพระสุริโยทัยเป็นวีรสตรีที่เสียสละพระชนม์ชีพเพื่อปกป้องพระราชสวามี",
            "ช้างศึกเป็นกำลังหลักของกองทัพโบราณ หนึ่งเชือกสามารถต่อกรกับทหารราบหลายสิบนาย",
            "แม่น้ำเจ้าพระยาเป็นเส้นทางคมนาคมสำคัญของกรุงศรีอยุธยา",
            "กรุงศรีอยุธยาเป็นราชธานีที่ยิ่งใหญ่มานานกว่า 417 ปี",
            "ทหารไทยโบราณใช้ดาบ หอก ธนู และโล่เป็นอาวุธหลัก",
            "ยุทธศาสตร์การป้องกันเน้นใช้แม่น้ำและกำแพงเมืองเป็นด่านกั้น",
            "กองทัพพม่านำทหารรับจ้างโปรตุเกสมาช่วยรบด้วยปืนคาบศิลา"
        };

        private static LoadingScreen instance;
        private AsyncOperation loadOperation;

        private void Awake()
        {
            if (instance != null)
            {
                Destroy(gameObject);
                return;
            }
            
            instance = this;
            DontDestroyOnLoad(gameObject);
            gameObject.SetActive(false);
        }

        public static void LoadScene(string sceneName)
        {
            if (instance != null)
            {
                instance.StartLoading(sceneName);
            }
            else
            {
                // Fallback if no loading screen exists
                SceneManager.LoadScene(sceneName);
            }
        }

        public void StartLoading(string sceneName)
        {
            gameObject.SetActive(true);
            
            if (SceneNameText)
            {
                SceneNameText.text = GetSceneDisplayName(sceneName);
            }
            
            ShowRandomTip();
            StartCoroutine(LoadSceneAsync(sceneName));
        }

        private IEnumerator LoadSceneAsync(string sceneName)
        {
            // Start loading
            loadOperation = SceneManager.LoadSceneAsync(sceneName);
            loadOperation.allowSceneActivation = false;

            // Update progress
            while (loadOperation.progress < 0.9f)
            {
                UpdateProgress(loadOperation.progress / 0.9f);
                RotateLoadingIcon();
                yield return null;
            }

            // Loading done, wait a moment
            UpdateProgress(1f);
            yield return new WaitForSeconds(0.5f);

            // Activate scene
            loadOperation.allowSceneActivation = true;

            // Wait for scene activation
            while (!loadOperation.isDone)
            {
                yield return null;
            }

            // Fade out
            yield return StartCoroutine(FadeOut());
            
            gameObject.SetActive(false);
        }

        private void UpdateProgress(float progress)
        {
            if (ProgressBar)
            {
                ProgressBar.value = progress;
            }
            
            if (ProgressText)
            {
                ProgressText.text = $"{Mathf.RoundToInt(progress * 100)}%";
            }
        }

        private void RotateLoadingIcon()
        {
            if (LoadingIcon)
            {
                LoadingIcon.transform.Rotate(Vector3.forward, -RotationSpeed * Time.deltaTime);
            }
        }

        private void ShowRandomTip()
        {
            if (LoadingTipText && HistoricalTips.Length > 0)
            {
                LoadingTipText.text = HistoricalTips[Random.Range(0, HistoricalTips.Length)];
            }
        }

        private IEnumerator FadeOut()
        {
            if (CanvasGroup == null) yield break;

            float elapsed = 0f;
            while (elapsed < FadeOutDuration)
            {
                elapsed += Time.deltaTime;
                CanvasGroup.alpha = 1f - (elapsed / FadeOutDuration);
                yield return null;
            }
            
            CanvasGroup.alpha = 1f; // Reset for next use
        }

        private string GetSceneDisplayName(string sceneName)
        {
            switch (sceneName)
            {
                case "MainMenu": return "เมนูหลัก";
                case "CampaignSelect": return "เลือกแคมเปญ";
                case "WhiteElephant_Mission1": return "สงครามช้างเผือก - ภารกิจที่ 1";
                default: return sceneName;
            }
        }
    }
}
