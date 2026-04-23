const fs = require('fs');
const path = require('path');
require('dotenv').config();

const requiredEnv = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'PORT',
  'OPENAI_API_KEY',
  'VITE_API_BASE'
];

function checkEnv() {
  console.log('🔍 Checking environment variables...\n');
  
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ ERROR: .env file not found in root directory!');
    process.exit(1);
  }

  let missing = [];
  requiredEnv.forEach(key => {
    const value = process.env[key];
    if (value === undefined) {
      missing.push(`${key} (is missing entirely)`);
    } else if (value.trim() === '' && key !== 'DB_PASSWORD') {
      missing.push(`${key} (is empty)`);
    } else {
      console.log(`✅ ${key}: Found`);
    }
  });

  if (missing.length > 0) {
    console.log('\n⚠️  MISSING SECRETS FOUND:');
    missing.forEach(m => console.log(`   - ${m}`));
    console.log('\nAction required: Add these keys to your .env file or deployment provider (Render/Netlify).');
  } else {
    console.log('\n✨ All required environment variables are present and set!');
  }
}

checkEnv();
