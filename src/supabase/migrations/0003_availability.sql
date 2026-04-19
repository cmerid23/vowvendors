-- Vendor availability calendar
CREATE TABLE IF NOT EXISTS vendor_availability (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id   uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  date        date NOT NULL,
  status      text NOT NULL CHECK (status IN ('available', 'booked', 'tentative')),
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, date)
);

CREATE INDEX IF NOT EXISTS idx_vendor_availability_vendor ON vendor_availability (vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_availability_date   ON vendor_availability (date);

-- RLS
ALTER TABLE vendor_availability ENABLE ROW LEVEL SECURITY;

-- Vendors can manage their own availability
CREATE POLICY "vendor_availability_own" ON vendor_availability
  FOR ALL
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

-- Anyone can read availability (for public profile + search filtering)
CREATE POLICY "vendor_availability_public_read" ON vendor_availability
  FOR SELECT
  USING (true);
