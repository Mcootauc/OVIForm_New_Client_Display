import { createSupabaseServerClient } from '@/utils/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

// Handles the Google OAuth login handshake
export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    
    // 1. Extract the 'code' from the URL. 
    // When Google successfully authenticates the user, it redirects them back to this URL
    // with a special, one-time-use authorization string in the URL parameters.
    // Example: https://yourapp.com/auth/callback?code=4/0AX4Xf...
    const code = requestUrl.searchParams.get('code');

    if (code) {
        // 2. Exchange the one-time code for a secure session.
        // We take that 'code' string and securely send it from our server directly to Supabase.
        // Supabase verifies the code with Google, and if it's valid, Supabase generates the 
        // actual JWT (JSON Web Token) and secure session cookies.
        // Doing this on the server (SSR) keeps the exchange secure and immediately sets the 
        // cookies the user needs to access the site.
        const supabase = await createSupabaseServerClient();
        await supabase.auth.exchangeCodeForSession(code);
    }

    // Get the site URL from environment variable or use request origin as fallback
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(siteUrl);
}
