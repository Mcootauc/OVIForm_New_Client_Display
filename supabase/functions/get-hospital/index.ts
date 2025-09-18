// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const allowedOrigins = [
  'http://localhost:3000',
  'https://v0-next-js-client-app-delta.vercel.app',
]

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin') || ''
  const isAllowedOrigin = allowedOrigins.includes(origin)
  const corsHeaders: Record<string, string> = {
    ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    if (isAllowedOrigin) {
      return new Response('ok', { headers: corsHeaders })
    }
    return new Response('Forbidden', { status: 403 })
  }

  try {
    // Client for resolving current user from Authorization token
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: req.headers.get('Authorization') || '',
          },
        },
      },
    )

    const { data: userResult, error: userError } = await supabaseAuth.auth.getUser()
    if (userError || !userResult?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message || 'No user found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 },
      )
    }

    const userId = userResult.user.id
    const userEmail = userResult.user.email || ''

    // Admin client for DB reads (bypass RLS safely inside the function)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // 1) Try by user_id
    let selectedLink: { hospital_id: number } | null = null

    const { data: linkById, error: linkByIdError } = await supabaseAdmin
      .from('user_hospitals')
      .select('hospital_id, is_active, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (linkById && linkById.hospital_id) {
      selectedLink = { hospital_id: linkById.hospital_id }
    }

    // 2) If not found by user_id, try by email
    if (!selectedLink) {
      const { data: linkByEmail, error: linkByEmailError } = await supabaseAdmin
        .from('user_hospitals')
        .select('hospital_id, is_active, created_at')
        .eq('email', userEmail)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (linkByEmail && linkByEmail.hospital_id) {
        selectedLink = { hospital_id: linkByEmail.hospital_id }
      } else if (linkByEmailError && !linkByIdError) {
        // Surface an email-specific error only if there wasn't an id error already
        return new Response(
          JSON.stringify({ error: 'Failed to fetch user hospital link', details: linkByEmailError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
        )
      }
    }

    if (!selectedLink?.hospital_id) {
      return new Response(
        JSON.stringify({ error: 'No active hospital associated to user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 },
      )
    }

    // Fetch the hospital details
    const { data: hospital, error: hospitalError } = await supabaseAdmin
      .from('hospitals')
      .select('id, name, slug')
      .eq('id', selectedLink.hospital_id)
      .single()

    if (hospitalError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch hospital', details: hospitalError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
      )
    }

    return new Response(
      JSON.stringify({ hospital }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (error) {
    const message = (error as Error)?.message ?? 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-hospital' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
