import express from 'express';
import aiService from '../services/aiService.js';

const router = express.Router();

/**
 * POST /api/organize/auto
 * Automatically organize media into categories (UPGRADED)
 */
router.post('/auto', async (req, res) => {
  try {
    const { mediaItems, maxCategories, model } = req.body;

    if (!mediaItems || !Array.isArray(mediaItems) || mediaItems.length === 0) {
      return res.status(400).json({ error: 'Media items array is required' });
    }

    if (mediaItems.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 items per request' });
    }

    const options = {};
    if (maxCategories) options.maxCategories = maxCategories;
    if (model) options.model = model;

    const result = await aiService.organizeMedia(mediaItems, options);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      categories: result.categories,
      totalItems: result.totalItems,
      categoryCount: result.categoryCount,
      model: result.model,
      usage: result.usage,
    });
  } catch (error) {
    console.error('Error organizing media:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/organize/suggest-spaces
 * Suggest new space organizations based on media (UPGRADED)
 */
router.post('/suggest-spaces', async (req, res) => {
  try {
    const { mediaItems, currentSpaces, maxCategories, model } = req.body;

    if (!mediaItems || !Array.isArray(mediaItems)) {
      return res.status(400).json({ error: 'Media items array is required' });
    }

    const options = {};
    if (maxCategories) options.maxCategories = maxCategories;
    if (model) options.model = model;

    const result = await aiService.organizeMedia(mediaItems, options);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // Transform categories into space suggestions
    const spaceSuggestions = Object.entries(result.categories).map(
      ([categoryName, itemIndices]) => ({
        suggestedName: categoryName,
        description: `A space for ${categoryName.toLowerCase()} content`,
        icon: getIconForCategory(categoryName),
        mediaCount: itemIndices.length,
        mediaItems: itemIndices.map(idx => mediaItems[idx]),
        priority: calculatePriority(itemIndices.length, mediaItems.length),
      })
    );

    // Sort by priority (most items first)
    spaceSuggestions.sort((a, b) => b.priority - a.priority);

    res.json({
      success: true,
      suggestions: spaceSuggestions,
      totalSuggestions: spaceSuggestions.length,
      model: result.model,
      usage: result.usage,
    });
  } catch (error) {
    console.error('Error suggesting spaces:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/organize/merge
 * Suggest merging similar spaces (NEW)
 */
router.post('/merge', async (req, res) => {
  try {
    const { spaces, threshold } = req.body;

    if (!spaces || !Array.isArray(spaces) || spaces.length < 2) {
      return res.status(400).json({ error: 'At least 2 spaces required' });
    }

    // Compare space titles and descriptions for similarity
    const mergeSuggestions = [];
    
    for (let i = 0; i < spaces.length; i++) {
      for (let j = i + 1; j < spaces.length; j++) {
        const space1 = spaces[i];
        const space2 = spaces[j];
        
        // Simple similarity check (can be improved with AI)
        const similarity = calculateSimilarity(
          space1.title + ' ' + (space1.description || ''),
          space2.title + ' ' + (space2.description || '')
        );

        if (similarity > (threshold || 0.5)) {
          mergeSuggestions.push({
            space1: space1.title,
            space2: space2.title,
            similarity: similarity,
            suggestedName: suggestMergedName(space1.title, space2.title),
            reason: `These spaces have ${Math.round(similarity * 100)}% similar content`,
          });
        }
      }
    }

    res.json({
      success: true,
      suggestions: mergeSuggestions,
      totalSuggestions: mergeSuggestions.length,
    });
  } catch (error) {
    console.error('Error suggesting merges:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper: Get icon for category name
 */
function getIconForCategory(categoryName) {
  const iconMap = {
    nature: '??',
    travel: '??',
    food: '???',
    fitness: '??',
    art: '??',
    music: '??',
    books: '??',
    technology: '??',
    fashion: '??',
    photography: '??',
    pets: '??',
    home: '??',
    work: '??',
    health: '??',
    sports: '?',
    gaming: '??',
    movies: '??',
    default: '??',
  };

  const lowerCategory = categoryName.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lowerCategory.includes(key)) {
      return icon;
    }
  }
  return iconMap.default;
}

/**
 * Helper: Calculate priority score
 */
function calculatePriority(itemCount, totalItems) {
  const percentageOfTotal = (itemCount / totalItems) * 100;
  
  // Higher priority for categories with more items
  if (percentageOfTotal > 30) return 3; // High
  if (percentageOfTotal > 15) return 2; // Medium
  return 1; // Low
}

/**
 * Helper: Calculate text similarity (simple version)
 */
function calculateSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Helper: Suggest merged name
 */
function suggestMergedName(name1, name2) {
  // Simple approach: use the shorter name or combine
  if (name1.length < name2.length) return name1;
  if (name2.length < name1.length) return name2;
  return `${name1} & ${name2}`;
}

export default router;
