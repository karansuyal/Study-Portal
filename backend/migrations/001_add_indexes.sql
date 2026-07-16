-- Run this once against your Render PostgreSQL database to add the indexes
-- that models.py now declares. models.py's index=True only takes effect on
-- db.create_all(), which only creates NEW tables — it does NOT alter tables
-- that already exist. So this file is how the indexes actually reach your
-- live data.
--
-- How to run it:
--   1. Get your DATABASE_URL from the Render dashboard (Environment tab)
--   2. From your machine (needs psql installed):
--        psql "<your DATABASE_URL>" -f migrations/001_add_indexes.sql
--   OR open a Render Shell for the database and paste these statements in.
--
-- IF NOT EXISTS makes this safe to run more than once.

CREATE INDEX IF NOT EXISTS ix_users_branch ON users (branch);
CREATE INDEX IF NOT EXISTS ix_users_semester ON users (semester);
CREATE INDEX IF NOT EXISTS ix_users_role ON users (role);

CREATE INDEX IF NOT EXISTS ix_courses_branch ON courses (branch);
CREATE INDEX IF NOT EXISTS ix_courses_semester ON courses (semester);

CREATE INDEX IF NOT EXISTS ix_subjects_semester ON subjects (semester);
CREATE INDEX IF NOT EXISTS ix_subjects_course_id ON subjects (course_id);

CREATE INDEX IF NOT EXISTS ix_notes_course_id ON notes (course_id);
CREATE INDEX IF NOT EXISTS ix_notes_subject_id ON notes (subject_id);
CREATE INDEX IF NOT EXISTS ix_notes_user_id ON notes (user_id);
CREATE INDEX IF NOT EXISTS ix_notes_status ON notes (status);
CREATE INDEX IF NOT EXISTS ix_notes_note_type ON notes (note_type);
CREATE INDEX IF NOT EXISTS ix_notes_uploaded_at ON notes (uploaded_at);

CREATE INDEX IF NOT EXISTS ix_user_ratings_note_id ON user_ratings (note_id);
CREATE INDEX IF NOT EXISTS ix_user_ratings_user_id ON user_ratings (user_id);

-- A composite index for the single most common query pattern:
-- "give me approved notes for this course" (used by /api/notes and /api/materials)
CREATE INDEX IF NOT EXISTS ix_notes_course_status ON notes (course_id, status);
