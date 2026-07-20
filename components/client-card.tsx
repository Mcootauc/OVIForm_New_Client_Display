'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Clipboard,
    Check,
    Trash2,
    Mail,
    Phone,
    MapPin,
    Dog,
    Cat,
    User,
} from 'lucide-react';
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

interface ClientCardProps {
    pet: PetRow;
    client: ClientRow | null;
    onDelete: (petId: string, clientId: string | null) => Promise<void>;
}

export default function ClientCard({ pet, client, onDelete }: ClientCardProps) {
    const [copied, setCopied] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const isUnknown = (value: unknown) => {
        const normalized = String(value ?? '')
            .trim()
            .toLowerCase();
        return normalized === '' || normalized === 'unknown';
    };

    const displayWithLabel = (label: string, value: unknown) => {
        if (isUnknown(value)) return `${label}: Unknown`;
        return String(value);
    };

    const isOtherSpecies = (value: unknown) => {
        return (
            String(value ?? '')
                .trim()
                .toLowerCase() === 'other'
        );
    };

    const copyToClipboard = () => {
        const ownerName = client?.owner_name ?? 'Unknown owner';
        const [firstName, ...lastNameParts] = ownerName.trim().split(/\s+/);
        const lastName = lastNameParts.join(' ');

        let secondaryContactName = '';
        let secondaryContactPhone = '';

        if (client?.secondary_contact_name) {
            secondaryContactName = client.secondary_contact_name;
        }
        if (client?.secondary_contact_cell_phone) {
            secondaryContactPhone = client.secondary_contact_cell_phone;
        }

        const [secondaryFirstName, ...secondaryLastNameParts] =
            secondaryContactName.trim().split(/\s+/);
        const secondaryLastName = secondaryLastNameParts.join(' ');

        const clientInfo = `
Client Information:
First Name: ${firstName}
Last Name: ${lastName}
Address: ${client?.street ?? ''}
City: ${client?.city ?? ''}
State: ${client?.state ?? ''}
Zip Code: ${client?.zip_code ?? ''}
Phone: ${phoneFormatDash(client?.cell_phone)}
Email: ${client?.email ?? ''}

Pet Information:
Name: ${pet.pet_name}
Species: ${getScientificName(pet.species)}
Breed: ${pet.breed ?? ''}
Age: ${getAge(pet.birth_date ?? '')}
Sex: ${pet.sex ?? ''}
Spayed Neutered: ${pet.spayed_or_neutered ?? ''}
Color: ${pet.color ?? ''}
Microchip: ${pet.microchip ?? ''}

Secondary Contact Information:
Secondary First Name: ${secondaryFirstName}
Secondary Last Name: ${secondaryLastName}
Secondary Phone: ${phoneFormatDash(secondaryContactPhone)}
    `.trim();

        navigator.clipboard.writeText(clientInfo);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        await onDelete(pet.id, client?.id ?? null);
        setIsDeleting(false);
        setShowDeleteDialog(false);
    };

    const getScientificName = (species: string | null | undefined) => {
        const s = species?.toLowerCase();
        if (s === 'dog') return 'Canine';
        if (s === 'cat') return 'Feline';
        return 'Unknown';
    };

    const phoneFormat = (phone: string | null | undefined) => {
        if (phone) {
            return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }
        return '';
    };

    const phoneFormatDash = (phone: string | null | undefined) => {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, '');
        return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    };

    const hasSecondaryContact =
        String(client?.secondary_contact_name ?? '').trim().length > 0 ||
        String(client?.secondary_contact_cell_phone ?? '').trim().length > 0;

    // Spayed/Neutered badge — handles boolean or string values.
    const snRaw = pet.spayed_or_neutered;
    let snDisplay = snRaw ?? 'Unknown';
    if (typeof snRaw === 'boolean') {
        snDisplay = snRaw ? 'Yes' : 'No';
    }
    const snYes =
        typeof snRaw === 'boolean'
            ? snRaw
            : ['yes', 'true', 'y'].includes(
                String(snRaw ?? '')
                    .trim()
                    .toLowerCase()
            );

    // Microchip badge — green when a chip value is present.
    const microDisplay = pet.microchip ?? 'Unknown';
    const microNorm = String(pet.microchip ?? '')
        .trim()
        .toLowerCase();
    const microYes =
        microNorm !== '' &&
        !['no', 'none', 'unknown', 'n', 'false', '0'].includes(microNorm);

    const pillClass = (yes: boolean) =>
        `inline-flex items-center gap-[5px] whitespace-nowrap rounded-full border px-[11px] py-1 text-[11.5px] font-semibold ${yes
            ? 'border-[#cfe9da] bg-[#e6f4ec] text-[#22774b]'
            : 'border-[#e3e7f0] bg-[#f0f2f7] text-[#6b7488]'
        }`;

    const chipClass = (unknown: boolean) =>
        `rounded-lg px-[11px] py-1 text-xs font-semibold ${unknown ? 'bg-[#C0091E]/10 text-[#C0091E]' : 'bg-[#eaf1f4] text-[#1f6675]'
        }`;

    const petAge = getAgeStringFromDate(pet.birth_date);
    const isDog = String(pet.species ?? '').toLowerCase() === 'dog';

    return (
        <>
            <div className="flex flex-col overflow-hidden rounded-2xl border border-[#e3e7f0] bg-white shadow-[0_1px_3px_rgba(20,26,82,0.05)]">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-[#eceff6] bg-[#f4f7fb] px-[18px] py-[15px]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[#141a52] text-[13.5px] font-bold text-white">
                        {pet.initials}
                    </div>
                    <div className="min-w-0 flex-1">

                        <div className="text-[17px] font-bold tracking-[-0.01em] text-[#161d40]">
                            {client?.owner_name ?? 'Unknown owner'}
                        </div>
                        <div className="mt-px text-xs font-medium text-[#8a93ab]">
                            Added {formatDate(pet.created_at)}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-[15px] px-[18px] py-4">
                    {/* Pet spotlight */}
                    <div>
                        <div className="mb-[9px] flex items-center justify-between gap-2.5">
                            <div className="flex flex-row items-center gap-[6px]">
                                {isDog ? <Dog className="h-5 w-5" /> : <Cat className="h-5 w-5" />}
                                <span className="text-[17px] font-bold text-[#161d40]">
                                    {pet.pet_name}
                                </span>
                            </div>
                            <span
                                className={`text-[12.5px] font-medium ${isUnknown(pet.color)
                                    ? 'text-[#C0091E]'
                                    : 'text-[#79839c]'
                                    }`}
                            >
                                {displayWithLabel('Color', pet.color)}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <span
                                className={chipClass(
                                    isOtherSpecies(pet.species) ||
                                    isUnknown(pet.species)
                                )}
                            >
                                {displayWithLabel('Species', pet.species)}
                            </span>
                            <span className={chipClass(isUnknown(pet.breed))}>
                                {displayWithLabel('Breed', pet.breed)}
                            </span>
                            <span className={chipClass(isUnknown(pet.sex))}>
                                {displayWithLabel('Sex', pet.sex)}
                            </span>
                            <span className={chipClass(isUnknown(petAge))}>
                                {displayWithLabel('Age', petAge)}
                            </span>
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                            <span className={pillClass(snYes)}>
                                Spayed/Neutered: {snDisplay}
                            </span>
                            <span className={pillClass(microYes)}>
                                Microchip: {microDisplay}
                            </span>
                        </div>
                    </div>

                    {/* Owner contact */}
                    <div className="flex flex-col gap-[9px] border-t border-[#f0f2f7] pt-[14px]">
                        <div className="flex flex-row gap-[9px] items-center">
                            <User className="h-4 w-4" />
                            <div className="mb-px text-sm font-bold text-[#1b2240]">
                                {client?.owner_name ?? 'Unknown name'}
                            </div>
                        </div>
                        <div className="flex items-center gap-[9px] text-[13.5px] font-medium text-[#3a4156]">
                            <Mail className="h-[15px] w-[15px] shrink-0 text-[#9aa3b8]" />
                            {client?.email ? (
                                <a
                                    href={`mailto:${client.email}`}
                                    className="break-all text-[#2c7d8c] no-underline"
                                >
                                    {client.email}
                                </a>
                            ) : (
                                <span>Unknown</span>
                            )}
                        </div>
                        <div className="flex items-center gap-[9px] text-[13.5px] font-medium text-[#3a4156]">
                            <Phone className="h-[15px] w-[15px] shrink-0 text-[#9aa3b8]" />
                            {phoneFormat(client?.cell_phone) || 'Unknown cell phone'}
                        </div>
                        <div className="flex items-start gap-[9px] text-[13.5px] font-medium text-[#3a4156]">
                            <MapPin className="mt-px h-[15px] w-[15px] shrink-0 text-[#9aa3b8]" />
                            <span>
                                {client?.street ?? 'Unknown street'},{' '}
                                {client?.city ?? 'Unknown city'},{' '}
                                {client?.state ?? 'Unknown state'}{' '}
                                {client?.zip_code ?? 'Unknown zip code'}
                            </span>
                        </div>
                    </div>

                    {/* Secondary Contact */}
                    {hasSecondaryContact && (
                        <div className="flex items-center justify-between gap-2.5 rounded-[9px] bg-[#f6f8fb] px-3 py-[9px] text-[13px] font-medium text-[#3a4156]">
                            <span>
                                <span className="text-[#9aa3b8]">
                                    Secondary ·{' '}
                                </span>
                                <span className="font-semibold text-[#1b2240]">
                                    {client?.secondary_contact_name ?? ''}
                                </span>
                            </span>
                            <span>
                                {phoneFormat(
                                    client?.secondary_contact_cell_phone
                                )}
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-4 flex gap-[9px] border-t border-[#eef1f6] px-5 py-[15px]">
                    <Button
                        className="h-11 flex-1 rounded-[10px] bg-[#56A0AE] text-white hover:bg-[#478d99]"
                        onClick={copyToClipboard}
                    >
                        {copied ? (
                            <>
                                <Check className="mr-2 h-4 w-4" /> Copied!
                            </>
                        ) : (
                            <>
                                <Clipboard className="mr-2 h-4 w-4" /> Copy Info
                            </>
                        )}
                    </Button>
                    <Button
                        variant="destructive"
                        title="Delete submission"
                        className="h-11 w-11 rounded-[10px] bg-[#C0091E] p-0 text-white hover:bg-[#C0091E]/70"
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={isDeleting}
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>
            </div >

            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent className="bg-background border-blue-900/20">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {client?.owner_name ?? 'Unknown owner'}&apos;s submission for {pet.pet_name} and cannot be undone.
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
