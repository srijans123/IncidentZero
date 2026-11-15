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

    elif action == '--test-trigger':
        # Verify that audit_record update is rejected by audit_immutable trigger
        # First ensure there's at least one row, or insert a temporary one
        cur.execute("SELECT id FROM audit_record LIMIT 1;")
        row = cur.fetchone()
        test_id = None
        if row:
            test_id = row[0]
        else:
            # Insert a temporary row to test trigger
            cur.execute("""
                INSERT INTO audit_record (incident_id, chain_index, state, from_state, to_state, command, 
                                          actor_id, actor_type, rationale, payload, prev_hash, hash)
                VALUES ('00000000-0000-0000-0000-000000000001', 0, 'SUBMITTED', NULL, 'SUBMITTED', 'create',
                        '019299a0-0000-7000-8000-000000000001', 'USER', 'test', '{}'::jsonb,
                        '0000000000000000000000000000000000000000000000000000000000000000',
                        '1111111111111111111111111111111111111111111111111111111111111111')
                RETURNING id;
            """)
            test_id = cur.fetchone()[0]

        try:
            cur.execute(f"UPDATE audit_record SET description='tampered' WHERE id={test_id};")
            print("FAIL: UPDATE was not rejected by audit_immutable trigger!")
            sys.exit(1)
        except Exception as e:
            err_msg = str(e)
            if 'audit_immutable' in err_msg.lower() or 'append-only' in err_msg.lower():
                print(f"[✓] UPDATE rejected by audit_immutable trigger as expected: {err_msg.strip()}")
                sys.exit(0)
            else:
                print(f"FAIL: Unexpected error during trigger test: {err_msg}")
                sys.exit(1)

    cur.close()
    conn.close()

if __name__ == '__main__':
    main()
