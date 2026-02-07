using UnityEngine;
using System.Collections.Generic;

namespace RTS.Core
{
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance;
        public bool IsPaused = false;
        
        [SerializeField] private List<UnitController> playerUnits = new List<UnitController>();
        [SerializeField] private List<UnitController> enemyUnits = new List<UnitController>();

        private void Awake()
        {
            Instance = this;
        }

        public void RegisterUnit(UnitController unit, bool isPlayer)
        {
            if (isPlayer) playerUnits.Add(unit);
            else enemyUnits.Add(unit);
        }

        public void RemoveUnit(UnitController unit, bool isPlayer)
        {
            if (isPlayer) playerUnits.Remove(unit);
            else enemyUnits.Remove(unit);
            
            CheckWinCondition();
        }

        private void CheckWinCondition()
        {
            if (playerUnits.Count == 0) Debug.Log("Game Over!");
            if (enemyUnits.Count == 0) Debug.Log("Victory!");
        }
    }
}

namespace RTS.AI
{
    using RTS.Core;

    public class AIController : MonoBehaviour
    {
        public enum AIState { Idle, Expand, Attack, Retreat }
        public AIState CurrentState = AIState.Idle;
        public float DecisionInterval = 2.0f;
        
        private float nextDecisionTime;

        void Update()
        {
            if (Time.time > nextDecisionTime)
            {
                MakeDecision();
                nextDecisionTime = Time.time + DecisionInterval;
            }
        }

        void MakeDecision()
        {
            // Simple FSM
            switch (CurrentState)
            {
                case AIState.Idle:
                    if (ResourceManager.Instance.Rice > 1000) CurrentState = AIState.Expand;
                    break;
                case AIState.Attack:
                    // Order all units to attack player base
                    break;
            }
        }
    }
}
