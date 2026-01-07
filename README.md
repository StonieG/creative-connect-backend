# 🎨 Creative Connect Platform - MVP Backend

**The AI-powered creative opportunity engine**  
*Launching Valentine's Day 2026* 💜

> 🤖 **[Claude AI Integration Available](./CLAUDE_SETUP.md)** - This repository is configured for seamless Claude AI code assistance.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Stripe Account (for payments)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 3. Start MongoDB (if local)
mongod

# 4. Run the server
npm run dev    # Development with hot reload
npm start      # Production
```

---

## 📁 Project Structure

```
creative-connect-backend/
├── server.js              # Main Express application
├── package.json           # Dependencies and scripts
├── .env.example           # Environment template
│
├── routes/
│   ├── auth.js            # Authentication (login, register, JWT)
│   ├── dashboard.js       # Employee dashboard API
│   ├── payment.js         # Stripe integration
│   ├── va-system.js       # Virtual assistant management
│   └── content-kits.js    # Digital products store
│
├── models/
│   └── Employee.js        # Employee/User schema
│
├── middleware/
│   └── auth.js            # JWT verification & RBAC
│
└── public/
    └── index.html         # Landing page (Valentine's 2026)
```

---

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new employee (Admin only) |
| POST | `/api/auth/login` | Employee login |
| POST | `/api/auth/refresh-token` | Refresh JWT |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/change-password` | Update password |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/overview` | Dashboard stats |
| GET | `/api/dashboard/team` | Team members list |
| PUT | `/api/dashboard/employee/:id` | Update employee |
| GET | `/api/dashboard/division/:code` | Division stats |

### Payments (Stripe)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments/products` | List all products |
| POST | `/api/payments/create-checkout` | Create checkout session |
| POST | `/api/payments/webhook` | Stripe webhook handler |
| GET | `/api/payments/stats` | Revenue statistics |

### Virtual Assistant
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/va/dashboard` | VA task dashboard |
| POST | `/api/va/tasks` | Create new task |
| GET | `/api/va/tasks` | List all tasks |
| PATCH | `/api/va/tasks/:id` | Update task status |
| POST | `/api/va/generate-daily` | Generate daily tasks |
| GET | `/api/va/dm-scripts` | Get DM templates |
| **POST** | **`/api/va/ai/generate-dm-scripts`** | **Generate DM scripts with Claude AI** |
| **POST** | **`/api/va/ai/generate-social-content`** | **Generate social content with Claude AI** |
| **POST** | **`/api/va/ai/generate-task-description`** | **Generate task descriptions with Claude AI** |
| **POST** | **`/api/va/ai/analyze-text`** | **Analyze text with Claude AI** |
| **GET** | **`/api/va/ai/status`** | **Check Claude AI service status** |

### Content Kits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content-kits` | List all kits |
| GET | `/api/content-kits/:id` | Kit details |
| GET | `/api/content-kits/download/:token` | Verify download |
| GET | `/api/content-kits/admin/analytics` | Sales analytics |

---

## 💰 Revenue Streams

### Content Kits (One-Time)
| Product | Price | Contents |
|---------|-------|----------|
| Starter Kit | $49 | 50 templates, guides |
| Pro Kit | $149 | 200 templates, tools |
| Agency Kit | $499 | 500 templates, training |

### Subscriptions (Monthly)
| Plan | Price | Features |
|------|-------|----------|
| Basic Management | $99/mo | Calendar, basic analytics |
| Pro Management | $299/mo | Full service, strategy calls |
| Enterprise | $999/mo | Dedicated manager, 24/7 |

---

## 👥 Division Color Codes (Brand Guide)

| Division | Code | Color |
|----------|------|-------|
| Operations | COO | Steel #708090 |
| Marketing | CMO | Violet #7B2CFF |
| Technology | CTO | Blue #0066FF |
| Social Media | SMD | Aqua #00F5FF |
| Creator Relations | CCRO | Coral #FF6B6B |

---

## 🛠️ Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Seed database with test data
npm run seed
```

### 🤖 Claude AI Integration

The platform integrates Claude AI for intelligent content generation:

- **DM Scripts**: Generate personalized outreach messages
- **Social Content**: Create engaging social media posts
- **Task Descriptions**: Auto-generate detailed task instructions
- **Text Analysis**: Analyze sentiment and extract insights

**Setup:**
1. Get an API key from [Anthropic](https://console.anthropic.com/)
2. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-api-xxx`
3. Optional: Set preferred model: `CLAUDE_MODEL=claude-3-5-sonnet-20241022`

**Usage Example:**
```bash
curl -X POST http://localhost:5000/api/va/ai/generate-dm-scripts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetAudience": "designers",
    "purpose": "recruitment",
    "platform": "Instagram",
    "count": 3
  }'
```

---

## 📅 Launch Timeline

- **Now - January 2025**: MVP Development
- **Mid-January 2025**: Investor Demo Ready
- **February 14, 2026**: 🚀 Public Launch

---

## 🔒 Security Notes

- Change all secrets in production
- Use HTTPS in production
- Enable rate limiting
- Set up MongoDB authentication
- Configure CORS properly

---

## 📞 Support

Built with 💜 by the Creative Connect Team

**Brand Colors:**
- Neon Aqua: #00F5FF
- Neon Violet: #7B2CFF
- Midnight Black: #000000

---

*Where Creativity Meets Community*
