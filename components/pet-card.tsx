'use client';

import { useState } from 'react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clipboard, Check, Dog, Cat, AlertCircle, Trash2 } from 'lucide-react';
import type { PetRow, ClientRow } from '@/utils/supabase';
import { formatDate } from '@/utils/format-date';
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
import { getAge, getAgeStringFromDate } from '@/utils/get-age';

interface PetCardProps {
    pet: PetRow;
    client: ClientRow | null;
    onDelete: (petId: string) => Promise<void>;
}

export default function PetCard({ pet, client, onDelete }: PetCardProps) {
    const [copied, setCopied] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const isUnknown = (value: unknown) => {
        const normalized = String(value ?? '')
            .trim()
            .toLowerCase();
        return normalized === 'unknown';
    };

    const isOtherSpecies = (value: unknown) => {
        return (
            String(value ?? '')
                .trim()
                .toLowerCase() === 'other'
        );
    };

    const copyToClipboard = () => {
        const petInfo = `
Pet Information:
Name: ${pet.pet_name}
Species: ${getScientificName()}
Breed: ${pet.breed ?? ''}
Age: ${getAge(pet.birth_date ?? '')}
Sex: ${pet.sex ?? ''}
Spayed Neutered: ${pet.spayed_or_neutered ?? ''}
Color: ${pet.color ?? ''}
Microchip: ${pet.microchip ?? ''}
    `.trim();

        navigator.clipboard.writeText(petInfo);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        await onDelete(pet.id);
        setIsDeleting(false);
        setShowDeleteDialog(false);
    };

    const getPetIcon = () => {
        const species = pet.species?.toLowerCase();
        if (species === 'dog')
            return <Dog className="h-5 w-5 text-[#03045E]" />;
        if (species === 'cat')
            return <Cat className="h-5 w-5 text-[#03045E]" />;
        return <AlertCircle className="h-5 w-5 text-[#03045E]" />;
    };

    const getScientificName = () => {
        const species = pet.species?.toLowerCase();
        if (species === 'dog') return 'Canine';
        if (species === 'cat') return 'Feline';
        return 'Unknown';
    };

    const phoneFormat = (phone: string | null | undefined) => {
        if (phone) {
            return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }
        return '';
    };

    return (
        <>
            <Card className="overflow-hidden border-[#737373]/20 bg-white hover:bg-white/95 transition-colors">
                <CardHeader className="bg-[#737373]/5 pb-2">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-bold text-[#03045E]">
                            {client?.owner_name ?? 'Unknown owner'}
                        </CardTitle>
                        <Badge
                            variant="outline"
                            className="bg-[#56A0AE]/10 text-[#56A0AE] border-[#56A0AE]/30"
                        >
                            {pet.initials}
                        </Badge>
                    </div>
                    <div className="text-sm text-[#737373]">
                        Added on {formatDate(pet.created_at)}
                    </div>
                </CardHeader>
                <CardContent className="pt-4 pb-2">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-[#03045E] mb-1">
                                Owner Information
                            </h3>
                            <div className="space-y-1 text-sm">
                                <div>
                                    <span className="text-muted-foreground">
                                        Email:
                                    </span>{' '}
                                    <span className="text-[#56A0AE] underline">
                                        {client?.email ?? 'Unknown'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Phone:
                                    </span>{' '}
                                    {phoneFormat(client?.cell_phone) || 'Unknown'}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-[#03045E] mb-1 flex items-center gap-1">
                                {getPetIcon()} Pet Information
                            </h3>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                <div>
                                    <span className="text-muted-foreground">
                                        Name:
                                    </span>{' '}
                                    {pet.pet_name}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Color:
                                    </span>{' '}
                                    <span
                                        className={
                                            isUnknown(pet.color)
                                                ? 'text-[#C0091E]'
                                                : undefined
                                        }
                                    >
                                        {pet.color ?? 'Unknown'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Species:
                                    </span>{' '}
                                    <span
                                        className={
                                            isOtherSpecies(pet.species)
                                                ? 'text-[#C0091E]'
                                                : undefined
                                        }
                                    >
                                        {pet.species ?? 'Unknown'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Breed:
                                    </span>{' '}
                                    <span
                                        className={
                                            isUnknown(pet.breed)
                                                ? 'text-[#C0091E]'
                                                : undefined
                                        }
                                    >
                                        {pet.breed ?? 'Unknown'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Age:
                                    </span>{' '}
                                    {getAgeStringFromDate(
                                        pet.birth_date
                                    )}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Sex:
                                    </span>{' '}
                                    <span
                                        className={
                                            isUnknown(pet.sex)
                                                ? 'text-[#C0091E]'
                                                : undefined
                                        }
                                    >
                                        {pet.sex ?? 'Unknown'}
                                    </span>
                                </div>

                                <div className="col-span-2">
                                    <span className="text-muted-foreground">
                                        Spayed/Neutered:
                                    </span>{' '}
                                    <span
                                        className={
                                            isUnknown(
                                                // handle boolean or string
                                                typeof pet.spayed_or_neutered ===
                                                    'boolean'
                                                    ? pet.spayed_or_neutered
                                                        ? 'yes'
                                                        : 'no'
                                                    : pet.spayed_or_neutered
                                            )
                                                ? 'text-[#C0091E]'
                                                : undefined
                                        }
                                    >
                                        {pet.spayed_or_neutered ?? 'Unknown'}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-muted-foreground">
                                        Microchip:
                                    </span>{' '}
                                    <span
                                        className={
                                            isUnknown(pet.microchip)
                                                ? 'text-[#C0091E]'
                                                : undefined
                                        }
                                    >
                                        {pet.microchip ?? 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pt-2 flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-[#56A0AE] border-[#56A0AE]/30 hover:bg-[#56A0AE] hover:text-white"
                        onClick={copyToClipboard}
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 mr-2" /> Copied
                            </>
                        ) : (
                            <>
                                <Clipboard className="h-4 w-4 mr-2" /> Copy Info
                            </>
                        )}
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="bg-[#C0091E] hover:bg-[#C0091E]/70 text-white"
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={isDeleting}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>

            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent className="bg-background border-blue-900/20">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {client?.owner_name ?? 'Unknown owner'}
                            &apos;s submission for {pet.pet_name} and cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-blue-900/20 hover:bg-blue-950/30">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-900/80 hover:bg-red-800 text-red-100"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

