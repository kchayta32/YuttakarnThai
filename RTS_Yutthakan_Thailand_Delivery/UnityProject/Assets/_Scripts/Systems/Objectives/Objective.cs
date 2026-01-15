using UnityEngine;

namespace RTS.Systems.Objectives
{
    public abstract class Objective : MonoBehaviour
    {
        public string Description;
        public bool IsCompleted { get; protected set; }
        public bool IsFailed { get; protected set; }

        public abstract void CheckStatus();
    }
}
