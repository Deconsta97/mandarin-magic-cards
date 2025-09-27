import { useCallback } from 'react';

interface UseSoundReturn {
  playHanziSound: (hanzi: string) => void;
  playWordSound: (hanzi: string) => void;
  playCelebrationSound: () => void;
  playLevelUpSound: () => void;
}

// Global audio registry to track all playing audio instances
class AudioManager {
  private static instance: AudioManager;
  private playingAudio: Set<HTMLAudioElement> = new Set();

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  addAudio(audio: HTMLAudioElement): void {
    this.playingAudio.add(audio);
    
    // Automatically remove from registry when audio ends or errors
    const cleanup = () => {
      this.playingAudio.delete(audio);
      audio.removeEventListener('ended', cleanup);
      audio.removeEventListener('error', cleanup);
      audio.removeEventListener('pause', cleanup);
    };
    
    audio.addEventListener('ended', cleanup);
    audio.addEventListener('error', cleanup);
    audio.addEventListener('pause', cleanup);
  }

  stopAllAudio(): void {
    this.playingAudio.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        // Ignore errors when stopping audio
      }
    });
    this.playingAudio.clear();
  }
}

export function useSound(soundEnabled: boolean = true): UseSoundReturn {
  const audioManager = AudioManager.getInstance();
  
  // Helper function to URL encode hanzi characters to UTF-8
  const encodeHanziToUtf8 = (hanzi: string): string => {
    return encodeURIComponent(hanzi);
  };
  
  const playHanziSound = useCallback((hanzi: string) => {
    // Early return if sound is disabled
    if (!soundEnabled) return;
    
    // Stop all currently playing audio
    audioManager.stopAllAudio();
    
    try {
      // Construct the audio URL using UTF-8 encoded hanzi
      const encodedHanzi = encodeHanziToUtf8(hanzi);
      const audioUrl = `https://app.ninchanese.com/voices/default/tts/${encodedHanzi}.mp3`;
      
      // Create and play the audio
      const audio = new Audio(audioUrl);
      audio.volume = 0.7; // Set volume to 70%
      
      // Register audio with manager
      audioManager.addAudio(audio);
      
      // Play the audio and handle potential errors
      audio.play().catch((error) => {
        // Silently handle errors (network issues, audio format not supported, etc.)
        console.warn('Failed to play audio for:', hanzi, error);
      });
    } catch (error) {
      // Handle any other errors
      console.warn('Error creating audio for:', hanzi, error);
    }
  }, [soundEnabled, audioManager]);

  // Helper function for sequential character playback
  const playSequentialCharacters = useCallback((hanzi: string) => {
    const characters = hanzi.split('');
    
    const playSequentially = async (index: number) => {
      if (index >= characters.length) {
        return;
      }
      
      const char = characters[index];

      try {
        // Create audio element using UTF-8 encoded hanzi
        const encodedHanzi = encodeHanziToUtf8(char);
        const audioUrl = `https://app.ninchanese.com/voices/default/tts/${encodedHanzi}.mp3`;
        const audio = new Audio(audioUrl);
        audio.volume = 0.7;

        // Register audio with manager
        audioManager.addAudio(audio);

        // Wait for audio to end, then immediately play next
        audio.addEventListener('ended', () => {
          playSequentially(index + 1);
        });

        // Handle errors and continue to next character
        audio.addEventListener('error', () => {
          console.warn('Failed to play audio for:', char);
          playSequentially(index + 1);
        });

        // Start playing
        audio.play().catch((error) => {
          console.warn('Failed to play audio for:', char, error);
          playSequentially(index + 1);
        });
      } catch (error) {
        console.warn('Error creating audio for:', char, error);
        playSequentially(index + 1);
      }
    };

    // Start the sequential playback
    playSequentially(0);
  }, [audioManager]);

  const playWordSound = useCallback((hanzi: string) => {
    // Early return if sound is disabled
    if (!soundEnabled) return;
    
    // Stop all currently playing audio
    audioManager.stopAllAudio();
    
    if (hanzi.length === 1) {
      // For single characters, play immediately
      playHanziSound(hanzi);
      return;
    }

    // For multi-character words, first try to play the complete word
    try {
      const encodedHanzi = encodeHanziToUtf8(hanzi);
      const audioUrl = `https://app.ninchanese.com/voices/default/tts/${encodedHanzi}.mp3`;
      const audio = new Audio(audioUrl);
      audio.volume = 0.7;

      // Track if we've already fallen back to prevent duplicate playback
      let hasFallenBack = false;

      const fallbackToSequential = () => {
        if (!hasFallenBack) {
          hasFallenBack = true;
          console.warn('Complete word audio not available for:', hanzi, 'falling back to sequential playback');
          playSequentialCharacters(hanzi);
        }
      };

      // Register audio with manager
      audioManager.addAudio(audio);

      // Handle audio loading errors
      audio.addEventListener('error', fallbackToSequential);

      // Try to play the complete word audio
      audio.play().then(() => {
        // Success - the complete word audio is available and playing
      }).catch((error) => {
        fallbackToSequential();
      });

    } catch (error) {
      console.warn('Error creating complete word audio for:', hanzi, error);
      // Fallback to sequential character playback
      playSequentialCharacters(hanzi);
    }
  }, [soundEnabled, audioManager, playHanziSound, playSequentialCharacters]);

  const playCelebrationSound = useCallback(() => {
    // Early return if sound is disabled
    if (!soundEnabled) return;
    
    // Stop all currently playing audio before celebration
    audioManager.stopAllAudio();
    
    try {
      // Play the celebration sound
      const audioUrl = 'https://www.myinstants.com/media/sounds/rightanswer.mp3';
      const audio = new Audio(audioUrl);
      audio.volume = 0.8; // Slightly louder for celebration
      
      // Register audio with manager
      audioManager.addAudio(audio);
      
      // Play the audio and handle potential errors
      audio.play().catch((error) => {
        // Silently handle errors (network issues, audio format not supported, etc.)
        console.warn('Failed to play celebration sound:', error);
      });
    } catch (error) {
      // Handle any other errors
      console.warn('Error creating celebration audio:', error);
    }
  }, [soundEnabled, audioManager]);

  const playLevelUpSound = useCallback(() => {
    // Early return if sound is disabled
    if (!soundEnabled) return;
    
    // Stop all currently playing audio before level up celebration
    audioManager.stopAllAudio();
    
    try {
      // Play the level up sound
      const audioUrl = 'https://www.myinstants.com/media/sounds/correcto-100-mexicanos-dijeron.mp3';
      const audio = new Audio(audioUrl);
      audio.volume = 0.9; // Even louder for level up
      
      // Register audio with manager
      audioManager.addAudio(audio);
      
      // Play the audio and handle potential errors
      audio.play().catch((error) => {
        // Silently handle errors (network issues, audio format not supported, etc.)
        console.warn('Failed to play level up sound:', error);
      });
    } catch (error) {
      // Handle any other errors
      console.warn('Error creating level up audio:', error);
    }
  }, [soundEnabled, audioManager]);

  return {
    playHanziSound,
    playWordSound,
    playCelebrationSound,
    playLevelUpSound
  };
}