import express from 'express';

const router = express.Router();

const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://ai-server:3000';

// Health check
router.get('/health', async (req, res) => {
  try {
    const response = await fetch(`${AI_SERVER_URL}/health`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ 
      error: 'AI service unavailable',
      message: error.message 
    });
  }
});

// List available models
router.get('/models', async (req, res) => {
  try {
    const response = await fetch(`${AI_SERVER_URL}/models`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch models',
      message: error.message 
    });
  }
});

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { messages, model, stream } = req.body;

    const response = await fetch(`${AI_SERVER_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, model, stream }),
    });

    if (stream) {
      // Forward streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      response.body.pipe(res);
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Chat request failed',
      message: error.message 
    });
  }
});

// Generate endpoint
router.post('/generate', async (req, res) => {
  try {
    const { prompt, model, stream } = req.body;

    const response = await fetch(`${AI_SERVER_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, model, stream }),
    });

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      response.body.pipe(res);
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Generate request failed',
      message: error.message 
    });
  }
});

export default router;
