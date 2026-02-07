using UnityEngine;
using System.Collections.Generic;

namespace RTS.Core.Data
{
    [CreateAssetMenu(fileName = "NewTechData", menuName = "RTS/Tech Data")]
    public class TechData : ScriptableObject
    {
        [Header("General")]
        public string TechID;
        public string TechName;
        public string TechNameTH;
        public string Description;
        public Sprite Icon;
        
        [Header("Requirements")]
        public List<TechData> Prerequisites;
        public int CostRice;
        public int CostSupplies;
        public float ResearchTime = 30f; // Seconds

        [Header("Effects")]
        public List<string> UnlockedUnits;
        public List<string> UnlockedBuildings;
        
        [Header("Stat Bonuses")]
        public float DamageBonus = 0f;      // Percentage
        public float ArmorBonus = 0f;       // Flat
        public float SpeedBonus = 0f;       // Percentage
        public float ResourceGatherBonus = 0f; // Percentage
    }
}
