-- Premium Notes feature: adds is_premium/price to notes, and a new
-- purchases table that tracks both manual UPI-QR payments and Razorpay
-- payments.
--
-- Like 001_add_indexes.sql, models.py's column/index declarations only take
-- effect for db.create_all() on brand-new tables. Your `notes` table
-- already exists on Render, so run this once against your live DB:
--
--   psql "<your DATABASE_URL>" -f migrations/002_add_premium_notes.sql
--
-- IF NOT EXISTS / IF NOT EXISTS-equivalents make this safe to run twice.

ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS price INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS ix_notes_is_premium ON notes (is_premium);

CREATE TABLE IF NOT EXISTS purchases (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_id             INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    amount              INTEGER NOT NULL,
    method              VARCHAR(20) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
    utr_reference       VARCHAR(100),
    proof_url           VARCHAR(500),
    razorpay_order_id   VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature  VARCHAR(200),
    rejection_reason    TEXT,
    reviewed_by         INTEGER REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at         TIMESTAMPTZ,

    CONSTRAINT chk_purchases_method CHECK (method IN ('upi_manual', 'razorpay')),
    CONSTRAINT chk_purchases_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS ix_purchases_user_id ON purchases (user_id);
CREATE INDEX IF NOT EXISTS ix_purchases_note_id ON purchases (note_id);
CREATE INDEX IF NOT EXISTS ix_purchases_status ON purchases (status);
CREATE INDEX IF NOT EXISTS ix_purchases_razorpay_order_id ON purchases (razorpay_order_id);

-- A user can have many pending/rejected attempts for the same note (e.g. a
-- wrong UTR the first time) but can never end up with two APPROVED rows for
-- the same note — this partial unique index enforces that at the DB level,
-- not just in application code.
CREATE UNIQUE INDEX IF NOT EXISTS ux_purchases_user_note_approved
    ON purchases (user_id, note_id)
    WHERE status = 'approved';
