import os
import numpy as np
from scipy.io import wavfile

OUT_DIR = "video/06_music_sfx"
os.makedirs(OUT_DIR, exist_ok=True)
SAMPLE_RATE = 44100

def create_ambient_bed(duration_sec=1200):  # 20 minutes (1200s)
    print(f"Generating {duration_sec}s ambient audio bed...")
    t = np.linspace(0, duration_sec, int(SAMPLE_RATE * duration_sec), endpoint=False)
    
    # Warm chord frequencies (D minor 9: D2=73.42Hz, A2=110Hz, F3=174.61Hz, C4=261.63Hz, E4=329.63Hz)
    f1, f2, f3, f4, f5 = 73.42, 110.0, 174.61, 261.63, 329.63
    
    # Slow LFO breathing modulations (0.1 Hz to 0.05 Hz)
    lfo1 = 0.5 + 0.5 * np.sin(2 * np.pi * 0.05 * t)
    lfo2 = 0.5 + 0.5 * np.sin(2 * np.pi * 0.033 * t + 1.0)
    lfo3 = 0.5 + 0.5 * np.sin(2 * np.pi * 0.025 * t + 2.0)
    
    signal = (
        0.35 * np.sin(2 * np.pi * f1 * t) * lfo1 +
        0.25 * np.sin(2 * np.pi * f2 * t) * lfo2 +
        0.18 * np.sin(2 * np.pi * f3 * t) * lfo3 +
        0.12 * np.sin(2 * np.pi * f4 * t) * (1 - lfo1 * 0.5) +
        0.10 * np.sin(2 * np.pi * f5 * t) * (1 - lfo2 * 0.5)
    )
    
    # Add subtle warm analog tape saturation/soft clipping
    signal = np.tanh(signal * 0.8)
    
    # Fade in over 3 seconds and fade out over 5 seconds
    fade_in_len = int(SAMPLE_RATE * 3)
    fade_out_len = int(SAMPLE_RATE * 5)
    signal[:fade_in_len] *= np.linspace(0, 1, fade_in_len)
    signal[-fade_out_len:] *= np.linspace(1, 0, fade_out_len)
    
    # Normalize to -28 dB peak
    peak = np.max(np.abs(signal))
    if peak > 0:
        signal = signal / peak * 0.04  # very soft bed (-28dB)
        
    wav_path = os.path.join(OUT_DIR, "ambient_bed.wav")
    wavfile.write(wav_path, SAMPLE_RATE, (signal * 32767).astype(np.int16))
    print(f"  ✓ Written: {wav_path} ({os.path.getsize(wav_path)} bytes)")

def create_transition_chime():
    dur = 1.2
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), endpoint=False)
    # Bell harmonics: 880Hz, 1760Hz, 2640Hz with exponential decay
    env = np.exp(-4.5 * t)
    signal = (
        0.5 * np.sin(2 * np.pi * 880 * t) +
        0.3 * np.sin(2 * np.pi * 1760 * t) +
        0.2 * np.sin(2 * np.pi * 2640 * t)
    ) * env
    signal = signal / np.max(np.abs(signal)) * 0.2
    wav_path = os.path.join(OUT_DIR, "transition_chime.wav")
    wavfile.write(wav_path, SAMPLE_RATE, (signal * 32767).astype(np.int16))
    print(f"  ✓ Written: {wav_path}")

def create_click_sfx():
    dur = 0.05
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), endpoint=False)
    env = np.exp(-60.0 * t)
    signal = np.sin(2 * np.pi * 1200 * t) * env
    signal = signal / np.max(np.abs(signal)) * 0.25
    wav_path = os.path.join(OUT_DIR, "click_sfx.wav")
    wavfile.write(wav_path, SAMPLE_RATE, (signal * 32767).astype(np.int16))
    print(f"  ✓ Written: {wav_path}")

if __name__ == "__main__":
    create_transition_chime()
    create_click_sfx()
    create_ambient_bed(1200)
    print("SFX generation complete!")

