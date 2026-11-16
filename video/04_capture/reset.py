import os
import sys
import time

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))
import seed

def reset_and_seed():
    start_time = time.time()
    print("Resetting incidentzero_demo database...")
    
    conn = seed.get_demo_conn()
    cur = conn.cursor()
    
    # Drop and recreate schema public to guarantee clean slate in < 1 second
    print("Dropping and recreating public schema...")
    cur.execute("DROP SCHEMA IF EXISTS public CASCADE;")
    cur.execute("CREATE SCHEMA public;")
    cur.execute("GRANT ALL ON SCHEMA public TO public;")
    
    # Run seed
    seed.run_migrations(cur)
    seed.seed_extra_technicians(cur)
    seed.seed_incidents(cur)
    
    cur.close()
    conn.close()
    
    elapsed = time.time() - start_time
    print(f"Demo environment reset and re-seed completed in {elapsed:.2f} seconds!")
    if elapsed >= 10.0:
        print(f"WARNING: Reset took {elapsed:.2f}s (target was < 10s)")
    else:
        print(f"PASS: Reset timing {elapsed:.2f}s is well within < 10.0s requirement.")

if __name__ == "__main__":
    reset_and_seed()

