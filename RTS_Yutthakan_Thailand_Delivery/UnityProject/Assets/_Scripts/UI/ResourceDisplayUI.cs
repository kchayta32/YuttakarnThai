using UnityEngine;
using UnityEngine.UI;
using TMPro;
using RTS.Core;
using RTS.Core.Data;

namespace RTS.UI
{
    /// <summary>
    /// แสดง Resource ของผู้เล่น พร้อม Icons
    /// </summary>
    public class ResourceDisplayUI : MonoBehaviour
    {
        [Header("UI Assets Reference")]
        public UIAssetsData UIAssets;

        [Header("Rice")]
        public Image RiceIconImage;
        public TextMeshProUGUI RiceAmountText;

        [Header("Supplies")]
        public Image SuppliesIconImage;
        public TextMeshProUGUI SuppliesAmountText;

        [Header("Fuel (Optional)")]
        public Image FuelIconImage;
        public TextMeshProUGUI FuelAmountText;

        [Header("Gold (Optional)")]
        public Image GoldIconImage;
        public TextMeshProUGUI GoldAmountText;

        [Header("Animation")]
        public bool AnimateOnChange = true;
        public float PulseScale = 1.2f;
        public float PulseDuration = 0.3f;

        private int lastRice, lastSupplies, lastFuel, lastGold;

        private void Start()
        {
            // ตั้งค่า Icons จาก UIAssets
            SetupIcons();

            // Subscribe to resource changes
            if (ResourceManager.Instance != null)
            {
                ResourceManager.Instance.OnResourceChanged += UpdateDisplay;
            }

            // Initial display
            UpdateDisplay();
        }

        private void SetupIcons()
        {
            if (UIAssets == null)
            {
                Debug.LogWarning("UIAssets not assigned to ResourceDisplayUI");
                return;
            }

            if (RiceIconImage != null && UIAssets.RiceIcon != null)
                RiceIconImage.sprite = UIAssets.RiceIcon;

            if (SuppliesIconImage != null && UIAssets.SuppliesIcon != null)
                SuppliesIconImage.sprite = UIAssets.SuppliesIcon;

            if (FuelIconImage != null && UIAssets.FuelIcon != null)
                FuelIconImage.sprite = UIAssets.FuelIcon;

            if (GoldIconImage != null && UIAssets.GoldIcon != null)
                GoldIconImage.sprite = UIAssets.GoldIcon;
        }

        public void UpdateDisplay()
        {
            if (ResourceManager.Instance == null) return;

            int rice = ResourceManager.Instance.Rice;
            int supplies = ResourceManager.Instance.Supplies;
            int fuel = ResourceManager.Instance.Fuel;
            int gold = ResourceManager.Instance.Gold;

            // Update Rice
            if (RiceAmountText != null)
            {
                RiceAmountText.text = FormatNumber(rice);
                if (AnimateOnChange && rice != lastRice)
                    PulseElement(RiceAmountText.transform);
            }

            // Update Supplies
            if (SuppliesAmountText != null)
            {
                SuppliesAmountText.text = FormatNumber(supplies);
                if (AnimateOnChange && supplies != lastSupplies)
                    PulseElement(SuppliesAmountText.transform);
            }

            // Update Fuel
            if (FuelAmountText != null)
            {
                FuelAmountText.text = FormatNumber(fuel);
                if (AnimateOnChange && fuel != lastFuel)
                    PulseElement(FuelAmountText.transform);
            }

            // Update Gold
            if (GoldAmountText != null)
            {
                GoldAmountText.text = FormatNumber(gold);
                if (AnimateOnChange && gold != lastGold)
                    PulseElement(GoldAmountText.transform);
            }

            lastRice = rice;
            lastSupplies = supplies;
            lastFuel = fuel;
            lastGold = gold;
        }

        private string FormatNumber(int value)
        {
            if (value >= 10000)
                return $"{value / 1000f:F1}k";
            return value.ToString("N0");
        }

        private void PulseElement(Transform target)
        {
            StartCoroutine(PulseCoroutine(target));
        }

        private System.Collections.IEnumerator PulseCoroutine(Transform target)
        {
            Vector3 originalScale = target.localScale;
            Vector3 pulseScale = originalScale * PulseScale;

            float elapsed = 0f;
            float halfDuration = PulseDuration / 2f;

            // Scale up
            while (elapsed < halfDuration)
            {
                elapsed += Time.deltaTime;
                target.localScale = Vector3.Lerp(originalScale, pulseScale, elapsed / halfDuration);
                yield return null;
            }

            elapsed = 0f;

            // Scale down
            while (elapsed < halfDuration)
            {
                elapsed += Time.deltaTime;
                target.localScale = Vector3.Lerp(pulseScale, originalScale, elapsed / halfDuration);
                yield return null;
            }

            target.localScale = originalScale;
        }

        private void OnDestroy()
        {
            if (ResourceManager.Instance != null)
            {
                ResourceManager.Instance.OnResourceChanged -= UpdateDisplay;
            }
        }
    }
}
