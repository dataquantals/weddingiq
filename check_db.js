import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const VITE_SUPABASE_URL = urlMatch ? urlMatch[1].trim() : '';
const VITE_SUPABASE_ANON_KEY = keyMatch ? keyMatch[1].trim() : '';

if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
  console.error("Could not find Supabase credentials in .env");
  process.exit(1);
}

const sb = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function check() {
  console.log("Checking weddings...");
  const { data: wData, error: wErr } = await sb.from('weddings').select('*');
  if (wErr) {
    console.error("Weddings Error:", wErr);
  } else {
    console.log("Weddings found:", wData?.length);
    console.log(JSON.stringify(wData, null, 2));
  }

  console.log("\nChecking guests...");
  const { data: gData, error: gErr } = await sb.from('guests').select('*').limit(3);
  if (gErr) {
    console.error("Guests Error:", gErr);
  } else {
    console.log("Guests found:", gData?.length, "showing up to 3");
    console.log(JSON.stringify(gData, null, 2));
  }
}

check();
