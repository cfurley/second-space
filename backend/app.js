import express from 'express';
import { Client } from 'pg';

const app = express();
const PORT = 8080;
const HOST = '0.0.0.0';

// Connect to the PostgreSQL Database.  
/*
const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});
client.connect();
*/

// Add this middleware to your Express app to parse JSON bodies
app.use(express.json());

// Define a route for the home page ("/")
app.get('/', (req, res) => {
  res.send('Hello Backend!');
});

// === API Routes for CRUD operations ===

/*
// Endpoint to retrieve all todo items
app.get('/api/todos', async (req, res) => {
  try {
    const queryText = 'SELECT * FROM todos ORDER BY created_at ASC';
    const result = await client.query(queryText);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Failed to retrieve todo items.' });
  }
});
*/

// Endpoint to create a new todo item
/*
app.post('/api/test', async (req, res) => {
  try {
    const { description } = req.body;
    const queryText = 'INSERT INTO todos(description) VALUES($1) RETURNING *';
    const result = await client.query(queryText, [description]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({ error: 'Failed to create todo item.' });
  }
});
*/

// Start the server and listen for connections
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
