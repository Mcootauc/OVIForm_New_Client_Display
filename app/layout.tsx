import type React from 'react';
import type { Metadata } from 'next';
import { Public_Sans, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from '@/components/ui/toaster';

const publicSans = Public_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-public-sans',
});

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['500', '600', '700', '800'],
    variable: '--font-jakarta',
});

export const metadata: Metadata = {
    title: 'Pet Client Manager',
    description: 'Manage pet client information',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${publicSans.variable} ${plusJakartaSans.variable} font-sans`}
            >
                <AuthProvider>
                    {children}
                    <Toaster />
                </AuthProvider>
            </body>
        </html>
    );
}
