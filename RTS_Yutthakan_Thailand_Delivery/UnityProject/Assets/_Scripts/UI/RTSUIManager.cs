using UnityEngine;
using TMPro;
using RTS.Core;
using RTS.Systems;

namespace RTS.UI
{
    public class RTSUIManager : MonoBehaviour
    {
        [Header("Resources")]
        public TextMeshProUGUI RiceText;
        public TextMeshProUGUI SuppliesText;
        public TextMeshProUGUI FuelText;

        [Header("Prefabs")]
        public GameObject BarracksPrefab;
        public GameObject UnitPrefab;

        void Start()
        {
            ResourceManager.Instance.OnResourceChanged += UpdateResourceUI;
            UpdateResourceUI();
        }

        void UpdateResourceUI()
        {
            if (RiceText) RiceText.text = $"Rice: {ResourceManager.Instance.Rice}";
            if (SuppliesText) SuppliesText.text = $"Supplies: {ResourceManager.Instance.Supplies}";
            if (FuelText) FuelText.text = $"Fuel: {ResourceManager.Instance.Fuel}";
        }

        // Called by UI Button OnClick
        public void OnClickBuildBarracks()
        {
            // Example Cost: 100 Rice, 50 Supplies
            BuildManager.Instance.EnterBuildMode(BarracksPrefab, 100, 50);
        }

        // Called by UI Button (Simplification: In real game, Unit Button is context sensitive)
        public void OnClickTrainUnit()
        {
            // Find selected barracks? For prototype, we might just spawn at world center or find random barracks.
            var barracks = FindObjectOfType<StructureController>();
            if (barracks != null)
            {
                if (ResourceManager.Instance.CanAfford(50, 0, 0))
                {
                    ResourceManager.Instance.SpendResources(50, 0, 0);
                    barracks.SpawnUnit(UnitPrefab);
                }
            }
        }
    }
}
