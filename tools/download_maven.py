import urllib.request
import ssl
import zipfile
import pathlib

url = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip"
tools_dir = pathlib.Path("tools")
zip_path = tools_dir / "maven.zip"

ctx = ssl._create_unverified_context()
headers = {'User-Agent': 'Mozilla/5.0'}
req = urllib.request.Request(url, headers=headers)
print(f"Downloading Maven from {url}...")
with urllib.request.urlopen(req, context=ctx) as resp, open(zip_path, 'wb') as out_f:
    out_f.write(resp.read())

print("Extracting...")
with zipfile.ZipFile(zip_path, 'r') as zf:
    zf.extractall(tools_dir)

if zip_path.exists():
    zip_path.unlink()

print("Maven installed successfully at", (tools_dir / "apache-maven-3.9.9" / "bin").resolve())
