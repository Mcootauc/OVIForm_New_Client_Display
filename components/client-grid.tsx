'use client';

import { useEffect, useState } from 'react';
import { supabase, type Client } from '@/utils/supabase';
import ClientCard from './client-card';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export default function ClientGrid() {
    const [clients, setClients] = useState<Client[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        fetchClients();
    }, []);

    async function fetchClients() {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('hospital_id', 1)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            setClients(data || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
            setError('Failed to load clients. Please try again later.');
        } finally {
            setLoading(false);
        }
    }

    async function refreshClients() {
        try {
            setRefreshing(true);

            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('hospital_id', 1)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            // Check if there are any new clients
            const newClientCount = data ? data.length - clients.length : 0;

            setClients(data || []);

            // Show appropriate toast message
            if (newClientCount > 0) {
                toast({
                    title: 'New clients found!',
                    description: `${newClientCount} new client${
                        newClientCount === 1 ? '' : 's'
                    } added.`,
                });
            } else {
                toast({
                    title: 'Refresh complete',
                    description: 'No new clients found.',
                });
            }
        } catch (error) {
            console.error('Error refreshing clients:', error);
            toast({
                title: 'Error',
                description: 'Failed to refresh clients. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setRefreshing(false);
        }
    }

    async function deleteClient(id: number) {
        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

            // Update the local state to remove the deleted client
            setClients(clients.filter((client) => client.id !== id));

            toast({
                title: 'Client deleted',
                description: 'The client has been successfully removed.',
            });
        } catch (error) {
            console.error('Error deleting client:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete client. Please try again.',
                variant: 'destructive',
            });
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-[#03045E]">
                    {clients.length} Client{clients.length !== 1 ? 's' : ''}
                </h2>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-[#56A0AE] text-[#56A0AE] hover:bg-[#56A0AE] hover:text-white"
                    onClick={refreshClients}
                    disabled={refreshing}
                >
                    {refreshing ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />{' '}
                            Refreshing...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                        </>
                    )}
                </Button>
            </div>

            {error ? (
                <div className="text-center text-red-500 p-4 bg-red-100/10 rounded-lg">
                    <p>{error}</p>
                </div>
            ) : clients.length === 0 ? (
                <div className="text-center p-8 bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">No clients found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.map((client) => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            onDelete={deleteClient}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
