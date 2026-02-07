using UnityEngine;
using System.Collections.Generic;
using System.Linq;
using RTS.Core;
using RTS.Systems;

namespace RTS.AI
{
    public enum AIState
    {
        Idle,
        Building,
        Training,
        Gathering,
        Attacking,
        Defending,
        Retreating,
        Flanking
    }

    public class AICommander : MonoBehaviour
    {
        [Header("Config")]
        public int TeamID = 1;
        public float DecisionInterval = 2.0f;
        public int AttackThreshold = 5;
        public int RetreatThreshold = 2;
        public float ThreatRadius = 50f;

        [Header("Difficulty")]
        [Range(0f, 1f)] public float Aggression = 0.5f;
        [Range(0f, 1f)] public float TacticalAwareness = 0.5f;
        public bool UseFormations = true;
        public bool UseFlanking = true;

        [Header("Assets")]
        public GameObject BarracksPrefab;
        public List<GameObject> UnitPrefabs;
        public GameObject DefenseTowerPrefab;

        [Header("Rally Points")]
        public Transform RallyPoint;
        public Transform DefensePoint;
        public List<Transform> PatrolPoints;

        [Header("State")]
        public AIState CurrentState = AIState.Idle;
        public List<AIBuildSlot> BuildSlots = new List<AIBuildSlot>();
        public List<UnitController> MyArmy = new List<UnitController>();
        public List<StructureController> MyBuildings = new List<StructureController>();

        // Threat tracking
        private List<UnitController> enemyUnits = new List<UnitController>();
        private float armyStrength;
        private float enemyStrength;
        private float threatLevel;

        // Squad management
        private List<List<UnitController>> squads = new List<List<UnitController>>();
        private int squadSize = 4;

        private float nextDecisionTime;
        private int patrolIndex = 0;

        void Start()
        {
            BuildSlots.AddRange(FindObjectsOfType<AIBuildSlot>());
            OrganizeSquads();
        }

        void Update()
        {
            if (Time.time > nextDecisionTime)
            {
                UpdateSituation();
                MakeDecision();
                nextDecisionTime = Time.time + DecisionInterval;
            }
        }

        void UpdateSituation()
        {
            UpdateMyForces();
            AssessThreat();
            OrganizeSquads();
        }

        void AssessThreat()
        {
            enemyUnits.Clear();
            armyStrength = 0f;
            enemyStrength = 0f;

            var allUnits = FindObjectsOfType<UnitController>();
            foreach (var u in allUnits)
            {
                var tc = u.GetComponent<RTS.Visuals.TeamColor>();
                if (tc == null) continue;

                if (tc.TeamID == this.TeamID)
                {
                    armyStrength += CalculateUnitStrength(u);
                }
                else
                {
                    enemyUnits.Add(u);
                    
                    // Check if enemy is within threat radius of our base
                    if (MyBuildings.Count > 0)
                    {
                        float distToBase = Vector3.Distance(u.transform.position, MyBuildings[0].transform.position);
                        if (distToBase < ThreatRadius)
                        {
                            enemyStrength += CalculateUnitStrength(u) * 1.5f; // Threat multiplier
                        }
                        else
                        {
                            enemyStrength += CalculateUnitStrength(u);
                        }
                    }
                }
            }

            threatLevel = armyStrength > 0 ? enemyStrength / armyStrength : 999f;
        }

        float CalculateUnitStrength(UnitController unit)
        {
            return (unit.CurrentHP / unit.MaxHP) * (unit.AttackDamage * 0.5f + 50f);
        }

        void MakeDecision()
        {
            // Emergency: Retreat if threatened
            if (threatLevel > 2f && MyArmy.Count <= RetreatThreshold)
            {
                CurrentState = AIState.Retreating;
                ExecuteRetreat();
                return;
            }

            // Defense: Base under attack
            if (IsBaseUnderAttack())
            {
                CurrentState = AIState.Defending;
                ExecuteDefense();
                return;
            }

            // Build phase
            if (!HasBuilding("Barracks"))
            {
                CurrentState = AIState.Building;
                TryBuildStructure(BarracksPrefab);
                return;
            }

            // Consider building defenses
            if (TacticalAwareness > 0.5f && !HasBuilding("Tower") && MyBuildings.Count > 0)
            {
                if (DefenseTowerPrefab != null && Random.value < 0.3f)
                {
                    CurrentState = AIState.Building;
                    TryBuildStructure(DefenseTowerPrefab);
                    return;
                }
            }

            // Training phase
            if (MyArmy.Count < AttackThreshold)
            {
                CurrentState = AIState.Training;
                TrainUnit();
                GatherAtRally();
                return;
            }

            // Attack phase
            if (MyArmy.Count >= AttackThreshold && armyStrength > enemyStrength * Aggression)
            {
                if (UseFlanking && Random.value < TacticalAwareness)
                {
                    CurrentState = AIState.Flanking;
                    ExecuteFlankingAttack();
                }
                else
                {
                    CurrentState = AIState.Attacking;
                    LaunchAttack();
                }
            }
            else
            {
                // Continue training or patrol
                CurrentState = AIState.Idle;
                PatrolArea();
            }
        }

        bool IsBaseUnderAttack()
        {
            if (MyBuildings.Count == 0) return false;

            foreach (var enemy in enemyUnits)
            {
                foreach (var building in MyBuildings)
                {
                    if (Vector3.Distance(enemy.transform.position, building.transform.position) < 30f)
                    {
                        return true;
                    }
                }
            }
            return false;
        }

        void ExecuteDefense()
        {
            // Find closest enemy to base
            UnitController closestEnemy = null;
            float closestDist = float.MaxValue;

            foreach (var enemy in enemyUnits)
            {
                if (MyBuildings.Count > 0)
                {
                    float dist = Vector3.Distance(enemy.transform.position, MyBuildings[0].transform.position);
                    if (dist < closestDist)
                    {
                        closestDist = dist;
                        closestEnemy = enemy;
                    }
                }
            }

            if (closestEnemy != null)
            {
                foreach (var unit in MyArmy)
                {
                    unit.AttackTarget(closestEnemy.transform);
                }
                Debug.Log("AI Defending base!");
            }
        }

        void ExecuteRetreat()
        {
            Vector3 retreatPos = DefensePoint != null ? DefensePoint.position : 
                                 (MyBuildings.Count > 0 ? MyBuildings[0].transform.position : transform.position);

            foreach (var unit in MyArmy)
            {
                unit.MoveTo(retreatPos + Random.insideUnitSphere * 5f);
            }
            Debug.Log("AI Retreating!");
        }

        void ExecuteFlankingAttack()
        {
            if (enemyUnits.Count == 0) return;

            Transform target = enemyUnits[0].transform;
            Vector3 targetPos = target.position;

            // Split army into flanking groups
            int half = MyArmy.Count / 2;
            
            for (int i = 0; i < MyArmy.Count; i++)
            {
                Vector3 flankOffset;
                if (i < half)
                {
                    // Left flank
                    flankOffset = Vector3.Cross(Vector3.up, (targetPos - transform.position).normalized) * 20f;
                }
                else
                {
                    // Right flank
                    flankOffset = -Vector3.Cross(Vector3.up, (targetPos - transform.position).normalized) * 20f;
                }

                MyArmy[i].MoveTo(targetPos + flankOffset);
            }

            Debug.Log("AI Flanking attack!");
        }

        void GatherAtRally()
        {
            if (RallyPoint == null) return;

            foreach (var unit in MyArmy)
            {
                if (unit.CurrentTarget == null)
                {
                    float dist = Vector3.Distance(unit.transform.position, RallyPoint.position);
                    if (dist > 10f)
                    {
                        unit.MoveTo(RallyPoint.position + Random.insideUnitSphere * 3f);
                    }
                }
            }
        }

        void PatrolArea()
        {
            if (PatrolPoints.Count == 0) return;

            int unitsPerPoint = Mathf.Max(1, MyArmy.Count / PatrolPoints.Count);
            
            for (int i = 0; i < MyArmy.Count; i++)
            {
                int pointIndex = (i / unitsPerPoint) % PatrolPoints.Count;
                var patrolTarget = PatrolPoints[pointIndex];
                
                if (Vector3.Distance(MyArmy[i].transform.position, patrolTarget.position) > 5f)
                {
                    MyArmy[i].MoveTo(patrolTarget.position);
                }
            }
        }

        void OrganizeSquads()
        {
            squads.Clear();
            
            for (int i = 0; i < MyArmy.Count; i += squadSize)
            {
                var squad = new List<UnitController>();
                for (int j = i; j < Mathf.Min(i + squadSize, MyArmy.Count); j++)
                {
                    squad.Add(MyArmy[j]);
                }
                squads.Add(squad);
            }
        }

        void MoveSquadInFormation(List<UnitController> squad, Vector3 destination)
        {
            if (!UseFormations || squad.Count == 0) return;

            Vector3 forward = (destination - squad[0].transform.position).normalized;
            Vector3 right = Vector3.Cross(Vector3.up, forward);

            // Diamond formation
            Vector3[] offsets = new Vector3[]
            {
                Vector3.zero,                    // Leader
                right * 2f - forward * 2f,       // Right back
                -right * 2f - forward * 2f,      // Left back
                -forward * 4f                    // Rear
            };

            for (int i = 0; i < squad.Count; i++)
            {
                Vector3 offset = i < offsets.Length ? offsets[i] : -forward * (2f * i);
                squad[i].MoveTo(destination + offset);
            }
        }

        void UpdateMyForces()
        {
            MyArmy.Clear();
            MyBuildings.Clear();

            var allUnits = FindObjectsOfType<UnitController>();
            foreach (var u in allUnits)
            {
                var tc = u.GetComponent<RTS.Visuals.TeamColor>();
                if (tc != null && tc.TeamID == this.TeamID) MyArmy.Add(u);
            }

            var allStructure = FindObjectsOfType<StructureController>();
            foreach (var s in allStructure)
            {
                if (s.TeamID == this.TeamID) MyBuildings.Add(s);
            }
        }

        bool HasBuilding(string nameContains)
        {
            foreach (var b in MyBuildings)
            {
                if (b.StructureName.Contains(nameContains)) return true;
            }
            return false;
        }

        void TryBuildStructure(GameObject prefab)
        {
            foreach (var slot in BuildSlots)
            {
                if (!slot.IsOccupied)
                {
                    BuildManager.Instance.BuildStructureImmediate(prefab, slot.transform.position, this.TeamID);
                    slot.IsOccupied = true;
                    Debug.Log("AI Building Structure");
                    break;
                }
            }
        }

        void TrainUnit()
        {
            if (UnitPrefabs.Count == 0 && UnitPrefabs == null) return;

            // Select unit based on tactical needs
            GameObject prefabToTrain = SelectUnitToTrain();

            foreach (var b in MyBuildings)
            {
                b.SpawnUnit(prefabToTrain);
                break;
            }
        }

        GameObject SelectUnitToTrain()
        {
            if (UnitPrefabs == null || UnitPrefabs.Count == 0) return null;
            
            // Simple selection: random for now, could be smarter
            return UnitPrefabs[Random.Range(0, UnitPrefabs.Count)];
        }

        void LaunchAttack()
        {
            // Prioritize targets
            Transform target = SelectPriorityTarget();

            if (target != null)
            {
                if (UseFormations && squads.Count > 0)
                {
                    foreach (var squad in squads)
                    {
                        MoveSquadInFormation(squad, target.position);
                    }
                }
                else
                {
                    foreach (var u in MyArmy)
                    {
                        u.AttackTarget(target);
                    }
                }
                Debug.Log("AI Launching Attack!");
            }
        }

        Transform SelectPriorityTarget()
        {
            // Priority 1: Low HP enemies
            UnitController weakestEnemy = null;
            float lowestHP = float.MaxValue;

            foreach (var enemy in enemyUnits)
            {
                if (enemy.CurrentHP < lowestHP)
                {
                    lowestHP = enemy.CurrentHP;
                    weakestEnemy = enemy;
                }
            }

            if (weakestEnemy != null && TacticalAwareness > 0.7f)
            {
                return weakestEnemy.transform;
            }

            // Priority 2: Player HQ
            if (GameLoopManager.Instance != null && GameLoopManager.Instance.PlayerHQ != null)
            {
                return GameLoopManager.Instance.PlayerHQ.transform;
            }

            // Priority 3: Closest enemy
            if (enemyUnits.Count > 0)
            {
                return enemyUnits[0].transform;
            }

            return null;
        }
    }
}
