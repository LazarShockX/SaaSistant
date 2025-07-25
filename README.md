# 🤖 SaaSistant

An AI-powered video meeting platform that enables users to create and interact with AI agents during video calls. Built with Next.js, TypeScript, and integrated with OpenAI. Check out the app on Vercel: [saasistant.vercel.app](https://saa-sistant.vercel.app)

**Note:** AI features—including real-time agent interaction, summary generation, and AI chat—are unavailable when the associated OpenAI account has insufficient credits. The deployed version on Vercel currently has no credits, so these features are disabled.

## ✨ Features

### 🤖 AI Agents
- Create custom AI agents with personalized instructions
- Manage multiple agents for different use cases
- OpenAI Realtime API for voice interactions

### 📹 Video Meetings  
- Real-time video and audio streaming powered by Stream Video SDK
- Screen sharing capabilities
- Meeting recordings and transcriptions
- Automated meeting summaries

### 🔐 Authentication & Security
- Secure authentication with Better Auth
- User session management
- Protected routes and API endpoints

### 💎 Premium Features
- **Free Tier**: Up to 3 agents and 3 meetings
- **Premium**: Unlimited agents and meetings
- Subscription management via Polar

### 📊 Dashboard & Management
- Comprehensive dashboard for managing agents and meetings
- Meeting history with status tracking (upcoming, active, completed, cancelled)
- Search and filter functionality
- Pagination for large datasets

## 🛠️ Tech Stack

**Frontend:**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form management with Zod validation

**Backend & Database:**
- **tRPC** - End-to-end typesafe APIs
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Primary database (via Neon)
- **Better Auth** - Authentication system

**AI & Video:**
- **OpenAI** - AI agent
- **Stream Video SDK** - Video calling infrastructure
- **Stream Chat** - Real-time messaging
- **Inngest** - Background job processing

**Additional Tools:**
- **Polar** - Subscription and payment management
- **Dicebear** - Avatar generation
- **React Query** - Data fetching and caching

## 🚀 Getting Started

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# Authentication
BETTER_AUTH_SECRET="your_auth_secret"
BETTER_AUTH_URL="http://localhost:3000"

GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# AI
OPENAI_API_KEY="your_openai_api_key"

# Video & Chat
STREAM_API_KEY="your_stream_api_key"
STREAM_SECRET="your_stream_secret"

# Subscriptions
POLAR_ACCESS_TOKEN="your_polar_access_token"
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio
- `npm run dev:webhook` - Start webhook development server
