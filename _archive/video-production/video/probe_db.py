import os
import psycopg2
from urllib.parse import urlparse

# Read .env safely without printing secrets
env = {}
if os.path.exists(".env"):
    with open(".env", "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")

neon_url = env.get("NEON_DATABASE_URL")
if not neon_url:
    print("NEON_DATABASE_URL not found in .env")
    exit(1)

parsed = urlparse(neon_url)
print(f"Connecting to host: {parsed.hostname}, user: {parsed.username}, default db: {parsed.path.lstrip('/')}")

# Try connecting to default DB and test permissions
try:
    conn = psycopg2.connect(
        dbname=parsed.path.lstrip('/') or 'neondb',
        user=parsed.username,
        password=parsed.password,
        host=parsed.hostname,
        port=parsed.port or 5432,
        sslmode='require'
    )
    conn.autocommit = True
    cur = conn.cursor()
    print("Connected successfully!")
    
    # Check current databases
    cur.execute("SELECT datname FROM pg_database WHERE datistemplate = false;")
    dbs = [row[0] for row in cur.fetchall()]
    print("Available databases:", dbs)
    
    # Check if incidentzero_demo exists
    if "incidentzero_demo" not in dbs:
        print("Attempting to CREATE DATABASE incidentzero_demo...")
        try:
            cur.execute("CREATE DATABASE incidentzero_demo;")
            print("Successfully created database incidentzero_demo!")
        except Exception as e:
            print("Could not create database incidentzero_demo (Neon limit or permission):", e)
    else:
        print("Database incidentzero_demo already exists!")
    
    cur.close()
    conn.close()
except Exception as e:
    print("Connection error:", e)

