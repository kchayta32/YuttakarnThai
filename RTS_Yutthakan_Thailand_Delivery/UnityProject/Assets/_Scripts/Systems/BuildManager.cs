using UnityEngine;
using RTS.Core;

namespace RTS.Systems
{
    public class BuildManager : MonoBehaviour
    {
        public static BuildManager Instance;
        
        [Header("Settings")]
        public LayerMask GroundLayer;
        public Material GhostMaterialValid;
        public Material GhostMaterialInvalid;
        
        private GameObject currentGhost;
        private GameObject objectToBuild;
        private int currentCostRice;
        private int currentCostSupplies;
        private bool canBuild;

        void Awake()
        {
            Instance = this;
        }

        public void EnterBuildMode(GameObject prefab, int rice, int supplies)
        {
            if (currentGhost != null) Destroy(currentGhost);

            objectToBuild = prefab;
            currentCostRice = rice;
            currentCostSupplies = supplies;

            currentGhost = Instantiate(prefab);
            
            // Strip logic components from ghost
            Destroy(currentGhost.GetComponent<StructureController>());
            Destroy(currentGhost.GetComponent<UnityEngine.AI.NavMeshObstacle>());
            
            // Apply Ghost Material
            foreach(var r in currentGhost.GetComponentsInChildren<Renderer>())
            {
                r.material = GhostMaterialValid; // Simplified: Assuming material swap works
            }
        }

        void Update()
        {
            if (currentGhost == null) return;

            // Follow Mouse
            Ray ray = Camera.main.ScreenPointToRay(UnityEngine.Input.mousePosition);
            if (Physics.Raycast(ray, out RaycastHit hit, 1000f, GroundLayer))
            {
                currentGhost.transform.position = hit.point;
                
                // Placement Click
                if (UnityEngine.Input.GetMouseButtonDown(0))
                {
                    if (ResourceManager.Instance.CanAfford(currentCostRice, currentCostSupplies, 0))
                    {
                        PlaceBuilding(hit.point);
                    }
                    else
                    {
                        Debug.Log("Not Enough Resources!");
                    }
                }
                
                // Cancel
                if (UnityEngine.Input.GetMouseButtonDown(1))
                {
                    CancelBuild();
                }
            }
        }

        void PlaceBuilding(Vector3 position)
        {
            ResourceManager.Instance.SpendResources(currentCostRice, currentCostSupplies, 0);
            Instantiate(objectToBuild, position, Quaternion.identity);
            CancelBuild();
        }

        void CancelBuild()
        {
            if (currentGhost != null) Destroy(currentGhost);
            objectToBuild = null;
        }

        public void BuildStructureImmediate(GameObject prefab, Vector3 position, int teamID)
        {
            GameObject building = Instantiate(prefab, position, Quaternion.identity);
            
            // Set Team
            var structure = building.GetComponent<RTS.Core.StructureController>();
            if (structure != null) structure.TeamID = teamID;

            var teamColor = building.GetComponent<RTS.Visuals.TeamColor>();
            if (teamColor != null) 
            {
                teamColor.TeamID = teamID;
                teamColor.ApplyColor();
            }
        }
    }
}
