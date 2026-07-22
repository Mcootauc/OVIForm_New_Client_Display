'use client';

import { useEffect, useState } from 'react';
import { supabase, type Submission } from '@/utils/supabase';
import ClientCard from './client-card';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 10;
const SEARCH_LIMIT = 10;

export default function ClientGrid() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [total, setTotal] = useState<number | null>(null);
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Submission[] | null>(
        null
    );
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        fetchPage(0, false);
        fetchTotal();
    }, []);

    // Debounced, server-side search across the whole DB.
    useEffect(() => {
        const q = query.trim();
        if (!q) {
            setSearchResults(null);
            setSearching(false);
            return;
        }

        let cancelled = false;
        setSearching(true);
        const handle = setTimeout(async () => {
            try {
                const like = `%${q}%`;
                // PostgREST can't OR across the base table and the embedded
                // clients table in one call, so run both and merge by pet id.
                const [byPet, byOwner] = await Promise.all([
                    supabase
                        .from('pets')
                        .select('*, clients ( * )')
                        .ilike('pet_name', like)
                        .order('created_at', { ascending: false })
                        .limit(SEARCH_LIMIT),
                    supabase
                        .from('pets')
                        .select('*, clients!inner ( * )')
                        .or(
                            `owner_name.ilike.${like},cell_phone.ilike.${like},email.ilike.${like}`,
                            { referencedTable: 'clients' }
                        )
                        .order('created_at', { ascending: false })
                        .limit(SEARCH_LIMIT),
                ]);

                if (byPet.error) throw byPet.error;
                if (byOwner.error) throw byOwner.error;
                if (cancelled) return;

                const merged = new Map<string, Submission>();
                for (const row of [
                    ...((byPet.data as unknown as Submission[]) || []),
                    ...((byOwner.data as unknown as Submission[]) || []),
                ]) {
                    merged.set(row.id, row);
                }
                const results = Array.from(merged.values())
                    .sort((a, b) =>
                        a.created_at < b.created_at ? 1 : -1
                    )
                    .slice(0, SEARCH_LIMIT);

                setError(null);
                setSearchResults(results);
            } catch (err) {
                console.error('Error searching submissions:', err);
                if (!cancelled) {
                    setError('Search failed. Please try again.');
                    setSearchResults([]);
                }
            } finally {
                if (!cancelled) setSearching(false);
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(handle);
        };
    }, [query]);

    async function fetchTotal() {
        const { count, error } = await supabase
            .from('pets')
            .select('*', { count: 'exact', head: true });
        if (!error && typeof count === 'number') {
            setTotal(count);
        }
    }

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
            fetchTotal();

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
            setSearchResults((prev) =>
                prev
                    ? prev.filter(
                        (s) => s.id !== petId && s.clients?.id !== clientId
                    )
                    : prev
            );
            setTotal((prev) => (typeof prev === 'number' ? prev - 1 : prev));

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
                <Loader2 className="h-8 w-8 animate-spin text-[#56A0AE]" />
            </div>
        );
    }

    const isSearching = query.trim().length > 0;
    const display = isSearching ? searchResults ?? [] : submissions;
    const count = display.length;

    let emptyState = null;
    if (isSearching) {
        emptyState = (
            <div className="rounded-2xl border border-[#e3e7f0] bg-white px-5 py-[60px] text-center">
                <div className="mb-1.5 font-display text-[17px] font-bold text-[#1b2240]">
                    No submissions found
                </div>
                <div className="text-sm font-medium text-[#79839c]">
                    Try a different search term.
                </div>
            </div>
        );
    } else {
        emptyState = (
            <div className="text-center p-8 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">No submissions found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="mb-[22px] flex flex-wrap items-end justify-between gap-5">
                <div>
                    <div className="flex items-center gap-[11px]">
                        <h1 className="m-0 font-display text-2xl font-extrabold tracking-[-0.01em] text-[#161d40]">
                            Recent Submissions
                        </h1>
                        <span className="rounded-full bg-[#56A0AE]/15 px-[11px] py-[3px] text-[15px] font-bold text-[#1f6675]">
                            {count}
                        </span>
                    </div>
                    <p className="mt-1.5 text-[13.5px] font-medium text-[#79839c]">
                        Showing {count} of {total ?? '—'} client intake
                        submissions
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex items-center">
                        <span className="pointer-events-none absolute left-[13px] flex text-[#9aa3b8]">
                            {searching ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                        </span>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search name, pet, phone…"
                            aria-label="Search submissions"
                            className="w-[264px] max-w-full rounded-[10px] border border-[#dde2ec] bg-white py-[11px] pl-[38px] pr-3.5 text-sm font-medium text-[#1b2240] outline-none placeholder:text-[#9aa3b8] focus:border-[#56A0AE]"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={refreshSubmissions}
                        disabled={refreshing}
                        className="flex items-center gap-2 rounded-[10px] border border-[#dde2ec] bg-white px-4 py-[11px] text-sm font-semibold text-[#1f6675] transition-colors hover:bg-[#f3f9fa] disabled:opacity-60"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''
                                }`}
                        />
                        Refresh
                    </button>
                </div>
            </div>

            {(() => {
                if (error) {
                    return (
                        <div className="text-center text-red-500 p-4 bg-red-100/10 rounded-lg">
                            <p>{error}</p>
                        </div>
                    );
                }
                if (count === 0) {
                    return emptyState;
                }
                return (
                    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {display.map((submission) => (
                            <ClientCard
                                key={submission.id}
                                pet={submission}
                                client={submission.clients}
                                onDelete={deletePet}
                            />
                        ))}
                    </div>
                );
            })()}

            {!isSearching && hasMore && submissions.length > 0 && (
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
