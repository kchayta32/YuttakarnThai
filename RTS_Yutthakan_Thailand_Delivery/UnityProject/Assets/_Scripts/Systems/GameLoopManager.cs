using UnityEngine;
using RTS.Core;

namespace RTS.Systems
{
    public class GameLoopManager : MonoBehaviour
    {
        public static GameLoopManager Instance;

        [Header("UI")]
        public GameObject VictoryScreen;
        public GameObject DefeatScreen;

        [Header("Conditions")]
        public StructureController PlayerHQ;

        private bool isGameOver = false;

        void Awake()
        {
            Instance = this;
        }

        void Start()
        {
            if (VictoryScreen) VictoryScreen.SetActive(false);
            if (DefeatScreen) DefeatScreen.SetActive(false);
        }

        void Update()
        {
            if (isGameOver) return;

            // Check Defeat (HQ Destroyed)
            if (PlayerHQ == null)
            {
                GameOver(false);
            }
            
            // Check Victory (Example: No enemies left)
            // In real game, this would check specific Objective Manager
            // For prototype: If GameTime > 5 mins -> Win? Or check Enemy Count?
            // Let's rely on manual trigger or objective completion for now.
        }

        public void TriggerVictory()
        {
            GameOver(true);
        }

        public void TriggerDefeat()
        {
            GameOver(false);
        }

        void GameOver(bool victory)
        {
            isGameOver = true;
            Time.timeScale = 0; // Pause Game

            if (victory)
            {
                if (VictoryScreen) VictoryScreen.SetActive(true);
                AudioManager.Instance.PlayBGM(AudioManager.Instance.VictorySound);
            }
            else
            {
                if (DefeatScreen) DefeatScreen.SetActive(true);
                AudioManager.Instance.PlayBGM(AudioManager.Instance.DefeatSound);
            }
        }
    }
}
