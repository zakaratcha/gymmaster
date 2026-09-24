CREATE TABLE IF NOT EXISTS workout_sessions (
  id TEXT PRIMARY KEY,
  trainer_id TEXT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  planned_workout_id TEXT REFERENCES planned_workouts(id) ON DELETE SET NULL,
  split_tag TEXT NOT NULL CHECK(length(trim(split_tag)) > 0),
  status TEXT NOT NULL CHECK(status IN ('in_progress', 'completed')),
  started_at TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK(
    (status = 'in_progress' AND completed_at IS NULL)
    OR (status = 'completed' AND completed_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_trainer_client
  ON workout_sessions(trainer_id, client_id);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_trainer_client_status
  ON workout_sessions(trainer_id, client_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS uq_workout_sessions_trainer_client_active
  ON workout_sessions(trainer_id, client_id)
  WHERE status = 'in_progress';

CREATE TABLE IF NOT EXISTS session_exercises (
  id TEXT PRIMARY KEY,
  trainer_id TEXT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  workout_session_id TEXT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  position INTEGER NOT NULL CHECK(position >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_exercises_workout_position
  ON session_exercises(trainer_id, workout_session_id, position);

CREATE UNIQUE INDEX IF NOT EXISTS uq_session_exercises_workout_position
  ON session_exercises(workout_session_id, position);

CREATE TABLE IF NOT EXISTS session_sets (
  id TEXT PRIMARY KEY,
  trainer_id TEXT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  session_exercise_id TEXT NOT NULL REFERENCES session_exercises(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK(position >= 0),
  reps INTEGER NOT NULL CHECK(reps > 0),
  weight_kg REAL NOT NULL CHECK(weight_kg >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_sets_exercise_position
  ON session_sets(trainer_id, session_exercise_id, position);

CREATE UNIQUE INDEX IF NOT EXISTS uq_session_sets_exercise_position
  ON session_sets(session_exercise_id, position);
