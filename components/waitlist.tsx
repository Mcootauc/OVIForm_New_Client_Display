'use client';

import { useEffect, useState, useCallback } from 'react';
import { Check, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import type { Database } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';

export type WaitlistRow = Database['public']['Tables']['waitlist']['Row'];

interface WaitlistProps {
    hospitalId?: string;
    onCountChange?: (n: number) => void;
}

const GRID_COLS = 'grid-cols-[48px_1.3fr_1fr_1.1fr_2fr_140px_72px]';

const phoneFormat = (phone: string) =>
    phone?.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') ?? phone;

export default function Waitlist({ hospitalId, onCountChange }: WaitlistProps) {
    const [entries, setEntries] = useState<WaitlistRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const [entryToResolve, setEntryToResolve] = useState<WaitlistRow | null>(null);
    const [isResolving, setIsResolving] = useState(false);

    const fetchWaitlist = useCallback(async (): Promise<WaitlistRow[]> => {
        const { data, error } = await supabase
            .from('waitlist')
            .select('*')
            .is('resolved_at', null)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data ?? [];
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function init() {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchWaitlist();
                if (!cancelled) {
                    setEntries(data);
                    onCountChange?.(data.length);
                }
            } catch (err) {
                console.error('Error fetching waitlist:', err);
                if (!cancelled) {
                    setError('Failed to load wait list. Please try again later.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        init();

        return () => {
            cancelled = true;
        };
    }, [fetchWaitlist, onCountChange]);

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            const oldFirstId = entries[0]?.id;

            const data = await fetchWaitlist();
            setEntries(data);
            onCountChange?.(data.length);

            let newSubmissionCount = 0;
            if (oldFirstId) {
                const oldIndex = data.findIndex(r => r.id === oldFirstId);
                if (oldIndex === -1) {
                    newSubmissionCount = data.length;
                } else {
                    newSubmissionCount = oldIndex;
                }
            } else {
                newSubmissionCount = data.length;
            }

            if (newSubmissionCount > 0) {
                toast({
                    title: 'New wait list entries found!',
                    description: `${newSubmissionCount} new entr${newSubmissionCount === 1 ? 'y' : 'ies'} added.`,
                });
            } else {
                toast({
                    title: 'Refresh complete',
                    description: 'No new entries found.',
                });
            }
        } catch (error) {
            console.error('Error refreshing waitlist:', error);
            toast({
                title: 'Error',
                description: 'Failed to refresh wait list. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setRefreshing(false);
        }
    };

    const handleResolve = async () => {
        if (!entryToResolve) return;

        setIsResolving(true);
        try {
            const { error } = await supabase
                .from('waitlist')
                .update({ resolved_at: new Date().toISOString() })
                .eq('id', entryToResolve.id);

            if (error) throw error;

            setEntries((prev) => {
                const next = prev.filter((e) => e.id !== entryToResolve.id);
                onCountChange?.(next.length);
                return next;
            });

            toast({
                title: 'Entry removed',
                description: `${entryToResolve.client_name} and ${entryToResolve.pet_name} were removed from the wait list.`,
            });
        } catch (error) {
            console.error('Error resolving waitlist entry:', error);
            toast({
                title: 'Error',
                description: 'Failed to remove entry. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsResolving(false);
            setEntryToResolve(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-[#56A0AE]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4 bg-red-100/10 rounded-lg">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div>
            {/* Section header */}
            <div className="mb-[22px] flex flex-wrap items-end justify-between gap-5">
                <div>
                    <div className="flex items-center gap-[11px]">
                        <h1 className="m-0 font-display text-2xl font-extrabold tracking-[-0.01em] text-[#161d40]">
                            Waitlist
                        </h1>
                        <span className="rounded-full bg-[#fdeecf] px-[11px] py-[3px] text-[15px] font-bold text-[#9a6a12]">
                            {entries.length}
                        </span>
                    </div>
                    <p className="mt-1.5 text-[13.5px] font-medium text-[#79839c]">
                        Pets currently checked in and waiting to be seen
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 rounded-[10px] border border-[#dde2ec] bg-white px-4 py-[11px] text-sm font-semibold text-[#1f6675] transition-colors hover:bg-[#f3f9fa] disabled:opacity-60"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-[#e3e7f0] bg-white shadow-[0_1px_3px_rgba(20,26,82,0.05)]">
                {/* Column header */}
                <div
                    className={`grid ${GRID_COLS} gap-3.5 border-b border-[#eceff6] bg-[#f4f7fb] px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#79839c]`}
                >
                    <div>#</div>
                    <div>Owner</div>
                    <div>Pet</div>
                    <div>Phone</div>
                    <div>Reason for visit</div>
                    <div className="text-center">Pet info update</div>
                    <div className="text-center">
                        <span className="sr-only">Actions</span>
                    </div>
                </div>

                {/* Rows */}
                {entries.length === 0 ? (
                    <div className="px-5 py-12 text-center text-[14px] font-medium text-[#79839c]">
                        No pets are currently waiting.
                    </div>
                ) : (
                    entries.map((entry, i) => (
                        <div
                            key={entry.id}
                            className={`grid ${GRID_COLS} items-center gap-3.5 px-5 py-[15px] ${i === entries.length - 1 ? '' : 'border-b border-[#f1f3f8]'
                                }`}
                        >
                            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-[#eef1f7] font-display text-[13px] font-bold text-[#5b6480]">
                                {i + 1}
                            </div>
                            <div className="font-display text-[14.5px] font-semibold text-[#1b2240]">
                                {entry.client_name}
                            </div>
                            <div className="text-[14px] font-medium text-[#3a4156]">
                                {entry.pet_name}
                            </div>
                            <div className="text-[13.5px] font-medium text-[#3a4156]">
                                {phoneFormat(entry.phone_number)}
                            </div>
                            <div className="text-[13.5px] font-medium text-[#3a4156]">
                                {entry.visit_reason}
                            </div>
                            <div className="flex justify-center">
                                {entry.needs_info_update ? (
                                    <span
                                        aria-label="Pet info update needed"
                                        className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-[1.5px] border-[#56A0AE] bg-[#56A0AE] text-white"
                                    >
                                        <Check className="h-[13px] w-[13px]" strokeWidth={3} />
                                    </span>
                                ) : null}
                            </div>
                            <div className="flex justify-center">
                                <Button
                                    variant="destructive"
                                    title="Remove from wait list"
                                    className="h-9 w-9 rounded-[10px] bg-[#C0091E] p-0 text-white hover:bg-[#C0091E]/70"
                                    onClick={() => setEntryToResolve(entry)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AlertDialog
                open={!!entryToResolve}
                onOpenChange={(open) => {
                    if (!open) setEntryToResolve(null);
                }}
            >
                <AlertDialogContent className="bg-background border-blue-900/20">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove {entryToResolve?.client_name ?? 'Unknown owner'}&apos;s submission for {entryToResolve?.pet_name} from the wait list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-blue-900/20 hover:bg-blue-950/30">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-900/80 hover:bg-red-800 text-red-100"
                            onClick={handleResolve}
                            disabled={isResolving}
                        >
                            {isResolving ? 'Removing...' : 'Remove'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
