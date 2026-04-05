# Antigravity — Best Practices

## Environment variable security

❌ Before (incorrect):
```ts
// Exposes secret key to the browser bundle
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY! // NEVER
)
```

✅ After (correct):
```ts
// server-only file — service role stays on the server
import 'server-only'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // no NEXT_PUBLIC_ prefix
)
```

Rule: `NEXT_PUBLIC_` prefix is only allowed for `SUPABASE_URL`, `SUPABASE_ANON_KEY`, 
and `APP_URL`. All LLM keys, service role keys, and payment secrets are server-only.

---

## Supabase client selection

❌ Before (incorrect):
```ts
// Using browser client in a Server Component
import { createBrowserClient } from '@supabase/ssr'
export default async function Page() {
  const supabase = createBrowserClient(...)
}
```

✅ After (correct):
```ts
// Server Component → server client
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
}
```

---

## Server Actions must return { data, error }

❌ Before (incorrect):
```ts
export async function createWorkspace(input: unknown) {
  const workspace = await db.insert(input) // throws on failure
  return workspace
}
```

✅ After (correct):
```ts
'use server'
import { z } from 'zod'

const schema = z.object({ name: z.string().min(1) })

export async function createWorkspace(input: unknown) {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { data: null, error: parsed.error.message }

  try {
    const data = await db.insert(parsed.data)
    return { data, error: null }
  } catch (e) {
    return { data: null, error: 'Failed to create workspace' }
  }
}
```

---

## "use client" must be justified

❌ Before (incorrect):
```tsx
'use client' // added "just in case"
export default function UserCard({ name }: { name: string }) {
  return {name} // no hooks, no browser APIs — should be Server Component
}
```

✅ After (correct):
```tsx
// No "use client" — this is a Server Component by default
export default function UserCard({ name }: { name: string }) {
  return {name}
}
```

Only add `"use client"` when the component uses: `useState`, `useEffect`, 
`useRef`, browser APIs (`window`, `document`), or event handlers that 
need client-side reactivity.

---

## FSD cross-layer imports

❌ Before (incorrect):
```ts
// Inside features/billing/ — importing from another feature
import { useConversation } from '@/features/llm-chat/hooks/useConversation'
```

✅ After (correct):
```ts
// Lift shared logic to entities/ or shared/
import { useConversation } from '@/entities/conversation/hooks/useConversation'
```

Import hierarchy (one direction only):
`app` → `features` → `entities` → `shared`
No feature may import from another feature.

---

## Zod validation on all external data

❌ Before (incorrect):
```ts
export async function POST(req: Request) {
  const body = await req.json() // unvalidated — unsafe
  await db.insert(body)
}
```

✅ After (correct):
```ts
import { z } from 'zod'
const schema = z.object({ message: z.string().max(4000) })

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return Response.json({ error: 'Invalid input' }, { status: 400 })
  await db.insert(parsed.data)
}
```

All route handlers, Server Actions, and edge functions must validate 
inputs with Zod before any database or LLM API call.