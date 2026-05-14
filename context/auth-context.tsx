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

    /**
     * loadProfile fetches the user's role and authorization status from the database.
     * While 'Session' tells us IF the user is logged in via Google, 'Profile' tells us 
     * WHAT they are allowed to do in our specific application.
     */
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

        setProfile(data as Profile | null);
    }, []);

    /**
     * syncAuthState acts as the central coordinator for updating the React state.
     * It ensures that whenever the Supabase session changes, we immediately:
     * 1. Update the local session/user state.
     * 2. Re-fetch the profile to ensure their authorization matches their new session.
     * 3. Turn off the loading spinner once everything is ready.
     */
    const syncAuthState = useCallback(
        async (nextSession: Session | null) => {
            setSession(nextSession);
            setUser(nextSession?.user ?? null);
            await loadProfile(nextSession);
            setIsLoading(false);
        },
        [loadProfile]
    );

    /**
     * useEffect is the initialization engine. It runs exactly once when the 
     * app first loads in the user's browser.
     */
    useEffect(() => {
        // 1. Initial Load: Check if the user already has an active session
        // stored in their browser from a previous visit.
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

        // 2. Real-time Listener: Subscribe to any future changes in auth state.
        // For example, if the user opens a second tab and logs out there, 
        // this listener catches that event and updates this tab too.
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            void syncAuthState(nextSession);
        });

        void setData();

        // 3. Cleanup: When this component is destroyed, cancel the real-time 
        // listener to prevent memory leaks.
        return () => {
            subscription.unsubscribe();
        };
    }, [syncAuthState]);

    const signInWithGoogle = async () => {
        try {
            const redirectUrl = `${window.location.origin}/auth/callback`;

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
