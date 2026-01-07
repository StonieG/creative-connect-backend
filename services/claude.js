// Creative Connect Platform - Claude AI Service
// Anthropic Claude API Integration for AI-powered content generation

const Anthropic = require('@anthropic-ai/sdk');

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Default model to use
const DEFAULT_MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';

/**
 * Generate content using Claude AI
 * @param {string} prompt - The prompt to send to Claude
 * @param {object} options - Optional configuration
 * @returns {Promise<string>} Generated content
 */
async function generateContent(prompt, options = {}) {
    try {
        const {
            model = DEFAULT_MODEL,
            maxTokens = 1024,
            temperature = 1.0,
            systemPrompt = null
        } = options;

        const messageParams = {
            model,
            max_tokens: maxTokens,
            temperature,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        };

        // Add system prompt if provided
        if (systemPrompt) {
            messageParams.system = systemPrompt;
        }

        const response = await anthropic.messages.create(messageParams);
        
        // Extract text content from response
        const content = response.content[0]?.text || '';
        return content;

    } catch (error) {
        console.error('Claude API Error:', error);
        throw new Error(`Failed to generate content: ${error.message}`);
    }
}

/**
 * Generate DM outreach scripts using Claude
 * @param {object} params - Parameters for DM generation
 * @returns {Promise<object>} Generated DM scripts
 */
async function generateDMScripts(params) {
    const {
        targetAudience = 'designers',
        purpose = 'recruitment',
        tone = 'professional and friendly',
        platform = 'Instagram',
        count = 3
    } = params;

    const systemPrompt = `You are an expert social media outreach specialist for Creative Connect Platform, 
a creative opportunity engine launching on Valentine's Day 2026. The platform connects designers, 
creators, and brands. Brand colors: Neon Aqua #00F5FF, Neon Violet #7B2CFF.`;

    const prompt = `Generate ${count} personalized DM outreach scripts for ${platform} targeting ${targetAudience}.

Purpose: ${purpose}
Tone: ${tone}
Platform: ${platform}

Requirements:
- Keep messages under 150 characters for first contact
- Include a clear call-to-action
- Be authentic and engaging
- Reference Creative Connect Platform naturally
- Each script should have a different approach/angle

Format as JSON array with this structure:
[
  {
    "approach": "Brief description of the approach",
    "message": "The actual DM text",
    "followUp": "Optional follow-up message"
  }
]`;

    try {
        const content = await generateContent(prompt, {
            systemPrompt,
            maxTokens: 2048,
            temperature: 0.8
        });

        // Parse JSON response with error handling
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (parseError) {
                console.error('Failed to parse DM scripts JSON:', parseError);
                // Fallback to basic structure
            }
        }

        // Fallback if JSON parsing fails
        return [{
            approach: 'direct',
            message: content.substring(0, 150),
            followUp: null
        }];

    } catch (error) {
        console.error('Error generating DM scripts:', error);
        throw error;
    }
}

/**
 * Generate social media content ideas
 * @param {object} params - Parameters for content generation
 * @returns {Promise<object>} Generated content ideas
 */
async function generateSocialContent(params) {
    const {
        platform = 'Instagram',
        contentType = 'post',
        topic = 'creative opportunities',
        tone = 'inspiring',
        count = 5
    } = params;

    const systemPrompt = `You are a creative content strategist for Creative Connect Platform. 
Create engaging social media content that resonates with designers, creators, and creative professionals. 
The platform launches Valentine's Day 2026 and uses brand colors Neon Aqua #00F5FF and Neon Violet #7B2CFF.`;

    const prompt = `Generate ${count} ${contentType} ideas for ${platform} about ${topic}.

Tone: ${tone}
Content Type: ${contentType}
Platform: ${platform}

Include:
- Hook/opening line
- Main content/caption
- Hashtags (5-10 relevant hashtags)
- Call-to-action
- Best posting time suggestion

Format as JSON array with this structure:
[
  {
    "hook": "Attention-grabbing opening",
    "caption": "Main content text",
    "hashtags": ["hashtag1", "hashtag2"],
    "cta": "Call to action",
    "bestTime": "Suggested posting time"
  }
]`;

    try {
        const content = await generateContent(prompt, {
            systemPrompt,
            maxTokens: 3000,
            temperature: 0.9
        });

        // Parse JSON response with error handling
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (parseError) {
                console.error('Failed to parse social content JSON:', parseError);
                // Fallback to basic structure
            }
        }

        // Fallback
        return [{
            hook: topic,
            caption: content,
            hashtags: ['CreativeConnect', 'Designers', 'CreativeOpportunities'],
            cta: 'Learn more at Creative Connect',
            bestTime: '10:00 AM - 2:00 PM'
        }];

    } catch (error) {
        console.error('Error generating social content:', error);
        throw error;
    }
}

/**
 * Generate task descriptions using Claude
 * @param {object} params - Task parameters
 * @returns {Promise<string>} Generated task description
 */
async function generateTaskDescription(params) {
    const {
        taskTitle,
        category,
        context = '',
        detailLevel = 'detailed'
    } = params;

    const systemPrompt = `You are a virtual assistant task planner for Creative Connect Platform. 
Generate clear, actionable task descriptions that help VAs execute effectively.`;

    const prompt = `Create a ${detailLevel} task description for: "${taskTitle}"

Category: ${category}
Context: ${context}

Include:
- Clear objective
- Step-by-step instructions (if detailed)
- Success criteria
- Estimated time
- Required tools/resources

Keep it concise but actionable.`;

    try {
        const description = await generateContent(prompt, {
            systemPrompt,
            maxTokens: 1024,
            temperature: 0.7
        });

        return description;

    } catch (error) {
        console.error('Error generating task description:', error);
        throw error;
    }
}

/**
 * Analyze text for sentiment and insights
 * @param {string} text - Text to analyze
 * @returns {Promise<object>} Analysis results
 */
async function analyzeText(text) {
    const systemPrompt = `You are a content analyst for Creative Connect Platform. 
Analyze text for sentiment, key themes, and actionable insights.`;

    const prompt = `Analyze the following text:

"${text}"

Provide analysis in JSON format:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.0-1.0,
  "keyThemes": ["theme1", "theme2"],
  "actionableInsights": ["insight1", "insight2"],
  "suggestedResponse": "optional suggested response"
}`;

    try {
        const content = await generateContent(prompt, {
            systemPrompt,
            maxTokens: 1024,
            temperature: 0.5
        });

        // Parse JSON response with error handling
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (parseError) {
                console.error('Failed to parse text analysis JSON:', parseError);
                // Fallback to basic structure
            }
        }

        // Fallback
        return {
            sentiment: 'neutral',
            confidence: 0.5,
            keyThemes: [],
            actionableInsights: [],
            suggestedResponse: null
        };

    } catch (error) {
        console.error('Error analyzing text:', error);
        throw error;
    }
}

/**
 * Check if Claude service is configured
 * @returns {boolean} True if API key is configured
 */
function isConfigured() {
    return !!process.env.ANTHROPIC_API_KEY && 
           process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-');
}

module.exports = {
    generateContent,
    generateDMScripts,
    generateSocialContent,
    generateTaskDescription,
    analyzeText,
    isConfigured
};
