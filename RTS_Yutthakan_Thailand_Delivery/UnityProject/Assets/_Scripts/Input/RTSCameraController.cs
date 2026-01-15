using UnityEngine;

namespace RTS.Input
{
    public class RTSCameraController : MonoBehaviour
    {
        [Header("Movement")]
        public float PanSpeed = 20f;
        public float PanBorderThickness = 10f;
        public Vector2 PanLimitX = new Vector2(-50, 50);
        public Vector2 PanLimitZ = new Vector2(-50, 50);

        [Header("Zoom")]
        public float ZoomSpeed = 2000f; // Multiplied by deltaTime
        public float MinY = 10f;
        public float MaxY = 60f;

        void Update()
        {
            Vector3 pos = transform.position;

            // Pan Keys
            if (UnityEngine.Input.GetKey("w") || UnityEngine.Input.mousePosition.y >= Screen.height - PanBorderThickness)
            {
                pos.z += PanSpeed * Time.deltaTime;
            }
            if (UnityEngine.Input.GetKey("s") || UnityEngine.Input.mousePosition.y <= PanBorderThickness)
            {
                pos.z -= PanSpeed * Time.deltaTime;
            }
            if (UnityEngine.Input.GetKey("d") || UnityEngine.Input.mousePosition.x >= Screen.width - PanBorderThickness)
            {
                pos.x += PanSpeed * Time.deltaTime;
            }
            if (UnityEngine.Input.GetKey("a") || UnityEngine.Input.mousePosition.x <= PanBorderThickness)
            {
                pos.x -= PanSpeed * Time.deltaTime;
            }

            // Zoom
            float scroll = UnityEngine.Input.GetAxis("Mouse ScrollWheel");
            pos.y -= scroll * ZoomSpeed * Time.deltaTime;
            
            // Clamp Pos
            pos.x = Mathf.Clamp(pos.x, PanLimitX.x, PanLimitX.y);
            pos.z = Mathf.Clamp(pos.z, PanLimitZ.x, PanLimitZ.y);
            pos.y = Mathf.Clamp(pos.y, MinY, MaxY);

            transform.position = pos;
        }
    }
}
