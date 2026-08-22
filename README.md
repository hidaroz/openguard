# OpenGuard

AI-Powered Fractional CISO for Non-Profits and Community Organizations.

OpenGuard interviews your organization through a friendly conversation and generates a custom, plain-English cybersecurity and privacy policy that you can actually use.

## Features

- **Conversational Assessment**: No confusing forms—answer simple questions in plain English
- **Custom Policy Generation**: Get a comprehensive, board-ready security policy tailored to your needs
- **Compliance Tracking**: Prioritized action items with status tracking
- **PDF Export**: Download your policy as a professional document
- **Multi-Provider AI**: Supports OpenAI and Anthropic models

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: Vercel AI SDK (multi-provider support)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI or Anthropic API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hidaroz/openguard.git
   cd openguard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`: Your AI provider API key

4. Set up the database:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the migration in `supabase/migrations/00001_initial_schema.sql`

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
openguard/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── chat/             # Chat interface components
│   ├── dashboard/        # Dashboard components
│   └── policy/           # Policy viewer components
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase client configuration
│   └── ai/               # AI prompts and generators
├── types/                 # TypeScript type definitions
└── supabase/             # Database migrations
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `OPENAI_API_KEY` | OpenAI API key (optional if using Anthropic) |
| `ANTHROPIC_API_KEY` | Anthropic API key (optional if using OpenAI) |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Docker
- AWS Amplify
- Netlify
- Railway

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

## License

MIT License - see LICENSE file for details.

## Support

For questions or support, please open an issue on GitHub.
