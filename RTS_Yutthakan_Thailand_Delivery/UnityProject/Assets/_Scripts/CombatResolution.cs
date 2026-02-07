using UnityEngine;

namespace RTS.Core
{
    public static class CombatResolution
    {
        public static float CalculateDamage(float baseDamage, float targetArmor, float rangeModifier = 1.0f)
        {
            // Formula: Damage = Base * (100 / (100 + Armor)) * RangeMod
            float damageReduction = 100f / (100f + targetArmor);
            return baseDamage * damageReduction * rangeModifier;
        }

        public static float CalculateHitChance(float baseAccuracy, float distance, bool targetInCover)
        {
            float coverPenalty = targetInCover ? 20f : 0f;
            float rangePenalty = distance * 2f; // -2% per meter
            return Mathf.Clamp(baseAccuracy - rangePenalty - coverPenalty, 0f, 100f);
        }
    }
}
