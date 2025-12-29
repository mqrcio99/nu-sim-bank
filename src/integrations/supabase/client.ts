import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zbzcqbollkkihlyqbgjq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiemNxYm9sbGtraWhseXFiZ2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NzM2MDEsImV4cCI6MjA4MjU0OTYwMX0.IvTLGX5_fKfshRykz9fXhCae-5YEoNid0FnJF-ulGvI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
