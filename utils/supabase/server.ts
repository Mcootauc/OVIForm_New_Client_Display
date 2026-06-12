import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

type CookieToSet = {
    name: string;
    value: string;
    options: CookieOptions;
};

function getSupabaseServerConfig() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
        );
    }

    return { supabaseUrl, supabaseAnonKey };
}

function buildCookieAdapter(
    cookieStore: Awaited<ReturnType<typeof cookies>>
) {
    return {
        getAll() {
            return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
            try {
                cookiesToSet.forEach(({ name, value, options }) => {
                    cookieStore.set(name, value, options);
                });
            } catch {
                // Server components can read cookies but cannot always persist them.
                // Middleware is responsible for refreshing auth cookies when needed.
            }
        },
    };
}

// Use this in route handlers or server components when you need a Supabase
// client that reads the current request cookies.
export async function createSupabaseServerClient() {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseServerConfig();
    const cookieStore = await cookies();

    return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
        cookies: buildCookieAdapter(cookieStore),
    });
}

// Middleware needs slightly different cookie handling because refreshed auth
// cookies must be written back onto the outgoing response.
export function createSupabaseMiddlewareClient(request: NextRequest) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseServerConfig();
    let response = NextResponse.next({
        request,
    });

    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet: CookieToSet[]) {
                cookiesToSet.forEach(({ name, value }) => {
                    request.cookies.set(name, value);
                });

                response = NextResponse.next({
                    request,
                });

                cookiesToSet.forEach(({ name, value, options }) => {
                    response.cookies.set(name, value, options);
                });
            },
        },
    });

    return {
        supabase,
        getResponse: () => response,
    };
}
