
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log('Checking Supabase tables...');
  const { data, error } = await supabase.from('tasks').select('id').limit(1);
  
  if (error) {
    console.error('❌ Connection failed or tables missing:', error.message);
    if (error.message.includes('relation "public.tasks" does not exist')) {
        console.log('👉 Hint: You need to run the SQL setup script in your Supabase SQL Editor.');
    }
  } else {
    console.log('✅ Connected successfully! Tables are ready.');
  }
}

check();
