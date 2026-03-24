-- Card Canvas persistence table
-- Run this once in your Supabase SQL Editor (Database > SQL Editor)

create table if not exists public.card_canvas (
  user_id       text        not null,
  wedding_id    text        not null default 'default',
  canvas_pages  jsonb       not null default '[]'::jsonb,
  selected_border jsonb     null,
  border_category text      null,
  updated_at    timestamptz not null default now(),
  primary key (user_id, wedding_id)
);

-- Enable RLS
alter table public.card_canvas enable row level security;

-- Users can only read/write their own canvas rows
create policy "card_canvas_owner" on public.card_canvas
  using  (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);
