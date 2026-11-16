import os
import sys
import hashlib
import json
import uuid
import datetime
from urllib.parse import urlparse
import psycopg2

def get_demo_conn():
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
        raise ValueError("NEON_DATABASE_URL not found in .env")
    
    parsed = urlparse(neon_url)
    conn = psycopg2.connect(
        dbname="incidentzero_demo",
        user=parsed.username,
        password=parsed.password,
        host=parsed.hostname,
        port=parsed.port or 5432,
        sslmode="require"
    )
    conn.autocommit = True
    return conn

def run_migrations(cur):
    migration_dir = "backend/src/main/resources/db/migration"
    files = [
        "V001__reference_tables.sql",
        "V002__incident_core.sql",
        "V003__audit_timers_ai.sql",
        "R__campus_seed.sql"
    ]
    
    for f in files:
        p = os.path.join(migration_dir, f)
        print(f"Applying {f}...")
        with open(p, "r", encoding="utf-8") as sql_file:
            sql = sql_file.read()
            cur.execute(sql)
    print("Base DDL and campus seeds applied successfully.")

def seed_extra_technicians(cur):
    print("Seeding extra technicians to satisfy >= 6 technicians requirement...")
    tech_hash = "$argon2id$v=19$m=16384,t=2,p=1$Yml0c3NhbHQyMDI2X19fXw$rtktGFsgAeXS/N5hY5h9aaTkNGR898TcNMoaHwF3lBg"
    
    extra_users = [
        ("019299a0-0000-7000-8000-000000000009", "TECHNICIAN", "BITS-T-205", "Sameer Verma", "tech.sameer@bits.campus", tech_hash, "CCIT", "NAB"),
        ("019299a0-0000-7000-8000-000000000010", "TECHNICIAN", "BITS-T-206", "Pooja Nair", "tech.pooja@bits.campus", tech_hash, "CCIT", "FD-II")
    ]
    
    for u in extra_users:
        cur.execute("""
            INSERT INTO app_user (id, type, employee_number, name, email, password_hash, department, location_block)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (email) DO NOTHING;
        """, u)
        
    # Tech profiles (Tech 5: NET_INFRA, Tech 6: CAMPUS_APPS)
    cur.execute("""
        INSERT INTO technician_profile (user_id, team_id, support_tier, capacity_points, shift_start, shift_end, on_shift_override) VALUES
        ('019299a0-0000-7000-8000-000000000009', '10000000-0000-0000-0000-000000000001', 'L1', 8.0, '00:00', '23:59', true),
        ('019299a0-0000-7000-8000-000000000010', '10000000-0000-0000-0000-000000000003', 'SENIOR', 8.0, '00:00', '23:59', true)
        ON CONFLICT (user_id) DO NOTHING;
    """)
    
    cur.execute("""
        INSERT INTO technician_load (technician_id, points, capacity, version) VALUES
        ('019299a0-0000-7000-8000-000000000009', 1.0, 8.0, 0),
        ('019299a0-0000-7000-8000-000000000010', 3.0, 8.0, 0)
        ON CONFLICT (technician_id) DO NOTHING;
    """)

def seed_incidents(cur):
    print("Seeding 45 realistic campus incidents (including P1 Major, SLA warnings, sticky breaches)...")
    
    now = datetime.datetime.now(datetime.timezone.utc)
    
    # Pre-aged P1 Major Incident on SWD Mess Payment Gateway (APP-MESS-PAY)
    p1_id = "a0000001-0000-0000-0000-000000000001"
    p1_created = now - datetime.timedelta(minutes=25) # 25m into 30m SLA resolution target -> AT_RISK / WARNING
    
    incidents = [
        {
            "id": p1_id,
            "number": "INC-2026-0001",
            "reporter_id": "019299a0-0000-7000-8000-000000000001", # Aarav Sharma
            "service_id": "30000000-0000-0000-0000-000000000011",  # APP-MESS-PAY
            "category_id": "20000000-0000-0000-0000-000000000008", # APPLICATION
            "title": "Payment Gateway Timeout (504) During Semester Mess Dues Deadline",
            "description": "SWD mess dues payment portal is failing with HTTP 504 gateway timeout for all students. Razorpay webhook queue backed up with over 4,200 pending transactions.",
            "impact": 3, "urgency": 3, "priority": "P1",
            "status": "IN_PROGRESS",
            "sla_status": "AT_RISK",
            "assignee_id": "019299a0-0000-7000-8000-000000000003", # Vikram Rao
            "team_id": "10000000-0000-0000-0000-000000000003",     # CAMPUS_APPS
            "is_major": True,
            "affected_users": 4200,
            "sla_policy_id": "40000000-0000-0000-0000-000000000005", # T1 P1 (5m resp, 30m res)
            "sla_clock_mode": "CONTINUOUS_24X7",
            "response_target_min": 5,
            "resolution_target_min": 30,
            "resp_clock_state": "STOPPED",
            "resp_clock_consumed_ms": 2 * 60 * 1000,
            "responded_at": p1_created + datetime.timedelta(minutes=2),
            "res_clock_state": "RUNNING",
            "res_clock_consumed_ms": 23 * 60 * 1000, # 23m of 30m -> AT_RISK
            "res_clock_last_resume_at": p1_created + datetime.timedelta(minutes=2),
            "created_at": p1_created,
            "updated_at": now - datetime.timedelta(minutes=1)
        },
        # Sticky Breach: Central LDAP SSO Timeout past resolution target
        {
            "id": "a0000002-0000-0000-0000-000000000002",
            "number": "INC-2026-0002",
            "reporter_id": "019299a0-0000-7000-8000-000000000002", # Diya Nair
            "service_id": "30000000-0000-0000-0000-000000000002",  # AUTH-LDAP
            "category_id": "20000000-0000-0000-0000-000000000007", # AUTHENTICATION
            "title": "Central OpenLDAP Connection Pool Exhaustion on Academic Portals",
            "description": "Active OpenLDAP threads hit 500 max connection limit. SSO authentications failing across Moodle and ERP.",
            "impact": 3, "urgency": 2, "priority": "P2",
            "status": "IN_PROGRESS",
            "sla_status": "BREACHED",
            "assignee_id": "019299a0-0000-7000-8000-000000000004", # Priya Menon
            "team_id": "10000000-0000-0000-0000-000000000002",     # SYS_IDENT
            "is_major": False,
            "affected_users": 1800,
            "sla_policy_id": "40000000-0000-0000-0000-000000000002", # T0 P2 (10m resp, 90m res)
            "sla_clock_mode": "CONTINUOUS_24X7",
            "response_target_min": 10,
            "resolution_target_min": 90,
            "resp_clock_state": "STOPPED",
            "resp_clock_consumed_ms": 5 * 60 * 1000,
            "responded_at": now - datetime.timedelta(minutes=115),
            "res_clock_state": "RUNNING",
            "res_clock_consumed_ms": 115 * 60 * 1000, # 115m > 90m -> BREACHED
            "res_clock_last_resume_at": now - datetime.timedelta(minutes=115),
            "created_at": now - datetime.timedelta(minutes=120),
            "updated_at": now - datetime.timedelta(minutes=5)
        }
    ]
    
    # Generate 43 additional historical and active incidents
    campus_services = [
        ("30000000-0000-0000-0000-000000000009", "NET-WIFI-HOSTEL", "20000000-0000-0000-0000-000000000003", "10000000-0000-0000-0000-000000000001", "Vyas Bhawan Wing-C Aruba AP-515 Offline"),
        ("30000000-0000-0000-0000-000000000007", "APP-LMS", "20000000-0000-0000-0000-000000000008", "10000000-0000-0000-0000-000000000003", "Moodle Quiz Submission File Size Limit 50MB Exceeded"),
        ("30000000-0000-0000-0000-000000000010", "NET-LAN-ACAD", "20000000-0000-0000-0000-000000000003", "10000000-0000-0000-0000-000000000001", "NAB Block-A Switch Rack 3 Fiber SFP Port Flapping"),
        ("30000000-0000-0000-0000-000000000006", "APP-ERP", "20000000-0000-0000-0000-000000000008", "10000000-0000-0000-0000-000000000003", "Course Registration Elective Dropping Deadlock in AUGSD"),
        ("30000000-0000-0000-0000-000000000017", "HW-AV", "20000000-0000-0000-0000-000000000001", "10000000-0000-0000-0000-000000000004", "LTC-5101 Laser Projector HDMI Handshake Audio Distortion"),
        ("30000000-0000-0000-0000-000000000018", "HW-LAB", "20000000-0000-0000-0000-000000000001", "10000000-0000-0000-0000-000000000004", "IPC Lab 2 Workstation Dual Boot GRUB Partition Corrupted"),
        ("30000000-0000-0000-0000-000000000012", "APP-LIB", "20000000-0000-0000-0000-000000000008", "10000000-0000-0000-0000-000000000003", "IEEE Xplore EZProxy Certificate Authority Warning in Chrome")
    ]
    
    statuses = ["CLOSED", "RESOLVED", "IN_PROGRESS", "ASSIGNED", "ACKNOWLEDGED", "NEW", "PENDING_USER"]
    tech_ids = [
        "019299a0-0000-7000-8000-000000000003",
        "019299a0-0000-7000-8000-000000000004",
        "019299a0-0000-7000-8000-000000000005",
        "019299a0-0000-7000-8000-000000000006",
        "019299a0-0000-7000-8000-000000000009",
        "019299a0-0000-7000-8000-000000000010"
    ]
    
    for i in range(3, 46):
        svc = campus_services[i % len(campus_services)]
        status = statuses[i % len(statuses)]
        created_time = now - datetime.timedelta(days=(46 - i) * 2, hours=i % 12, minutes=i % 45)
        
        is_closed = status in ("CLOSED", "RESOLVED", "VERIFIED")
        res_notes = f"Investigated root cause on {svc[1]}. Applied patch, verified connectivity across VLANs, and restarted service daemon." if is_closed else None
        root_cause = "SOFTWARE_BUG" if is_closed else None
        closure_note = "Confirmed operational with reporter. SLA targets met." if status == "CLOSED" else None
        
        incidents.append({
            "id": f"a0000001-0000-0000-0000-{i:012d}",
            "number": f"INC-2026-{i:04d}",
            "reporter_id": "019299a0-0000-7000-8000-000000000001" if i % 2 == 0 else "019299a0-0000-7000-8000-000000000002",
            "service_id": svc[0],
            "category_id": svc[2],
            "title": f"{svc[4]} - Cluster Incident #{i}",
            "description": f"Automated and user telemetry flagged anomalous behavior on service {svc[1]}. Diagnostic ping latency exceeded 120ms with 4% packet drop.",
            "impact": 2 if i % 3 == 0 else 1,
            "urgency": 2 if i % 2 == 0 else 1,
            "priority": "P2" if i % 5 == 0 else "P3" if i % 2 == 0 else "P4",
            "status": status,
            "sla_status": "ON_TRACK",
            "assignee_id": tech_ids[i % len(tech_ids)] if status != "NEW" else None,
            "team_id": svc[3],
            "is_major": False,
            "affected_users": 15 + (i * 7) % 180,
            "sla_policy_id": "40000000-0000-0000-0000-000000000007",
            "sla_clock_mode": "BUSINESS_HOURS",
            "response_target_min": 60,
            "resolution_target_min": 480,
            "resp_clock_state": "STOPPED" if status != "NEW" else "RUNNING",
            "resp_clock_consumed_ms": 15 * 60 * 1000 if status != "NEW" else 0,
            "responded_at": created_time + datetime.timedelta(minutes=15) if status != "NEW" else None,
            "res_clock_state": "STOPPED" if is_closed else "RUNNING",
            "res_clock_consumed_ms": 180 * 60 * 1000 if is_closed else 45 * 60 * 1000,
            "res_clock_last_resume_at": created_time + datetime.timedelta(minutes=15) if not is_closed else None,
            "resolved_at": created_time + datetime.timedelta(hours=3) if is_closed else None,
            "closed_at": created_time + datetime.timedelta(hours=4) if status == "CLOSED" else None,
            "closure_note": closure_note,
            "resolution_code": "SOLVED_WORKAROUND" if is_closed else None,
            "resolution_notes": res_notes,
            "root_cause_category": root_cause,
            "rating": 5 if status == "CLOSED" and i % 2 == 0 else 4 if status == "CLOSED" else None,
            "created_at": created_time,
            "updated_at": created_time + datetime.timedelta(hours=2)
        })

    # Batched multi-row insert for all incidents
    cols = [
        "id", "number", "reporter_id", "service_id", "category_id", "title", "description",
        "impact", "urgency", "priority", "status", "sla_status", "assignee_id", "team_id",
        "is_major", "affected_users", "sla_policy_id", "sla_clock_mode", "response_target_min",
        "resolution_target_min", "resp_clock_state", "resp_clock_consumed_ms", "responded_at",
        "res_clock_state", "res_clock_consumed_ms", "res_clock_last_resume_at", "resolved_at",
        "closed_at", "closure_note", "resolution_code", "resolution_notes", "root_cause_category",
        "rating", "created_at", "updated_at"
    ]
    
    from psycopg2.extras import execute_values
    
    inc_tuples = []
    audit_tuples = []
    
    for inc in incidents:
        vals = tuple(inc.get(c) for c in cols)
        inc_tuples.append(vals)
        
        # Seed an audit record for each incident to maintain hash chain
        h_payload = json.dumps({"action": "INITIAL_CREATION", "number": inc["number"]})
        h_input = f"0:{inc['created_at'].isoformat()}:CREATE_INCIDENT:0000000000000000000000000000000000000000000000000000000000000000:{h_payload}"
        rec_hash = hashlib.sha256(h_input.encode('utf-8')).hexdigest()
        
        audit_tuples.append((
            inc["id"], 0, inc["created_at"], inc["reporter_id"], "USER", "CREATE_INCIDENT",
            None, "NEW", f"Incident {inc['number']} reported", h_payload,
            "0000000000000000000000000000000000000000000000000000000000000000", rec_hash
        ))
        
    col_str = ", ".join(cols)
    execute_values(cur, f"INSERT INTO incident ({col_str}) VALUES %s ON CONFLICT (id) DO NOTHING;", inc_tuples)
    execute_values(cur, """
        INSERT INTO audit_record (incident_id, chain_index, ts, actor_id, actor_type, action, prev_state, new_state, description, payload, prev_hash, hash)
        VALUES %s ON CONFLICT (incident_id, chain_index) DO NOTHING;
    """, audit_tuples)

    print(f"Total {len(incidents)} incidents seeded with cryptographic audit records.")

def main():
    conn = get_demo_conn()
    cur = conn.cursor()
    run_migrations(cur)
    seed_extra_technicians(cur)
    seed_incidents(cur)
    cur.close()
    conn.close()
    print("Deterministic demo environment seeding COMPLETED successfully!")

if __name__ == "__main__":
    main()
