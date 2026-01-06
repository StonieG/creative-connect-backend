# 🤖 Claude AI Code Access Setup

This repository is configured for seamless integration with Claude AI, enabling intelligent code assistance, analysis, and development support.

## 📋 What's Included

This repository includes Claude-specific configuration files:

- **`.claude.json`** - Comprehensive project metadata and structure documentation
- **`.claudeignore`** - Files to exclude from Claude's context (similar to `.gitignore`)
- **`.mcp/`** - Model Context Protocol configuration for Claude Desktop

## 🚀 Quick Start

### Option 1: Using Claude Desktop

1. **Install Claude Desktop** (if not already installed)
   - Download from [claude.ai](https://claude.ai/download)

2. **Configure MCP Servers**
   - Open Claude Desktop
   - Go to Settings → Developer → Model Context Protocol
   - The repository should be auto-detected via the `.mcp/config.json`

3. **Start Coding**
   - Open a conversation in Claude Desktop
   - Reference files using `@filename` or ask about project structure
   - Claude will have full context about the Creative Connect Platform

### Option 2: Using Claude API

1. **Read Project Context**
   ```javascript
   const projectContext = require('./.claude.json');
   // Use projectContext in your API calls to Claude
   ```

2. **Provide Context in Prompts**
   ```
   Given this Express.js backend project with the following structure:
   [Include relevant sections from .claude.json]
   
   Please help me...
   ```

### Option 3: Using Claude via Web Interface

1. **Share Project Structure**
   - Copy contents of `.claude.json` into your conversation
   - Or provide specific sections as needed

2. **Reference the Documentation**
   - Mention you're working on the "Creative Connect Platform"
   - Reference specific API endpoints or components

## 🎯 What Claude Knows About This Project

With these configuration files, Claude has comprehensive knowledge of:

### Project Structure
- All API routes and their purposes
- Database models and schemas
- Middleware and authentication flow
- Revenue streams and pricing

### Technical Stack
- Express.js backend framework
- MongoDB with Mongoose ORM
- JWT authentication strategy
- Stripe payment integration
- Division-based RBAC system

### Business Context
- Launch date: Valentine's Day 2026
- Target audience: Creative professionals
- Revenue model: Content kits + subscriptions
- Brand colors and division codes

### Development Workflow
- Available npm scripts
- Testing with Jest
- Linting with ESLint
- Deployment on Render.com

## 💡 Best Practices

### When Working with Claude

1. **Be Specific About Context**
   - Mention which API route or model you're working with
   - Reference division codes when relevant (COO, CMO, CTO, SMD, CCRO)

2. **Use Existing Patterns**
   - Follow Express.js middleware patterns
   - Use Mongoose for database operations
   - Maintain JWT authentication standards

3. **Maintain Consistency**
   - Keep `.claude.json` updated with new routes or features
   - Update `.claudeignore` if adding new build artifacts
   - Follow the established color scheme and branding

### Code Quality

When asking Claude for help:
- Request code that follows existing patterns
- Ask for proper error handling
- Ensure JWT authentication on protected routes
- Include input validation for all endpoints
- Follow the security guidelines in the main README

## 🔧 Customizing Claude's Context

### Updating `.claude.json`

When you add new features:
```json
{
  "apiEndpoints": {
    "newFeature": {
      "prefix": "/api/new-feature",
      "endpoints": [
        "GET / - Description",
        "POST / - Description"
      ]
    }
  }
}
```

### Modifying `.claudeignore`

Add patterns for files Claude should ignore:
```
# Custom build outputs
dist/
*.bundle.js

# Large datasets
data/*.csv
```

### Extending MCP Configuration

Add new MCP servers in `.mcp/config.json`:
```json
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-mongodb"],
      "description": "MongoDB integration"
    }
  }
}
```

## 📚 Common Use Cases

### 1. Adding New API Endpoints
```
"I need to add a new endpoint to the /api/dashboard route 
for fetching division-specific analytics. Can you help 
implement this following the existing patterns?"
```

### 2. Database Schema Changes
```
"I want to add a new field to the Employee model for 
tracking last login time. How should I implement this 
with Mongoose and update the necessary routes?"
```

### 3. Authentication Issues
```
"I'm getting JWT verification errors. Can you review 
the auth middleware and help debug the issue?"
```

### 4. Stripe Integration
```
"I need to add a new subscription tier to the Stripe 
integration. Walk me through the changes needed in 
the payment route."
```

## 🔒 Security Notes

- **Never commit** actual `.env` files with secrets
- **Always use** environment variables for sensitive data
- **Claude should not** have access to production credentials
- **Review all** AI-generated code for security best practices

## 🐛 Troubleshooting

### Claude Desktop Not Detecting Project
1. Check that `.mcp/config.json` is valid JSON
2. Verify the file path in the filesystem server config
3. Restart Claude Desktop
4. Check Settings → Developer → Model Context Protocol

### Context Seems Incomplete
1. Ensure `.claude.json` is up to date
2. Check that important files aren't in `.claudeignore`
3. Explicitly mention specific files or features

### MCP Servers Not Working
1. Verify Node.js and npm are installed
2. Check that `npx` can execute
3. Review MCP server logs in Claude Desktop
4. Ensure environment variables are set (e.g., `GITHUB_TOKEN`)

## 📞 Support

For questions about:
- **Project functionality**: See main `README.md`
- **Claude integration**: See `.mcp/README.md`
- **API documentation**: Check individual route files

## 🎨 Brand Reminder

When working with Claude on UI/UX or visual elements:
- **Neon Aqua**: #00F5FF
- **Neon Violet**: #7B2CFF
- **Midnight Black**: #000000

Division colors:
- **Operations (COO)**: #708090
- **Marketing (CMO)**: #7B2CFF
- **Technology (CTO)**: #0066FF
- **Social Media (SMD)**: #00F5FF
- **Creator Relations (CCRO)**: #FF6B6B

---

*Built with 💜 by the Creative Connect Team*  
*Where Creativity Meets Community*
