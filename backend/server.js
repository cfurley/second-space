import express from 'express';

const app = express();
const PORT = 8080;
const HOST = '0.0.0.0';

// Define a route for the home page ("/")
app.get('/', (req, res) => {
  res.send('Hello Backend!');
});

// Start the server and listen for connections
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});