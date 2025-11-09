/**
 * ?? MOOD TIMELINE - Revolutionary Feature
 * 
 * AI analyzes your photos over time and creates an emotional journey
 * Shows how your moods, activities, and themes evolve throughout the year
 * 
 * This is UNIQUE - no other mood board app has this!
 */

import express from 'express';
import aiService from '../services/aiService.js';

const router = express.Router();

/**
 * POST /api/timeline/generate
 * Generate AI-powered mood timeline from user's images
 * 
 * Revolutionary Feature: Analyzes emotional patterns over time!
 */
router.post('/generate', async (req, res) => {
  try {
    const { images, dateRange, userId } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Images array is required' });
    }

    if (images.length > 50) {
      return res.status(400).json({ 
        error: 'Maximum 50 images for timeline analysis',
        hint: 'Select your most meaningful photos'
      });
    }

    console.log(`?? Generating mood timeline for ${images.length} images...`);

    // Analyze each image for mood and content
    const analyses = [];
    for (const image of images) {
      const result = await aiService.analyzeImageSmart(
        image.url,
        'Analyze the mood, emotion, and activity in this image. Be specific about feelings conveyed.'
      );

      if (result.success) {
        analyses.push({
          imageId: image.id,
          date: image.date,
          mood: result.data.mood || 'neutral',
          description: result.data.description,
          tags: result.data.tags || [],
          colors: result.data.colors || [],
          emotional_intensity: calculateEmotionalIntensity(result.data.mood)
        });
      }
    }

    // Generate timeline insights
    const timeline = generateTimelineInsights(analyses, dateRange);

    // Create narrative story
    const story = await generateEmotionalNarrative(analyses);

    res.json({
      success: true,
      timeline: timeline,
      story: story,
      totalImages: images.length,
      analyzedImages: analyses.length,
      insights: {
        dominantMood: getMostCommonMood(analyses),
        emotionalRange: calculateEmotionalRange(analyses),
        moodShifts: detectMoodShifts(analyses),
        themes: extractThemes(analyses),
        colorPalette: extractDominantColors(analyses)
      },
      cost: analyses.length * 0.005,
      local: analyses[0]?.local || false
    });

  } catch (error) {
    console.error('? Error generating mood timeline:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/timeline/compare
 * Compare mood between two time periods
 */
router.post('/compare', async (req, res) => {
  try {
    const { period1, period2 } = req.body;

    if (!period1?.images || !period2?.images) {
      return res.status(400).json({ 
        error: 'Both periods must have images array' 
      });
    }

    const analysis1 = await analyzePeriod(period1.images, period1.label || 'Period 1');
    const analysis2 = await analyzePeriod(period2.images, period2.label || 'Period 2');

    const comparison = {
      period1: analysis1,
      period2: analysis2,
      changes: {
        moodChange: compareMoods(analysis1.mood, analysis2.mood),
        activityChange: compareActivities(analysis1.themes, analysis2.themes),
        colorChange: compareColors(analysis1.colors, analysis2.colors),
        emotionalShift: calculateEmotionalShift(analysis1, analysis2)
      },
      insight: generateComparisonInsight(analysis1, analysis2)
    };

    res.json({
      success: true,
      comparison: comparison
    });

  } catch (error) {
    console.error('? Error comparing timelines:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper: Calculate emotional intensity from mood description
 */
function calculateEmotionalIntensity(mood) {
  const intensityMap = {
    // High intensity
    'ecstatic': 10, 'thrilled': 10, 'devastated': 10, 'furious': 10,
    'joyful': 9, 'excited': 9, 'angry': 9, 'terrified': 9,
    
    // Medium intensity
    'happy': 7, 'content': 7, 'sad': 7, 'anxious': 7,
    'pleased': 6, 'worried': 6, 'frustrated': 6,
    
    // Low intensity
    'calm': 4, 'peaceful': 4, 'tired': 4, 'bored': 4,
    'neutral': 3, 'indifferent': 3, 'meh': 2
  };

  const moodLower = mood?.toLowerCase() || 'neutral';
  
  for (const [key, value] of Object.entries(intensityMap)) {
    if (moodLower.includes(key)) {
      return value;
    }
  }
  
  return 5; // Default medium intensity
}

/**
 * Helper: Generate timeline insights
 */
function generateTimelineInsights(analyses, dateRange) {
  if (analyses.length === 0) return [];

  // Sort by date
  const sorted = analyses.sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  // Group by month/week
  const grouped = {};
  sorted.forEach(analysis => {
    const date = new Date(analysis.date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!grouped[month]) {
      grouped[month] = [];
    }
    grouped[month].push(analysis);
  });

  // Create timeline points
  return Object.entries(grouped).map(([month, items]) => ({
    period: month,
    periodLabel: new Date(month + '-01').toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }),
    imageCount: items.length,
    dominantMood: getMostCommonMood(items),
    averageIntensity: items.reduce((sum, item) => 
      sum + item.emotional_intensity, 0) / items.length,
    topThemes: extractThemes(items).slice(0, 3),
    colorPalette: extractDominantColors(items).slice(0, 5)
  }));
}

/**
 * Helper: Generate emotional narrative
 */
async function generateEmotionalNarrative(analyses) {
  if (analyses.length === 0) return 'No images to analyze.';

  const moods = analyses.map(a => a.mood).join(', ');
  const themes = extractThemes(analyses).slice(0, 5).join(', ');

  const prompt = `Based on these photo moods over time: ${moods}

And these recurring themes: ${themes}

Write a 2-3 sentence story about this person's emotional journey. Be poetic and insightful.`;

  const result = await aiService.chatWithAISmart(prompt);
  
  return result.success ? result.reply : 'Your journey captured in images.';
}

/**
 * Helper: Get most common mood
 */
function getMostCommonMood(analyses) {
  const moodCounts = {};
  
  analyses.forEach(a => {
    const mood = a.mood || 'neutral';
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });

  return Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
}

/**
 * Helper: Calculate emotional range
 */
function calculateEmotionalRange(analyses) {
  const intensities = analyses.map(a => a.emotional_intensity);
  const min = Math.min(...intensities);
  const max = Math.max(...intensities);
  
  return {
    min: min,
    max: max,
    range: max - min,
    interpretation: max - min > 5 ? 'highly varied' : 'relatively stable'
  };
}

/**
 * Helper: Detect mood shifts
 */
function detectMoodShifts(analyses) {
  const shifts = [];
  
  for (let i = 1; i < analyses.length; i++) {
    const prev = analyses[i - 1];
    const curr = analyses[i];
    
    const intensityChange = Math.abs(
      curr.emotional_intensity - prev.emotional_intensity
    );
    
    if (intensityChange >= 4) {
      shifts.push({
        from: prev.mood,
        to: curr.mood,
        date: curr.date,
        magnitude: intensityChange
      });
    }
  }
  
  return shifts;
}

/**
 * Helper: Extract themes
 */
function extractThemes(analyses) {
  const allTags = analyses.flatMap(a => a.tags);
  const tagCounts = {};
  
  allTags.forEach(tag => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
  
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
}

/**
 * Helper: Extract dominant colors
 */
function extractDominantColors(analyses) {
  const allColors = analyses.flatMap(a => a.colors);
  const colorCounts = {};
  
  allColors.forEach(color => {
    colorCounts[color] = (colorCounts[color] || 0) + 1;
  });
  
  return Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([color]) => color);
}

/**
 * Helper: Analyze single period
 */
async function analyzePeriod(images, label) {
  const analyses = [];
  
  for (const image of images.slice(0, 20)) {  // Limit to 20 for comparison
    const result = await aiService.analyzeImageSmart(image.url);
    if (result.success) {
      analyses.push(result.data);
    }
  }
  
  return {
    label: label,
    imageCount: images.length,
    mood: getMostCommonMood(analyses.map(a => ({ mood: a.mood }))),
    themes: extractThemes(analyses.map(a => ({ tags: a.tags || [] }))),
    colors: extractDominantColors(analyses.map(a => ({ colors: a.colors || [] })))
  };
}

/**
 * Helper: Compare moods
 */
function compareMoods(mood1, mood2) {
  if (mood1 === mood2) return 'consistent';
  
  const positive = ['happy', 'joyful', 'excited', 'content', 'peaceful'];
  const negative = ['sad', 'angry', 'anxious', 'frustrated'];
  
  const isPeriod1Positive = positive.some(m => mood1.includes(m));
  const isPeriod2Positive = positive.some(m => mood2.includes(m));
  
  if (isPeriod1Positive && isPeriod2Positive) return 'remained positive';
  if (!isPeriod1Positive && !isPeriod2Positive) return 'remained challenging';
  if (isPeriod1Positive && !isPeriod2Positive) return 'declined';
  if (!isPeriod1Positive && isPeriod2Positive) return 'improved';
  
  return 'shifted';
}

/**
 * Helper: Compare activities
 */
function compareActivities(themes1, themes2) {
  const common = themes1.filter(t => themes2.includes(t));
  const new_themes = themes2.filter(t => !themes1.includes(t));
  
  return {
    common: common,
    new: new_themes,
    interpretation: new_themes.length > themes1.length / 2 
      ? 'significant lifestyle change' 
      : 'mostly consistent'
  };
}

/**
 * Helper: Compare colors
 */
function compareColors(colors1, colors2) {
  const common = colors1.filter(c => colors2.includes(c));
  
  return {
    common: common,
    change: common.length < Math.min(colors1.length, colors2.length) / 2
      ? 'dramatic color shift'
      : 'similar color palette'
  };
}

/**
 * Helper: Calculate emotional shift
 */
function calculateEmotionalShift(analysis1, analysis2) {
  // Simple sentiment analysis
  const score1 = analysis1.mood.includes('happy') || analysis1.mood.includes('joyful') ? 1 : 
                 analysis1.mood.includes('sad') || analysis1.mood.includes('anxious') ? -1 : 0;
  const score2 = analysis2.mood.includes('happy') || analysis2.mood.includes('joyful') ? 1 : 
                 analysis2.mood.includes('sad') || analysis2.mood.includes('anxious') ? -1 : 0;
  
  const shift = score2 - score1;
  
  if (shift > 0) return 'positive shift';
  if (shift < 0) return 'challenging period';
  return 'stable emotional state';
}

/**
 * Helper: Generate comparison insight
 */
function generateComparisonInsight(analysis1, analysis2) {
  const moodChange = compareMoods(analysis1.mood, analysis2.mood);
  
  const insights = {
    'improved': `? Your mood evolved positively from ${analysis1.label} to ${analysis2.label}!`,
    'declined': `?? ${analysis2.label} shows a shift from the energy of ${analysis1.label}`,
    'remained positive': `?? You maintained positive energy across both periods!`,
    'consistent': `?? Your emotional state remained consistent between periods`,
    'shifted': `?? Significant emotional shifts occurred between these periods`
  };
  
  return insights[moodChange] || 'Interesting emotional patterns detected!';
}

export default router;
