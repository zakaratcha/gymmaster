CREATE TABLE IF NOT EXISTS planned_workouts (
  id TEXT PRIMARY KEY,
  trainer_id TEXT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  planned_date TEXT NOT NULL,
  split_tag TEXT NOT NULL CHECK(length(trim(split_tag)) > 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_planned_workouts_trainer_client_date
  ON planned_workouts(trainer_id, client_id, planned_date);

CREATE TABLE IF NOT EXISTS planned_exercises (
  id TEXT PRIMARY KEY,
  trainer_id TEXT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  planned_workout_id TEXT NOT NULL REFERENCES planned_workouts(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  position INTEGER NOT NULL CHECK(position >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_planned_exercises_workout_position
  ON planned_exercises(trainer_id, planned_workout_id, position);

CREATE UNIQUE INDEX IF NOT EXISTS uq_planned_exercises_workout_position
  ON planned_exercises(planned_workout_id, position);

CREATE TABLE IF NOT EXISTS planned_sets (
  id TEXT PRIMARY KEY,
  trainer_id TEXT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  planned_exercise_id TEXT NOT NULL REFERENCES planned_exercises(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK(position >= 0),
  reps INTEGER NOT NULL CHECK(reps > 0),
  weight_kg REAL NOT NULL CHECK(weight_kg >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_planned_sets_exercise_position
  ON planned_sets(trainer_id, planned_exercise_id, position);

CREATE UNIQUE INDEX IF NOT EXISTS uq_planned_sets_exercise_position
  ON planned_sets(planned_exercise_id, position);
