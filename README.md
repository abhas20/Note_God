# Note God 📝✨

**Note God** is an intelligent, AI-powered note-taking application that transforms how you create, manage, and interact with your notes. Built with cutting-edge technologies, it combines the simplicity of note-taking with the power of artificial intelligence to enhance your productivity.

## 🚀 Features

### Core Functionality
- **Smart Note Creation**: Create and organize notes with a clean, intuitive interface
- **Real-time Editing**: Seamless note editing experience with auto-save capabilities
- **User Authentication**: Secure user registration, login, and profile management
- **Responsive Design**: Optimized for desktop and mobile devices

### AI-Powered Features
- **AI Note Generation**: Generate comprehensive notes on any topic using advanced AI models (OpenAI, Gemini)
- **Interactive Q&A**: Ask questions about your notes and get intelligent responses
- **Content Analysis**: AI-powered insights and suggestions for your content
- **Smart Formatting**: Automatic formatting and structure suggestions
- **PDF Chat (RAG)**: Upload PDF documents and chat with them using Retrieval Augmented Generation
- **AI Image Generation**: Create stunning images from text prompts using Pollinations API

### Advanced Capabilities
- **Real-time Collaboration**: Live updates and synchronization via Socket.IO
- **Community Chat**: Real-time messaging and collaboration with other users
- **Vector Search**: Semantic search across your notes using Qdrant vector database
- **Background Processing**: Asynchronous file processing with BullMQ workers
- **Search & Filter**: Powerful search functionality across all your notes
- **Theme Support**: Dark/light mode toggle for comfortable viewing
- **Export Options**: Various export formats for your notes

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.2.8** - React framework with App Router
- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Socket.IO Client** - Real-time bidirectional communication

### Backend & Infrastructure
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Robust relational database
- **Supabase** - Authentication and real-time features
- **Socket.IO Server** - Real-time WebSocket server
- **Redis** - In-memory data store for caching and queuing
- **BullMQ** - Background job processing and task queue
- **Qdrant** - Vector database for semantic search and RAG

### AI Integration
- **OpenAI API** - GPT models for text generation
- **Google Gemini** - Alternative AI model support
- **LangChain** - Framework for building AI applications
- **Pollinations API** - AI image generation from text prompts
- **RAG (Retrieval Augmented Generation)** - PDF document chat functionality

### Development Tools
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Turbopack** - Fast bundler for development
- **Docker & Docker Compose** - Containerization and orchestration

## 📋 Prerequisites

Before setting up Note God, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** or **pnpm** package manager
- **PostgreSQL** database (local or cloud)
- **Git** for version control

## 🔧 Step-by-Step Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/abhas20/Note_God.git
cd Note_God
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory and add the following environment variables:

```env
# Database Configuration
DB_URL="postgresql://username:password@localhost:5432/note_god_db"

# Supabase Configuration (for Authentication)
SUPABASE_URL="your_supabase_project_url"
SUPABASE_ANON_KEY="your_supabase_anon_key"

# OpenAI API Configuration
OPENAI_API_KEY="your_openai_api_key"

# Gemini API Key (for alternative AI models)
GEMINI_API_KEY="your_gemini_api_key_here"

# Application URL (for password reset emails)
NEXT_PUBLIC_URL="http://localhost:3000"

# Socket Server URL (for real-time features)
SOCKET_SERVER_URL="http://localhost:4000"

# Redis Configuration (for BullMQ and caching)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD="your_redis_password_here"

# Qdrant Vector Database URL (for RAG and semantic search)
QDRANT_URL="http://localhost:6333"
```

**Note**: If using Docker Compose, some URLs will need to be adjusted (see Docker deployment section).

### 4. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a new database:
```sql
CREATE DATABASE note_god_db;
```
3. Update the `DB_URL` in your `.env.local` file

#### Option B: Cloud PostgreSQL (Recommended)
- Use services like **Supabase**, **Neon**, **PlanetScale**, or **Railway**
- Copy the connection string to your `DB_URL` environment variable

### 5. Supabase Setup

1. Go to Supabase and create a new project
2. Get your project URL and anon key from the API settings
3. Add these to your `.env.local` file
4. Supabase will handle user authentication and real-time features

### 6. OpenAI API Setup

1. Generate an API key from OpenAI (https://platform.openai.com/api-keys)
2. Add the key to your `.env.local` file as `OPENAI_API_KEY`

### 7. Additional Services Setup (Required for Full Functionality)

#### Redis Setup
Redis is required for background job processing and real-time features.

**Local Installation**:
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Windows (via WSL or download from Redis website)
```

**Docker (Recommended)**:
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

#### Qdrant Setup
Qdrant is required for vector search and PDF chat functionality.

**Docker (Recommended)**:
```bash
docker run -d -p 6333:6333 --name qdrant qdrant/qdrant:latest
```

Or use the provided Docker Compose (see deployment section).

#### Gemini API (Optional)
If you want to use Google's Gemini models:
1. Get an API key from Google AI Studio (https://makersuite.google.com/app/apikey)
2. Add `GEMINI_API_KEY` to your `.env.local` file

### 8. Socket Server Setup

The socket server handles real-time communication. It needs its own `.env` file:

Create `.env` file in the `socket-server` directory:
```env
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD="your_redis_password_here"
```

Start the socket server in a separate terminal:
```bash
cd socket-server
npm install
npm start
```

### 9. Database Migration

Run Prisma migrations to set up your database schema:

```bash
npm run migrate
# or
npx prisma generate && npx prisma migrate dev
```

### 10. Start Development Server

**Main Application**:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

**Worker Process** (in a separate terminal for background jobs):
```bash
npm run dev:workers
```

**Or run both together**:
```bash
npm run all
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🏗️ Project Structure

```
Note_God/
├── src/
│   ├── action/          # Server actions
│   │   ├── note.ts      # Note-related actions
│   │   ├── user.ts      # User-related actions
│   │   └── rag.ts       # RAG and file upload actions
│   ├── app/             # Next.js App Router pages
│   │   ├── api/         # API routes
│   │   │   ├── create-new-note/  # Create notes
│   │   │   ├── query-rag/        # RAG query endpoint
│   │   │   ├── messages/         # Chat messages
│   │   │   └── ...               # Other API routes
│   │   ├── auth/        # Authentication pages
│   │   ├── login/       # Login page
│   │   ├── signup/      # Signup page
│   │   ├── profile/     # User profile
│   │   ├── chatpdf/     # PDF chat interface
│   │   ├── visualise/   # AI image generation
│   │   └── page.tsx     # Home page
│   ├── auth/            # Authentication utilities
│   │   └── server.ts    # Server-side auth functions
│   ├── components/      # React components
│   │   ├── ui/          # Base UI components
│   │   ├── AskAIButton.tsx        # AI Q&A functionality
│   │   ├── NewNoteButton.tsx      # Create new notes
│   │   ├── NoteGenerator.tsx      # AI note generation
│   │   ├── NoteTextInput.tsx      # Note editor
│   │   ├── ComunityChat.tsx       # Community chat UI
│   │   ├── Visualise.tsx          # Image generation UI
│   │   ├── FileLayout.tsx         # PDF file management
│   │   └── AppSideBar.tsx         # Application sidebar
│   ├── db/              # Database configuration
│   │   ├── prisma.ts    # Prisma client
│   │   └── schema.prisma # Database schema
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── worker/          # Background workers
│   │   └── fileProcessor.ts  # File processing worker
│   ├── providers/       # React context providers
│   ├── middleware.ts    # Next.js middleware
│   └── style/           # Global styles
├── socket-server/       # Real-time Socket.IO server
│   ├── app.ts           # Socket server application
│   ├── services/        # Socket services
│   └── package.json     # Socket server dependencies
├── openai/              # OpenAI configuration
├── public/              # Static assets
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile           # Application Docker image
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # Project documentation
```

## 📚 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run dev:workers` - Start background worker process for file processing
- `npm run all` - Run both dev server and workers concurrently
- `npm run build` - Build the application for production (includes Prisma migrations)
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code linting
- `npm run format` - Format code with Prettier
- `npm run migrate` - Run Prisma database migrations

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset user password

### Notes Management
- `POST /api/create-new-note` - Create a new note
- `PUT /api/notes/[id]` - Update existing note
- `DELETE /api/notes/[id]` - Delete a note
- `GET /api/notes` - Get user's notes
- `GET /api/fetch-latest-note` - Fetch the most recent note

### AI Features
- `POST /api/ai/generate-note` - Generate AI notes
- `POST /api/ai/ask-question` - Ask questions about notes
- `POST /api/query-rag` - Query uploaded PDF documents using RAG

### File Management & Chat
- `POST /api/upload-file` - Upload PDF files for RAG
- `GET /api/files` - Get user's uploaded files
- `DELETE /api/delete-files` - Delete uploaded files
- `POST /api/messages` - Send chat messages
- `GET /api/messages` - Get chat messages
- `GET /api/fetch-prev-messages` - Fetch previous chat messages
- `POST /api/save-message` - Save a chat message

### Image Generation
- `POST /api/download-image` - Download generated images

## 🚀 Deployment

### Docker Compose Deployment (Recommended)

The easiest way to deploy Note God is using Docker Compose, which sets up all services:

1. **Create Environment Files**:

Create `.env` in the root directory:
```env
DB_URL="postgresql://username:password@localhost:5432/note_god_db"
SUPABASE_URL="your_supabase_url"
SUPABASE_ANON_KEY="your_supabase_key"
OPENAI_API_KEY="your_openai_key"
GEMINI_API_KEY="your_gemini_key"
NEXT_PUBLIC_URL="http://localhost:3000"
SOCKET_SERVER_URL="http://socket-server:4000"
REDIS_HOST="redis"
REDIS_PORT="6379"
REDIS_PASSWORD="your_redis_password"
QDRANT_URL="http://qdrant:6333"
```

Create `.env` in the `socket-server` directory:
```env
REDIS_HOST="redis"
REDIS_PORT="6379"
REDIS_PASSWORD="your_redis_password"
```

2. **Start All Services**:
```bash
docker-compose up -d
```

This will start:
- Main Next.js application (port 3000)
- Background workers for file processing
- Socket.IO server (port 4000)
- Redis (port 6379)
- Qdrant vector database (port 6333)

3. **View Logs**:
```bash
docker-compose logs -f
```

4. **Stop Services**:
```bash
docker-compose down
```

### Vercel Deployment

For deploying just the Next.js application (requires external Redis and Qdrant):

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically with each push to main branch

**Note**: You'll need to separately host:
- PostgreSQL database (Supabase, Neon, etc.)
- Redis instance (Upstash, Redis Cloud, etc.)
- Qdrant instance (Qdrant Cloud or self-hosted)
- Socket server (separate deployment or service)

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start

# In separate terminals, also start:
npm run dev:workers  # Background workers
cd socket-server && npm start  # Socket server
```

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:

```env
DB_URL=your_production_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_URL=https://your-domain.com
SOCKET_SERVER_URL=https://your-socket-server-url
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
QDRANT_URL=your_qdrant_url
```

## 🎯 Getting Started Guide

### For New Users

1. **Sign Up**: Create an account using email and password
2. **Create Your First Note**: Click "New Note" to start writing
3. **Try AI Features**: 
   - Use "Ask AI to generate Notes" for automated content creation
   - Use "Ask AI Help" to get insights about your notes
4. **Upload PDFs**: Navigate to the "Chat with PDF" section to upload documents and ask questions
5. **Generate Images**: Use the "Visualise" feature to create AI-generated images from text prompts
6. **Community Chat**: Connect with other users through real-time messaging
7. **Organize**: Create multiple notes for different topics
8. **Search**: Use the search functionality to find specific content

### For Developers

1. **Explore the Codebase**: Start with `src/app/page.tsx` for the main interface
2. **Understanding Actions**: Check `src/action/` for server-side functions
3. **Database Schema**: Review `src/db/schema.prisma` for data models
4. **AI Integration**: 
   - See `src/components/NoteGenerator.tsx` for note generation
   - Check `src/components/AskAIButton.tsx` for Q&A features
   - Review RAG implementation in `src/action/rag.ts`
5. **Authentication Flow**: Examine `src/auth/server.ts` and related components
6. **Real-time Features**: Explore `socket-server/` for WebSocket implementation
7. **Background Jobs**: Check `src/worker/fileProcessor.ts` for async processing

## 🔒 Security Features

- **Secure Authentication**: Powered by Supabase Auth
- **Data Encryption**: All sensitive data is encrypted
- **API Protection**: Server actions with user validation
- **Environment Security**: Sensitive keys stored in environment variables

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Verify your database URL and run:
npx prisma db push
```

**Supabase Auth Issues**
```bash
# Check your Supabase URL and keys in .env.local
# Ensure your Supabase project is active
```

**AI Features Not Working**
```bash
# Verify your OpenAI or Gemini API key
# Check if you have sufficient API credits
```

**Redis Connection Error**
```bash
# Ensure Redis is running:
redis-cli ping
# Should return: PONG

# Or start Redis:
brew services start redis  # macOS
sudo systemctl start redis  # Linux
docker start redis  # Docker
```

**Qdrant Connection Error**
```bash
# Check if Qdrant is running:
curl http://localhost:6333/health
# Should return: {"title":"qdrant - vector search engine","version":"..."}

# Or start Qdrant:
docker start qdrant
```

**Socket Server Not Connecting**
```bash
# Verify socket server is running on port 4000
# Check SOCKET_SERVER_URL in environment variables
# Ensure Redis is accessible to socket server
```

**Worker Process Not Running**
```bash
# Start workers separately:
npm run dev:workers

# Check Redis connection for BullMQ
```

**PDF Upload/Chat Issues**
```bash
# Ensure Qdrant is running and accessible
# Verify QDRANT_URL in environment variables
# Check worker process is running for file processing
```

### Getting Help

If you encounter issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure your database is properly configured
4. Check that all services (Redis, Qdrant, Socket server) are running
5. Verify APIs (Supabase, OpenAI, Gemini) are accessible
6. Review Docker logs if using Docker Compose: `docker-compose logs -f`

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Supabase](https://supabase.com/) for authentication and database
- [OpenAI](https://openai.com/) for powerful AI models
- [Google Gemini](https://ai.google.dev/) for advanced AI capabilities
- [Pollinations](https://pollinations.ai/) for AI image generation
- [Qdrant](https://qdrant.tech/) for vector database
- [Socket.IO](https://socket.io/) for real-time communication
- [Prisma](https://www.prisma.io/) for type-safe database access
- [LangChain](https://www.langchain.com/) for AI application framework

## 🌟 Key Features Highlights

### 📄 PDF Chat with RAG
Upload any PDF document and have intelligent conversations about its content. The system uses Retrieval Augmented Generation (RAG) with Qdrant vector database for semantic search.

### 🎨 AI Image Generation
Transform your ideas into stunning visuals using the Pollinations API. Generate images from text prompts with customizable parameters.

### 💬 Real-time Community Chat
Connect with other users through WebSocket-powered real-time messaging. All messages are synchronized instantly across all connected clients.

### 🔄 Background Processing
Heavy tasks like PDF processing and vector embeddings run asynchronously using BullMQ workers, ensuring the UI remains responsive.

### 🔍 Vector Search
Leverage Qdrant's vector database for semantic search across your notes and documents, finding relevant content even when exact keywords don't match.

---

**Note God** - Transform your note-taking experience with the power of AI! 🚀
