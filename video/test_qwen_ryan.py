import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel
import time

print("[*] Loading Qwen 0.6B CustomVoice on cuda:0...")
t0 = time.time()
model = Qwen3TTSModel.from_pretrained(
    "Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice",
    device_map="cuda:0",
    dtype=torch.bfloat16
)
print(f"[*] Model loaded in {time.time()-t0:.2f}s")

print("[*] Generating speech with speaker=ryan...")
t1 = time.time()
wavs, sr = model.generate_custom_voice(
    text="Incident-Zero is an enterprise IT service management platform developed at BITS Pilani Hyderabad Campus.",
    language="English",
    speaker="ryan",
    instruct="Speak in a clear, authoritative, professional English academic presentation tone."
)
print(f"[*] Generated in {time.time()-t1:.2f}s")
sf.write("video/03_audio/qwen_ryan_test.wav", wavs[0], sr)
print("[✓] Written to video/03_audio/qwen_ryan_test.wav")

