import express from 'express';
import aiService from '../services/aiService.js';

const router = express.Router();

/**
 * POST /api/chat/message
 * Direct chat with AI about user's content
 * Now supports FREE local AI (Ollama) with OpenAI fallback
 */
router.post('/message', async (req, res) => {
  try {
    const { message, context, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Use smart routing - tries local first, falls back to OpenAI
    const result = await aiService.chatWithAISmart(message, context, conversationHistory);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      reply: result.reply,
      model: result.model,
      usage: result.usage || null,
      cost: result.cost || 0,
      local: result.local || false,
      conversationId: result.conversationId,
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/ask-about-content
 * Ask AI questions about specific content
 */
router.post('/ask-about-content', async (req, res) => {
  try {
    const { question, contentType, contentIds, userId } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const context = await buildContextFromContent(contentType, contentIds, userId);
    const result = await aiService.answerQuestion(question, context);

    res.json({
      success: true,
      answer: result.answer,
      relevantContent: result.relevantContent,
      suggestions: result.suggestions,
    });
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper: Build context from user content
 */
async function buildContextFromContent(contentType, contentIds, userId) {
  const context = {
    contentType,
    items: [],
    userPreferences: {},
  };

  // TODO: Integrate with your database when ready
  if (contentType === 'spaces') {
    // context.items = await getSpacesByIds(contentIds);
  }

  return context;
}

export default router;
