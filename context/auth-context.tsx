'use client';

import type React from 'react';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { supabase, type Profile } from '@/utils/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

type AuthContextType = {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    isLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    isAuthorized: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Authorization is driven by the profiles table.
    // If a signed-in user has an active profile row, they can use the app.
    const isAuthorized = profile !== null;

    const loadProfile = useCallback(async (nextSession: Session | null) => {
        const email = nextSession?.user.email;

        if (!email) {
            setProfile(null);
            return;
        }

        // The profiles table is the source of truth for app access.
        // A missing or inactive row means the user can sign in but should not
        // be allowed into the dashboard.
        const { data, error } = await supabase
            .from('profiles')
            .select('id, hospital_id, email, role, is_active, created_at')
            .eq('email', email)
            .eq('is_active', true)
            .maybeSingle();

        if (error) {
            console.error('Error loading profile:', error);
            setProfile(null);
            return;
        }

        setProfile(data);
    }, []);

    const syncAuthState = useCallback(
        async (nextSession: Session | null) => {
            setSession(nextSession);
            setUser(nextSession?.user ?? null);
            await loadProfile(nextSession);
            setIsLoading(false);
        },
        [loadProfile]
    );

    useEffect(() => {
        const setData = async () => {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();
            if (error) {
                console.error(error);
                setProfile(null);
                setIsLoading(false);
                return;
            }

            await syncAuthState(session);
        };

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            void syncAuthState(nextSession);
        });

        void setData();

        return () => {
            subscription.unsubscribe();
        };
    }, [syncAuthState]);

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
        profile,
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
