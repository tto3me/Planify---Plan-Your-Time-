import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vumpsnbyytmgbpdtymrf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1bXBzbmJ5eXRtZ2JwZHR5bXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5Nzg1MTUsImV4cCI6MjA5MjU1NDUxNX0.Ce87kZnQjSQn1G3O6ptseFFpnJ_jG2aqXKUe3nvAA58';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
