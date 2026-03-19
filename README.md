# WeddingIQ 💍

Full-stack wedding invitation management — Vite + React, Supabase, DeepSeek AI.

## Quick Start

```bash
unzip weddingiq-app.zip && cd weddingiq-app
npm install
npm run dev
# Opens at http://localhost:3001
```

## Supabase SQL (run once)

```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, email TEXT, phone TEXT,
  table_number INT, plus_ones INT DEFAULT 0,
  checked_in BOOLEAN DEFAULT FALSE, checked_in_at TIMESTAMPTZ,
  rsvp_status TEXT DEFAULT 'pending', ai_message TEXT,
  qr_token TEXT UNIQUE DEFAULT gen_random_uuid(),
  photo_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON guests FOR ALL USING (true);
```

Create a **public** Storage bucket named `guest-photos`.

## Special URLs

| URL | Purpose |
|---|---|
| `/?gate=1` | Gate scanner (share with doorman) |
| `/?rsvp=GUEST_ID` | Guest self-upload photo |
| `/?invite=QR_TOKEN` | Guest invite card view |

## Environment

`.env` is pre-filled. Regenerate your DeepSeek key before going public.
