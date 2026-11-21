import torch
import time
from qwen_tts import Qwen3TTSModel

print("============================================================")
print("  Loading Qwen3-TTS 1.7B CustomVoice on GPU (cuda:0)        ")
print("============================================================")

torch.cuda.empty_cache()
vram_start = torch.cuda.memory_allocated() / (1024 ** 2)

model_id = "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice"
t0 = time.time()

try:
    model = Qwen3TTSModel.from_pretrained(
        model_id,
        device_map="cuda:0",
        dtype=torch.bfloat16,
        attn_implementation="sdpa"
    )
    t_load = time.time() - t0
    
    # Calculate parameter count
    total_params = 0
    weights_device = "unknown"
    for name, p in model.model.named_parameters():
        total_params += p.numel()
        weights_device = str(p.device)
        
    vram_end = torch.cuda.memory_allocated() / (1024 ** 2)
    vram_reserved = torch.cuda.memory_reserved() / (1024 ** 2)
    
    print(f"[✓] Model ID:        {model_id}")
    print(f"[✓] Total Parameters:{total_params:,} ({total_params / 1e9:.2f}B)")
    print(f"[✓] Device of Weights:{weights_device}")
    print(f"[✓] VRAM Allocated:  {vram_end:.1f} MiB")
    print(f"[✓] VRAM Reserved:   {vram_reserved:.1f} MiB")
    print(f"[✓] Load Time:       {t_load:.2f}s")
    print("STATUS: SUCCESS")
except Exception as e:
    print(f"FAILED: {e}")
    import traceback
    traceback.print_exc()

