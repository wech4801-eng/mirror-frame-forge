-- Add new customization columns to landing_pages
ALTER TABLE public.landing_pages
  ADD COLUMN IF NOT EXISTS subtitle TEXT,
  ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#8b5cf6',
  ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#0f172a',
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '[]'::jsonb;

-- Update default form_fields to be empty by default (will use custom_fields)
ALTER TABLE public.landing_pages 
  ALTER COLUMN form_fields SET DEFAULT '[]'::jsonb;