// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const ALLOWED_ORIGIN_REGEXES = [
  /^http:\/\/localhost:3000$/,
  // any Vercel deployment of this project (prod + every preview)
  /^https:\/\/oviform(-[a-z0-9-]+)?(\.vercel\.app|\.com)$/,
  /^https:\/\/oviform-git-[a-z0-9-]+\.vercel\.app$/,
  /^https:\/\/oviform-[a-z0-9-]+-mcootauc-gmailcoms-projects\.vercel\.app$/,
]

function isOriginAllowed(origin: string, extra: string[]): boolean {
  if (ALLOWED_ORIGIN_REGEXES.some((r) => r.test(origin))) return true
  return extra.some((s) => s === origin)
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin') || ''
  const extra = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',').map((s) => s.trim()).filter(Boolean)
  const isAllowedOrigin = isOriginAllowed(origin, extra)
  const corsHeaders: Record<string, string> = {
    ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    // Admin client for DB reads/writes (bypass RLS safely inside the function)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // 1) Verify caller is an active Admin
    let isAdmin = false

    const { data: profileById, error: profileByIdError } = await supabaseAdmin
      .from('profiles')
      .select('role, is_active')
      .eq('id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (profileById && profileById.role === 'Admin') {
      isAdmin = true
    }

    if (!isAdmin) {
      const { data: profileByEmail } = await supabaseAdmin
        .from('profiles')
        .select('role, is_active')
        .eq('email', userEmail)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (profileByEmail && profileByEmail.role === 'Admin') {
        isAdmin = true
      }
    }

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Caller is not an active Admin' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 },
      )
    }

    // Parse JSON body
    const body = await req.json()
    const { action } = body

    if (action === 'context') {
      const { data: hospitals, error: hospitalsError } = await supabaseAdmin
        .from('hospitals')
        .select('id, name, slug')
        .order('name')

      if (hospitalsError) {
        throw new Error(`Failed to fetch hospitals: ${hospitalsError.message}`)
      }

      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, role, hospital_id, is_active')
        .order('email')

      if (profilesError) {
        throw new Error(`Failed to fetch profiles: ${profilesError.message}`)
      }

      return new Response(
        JSON.stringify({ hospitals, profiles }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      )
    }

    if (action === 'save') {
      const { email, role, is_active, hospital_id, new_hospital_name, mode } = body

      if (!email || !role || !mode) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: email, role, mode' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
        )
      }

      let finalHospitalId = hospital_id

      if (new_hospital_name) {
        // Create new hospital
        const slug = new_hospital_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        const { data: newHospital, error: newHospitalError } = await supabaseAdmin
          .from('hospitals')
          .insert({ name: new_hospital_name, slug })
          .select('id')
          .single()

        if (newHospitalError) {
          throw new Error(`Failed to create hospital: ${newHospitalError.message}`)
        }
        finalHospitalId = newHospital.id
      }

      if (mode === 'create') {
        let authUserId = null

        // Try creating auth user
        const { data: newAuthUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
        })

        if (createAuthError) {
          if (createAuthError.message.includes('already registered') || createAuthError.status === 422) {
            // Fallback: user exists, find their ID
            // listUsers doesn't support exact email match easily in the JS client without pagination,
            // but we can try to find them. Actually, supabaseAdmin.auth.admin.listUsers() can be used,
            // but simpler is to use `supabaseAdmin.from('auth.users').select('id').eq('email', email)`
            // Wait, we can't query auth.users directly via postgrest easily unless exposed.
            // Let's use listUsers.
            const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
            if (listError) throw new Error(`Failed to list users: ${listError.message}`)
            
            const existingUser = usersData.users.find(u => u.email === email)
            if (existingUser) {
              authUserId = existingUser.id
            } else {
              throw new Error('User already registered but could not be found.')
            }
          } else {
            throw new Error(`Failed to create auth user: ${createAuthError.message}`)
          }
        } else {
          authUserId = newAuthUser.user.id
        }

        // Insert profile
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: authUserId,
            email,
            role,
            hospital_id: finalHospitalId,
            is_active: is_active ?? true,
          })
          .select()
          .single()

        if (profileError) {
          throw new Error(`Failed to create profile: ${profileError.message}`)
        }

        return new Response(
          JSON.stringify({ profile }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
        )
      } else if (mode === 'update') {
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            role,
            hospital_id: finalHospitalId,
            is_active: is_active ?? true,
          })
          .eq('email', email)
          .select()
          .single()

        if (profileError) {
          throw new Error(`Failed to update profile: ${profileError.message}`)
        }

        return new Response(
          JSON.stringify({ profile }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
        )
      }

      return new Response(
        JSON.stringify({ error: 'Invalid mode' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )

  } catch (error) {
    const message = (error as Error)?.message ?? 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})
