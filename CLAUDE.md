# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js)
npm run build    # Production build
npm run lint     # ESLint
```

Supabase Edge Functions live in `supabase/functions/` and use Deno runtime.

## Architecture

This is a **Next.js 16 + Supabase** veterinary clinic dashboard (OVIForm). It displays client and pet information for hospital staff. Deployed on Vercel.

### Auth Flow (two layers)

1. **Middleware** (`middleware.ts`) — server-side gate. Checks `supabase.auth.getUser()` and redirects unauthenticated users to `/login`. Only blocks access; does not check authorization.
2. **Client-side AuthContext + ProtectedRoute** — after sign-in, `AuthProvider` queries the `profiles` table to determine if the user has an active profile row. Authorization (`isAuthorized`) is driven entirely by having an active profile. `ProtectedRoute` wraps pages and redirects unauthorized users to `/unauthorized`.

Authentication is Google OAuth only (`signInWithGoogle`). The callback at `/auth/callback` exchanges the OAuth code for a session.

### Supabase Client Setup

- **Browser client**: `utils/supabase/client.ts` — used in client components and `lib/edgeFunctions.ts`.
- **Server client**: `utils/supabase/server.ts` — provides `createSupabaseServerClient()` for route handlers and `createSupabaseMiddlewareClient()` for middleware. Both use `@supabase/ssr` cookie-based auth.
- **Legacy file**: `utils/supabase.ts` exists but the canonical clients are in `utils/supabase/`.

### Data Model

- `profiles` table: links users to hospitals. Columns: `id`, `hospital_id`, `email`, `role` (Admin | Doctor | Vet Tech), `is_active`, `created_at`.
- `hospitals` table: `id`, `name`, `slug`.
- The `get-hospital` edge function resolves the current user's hospital (tries profile lookup by user ID first, then by email).

### Key Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (production URL for OAuth redirect; falls back to `window.location.origin`)

### UI Stack

- Radix UI primitives (tabs, dialogs, dropdowns, toasts)
- Tailwind CSS with brand color `#56A0AE`
- `lucide-react` icons
- `next-themes` for dark/light mode (default: light)
- shadcn/ui components in `components/ui/`
