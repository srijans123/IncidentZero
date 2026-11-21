import torch
import soundfile as sf
import os
import sys

print("Python:", sys.version)
print("Torch:", torch.__version__, "| CUDA:", torch.cuda.is_available())

try:
    from qwen_tts import Qwen3TTSModel
    print("qwen_tts import successful!")
except Exception as e:
    print("Failed to import qwen_tts:", e)
    sys.exit(1)

model_id = "Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice"
print(f"Testing model loading for {model_id}...")

try:
    model = Qwen3TTSModel.from_pretrained(
        model_id,
        device_map="cuda:0",
        dtype=torch.bfloat16,
    )
    print("Model loaded successfully on cuda:0!")
    
    prompt = "This is a smoke test for Incident Zero ITSM video pipeline."
    print("Generating speech...")
    wavs, sr = model.generate_custom_voice(
        text=prompt,
        language="English",
        speaker="Vivian",
        instruct="Speak clearly in an authoritative and calm tone."
    )
    
    os.makedirs("video/03_audio", exist_ok=True)
    out_path = "video/03_audio/voice_smoke_qwen.wav"
    sf.write(out_path, wavs[0], sr)
    print(f"Generated successfully: {out_path} (Sample rate: {sr})")
except Exception as e:
    print("Error during Qwen model run:", e)
    import traceback
    traceback.print_exc()

