'use client';

import { useEffect, useState } from 'react';
import { supabase, type Submission } from '@/utils/supabase';
import ClientCard from './client-card';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 10;

export default function ClientGrid() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchPage(0, false);
    }, []);

    async function fetchPage(pageIndex: number, append: boolean) {
        try {
            if (!append) setLoading(true);
            setError(null);

            const from = pageIndex * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const { data, error } = await supabase
                .from('pets')
                .select('*, clients ( * )')
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) {
                throw error;
            }

            const rows = (data as unknown as Submission[]) || [];
            setHasMore(rows.length === PAGE_SIZE);
            setSubmissions((prev) => (append ? [...prev, ...rows] : rows));
            return rows;
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setError('Failed to load submissions. Please try again later.');
            return [];
        } finally {
            if (!append) setLoading(false);
        }
    }

    async function refreshSubmissions() {
        try {
            setRefreshing(true);
            const oldFirstId = submissions[0]?.id;

            const rows = await fetchPage(0, false);
            setPage(0);

            // Calculate new submissions by finding where the old first item is in the new data
            let newSubmissionCount = 0;
            if (oldFirstId) {
                const oldIndex = rows.findIndex(r => r.id === oldFirstId);
                if (oldIndex === -1) {
                    newSubmissionCount = rows.length;
                } else {
                    newSubmissionCount = oldIndex;
                }
            } else {
                newSubmissionCount = rows.length;
            }

            // Show appropriate toast message
            if (newSubmissionCount > 0) {
                toast({
                    title: 'New submissions found!',
                    description: `${newSubmissionCount} new submission${newSubmissionCount === 1 ? '' : 's'
                        } added.`,
                });
            } else {
                toast({
                    title: 'Refresh complete',
                    description: 'No new submissions found.',
                });
            }
        } catch (error) {
            console.error('Error refreshing submissions:', error);
            toast({
                title: 'Error',
                description: 'Failed to refresh submissions. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setRefreshing(false);
        }
    }

    async function loadMore() {
        setLoadingMore(true);
        try {
            await fetchPage(page + 1, true);
            setPage(prev => prev + 1);
        } finally {
            setLoadingMore(false);
        }
    }

    async function deletePet(petId: string, clientId: string | null) {
        try {
            const { error: petError } = await supabase
                .from('pets')
                .delete()
                .eq('id', petId);

            if (petError) throw petError;

            if (clientId) {
                const { error: clientError } = await supabase
                    .from('clients')
                    .delete()
                    .eq('id', clientId);

                if (clientError) throw clientError;
            }

            setSubmissions((prev) =>
                prev.filter((s) => s.id !== petId && s.clients?.id !== clientId)
            );

            toast({
                title: 'Submission deleted',
                description: 'The client and pet have been successfully removed.',
            });
        } catch (error) {
            console.error('Error deleting submission:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete submission. Please try again.',
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

    const uniqueClientCount = new Set(
        submissions.map((s) => s.clients?.id).filter(Boolean)
    ).size;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-[#1b2240]">
                    {uniqueClientCount} Recent Submission{uniqueClientCount !== 1 ? 's' : ''}
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
                    <p className="text-muted-foreground">No submissions found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {submissions.map((submission) => (
                        <ClientCard
                            key={submission.id}
                            pet={submission}
                            client={submission.clients}
                            onDelete={deletePet}
                        />
                    ))}
                </div>
            )}

            {hasMore && submissions.length > 0 && (
                <div className="flex justify-center pt-2">
                    <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="border-[#56A0AE] text-[#56A0AE] hover:bg-[#56A0AE] hover:text-white"
                    >
                        {loadingMore ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />{' '}
                                Loading...
                            </>
                        ) : (
                            'Load more'
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}