import urllib.parse
import time
import psycopg2

def reset_load():
    with open('.env') as f:
        for line in f:
            if line.startswith('NEON_DATABASE_URL='):
                u = line.split('=', 1)[1].strip().strip('"').strip("'")
                break
    p = urllib.parse.urlparse(u)

    for attempt in range(5):
        try:
            conn = psycopg2.connect(
                host=p.hostname,
                port=p.port or 5432,
                user=p.username,
                password=p.password,
                dbname='incidentzero_demo',
                sslmode='require',
                connect_timeout=15
            )
            cur = conn.cursor()
            cur.execute("UPDATE technician_load SET points = 1.0 WHERE technician_id = '019299a0-0000-7000-8000-000000000003'")
            cur.execute("UPDATE technician_load SET points = 2.0 WHERE technician_id = '019299a0-0000-7000-8000-000000000004'")
            cur.execute("UPDATE technician_load SET points = 2.0 WHERE technician_id = '019299a0-0000-7000-8000-000000000005'")
            cur.execute("UPDATE technician_load SET points = 0.5 WHERE technician_id = '019299a0-0000-7000-8000-000000000006'")
            conn.commit()
            conn.close()
            print("[reset_load] Reset demo technician loads to default.")
            return
        except Exception as e:
            print(f"[reset_load] Attempt {attempt+1} failed ({e}), retrying in 3s...")
            time.sleep(3)
    raise RuntimeError("Failed to connect to Neon database after 5 attempts")

if __name__ == '__main__':
    reset_load()
