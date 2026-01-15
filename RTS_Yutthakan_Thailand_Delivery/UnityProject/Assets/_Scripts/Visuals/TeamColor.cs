using UnityEngine;
using RTS.Core;

namespace RTS.Visuals
{
    [RequireComponent(typeof(UnitController))]
    public class TeamColor : MonoBehaviour
    {
        public int TeamID = 0; // 0 = Player (Blue), 1 = Enemy (Red)
        public Renderer[] renderersToColor;

        void Start()
        {
            ApplyColor();
        }

        public void ApplyColor()
        {
            Color teamColor = (TeamID == 0) ? Color.blue : Color.red;
            
            foreach (var r in renderersToColor)
            {
                r.material.color = teamColor;
            }
        }
    }
}
