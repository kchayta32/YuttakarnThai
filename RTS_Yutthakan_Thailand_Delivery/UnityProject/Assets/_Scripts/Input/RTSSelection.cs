using UnityEngine;
using System.Collections.Generic;
using RTS.Core;

namespace RTS.Input
{
    public class RTSSelection : MonoBehaviour
    {
        public LayerMask UnitLayer;
        public LayerMask GroundLayer;
        
        private List<UnitController> selectedUnits = new List<UnitController>();
        private Dictionary<int, List<UnitController>> controlGroups = new Dictionary<int, List<UnitController>>();

        void Update()
        {
            HandleSelection();
            HandleCommands();
            HandleControlGroups();
        }

        void HandleSelection()
        {
            if (UnityEngine.Input.GetMouseButtonDown(0))
            {
                Ray ray = Camera.main.ScreenPointToRay(UnityEngine.Input.mousePosition);
                if (Physics.Raycast(ray, out RaycastHit hit, 1000f, UnitLayer))
                {
                    UnitController unit = hit.collider.GetComponent<UnitController>();
                    if (unit != null)
                    {
                        // Shift to Add
                        if (!UnityEngine.Input.GetKey(KeyCode.LeftShift))
                        {
                            DeselectAll();
                        }
                        SelectUnit(unit);
                    }
                }
                else
                {
                    // Clicked Ground -> Deselect
                    if (!UnityEngine.Input.GetKey(KeyCode.LeftShift))
                        DeselectAll();
                }
            }
            
            // Note: Drag selection requires GUI drawing, omitted for brevity but logic is similar.
        }

        void HandleCommands()
        {
            if (UnityEngine.Input.GetMouseButtonDown(1) && selectedUnits.Count > 0)
            {
                Ray ray = Camera.main.ScreenPointToRay(UnityEngine.Input.mousePosition);
                if (Physics.Raycast(ray, out RaycastHit hit, 1000f))
                {
                    UnitController targetInfo = hit.collider.GetComponent<UnitController>();
                    
                    foreach (var unit in selectedUnits)
                    {
                        if (targetInfo != null && targetInfo != unit)
                        {
                            unit.AttackTarget(targetInfo.transform);
                        }
                        else
                        {
                            unit.MoveTo(hit.point);
                        }
                    }
                }
            }
        }
        
        void HandleControlGroups()
        {
            for (int i = 0; i <= 9; i++)
            {
                KeyCode key = (KeyCode)((int)KeyCode.Alpha0 + i);
                if (UnityEngine.Input.GetKeyDown(key))
                {
                    if (UnityEngine.Input.GetKey(KeyCode.LeftControl))
                    {
                        // Save Group
                        controlGroups[i] = new List<UnitController>(selectedUnits);
                        Debug.Log($"Saved Group {i}");
                    }
                    else
                    {
                        // Load Group
                        if (controlGroups.ContainsKey(i))
                        {
                            DeselectAll();
                            foreach (var u in controlGroups[i])
                            {
                                if (u != null) SelectUnit(u);
                            }
                        }
                    }
                }
            }
        }

        void SelectUnit(UnitController unit)
        {
            if (!selectedUnits.Contains(unit))
            {
                selectedUnits.Add(unit);
                unit.SetSelected(true);
            }
        }

        void DeselectAll()
        {
            foreach (var unit in selectedUnits)
            {
                if (unit != null) unit.SetSelected(false);
            }
            selectedUnits.Clear();
        }
    }
}
