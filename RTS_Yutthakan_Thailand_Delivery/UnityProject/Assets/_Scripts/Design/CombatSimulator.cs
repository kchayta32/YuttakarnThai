using UnityEngine;
using RTS.Core;

namespace RTS.Design
{
    public class CombatSimulator : MonoBehaviour
    {
        public UnitController unitPrefab1; // e.g. Pikeman
        public UnitController unitPrefab2; // e.g. Cavalry

        [ContextMenu("Run Simulation")]
        public void RunSimulation()
        {
            // Clean up
            foreach(var u in FindObjectsOfType<UnitController>()) DestroyImmediate(u.gameObject);

            // Spawn
            UnitController u1 = Instantiate(unitPrefab1, Vector3.left * 5, Quaternion.identity);
            UnitController u2 = Instantiate(unitPrefab2, Vector3.right * 5, Quaternion.identity);
            
            u1.name = "Unit 1";
            u2.name = "Unit 2";

            // Force Attack (Bypass FSM/Vision for raw stat test)
            u1.AttackTarget(u2.transform);
            u2.AttackTarget(u1.transform);
            
            Debug.Log($"Simulation Started: {u1.UnitName} vs {u2.UnitName}");
        }
    }
}
