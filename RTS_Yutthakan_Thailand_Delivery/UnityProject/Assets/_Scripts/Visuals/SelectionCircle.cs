using UnityEngine;
using RTS.Core;

namespace RTS.Visuals
{
    [RequireComponent(typeof(LineRenderer))]
    public class SelectionCircle : MonoBehaviour
    {
        public UnitController unit;
        public int segments = 32;
        public float radius = 1.0f;
        
        private LineRenderer line;

        void Awake()
        {
            line = GetComponent<LineRenderer>();
            line.positionCount = segments + 1;
            line.useWorldSpace = false;
            line.loop = true;
            line.enabled = false;
        }

        void Start()
        {
            CreateCircle();
        }

        void Update()
        {
            if (unit != null)
                line.enabled = unit.IsSelected;
        }

        void CreateCircle()
        {
            float angle = 0f;
            for (int i = 0; i <= segments; i++)
            {
                float x = Mathf.Sin(Mathf.Deg2Rad * angle) * radius;
                float z = Mathf.Cos(Mathf.Deg2Rad * angle) * radius;
                
                line.SetPosition(i, new Vector3(x, 0.1f, z));
                
                angle += (360f / segments);
            }
        }
    }
}
