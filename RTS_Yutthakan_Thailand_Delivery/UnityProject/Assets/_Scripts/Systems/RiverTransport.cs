using UnityEngine;
using System.Collections.Generic;
using RTS.Core;

namespace RTS.Systems
{
    public class RiverTransport : MonoBehaviour
    {
        [Header("Barge Configuration")]
        public string BargeName = "เรือพระที่นั่ง";
        public int MaxCapacity = 10;
        public float MoveSpeed = 5f;
        public float BoardingRange = 5f;
        public float BoardingTime = 2f;

        [Header("State")]
        public List<UnitController> LoadedUnits = new List<UnitController>();
        public bool IsTransporting = false;
        public Transform CurrentDestination;

        [Header("Waypoints")]
        public List<Transform> RiverWaypoints;
        private int currentWaypointIndex = 0;

        [Header("Visual")]
        public Transform UnitContainer;
        public GameObject BoardingIndicator;
        public GameObject WakeEffectObject;

        [Header("Audio")]
        public AudioClip BoardingSound;
        public AudioClip DisembarkSound;
        public AudioClip RowingSound;

        private bool isMoving = false;
        private AudioSource audioSource;

        private void Start()
        {
            audioSource = GetComponent<AudioSource>();
            if (audioSource == null) audioSource = gameObject.AddComponent<AudioSource>();
            
            if (BoardingIndicator) BoardingIndicator.SetActive(false);
        }

        private void Update()
        {
            if (isMoving)
            {
                MoveAlongRiver();
            }
        }

        public bool CanBoard(UnitController unit)
        {
            if (unit == null) return false;
            if (LoadedUnits.Count >= MaxCapacity) return false;
            if (IsTransporting) return false;
            
            float distance = Vector3.Distance(transform.position, unit.transform.position);
            return distance <= BoardingRange;
        }

        public void BoardUnit(UnitController unit)
        {
            if (!CanBoard(unit)) return;

            LoadedUnits.Add(unit);
            
            // Hide unit
            unit.gameObject.SetActive(false);
            
            // Parent to container for reference
            if (UnitContainer) 
            {
                unit.transform.SetParent(UnitContainer);
            }

            // Play sound
            if (BoardingSound != null && audioSource != null)
            {
                audioSource.PlayOneShot(BoardingSound);
            }

            Debug.Log($"{unit.UnitName} boarded the barge. Capacity: {LoadedUnits.Count}/{MaxCapacity}");
            
            UpdateBoardingIndicator();
        }

        public void DisembarkAllUnits()
        {
            if (LoadedUnits.Count == 0) return;

            Vector3 disembarkPos = transform.position + transform.right * 3f;
            float offset = 0f;

            foreach (var unit in LoadedUnits)
            {
                if (unit != null)
                {
                    unit.transform.SetParent(null);
                    unit.transform.position = disembarkPos + Vector3.forward * offset;
                    unit.gameObject.SetActive(true);
                    offset += 2f;
                }
            }

            if (DisembarkSound != null && audioSource != null)
            {
                audioSource.PlayOneShot(DisembarkSound);
            }

            Debug.Log($"Disembarked {LoadedUnits.Count} units");
            LoadedUnits.Clear();
            UpdateBoardingIndicator();
        }

        public void DisembarkUnit(int index)
        {
            if (index < 0 || index >= LoadedUnits.Count) return;

            var unit = LoadedUnits[index];
            if (unit != null)
            {
                unit.transform.SetParent(null);
                unit.transform.position = transform.position + transform.right * 3f;
                unit.gameObject.SetActive(true);
            }

            LoadedUnits.RemoveAt(index);
            UpdateBoardingIndicator();
        }

        public void StartTransport(Transform destination)
        {
            if (LoadedUnits.Count == 0)
            {
                Debug.Log("No units on board to transport");
                return;
            }

            CurrentDestination = destination;
            IsTransporting = true;
            isMoving = true;

            // Start wake effect
            if (WakeEffectObject)
            {
                // ParticleSystem not available - enable Particle System module in Package Manager
                WakeEffectObject.SetActive(true);
            }
            
            // Play rowing sound
            if (RowingSound != null && audioSource != null)
            {
                audioSource.clip = RowingSound;
                audioSource.loop = true;
                audioSource.Play();
            }

            Debug.Log("River transport started");
        }

        public void MoveToWaypoint(int waypointIndex)
        {
            if (waypointIndex < 0 || waypointIndex >= RiverWaypoints.Count) return;
            
            currentWaypointIndex = waypointIndex;
            CurrentDestination = RiverWaypoints[waypointIndex];
            isMoving = true;
            
            if (WakeEffectObject)
            {
                WakeEffectObject.SetActive(true);
            }
        }

        private void MoveAlongRiver()
        {
            if (CurrentDestination == null)
            {
                StopMoving();
                return;
            }

            // Move towards destination
            Vector3 direction = (CurrentDestination.position - transform.position).normalized;
            transform.position += direction * MoveSpeed * Time.deltaTime;

            // Rotate to face direction
            if (direction != Vector3.zero)
            {
                Quaternion targetRotation = Quaternion.LookRotation(direction);
                transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, Time.deltaTime * 3f);
            }

            // Check if reached destination
            float distance = Vector3.Distance(transform.position, CurrentDestination.position);
            if (distance < 1f)
            {
                OnReachedWaypoint();
            }
        }

        private void OnReachedWaypoint()
        {
            // Move to next waypoint if available
            if (RiverWaypoints.Count > 0 && currentWaypointIndex < RiverWaypoints.Count - 1)
            {
                currentWaypointIndex++;
                CurrentDestination = RiverWaypoints[currentWaypointIndex];
            }
            else
            {
                // Reached final destination
                StopMoving();
                
                if (IsTransporting)
                {
                    IsTransporting = false;
                    Debug.Log("Transport complete! Units can now disembark.");
                }
            }
        }

        private void StopMoving()
        {
            isMoving = false;
            CurrentDestination = null;
            
            if (WakeEffectObject)
            {
                WakeEffectObject.SetActive(false);
            }
            if (audioSource)
            {
                audioSource.Stop();
                audioSource.loop = false;
            }
        }

        private void UpdateBoardingIndicator()
        {
            if (BoardingIndicator)
            {
                BoardingIndicator.SetActive(LoadedUnits.Count > 0);
            }
        }

        // Called by selection system to show available actions
        public bool HasLoadedUnits()
        {
            return LoadedUnits.Count > 0;
        }

        public int GetLoadedCount()
        {
            return LoadedUnits.Count;
        }

        public int GetRemainingCapacity()
        {
            return MaxCapacity - LoadedUnits.Count;
        }
    }
}
