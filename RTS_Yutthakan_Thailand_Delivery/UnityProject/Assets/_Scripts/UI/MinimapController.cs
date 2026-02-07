using UnityEngine;
using UnityEngine.UI;
using RTS.Core;

namespace RTS.UI
{
    public class MinimapController : MonoBehaviour
    {
        [Header("Minimap Setup")]
        public Camera MinimapCamera;
        public RawImage MinimapDisplay;
        public RectTransform ViewportIndicator;
        public float MapWorldSize = 500f;

        [Header("Unit Markers")]
        public GameObject FriendlyMarkerPrefab;
        public GameObject EnemyMarkerPrefab;
        public GameObject StructureMarkerPrefab;
        public Transform MarkerContainer;

        [Header("Colors")]
        public Color FriendlyColor = Color.green;
        public Color EnemyColor = Color.red;
        public Color StructureColor = Color.blue;
        public Color ViewportColor = Color.white;

        [Header("Settings")]
        public bool ClickToMove = true;
        public float MarkerUpdateInterval = 0.2f;

        private RenderTexture minimapTexture;
        private Camera mainCamera;
        private float lastMarkerUpdate;

        private void Start()
        {
            mainCamera = Camera.main;
            
            // Create render texture for minimap
            if (MinimapCamera != null)
            {
                minimapTexture = new RenderTexture(256, 256, 16);
                MinimapCamera.targetTexture = minimapTexture;
                
                if (MinimapDisplay != null)
                {
                    MinimapDisplay.texture = minimapTexture;
                }
            }

            // Setup viewport indicator
            if (ViewportIndicator != null)
            {
                var image = ViewportIndicator.GetComponent<Image>();
                if (image) image.color = ViewportColor;
            }
        }

        private void Update()
        {
            // Update viewport indicator position
            UpdateViewportIndicator();
            
            // Update unit markers periodically
            if (Time.time - lastMarkerUpdate > MarkerUpdateInterval)
            {
                UpdateUnitMarkers();
                lastMarkerUpdate = Time.time;
            }

            // Handle click to move
            if (ClickToMove && UnityEngine.Input.GetMouseButtonDown(0))
            {
                HandleMinimapClick();
            }
        }

        private void UpdateViewportIndicator()
        {
            if (ViewportIndicator == null || mainCamera == null) return;

            // Calculate viewport position on minimap
            Vector3 camPos = mainCamera.transform.position;
            
            float normalizedX = (camPos.x / MapWorldSize) + 0.5f;
            float normalizedY = (camPos.z / MapWorldSize) + 0.5f;

            // Convert to minimap UI coordinates
            RectTransform minimapRect = MinimapDisplay.rectTransform;
            float minimapWidth = minimapRect.rect.width;
            float minimapHeight = minimapRect.rect.height;

            ViewportIndicator.anchoredPosition = new Vector2(
                (normalizedX - 0.5f) * minimapWidth,
                (normalizedY - 0.5f) * minimapHeight
            );

            // Calculate viewport size based on camera frustum
            float camHeight = mainCamera.orthographicSize * 2f;
            float camWidth = camHeight * mainCamera.aspect;
            
            float viewportWidth = (camWidth / MapWorldSize) * minimapWidth;
            float viewportHeight = (camHeight / MapWorldSize) * minimapHeight;
            
            ViewportIndicator.sizeDelta = new Vector2(viewportWidth, viewportHeight);
        }

        private void UpdateUnitMarkers()
        {
            if (MarkerContainer == null) return;

            // Clear old markers
            foreach (Transform child in MarkerContainer)
            {
                Destroy(child.gameObject);
            }

            // Find all units and create markers
            var allUnits = FindObjectsOfType<UnitController>();
            foreach (var unit in allUnits)
            {
                CreateMarker(unit.transform.position, unit.GetComponent<RTS.Visuals.TeamColor>()?.TeamID == 0);
            }

            // Find all structures and create markers
            var allStructures = FindObjectsOfType<StructureController>();
            foreach (var structure in allStructures)
            {
                CreateStructureMarker(structure.transform.position, structure.TeamID == 0);
            }
        }

        private void CreateMarker(Vector3 worldPos, bool isFriendly)
        {
            if (MarkerContainer == null || MinimapDisplay == null) return;

            // Convert world position to minimap position
            float normalizedX = (worldPos.x / MapWorldSize) + 0.5f;
            float normalizedY = (worldPos.z / MapWorldSize) + 0.5f;

            // Create marker
            GameObject marker = new GameObject("UnitMarker");
            marker.transform.SetParent(MarkerContainer);
            
            var image = marker.AddComponent<Image>();
            image.color = isFriendly ? FriendlyColor : EnemyColor;
            
            var rectTransform = marker.GetComponent<RectTransform>();
            rectTransform.sizeDelta = new Vector2(4, 4);
            
            RectTransform minimapRect = MinimapDisplay.rectTransform;
            rectTransform.anchoredPosition = new Vector2(
                (normalizedX - 0.5f) * minimapRect.rect.width,
                (normalizedY - 0.5f) * minimapRect.rect.height
            );
        }

        private void CreateStructureMarker(Vector3 worldPos, bool isFriendly)
        {
            if (MarkerContainer == null || MinimapDisplay == null) return;

            float normalizedX = (worldPos.x / MapWorldSize) + 0.5f;
            float normalizedY = (worldPos.z / MapWorldSize) + 0.5f;

            GameObject marker = new GameObject("StructureMarker");
            marker.transform.SetParent(MarkerContainer);
            
            var image = marker.AddComponent<Image>();
            image.color = isFriendly ? FriendlyColor : EnemyColor;
            
            var rectTransform = marker.GetComponent<RectTransform>();
            rectTransform.sizeDelta = new Vector2(8, 8); // Larger for structures
            
            RectTransform minimapRect = MinimapDisplay.rectTransform;
            rectTransform.anchoredPosition = new Vector2(
                (normalizedX - 0.5f) * minimapRect.rect.width,
                (normalizedY - 0.5f) * minimapRect.rect.height
            );
        }

        private void HandleMinimapClick()
        {
            if (MinimapDisplay == null) return;

            // Check if click is on minimap
            RectTransform minimapRect = MinimapDisplay.rectTransform;
            Vector2 localPoint;
            
            if (RectTransformUtility.ScreenPointToLocalPointInRectangle(
                minimapRect, UnityEngine.Input.mousePosition, null, out localPoint))
            {
                // Check if within bounds
                if (Mathf.Abs(localPoint.x) <= minimapRect.rect.width / 2 &&
                    Mathf.Abs(localPoint.y) <= minimapRect.rect.height / 2)
                {
                    // Convert to world position
                    float normalizedX = (localPoint.x / minimapRect.rect.width) + 0.5f;
                    float normalizedY = (localPoint.y / minimapRect.rect.height) + 0.5f;
                    
                    float worldX = (normalizedX - 0.5f) * MapWorldSize;
                    float worldZ = (normalizedY - 0.5f) * MapWorldSize;
                    
                    // Move camera to clicked position
                    MoveCameraTo(new Vector3(worldX, mainCamera.transform.position.y, worldZ));
                }
            }
        }

        private void MoveCameraTo(Vector3 position)
        {
            if (mainCamera != null)
            {
                mainCamera.transform.position = position;
            }
        }

        private void OnDestroy()
        {
            if (minimapTexture != null)
            {
                minimapTexture.Release();
            }
        }
    }
}
