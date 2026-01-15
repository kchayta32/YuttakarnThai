using UnityEngine;
using RTS.Core;

namespace RTS.Systems.Objectives
{
    public class EliminateObjective : Objective
    {
        public StructureController TargetStructure;
        public UnitController TargetUnit;

        public override void CheckStatus()
        {
            if (IsCompleted || IsFailed) return;

            bool targetDestroyed = true;

            if (TargetStructure != null) targetDestroyed = false;
            if (TargetUnit != null) targetDestroyed = false;

            if (targetDestroyed)
            {
                IsCompleted = true;
                Debug.Log($"Objective Complete: {Description}");
            }
        }
    }
}
