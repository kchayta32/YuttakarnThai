using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections.Generic;
using System;

namespace RTS.Systems.Objectives
{
    public enum ObjectiveStatus
    {
        Active,
        Completed,
        Failed
    }

    [System.Serializable]
    public class MissionObjective
    {
        public string ObjectiveID;
        public string DescriptionTH;
        public string DescriptionEN;
        public ObjectiveStatus Status = ObjectiveStatus.Active;
        public bool IsPrimary = true;
        public bool IsHidden = false;
        
        // For visual representation
        public Sprite Icon;
    }

    public class MissionObjectiveManager : MonoBehaviour
    {
        public static MissionObjectiveManager Instance;

        [Header("Mission Info")]
        public string MissionName = "ภารกิจที่ 1";
        public string MissionDescription;

        [Header("Objectives")]
        public List<MissionObjective> Objectives = new List<MissionObjective>();

        [Header("UI References")]
        public GameObject ObjectivePanel;
        public Transform ObjectiveListContainer;
        public GameObject ObjectiveItemPrefab;
        public TextMeshProUGUI MissionTitleText;

        [Header("Notification")]
        public GameObject ObjectiveNotification;
        public TextMeshProUGUI NotificationText;
        public float NotificationDuration = 3f;

        [Header("Audio")]
        public AudioClip ObjectiveCompleteSound;
        public AudioClip ObjectiveFailedSound;
        public AudioClip NewObjectiveSound;

        // Events
        public event Action<MissionObjective> OnObjectiveCompleted;
        public event Action<MissionObjective> OnObjectiveFailed;
        public event Action OnMissionComplete;
        public event Action OnMissionFailed;

        private void Awake()
        {
            Instance = this;
        }

        private void Start()
        {
            UpdateUI();
            
            if (MissionTitleText)
                MissionTitleText.text = MissionName;
        }

        public void AddObjective(MissionObjective objective)
        {
            Objectives.Add(objective);
            UpdateUI();
            
            if (!objective.IsHidden)
            {
                ShowNotification($"ภารกิจใหม่: {objective.DescriptionTH}");
                PlaySound(NewObjectiveSound);
            }
        }

        public void CompleteObjective(string objectiveID)
        {
            var objective = Objectives.Find(o => o.ObjectiveID == objectiveID);
            if (objective == null || objective.Status != ObjectiveStatus.Active) return;

            objective.Status = ObjectiveStatus.Completed;
            OnObjectiveCompleted?.Invoke(objective);
            
            ShowNotification($"✓ สำเร็จ: {objective.DescriptionTH}");
            PlaySound(ObjectiveCompleteSound);
            
            UpdateUI();
            CheckMissionStatus();

            // Record in GameEndUI
            var gameEndUI = FindObjectOfType<RTS.UI.GameEndUI>();
            if (gameEndUI != null)
            {
                gameEndUI.RecordObjectiveComplete();
            }
        }

        public void FailObjective(string objectiveID)
        {
            var objective = Objectives.Find(o => o.ObjectiveID == objectiveID);
            if (objective == null || objective.Status != ObjectiveStatus.Active) return;

            objective.Status = ObjectiveStatus.Failed;
            OnObjectiveFailed?.Invoke(objective);
            
            ShowNotification($"✗ ล้มเหลว: {objective.DescriptionTH}");
            PlaySound(ObjectiveFailedSound);
            
            UpdateUI();
            
            // Primary objective failure = mission failure
            if (objective.IsPrimary)
            {
                OnMissionFailed?.Invoke();
                
                var gameEndUI = FindObjectOfType<RTS.UI.GameEndUI>();
                if (gameEndUI != null)
                {
                    gameEndUI.ShowResult(RTS.UI.GameResult.Defeat);
                }
            }
        }

        public void RevealHiddenObjective(string objectiveID)
        {
            var objective = Objectives.Find(o => o.ObjectiveID == objectiveID);
            if (objective == null) return;

            objective.IsHidden = false;
            ShowNotification($"ภารกิจเสริม: {objective.DescriptionTH}");
            PlaySound(NewObjectiveSound);
            UpdateUI();
        }

        private void CheckMissionStatus()
        {
            bool allPrimaryComplete = true;
            
            foreach (var obj in Objectives)
            {
                if (obj.IsPrimary && obj.Status != ObjectiveStatus.Completed)
                {
                    allPrimaryComplete = false;
                    break;
                }
            }

            if (allPrimaryComplete)
            {
                OnMissionComplete?.Invoke();
                
                var gameEndUI = FindObjectOfType<RTS.UI.GameEndUI>();
                if (gameEndUI != null)
                {
                    gameEndUI.SetTotalObjectives(Objectives.Count);
                    gameEndUI.ShowResult(RTS.UI.GameResult.Victory);
                }
            }
        }

        private void UpdateUI()
        {
            if (ObjectiveListContainer == null || ObjectiveItemPrefab == null) return;

            // Clear existing
            foreach (Transform child in ObjectiveListContainer)
            {
                Destroy(child.gameObject);
            }

            // Create UI items
            foreach (var obj in Objectives)
            {
                if (obj.IsHidden) continue;

                var item = Instantiate(ObjectiveItemPrefab, ObjectiveListContainer);
                
                var text = item.GetComponentInChildren<TextMeshProUGUI>();
                if (text)
                {
                    string prefix = obj.IsPrimary ? "◆" : "○";
                    string statusIcon = "";
                    
                    switch (obj.Status)
                    {
                        case ObjectiveStatus.Completed:
                            statusIcon = " ✓";
                            text.color = Color.green;
                            break;
                        case ObjectiveStatus.Failed:
                            statusIcon = " ✗";
                            text.color = Color.red;
                            break;
                        default:
                            text.color = Color.white;
                            break;
                    }
                    
                    text.text = $"{prefix} {obj.DescriptionTH}{statusIcon}";
                }

                // Icon
                var iconImage = item.transform.Find("Icon")?.GetComponent<Image>();
                if (iconImage && obj.Icon != null)
                {
                    iconImage.sprite = obj.Icon;
                }
            }
        }

        private void ShowNotification(string message)
        {
            if (ObjectiveNotification == null || NotificationText == null) return;

            NotificationText.text = message;
            ObjectiveNotification.SetActive(true);
            
            CancelInvoke(nameof(HideNotification));
            Invoke(nameof(HideNotification), NotificationDuration);
        }

        private void HideNotification()
        {
            if (ObjectiveNotification != null)
                ObjectiveNotification.SetActive(false);
        }

        private void PlaySound(AudioClip clip)
        {
            if (clip != null && AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX(clip);
            }
        }

        // Helper methods for common objective types
        public bool IsObjectiveComplete(string objectiveID)
        {
            var obj = Objectives.Find(o => o.ObjectiveID == objectiveID);
            return obj != null && obj.Status == ObjectiveStatus.Completed;
        }

        public int GetCompletedCount()
        {
            return Objectives.FindAll(o => o.Status == ObjectiveStatus.Completed).Count;
        }

        public int GetTotalCount()
        {
            return Objectives.Count;
        }
    }
}
