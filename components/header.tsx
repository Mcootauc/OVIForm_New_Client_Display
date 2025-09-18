'use client';

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';

export default function Header({ title }: Readonly<{ title: string }>) {
    const { user, signOut } = useAuth();

    const getInitials = (name?: string) => {
        if (!name) return '';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('');
    };

    return (
        <header className="border-b border-[#737373]/20 bg-[#03045E] shadow-sm">
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-[#FEFEFE]">
                        {title}
                    </h1>
                    {user && (
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
                                <DropdownMenuItem
                                    onClick={() => signOut()}
                                    className="text-[#C0091E] focus:text-[#C0091E] focus:bg-[#C0091E]/10"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    );
}
