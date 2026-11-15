import os
import sys
import subprocess
import time
import urllib.request
import json

python_exe = r"D:\Apps\Voice Studio\VoiceStudio\project\.venv\Scripts\python.exe"
backend_dir = r"D:\Apps\Voice Studio\VoiceStudio\project\backend"
main_py = os.path.join(backend_dir, "main.py")

env = os.environ.copy()
env["OMNIVOICE_DATA_DIR"] = r"D:\Apps\Voice Studio\VoiceStudio\data"
env["OMNIVOICE_CACHE_DIR"] = r"D:\Apps\Voice Studio\VoiceStudio\models"
env["HF_HOME"] = r"D:\Apps\Voice Studio\VoiceStudio\models"
env["OMNIVOICE_PORT"] = "3900"
env["OMNIVOICE_BIND_HOST"] = "127.0.0.1"
env["PYTHONPATH"] = backend_dir

print("Launching VoiceStudio backend...")
proc = subprocess.Popen(
    [python_exe, main_py],
    cwd=backend_dir,
    env=env,
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
    bufsize=1
)

# Start background reader for output
def monitor():
    for line in proc.stdout:
        print("[VoiceStudio]", line.strip())

import threading
t = threading.Thread(target=monitor, daemon=True)
t.start()

print("Waiting for http://127.0.0.1:3900/health...")
for i in range(60):
    time.sleep(2)
    try:
        req = urllib.request.urlopen("http://127.0.0.1:3900/health", timeout=2)
        print(f"Health check status: {req.status}")
        if req.status in (200, 503):
            data = req.read().decode('utf-8')
            print(f"Health response: {data}")
            if req.status == 200:
                print("VoiceStudio backend READY!")
                break
    except Exception as e:
        print(f"Still waiting ({i*2}s)... {e}")

print("Checking /profiles endpoint...")
try:
    req = urllib.request.urlopen("http://127.0.0.1:3900/profiles", timeout=5)
    profiles = json.loads(req.read().decode('utf-8'))
    print("Available profiles:", json.dumps(profiles, indent=2))
except Exception as e:
    print(f"Profiles check error: {e}")
