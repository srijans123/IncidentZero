CREATE SEQUENCE IF NOT EXISTS incident_num_seq_2026 START WITH 1 INCREMENT BY 1;

CREATE TABLE incident (
  id uuid PRIMARY KEY,
  number text NOT NULL UNIQUE,
  reporter_id uuid NOT NULL REFERENCES app_user (id),
  service_id uuid NOT NULL REFERENCES it_service (id),
  category_id uuid REFERENCES category (id),
  title text NOT NULL CHECK (char_length(title) BETWEEN 5 AND 200),
  description text NOT NULL CHECK (char_length(description) BETWEEN 10 AND 4000),
  impact smallint NOT NULL CHECK (impact BETWEEN 1 AND 3),
  urgency smallint NOT NULL CHECK (urgency BETWEEN 1 AND 3),
  priority text NOT NULL CHECK (priority IN ('P1','P2','P3','P4')),
  priority_explanation jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL CHECK (status IN ('NEW','CLASSIFIED','ASSIGNED','ACKNOWLEDGED',
    'IN_PROGRESS','PENDING_USER','RESOLVED','VERIFIED','CLOSED','REOPENED','CANCELLED')),
  sla_status text NOT NULL DEFAULT 'ON_TRACK' CHECK (sla_status IN ('ON_TRACK','AT_RISK','BREACHED')),
  assignee_id uuid REFERENCES app_user (id),
  team_id uuid REFERENCES team (id),
  parent_id uuid REFERENCES incident (id),
  commander_id uuid REFERENCES app_user (id),
  is_major boolean NOT NULL DEFAULT false,
  affected_users integer NOT NULL DEFAULT 1 CHECK (affected_users >= 1),
  sla_policy_id uuid REFERENCES sla_policy (id),
  sla_clock_mode text NOT NULL DEFAULT 'BUSINESS_HOURS' CHECK (sla_clock_mode IN ('CONTINUOUS_24X7','BUSINESS_HOURS')),
  response_target_min integer NOT NULL DEFAULT 60,
  resolution_target_min integer NOT NULL DEFAULT 480,
  resp_clock_state text NOT NULL DEFAULT 'RUNNING' CHECK (resp_clock_state IN ('RUNNING','PAUSED','STOPPED')),
  resp_clock_consumed_ms bigint NOT NULL DEFAULT 0 CHECK (resp_clock_consumed_ms >= 0),
  resp_clock_last_resume_at timestamptz,
  res_clock_state text NOT NULL DEFAULT 'RUNNING' CHECK (res_clock_state IN ('RUNNING','PAUSED','STOPPED')),
  res_clock_consumed_ms bigint NOT NULL DEFAULT 0 CHECK (res_clock_consumed_ms >= 0),
  res_clock_last_resume_at timestamptz,
  clock_generation integer NOT NULL DEFAULT 0,
  last_audit_index integer NOT NULL DEFAULT 0,
  last_audit_hash char(64) NOT NULL DEFAULT '0000000000000000000000000000000000000000000000000000000000000000',
  responded_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  closure_note text,
  resolution_code text,
  resolution_notes text,
  root_cause_category text,
  archived_resolutions jsonb NOT NULL DEFAULT '[]',
  rating smallint CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  reassign_count integer NOT NULL DEFAULT 0,
  reopen_count integer NOT NULL DEFAULT 0,
  suggestions_pending boolean NOT NULL DEFAULT false,
  flagged boolean NOT NULL DEFAULT false,
  embedding vector(384),
  embedding_model text,
  search_tsv tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))) STORED,
  version bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT resolved_needs_resolution
    CHECK (status NOT IN ('RESOLVED','VERIFIED','CLOSED') OR (resolution_notes IS NOT NULL AND char_length(resolution_notes) >= 20)),
  CONSTRAINT p1_p2_needs_root_cause
    CHECK (status NOT IN ('RESOLVED','VERIFIED','CLOSED') OR priority NOT IN ('P1','P2') OR root_cause_category IS NOT NULL),
  CONSTRAINT closed_needs_note
    CHECK (status <> 'CLOSED' OR (closure_note IS NOT NULL AND char_length(trim(closure_note)) >= 1)),
  CONSTRAINT no_self_parent
    CHECK (parent_id IS NULL OR parent_id <> id)
);

CREATE INDEX incident_tsv_gin ON incident USING gin (search_tsv);
CREATE INDEX incident_emb_hnsw ON incident USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX incident_status_created ON incident (status, created_at DESC);
CREATE INDEX incident_service_created ON incident (service_id, created_at DESC);
CREATE INDEX incident_parent ON incident (parent_id);
CREATE INDEX incident_assignee_open ON incident (assignee_id)
  WHERE status IN ('ASSIGNED','ACKNOWLEDGED','IN_PROGRESS','PENDING_USER','REOPENED');

CREATE TABLE escalation_event (
  id uuid PRIMARY KEY,
  incident_id uuid NOT NULL REFERENCES incident (id),
  level smallint NOT NULL CHECK (level BETWEEN 1 AND 4),
  target_user_id uuid REFERENCES app_user (id),
  reason text NOT NULL,
  fired_at timestamptz NOT NULL
);

CREATE TABLE incident_comment (
  id uuid PRIMARY KEY,
  incident_id uuid NOT NULL REFERENCES incident (id),
  author_id uuid NOT NULL REFERENCES app_user (id),
  visibility text NOT NULL CHECK (visibility IN ('PUBLIC','INTERNAL')),
  source text NOT NULL CHECK (source IN ('USER','SYSTEM','AI_DRAFT','LINKED_REPORT')),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL
);

CREATE TABLE incident_link (
  id uuid PRIMARY KEY,
  source_id uuid NOT NULL REFERENCES incident (id),
  target_id uuid NOT NULL REFERENCES incident (id),
  type text NOT NULL CHECK (type IN ('DUPLICATE','RELATED','CHILD','CAUSED_BY')),
  score numeric(5,4) NOT NULL,
  created_by text NOT NULL CHECK (created_by IN ('SYSTEM','USER')),
  removed_at timestamptz,
  removed_reason text,
  created_at timestamptz NOT NULL,
  CONSTRAINT no_self_link CHECK (source_id <> target_id)
);

CREATE TABLE incident_feedback (
  incident_id uuid PRIMARY KEY REFERENCES incident (id),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL
);

CREATE TABLE assignment_decision (
  id uuid PRIMARY KEY,
  incident_id uuid NOT NULL REFERENCES incident (id),
  strategy text NOT NULL,
  chosen_id uuid REFERENCES app_user (id),
  rationale jsonb NOT NULL,
  created_at timestamptz NOT NULL
);
