CREATE TABLE audit_record (
  id bigserial PRIMARY KEY,
  incident_id uuid NOT NULL REFERENCES incident (id),
  chain_index integer NOT NULL,
  ts timestamptz NOT NULL,
  actor_id uuid,
  actor_type text NOT NULL CHECK (actor_type IN ('USER','SYSTEM','AI','MCP')),
  action text NOT NULL,
  prev_state text,
  new_state text,
  description text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  prev_hash char(64) NOT NULL,
  hash char(64) NOT NULL,
  UNIQUE (incident_id, chain_index)
);

CREATE OR REPLACE FUNCTION audit_immutable() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'audit_record is append-only'; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_no_change BEFORE UPDATE OR DELETE OR TRUNCATE ON audit_record
  FOR EACH STATEMENT EXECUTE FUNCTION audit_immutable();

CREATE TABLE sla_timer (
  id bigserial PRIMARY KEY,
  incident_id uuid NOT NULL REFERENCES incident (id),
  kind text NOT NULL CHECK (kind IN (
    'RESP_WARN_50','RESP_WARN_75','RESP_WARN_90','RESP_BREACH',
    'RES_WARN_50','RES_WARN_75','RES_WARN_90','RES_BREACH',
    'ESC_L2','ESC_L3','ESC_L4','AUTO_VERIFY_72H','USER_REMIND_24H'
  )),
  generation integer NOT NULL,
  due_at timestamptz NOT NULL,
  fired_at timestamptz,
  cancelled_at timestamptz,
  UNIQUE (incident_id, kind, generation)
);
CREATE INDEX sla_timer_due ON sla_timer (due_at) WHERE fired_at IS NULL AND cancelled_at IS NULL;

CREATE TABLE knowledge_article (
  id uuid PRIMARY KEY,
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  body text NOT NULL,
  service_id uuid REFERENCES it_service (id),
  category_id uuid REFERENCES category (id),
  status text NOT NULL CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  source_incident_id uuid REFERENCES incident (id),
  embedding vector(384),
  model_version text,
  search_tsv tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))) STORED,
  published_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL
);
CREATE INDEX kb_tsv_gin ON knowledge_article USING gin (search_tsv);
CREATE INDEX kb_emb_hnsw ON knowledge_article USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

CREATE TABLE ai_suggestion (
  id uuid PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('DUPLICATE','CLASSIFY','PRIORITY','ASSIGN','SLA_RISK','RESOLUTION','RCA','PIR','NL_SEARCH')),
  incident_id uuid REFERENCES incident (id),
  value jsonb NOT NULL,
  confidence numeric(4,3) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
  source text NOT NULL CHECK (source IN ('RULES','KNN','LLM','ONNX','REPLAY')),
  model text NOT NULL,
  prompt_version text NOT NULL,
  input_hash char(64) NOT NULL,
  latency_ms integer NOT NULL,
  fallback boolean NOT NULL DEFAULT false,
  flagged boolean NOT NULL DEFAULT false,
  outcome text CHECK (outcome IN ('ACCEPTED','EDITED','REJECTED','IGNORED')),
  outcome_by uuid REFERENCES app_user (id),
  override_value jsonb,
  created_at timestamptz NOT NULL
);

CREATE TABLE notification (
  id uuid PRIMARY KEY,
  recipient_id uuid NOT NULL REFERENCES app_user (id),
  incident_id uuid REFERENCES incident (id),
  channel text NOT NULL CHECK (channel IN ('IN_APP','EMAIL','WEB_PUSH','TELEGRAM','SMS_SIM')),
  template text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','SENT','FAILED','READ')),
  attempts smallint NOT NULL DEFAULT 0,
  idempotency_key text NOT NULL UNIQUE,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz NOT NULL
);

CREATE TABLE ledger_anchor (
  day date PRIMARY KEY,
  root_hash char(64) NOT NULL,
  heads jsonb NOT NULL,
  created_at timestamptz NOT NULL
);

CREATE TABLE idempotency_key (
  key text PRIMARY KEY,
  actor_id uuid NOT NULL,
  request_hash char(64) NOT NULL,
  response_status integer NOT NULL,
  response_body jsonb NOT NULL,
  created_at timestamptz NOT NULL
);

CREATE TABLE app_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_by uuid REFERENCES app_user (id),
  updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS event_publication (
  id uuid NOT NULL PRIMARY KEY,
  listener_id text NOT NULL,
  event_type text NOT NULL,
  serialized_event text NOT NULL,
  publication_date timestamptz NOT NULL,
  completion_date timestamptz
);
CREATE INDEX IF NOT EXISTS event_publication_by_completion_date_idx
  ON event_publication (completion_date);

DO $$
BEGIN
  GRANT USAGE ON SCHEMA public TO itsm_app;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO itsm_app;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO itsm_app;
  REVOKE UPDATE, DELETE, TRUNCATE ON TABLE audit_record FROM itsm_app;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Managed NeonDB role skip';
END $$;
