import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cbrciexsfyaqmcagoksj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNicmNpZXhzZnlhcW1jYWdva3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4NzQxODksImV4cCI6MjEwNzQ1MDE4OX0.GBqQukDJ0z7VTMwdfMpCBF7SdY4CMpQ4iYTOChZG1CM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
