CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE organisations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    organisation_id INTEGER REFERENCES organisations(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE log_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    host VARCHAR(255),
    address VARCHAR(255),
    protocol VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    organisation_id INTEGER REFERENCES organisations(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE raw_logs (
    id BIGSERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES log_sources(id),
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    raw_data JSONB NOT NULL
);

CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    event_id UUID NOT NULL UNIQUE,
    source_id INTEGER REFERENCES log_sources(id),
    timestamp TIMESTAMPTZ NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50),
    user_name VARCHAR(255),
    src_ip INET,
    dst_ip INET,
    host VARCHAR(255),
    message TEXT,
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE TABLE detection_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(100),
    severity VARCHAR(50),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    rule_config JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE detections (
    id BIGSERIAL PRIMARY KEY,
    rule_id INTEGER REFERENCES detection_rules(id),
    event_id BIGINT REFERENCES events(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE TABLE incidents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE incident_events (
    incident_id BIGINT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    PRIMARY KEY (incident_id, event_id)
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    target_type VARCHAR(100),
    target_id VARCHAR(255),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE TABLE blockchain_records (
    id BIGSERIAL PRIMARY KEY,
    record_type VARCHAR(100) NOT NULL,
    record_id BIGINT NOT NULL,
    hash VARCHAR(255) NOT NULL,
    transaction_hash VARCHAR(255),
    block_number BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_raw_logs_source_id ON raw_logs(source_id);
CREATE INDEX idx_raw_logs_received_at ON raw_logs(received_at);
CREATE INDEX idx_events_source_id ON events(source_id);
CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_src_ip ON events(src_ip);
CREATE INDEX idx_events_dst_ip ON events(dst_ip);
CREATE INDEX idx_detections_event_id ON detections(event_id);
CREATE INDEX idx_detections_rule_id ON detections(rule_id);
CREATE INDEX idx_incident_events_event_id ON incident_events(event_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);