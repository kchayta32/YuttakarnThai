using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;
using RTS.Core;

namespace RTS.Events
{
    public class ElephantDuel : MonoBehaviour
    {
        [Header("Duel Configuration")]
        public float DuelTriggerDistance = 10f;
        public float DuelDamageMultiplier = 2f;
        public float DuelDuration = 30f;
        public float AttackCooldown = 2f;

        [Header("Duel UI")]
        public GameObject DuelUIPanel;
        public Slider Player1HealthBar;
        public Slider Player2HealthBar;
        public TextMeshProUGUI Player1Name;
        public TextMeshProUGUI Player2Name;
        public TextMeshProUGUI DuelTimerText;
        public TextMeshProUGUI DuelInstructions;

        [Header("Visual Effects")]
        public GameObject DuelArena;
        public GameObject ClashEffectPrefab;
        public AudioClip DuelStartSound;
        public AudioClip ElephantRoarSound;
        public AudioClip ClashSound;

        [Header("Hero Units")]
        public UnitController PlayerHeroElephant;
        public UnitController EnemyHeroElephant;

        private bool isDueling = false;
        private float duelTimer;
        private float attackTimer;
        private Camera mainCamera;
        private Vector3 originalCameraPos;

        private void Start()
        {
            mainCamera = Camera.main;
            if (DuelUIPanel) DuelUIPanel.SetActive(false);
        }

        private void Update()
        {
            if (!isDueling)
            {
                CheckForDuelTrigger();
            }
            else
            {
                UpdateDuel();
            }
        }

        private void CheckForDuelTrigger()
        {
            if (PlayerHeroElephant == null || EnemyHeroElephant == null) return;

            float distance = Vector3.Distance(
                PlayerHeroElephant.transform.position,
                EnemyHeroElephant.transform.position
            );

            if (distance <= DuelTriggerDistance)
            {
                StartDuel();
            }
        }

        public void StartDuel()
        {
            if (isDueling) return;
            
            isDueling = true;
            duelTimer = DuelDuration;
            attackTimer = 0f;

            // Pause other gameplay
            Time.timeScale = 0.5f;

            // Setup UI
            if (DuelUIPanel) DuelUIPanel.SetActive(true);
            UpdateDuelUI();

            // Camera focus
            if (mainCamera != null)
            {
                originalCameraPos = mainCamera.transform.position;
                StartCoroutine(FocusCameraOnDuel());
            }

            // Stop units from moving normally
            if (PlayerHeroElephant != null)
            {
                PlayerHeroElephant.GetComponent<UnityEngine.AI.NavMeshAgent>().isStopped = true;
            }
            if (EnemyHeroElephant != null)
            {
                EnemyHeroElephant.GetComponent<UnityEngine.AI.NavMeshAgent>().isStopped = true;
            }

            // Play audio
            if (DuelStartSound != null && RTS.Systems.AudioManager.Instance != null)
            {
                RTS.Systems.AudioManager.Instance.PlaySFX(DuelStartSound);
            }

            Debug.Log("Elephant Duel Started!");
            
            if (DuelInstructions)
            {
                DuelInstructions.text = "กด [Space] เพื่อโจมตี! รักษาจังหวะให้ดี";
            }
        }

        private void UpdateDuel()
        {
            duelTimer -= Time.unscaledDeltaTime;
            attackTimer -= Time.unscaledDeltaTime;

            // Update timer display
            if (DuelTimerText)
            {
                DuelTimerText.text = $"เวลา: {Mathf.CeilToInt(duelTimer)}";
            }

            // Player input
            if (UnityEngine.Input.GetKeyDown(KeyCode.Space) && attackTimer <= 0)
            {
                PlayerAttack();
                attackTimer = AttackCooldown;
            }

            // AI attacks
            if (Random.value < 0.02f && attackTimer <= 0) // ~2% chance per frame
            {
                EnemyAttack();
            }

            UpdateDuelUI();

            // Check end conditions
            if (duelTimer <= 0 || 
                PlayerHeroElephant == null || 
                EnemyHeroElephant == null ||
                PlayerHeroElephant.CurrentHP <= 0 ||
                EnemyHeroElephant.CurrentHP <= 0)
            {
                EndDuel();
            }
        }

        private void PlayerAttack()
        {
            if (EnemyHeroElephant == null) return;

            float damage = PlayerHeroElephant.AttackDamage * DuelDamageMultiplier;
            EnemyHeroElephant.TakeDamage(damage);

            // Effects
            if (ClashEffectPrefab)
            {
                // ParticleSystem not available
                ClashEffectPrefab.SetActive(true);
            }
            if (ClashSound != null && RTS.Systems.AudioManager.Instance != null)
            {
                RTS.Systems.AudioManager.Instance.PlaySFX(ClashSound);
            }

            Debug.Log($"Player dealt {damage} damage!");
        }

        private void EnemyAttack()
        {
            if (PlayerHeroElephant == null) return;

            float damage = EnemyHeroElephant.AttackDamage * DuelDamageMultiplier * 0.8f; // Slightly weaker
            PlayerHeroElephant.TakeDamage(damage);

            if (ElephantRoarSound != null && RTS.Systems.AudioManager.Instance != null)
            {
                RTS.Systems.AudioManager.Instance.PlaySFX(ElephantRoarSound);
            }

            Debug.Log($"Enemy dealt {damage} damage!");
        }

        private void UpdateDuelUI()
        {
            if (Player1HealthBar && PlayerHeroElephant != null)
            {
                Player1HealthBar.value = PlayerHeroElephant.CurrentHP / PlayerHeroElephant.MaxHP;
            }
            if (Player2HealthBar && EnemyHeroElephant != null)
            {
                Player2HealthBar.value = EnemyHeroElephant.CurrentHP / EnemyHeroElephant.MaxHP;
            }

            if (Player1Name) Player1Name.text = "สมเด็จพระมหาจักรพรรดิ";
            if (Player2Name) Player2Name.text = "พระเจ้าตะเบ็งชะเวตี้";
        }

        private void EndDuel()
        {
            isDueling = false;
            Time.timeScale = 1f;

            if (DuelUIPanel) DuelUIPanel.SetActive(false);

            // Resume unit control
            if (PlayerHeroElephant != null)
            {
                var agent = PlayerHeroElephant.GetComponent<UnityEngine.AI.NavMeshAgent>();
                if (agent) agent.isStopped = false;
            }
            if (EnemyHeroElephant != null)
            {
                var agent = EnemyHeroElephant.GetComponent<UnityEngine.AI.NavMeshAgent>();
                if (agent) agent.isStopped = false;
            }

            // Determine winner
            if (PlayerHeroElephant != null && PlayerHeroElephant.CurrentHP > 0)
            {
                if (EnemyHeroElephant == null || EnemyHeroElephant.CurrentHP <= 0)
                {
                    Debug.Log("Player wins the duel!");
                    OnDuelVictory();
                }
            }
            else
            {
                Debug.Log("Player lost the duel!");
                OnDuelDefeat();
            }
        }

        private void OnDuelVictory()
        {
            // Could trigger special events or bonuses
            Debug.Log("Victory effects triggered!");
        }

        private void OnDuelDefeat()
        {
            // Could trigger Suriyothai event
            var suriyothaiEvent = FindObjectOfType<SuriyothaiEvent>();
            if (suriyothaiEvent != null)
            {
                suriyothaiEvent.TriggerSacrifice();
            }
        }

        private IEnumerator FocusCameraOnDuel()
        {
            if (mainCamera == null || PlayerHeroElephant == null || EnemyHeroElephant == null) yield break;

            Vector3 midpoint = (PlayerHeroElephant.transform.position + EnemyHeroElephant.transform.position) / 2f;
            Vector3 targetPos = new Vector3(midpoint.x, mainCamera.transform.position.y - 10f, midpoint.z - 20f);

            float elapsed = 0f;
            float duration = 1f;
            Vector3 startPos = mainCamera.transform.position;

            while (elapsed < duration)
            {
                elapsed += Time.unscaledDeltaTime;
                mainCamera.transform.position = Vector3.Lerp(startPos, targetPos, elapsed / duration);
                yield return null;
            }
        }
    }
}
