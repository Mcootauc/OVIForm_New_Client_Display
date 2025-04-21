'use client';

import type React from 'react';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

type AuthContextType = {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    isAuthorized: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Only allow mcootauc@gmail.com to access the dashboard
    const isAuthorized =
        user?.email === 'mcootauc@gmail.com' ||
        user?.email === 'mccdvm1@gmail.com';

    useEffect(() => {
        const setData = async () => {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();
            if (error) {
                console.error(error);
                setIsLoading(false);
                return;
            }

            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        };

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        setData();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signInWithGoogle = async () => {
        try {
            // Get the production URL or fallback to window.location.origin for local development
            const siteUrl =
                process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
            const redirectUrl = `${siteUrl}/auth/callback`;

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error signing in with Google:', error);
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const value = {
        user,
        session,
        isLoading,
        signInWithGoogle,
        signOut,
        isAuthorized,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
