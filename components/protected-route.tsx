'use client';

import type React from 'react';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, isAuthorized } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        } else if (!isLoading && user && !isAuthorized) {
            router.push('/unauthorized');
        }
    }, [isLoading, user, isAuthorized, router]);

    // Proxy blocks signed-out users on the server.
    // This client guard handles the final redirect after profile-based
    // authorization finishes loading in the browser.
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user || !isAuthorized) {
        return null;
    }

    return <>{children}</>;
}
