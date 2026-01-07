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
```

### 3. Environment Configuration

Create a `.env` file in the root directory and add run the command:

```env
cp .env.example .env
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

- Use services like **Supabase** or **Neon**
- Copy the connection string to your `DB_URL` environment variable

### 5. Supabase Setup

1. Go to Supabase and create a new project
2. Get your project URL and anon key from the API settings
3. Add these to your `.env` file
4. Supabase will handle user authentication and real-time features

### 6. Additional Services Setup (Required for Full Functionality)

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

#### Gemini API

1. Get an API key from Google AI Studio (https://makersuite.google.com/app/apikey)
2. Add `GEMINI_API_KEY` to your `.env` file

### 7. Socket Server Setup

The socket server handles real-time communication. It needs its own `.env` file:

Create `.env` file in the `socket-server` directory:

```env
cd socket-server
cp .env.example .env
```

Start the socket server in a separate terminal:

```bash
cd socket-server
npm install
npm run dev
```

### 8. Database Migration

Run Prisma migrations to set up your database schema:

```bash
npm run migrate
# or
npx prisma generate && npx prisma migrate dev
```

### 9. Start Development Server

**Main Application**:

```bash
npm run dev
```

**Worker Process** (in a separate terminal for background jobs):

```bash
npm run dev:workers
```

**Or run both together**:

```bash
npm run all
```

### 10. Run using Docker(Optional)

**Ensure env files are created**

```
docker compose up --build -d
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
├── ai/                  # AI configuration
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

## 🚀 Deployment

### Docker Compose Deployment (Recommended)

The easiest way to deploy Note God is using Docker Compose, which sets up all services:

1. **Create Environment Files**:

Ensure `.env` in the root directory and `.env` in the `socket-server` directory:

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
5. Verify APIs (Supabase, Gemini) are accessible
6. Review Docker logs if using Docker Compose: `docker-compose logs -f`

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Supabase](https://supabase.com/) for authentication and database
- [Google Gemini](https://ai.google.dev/) for advanced AI capabilities
- [Socket.IO](https://socket.io/) for real-time communication

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
