@AGENTS.md

# XGRC Studio

## What this is
A Next.js web app for creating, editing, and publishing LinkedIn posts for XGRC Software.
Runs locally at localhost:3000. Deployed to Railway. Single-user. No authentication required.

## Tech stack
Next.js 16 (App Router) · TypeScript · Tailwind CSS · Prisma + PostgreSQL · Anthropic SDK · OpenAI SDK

## Key files
- src/lib/ai-writer.ts — Claude integration, writer profile, SSE streaming
- src/lib/brand-config.ts — logo selection, hashtag mapping, image prompt builder
- src/lib/image-generator.ts — OpenAI image generation
- src/lib/linkedin.ts — LinkedIn OAuth + post publishing
- src/lib/scheduler.ts — node-cron for scheduled publishing
- prisma/schema.prisma — database schema

## Critical rules
1. One LLM call per post generation — do not add separate calls for logo, hashtags, or image prompt
2. All brand config (logos, colours, guidelines) is stored in Settings.brandData (JSON in PostgreSQL)
3. Logo file paths are stored in Settings.brandData — always read from there, never hardcode
4. Image prompt is assembled deterministically in brand-config.ts using the LLM's visual concept output
5. Streaming uses Server-Sent Events (SSE) — stream only post body text, parse metadata after stream ends
6. LinkedIn credentials (tokens, org ID) are stored in the Settings table, not in .env

## Database
PostgreSQL via Prisma. Hosted on Railway. Run `npx prisma studio` to browse data.
Run `npx prisma migrate dev` after schema changes (requires DATABASE_URL in .env pointing to Postgres).
DATABASE_URL comes from Railway — copy from Railway → Postgres service → Variables tab.

## Adding a new logo
Go to Settings → Brand & Logos → find the logo card → upload variant files.
No code changes needed.

## LinkedIn publishing status
Currently using Copy + Open LinkedIn workflow (manual paste).
Direct API publishing is implemented but requires LinkedIn Marketing Developer Platform approval.
Once approved: POST /api/publish handles both personal and company page publishing.
