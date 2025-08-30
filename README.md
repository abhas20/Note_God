# Note God 📝✨

**Note God** is an intelligent, AI-powered note-taking application that transforms how you create, manage, and interact with your notes. Built with cutting-edge technologies, it combines the simplicity of note-taking with the power of artificial intelligence to enhance your productivity.

## 🚀 Features

### Core Functionality
- **Smart Note Creation**: Create and organize notes with a clean, intuitive interface
- **Real-time Editing**: Seamless note editing experience with auto-save capabilities
- **User Authentication**: Secure user registration, login, and profile management
- **Responsive Design**: Optimized for desktop and mobile devices

### AI-Powered Features
- **AI Note Generation**: Generate comprehensive notes on any topic using advanced AI
- **Interactive Q&A**: Ask questions about your notes and get intelligent responses
- **Content Analysis**: AI-powered insights and suggestions for your content
- **Smart Formatting**: Automatic formatting and structure suggestions

### Advanced Capabilities
- **Real-time Collaboration**: Live updates and synchronization
- **Search & Filter**: Powerful search functionality across all your notes
- **Theme Support**: Dark/light mode toggle for comfortable viewing
- **Export Options**: Various export formats for your notes

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.2.3** - React framework with App Router
- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### Backend & Database
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Robust relational database
- **Supabase** - Authentication and real-time features

### AI Integration
- **OpenAI API** (via OpenRouter) - Advanced language models
- **Pollinations API** - AI text generation for notes

### Development Tools
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Turbopack** - Fast bundler for development

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

# OpenAI API Configuration (via OpenRouter)
OPENAI_API_KEY="your_openrouter_api_key"

# Application URL (for password reset emails)
NEXT_PUBLIC_URL="http://localhost:3000"
```

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

1. Generate an API key of OpenAI
2. Add the key to your `.env.local` file as `OPENAI_API_KEY`

### 7. Database Migration

Run Prisma migrations to set up your database schema:

```bash
npm run migrate
# or
npx prisma generate && npx prisma migrate dev
```

### 8. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🏗️ Project Structure

```
Note_God/
├── src/
│   ├── action/          # Server actions
│   │   ├── note.ts      # Note-related actions
│   │   └── user.ts      # User-related actions
│   ├── app/             # Next.js App Router pages
│   │   ├── api/         # API routes
│   │   ├── auth/        # Authentication pages
│   │   ├── login/       # Login page
│   │   ├── signup/      # Signup page
│   │   ├── profile/     # User profile
│   │   └── page.tsx     # Home page
│   ├── auth/            # Authentication utilities
│   │   └── server.ts    # Server-side auth functions
│   ├── components/      # React components
│   │   ├── ui/          # Base UI components
│   │   ├── AskAIButton.tsx       # AI Q&A functionality
│   │   ├── NewNoteButton.tsx     # Create new notes
│   │   ├── NoteGenerator.tsx     # AI note generation
│   │   └── NoteTextInput.tsx     # Note editor
│   ├── db/              # Database configuration
│   │   ├── prisma.ts    # Prisma client
│   │   └── schema.prisma # Database schema
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   └── style/           # Global styles
├── openai/              # OpenAI configuration
├── public/              # Static assets
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # Project documentation
```

## 📚 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code linting
- `npm run format` - Format code with Prettier
- `npm run migrate` - Run Prisma database migrations

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

### Notes Management
- `POST /api/create-new-note` - Create a new note
- `PUT /api/notes/[id]` - Update existing note
- `DELETE /api/notes/[id]` - Delete a note
- `GET /api/notes` - Get user's notes

### AI Features
- `POST /api/ai/generate-note` - Generate AI notes
- `POST /api/ai/ask-question` - Ask questions about notes

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically with each push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:

```env
DB_URL=your_production_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_URL=https://your-domain.com
```

## 🎯 Getting Started Guide

### For New Users

1. **Sign Up**: Create an account using email and password
2. **Create Your First Note**: Click "New Note" to start writing
3. **Try AI Features**: 
   - Use "Ask AI to generate Notes" for automated content creation
   - Use "Ask AI Help" to get insights about your notes
4. **Organize**: Create multiple notes for different topics
5. **Search**: Use the search functionality to find specific content

### For Developers

1. **Explore the Codebase**: Start with `src/app/page.tsx` for the main interface
2. **Understanding Actions**: Check `src/action/` for server-side functions
3. **Database Schema**: Review `src/db/schema.prisma` for data models
4. **AI Integration**: See `src/components/NoteGenerator.tsx` and `src/components/AskAIButton.tsx`
5. **Authentication Flow**: Examine `src/auth/server.ts` and related components

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
# Verify your OpenAI API key
# Check if you have sufficient API credits
```

### Getting Help

If you encounter issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure your database is properly configured
4. Check that all APIs (Supabase, OpenAI) are accessible

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Radix UI](https://www.radix-ui.com/) for accessible components

---

**Note God** - Transform your note-taking experience with the power of AI! 🚀
