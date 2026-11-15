import os
import urllib.parse
import psycopg2

def get_neon_url():
    with open('.env', 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('NEON_DATABASE_URL='):
                return line.split('=', 1)[1].strip().strip('"').strip("'")
    raise ValueError("NEON_DATABASE_URL not found in .env")

def main():
    neon_url = get_neon_url()
    p = urllib.parse.urlparse(neon_url)
    print(f"Connecting to Neon host: {p.hostname}")

    conn = psycopg2.connect(
        dbname='neondb',
        user=p.username,
        password=p.password,
        host=p.hostname,
        port=p.port or 5432,
        sslmode='require'
    )
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("SELECT datname FROM pg_database;")
    dbs = [r[0] for r in cur.fetchall()]
    print(f"Found databases: {dbs}")

    if 'incidentzero_demo' not in dbs:
        print("Creating 'incidentzero_demo' database...")
        cur.execute("CREATE DATABASE incidentzero_demo;")
        print("Created 'incidentzero_demo' successfully!")
    else:
        print("'incidentzero_demo' database already exists.")
    cur.close()
    conn.close()

if __name__ == '__main__':
    main()
