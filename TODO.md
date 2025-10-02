# BugSentinel – Implementation TODO List

## Phase 1: Core Foundations (Easy) ✅ COMPLETED

- [x] **Setup project repository and environment**
  - Initialize React + Vite + TypeScript project
  - Setup ESLint, Prettier, and basic folder structure
  - Acceptance Criteria: Project runs `npm run dev` without errors, basic app renders "Hello BugSentinel" ✅

- [x] **Install and configure Zustand for state management**
  - Create global store for snippets, user session, and analysis results
  - Acceptance Criteria: Store can save and retrieve test values; state persists within a session ✅

- [x] **Integrate Monaco Editor**
  - Add Monaco Editor to a sample page
  - Acceptance Criteria: Users can type code, scroll, and see syntax highlighting ✅

- [x] **Setup Supabase for backend services**
  - Configure authentication, database, and API keys
  - Acceptance Criteria: Supabase connection verified; test query returns dummy data ✅

- [x] **Implement basic Authentication (email/password)**
  - Sign up, login, logout, session persistence
  - Acceptance Criteria: Users can create accounts, login, and remain logged in on refresh ✅

---

## Phase 2: Snippet Management & UI (Medium) ✅ COMPLETED

- [x] **Snippet CRUD operations**
  - Save, edit, delete, and list snippets
  - Acceptance Criteria: User can create a snippet with title/language, edit it, delete it, and view in list ✅

- [x] **Snippet metadata handling**
  - Store language, timestamp, and analysis results
  - Acceptance Criteria: Each snippet record has correct metadata visible in UI ✅

- [x] **UI Layout: Dashboard and Panels**
  - Create snippet list, code editor panel, and side panel for errors
  - Acceptance Criteria: Dashboard responsive; user can select snippet and see code loaded in editor ✅

- [x] **Implement cross-device sync for preferences**
  - Theme, editor settings, last opened snippet saved in Supabase
  - Acceptance Criteria: Preferences persist across devices when user logs in ✅

---

## Phase 3: AI-Powered Features (Hard) ✅ COMPLETED

- [x] **Integrate Gemini AI for code analysis**
  - Send code to Gemini API, receive bug reports and suggestions
  - Acceptance Criteria: Inline highlights appear in Monaco Editor; side panel lists detected bugs ✅

- [x] **Error highlighting in editor**
  - Squiggly underlines + tooltips for syntax/logical/security issues
  - Acceptance Criteria: Errors correctly highlighted, tooltips show Gemini explanation ✅

- [x] **Code refactoring via Gemini**
  - Show AI-suggested code improvements
  - Acceptance Criteria: Before/after diff view shows changes; user can accept/reject changes ✅

- [x] **Diff visualization**
  - Side-by-side view and inline view for refactored code
  - Acceptance Criteria: User can toggle views; additions/deletions highlighted ✅

---

## Phase 4: Security & Offline Support (Medium-Hard) ✅ COMPLETED

- [x] **Ensure local-first storage**
  - Default snippet editing works offline without AI
  - Acceptance Criteria: Users can create/edit snippets offline; data saved locally and synced later ✅

- [x] **Conditional AI requests**
  - Only call Gemini if user has API key configured
  - Acceptance Criteria: Without API key, analysis buttons disabled; with key, API calls succeed ✅

- [x] **API rate limiting**
  - Protect backend calls with client-side rate limiting
  - Acceptance Criteria: Exceeding request limit returns proper error; app handles gracefully ✅

---

## Phase 5: Non-Functional Enhancements (Optional / Future)

- [ ] **Performance optimization**
  - Ensure AI response ≤ 2s for snippets <300 LOC
  - Acceptance Criteria: Response times measured and below threshold

- [ ] **Extensibility: Multi-language support**
  - Add support for Python, Java, C++, HTML, CSS
  - Acceptance Criteria: Analysis and refactoring work correctly for each language

- [ ] **Future Enhancements**
  - Auto language detection, team workspace, offline linting, multiple AI providers
  - Acceptance Criteria: Features implemented incrementally without breaking existing functionality
