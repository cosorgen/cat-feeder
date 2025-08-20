import type { SupabaseConfig } from './types.js';

// Supabase Configuration
// Replace these with your actual Supabase project details

export const SUPABASE_CONFIG: SupabaseConfig = {
  url: 'YOUR_SUPABASE_URL', // Replace with your Supabase project URL
  key: 'YOUR_SUPABASE_ANON_KEY', // Replace with your Supabase anon key
};

// Make config globally available
(window as any).SUPABASE_CONFIG = SUPABASE_CONFIG;

// Database table structure:
// Table name: hotdog_counter
// Columns:
// - id (int8, primary key)
// - count (int8, not null, default: 0)
// - updated_at (timestamptz, default: now())

// You'll need to create this table in your Supabase database:
/*
CREATE TABLE hotdog_counter (
    id BIGSERIAL PRIMARY KEY,
    count BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial row
INSERT INTO hotdog_counter (count) VALUES (0);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE hotdog_counter ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow reads and updates (adjust as needed)
CREATE POLICY "Allow all operations on hotdog_counter" ON hotdog_counter
FOR ALL USING (true);
*/
