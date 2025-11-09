import OpenAI from 'openai';
import ollamaService from './ollamaService.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration
const USE_LOCAL_AI = process.env.USE_LOCAL_AI === 'true';
const FALLBACK_TO_OPENAI = process.env.FALLBACK_TO_OPENAI !== 'false'; // Default true

/**
 * Smart AI Router - Uses local AI if available, falls back to OpenAI
 */
async function routeToAI(localFn, openAIFn, ...args) {
  if (USE_LOCAL_AI) {
    // Check if Ollama is available
    const isAvailable = await ollamaService.isOllamaAvailable();
    
    if (isAvailable) {
      console.log('? Using local Ollama model (FREE)');
      const result = await localFn(...args);
      
      if (result.success) {
        return result;
      }
      
      console.warn('?? Local model failed:', result.error);
    } else {
      console.warn('?? Ollama not available at', process.env.OLLAMA_URL || 'http://localhost:11434');
    }
    
    if (FALLBACK_TO_OPENAI && process.env.OPENAI_API_KEY) {
      console.log('?? Falling back to OpenAI');
      return await openAIFn(...args);
    }
    
    return {
      success: false,
      error: 'Local AI failed and no fallback available',
      local: true
    };
  }
  
  // Use OpenAI directly
  console.log('?? Using OpenAI (costs money)');
  return await openAIFn(...args);
}

/**
 * Analyze an image using GPT-4 Vision (UPGRADED)
 * Now supports GPT-4o which is faster and cheaper!
 * @param {string} imageUrl - URL of the image to analyze
 * @param {string} prompt - Optional custom prompt
 * @param {Object} options - Additional options
 * @returns {Object} Analysis results
 */
export async function analyzeImage(imageUrl, prompt = null, options = {}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const {
    model = 'gpt-4o',  // UPGRADED: Using GPT-4o (faster, cheaper, better)
    maxTokens = 500,
    detail = 'auto'     // 'low', 'high', or 'auto'
  } = options;

  const defaultPrompt = `Analyze this image and provide a detailed JSON response with:
1. A brief description (2-3 sentences)
2. The primary emotion or mood conveyed
3. 5-10 relevant tags/keywords (as array)
4. Suggested categories (e.g., nature, people, abstract, food, etc.) as array
5. Color palette (dominant colors as array)
6. Composition notes (rule of thirds, symmetry, etc.)

Return ONLY valid JSON with keys: description, mood, tags, categories, colors, composition`;

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt || defaultPrompt },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: detail,  // Control image resolution
              },
            },
          ],
        },
      ],
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },  // UPGRADED: Force JSON output
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    
    try {
      const parsedData = JSON.parse(content);
      return {
        success: true,
        data: parsedData,
        rawResponse: content,
        model: model,
        usage: response.usage,  // Track token usage
      };
    } catch (parseError) {
      return {
        success: true,
        data: { description: content },
        rawResponse: content,
        model: model,
        parseError: 'Failed to parse as JSON, returned as text',
      };
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      success: false,
      error: error.message,
      model: model,
    };
  }
}

/**
 * Analyze multiple images in parallel (NEW FEATURE)
 * @param {Array} imageUrls - Array of image URLs
 * @param {string} prompt - Optional custom prompt
 * @returns {Array} Array of analysis results
 */
export async function analyzeBatchImages(imageUrls, prompt = null) {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    throw new Error('imageUrls must be a non-empty array');
  }

  if (imageUrls.length > 10) {
    throw new Error('Maximum 10 images per batch');
  }

  try {
    const results = await Promise.all(
      imageUrls.map(url => analyzeImage(url, prompt))
    );

    return {
      success: true,
      results: results,
      totalImages: imageUrls.length,
      successCount: results.filter(r => r.success).length,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate tags for media based on text description (UPGRADED)
 * Now uses GPT-4o-mini for better quality at lower cost
 * @param {string} text - Text to analyze
 * @param {Object} options - Additional options
 * @returns {Object} Generated tags
 */
export async function generateTags(text, options = {}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const {
    model = 'gpt-4o-mini',  // UPGRADED: Better model
    count = 10,              // Number of tags to generate
    language = 'en'          // Language for tags
  } = options;

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: `You are a professional tagging assistant. Generate exactly ${count} relevant, descriptive tags for the given content. Return ONLY a JSON array of strings. Tags should be single words or short phrases, lowercase, and relevant for search and categorization.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    try {
      const parsed = JSON.parse(content);
      const tags = parsed.tags || Object.values(parsed)[0];
      
      return {
        success: true,
        tags: Array.isArray(tags) ? tags : [tags],
        model: model,
        usage: response.usage,
      };
    } catch {
      // Fallback: split by commas
      const tags = content.split(',').map(tag => tag.trim().replace(/["\[\]{}]/g, ''));
      return {
        success: true,
        tags: tags.filter(t => t.length > 0).slice(0, count),
        model: model,
      };
    }
  } catch (error) {
    console.error('Error generating tags:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get smart recommendations based on existing content (UPGRADED)
 * @param {Array} existingTags - Array of tags from user's existing content
 * @param {string} context - Additional context
 * @param {Object} options - Additional options
 * @returns {Object} Recommendations
 */
export async function getRecommendations(existingTags, context = '', options = {}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const {
    model = 'gpt-4o-mini',
    count = 7,
    type = 'general'  // 'general', 'spaces', 'media', 'themes'
  } = options;

  const typePrompts = {
    general: 'related themes, topics, or search terms',
    spaces: 'new space themes or organizational categories',
    media: 'types of media or content to add',
    themes: 'visual themes or aesthetic styles'
  };

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: `You are a content recommendation assistant. Based on existing tags, suggest ${typePrompts[type]} that might interest the user. Return ONLY valid JSON with an array of objects, each having "title" and "reason" keys. Be creative and specific.`,
        },
        {
          role: 'user',
          content: `Existing tags: ${existingTags.join(', ')}. ${context}. Provide exactly ${count} recommendations.`,
        },
      ],
      max_tokens: 400,
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    try {
      const parsed = JSON.parse(content);
      const recommendations = parsed.recommendations || Object.values(parsed)[0];
      
      return {
        success: true,
        recommendations: Array.isArray(recommendations) ? recommendations : [recommendations],
        model: model,
        usage: response.usage,
      };
    } catch {
      return {
        success: true,
        recommendations: [{ title: 'Explore more', reason: content }],
        model: model,
      };
    }
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Organize media into categories using AI (UPGRADED)
 * @param {Array} mediaItems - Array of media items with descriptions
 * @param {Object} options - Additional options
 * @returns {Object} Organized categories
 */
export async function organizeMedia(mediaItems, options = {}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const {
    model = 'gpt-4o-mini',
    maxCategories = 10
  } = options;

  const descriptions = mediaItems.map((item, idx) => 
    `${idx}: ${item.description || item.filename || item.title || 'Untitled'}`
  ).join('\n');

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: `You are an expert organization assistant. Group the given items into logical, meaningful categories (max ${maxCategories} categories). Return ONLY valid JSON where keys are category names and values are arrays of item indices. Use descriptive category names.`,
        },
        {
          role: 'user',
          content: `Organize these items into categories:\n${descriptions}`,
        },
      ],
      max_tokens: 600,
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    try {
      const categories = JSON.parse(content);
      return {
        success: true,
        categories: categories,
        model: model,
        usage: response.usage,
        totalItems: mediaItems.length,
        categoryCount: Object.keys(categories).length,
      };
    } catch {
      return {
        success: false,
        error: 'Failed to parse organization response',
        rawResponse: content,
      };
    }
  } catch (error) {
    console.error('Error organizing media:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate smart captions for images (NEW FEATURE)
 * @param {string} imageUrl - URL of the image
 * @param {Object} options - Additional options
 * @returns {Object} Generated captions
 */
export async function generateCaption(imageUrl, options = {}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const {
    model = 'gpt-4o',
    style = 'descriptive',  // 'descriptive', 'poetic', 'funny', 'professional'
    length = 'medium'       // 'short', 'medium', 'long'
  } = options;

  const lengthGuide = {
    short: '5-10 words',
    medium: '15-25 words',
    long: '30-50 words'
  };

  const styleGuide = {
    descriptive: 'Clear and informative',
    poetic: 'Creative and artistic',
    funny: 'Humorous and engaging',
    professional: 'Formal and precise'
  };

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: `Generate a ${style} caption for this image. Style: ${styleGuide[style]}. Length: ${lengthGuide[length]}. Return only the caption text, no JSON.` 
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'auto' },
            },
          ],
        },
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    return {
      success: true,
      caption: response.choices[0].message.content.trim(),
      style: style,
      length: length,
      model: model,
      usage: response.usage,
    };
  } catch (error) {
    console.error('Error generating caption:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check if image content is appropriate (NEW FEATURE)
 * @param {string} imageUrl - URL of the image
 * @returns {Object} Moderation results
 */
export async function moderateImage(imageUrl) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await openai.moderations.create({
      input: imageUrl,
    });

    const result = response.results[0];
    
    return {
      success: true,
      flagged: result.flagged,
      categories: result.categories,
      categoryScores: result.category_scores,
      safe: !result.flagged,
    };
  } catch (error) {
    console.error('Error moderating image:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Direct chat with AI (NEW FEATURE)
 * @param {string} message - User's message
 * @param {Object} context - Additional context about user's content
 * @param {Array} conversationHistory - Previous messages
 * @returns {Object} AI's reply
 */
export async function chatWithAI(message, context = {}, conversationHistory = []) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    // Build conversation with context
    const messages = [
      {
        role: 'system',
        content: `You are an AI assistant for Second Space, a content organization app. 
Help users organize, understand, and enhance their content. Be friendly, helpful, and concise.
${context.userInfo ? `User context: ${JSON.stringify(context.userInfo)}` : ''}`
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast and cheap for chat
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;

    return {
      success: true,
      reply: reply,
      model: 'gpt-4o-mini',
      usage: response.usage,
      conversationId: generateConversationId(),
    };
  } catch (error) {
    console.error('Error in AI chat:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Answer questions about user's content (NEW FEATURE)
 * @param {string} question - User's question
 * @param {Object} context - User's content context
 * @returns {Object} Answer with suggestions
 */
export async function answerQuestion(question, context) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const prompt = `Based on the user's content below, answer their question.
    
Content: ${JSON.stringify(context.items, null, 2)}

Question: ${question}

Provide:
1. A direct answer
2. Relevant content from their collection
3. Suggestions for organizing or expanding their content

Return as JSON with keys: answer, relevantContent, suggestions`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful content organization assistant. Analyze user content and provide insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content);

    return {
      success: true,
      answer: result.answer,
      relevantContent: result.relevantContent || [],
      suggestions: result.suggestions || [],
      usage: response.usage,
    };
  } catch (error) {
    console.error('Error answering question:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * SMART FUNCTIONS - Auto-route to local or OpenAI
 */

/**
 * Smart image analysis - uses local if available
 */
export async function analyzeImageSmart(imageUrl, prompt = null, options = {}) {
  return await routeToAI(
    ollamaService.analyzeImageLocal,
    analyzeImage,
    imageUrl, prompt, options
  );
}

/**
 * Smart chat - uses local if available
 */
export async function chatWithAISmart(message, context = {}, conversationHistory = []) {
  return await routeToAI(
    ollamaService.chatWithAILocal,
    chatWithAI,
    message, context, conversationHistory
  );
}

/**
 * Smart tag generation - uses local if available
 */
export async function generateTagsSmart(text, options = {}) {
  return await routeToAI(
    ollamaService.generateTagsLocal,
    generateTags,
    text, options
  );
}

/**
 * Smart caption generation - uses local if available
 */
export async function generateCaptionSmart(imageUrl, options = {}) {
  return await routeToAI(
    ollamaService.generateCaptionLocal,
    generateCaption,
    imageUrl, options
  );
}

/**
 * Smart recommendations - uses local if available
 */
export async function getRecommendationsSmart(existingTags, context = '', options = {}) {
  return await routeToAI(
    ollamaService.getRecommendationsLocal,
    getRecommendations,
    existingTags, context, options
  );
}

export default {
  // Smart routing functions (recommended)
  analyzeImageSmart,
  chatWithAISmart,
  generateTagsSmart,
  generateCaptionSmart,
  getRecommendationsSmart,
  
  // OpenAI-only functions
  analyzeImage,
  analyzeBatchImages,
  generateTags,
  getRecommendations,
  organizeMedia,
  generateCaption,
  moderateImage,
  chatWithAI,
  answerQuestion,
  
  // Local-only functions
  analyzeImageLocal: ollamaService.analyzeImageLocal,
  chatWithAILocal: ollamaService.chatWithAILocal,
  generateTagsLocal: ollamaService.generateTagsLocal,
  generateCaptionLocal: ollamaService.generateCaptionLocal,
  getRecommendationsLocal: ollamaService.getRecommendationsLocal,
  
  // Utility
  isOllamaAvailable: ollamaService.isOllamaAvailable
};
