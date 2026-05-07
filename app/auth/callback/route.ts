import { createSupabaseServerClient } from '@/utils/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        // Supabase sends users back here after Google OAuth completes.
        // Exchanging the code stores the login session in cookies for SSR.
        const supabase = await createSupabaseServerClient();
        await supabase.auth.exchangeCodeForSession(code);
    }

    // Get the site URL from environment variable or use request origin as fallback
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(siteUrl);
}
