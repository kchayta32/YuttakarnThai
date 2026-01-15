using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;
using RTS.Core;

namespace RTS.Events
{
    public class SuriyothaiEvent : MonoBehaviour
    {
        [Header("Event Configuration")]
        public UnitController KingUnit;
        public float KingHPThreshold = 0.3f; // 30% HP triggers the event
        public bool EventTriggered = false;

        [Header("Suriyothai Unit")]
        public GameObject SuriyothaiPrefab;
        public Transform SuriyothaiSpawnPoint;
        private UnitController suriyothaiUnit;

        [Header("Cutscene UI")]
        public GameObject CutscenePanel;
        public Image CutsceneBackground;
        public TextMeshProUGUI DialogueText;
        public TextMeshProUGUI SpeakerName;
        public Button ContinueButton;

        [Header("Visual Effects")]
        public GameObject HeroicGlowEffectPrefab;
        public AudioClip HeroicMusicClip;
        public AudioClip SacrificeSound;

        private int dialogueIndex = 0;
        private string[] dialogueLines;
        private string[] speakers;

        private void Start()
        {
            if (CutscenePanel) CutscenePanel.SetActive(false);
            if (ContinueButton) ContinueButton.onClick.AddListener(NextDialogue);
            
            SetupDialogue();
        }

        private void Update()
        {
            if (EventTriggered) return;
            
            CheckKingHealth();
        }

        private void CheckKingHealth()
        {
            if (KingUnit == null) return;

            float hpPercent = KingUnit.CurrentHP / KingUnit.MaxHP;
            
            if (hpPercent <= KingHPThreshold)
            {
                TriggerSacrifice();
            }
        }

        public void TriggerSacrifice()
        {
            if (EventTriggered) return;
            EventTriggered = true;

            Debug.Log("Suriyothai Sacrifice Event Triggered!");
            
            // Pause game
            Time.timeScale = 0f;
            
            // Start cutscene
            StartCoroutine(PlayCutscene());
        }

        private void SetupDialogue()
        {
            dialogueLines = new string[]
            {
                "พระราชสวามี! ข้าศึกกำลังมาล้อมพระองค์!",
                "ข้าพระบาทจะไม่ยอมให้พระองค์ต้องตกอยู่ในอันตราย...",
                "นี่คือหน้าที่ของข้าพระบาท ในฐานะมเหสีและทหาร",
                "จงรักษาพระองค์ไว้เพื่อแผ่นดิน... เพื่ออยุธยา...",
                "พระสุริโยทัยทรงขับช้างศึกพุ่งเข้าขวางข้าศึก\nปกป้องพระราชสวามีจนสุดพระแรง",
                "วีรกรรมของพระนางจะถูกจารึกในประวัติศาสตร์ชาติไทยตลอดกาล"
            };

            speakers = new string[]
            {
                "พระสุริโยทัย",
                "พระสุริโยทัย",
                "พระสุริโยทัย",
                "พระสุริโยทัย",
                "ผู้บรรยาย",
                "ผู้บรรยาย"
            };
        }

        private IEnumerator PlayCutscene()
        {
            // Show cutscene panel
            if (CutscenePanel)
            {
                CutscenePanel.SetActive(true);
            }

            // Play heroic music
            if (HeroicMusicClip != null && RTS.Systems.AudioManager.Instance != null)
            {
                // AudioManager.Instance.PlayMusic(HeroicMusicClip);
            }

            // Fade in
            yield return StartCoroutine(FadeInCutscene());

            // Show first dialogue
            dialogueIndex = 0;
            ShowCurrentDialogue();
        }

        private void ShowCurrentDialogue()
        {
            if (dialogueIndex >= dialogueLines.Length)
            {
                EndCutscene();
                return;
            }

            if (DialogueText) DialogueText.text = dialogueLines[dialogueIndex];
            if (SpeakerName) SpeakerName.text = speakers[dialogueIndex];
        }

        public void NextDialogue()
        {
            dialogueIndex++;
            ShowCurrentDialogue();
        }

        private void EndCutscene()
        {
            if (CutscenePanel) CutscenePanel.SetActive(false);
            
            // Resume game
            Time.timeScale = 1f;
            
            // Spawn Suriyothai unit as reinforcement
            SpawnSuriyothai();
            
            // Apply effects
            ApplySacrificeEffects();
        }

        private void SpawnSuriyothai()
        {
            if (SuriyothaiPrefab == null || SuriyothaiSpawnPoint == null) return;

            Vector3 spawnPos = SuriyothaiSpawnPoint.position;
            if (KingUnit != null)
            {
                spawnPos = KingUnit.transform.position + Vector3.right * 5f;
            }

            GameObject suriyothaiGO = Instantiate(SuriyothaiPrefab, spawnPos, Quaternion.identity);
            suriyothaiUnit = suriyothaiGO.GetComponent<UnitController>();

            if (suriyothaiUnit != null)
            {
                suriyothaiUnit.UnitName = "พระสุริโยทัย";
                suriyothaiUnit.MaxHP = 1500f; // Hero unit
                suriyothaiUnit.CurrentHP = 1500f;
                suriyothaiUnit.AttackDamage = 80f;
            }

            // Visual effect
            if (HeroicGlowEffectPrefab)
            {
                Instantiate(HeroicGlowEffectPrefab, suriyothaiGO.transform.position, Quaternion.identity, suriyothaiGO.transform);
            }

            Debug.Log("Queen Suriyothai spawned as reinforcement!");
        }

        private void ApplySacrificeEffects()
        {
            // Heal the King
            if (KingUnit != null)
            {
                KingUnit.CurrentHP = KingUnit.MaxHP * 0.5f;
                Debug.Log("King healed to 50% HP");
            }

            // Morale boost - All friendly units get damage boost
            var allUnits = FindObjectsOfType<UnitController>();
            foreach (var unit in allUnits)
            {
                var teamColor = unit.GetComponent<RTS.Visuals.TeamColor>();
                if (teamColor != null && teamColor.TeamID == 0) // Player team
                {
                    unit.AttackDamage *= 1.2f; // 20% damage boost
                }
            }

            Debug.Log("Morale boost applied to all units!");
        }

        private IEnumerator FadeInCutscene()
        {
            if (CutsceneBackground == null) yield break;

            Color bgColor = CutsceneBackground.color;
            bgColor.a = 0f;
            CutsceneBackground.color = bgColor;

            float elapsed = 0f;
            float duration = 1f;

            while (elapsed < duration)
            {
                elapsed += Time.unscaledDeltaTime;
                bgColor.a = elapsed / duration;
                CutsceneBackground.color = bgColor;
                yield return null;
            }
        }
    }
}
