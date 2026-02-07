using UnityEngine;
using RTS.Core;
using RTS.Systems.Objectives;
using RTS.Events;
using System.Collections;

namespace RTS.Campaigns
{
    public class WhiteElephantMission1 : MonoBehaviour
    {
        [Header("Mission Configuration")]
        public float DefendDuration = 300f; // 5 minutes
        public int MinElephantsSurvived = 3;

        [Header("Key Units")]
        public UnitController KingUnit;
        public UnitController QueenUnit;
        public Transform RoyalBarge;
        public Transform AyutthayaDestination;

        [Header("Enemy Spawns")]
        public Transform[] EnemySpawnPoints;
        public GameObject[] EnemyPrefabs;
        public float SpawnInterval = 30f;
        public int MaxEnemiesPerWave = 5;

        [Header("Objectives Reference")]
        private MissionObjectiveManager objectiveManager;

        [Header("Timer")]
        private float defendTimer;
        private bool defendPhaseComplete = false;
        private bool escortPhaseActive = false;
        private bool missionComplete = false;

        [Header("Elephant Tracking")]
        public int InitialElephantCount = 5;
        private int currentElephantCount;

        private void Start()
        {
            objectiveManager = MissionObjectiveManager.Instance;
            
            SetupObjectives();
            SetupEventListeners();
            
            defendTimer = DefendDuration;
            currentElephantCount = InitialElephantCount;
            
            StartCoroutine(SpawnEnemyWaves());
        }

        private void SetupObjectives()
        {
            if (objectiveManager == null) return;

            objectiveManager.MissionName = "สงครามช้างเผือก - ภารกิจที่ 1";

            // Primary objectives
            objectiveManager.AddObjective(new MissionObjective
            {
                ObjectiveID = "defend_crossing",
                DescriptionTH = "ป้องกันจุดข้ามแม่น้ำ (ยันไว้ 5 นาที)",
                DescriptionEN = "Defend the river crossing (Hold for 5 minutes)",
                IsPrimary = true
            });

            objectiveManager.AddObjective(new MissionObjective
            {
                ObjectiveID = "escort_barge",
                DescriptionTH = "คุ้มกันเรือพระที่นั่งไปยังพระนคร",
                DescriptionEN = "Escort the Royal Barge to the capital",
                IsPrimary = true
            });

            objectiveManager.AddObjective(new MissionObjective
            {
                ObjectiveID = "defeat_commander",
                DescriptionTH = "ปราบแม่ทัพหน้าของพม่า",
                DescriptionEN = "Defeat the Vanguard Commander",
                IsPrimary = true
            });

            // Optional objective (hidden initially)
            objectiveManager.AddObjective(new MissionObjective
            {
                ObjectiveID = "save_elephants",
                DescriptionTH = "รักษาช้างศึกไว้อย่างน้อย 3 เชือก",
                DescriptionEN = "Keep at least 3 War Elephants alive",
                IsPrimary = false,
                IsHidden = true
            });
        }

        private void SetupEventListeners()
        {
            // Listen for Suriyothai event
            var suriyothaiEvent = FindObjectOfType<SuriyothaiEvent>();
            if (suriyothaiEvent != null)
            {
                suriyothaiEvent.KingUnit = KingUnit;
            }

            // Listen for Elephant Duel
            var elephantDuel = FindObjectOfType<ElephantDuel>();
            if (elephantDuel != null)
            {
                elephantDuel.PlayerHeroElephant = KingUnit;
            }
        }

        private void Update()
        {
            if (missionComplete) return;

            // Phase 1: Defend
            if (!defendPhaseComplete)
            {
                UpdateDefendPhase();
            }
            // Phase 2: Escort
            else if (escortPhaseActive)
            {
                UpdateEscortPhase();
            }

            // Track elephant casualties
            TrackElephants();

            // Check King survival
            if (KingUnit == null || KingUnit.CurrentHP <= 0)
            {
                if (objectiveManager != null)
                {
                    objectiveManager.FailObjective("escort_barge");
                }
            }
        }

        private void UpdateDefendPhase()
        {
            defendTimer -= Time.deltaTime;

            // Update UI timer (could be done through events)
            if (defendTimer <= 0)
            {
                defendPhaseComplete = true;
                escortPhaseActive = true;
                
                if (objectiveManager != null)
                {
                    objectiveManager.CompleteObjective("defend_crossing");
                }

                // Reveal bonus objective
                if (objectiveManager != null)
                {
                    objectiveManager.RevealHiddenObjective("save_elephants");
                }

                Debug.Log("Defend phase complete! Now escort the Royal Barge.");
            }
        }

        private void UpdateEscortPhase()
        {
            if (RoyalBarge == null || AyutthayaDestination == null) return;

            float distanceToDestination = Vector3.Distance(
                RoyalBarge.position, 
                AyutthayaDestination.position
            );

            if (distanceToDestination < 10f)
            {
                if (objectiveManager != null)
                {
                    objectiveManager.CompleteObjective("escort_barge");
                }
                escortPhaseActive = false;
            }
        }

        private void TrackElephants()
        {
            // Count remaining war elephants
            var elephants = FindObjectsOfType<UnitController>();
            int count = 0;
            
            foreach (var unit in elephants)
            {
                if (unit.UnitName.Contains("ช้าง") || unit.UnitName.Contains("Elephant"))
                {
                    var teamColor = unit.GetComponent<RTS.Visuals.TeamColor>();
                    if (teamColor != null && teamColor.TeamID == 0)
                    {
                        count++;
                    }
                }
            }

            currentElephantCount = count;
        }

        public void OnCommanderDefeated()
        {
            if (objectiveManager != null)
            {
                objectiveManager.CompleteObjective("defeat_commander");
            }

            // Check bonus objective
            if (currentElephantCount >= MinElephantsSurvived)
            {
                if (objectiveManager != null)
                {
                    objectiveManager.CompleteObjective("save_elephants");
                }
            }
        }

        private IEnumerator SpawnEnemyWaves()
        {
            while (!defendPhaseComplete)
            {
                yield return new WaitForSeconds(SpawnInterval);
                
                if (EnemySpawnPoints.Length > 0 && EnemyPrefabs.Length > 0)
                {
                    int waveSize = Random.Range(2, MaxEnemiesPerWave + 1);
                    
                    for (int i = 0; i < waveSize; i++)
                    {
                        Transform spawnPoint = EnemySpawnPoints[Random.Range(0, EnemySpawnPoints.Length)];
                        GameObject prefab = EnemyPrefabs[Random.Range(0, EnemyPrefabs.Length)];
                        
                        Vector3 spawnPos = spawnPoint.position + Random.insideUnitSphere * 3f;
                        spawnPos.y = spawnPoint.position.y;
                        
                        Instantiate(prefab, spawnPos, Quaternion.identity);
                    }
                    
                    Debug.Log($"Enemy wave spawned: {waveSize} units");
                }
            }
        }

        public float GetDefendTimeRemaining()
        {
            return Mathf.Max(0, defendTimer);
        }

        public string GetDefendTimeFormatted()
        {
            int minutes = Mathf.FloorToInt(defendTimer / 60f);
            int seconds = Mathf.FloorToInt(defendTimer % 60f);
            return $"{minutes:00}:{seconds:00}";
        }
    }
}
