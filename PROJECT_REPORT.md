> **Stale.** This was written on 2026-02-08 before the repo was pushed, and
> parts of it are now wrong -- it claims one commit and no remote, and it claims
> "no sensitive data leaked in error responses" which was not true at the time
> (see the Fixed section of SECURITY.md). Kept as a point-in-time snapshot.
> SECURITY.md is the current statement of security posture.

# OpenGuard - Project Progress Report

**Date:** February 8, 2026
**Status:** MVP Complete - Ready for Demo
**Build:** Passing (0 errors, 0 warnings)

---

## What Is OpenGuard?

OpenGuard is an AI-powered Fractional CISO (Chief Information Security Officer) for non-profits and community organizations. It conducts conversational security assessments through a chat interface and generates custom, plain-English cybersecurity policies with actionable compliance checklists.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript | 5.x |
| UI Library | React | 19.2.3 |
| Styling | Tailwind CSS 4 + shadcn/ui (Radix primitives) | 4.x |
| Database | Supabase (PostgreSQL with Row Level Security) | 2.93.2 |
| Auth | Supabase Auth with SSR cookie-based sessions | 0.8.0 |
| AI | Vercel AI SDK (`ai` 6.x) with `@ai-sdk/anthropic` + `@ai-sdk/openai` | 6.0.57 |
| PDF | `marked` for HTML generation with print-optimized CSS | 17.0.1 |
| Markdown | `react-markdown` for policy rendering | 10.1.0 |

---

## Codebase Statistics

- **Total source files:** 56
- **Total lines of code:** ~6,200+
- **Git commits:** 1 (initial commit + uncommitted working tree)
- **Remote:** github.com/hidaroz/openguard.git (not yet pushed)

### File Breakdown by Area

| Area | Files | Lines |
|------|-------|-------|
| Pages & Routes | 19 | ~2,700 |
| Components (custom) | 7 | ~888 |
| Components (shadcn/ui) | 16 | ~1,372 |
| Library / Utilities | 6 | ~439 |
| Types | 1 | 303 |
| Database Migrations | 1 | 319 |
| Middleware | 1 | 19 |
| Global CSS | 1 | 246 |

---

## Application Architecture

### User Flow

```
Landing Page → Sign Up/Login → Dashboard → Start Assessment → AI Chat Interview
    → Policy Generation → Policy Viewer → Compliance Tracker
```

### Route Map (15 routes)

**Public:**
- `/` - Marketing landing page (hero, features, how-it-works, testimonials, CTA)
- `/login` - Email/password login with error handling
- `/signup` - User registration
- `/callback` - Supabase OAuth/SSR callback

**Protected (requires auth):**
- `/dashboard` - Overview with stats (assessments, policies, compliance %), recent items
- `/dashboard/interview` - Interview list (in-progress / completed sections)
- `/dashboard/interview/[id]` - Live chat interface with streaming AI
- `/dashboard/policies` - Generated policies list with PDF download
- `/dashboard/policies/[id]` - Full policy viewer with markdown rendering
- `/dashboard/compliance` - Filterable compliance checklist with progress tracking
- `/dashboard/settings` - User/organization settings form

**API Routes:**
- `POST /api/chat` - Streaming AI chat (Vercel AI SDK)
- `POST /api/policies/generate` - Generate policy from interview transcript
- `GET /api/policies/export?id=` - Export policy as print-ready HTML/PDF

---

## Database Schema

**Engine:** PostgreSQL via Supabase with Row Level Security on all tables

### Tables (5)

1. **organizations** - User's organization profile
   - Fields: id, user_id (FK auth.users), name, type (enum), description, website, profile (JSONB)
   - RLS: Scoped to auth.uid()

2. **interviews** - Security assessment sessions
   - Fields: id, organization_id (FK), status (enum: in_progress/completed/abandoned), extracted_data (JSONB), started_at, completed_at
   - Indexes: org_id, status

3. **messages** - Chat history per interview
   - Fields: id, interview_id (FK), role (enum: user/assistant/system), content (text)
   - Index: composite (interview_id, created_at)

4. **policies** - Generated security policies
   - Fields: id, organization_id (FK), interview_id (FK), title, content (markdown text), version (integer), pdf_url
   - Supports versioning per organization

5. **compliance_items** - Actionable security tasks
   - Fields: id, policy_id (FK), organization_id (FK), category (enum: immediate/short_term/long_term/ongoing), title, description, status (enum: pending/in_progress/completed/overdue), due_date, completed_at

### Enums
- `organization_type`: nonprofit, community_org, religious, educational, healthcare, advocacy, other
- `interview_status`: in_progress, completed, abandoned
- `message_role`: user, assistant, system
- `compliance_status`: pending, in_progress, completed, overdue
- `compliance_category`: immediate, short_term, long_term, ongoing

### Security Model
- RLS enabled on all 5 tables
- Hierarchical ownership: auth.users → organizations → interviews → messages/policies/compliance
- All RLS policies verify ownership through organization.user_id = auth.uid()
- Storage bucket `policies` for PDF uploads with scoped access policies
- 10 database indexes for query performance

---

## AI Integration

### Provider Support
- **Primary:** Anthropic Claude Sonnet 4 (if ANTHROPIC_API_KEY set)
- **Fallback:** OpenAI GPT-4o (if OPENAI_API_KEY set)
- Provider selection is automatic based on available environment variables

### Three AI Prompts

1. **CISO Interview Prompt** (79 lines)
   - Role: Friendly fractional CISO conducting a security assessment
   - Tone: Warm, plain English, non-condescending
   - 5 interview phases: org basics → data handling → technology → access control → current practices
   - Asks 2-5 questions per phase, adapts based on answers
   - Signals completion with `[INTERVIEW_COMPLETE]` marker

2. **Policy Generation Prompt** (87 lines)
   - Generates a 12-section markdown policy from interview transcript
   - Sections: Executive Summary, Org Profile, Data Classification, Access Control, Device/Network Security, Email Security, Backup/Recovery, Incident Response, Vendor Management, Training, Privacy Policy, Compliance Checklist
   - Guidelines: specific, realistic, actionable, sized for the organization

3. **Compliance Extraction Prompt** (24 lines)
   - Extracts 8-15 actionable items from policy content
   - Returns structured JSON with category, title, description
   - Categories balanced across immediate/short_term/long_term/ongoing

### AI Pipeline

```
Chat (streaming) → Interview Complete → Generate Policy (non-streaming)
    → Extract Compliance Items → Save All to Database
```

- Chat uses `streamText()` for real-time responses
- Policy generation uses `generateText()` for complete output
- Compliance extraction includes JSON parsing with regex fallback
- Default 6-item compliance checklist if AI extraction fails

---

## Components Built

### Custom Components (7)

| Component | Lines | Description |
|-----------|-------|-------------|
| `ChatInterface` | 193 | Full chat UI with streaming, auto-scroll, auto-resize textarea, completion detection |
| `MessageBubble` | 89 | Styled message display (user vs assistant) |
| `TypingIndicator` | 20 | Loading dots animation |
| `ComplianceChecklist` | 251 | Grouped checklist with status toggling, color-coded categories, progress counts |
| `DashboardShell` | 63 | Layout wrapper with responsive sidebar (desktop fixed, mobile sheet) |
| `Sidebar` | 170 | Navigation with logo, main nav links, user dropdown menu |
| `PolicyViewer` | 102 | Markdown renderer with custom heading/table/code/blockquote styles |

### shadcn/ui Components (16)
avatar, badge, button, card, dialog, dropdown-menu, input, label, progress, scroll-area, select, separator, sheet, sonner (toast), tabs, textarea

---

## Auth & Middleware

### Authentication Flow
- Supabase Auth with email/password
- Cookie-based SSR sessions via `@supabase/ssr`
- Three client helpers: `server.ts` (async, for Server Components), `client.ts` (sync, for Client Components), `middleware.ts` (session refresh)

### Route Protection
- Middleware intercepts all non-static routes
- Protected paths (`/dashboard/*`): redirects unauthenticated users to `/login` with return URL
- Auth paths (`/login`, `/signup`): redirects authenticated users to `/dashboard`
- Defense-in-depth: middleware checks + RLS + explicit ownership verification in API routes

---

## Security Measures

1. **Row Level Security** on all database tables
2. **Hierarchical ownership** checks (user → org → resource)
3. **Explicit authorization** in every API route (not just relying on RLS)
4. **Cookie-based sessions** with automatic token refresh
5. **Environment variables** for all secrets (gitignored via `.env*` pattern)
6. **Input validation** in API routes before database operations
7. **Error suppression** - no sensitive data leaked in error responses

---

## What's Fully Working (End-to-End)

1. Marketing landing page with full copy and responsive design
2. User registration and login with session management
3. Dashboard with real-time stats (assessment count, policy count, compliance %)
4. AI-powered conversational security assessment with streaming responses
5. Automatic interview completion detection
6. Policy generation from interview transcripts (12-section markdown)
7. Policy viewing with styled markdown rendering
8. PDF/print export of policies with professional styling
9. Compliance item extraction from generated policies
10. Compliance tracking with status management (pending/in-progress/completed)
11. Category-based compliance grouping (immediate/short-term/long-term/ongoing)
12. Organization settings management
13. Responsive design (mobile sidebar sheet, desktop fixed sidebar)
14. Loading states and error boundaries for all dashboard routes
15. Toast notifications for user feedback

---

## What's Not Yet Built / Future Enhancements

- OAuth providers (Google, GitHub) - auth callback route exists but no social login buttons
- Multi-organization support per user
- Policy comparison between versions
- Team/multi-user access to an organization
- Email notifications for compliance due dates
- Analytics/reporting dashboard
- Supabase Storage integration for actual PDF file uploads (API generates print HTML currently)
- Automated testing (no test files exist)
- CI/CD pipeline

---

## Environment Requirements

```
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
OPENAI_API_KEY=<optional-if-anthropic-set>
ANTHROPIC_API_KEY=<optional-if-openai-set>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build (currently passing)
npm run lint     # ESLint (currently 0 errors, 0 warnings)
npm run start    # Start production server
```

---

## Repository

- **GitHub:** github.com/hidaroz/openguard.git
- **Branch:** main
- **Status:** Code complete, not yet pushed to remote
