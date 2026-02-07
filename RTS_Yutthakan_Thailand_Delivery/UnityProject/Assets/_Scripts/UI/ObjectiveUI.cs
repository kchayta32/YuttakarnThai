using UnityEngine;
using TMPro;
using RTS.Systems.Objectives;

namespace RTS.UI
{
    public class ObjectiveUI : MonoBehaviour
    {
        public TextMeshProUGUI ObjectiveText;

        void Update()
        {
            if (ObjectiveManager.Instance == null || ObjectiveText == null) return;

            string text = "<b>Objectives:</b>\n";
            
            foreach(var obj in ObjectiveManager.Instance.Objectives)
            {
                string status = obj.IsCompleted ? "<color=green>[Completed]</color>" : "[-]";
                if (obj.IsFailed) status = "<color=red>[Failed]</color>";
                
                text += $"{status} {obj.Description}\n";
            }

            ObjectiveText.text = text;
        }
    }
}
