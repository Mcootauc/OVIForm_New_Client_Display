# Supabase Authentication & Environment Setup

OVIForm uses two Supabase projects to isolate production data from staging/preview testing.

- **Production:** `uqdolredkukdkoolnubw`
- **Staging:** `acmgofotwucibmtwaeob`

## Local Development

For local development, we point the app to the **Staging** project to avoid accidentally mutating production data.

Your local `.env` file should contain:

```text
NEXT_PUBLIC_SUPABASE_URL=https://acmgofotwucibmtwaeob.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<staging anon key>
```

*(Note: `NEXT_PUBLIC_SITE_URL` is no longer required. The app infers the callback URL from the runtime origin.)*

## Vercel Environment Variables

In the Vercel Dashboard → Settings → Environment Variables, variables must be scoped correctly:

1. **Production scope:**
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://uqdolredkukdkoolnubw.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<prod anon key>`

2. **Preview scope:**
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://acmgofotwucibmtwaeob.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<staging anon key>`

Ensure there are **no** "All Environments" entries for these variables, as they can override the specific environment scopes.

## Google OAuth Configuration

Both production and staging must be registered in Google Cloud Console.

Authorized redirect URIs in Google Cloud Console:
- Prod: `https://uqdolredkukdkoolnubw.supabase.co/auth/v1/callback`
- Staging: `https://acmgofotwucibmtwaeob.supabase.co/auth/v1/callback`

## Edge Functions

Edge Functions (like `get-hospital`) must be deployed to both projects. They automatically read their environment's `SUPABASE_URL` and `SUPABASE_ANON_KEY` from `Deno.env`, so the same code works in both places.

CORS origins are allowed dynamically based on regexes matching Vercel preview domains. If a new custom domain is added, update `ALLOWED_ORIGIN_REGEXES` in the Edge Function, or set the `ALLOWED_ORIGINS` secret in the Supabase dashboard for that project.
