'use client';

import { useEffect, useState } from 'react';
import { supabase, type Submission } from '@/utils/supabase';
import PetCard from '@/components/pet-card';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export default function PetGrid() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        fetchSubmissions();
    }, []);

    async function fetchSubmissions() {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('pets_v2')
                .select('*, clients_v2 ( * )')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            setSubmissions((data as unknown as Submission[]) || []);
        } catch (error) {
            console.error('Error fetching pets:', error);
            setError('Failed to load pets. Please try again later.');
        } finally {
            setLoading(false);
        }
    }

    async function refreshSubmissions() {
        try {
            setRefreshing(true);

            const { data, error } = await supabase
                .from('pets_v2')
                .select('*, clients_v2 ( * )')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            // Check if there are any new clients
            const newPetCount = data ? data.length - submissions.length : 0;

            setSubmissions((data as unknown as Submission[]) || []);

            // Show appropriate toast message
            if (newPetCount > 0) {
                toast({
                    title: 'New pets found!',
                    description: `${newPetCount} new pet${
                        newPetCount === 1 ? '' : 's'
                    } added.`,
                });
            } else {
                toast({
                    title: 'Refresh complete',
                    description: 'No new pets found.',
                });
            }
        } catch (error) {
            console.error('Error refreshing pets:', error);
            toast({
                title: 'Error',
                description: 'Failed to refresh pets. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setRefreshing(false);
        }
    }

    async function deletePet(id: string) {
        try {
            const { error } = await supabase.from('pets_v2').delete().eq('id', id);

            if (error) {
                throw error;
            }

            // Update the local state to remove the deleted client
            setSubmissions(submissions.filter((submission) => submission.id !== id));

            toast({
                title: 'Pet deleted',
                description: 'The pet has been successfully removed.',
            });
        } catch (error) {
            console.error('Error deleting pet:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete pet. Please try again.',
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
                    {submissions.length} Pet{submissions.length !== 1 ? 's' : ''}
                </h2>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-[#56A0AE] text-[#56A0AE] hover:bg-[#56A0AE] hover:text-white"
                    onClick={refreshSubmissions}
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
            ) : submissions.length === 0 ? (
                <div className="text-center p-8 bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">No pets found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {submissions.map((submission) => (
                        <PetCard
                            key={submission.id}
                            pet={submission}
                            client={submission.clients_v2}
                            onDelete={deletePet}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
