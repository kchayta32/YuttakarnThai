using UnityEngine;
using UnityEngine.AI;

namespace RTS.Core.FSM
{
    public abstract class UnitState : IState
    {
        protected UnitController unit;
        protected NavMeshAgent agent;

        public UnitState(UnitController unit, NavMeshAgent agent)
        {
            this.unit = unit;
            this.agent = agent;
        }

        public abstract void Enter();
        public abstract void Execute();
        public abstract void Exit();
    }

    public class IdleState : UnitState
    {
        public IdleState(UnitController unit, NavMeshAgent agent) : base(unit, agent) { }

        public override void Enter() { /* Play Idle Anim */ }
        public override void Execute()
        {
            // Auto-acquire target logic could go here
            if (unit.CurrentTarget != null)
            {
                // Transition to Chase or Attack via UnitController
            }
        }
        public override void Exit() { }
    }

    public class MoveState : UnitState
    {
        private Vector3 destination;

        public MoveState(UnitController unit, NavMeshAgent agent, Vector3 dest) : base(unit, agent)
        {
            this.destination = dest;
        }

        public override void Enter()
        {
            agent.isStopped = false;
            agent.SetDestination(destination);
            unit.PlayMoveSound();
            // Play Run Anim
        }

        public override void Execute()
        {
            if (!agent.pathPending && agent.remainingDistance <= agent.stoppingDistance)
            {
                unit.StateMachine.ChangeState(new IdleState(unit, agent));
            }
        }

        public override void Exit() 
        {
            agent.isStopped = true;
        }
    }

    public class ChaseState : UnitState
    {
        public ChaseState(UnitController unit, NavMeshAgent agent) : base(unit, agent) { }

        public override void Enter() { agent.isStopped = false; }
        public override void Execute()
        {
            if (unit.CurrentTarget == null)
            {
                unit.StateMachine.ChangeState(new IdleState(unit, agent));
                return;
            }

            float distance = Vector3.Distance(unit.transform.position, unit.CurrentTarget.position);
            if (distance <= unit.AttackRange)
            {
                unit.StateMachine.ChangeState(new AttackState(unit, agent));
            }
            else
            {
                agent.SetDestination(unit.CurrentTarget.position);
            }
        }
        public override void Exit() { agent.isStopped = true; }
    }

    public class AttackState : UnitState
    {
        private float nextFireTime;

        public AttackState(UnitController unit, NavMeshAgent agent) : base(unit, agent) { }

        public override void Enter() { agent.isStopped = true; }
        public override void Execute()
        {
            if (unit.CurrentTarget == null)
            {
                unit.StateMachine.ChangeState(new IdleState(unit, agent));
                return;
            }

            // Face Target
            unit.transform.LookAt(unit.CurrentTarget);

            if (Vector3.Distance(unit.transform.position, unit.CurrentTarget.position) > unit.AttackRange)
            {
                unit.StateMachine.ChangeState(new ChaseState(unit, agent));
                return;
            }

            // Fire
            if (Time.time >= nextFireTime)
            {
                unit.PerformAttack(unit.CurrentTarget);
                nextFireTime = Time.time + unit.AttackRate;
            }
        }
        public override void Exit() { }
    }
}
