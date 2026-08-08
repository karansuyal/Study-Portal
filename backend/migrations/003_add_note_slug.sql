-- SEO-friendly note URLs: adds a `slug` column to notes and backfills every
-- existing row so old notes get a working /notes/<slug> URL immediately,
-- not just newly-uploaded ones.
--
-- Like 001 and 002, run this once against your live DB. Easiest way is the
-- existing self-serve endpoint (no Render shell needed):
--   POST /api/admin/run-migrations   (with an admin JWT)
-- which applies every .sql file in this folder in filename order and is
-- safe to call more than once.
--
-- Backfill approach: slugify(title) + '-' + id. Appending the numeric id
-- guarantees uniqueness (ids are never reused) even if two notes share an
-- identical title, so the UNIQUE INDEX at the bottom can never fail.

ALTER TABLE notes ADD COLUMN IF NOT EXISTS slug VARCHAR(250);

UPDATE notes
SET slug = trim(both '-' from regexp_replace(lower(coalesce(title, 'note')), '[^a-z0-9]+', '-', 'g'))
           || '-' || id::text
WHERE slug IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_notes_slug ON notes (slug);
