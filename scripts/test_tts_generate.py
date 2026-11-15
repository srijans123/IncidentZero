import urllib.request
import urllib.error
import json
import time
import os

url = "http://127.0.0.1:3900/v1/audio/speech"
payload = {
    "model": "omnivoice",
    "voice": "44f29b45",
    "input": "Hi, I am Srijan, and this is Incident-Zero.",
    "response_format": "wav",
    "seed": 42
}
data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

print("Sending speech generation request to VoiceStudio API...")
t0 = time.time()
try:
    with urllib.request.urlopen(req, timeout=120) as resp:
        wav_data = resp.read()
        elapsed = time.time() - t0
        print(f"SUCCESS in {elapsed:.2f}s! Received {len(wav_data)} bytes of WAV audio.")
        os.makedirs("video_v3/03_audio", exist_ok=True)
        out_file = "video_v3/03_audio/sample_test.wav"
        with open(out_file, "wb") as f:
            f.write(wav_data)
        print(f"Saved to {out_file}")
except urllib.error.HTTPError as e:
    print(f"HTTP ERROR {e.code}: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
