using UnityEngine;

namespace RTS.Core.FSM
{
    public interface IState
    {
        void Enter();
        void Execute();
        void Exit();
    }

    public class StateMachine
    {
        public IState CurrentState { get; private set; }

        public void ChangeState(IState newState)
        {
            if (CurrentState != null)
                CurrentState.Exit();

            CurrentState = newState;
            CurrentState.Enter();
        }

        public void Update()
        {
            if (CurrentState != null)
                CurrentState.Execute();
        }
    }
}
