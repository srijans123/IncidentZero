import os
import urllib.request
import sys

def download_file(url, dst):
    print(f"Downloading {url} -> {dst}...")
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response, open(dst, "wb") as out_file:
        total = int(response.info().get("Content-Length", -1))
        downloaded = 0
        chunk_size = 1024 * 1024  # 1MB
        while True:
            chunk = response.read(chunk_size)
            if not chunk:
                break
            downloaded += len(chunk)
            out_file.write(chunk)
            if total > 0:
                percent = downloaded * 100 / total
                mb_down = downloaded / (1024 * 1024)
                mb_tot = total / (1024 * 1024)
                sys.stdout.write(f"\r  {mb_down:.1f} MB / {mb_tot:.1f} MB ({percent:.1f}%)")
                sys.stdout.flush()
    print("\n  [✓] Complete.")

def main():
    os.makedirs("video/03_audio/models/piper", exist_ok=True)
    base_url = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/high"
    
    onnx_file = "video/03_audio/models/piper/en_US-ryan-high.onnx"
    json_file = "video/03_audio/models/piper/en_US-ryan-high.onnx.json"

    download_file(f"{base_url}/en_US-ryan-high.onnx", onnx_file)
    download_file(f"{base_url}/en_US-ryan-high.onnx.json", json_file)

if __name__ == "__main__":
    main()

