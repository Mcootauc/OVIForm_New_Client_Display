'use client';

import { useAuth } from '@/context/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import ProtectedRoute from '@/components/protected-route';
import Header from '@/components/header';
import AdminUserForm from '@/components/admin-user-form';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function AdminPage() {
    const { profile } = useAuth();

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
        >
            <ProtectedRoute>
                <div className="min-h-screen bg-[#FEFEFE] flex flex-col">
                    <Header title="Admin" />
                    <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center">
                        {profile?.role !== 'Admin' ? (
                            <div className="flex-1 flex items-center justify-center w-full">
                                <Card className="w-full max-w-md border-[#56A0AE]">
                                    <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
                                        <ShieldAlert className="h-12 w-12 text-[#56A0AE]" />
                                        <h2 className="text-xl font-bold text-[#03045E]">
                                            Only admins allowed on this page
                                        </h2>
                                        <p className="text-sm text-[#737373]">
                                            You do not have the required permissions to view this content.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <AdminUserForm />
                        )}
                    </main>
                    <footer className="py-6">
                        <p className="text-center text-sm text-[#737373]">
                            &copy; OVIForm. All rights reserved.
                        </p>
                    </footer>
                </div>
            </ProtectedRoute>
        </ThemeProvider>
    );
}