using UnityEngine;
using UnityEngine.AI;
using System.Collections.Generic;

namespace RTS.Core
{
    public class RTSPathfinder : MonoBehaviour
    {
        public static RTSPathfinder Instance;

        private void Awake()
        {
            Instance = this;
        }

        public void MoveUnits(List<UnitController> units, Vector3 destination)
        {
            // Simple formation logic (offsetting destinations)
            // In a real RTS, we would calculate a formation grid.
            
            int rowSize = Mathf.CeilToInt(Mathf.Sqrt(units.Count));
            float spacing = 2.0f;

            for (int i = 0; i < units.Count; i++)
            {
                float xOffset = (i % rowSize) * spacing;
                float zOffset = (i / rowSize) * spacing;
                
                Vector3 targetPos = destination + new Vector3(xOffset, 0, zOffset);
                units[i].MoveTo(targetPos);
            }
        }

        public bool IsPathPossible(Vector3 start, Vector3 end)
        {
            NavMeshPath path = new NavMeshPath();
            NavMesh.CalculatePath(start, end, NavMesh.AllAreas, path);
            return path.status == NavMeshPathStatus.PathComplete;
        }
    }
}
