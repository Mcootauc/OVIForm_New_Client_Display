import { createSupabaseMiddlewareClient } from '@/utils/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

const publicRoutes = new Set([
    '/login',
    '/unauthorized',
    '/privacy-policy',
    '/terms',
]);

function isPublicRoute(pathname: string) {
    return pathname.startsWith('/auth/') || publicRoutes.has(pathname);
}

function redirectWithCookies(
    request: NextRequest,
    response: NextResponse,
    pathname: string
) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname;
    redirectUrl.search = '';

    const redirectResponse = NextResponse.redirect(redirectUrl);

    response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
}

export async function middleware(request: NextRequest) {
    // Middleware is the first auth checkpoint.
    // It keeps signed-out users away from protected pages before the UI loads.
    const { supabase, getResponse } = createSupabaseMiddlewareClient(request);
    const pathname = request.nextUrl.pathname;

    if (/\.[^/]+$/.test(pathname)) {
        return NextResponse.next();
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();
    const response = getResponse();

    if (!user && !isPublicRoute(pathname)) {
        return redirectWithCookies(request, response, '/login');
    }

    if (user && pathname === '/login') {
        return redirectWithCookies(request, response, '/');
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
