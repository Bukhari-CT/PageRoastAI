---
trigger: always_on
---

# Code Style Guide

## Principles
- **KISS** — simplest solution that works
- **DRY** — abstract only after the second repetition, not before
- **YAGNI** — don't build for hypothetical future requirements

## Components
- Default to **Server Components** — no `"use client"` unless the component needs
  browser APIs, event listeners, or React hooks (useState, useEffect, etc.)
- Add `import 'server-only'` to any file that reads private env vars or calls
  the Supabase admin client
- **Never** pass sensitive data (API keys, service role tokens) into Client Components
- Max 200 lines per component — extract sub-components or custom hooks if exceeded
- One component per file

## Naming
| Type | Convention | Example |
|---|---|---|
| Components & interfaces | PascalCase | `ChatWindow`, `UserProfile` |
| Hooks | camelCase with `use` prefix | `useConversation` |
| Utilities | camelCase | `formatTokenCount` |
| Server actions | camelCase with `action` suffix | `sendMessageAction` |
| Route handlers | lowercase | `route.ts` |
| Env variables | SCREAMING_SNAKE_CASE | `OPENAI_API_KEY` |

## Imports
- Always use absolute aliases: `@/features/llm-chat/...`, `@/shared/ui/Button`
- Group imports: (1) React/Next, (2) third-party, (3) internal `@/` — separated by blank lines
- Never use relative `../../` imports that cross FSD layer boundaries

## TypeScript
- `strict: true` in `tsconfig.json` — no exceptions
- No `any` — use `unknown` and narrow, or define a proper interface
- Prefer `interface` over `type` for object shapes; use `type` for unions/primitives
- Zod schemas for all external data (API responses, form inputs, env vars)

## Server actions & data fetching
- Mutations → Server Actions (not route handlers unless called by external services)
- Route handlers → only for webhooks, OAuth callbacks, third-party integrations
- Validate all Server Action inputs with Zod before touching the database
- Never use `revalidatePath` broadly — prefer `revalidateTag` for surgical cache invalidation

## Env key discipline (repeat from agents.md — enforced here too)
- `NEXT_PUBLIC_` prefix → browser bundle, no secrets ever
- Non-prefixed → server-only Node.js environment
- Validate all required env vars at startup with a Zod schema in `shared/config/env.ts`

## Error handling
- All Server Actions return `{ data, error }` — never throw to the client
- Client components display user-facing error messages, never raw error objects
- Log errors server-side with structured logging (never `console.log` in production)

## Testing
- Unit tests for `shared/lib` utilities and Zod schemas
- Integration tests for Server Actions and route handlers
- Filename convention: `*.test.ts` co-located next to the file under test