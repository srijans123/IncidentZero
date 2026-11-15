import os
import sys
import subprocess
import urllib.parse

def main():
    env = dict(os.environ)
    neon_url = None
    with open('.env', 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('NEON_DATABASE_URL='):
                neon_url = line.split('=', 1)[1].strip().strip('"').strip("'")
                break
    if not neon_url:
        print("ERROR: NEON_DATABASE_URL not found in .env")
        sys.exit(1)

    parsed = urllib.parse.urlparse(neon_url)
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
    env["SPRING_FLYWAY_URL"] = demo_jdbc_url
    env["SPRING_FLYWAY_USER"] = parsed.username
    env["SPRING_FLYWAY_PASSWORD"] = parsed.password
    env["JAVA_HOME"] = os.path.expanduser(r"~\.jdks\corretto-22.0.2")

    maven_cmd = os.path.abspath("tools/apache-maven-3.9.9/bin/mvn.cmd")
    args = sys.argv[1:] if len(sys.argv) > 1 else ["-q", "test"]
    cmd = [maven_cmd, "-f", "backend/pom.xml"] + args

    print(f"Running Maven with demo DB ({parsed.hostname}/incidentzero_demo)...")
    res = subprocess.run(cmd, env=env)
    sys.exit(res.returncode)

if __name__ == '__main__':
    main()
