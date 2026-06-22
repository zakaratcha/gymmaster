CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  trainer_id TEXT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  body_weight_kg REAL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clients_trainer_id ON clients(trainer_id);
