import express from 'express';
import cors from 'cors';
import { Ollama } from 'ollama';

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Initialize Ollama client
const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://ollama:11434'
});

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:8080',
      'http://localhost:80',
      'http://localhost',
      'http://backend:8080',
    ];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ai-server',
    timestamp: new Date().toISOString()
  });
});

// List available models
app.get('/models', async (req, res) => {
  try {
    const models = await ollama.list();
    res.json({ models: models.models });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ 
      error: 'Failed to fetch models',
      message: error.message 
    });
  }
});

// Chat endpoint - streaming response
app.post('/chat', async (req, res) => {
  try {
    const { messages, model = 'llama3.2', stream = false } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Invalid request: messages array is required' 
      });
    }

    if (stream) {
      // Set up Server-Sent Events for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const response = await ollama.chat({
        model,
        messages,
        stream: true,
      });

      for await (const part of response) {
        res.write(`data: ${JSON.stringify(part)}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      // Non-streaming response
      const response = await ollama.chat({
        model,
        messages,
        stream: false,
      });

      res.json({
        message: response.message,
        model: response.model,
        created_at: response.created_at,
        done: response.done,
      });
    }
  } catch (error) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Chat request failed',
        message: error.message 
      });
    }
  }
});

// Generate endpoint for simple completions
app.post('/generate', async (req, res) => {
  try {
    const { prompt, model = 'llama3.2', stream = false } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        error: 'Invalid request: prompt is required' 
      });
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const response = await ollama.generate({
        model,
        prompt,
        stream: true,
      });

      for await (const part of response) {
        res.write(`data: ${JSON.stringify(part)}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      const response = await ollama.generate({
        model,
        prompt,
        stream: false,
      });

      res.json({
        response: response.response,
        model: response.model,
        created_at: response.created_at,
        done: response.done,
      });
    }
  } catch (error) {
    console.error('Generate error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Generate request failed',
        message: error.message 
      });
    }
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

app.listen(PORT, HOST, () => {
  console.log(`AI Server running on http://${HOST}:${PORT}`);
  console.log(`Ollama host: ${process.env.OLLAMA_HOST || 'http://ollama:11434'}`);
});
