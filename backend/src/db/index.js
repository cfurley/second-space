import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_STRING,
  max: 20,
  idleTimeoutMillis: 3000000,
  connectionTimeoutMillis: 200000,
});

export default pool;
