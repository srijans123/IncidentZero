import os
import sys
import subprocess
import time

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

print("Starting VoiceStudio backend daemon on port 3900...", flush=True)
proc = subprocess.Popen(
    [python_exe, main_py],
    cwd=backend_dir,
    env=env
)

try:
    proc.wait()
except KeyboardInterrupt:
    proc.terminate()
