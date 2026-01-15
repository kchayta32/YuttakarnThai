using UnityEngine;

namespace RTS.AI
{
    public class AIBuildSlot : MonoBehaviour
    {
        public bool IsOccupied = false;

        void OnTriggerEnter(Collider other)
        {
            if (other.GetComponent<RTS.Core.StructureController>())
            {
                IsOccupied = true;
            }
        }

        void OnTriggerExit(Collider other)
        {
            if (other.GetComponent<RTS.Core.StructureController>())
            {
                IsOccupied = false;
            }
        }

        // Visualize in Editor
        void OnDrawGizmos()
        {
            Gizmos.color = IsOccupied ? Color.red : Color.green;
            Gizmos.DrawWireCube(transform.position, new Vector3(4, 0.1f, 4));
        }
    }
}
