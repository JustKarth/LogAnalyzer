INSERT INTO roles (name) VALUES
('ADMIN'),
('ANALYST'),
('VIEWER')
ON CONFLICT DO NOTHING;

-- Seed default log source used by processor.py
INSERT INTO log_sources (id, name, type, status) 
VALUES ('source_001', 'Default Ingestion Source', 'SIMULATOR', 'ACTIVE')
ON CONFLICT DO NOTHING;