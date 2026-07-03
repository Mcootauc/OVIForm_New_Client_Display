'use client';

import { useEffect, useState } from 'react';

import ClientGrid from '@/components/client-grid';
import PetGrid from '@/components/pet-grid';
import { ThemeProvider } from '@/components/theme-provider';
import ProtectedRoute from '@/components/protected-route';
import Header from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Clock } from 'lucide-react';

import { getHospital } from '@/lib/edgeFunctions';

export default function Home() {
    const [hospital, setHospital] = useState<Hospital | null>(null);

    type Hospital = {
        id: string;
        name: string;
        slug: string | null;
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
                    <Tabs defaultValue="clients" className="flex flex-1 flex-col">
                        <div className="border-b border-[#737373]/20 bg-white">
                            <div className="container mx-auto px-4">
                                <TabsList className="h-auto justify-start gap-8 rounded-none bg-transparent p-0">
                                    <TabsTrigger
                                        value="clients"
                                        className="gap-2 rounded-none border-b-2 border-transparent bg-transparent px-1 py-4 text-sm font-medium text-[#8a93ab] shadow-none data-[state=active]:border-[#56A0AE] data-[state=active]:bg-transparent data-[state=active]:text-[#56A0AE] data-[state=active]:shadow-none"
                                    >
                                        <Users className="h-4 w-4" />
                                        Client Information
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="waitlist"
                                        className="group gap-2 rounded-none border-b-2 border-transparent bg-transparent px-1 py-4 text-sm font-medium text-[#8a93ab] shadow-none data-[state=active]:border-[#56A0AE] data-[state=active]:bg-transparent data-[state=active]:text-[#56A0AE] data-[state=active]:shadow-none"
                                    >
                                        <Clock className="h-4 w-4" />
                                        Waitlist
                                        <span className="ml-1 text-xs text-[#737373] group-data-[state=active]:text-[#56A0AE]">5</span>
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>
                        <main className="flex-1">
                            <div className="container mx-auto px-4 py-8">
                                <TabsContent value="clients">
                                    <ClientGrid />
                                </TabsContent>
                                <TabsContent value="waitlist">

                                </TabsContent>
                            </div>
                        </main>
                    </Tabs>
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
