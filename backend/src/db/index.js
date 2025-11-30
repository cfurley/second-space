import pkg from "pg";
const { Pool } = pkg;

// ===== CRITICAL: NO HARD-CODED CREDENTIALS =====
const requiredEnvVars = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
};

// Validate all required variables exist (fail-fast)
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ FATAL: Missing required environment variables:');
  console.error(`   ${missingVars.join(', ')}`);
  console.error('💡 Set these in your .env file (see .env.example)');
  process.exit(1); // Fail immediately if credentials missing
}

const connectionString = process.env.DATABASE_URL || 
  `postgresql://${requiredEnvVars.DB_USER}:${requiredEnvVars.DB_PASSWORD}@${requiredEnvVars.DB_HOST}:${requiredEnvVars.DB_PORT}/${requiredEnvVars.DB_NAME}`;

console.log(`🗄️  Connecting to database at ${requiredEnvVars.DB_HOST}:${requiredEnvVars.DB_PORT}/${requiredEnvVars.DB_NAME}`);

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // SSL configuration for production (Render requires this)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

export default pool;
