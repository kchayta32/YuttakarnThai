using UnityEngine;

namespace RTS.Core.Data
{
    [CreateAssetMenu(fileName = "NewBuildingData", menuName = "RTS/Building Data")]
    public class BuildingData : ScriptableObject
    {
        [Header("General")]
        public string BuildingName;
        public string BuildingNameEN;
        public Sprite Icon;
        public string Description;
        
        [Header("Costs")]
        public int CostRice;
        public int CostSupplies;
        public int CostFuel;
        public float BuildTime = 30f;

        [Header("Stats")]
        public float MaxHP = 500f;
        public float Armor = 2f;
        public int PopulationProvided = 0;
        public float VisionRange = 20f;

        [Header("Production")]
        public bool CanProduceUnits = false;
        public UnitData[] ProducibleUnits;

        [Header("Defense")]
        public bool IsDefensive = false;
        public float AttackDamage = 0f;
        public float AttackRange = 0f;
        public float AttackRate = 0f;

        [Header("Resource Generation")]
        public bool GeneratesResources = false;
        public int RicePerMinute = 0;
        public int SuppliesPerMinute = 0;
        public int FuelPerMinute = 0;

        [Header("Prefab")]
        public GameObject BuildingPrefab;
        public GameObject ConstructionPrefab;
    }
}
