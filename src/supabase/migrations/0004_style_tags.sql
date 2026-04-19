-- Add style_tags column to vendors for Style Quiz matching
ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS style_tags text[] DEFAULT '{}';

-- Index for array containment queries
CREATE INDEX IF NOT EXISTS idx_vendors_style_tags ON vendors USING GIN (style_tags);
