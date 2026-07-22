'use client';

import { useEffect, useState } from 'react';

import ClientGrid from '@/components/client-grid';
import { ThemeProvider } from '@/components/theme-provider';
import ProtectedRoute from '@/components/protected-route';
import Header from '@/components/header';
import Waitlist from '@/components/waitlist';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Clock } from 'lucide-react';

import { getHospital } from '@/lib/edgeFunctions';

export default function Dashboard() {
    const [hospital, setHospital] = useState<Hospital | null>(null);
    const [waitlistCount, setWaitlistCount] = useState(0);

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
                                        className="gap-2 rounded-none border-b-[3px] border-transparent bg-transparent px-1 py-4 text-[15px] font-bold text-[#79839c] shadow-none data-[state=active]:border-[#56A0AE] data-[state=active]:bg-transparent data-[state=active]:text-[#56A0AE] data-[state=active]:shadow-none"
                                    >
                                        <Users className="h-[17px] w-[17px]" />
                                        Client Info
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="waitlist"
                                        className="group gap-2 rounded-none border-b-[3px] border-transparent bg-transparent px-1 py-4 text-[15px] font-bold text-[#79839c] shadow-none data-[state=active]:border-[#56A0AE] data-[state=active]:bg-transparent data-[state=active]:text-[#56A0AE] data-[state=active]:shadow-none"
                                    >
                                        <Clock className="h-[17px] w-[17px]" />
                                        Waitlist
                                        <span className="ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#eef1f7] px-1.5 text-[11.5px] font-bold text-[#79839c] group-data-[state=active]:bg-[#56A0AE] group-data-[state=active]:text-white">
                                            {waitlistCount}
                                        </span>
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
                                    <Waitlist hospitalId={hospital?.id} onCountChange={setWaitlistCount} />
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
