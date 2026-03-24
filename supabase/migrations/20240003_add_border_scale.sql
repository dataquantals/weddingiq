-- Add border_scale column to card_canvas table
ALTER TABLE card_canvas
  ADD COLUMN IF NOT EXISTS border_scale NUMERIC DEFAULT 1;
