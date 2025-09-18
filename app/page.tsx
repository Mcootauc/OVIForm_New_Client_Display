'use client';

import { useEffect, useState } from 'react';

import ClientGrid from '@/components/client-grid';
import PetGrid from '@/components/pet-grid';
import { ThemeProvider } from '@/components/theme-provider';
import ProtectedRoute from '@/components/protected-route';
import Header from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, PawPrint } from 'lucide-react';
import { getHospital } from '@/lib/edgeFunctions';

export default function Home() {
    const [hospital, setHospital] = useState<Hospital | null>(null);

    type Hospital = {
        id: string;
        name: string;
        slug: string;
    };

    useEffect(() => {
        getHospital().then((hospital) => {
            try {
                setHospital(hospital);
                console.log(hospital);
            } catch (error) {
                console.error(error);
            }
        });
    }, []);

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
        >
            <ProtectedRoute>
                <div className="min-h-screen bg-[#FEFEFE] flex flex-col">
                    <Header title={hospital?.name || 'Loading...'} />
                    <main className="flex-1">
                        <div className="container mx-auto py-8 px-4">
                            <Tabs defaultValue="clients" className="w-full">
                                <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-[#737373]/5">
                                    <TabsTrigger
                                        value="clients"
                                        className="flex items-center gap-2 data-[state=active]:bg-[#56A0AE] data-[state=active]:text-white hover:text-[#56A0AE] data-[state=active]:hover:text-white"
                                    >
                                        <Users className="h-4 w-4" />
                                        Client Information
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="pets"
                                        className="flex items-center gap-2 data-[state=active]:bg-[#56A0AE] data-[state=active]:text-white hover:text-[#56A0AE] data-[state=active]:hover:text-white"
                                    >
                                        <PawPrint className="h-4 w-4" />
                                        Pet Gallery
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="clients">
                                    <ClientGrid />
                                </TabsContent>

                                <TabsContent value="pets">
                                    <PetGrid />
                                </TabsContent>
                            </Tabs>
                        </div>
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
