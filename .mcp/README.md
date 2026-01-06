# Claude Code Access Documentation

This directory contains configuration files that enable Claude (Anthropic's AI) to interact with the Creative Connect Platform backend codebase.

## Files

### `.claude.json`
Main configuration file containing:
- Project metadata and structure
- API endpoint documentation
- Dependencies and scripts
- Database and authentication information
- Brand colors and divisions
- Revenue streams and pricing
- Environment variables
- Security notes
- Deployment configuration

### `.claudeignore`
Specifies files and directories that Claude should ignore when analyzing the codebase:
- Dependencies (`node_modules/`)
- Environment files (`.env*`)
- Logs and build artifacts
- IDE and OS specific files
- Large media files

### `.mcp/config.json`
Model Context Protocol (MCP) server configuration for Claude Desktop or other MCP clients:
- **filesystem**: Read/write access to codebase
- **github**: GitHub repository operations
- **git**: Version control operations

## Usage

### For Claude Desktop
1. Place these configuration files in the project root
2. Open Claude Desktop
3. Navigate to Settings → Developer → Model Context Protocol
4. The filesystem server should automatically detect this project

### For API Usage
The `.claude.json` file can be read programmatically to provide context about the project structure and capabilities.

## Project Overview

**Creative Connect Platform** is an AI-powered creative opportunity engine launching on Valentine's Day 2026. This backend provides:

- Authentication & Authorization (JWT-based)
- Employee Dashboard APIs
- Stripe Payment Integration
- Virtual Assistant Task Management
- Digital Content Kit Sales

### Key Technologies
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Payments**: Stripe
- **Authentication**: JWT with refresh tokens

### Getting Started
```bash
npm install          # Install dependencies
cp .env.example .env # Configure environment
npm run dev          # Start development server
npm test             # Run tests
npm run lint         # Lint code
```

## API Structure

All API endpoints are prefixed with `/api/` and organized by feature:
- `/api/auth` - Authentication
- `/api/dashboard` - Dashboard operations
- `/api/payments` - Stripe integration
- `/api/va` - Virtual assistant
- `/api/content-kits` - Digital products

## Development Guidelines

When working with this codebase:
1. Follow the existing Express.js patterns
2. Use Mongoose for database operations
3. Implement proper JWT authentication
4. Follow the division color scheme
5. Maintain API documentation in README.md
6. Test with Jest and Supertest
7. Lint with ESLint

## Security Considerations

- All sensitive data should use environment variables
- JWT tokens should be properly validated
- Rate limiting should be enabled in production
- CORS should be configured for allowed origins only
- MongoDB should have authentication in production

## Brand Identity

- **Neon Aqua**: #00F5FF
- **Neon Violet**: #7B2CFF
- **Midnight Black**: #000000

## Support

For questions about this configuration or the project structure, refer to:
- Main `README.md` for API documentation
- `package.json` for scripts and dependencies
- `server.js` for application entry point
- Individual route files for endpoint implementations
