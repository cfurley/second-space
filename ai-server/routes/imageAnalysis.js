import express from 'express';
import aiService from '../services/aiService.js';

const router = express.Router();

/**
 * POST /api/analyze/image
 * Analyze an image using AI (UPGRADED with GPT-4o and local Ollama support)
 */
router.post('/image', async (req, res) => {
  try {
    const { imageUrl, prompt, model, detail } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const options = {};
    if (model) options.model = model;
    if (detail) options.detail = detail;

    // Use smart routing - tries local first, falls back to OpenAI
    const result = await aiService.analyzeImageSmart(imageUrl, prompt, options);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      analysis: result.data,
      model: result.model,
      usage: result.usage || null,
      cost: result.cost || 0,
      local: result.local || false,
      provider: result.provider || 'openai',
      raw: result.rawResponse,
    });
  } catch (error) {
    console.error('Error in image analysis:', error);
    res.status(500).json({ error: error.message });
  }
});
