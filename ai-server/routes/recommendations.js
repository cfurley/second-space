import express from 'express';
import aiService from '../services/aiService.js';

const router = express.Router();

/**
 * POST /api/recommendations/similar
 * Get recommendations based on existing content (UPGRADED)
 */
router.post('/similar', async (req, res) => {
  try {
    const { tags, context, count, type, model } = req.body;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: 'Tags array is required' });
    }

    const options = {};
    if (count) options.count = count;
    if (type) options.type = type;
    if (model) options.model = model;

    const result = await aiService.getRecommendations(tags, context, options);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      recommendations: result.recommendations,
      model: result.model,
      usage: result.usage,
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/recommendations/space
 * Get space recommendations based on user's content (UPGRADED)
 */
router.post('/space', async (req, res) => {
  try {
    const { userId, existingSpaces, count, model } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Extract tags from existing spaces
    const allTags = existingSpaces
      ? existingSpaces.flatMap(space => space.tags || [])
      : [];

    const options = {
      type: 'spaces',
      count: count || 5,
    };
    if (model) options.model = model;

    const result = await aiService.getRecommendations(
      allTags,
      'Suggest new space themes based on user\'s existing content',
      options
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      spaceRecommendations: result.recommendations,
      model: result.model,
      usage: result.usage,
    });
  } catch (error) {
    console.error('Error getting space recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/recommendations/themes
 * Get visual theme recommendations (NEW)
 */
router.post('/themes', async (req, res) => {
  try {
    const { tags, currentTheme, count, model } = req.body;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: 'Tags array is required' });
    }

    const context = currentTheme 
      ? `User currently uses ${currentTheme} theme.`
      : '';

    const options = {
      type: 'themes',
      count: count || 7,
    };
    if (model) options.model = model;

    const result = await aiService.getRecommendations(tags, context, options);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      themeRecommendations: result.recommendations,
      model: result.model,
      usage: result.usage,
    });
  } catch (error) {
    console.error('Error getting theme recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/recommendations/media
 * Get media type recommendations (NEW)
 */
router.post('/media', async (req, res) => {
  try {
    const { tags, existingMedia, count, model } = req.body;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: 'Tags array is required' });
    }

    const context = existingMedia
      ? `User has ${existingMedia.length} existing media items.`
      : '';

    const options = {
      type: 'media',
      count: count || 7,
    };
    if (model) options.model = model;

    const result = await aiService.getRecommendations(tags, context, options);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      mediaRecommendations: result.recommendations,
      model: result.model,
      usage: result.usage,
    });
  } catch (error) {
    console.error('Error getting media recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
