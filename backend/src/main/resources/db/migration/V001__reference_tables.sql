CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'itsm_app') THEN
    CREATE ROLE itsm_app WITH LOGIN PASSWORD 'itsm_dev_password';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Managed NeonDB role skip';
END $$;

CREATE TABLE team (
  id uuid PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app_user (
  id uuid PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('EMPLOYEE','TECHNICIAN','ADMINISTRATOR')),
  employee_number text NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  department text,
  location_block text,
  admin_role text CHECK (admin_role IN ('SYSTEM_ADMIN','IT_MANAGER')),
  active boolean NOT NULL DEFAULT true,
  failed_logins integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE technician_profile (
  user_id uuid PRIMARY KEY REFERENCES app_user (id),
  team_id uuid NOT NULL REFERENCES team (id),
  support_tier text NOT NULL CHECK (support_tier IN ('L1','SENIOR','TEAM_LEAD')),
  capacity_points numeric(4,1) NOT NULL DEFAULT 8.0 CHECK (capacity_points > 0),
  shift_start time NOT NULL DEFAULT '08:00',
  shift_end time NOT NULL DEFAULT '20:00',
  on_shift_override boolean
);

CREATE TABLE skill (
  id uuid PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL
);

CREATE TABLE technician_skill (
  user_id uuid NOT NULL REFERENCES app_user (id),
  skill_id uuid NOT NULL REFERENCES skill (id),
  level smallint NOT NULL CHECK (level BETWEEN 1 AND 3),
  PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE technician_load (
  technician_id uuid PRIMARY KEY REFERENCES app_user (id),
  points numeric(5,1) NOT NULL DEFAULT 0.0 CHECK (points >= 0.0),
  capacity numeric(5,1) NOT NULL DEFAULT 8.0 CHECK (capacity > 0.0),
  version bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT load_within_capacity CHECK (points <= capacity)
);

CREATE TABLE refresh_token (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES app_user (id),
  token_hash char(64) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  replaced_by uuid REFERENCES refresh_token (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE it_service (
  id uuid PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL UNIQUE,
  tier text NOT NULL CHECK (tier IN ('T0','T1','T2','T3')),
  owner_team_id uuid NOT NULL REFERENCES team (id),
  aliases text[] NOT NULL DEFAULT '{}',
  calendar_tags text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE service_dependency (
  upstream_id uuid NOT NULL REFERENCES it_service (id),
  downstream_id uuid NOT NULL REFERENCES it_service (id),
  type text NOT NULL CHECK (type IN ('HARD','SOFT')),
  PRIMARY KEY (upstream_id, downstream_id),
  CONSTRAINT no_self_dependency CHECK (upstream_id <> downstream_id)
);

CREATE TABLE category (
  id uuid PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL UNIQUE,
  parent_id uuid REFERENCES category (id),
  required_fields jsonb NOT NULL DEFAULT '[]',
  default_skill_tags text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE business_calendar (
  id uuid PRIMARY KEY,
  name text NOT NULL UNIQUE,
  workdays text[] NOT NULL DEFAULT '{MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY}',
  start_time time NOT NULL DEFAULT '09:00',
  end_time time NOT NULL DEFAULT '18:00',
  tz text NOT NULL DEFAULT 'Asia/Kolkata'
);

CREATE TABLE holiday (
  calendar_id uuid NOT NULL REFERENCES business_calendar (id),
  holiday_date date NOT NULL,
  name text NOT NULL,
  PRIMARY KEY (calendar_id, holiday_date)
);

CREATE TABLE calendar_window (
  id uuid PRIMARY KEY,
  name text NOT NULL UNIQUE,
  from_ts timestamptz NOT NULL,
  to_ts timestamptz NOT NULL,
  service_tags text[] NOT NULL DEFAULT '{}',
  effect jsonb NOT NULL DEFAULT '{"priorityBump": 1, "slaFactor": 0.5}',
  CONSTRAINT valid_window_range CHECK (to_ts > from_ts)
);

CREATE TABLE sla_policy (
  id uuid PRIMARY KEY,
  tier text NOT NULL CHECK (tier IN ('T0','T1','T2','T3')),
  priority text NOT NULL CHECK (priority IN ('P1','P2','P3','P4')),
  response_minutes integer NOT NULL CHECK (response_minutes > 0),
  resolution_minutes integer NOT NULL CHECK (resolution_minutes >= response_minutes),
  clock_mode text NOT NULL CHECK (clock_mode IN ('CONTINUOUS_24X7','BUSINESS_HOURS')),
  warn_percents integer[] NOT NULL DEFAULT '{50,75,90}',
  UNIQUE (tier, priority)
);

CREATE TABLE escalation_policy (
  team_id uuid PRIMARY KEY REFERENCES team (id),
  ladder jsonb NOT NULL
);
