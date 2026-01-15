using UnityEngine;
using RTS.Core;

namespace RTS.Core
{
    public class StructureController : MonoBehaviour
    {
        [Header("Stats")]
        public string StructureName;
        public float MaxHP = 500f;
        public float CurrentHP;
        public int TeamID = 0; // 0 = Player

        [Header("Production")]
        public Transform SpawnPoint;

        void Start()
        {
            CurrentHP = MaxHP;
        }

        public void TakeDamage(float amount)
        {
            CurrentHP -= amount;
            if (CurrentHP <= 0)
            {
                Destroy(gameObject);
            }
        }

        public void SpawnUnit(GameObject unitPrefab)
        {
            if (SpawnPoint == null) return;
            
            GameObject unit = Instantiate(unitPrefab, SpawnPoint.position, SpawnPoint.rotation);
            UnitController ctrl = unit.GetComponent<UnitController>();
            
            // Assign Team
            var teamColor = unit.GetComponent<RTS.Visuals.TeamColor>();
            if (teamColor != null) 
            {
                teamColor.TeamID = this.TeamID;
                teamColor.ApplyColor();
            }

            // Register with Manager
            GameManager.Instance.RegisterUnit(ctrl, TeamID == 0);
        }
    }
}
