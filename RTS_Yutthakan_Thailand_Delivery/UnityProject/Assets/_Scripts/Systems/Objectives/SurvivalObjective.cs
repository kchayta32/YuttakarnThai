using UnityEngine;

namespace RTS.Systems.Objectives
{
    public class SurvivalObjective : Objective
    {
        public float DurationSeconds = 300f; // 5 mins
        private float timeRemaining;

        void Start()
        {
            timeRemaining = DurationSeconds;
        }

        public override void CheckStatus()
        {
            if (IsCompleted || IsFailed) return;

            timeRemaining -= Time.deltaTime;

            if (timeRemaining <= 0)
            {
                IsCompleted = true;
                Debug.Log($"Objective Complete: {Description}");
            }
            
            // Note: Updated description for UI
            Description = $"Survive: {Mathf.Ceil(timeRemaining)}s";
        }
    }
}
