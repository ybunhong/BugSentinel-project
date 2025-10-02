# BugSentinel – Software Specification 

## 1. Overview

**Project Name:** BugSentinel
**Version:** 1.0.0
**Description:**
BugSentinel is a developer tool that combines **AI-powered bug detection** with **snippet management**. It helps developers analyze code, find issues, and refactor snippets efficiently. The application is **local-first** but integrates with external AI (Google Gemini, extensible to other models) when configured.

**Goals:**

* Provide fast, local-first snippet editing and storage.
* Enable developers to detect and fix bugs with AI assistance.
* Offer cross-device sync without compromising privacy.

---

## 2. System Architecture

### 2.1 Technology Stack

* **Frontend:** React (TypeScript, Vite, Zustand, Monaco Editor)
* **Backend (Serverless):** Node.js runtime, deployed as edge functions
* **Database:** Supabase (PostgreSQL) for snippets and user accounts
* **Authentication:** Supabase Auth (email/password, OAuth)
* **AI Integration:** Google Gemini (via `@google/generative-ai` SDK)
* **Styling:** Vanilla CSS with custom variables for dark/light themes

---

### 2.2 Key Modules

1. **Authentication Module**

   * Signup, login, OAuth providers (Google, GitHub)
   * Session persistence

2. **Editor Module**

   * Monaco Editor for writing/pasting code
   * Syntax highlighting and theming

3. **Analysis Module**

   * AI-powered bug detection (Gemini)
   * Inline error highlighting and side panel explanations

4. **Refactoring Module**

   * AI-suggested improvements with before/after diffs
   * Accept/Reject workflow

5. **Snippet Module**

   * Save/edit/delete snippets with metadata
   * Organize by language, title, and date

6. **Sync Module**

   * Store preferences and last snippet in Supabase
   * Cross-device sync

---

## 3. Features

### 3.1 Authentication

* Secure login/signup (email/password, Google, GitHub)
* Auto-login with refresh

### 3.2 Snippet Management

* Create, update, delete, and list snippets
* Metadata: language, title, timestamp, last analysis results

### 3.3 Code Analysis (AI-powered)

* Detect syntax errors, logic issues, security flaws
* Show inline squiggles + tooltips in editor
* Side panel with bug explanations

### 3.4 Refactoring & Diff

* Suggest optimized code
* Side-by-side diff view and inline diff toggle
* One-click "apply changes"

### 3.5 Cross-Device Sync

* Theme, editor settings, last opened snippet
* Stored in Supabase per user

### 3.6 Security & Privacy

* Code remains local unless AI enabled
* AI API key required for analysis
* Rate limiting to prevent abuse

---

## 4. Non-Functional Requirements

* **Performance:** Analysis for <300 LOC within 2s
* **Scalability:** Multi-user support via Supabase
* **Reliability:** Works offline for editing/snippets (AI disabled)
* **Usability:** Minimal setup, intuitive editor UI
* **Extensibility:** Modular design for new AI providers and languages

---
