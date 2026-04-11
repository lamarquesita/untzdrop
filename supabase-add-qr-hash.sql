-- Add qr_hash column to listings table for duplicate detection
ALTER TABLE listings ADD COLUMN IF NOT EXISTS qr_hash TEXT;
CREATE INDEX IF NOT EXISTS listings_qr_hash_idx ON listings(qr_hash);
