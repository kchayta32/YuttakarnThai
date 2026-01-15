using UnityEngine;

namespace RTS.Core.Data
{
    [CreateAssetMenu(fileName = "NewUnitData", menuName = "RTS/Unit Data")]
    public class UnitData : ScriptableObject
    {
        [Header("General")]
        public string UnitName;
        public Sprite Icon;
        public int CostRice;
        public int CostSupplies;

        [Header("Combat Stats")]
        public float MaxHP = 100f;
        public float Armor = 0f;
        public float Damage = 10f;
        public float AttackRange = 10f;
        public float AttackRate = 1.5f;
        public float MoveSpeed = 3.5f;

        [Header("Audio")]
        public AudioClip[] AttackSounds;
        public AudioClip[] SelectSounds;
        public AudioClip[] MoveSounds;
    }
}
