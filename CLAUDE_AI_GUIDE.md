# Claude AI Integration Guide

## Overview

The Creative Connect Platform now includes Claude AI integration for intelligent content generation. This guide explains how to set up and use the AI-powered features.

## Setup

### 1. Get Your API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-api-`)

### 2. Configure Environment

Add to your `.env` file:

```bash
ANTHROPIC_API_KEY=sk-ant-api-your-actual-key-here
CLAUDE_MODEL=claude-3-5-sonnet-20241022  # Optional, defaults to this
```

### 3. Restart Server

```bash
npm run dev
```

## Available Endpoints

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### 1. Check Service Status

**Endpoint:** `GET /api/va/ai/status`

Check if Claude AI is configured and available.

**Example:**
```bash
curl -X GET http://localhost:5000/api/va/ai/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "status": "operational",
  "isConfigured": true,
  "model": "claude-3-5-sonnet-20241022",
  "features": {
    "dmScripts": true,
    "socialContent": true,
    "taskDescriptions": true,
    "textAnalysis": true
  }
}
```

### 2. Generate DM Scripts

**Endpoint:** `POST /api/va/ai/generate-dm-scripts`

Generate personalized direct message scripts for outreach.

**Parameters:**
- `targetAudience` (string): Who you're reaching out to (e.g., "designers", "creators")
- `purpose` (string): Purpose of outreach (e.g., "recruitment", "collaboration")
- `tone` (string): Communication tone (e.g., "professional and friendly", "casual")
- `platform` (string): Social platform (e.g., "Instagram", "LinkedIn")
- `count` (number): Number of scripts to generate (default: 3)

**Example:**
```bash
curl -X POST http://localhost:5000/api/va/ai/generate-dm-scripts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetAudience": "graphic designers",
    "purpose": "recruitment",
    "tone": "professional and friendly",
    "platform": "Instagram",
    "count": 3
  }'
```

**Response:**
```json
{
  "success": true,
  "scripts": [
    {
      "approach": "Value-first introduction",
      "message": "Hey! Love your design work 🎨 We're building Creative Connect - connecting designers with opportunities. Would love to chat!",
      "followUp": "Just curious - what's your biggest challenge finding design work?"
    }
  ],
  "metadata": {
    "targetAudience": "graphic designers",
    "purpose": "recruitment",
    "platform": "Instagram",
    "generatedAt": "2026-01-07T12:00:00.000Z"
  }
}
```

### 3. Generate Social Media Content

**Endpoint:** `POST /api/va/ai/generate-social-content`

Generate social media content ideas with captions, hashtags, and CTAs.

**Parameters:**
- `platform` (string): Social platform (default: "Instagram")
- `contentType` (string): Type of content (default: "post")
- `topic` (string): Content topic (default: "creative opportunities")
- `tone` (string): Content tone (default: "inspiring")
- `count` (number): Number of ideas to generate (default: 5)

**Example:**
```bash
curl -X POST http://localhost:5000/api/va/ai/generate-social-content \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "Instagram",
    "contentType": "reel",
    "topic": "designer productivity tips",
    "tone": "energetic and helpful",
    "count": 3
  }'
```

**Response:**
```json
{
  "success": true,
  "contentIdeas": [
    {
      "hook": "Stop wasting hours on design revisions!",
      "caption": "3 productivity hacks every designer needs...",
      "hashtags": ["DesignTips", "ProductivityHacks", "CreativeConnect"],
      "cta": "Save this for later & follow for more tips!",
      "bestTime": "Tuesday 11 AM - 1 PM"
    }
  ],
  "metadata": {
    "platform": "Instagram",
    "contentType": "reel",
    "topic": "designer productivity tips"
  }
}
```

### 4. Generate Task Descriptions

**Endpoint:** `POST /api/va/ai/generate-task-description`

Generate detailed task descriptions for VA tasks.

**Parameters:**
- `taskTitle` (string, required): Title of the task
- `category` (string): Task category
- `context` (string): Additional context
- `detailLevel` (string): Level of detail (default: "detailed")

**Example:**
```bash
curl -X POST http://localhost:5000/api/va/ai/generate-task-description \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskTitle": "Weekly Instagram Content Planning",
    "category": "social_posting",
    "context": "For Creative Connect launch campaign",
    "detailLevel": "detailed"
  }'
```

**Response:**
```json
{
  "success": true,
  "description": "**Objective:** Plan and schedule one week of Instagram content...\n\n**Steps:**\n1. Review content calendar...\n2. Create 7 post concepts...",
  "metadata": {
    "taskTitle": "Weekly Instagram Content Planning",
    "category": "social_posting",
    "generatedAt": "2026-01-07T12:00:00.000Z"
  }
}
```

### 5. Analyze Text

**Endpoint:** `POST /api/va/ai/analyze-text`

Analyze text for sentiment, themes, and insights.

**Parameters:**
- `text` (string, required): Text to analyze

**Example:**
```bash
curl -X POST http://localhost:5000/api/va/ai/analyze-text \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I absolutely love the new platform features! The AI integration makes everything so much easier."
  }'
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "sentiment": "positive",
    "confidence": 0.95,
    "keyThemes": ["satisfaction", "AI features", "ease of use"],
    "actionableInsights": [
      "User is highly satisfied with AI integration",
      "Emphasize ease-of-use in marketing"
    ],
    "suggestedResponse": "Thank you! We're thrilled the AI features are helpful!"
  }
}
```

## Rate Limits

To protect against excessive API usage and costs:

- **AI Generation Endpoints**: 20 requests per 15 minutes per IP
- **Status Endpoint**: 60 requests per minute per IP

When rate limit is exceeded, you'll receive:
```json
{
  "success": false,
  "error": "Too many AI requests from this IP, please try again later."
}
```

## Error Handling

### Service Not Configured (503)
```json
{
  "success": false,
  "error": "Claude AI service is not configured. Please set ANTHROPIC_API_KEY environment variable."
}
```

**Solution:** Add valid API key to `.env` file and restart server.

### Missing Required Parameters (400)
```json
{
  "success": false,
  "error": "taskTitle is required"
}
```

**Solution:** Include all required parameters in request body.

### API Error (500)
```json
{
  "success": false,
  "error": "Failed to generate content",
  "message": "Detailed error message"
}
```

**Solution:** Check API key validity, Anthropic service status, and request parameters.

## Best Practices

### 1. Cache Results
AI generation can be slow. Cache frequently used content:
```javascript
const cache = new Map();
const cacheKey = JSON.stringify(params);
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

### 2. Handle Gracefully
Always provide fallback content when AI is unavailable:
```javascript
try {
  const content = await generateContent(params);
  return content;
} catch (error) {
  return fallbackContent;
}
```

### 3. Monitor Usage
Track API usage to manage costs:
- Log all AI requests
- Monitor rate limit hits
- Set budget alerts in Anthropic Console

### 4. Use Appropriate Parameters
- Lower temperature (0.3-0.7) for factual content
- Higher temperature (0.8-1.0) for creative content
- Adjust maxTokens based on expected response length

## Cost Optimization

1. **Batch Requests**: Generate multiple items in one request when possible
2. **Use Caching**: Don't regenerate identical content
3. **Set Reasonable Limits**: Use `count` parameter wisely
4. **Monitor Usage**: Check Anthropic Console regularly

## Troubleshooting

### Server Won't Start
```bash
Error: @anthropic-ai/sdk not found
```
**Solution:** Run `npm install`

### Status Returns "not_configured"
```bash
curl http://localhost:5000/api/va/ai/status
# Returns: "isConfigured": false
```
**Solution:** 
1. Check `.env` file has `ANTHROPIC_API_KEY`
2. Ensure key starts with `sk-ant-`
3. Restart server

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```
**Solution:** Include JWT token in Authorization header

### Slow Response Times
- Claude API can take 2-10 seconds per request
- Consider using async processing for large batches
- Implement frontend loading states

## Support

For issues:
1. Check Anthropic service status: https://status.anthropic.com/
2. Verify API key in Anthropic Console
3. Review server logs for detailed errors
4. Check rate limits aren't exceeded

## Resources

- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Claude Model Information](https://docs.anthropic.com/claude/docs/models-overview)
- [Pricing Information](https://www.anthropic.com/pricing)
