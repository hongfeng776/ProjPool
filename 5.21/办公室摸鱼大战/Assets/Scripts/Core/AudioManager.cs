using UnityEngine;

namespace OfficeFishing.Core
{
    public class AudioManager : Singleton<AudioManager>
    {
        [Header("Audio Sources")]
        public AudioSource musicSource;
        public AudioSource sfxSource;

        [Header("Default Clips")]
        public AudioClip mainMenuMusic;
        public AudioClip gameMusic;
        public AudioClip buttonClickSfx;

        private float _musicVolume = 0.8f;
        private float _sfxVolume = 1.0f;

        public float MusicVolume
        {
            get => _musicVolume;
            set
            {
                _musicVolume = Mathf.Clamp01(value);
                if (musicSource != null)
                {
                    musicSource.volume = _musicVolume;
                }
            }
        }

        public float SFXVolume
        {
            get => _sfxVolume;
            set
            {
                _sfxVolume = Mathf.Clamp01(value);
                if (sfxSource != null)
                {
                    sfxSource.volume = _sfxVolume;
                }
            }
        }

        public void PlayMusic(AudioClip clip, bool loop = true)
        {
            if (musicSource == null || clip == null) return;

            musicSource.clip = clip;
            musicSource.loop = loop;
            musicSource.volume = _musicVolume;
            musicSource.Play();
        }

        public void StopMusic()
        {
            if (musicSource != null)
            {
                musicSource.Stop();
            }
        }

        public void PauseMusic()
        {
            if (musicSource != null)
            {
                musicSource.Pause();
            }
        }

        public void ResumeMusic()
        {
            if (musicSource != null)
            {
                musicSource.UnPause();
            }
        }

        public void PlaySFX(AudioClip clip)
        {
            if (sfxSource == null || clip == null) return;

            sfxSource.PlayOneShot(clip, _sfxVolume);
        }

        public void PlayButtonClick()
        {
            if (buttonClickSfx != null)
            {
                PlaySFX(buttonClickSfx);
            }
        }

        public void PlayMainMenuMusic()
        {
            if (mainMenuMusic != null)
            {
                PlayMusic(mainMenuMusic);
            }
        }

        public void PlayGameMusic()
        {
            if (gameMusic != null)
            {
                PlayMusic(gameMusic);
            }
        }
    }
}
