/**
 * Ollama Local AI Service
 * 
 * FREE local AI models - no API costs!
 * Requires Ollama installed: https://ollama.ai
 * 
 * Models used:
 * - llama3.2-vision: Image analysis (11GB)
 * - llama3.1: Chat and text (4.7GB)
 * - mistral: Tags and simple tasks (4.1GB)
 */

import axios from 'axios';

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

/**
 * Check if Ollama is running
 */
async function isOllamaAvailable() {
  try {
    await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    return true;
  } catch (error) {
    console.warn('?? Ollama not available:', error.message);
    return false;
  }
}

/**
 * Analyze image using local Ollama model (FREE)
 * @param {string} imageUrl - URL or base64 of image
 * @param {string} prompt - Optional custom prompt
 * @returns {Object} Analysis results
 */
export async function analyzeImageLocal(imageUrl, prompt = null) {
  const defaultPrompt = `Analyze this image and provide a JSON response with:
1. description: Brief description (2-3 sentences)
2. mood: Primary emotion or mood
3. tags: Array of 5-10 relevant keywords
4. categories: Array of suggested categories
5. colors: Array of dominant colors

Return ONLY valid JSON with these exact keys.`;

  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: 'llama3.2-vision',
      prompt: prompt || defaultPrompt,
      images: [imageUrl],
      stream: false,
      format: 'json',
      options: {
        temperature: 0.7,
        num_predict: 500
      }
    });

    let result;
    try {
      result = JSON.parse(response.data.response);
    } catch {
      // Fallback if not valid JSON
      result = {
        description: response.data.response,
        mood: 'unknown',
        tags: [],
        categories: [],
        colors: []
      };
    }
    
    return {
      success: true,
      data: result,
      model: 'llama3.2-vision',
      cost: 0,  // FREE!
      local: true,
      provider: 'ollama'
    };
  } catch (error) {
    console.error('? Ollama image analysis error:', error.message);
    return {
      success: false,
      error: error.message,
      local: true
    };
  }
}

/**
 * Chat with local AI (FREE)
 * @param {string} message - User's message
 * @param {Object} context - Additional context
 * @param {Array} conversationHistory - Previous messages
 * @returns {Object} AI response
 */
export async function chatWithAILocal(message, context = {}, conversationHistory = []) {
  const systemPrompt = `You are an AI assistant for Second Space, a content organization app. 
Help users organize, understand, and enhance their content. Be friendly, helpful, and concise.`;

  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    ...conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    {
      role: 'user',
      content: message
    }
  ];

  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/chat`, {
      model: 'llama3.1',
      messages: messages,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 500
      }
    });

    return {
      success: true,
      reply: response.data.message.content,
      model: 'llama3.1',
      cost: 0,  // FREE!
      local: true,
      provider: 'ollama',
      conversationId: `local_${Date.now()}`
    };
  } catch (error) {
    console.error('? Ollama chat error:', error.message);
    return {
      success: false,
      error: error.message,
      local: true
    };
  }
}

/**
 * Generate tags locally (FREE)
 * @param {string} text - Text to generate tags from
 * @param {Object} options - Additional options
 * @returns {Object} Generated tags
 */
export async function generateTagsLocal(text, options = {}) {
  const { count = 10 } = options;

  const prompt = `Generate exactly ${count} relevant, descriptive tags for this content: "${text}"

Return as a JSON object with a "tags" key containing an array of tag strings.
Example: {"tags": ["tag1", "tag2", "tag3"]}

Tags should be:
- Single words or short phrases
- Lowercase
- Relevant for search and categorization`;

  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: 'mistral',
      prompt: prompt,
      stream: false,
      format: 'json',
      options: {
        temperature: 0.7,
        num_predict: 200
      }
    });

    let tags;
    try {
      const parsed = JSON.parse(response.data.response);
      tags = parsed.tags || Object.values(parsed)[0] || [];
    } catch {
      // Fallback: extract tags from text
      tags = response.data.response
        .split(/[,\n]/)
        .map(tag => tag.trim().replace(/["\[\]{}]/g, ''))
        .filter(tag => tag.length > 0)
        .slice(0, count);
    }

    return {
      success: true,
      tags: Array.isArray(tags) ? tags : [tags],
      model: 'mistral',
      cost: 0,  // FREE!
      local: true,
      provider: 'ollama'
    };
  } catch (error) {
    console.error('? Ollama tag generation error:', error.message);
    return {
      success: false,
      error: error.message,
      local: true
    };
  }
}

/**
 * Generate caption locally (FREE)
 * @param {string} imageUrl - Image URL
 * @param {Object} options - Style and length options
 * @returns {Object} Generated caption
 */
export async function generateCaptionLocal(imageUrl, options = {}) {
  const { style = 'descriptive', length = 'medium' } = options;

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

  const prompt = `Generate a ${style} caption for this image.
Style: ${styleGuide[style]}
Length: ${lengthGuide[length]}
Return only the caption text, nothing else.`;

  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: 'llama3.2-vision',
      prompt: prompt,
      images: [imageUrl],
      stream: false,
      options: {
        temperature: 0.8,
        num_predict: 100
      }
    });

    return {
      success: true,
      caption: response.data.response.trim(),
      style: style,
      length: length,
      model: 'llama3.2-vision',
      cost: 0,  // FREE!
      local: true,
      provider: 'ollama'
    };
  } catch (error) {
    console.error('? Ollama caption generation error:', error.message);
    return {
      success: false,
      error: error.message,
      local: true
    };
  }
}

/**
 * Get recommendations locally (FREE)
 * @param {Array} existingTags - User's existing tags
 * @param {string} context - Additional context
 * @param {Object} options - Additional options
 * @returns {Object} Recommendations
 */
export async function getRecommendationsLocal(existingTags, context = '', options = {}) {
  const { count = 7, type = 'general' } = options;

  const typePrompts = {
    general: 'related themes, topics, or search terms',
    spaces: 'new space themes or organizational categories',
    media: 'types of media or content to add',
    themes: 'visual themes or aesthetic styles'
  };

  const prompt = `Based on these existing tags: ${existingTags.join(', ')}
${context}

Suggest ${count} ${typePrompts[type]} that might interest the user.

Return as JSON with a "recommendations" array. Each item should have:
- title: Short title
- reason: Why this is recommended

Example: {"recommendations": [{"title": "...", "reason": "..."}]}`;

  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: 'llama3.1',
      prompt: prompt,
      stream: false,
      format: 'json',
      options: {
        temperature: 0.8,
        num_predict: 400
      }
    });

    let recommendations;
    try {
      const parsed = JSON.parse(response.data.response);
      recommendations = parsed.recommendations || Object.values(parsed)[0] || [];
    } catch {
      recommendations = [{ title: 'Explore more', reason: response.data.response }];
    }

    return {
      success: true,
      recommendations: Array.isArray(recommendations) ? recommendations : [recommendations],
      model: 'llama3.1',
      cost: 0,  // FREE!
      local: true,
      provider: 'ollama'
    };
  } catch (error) {
    console.error('? Ollama recommendations error:', error.message);
    return {
      success: false,
      error: error.message,
      local: true
    };
  }
}

export default {
  isOllamaAvailable,
  analyzeImageLocal,
  chatWithAILocal,
  generateTagsLocal,
  generateCaptionLocal,
  getRecommendationsLocal
};
