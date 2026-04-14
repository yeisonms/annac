import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf-8');
const envUrl = env.split('\n').find(line => line.startsWith('VITE_SUPABASE_URL'))?.split('=')[1]?.trim();
const envKey = env.split('\n').find(line => line.startsWith('VITE_SUPABASE_ANON_KEY'))?.split('=')[1]?.trim();

const supabase = createClient(envUrl, envKey);

async function check() {
  const { data, error } = await supabase.from('perfiles').select('*');
  console.log('perfiles error?', error);
  console.log('perfiles data?', data);
}

check();
