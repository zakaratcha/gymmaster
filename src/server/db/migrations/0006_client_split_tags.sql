CREATE TABLE IF NOT EXISTS client_split_tags (
  id TEXT PRIMARY KEY,
  trainer_id TEXT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  tag TEXT NOT NULL CHECK(length(trim(tag)) > 0),
  tag_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(client_id, tag_key)
);

CREATE INDEX IF NOT EXISTS idx_client_split_tags_trainer_client
  ON client_split_tags(trainer_id, client_id);
