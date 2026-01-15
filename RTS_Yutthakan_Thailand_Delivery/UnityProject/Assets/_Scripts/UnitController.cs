using UnityEngine;
using UnityEngine.AI;
using RTS.Core.FSM;

namespace RTS.Core
{
    [RequireComponent(typeof(NavMeshAgent))]
    public class UnitController : MonoBehaviour
    {
        [Header("Data")]
        public RTS.Core.Data.UnitData Data;

        [Header("State")]
        public string UnitName; // Cache for debug
        public float MaxHP;
        public float CurrentHP;
        public float AttackDamage;
        public float AttackRange;
        public float AttackRate;

        public bool IsSelected = false;
        public Transform CurrentTarget;
        
        public StateMachine StateMachine;
        private NavMeshAgent agent;

        void Start()
        {
            agent = GetComponent<NavMeshAgent>();
            
            // Initialize from Data
            if (Data != null)
            {
                UnitName = Data.UnitName;
                MaxHP = Data.MaxHP;
                AttackDamage = Data.Damage;
                AttackRange = Data.AttackRange;
                AttackRate = Data.AttackRate;
                agent.speed = Data.MoveSpeed;
            }
            else
            {
                // Fallback defaults
                MaxHP = 100;
                AttackDamage = 10;
                AttackRange = 5;
                AttackRate = 1;
            }

            CurrentHP = MaxHP;
            
            StateMachine = new StateMachine();
            StateMachine.ChangeState(new IdleState(this, agent));
        }

        void Update()
        {
            StateMachine.Update();
        }

        // --- Command Methods called by Input System ---

        public void MoveTo(Vector3 position)
        {
            CurrentTarget = null;
            StateMachine.ChangeState(new MoveState(this, agent, position));
        }

        public void AttackTarget(Transform target)
        {
            CurrentTarget = target;
            StateMachine.ChangeState(new ChaseState(this, agent));
        }

        // --- Logic Methods ---

        public void PerformAttack(Transform target)
        {
            // Audio
            if (Data != null && Data.AttackSounds.Length > 0)
            {
                var clip = Data.AttackSounds[Random.Range(0, Data.AttackSounds.Length)];
                RTS.Systems.AudioManager.Instance.PlaySFX(clip);
            }

            Debug.Log($"Attacking {target.name}");
            var enemy = target.GetComponent<UnitController>();
            if (enemy != null)
            {
                enemy.TakeDamage(AttackDamage);
            }
        }

        public void PlayMoveSound()
        {
            if (Data != null && Data.MoveSounds.Length > 0)
            {
                var clip = Data.MoveSounds[Random.Range(0, Data.MoveSounds.Length)];
                RTS.Systems.AudioManager.Instance.PlaySFX(clip);
            }
        }

        public void TakeDamage(float amount)
        {
            CurrentHP -= amount;
            if (CurrentHP <= 0)
            {
                Die();
            }
        }

        private void Die()
        {
            Destroy(gameObject);
        }

        public void SetSelected(bool selected)
        {
            IsSelected = selected;
            var ring = transform.Find("SelectionRing");
            if (ring) ring.gameObject.SetActive(selected);
        }
    }
}
