using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections.Generic;

/// <summary>
/// Unit Selection Manager - RTS Style
/// คลิกเลือก Units + Box Selection + Move Command
/// </summary>
public class UnitSelectionManager : MonoBehaviour
{
    [Header("Selection Settings")]
    public LayerMask selectableLayer = -1;
    public LayerMask groundLayer = -1;
    public Color selectionBoxColor = new Color(0.3f, 0.8f, 0.3f, 0.3f);
    public Color selectionBorderColor = new Color(0.2f, 1f, 0.2f, 0.8f);
    
    [Header("Visual Feedback")]
    public GameObject moveIndicatorPrefab;
    
    // Selection
    private List<GameObject> selectedUnits = new List<GameObject>();
    private bool isBoxSelecting = false;
    private Vector3 boxStartPos;
    private Rect selectionRect;
    
    // GUI
    private Texture2D boxTexture;
    private Texture2D borderTexture;
    
    void Start()
    {
        // Create textures for selection box
        boxTexture = new Texture2D(1, 1);
        boxTexture.SetPixel(0, 0, selectionBoxColor);
        boxTexture.Apply();
        
        borderTexture = new Texture2D(1, 1);
        borderTexture.SetPixel(0, 0, selectionBorderColor);
        borderTexture.Apply();
        
        // Set ground layer if not set
        if (groundLayer == 0)
        {
            groundLayer = LayerMask.GetMask("Default");
        }
    }
    
    void Update()
    {
        HandleSelection();
        HandleMovement();
    }
    
    void HandleSelection()
    {
        // Start box selection
        if (Input.GetMouseButtonDown(0))
        {
            boxStartPos = Input.mousePosition;
            isBoxSelecting = true;
            
            // Single click selection
            if (!Input.GetKey(KeyCode.LeftShift))
            {
                DeselectAll();
            }
            
            TrySelectSingle();
        }
        
        // Drawing selection box
        if (Input.GetMouseButton(0) && isBoxSelecting)
        {
            UpdateSelectionRect();
        }
        
        // End box selection
        if (Input.GetMouseButtonUp(0) && isBoxSelecting)
        {
            isBoxSelecting = false;
            SelectUnitsInBox();
        }
    }
    
    void HandleMovement()
    {
        // Right click to move
        if (Input.GetMouseButtonDown(1) && selectedUnits.Count > 0)
        {
            Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
            RaycastHit hit;
            
            if (Physics.Raycast(ray, out hit, 500f, groundLayer))
            {
                MoveUnitsTo(hit.point);
                ShowMoveIndicator(hit.point);
            }
        }
    }
    
    void TrySelectSingle()
    {
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        RaycastHit hit;
        
        if (Physics.Raycast(ray, out hit, 500f))
        {
            // Check if hit a unit
            var unit = hit.collider.GetComponent<SelectableUnit>();
            if (unit != null)
            {
                SelectUnit(unit.gameObject);
            }
        }
    }
    
    void UpdateSelectionRect()
    {
        Vector3 currentPos = Input.mousePosition;
        
        float minX = Mathf.Min(boxStartPos.x, currentPos.x);
        float maxX = Mathf.Max(boxStartPos.x, currentPos.x);
        float minY = Mathf.Min(boxStartPos.y, currentPos.y);
        float maxY = Mathf.Max(boxStartPos.y, currentPos.y);
        
        selectionRect = new Rect(minX, Screen.height - maxY, maxX - minX, maxY - minY);
    }
    
    void SelectUnitsInBox()
    {
        // Only if box is larger than 5 pixels
        if (selectionRect.width < 5 || selectionRect.height < 5) return;
        
        // Find all selectable units
        var allUnits = FindObjectsOfType<SelectableUnit>();
        
        foreach (var unit in allUnits)
        {
            Vector3 screenPos = Camera.main.WorldToScreenPoint(unit.transform.position);
            screenPos.y = Screen.height - screenPos.y; // Flip Y
            
            if (selectionRect.Contains(screenPos))
            {
                SelectUnit(unit.gameObject);
            }
        }
    }
    
    void SelectUnit(GameObject unit)
    {
        if (!selectedUnits.Contains(unit))
        {
            selectedUnits.Add(unit);
            
            // Show selection visual
            var selectable = unit.GetComponent<SelectableUnit>();
            if (selectable != null)
            {
                selectable.SetSelected(true);
            }
            
            // Enable selection circle
            var circle = unit.transform.Find("SelectionCircle");
            if (circle != null)
            {
                circle.gameObject.SetActive(true);
            }
        }
    }
    
    void DeselectAll()
    {
        foreach (var unit in selectedUnits)
        {
            if (unit != null)
            {
                var selectable = unit.GetComponent<SelectableUnit>();
                if (selectable != null)
                {
                    selectable.SetSelected(false);
                }
                
                var circle = unit.transform.Find("SelectionCircle");
                if (circle != null)
                {
                    circle.gameObject.SetActive(false);
                }
            }
        }
        selectedUnits.Clear();
    }
    
    void MoveUnitsTo(Vector3 destination)
    {
        int count = selectedUnits.Count;
        int cols = Mathf.CeilToInt(Mathf.Sqrt(count));
        float spacing = 3f;
        
        for (int i = 0; i < selectedUnits.Count; i++)
        {
            if (selectedUnits[i] == null) continue;
            
            int row = i / cols;
            int col = i % cols;
            
            Vector3 offset = new Vector3(
                (col - cols / 2f) * spacing,
                0,
                (row - count / cols / 2f) * spacing
            );
            
            Vector3 targetPos = destination + offset;
            
            // Move unit (simple direct move for demo)
            var mover = selectedUnits[i].GetComponent<SimpleUnitMover>();
            if (mover != null)
            {
                mover.MoveTo(targetPos);
            }
            else
            {
                // Add mover if not exists
                mover = selectedUnits[i].AddComponent<SimpleUnitMover>();
                mover.MoveTo(targetPos);
            }
        }
    }
    
    void ShowMoveIndicator(Vector3 position)
    {
        // Create simple indicator
        GameObject indicator = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        indicator.name = "MoveIndicator";
        indicator.transform.position = position + Vector3.up * 0.1f;
        indicator.transform.localScale = new Vector3(2, 0.1f, 2);
        
        var renderer = indicator.GetComponent<Renderer>();
        var mat = new Material(Shader.Find("Standard"));
        mat.color = new Color(0, 1, 0, 0.5f);
        renderer.material = mat;
        
        Destroy(indicator.GetComponent<Collider>());
        Destroy(indicator, 1f);
    }
    
    void OnGUI()
    {
        if (isBoxSelecting && selectionRect.width > 5 && selectionRect.height > 5)
        {
            // Draw selection box fill
            GUI.DrawTexture(selectionRect, boxTexture);
            
            // Draw border
            GUI.DrawTexture(new Rect(selectionRect.x, selectionRect.y, selectionRect.width, 2), borderTexture);
            GUI.DrawTexture(new Rect(selectionRect.x, selectionRect.y + selectionRect.height - 2, selectionRect.width, 2), borderTexture);
            GUI.DrawTexture(new Rect(selectionRect.x, selectionRect.y, 2, selectionRect.height), borderTexture);
            GUI.DrawTexture(new Rect(selectionRect.x + selectionRect.width - 2, selectionRect.y, 2, selectionRect.height), borderTexture);
        }
    }
}

/// <summary>
/// Simple Unit Mover - Smooth movement to target
/// </summary>
public class SimpleUnitMover : MonoBehaviour
{
    public float moveSpeed = 8f;
    private Vector3 targetPosition;
    private bool isMoving = false;
    
    public void MoveTo(Vector3 position)
    {
        targetPosition = position;
        targetPosition.y = transform.position.y;
        isMoving = true;
    }
    
    void Update()
    {
        if (isMoving)
        {
            Vector3 direction = targetPosition - transform.position;
            direction.y = 0;
            
            if (direction.magnitude < 0.5f)
            {
                isMoving = false;
                return;
            }
            
            // Rotate towards target
            transform.rotation = Quaternion.Slerp(
                transform.rotation,
                Quaternion.LookRotation(direction),
                Time.deltaTime * 10f
            );
            
            // Move
            transform.position += direction.normalized * moveSpeed * Time.deltaTime;
        }
    }
}

/// <summary>
/// Selectable Unit Component - Add to all units
/// </summary>
public class SelectableUnit : MonoBehaviour
{
    public bool isSelected = false;
    public string teamId = "Thai";
    
    public void SetSelected(bool selected)
    {
        isSelected = selected;
    }
}
