# OpenGuard

AI-powered Fractional CISO for non-profits and community organizations. Conducts conversational security assessments and generates custom, plain-English cybersecurity policies.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript, React 19)
- **Styling**: Tailwind CSS 4 + shadcn/ui (Radix primitives)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Auth**: Supabase Auth with SSR support
- **AI**: Vercel AI SDK with multi-provider support (OpenAI, Anthropic)

## Project Structure

```
app/
├── (auth)/              # Auth pages (login, signup, callback)
├── (dashboard)/         # Protected routes
│   ├── interview/       # Chat-based security assessment
│   ├── policies/        # Generated policy viewer
│   ├── compliance/      # Action item tracker
│   └── settings/        # User preferences
└── api/
    ├── chat/            # AI chat streaming endpoint
    └── policies/        # Policy generation & export

components/
├── ui/                  # shadcn/ui components
├── chat/                # Chat interface components
├── dashboard/           # Dashboard layout components
└── policy/              # Policy viewer components

lib/
├── supabase/            # Client, server, and middleware helpers
├── ai/                  # Prompts and policy generator
└── utils.ts             # cn() helper for Tailwind

types/
└── database.ts          # Supabase Database types and helpers
```

## Database Schema

Five main tables with RLS enabled:
- `organizations` - User organizations (linked to auth.users)
- `interviews` - Assessment sessions with extracted_data JSONB
- `messages` - Chat history for each interview
- `policies` - Generated markdown policies with PDF storage
- `compliance_items` - Prioritized action items with status tracking

Key enums: `organization_type`, `interview_status`, `compliance_status`, `compliance_category`

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - At least one AI provider

Optional:
- `NEXT_PUBLIC_APP_URL` - App URL (defaults to localhost:3000)

## Key Patterns

### Supabase Client Usage
- Server components: `import { createClient } from "@/lib/supabase/server"`
- Client components: `import { createClient } from "@/lib/supabase/client"`
- Middleware handles session refresh via `lib/supabase/middleware.ts`

### AI Chat Integration
- Uses Vercel AI SDK (`ai` package) with `@ai-sdk/anthropic` and `@ai-sdk/openai`
- Streaming responses via `app/api/chat/route.ts`
- React hooks from `@ai-sdk/react` for chat UI

### Styling
- Use `cn()` from `lib/utils.ts` for conditional Tailwind classes
- shadcn/ui components in `components/ui/`
- Tailwind 4 with `tw-animate-css` for animations

## Database Migrations

Run migrations via Supabase SQL Editor:
```
supabase/migrations/00001_initial_schema.sql
```

## Important Notes

- All database tables have Row Level Security - queries are scoped to authenticated user
- Interview data is extracted into `extracted_data` JSONB column for policy generation
- Policies can be exported as PDF (stored in Supabase Storage `policies` bucket)
- Compliance items have categories: immediate, short_term, long_term, ongoing
