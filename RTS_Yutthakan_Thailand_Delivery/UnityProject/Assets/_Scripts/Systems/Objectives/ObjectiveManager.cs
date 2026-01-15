using UnityEngine;
using System.Collections.Generic;

namespace RTS.Systems.Objectives
{
    public class ObjectiveManager : MonoBehaviour
    {
        public static ObjectiveManager Instance;
        
        public List<Objective> Objectives = new List<Objective>();

        void Awake()
        {
            Instance = this;
        }

        void Start()
        {
            // Auto-find objectives attached to this GameObject
            Objectives.AddRange(GetComponents<Objective>());
        }

        void Update()
        {
            bool allComplete = true;
            
            foreach(var obj in Objectives)
            {
                obj.CheckStatus();
                if (!obj.IsCompleted) allComplete = false;
                
                if (obj.IsFailed)
                {
                    GameLoopManager.Instance.TriggerDefeat();
                    return;
                }
            }

            if (allComplete && Objectives.Count > 0)
            {
                GameLoopManager.Instance.TriggerVictory();
            }
        }
    }
}
