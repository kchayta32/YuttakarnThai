using UnityEngine;

namespace RTS.Systems
{
    public class AudioManager : MonoBehaviour
    {
        public static AudioManager Instance;

        [Header("Sources")]
        public AudioSource BGMSource;
        public AudioSource SFXSource;

        [Header("Clips")]
        public AudioClip DefaultBGM;
        public AudioClip DefeatSound;
        public AudioClip VictorySound;

        void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
            }
        }

        void Start()
        {
            if (DefaultBGM != null)
                PlayBGM(DefaultBGM);
        }

        public void PlayBGM(AudioClip clip)
        {
            if (BGMSource == null) return;
            BGMSource.clip = clip;
            BGMSource.loop = true;
            BGMSource.Play();
        }

        public void PlaySFX(AudioClip clip, float volume = 1.0f)
        {
            if (SFXSource == null || clip == null) return;
            SFXSource.PlayOneShot(clip, volume);
        }
    }
}
