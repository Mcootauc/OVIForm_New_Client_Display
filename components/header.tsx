'use client';

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, LogOut, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header({ title }: Readonly<{ title: string }>) {
    const { user, profile, signOut } = useAuth();
    const router = useRouter();

    const getInitials = (name?: string) => {
        if (!name) return '';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('');
    };

    const formattedToday = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date());

    return (
        <header className="border-b border-[#737373]/20 bg-gradient-to-r from-[#141a52] to-[#1d2a6e] shadow-[0_2px_10px_rgba(15,20,60,0.18)]">
            <div className="container mx-auto px-4 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-[#2c7d8c] to-[#37a6b6] text-white shadow-[0_2px_8px_rgba(44,125,140,0.4)]">
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <circle cx="6" cy="10" r="1.9" />
                                <circle cx="10" cy="6.5" r="1.9" />
                                <circle cx="14" cy="6.5" r="1.9" />
                                <circle cx="18" cy="10" r="1.9" />
                                <path d="M12 11.5c-2.9 0-5.4 2.4-5.4 4.8 0 1.6 1.2 2.7 2.8 2.7.9 0 1.8-.5 2.6-.5s1.7.5 2.6.5c1.6 0 2.8-1.1 2.8-2.7 0-2.4-2.5-4.8-5.4-4.8z" />
                            </svg>
                        </div>
                        <div className="flex flex-col leading-tight">
                            <h1 className="font-display text-xl font-extrabold tracking-[-0.01em] text-[#FEFEFE]">
                                {title}
                            </h1>
                            <span className="mt-0.5 text-xs font-medium text-[#aeb7e0]">
                                New Client Intake
                            </span>
                        </div>
                    </div>
                    {user && (
                        <div className="flex items-center gap-4">
                            <div className="hidden items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-[#FEFEFE] sm:flex">
                                <Calendar className="h-4 w-4 text-white/70" />
                                <span>{formattedToday}</span>
                            </div>
                            <div className="hidden h-8 w-px bg-white/20 sm:block" />
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-bold text-white">
                                    {user.user_metadata.full_name}
                                </p>
                                <p className="text-xs text-white/80">
                                    {profile?.role ?? 'Role Not Found'}
                                </p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-10 w-10 rounded-full hover:bg-white/10"
                                    >
                                        <Avatar className="h-10 w-10 border border-white/30">
                                            <AvatarImage
                                                src={user.user_metadata.avatar_url}
                                                alt={user.user_metadata.full_name}
                                            />
                                            <AvatarFallback className="bg-white/10 text-white">
                                                {getInitials(
                                                    user.user_metadata.full_name
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <DropdownMenuItem className="flex flex-col items-start gap-1">
                                        <p className="font-medium text-[#03045E]">
                                            {user.user_metadata.full_name}
                                        </p>
                                        <p className="text-xs text-[#737373]">
                                            {user.email}
                                        </p>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {profile?.role === 'Admin' && (
                                        <DropdownMenuItem
                                            onClick={() => router.push('/admin')}
                                            className="cursor-pointer text-[#03045E] focus:bg-[#56A0AE]/10 focus:text-[#03045E]"
                                        >
                                            <ShieldAlert className="mr-2 h-4 w-4" />
                                            <span>Admin Dashboard</span>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        onClick={() => signOut()}
                                        className="cursor-pointer text-[#C0091E] focus:text-[#C0091E] focus:bg-[#C0091E]/10"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
