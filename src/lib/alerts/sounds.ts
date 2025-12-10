// Sound alert utilities

type SoundType = 'alert' | 'entry' | 'success' | 'error';

const SOUND_URLS: Record<SoundType, string> = {
  alert: '/sounds/alert.mp3',
  entry: '/sounds/entry.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
};

let audioContext: AudioContext | null = null;
const audioCache: Map<string, AudioBuffer> = new Map();

async function getAudioContext(): Promise<AudioContext> {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

async function loadSound(url: string): Promise<AudioBuffer | null> {
  if (audioCache.has(url)) {
    return audioCache.get(url)!;
  }

  try {
    const context = await getAudioContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    audioCache.set(url, audioBuffer);
    return audioBuffer;
  } catch (error) {
    console.warn(`Failed to load sound: ${url}`, error);
    return null;
  }
}

export async function playSound(type: SoundType, volume: number = 0.5) {
  const url = SOUND_URLS[type];
  const buffer = await loadSound(url);

  if (!buffer) {
    // Fallback to basic beep using Web Audio API
    playBeep(type === 'entry' ? 880 : 440, 200, volume);
    return;
  }

  try {
    const context = await getAudioContext();
    const source = context.createBufferSource();
    const gainNode = context.createGain();

    source.buffer = buffer;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(context.destination);

    source.start(0);
  } catch (error) {
    console.warn('Failed to play sound:', error);
  }
}

// Fallback beep sound
async function playBeep(
  frequency: number,
  duration: number,
  volume: number
) {
  try {
    const context = await getAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);

    gainNode.gain.setValueAtTime(volume, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      context.currentTime + duration / 1000
    );

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration / 1000);
  } catch (error) {
    console.warn('Failed to play beep:', error);
  }
}

export function preloadSounds() {
  Object.values(SOUND_URLS).forEach((url) => {
    loadSound(url).catch(() => {});
  });
}
