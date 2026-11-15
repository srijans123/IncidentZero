import sys
import os
import urllib.parse
import psycopg2

def get_demo_conn():
    neon_url = None
    with open('.env', 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('NEON_DATABASE_URL='):
                neon_url = line.split('=', 1)[1].strip().strip('"').strip("'")
                break
    if not neon_url:
        raise ValueError("NEON_DATABASE_URL not found in .env")

    p = urllib.parse.urlparse(neon_url)
    conn = psycopg2.connect(
        dbname='incidentzero_demo',
        user=p.username,
        password=p.password,
        host=p.hostname,
        port=p.port or 5432,
        sslmode='require'
    )
    conn.autocommit = True
    return conn

def main():
    action = sys.argv[1] if len(sys.argv) > 1 else '--check'
    conn = get_demo_conn()
    cur = conn.cursor()

    if action == '--check':
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
        tables = [r[0] for r in cur.fetchall()]
        print(f"[✓] Connected to incidentzero_demo. Found {len(tables)} tables: {sorted(tables)}")

    elif action == '--reset':
        print("[*] Dropping schema public CASCADE in incidentzero_demo...")
        cur.execute("DROP SCHEMA IF EXISTS public CASCADE;")
        cur.execute("CREATE SCHEMA public;")
        cur.execute("GRANT ALL ON SCHEMA public TO public;")
        print("[✓] Schema public reset successfully.")

    cur.close()
    conn.close()

if __name__ == '__main__':
    main()
