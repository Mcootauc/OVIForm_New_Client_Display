import { createBrowserClient } from '@supabase/ssr';

export type ProfileRole = 'Admin' | 'Doctor' | 'Vet Tech';

export type Profile = {
    id: string;
    hospital_id: number;
    email: string;
    role: ProfileRole;
    is_active: boolean;
    created_at: string;
};

function getSupabaseBrowserConfig() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
        );
    }

    return { supabaseUrl, supabaseAnonKey };
}

const { supabaseUrl, supabaseAnonKey } = getSupabaseBrowserConfig();

// Use the browser client in client components and browser-only helpers.
// The SSR package stores auth state in cookies so middleware and callbacks
// can participate in the same login flow as the client.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
