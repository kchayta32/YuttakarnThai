using UnityEngine;
using UnityEngine.SceneManagement;

namespace RTS.UI
{
    public class MainMenuController : MonoBehaviour
    {
        public string GameplaySceneName = "Prototype_WWI";

        public void OnClickStart()
        {
            SceneManager.LoadScene(GameplaySceneName);
        }

        public void OnClickQuit()
        {
            Application.Quit();
        }
    }
}
