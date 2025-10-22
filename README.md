# BugSentinel

BugSentinel is a developer tool that combines **AI-powered bug detection** with **snippet management**. It helps developers analyze code, find issues, and refactor snippets efficiently.

### Core Foundations

- **React + Vite + TypeScript** project setup
- **Zustand** state management with persistent storage
- **Monaco Editor** integration with syntax highlighting
- **Supabase** backend configuration
- **Authentication** system (email/password, signup, login, logout, session persistence)

### Snippet Management & UI

- **Snippet CRUD operations** (create, read, update, delete)
- **Snippet metadata handling** (language, timestamps, analysis results)
- **Dashboard UI** with responsive panels and sidebar
- **Cross-device sync** for preferences and last opened snippet

### AI-Powered Features

- **Gemini AI integration** for intelligent code analysis
- **Error highlighting** with squiggly underlines and tooltips
- **Code refactoring** with AI-suggested improvements
- **Diff visualization** with before/after code comparison

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` with your actual Supabase credentials.

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # React components
│   ├── AuthForm.tsx    # Authentication form
│   └── CodeEditor.tsx  # Monaco Editor wrapper
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Authentication hook
├── lib/                # Library configurations
│   └── supabase.ts     # Supabase client setup
├── services/           # API services
│   └── supabaseService.ts # Supabase operations
├── store/              # Zustand store
│   ├── types.ts        # TypeScript types
│   └── useStore.ts     # Global state management
└── App.tsx             # Main application component
```

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite
- **State Management:** Zustand with persistence
- **Code Editor:** Monaco Editor
- **Backend:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Styling:** Vanilla CSS

## Features Implemented

### Authentication System

- Email/password signup and login
- Session persistence across browser refreshes
- Logout functionality
- Protected routes with full dashboard access

### Snippet Management

- **Create** new snippets with title and language selection
- **Read** and display snippets in organized list view
- **Update** snippet content, title, and metadata
- **Delete** snippets with confirmation
- Support for 15+ programming languages
- Real-time code editing with Monaco Editor
- Auto-save functionality with unsaved changes indicator

### Dashboard UI

- **Responsive layout** with collapsible sidebar
- **Snippet list panel** with search and filtering
- **Code editor panel** with full Monaco Editor features
- **Header with controls** for snippet management
- **Theme support** (light/dark mode) with instant switching
- **Language indicators** with color coding

### Cross-Device Sync

- **Theme preferences** synced across devices
- **Last opened snippet** restored on login
- **Editor settings** preserved per user
- **Real-time synchronization** with Supabase

### AI-Powered Code Analysis

- **Intelligent bug detection** using Google Gemini AI
- **Multi-type analysis** (syntax, logic, security, performance issues)
- **Inline error highlighting** with squiggly underlines
- **Interactive tooltips** with detailed explanations and suggestions
- **Severity-based color coding** (high/medium/low priority issues)

### AI Code Refactoring

- **Smart code improvements** with AI-generated suggestions
- **Before/after diff visualization** with syntax highlighting
- **Detailed explanations** of what changes were made and why
- **One-click apply/reject** workflow for suggested changes
- **Context-aware refactoring** based on detected issues

### Advanced Code Editor

- Monaco Editor with syntax highlighting and error decorations
- Multi-language support (JavaScript, TypeScript, Python, Java, C++, etc.)
- Theme support (light/dark mode) with AI panel integration
- Real-time code editing with auto-completion
- **Jump-to-line functionality** from analysis results
- **Visual error indicators** in gutter and minimap

### State Management

- Global state with Zustand
- Persistent local preferences
- User session management
- Real-time snippet synchronization
- Optimistic UI updates

### Backend Integration

- Supabase client configuration
- Complete database schema for snippets and preferences
- Row Level Security (RLS) policies
- Real-time data synchronization
- Error handling and connection testing

## Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL migration in `supabase/migrations/001_initial_schema.sql`
3. Update your `.env` file with the project URL and anon key

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key  # For Phase 3
```

## Testing

The app includes comprehensive testing capabilities:

- **Authentication Flow:** Complete signup/login/logout cycle
- **Snippet Management:** Create, edit, delete, and list snippets
- **Cross-Device Sync:** Theme and preferences sync across sessions
- **Real-time Editing:** Code changes with auto-save functionality
- **AI Code Analysis:** Test bug detection with sample code snippets
- **AI Refactoring:** Generate and apply code improvements
- **Error Highlighting:** Visual indicators and tooltips in editor
- **Responsive UI:** Dashboard layout adapts to different screen sizes
- **Error Handling:** Graceful error messages and recovery

## Next Steps

Ready to implement security and offline features:

- Local-first storage with offline support
- Conditional AI requests based on API key availability
- API rate limiting and abuse prevention
- Enhanced security measures

## Security Features

- Row Level Security (RLS) enabled
- User-scoped data access
- Secure authentication flow
- Environment variable protection

## Development Notes

- Hot module replacement (HMR) enabled
- TypeScript strict mode
- ESLint configuration
- Modular architecture for easy extension

---

**Status:** Phase 1, 2 & 3 Complete ✅  
**Next:** Ready for Phase 4 (Security & Offline Support) implementation

**Contact: ybunhong12@gmail.com**
