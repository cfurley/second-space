# AI Server - Second Space

## ?? Overview

The AI Server provides intelligent features for Second Space, including:
- **Image Analysis:** Analyze images for content, emotions, and auto-generate tags
- **Recommendations:** Suggest related content and new space themes
- **Auto-Organization:** Intelligently categorize and organize media

## ?? Quick Start

### 1. Install Dependencies

```bash
cd ai-server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### 3. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The AI server will run on `http://localhost:8081`

## ?? API Key Setup

You need an OpenAI API key to use the AI features:

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add it to your `.env` file:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

## ?? API Endpoints

### Health Check

```http
GET /
```

Returns server status and available capabilities.

---

### Image Analysis

#### Analyze Single Image

```http
POST /api/analyze/image
Content-Type: application/json

{
  "imageUrl": "https://example.com/image.jpg",
  "prompt": "Optional custom analysis prompt"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "description": "A sunset over mountains...",
    "mood": "peaceful, serene",
    "tags": ["sunset", "nature", "mountains", "landscape"],
    "categories": ["nature", "landscape"]
  }
}
```

#### Generate Tags from Text

```http
POST /api/analyze/tags
Content-Type: application/json

{
  "text": "A beautiful beach scene with palm trees"
}
```

**Response:**
```json
{
  "success": true,
  "tags": ["beach", "palm trees", "tropical", "ocean", "vacation"]
}
```

#### Batch Image Analysis

```http
POST /api/analyze/batch
Content-Type: application/json

{
  "images": [
    { "url": "https://example.com/image1.jpg" },
    { "url": "https://example.com/image2.jpg" }
  ]
}
```

---

### Recommendations

#### Get Similar Content Recommendations

```http
POST /api/recommendations/similar
Content-Type: application/json

{
  "tags": ["sunset", "nature", "mountains"],
  "context": "User likes landscape photography"
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "title": "Explore mountain hiking trails",
      "reason": "Based on your interest in mountains and nature"
    }
  ]
}
```

#### Get Space Recommendations

```http
POST /api/recommendations/space
Content-Type: application/json

{
  "userId": "123",
  "existingSpaces": [
    { "tags": ["travel", "adventure"] }
  ]
}
```

---

### Auto-Organization

#### Organize Media Automatically

```http
POST /api/organize/auto
Content-Type: application/json

{
  "mediaItems": [
    { "description": "Beach sunset" },
    { "description": "Mountain landscape" },
    { "description": "Ocean waves" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "categories": {
    "Beach Scenes": [0, 2],
    "Mountains": [1]
  },
  "totalItems": 3
}
```

#### Suggest New Spaces

```http
POST /api/organize/suggest-spaces
Content-Type: application/json

{
  "mediaItems": [...],
  "currentSpaces": [...]
}
```

## ??? Architecture

```
ai-server/
??? server.js              # Main Express server
??? package.json           # Dependencies
??? .env.example           # Environment template
??? routes/
?   ??? imageAnalysis.js   # Image analysis endpoints
?   ??? recommendations.js # Recommendation endpoints
?   ??? organization.js    # Organization endpoints
??? services/
    ??? aiService.js       # OpenAI integration
```

## ?? Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AI_PORT` | Port for AI server | `8081` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `BACKEND_API_URL` | Main backend URL | `http://localhost:8080` |
| `ALLOWED_ORIGINS` | CORS allowed origins | See `.env.example` |
| `MAX_IMAGE_SIZE` | Max image size in bytes | `10485760` (10MB) |

## ?? Testing

```bash
# Run tests
npm test

# Test with curl
curl http://localhost:8081/

# Test image analysis
curl -X POST http://localhost:8081/api/analyze/image \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://example.com/image.jpg"}'
```

## ?? Security Considerations

1. **API Key Protection:** Never commit `.env` files with real API keys
2. **Rate Limiting:** Consider adding rate limiting for production
3. **Input Validation:** All endpoints validate input data
4. **CORS:** Configured to only allow specific origins

## ?? Usage Examples

### Frontend Integration

```javascript
// Analyze an image
const analyzeImage = async (imageUrl) => {
  const response = await fetch('http://localhost:8081/api/analyze/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl })
  });
  return await response.json();
};

// Get recommendations
const getRecommendations = async (tags) => {
  const response = await fetch('http://localhost:8081/api/recommendations/similar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags })
  });
  return await response.json();
};
```

## ?? Future Enhancements

- [ ] Add image upload support (instead of just URLs)
- [ ] Implement caching for repeated analyses
- [ ] Add support for more AI providers (Claude, Gemini)
- [ ] Add sentiment analysis for text content
- [ ] Implement smart tagging suggestions
- [ ] Add duplicate image detection
- [ ] Support for video analysis

## ?? Development Notes

- Uses OpenAI GPT-4 Vision for image analysis
- Uses GPT-3.5 Turbo for text-based operations (faster & cheaper)
- All responses are in JSON format
- Error handling includes detailed logging
- Supports both single and batch operations

## ?? Troubleshooting

### "OpenAI API key not configured"
- Check that `OPENAI_API_KEY` is set in `.env`
- Verify the key is valid at https://platform.openai.com

### "CORS blocked"
- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`

### "Rate limit exceeded"
- OpenAI has rate limits. Check your usage at https://platform.openai.com/usage
- Consider implementing request queuing

## ?? Support

For issues or questions:
- Open an issue on GitHub
- Check OpenAI API documentation: https://platform.openai.com/docs

---

**Version:** 0.1.0  
**License:** MIT  
**Built with:** Express.js, OpenAI API
