using UnityEngine;
using UnityEngine.UI;
using RTS.Core;

namespace RTS.Visuals
{
    public class HealthBar : MonoBehaviour
    {
        public UnitController targetUnit;
        public Image fillImage;
        public Canvas canvas;

        void Start()
        {
            if (canvas != null)
                canvas.worldCamera = Camera.main;
        }

        void LateUpdate()
        {
            if (targetUnit == null)
            {
                Destroy(gameObject);
                return;
            }

            // Billboard effect: Face camera
            transform.LookAt(transform.position + Camera.main.transform.rotation * Vector3.forward,
                             Camera.main.transform.rotation * Vector3.up);

            // Update Fill
            if (fillImage != null)
            {
                fillImage.fillAmount = targetUnit.CurrentHP / targetUnit.MaxHP;
            }
        }
    }
}
