-- Add lead verification columns to contact_requests
ALTER TABLE contact_requests
  ADD COLUMN IF NOT EXISTS email_verified   boolean  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone_verified   boolean  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_score integer NOT NULL DEFAULT 0;

-- Index for fast vendor dashboard queries on verification score
CREATE INDEX IF NOT EXISTS idx_contact_requests_vendor_score
  ON contact_requests (vendor_id, verification_score);
