import pkg from "pg";
const { Pool } = pkg;

// Build connection string from environment variables
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || '5432';
const dbUser = process.env.DB_USER || 'myuser';
const dbPassword = process.env.DB_PASSWORD || 'mypassword';
const dbName = process.env.DB_NAME || 'mydatabase';

// Support both connection string (Render) and individual params (Docker)
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

console.log(`🗄️  Connecting to database at ${dbHost}:${dbPort}/${dbName}`);

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
