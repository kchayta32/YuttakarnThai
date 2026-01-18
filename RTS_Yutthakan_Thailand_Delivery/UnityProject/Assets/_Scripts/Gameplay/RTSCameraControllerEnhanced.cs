using UnityEngine;

/// <summary>
/// RTS Camera Controller - Enhanced Version
/// ควบคุมกล้องสำหรับเกม RTS สไตล์ไทย
/// 
/// Features:
/// - WASD / Arrow Keys to pan
/// - Mouse edge scrolling
/// - Mouse wheel zoom
/// - Middle mouse drag to pan
/// - Q/E to rotate camera
/// - Double-click to focus on unit
/// </summary>
public class RTSCameraControllerEnhanced : MonoBehaviour
{
    [Header("Movement Settings")]
    [Tooltip("ความเร็วการเลื่อนกล้อง")]
    public float panSpeed = 35f;
    
    [Tooltip("ความหนาขอบจอสำหรับ mouse scrolling")]
    public float edgeScrollThreshold = 15f;
    
    [Tooltip("เปิด/ปิด edge scrolling")]
    public bool enableEdgeScroll = true;
    
    [Header("Zoom Settings")]
    [Tooltip("ความเร็ว zoom")]
    public float zoomSpeed = 15f;
    
    [Tooltip("ความสูงต่ำสุด")]
    public float minHeight = 15f;
    
    [Tooltip("ความสูงสูงสุด")]
    public float maxHeight = 80f;
    
    [Header("Rotation Settings")]
    [Tooltip("ความเร็วหมุนกล้อง")]
    public float rotateSpeed = 100f;
    
    [Header("Bounds")]
    [Tooltip("ขอบเขตแกน X")]
    public Vector2 boundsX = new Vector2(-100, 100);
    
    [Tooltip("ขอบเขตแกน Z")]
    public Vector2 boundsZ = new Vector2(-100, 100);
    
    [Header("Smoothing")]
    [Tooltip("ความ smooth ของการเคลื่อนที่")]
    public float smoothness = 8f;
    
    // Private variables
    private Vector3 targetPosition;
    private float targetRotation;
    private Vector3 lastMousePosition;
    private bool isDragging;
    
    void Start()
    {
        targetPosition = transform.position;
        targetRotation = transform.eulerAngles.y;
    }
    
    void Update()
    {
        HandleKeyboardInput();
        HandleMouseEdgeScroll();
        HandleMiddleMouseDrag();
        HandleZoom();
        HandleRotation();
        
        ApplyMovement();
    }
    
    void HandleKeyboardInput()
    {
        Vector3 direction = Vector3.zero;
        
        // Forward/Backward
        if (Input.GetKey(KeyCode.W) || Input.GetKey(KeyCode.UpArrow))
            direction += GetForward();
        if (Input.GetKey(KeyCode.S) || Input.GetKey(KeyCode.DownArrow))
            direction -= GetForward();
        
        // Left/Right
        if (Input.GetKey(KeyCode.A) || Input.GetKey(KeyCode.LeftArrow))
            direction -= GetRight();
        if (Input.GetKey(KeyCode.D) || Input.GetKey(KeyCode.RightArrow))
            direction += GetRight();
        
        targetPosition += direction.normalized * panSpeed * Time.deltaTime;
    }
    
    void HandleMouseEdgeScroll()
    {
        if (!enableEdgeScroll) return;
        
        Vector3 mousePos = Input.mousePosition;
        Vector3 direction = Vector3.zero;
        
        // Top edge
        if (mousePos.y >= Screen.height - edgeScrollThreshold)
            direction += GetForward();
        // Bottom edge
        if (mousePos.y <= edgeScrollThreshold)
            direction -= GetForward();
        // Right edge
        if (mousePos.x >= Screen.width - edgeScrollThreshold)
            direction += GetRight();
        // Left edge
        if (mousePos.x <= edgeScrollThreshold)
            direction -= GetRight();
        
        targetPosition += direction.normalized * panSpeed * Time.deltaTime;
    }
    
    void HandleMiddleMouseDrag()
    {
        // Start drag
        if (Input.GetMouseButtonDown(2))
        {
            isDragging = true;
            lastMousePosition = Input.mousePosition;
        }
        
        // End drag
        if (Input.GetMouseButtonUp(2))
        {
            isDragging = false;
        }
        
        // Dragging
        if (isDragging)
        {
            Vector3 delta = Input.mousePosition - lastMousePosition;
            
            targetPosition -= GetRight() * delta.x * panSpeed * 0.01f;
            targetPosition -= GetForward() * delta.y * panSpeed * 0.01f;
            
            lastMousePosition = Input.mousePosition;
        }
    }
    
    void HandleZoom()
    {
        float scroll = Input.GetAxis("Mouse ScrollWheel");
        
        if (Mathf.Abs(scroll) > 0.01f)
        {
            targetPosition.y -= scroll * zoomSpeed;
            targetPosition.y = Mathf.Clamp(targetPosition.y, minHeight, maxHeight);
        }
    }
    
    void HandleRotation()
    {
        // Q/E rotation
        if (Input.GetKey(KeyCode.Q))
            targetRotation -= rotateSpeed * Time.deltaTime;
        if (Input.GetKey(KeyCode.E))
            targetRotation += rotateSpeed * Time.deltaTime;
    }
    
    void ApplyMovement()
    {
        // Clamp position
        targetPosition.x = Mathf.Clamp(targetPosition.x, boundsX.x, boundsX.y);
        targetPosition.z = Mathf.Clamp(targetPosition.z, boundsZ.x, boundsZ.y);
        
        // Smooth movement
        transform.position = Vector3.Lerp(transform.position, targetPosition, Time.deltaTime * smoothness);
        
        // Smooth rotation
        Vector3 euler = transform.eulerAngles;
        euler.y = Mathf.LerpAngle(euler.y, targetRotation, Time.deltaTime * smoothness);
        transform.eulerAngles = euler;
    }
    
    Vector3 GetForward()
    {
        Vector3 forward = transform.forward;
        forward.y = 0;
        return forward.normalized;
    }
    
    Vector3 GetRight()
    {
        Vector3 right = transform.right;
        right.y = 0;
        return right.normalized;
    }
    
    /// <summary>
    /// Focus camera on a specific position
    /// </summary>
    public void FocusOn(Vector3 position)
    {
        targetPosition = new Vector3(position.x, targetPosition.y, position.z - 20);
    }
    
    /// <summary>
    /// Set camera bounds based on map size
    /// </summary>
    public void SetBounds(float mapSize)
    {
        float half = mapSize / 2f;
        boundsX = new Vector2(-half, half);
        boundsZ = new Vector2(-half, half);
    }
}
