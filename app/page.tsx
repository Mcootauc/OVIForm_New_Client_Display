import ClientGrid from '@/components/client-grid';
import { ThemeProvider } from '@/components/theme-provider';
import ProtectedRoute from '@/components/protected-route';
import Header from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Heart } from 'lucide-react';

export default function Home() {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
        >
            <ProtectedRoute>
                <div className="min-h-screen bg-[#FEFEFE] flex flex-col">
                    <Header />
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
                                        <Heart className="h-4 w-4" />
                                        Pet Gallery
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="clients">
                                    <h2 className="text-2xl font-semibold text-[#03045E] mb-8">
                                        Client Information Dashboard
                                    </h2>
                                    <ClientGrid />
                                </TabsContent>

                                <TabsContent value="pets">
                                    <h2 className="text-2xl font-semibold text-[#03045E] mb-8">
                                        Pet Gallery
                                    </h2>
                                    <div className="text-center p-8 bg-[#737373]/5 rounded-lg">
                                        <p className="text-[#737373]">
                                            No pet records found.
                                        </p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </main>
                </div>
            </ProtectedRoute>
        </ThemeProvider>
    );
}
