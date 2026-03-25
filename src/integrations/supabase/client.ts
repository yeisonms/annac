import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wlxfzzilelmsftxwsopu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndseGZ6emlsZWxtc2Z0eHdzb3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTIwMDAsImV4cCI6MjA4OTk4ODAwMH0.SKWqn6v-4Fax-Y3td3hhqu77wPAhY6bHWPkZPwSCQow';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
