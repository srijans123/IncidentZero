import os
import sys
import subprocess
from urllib.parse import urlparse

def main():
    env = dict(os.environ)
    env_file = {}
    if os.path.exists(".env"):
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    env_file[k.strip()] = v.strip().strip('"').strip("'")
    
    neon_url = env_file.get("NEON_DATABASE_URL")
    if not neon_url:
        print("NEON_DATABASE_URL not found!")
        sys.exit(1)
        
    parsed = urlparse(neon_url)
    demo_jdbc_url = f"jdbc:postgresql://{parsed.hostname}/incidentzero_demo?sslmode=require&prepareThreshold=0"
    
    env["DB_URL"] = demo_jdbc_url
    env["DB_HOST"] = parsed.hostname
    env["DB_NAME"] = "incidentzero_demo"
    env["DB_USER"] = parsed.username
    env["DB_PASSWORD"] = parsed.password
    env["DB_OWNER_USER"] = parsed.username
    env["DB_OWNER_PASSWORD"] = parsed.password
    env["DB_APP_USER"] = parsed.username
    env["DB_APP_PASSWORD"] = parsed.password
    env["SPRING_DATASOURCE_URL"] = demo_jdbc_url
    env["SPRING_DATASOURCE_USERNAME"] = parsed.username
    env["SPRING_DATASOURCE_PASSWORD"] = parsed.password
    env["SPRING_FLYWAY_ENABLED"] = "false"
    env["SPRING_FLYWAY_BASELINE_ON_MIGRATE"] = "true"
    env["SERVER_PORT"] = "8080"
    
    # Read backend classpath
    cp_file = os.path.abspath("backend/classpath.txt")
    with open(cp_file, "r", encoding="utf-8") as f:
        deps = f.read().strip()
        
    classes_dir = os.path.abspath("backend/target/classes")
    full_cp = f"{classes_dir};{deps}"
    
    java_exe = os.path.expanduser(r"~\.jdks\corretto-22.0.2\bin\java.exe")
    if not os.path.exists(java_exe):
        java_exe = "java"
        
    cmd = [java_exe, "-cp", full_cp, "edu.campus.iitsm.IncidentZeroApplication"]
    print(f"Launching IncidentZeroApplication with {java_exe} against incidentzero_demo on port 8080...")
    proc = subprocess.Popen(cmd, env=env)
    return proc.wait()

if __name__ == "__main__":
    main()
