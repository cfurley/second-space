import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://myuser:mypassword@database:5432/mydatabase",
  max: 20,
  idleTimeoutMillis: 3000000,
  connectionTimeoutMillis: 200000,
});

export default pool;
