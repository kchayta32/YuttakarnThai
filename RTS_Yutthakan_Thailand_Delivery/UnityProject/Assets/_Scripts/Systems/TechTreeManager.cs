using UnityEngine;
using System.Collections.Generic;
using RTS.Core.Data;
using RTS.Core;
using System;

namespace RTS.Systems
{
    public class TechTreeManager : MonoBehaviour
    {
        public static TechTreeManager Instance;

        [Header("All Technologies")]
        public List<TechData> AllTechs = new List<TechData>();

        [Header("Runtime State")]
        public List<TechData> UnlockedTechs = new List<TechData>();
        public TechData CurrentlyResearching;
        public float ResearchProgress;

        // Events
        public event Action<TechData> OnTechUnlocked;
        public event Action<TechData> OnResearchStarted;
        public event Action<TechData> OnResearchComplete;

        private void Awake()
        {
            Instance = this;
        }

        private void Update()
        {
            if (CurrentlyResearching != null)
            {
                ResearchProgress += Time.deltaTime;
                
                if (ResearchProgress >= CurrentlyResearching.ResearchTime)
                {
                    CompleteResearch();
                }
            }
        }

        public bool CanResearch(TechData tech)
        {
            // Already unlocked
            if (UnlockedTechs.Contains(tech)) return false;
            
            // Already researching something
            if (CurrentlyResearching != null) return false;
            
            // Check prerequisites
            if (tech.Prerequisites != null)
            {
                foreach (var prereq in tech.Prerequisites)
                {
                    if (!UnlockedTechs.Contains(prereq))
                        return false;
                }
            }

            // Check resources
            if (!ResourceManager.Instance.CanAfford(tech.CostRice, tech.CostSupplies, 0))
                return false;

            return true;
        }

        public bool StartResearch(TechData tech)
        {
            if (!CanResearch(tech)) return false;

            // Spend resources
            ResourceManager.Instance.SpendResources(tech.CostRice, tech.CostSupplies, 0);
            
            CurrentlyResearching = tech;
            ResearchProgress = 0f;
            
            OnResearchStarted?.Invoke(tech);
            Debug.Log($"Started researching: {tech.TechName}");

            return true;
        }

        private void CompleteResearch()
        {
            if (CurrentlyResearching == null) return;

            TechData completedTech = CurrentlyResearching;
            UnlockedTechs.Add(completedTech);
            
            // Apply bonuses
            ApplyTechBonuses(completedTech);
            
            Debug.Log($"Research complete: {completedTech.TechName}");
            
            OnTechUnlocked?.Invoke(completedTech);
            OnResearchComplete?.Invoke(completedTech);
            
            CurrentlyResearching = null;
            ResearchProgress = 0f;
        }

        private void ApplyTechBonuses(TechData tech)
        {
            // Apply stat modifiers to units
            // This would integrate with a UnitStatsModifier system
            
            if (tech.DamageBonus > 0)
            {
                Debug.Log($"All units gain {tech.DamageBonus}% damage bonus");
            }
            if (tech.ArmorBonus > 0)
            {
                Debug.Log($"All units gain {tech.ArmorBonus} armor");
            }
            if (tech.SpeedBonus > 0)
            {
                Debug.Log($"All units gain {tech.SpeedBonus}% speed bonus");
            }
            if (tech.ResourceGatherBonus > 0)
            {
                Debug.Log($"Resource gathering increased by {tech.ResourceGatherBonus}%");
            }
        }

        public bool IsTechUnlocked(string techID)
        {
            return UnlockedTechs.Exists(t => t.TechID == techID);
        }

        public bool IsUnitUnlocked(string unitName)
        {
            foreach (var tech in UnlockedTechs)
            {
                if (tech.UnlockedUnits != null && tech.UnlockedUnits.Contains(unitName))
                    return true;
            }
            return true; // Default units are always available
        }

        public bool IsBuildingUnlocked(string buildingName)
        {
            foreach (var tech in UnlockedTechs)
            {
                if (tech.UnlockedBuildings != null && tech.UnlockedBuildings.Contains(buildingName))
                    return true;
            }
            return true; // Default buildings are always available
        }

        public float GetResearchProgressPercent()
        {
            if (CurrentlyResearching == null) return 0f;
            return ResearchProgress / CurrentlyResearching.ResearchTime;
        }

        public void CancelResearch()
        {
            if (CurrentlyResearching == null) return;
            
            // Refund half the resources
            int refundRice = CurrentlyResearching.CostRice / 2;
            int refundSupplies = CurrentlyResearching.CostSupplies / 2;
            ResourceManager.Instance.AddResources(refundRice, refundSupplies, 0);
            
            CurrentlyResearching = null;
            ResearchProgress = 0f;
            
            Debug.Log("Research cancelled. 50% resources refunded.");
        }
    }
}
