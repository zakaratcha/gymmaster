CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  trainer_id TEXT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exercises_trainer_id ON exercises(trainer_id);
CREATE INDEX IF NOT EXISTS idx_exercises_trainer_archived ON exercises(trainer_id, archived_at);
