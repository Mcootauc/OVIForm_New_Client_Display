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
import type { clientType } from '@/utils/supabase';
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
    client: clientType;
    onDelete: (id: number) => Promise<void>;
}

export default function ClientCard({ client, onDelete }: ClientCardProps) {
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
        // Split owner name into first name and last name
        const [firstName, ...lastNameParts] = client.owner_name // last name parts include middle name (e.g. First name: Brendan, Last name: Michael Tan)
            .trim()
            .split(/\s+/);
        const lastName = lastNameParts.join(' '); // join the last name parts back together (e.g. Brendan Michael Tan => Michael Tan)

        // Secondary Contact Information
        let secondaryContactName = '';
        let secondaryContactPhone = '';

        // checks if secondary contact name and phone are not null
        if (client.secondary_contact_name) {
            secondaryContactName = client.secondary_contact_name;
        }
        if (client.secondary_contact_cell_phone) {
            secondaryContactPhone = client.secondary_contact_cell_phone;
        }

        // Split secondary contact name into first name and last name
        const [secondaryFirstName, ...secondaryLastNameParts] =
            secondaryContactName.trim().split(/\s+/); // last name parts include middle name (e.g. First name: Brendan, Last name: Michael Tan)
        const secondaryLastName = secondaryLastNameParts.join(' '); // join the last name parts back together (e.g. Brendan Michael Tan => Michael Tan)

        const clientInfo = `
Client Information:
First Name: ${firstName}
Last Name: ${lastName}
Address: ${client.street}
City: ${client.city}
State: ${client.state}
Zip Code: ${client.zip_code}
Phone: ${client.cell_phone}
Email: ${client.email}

Pet Information:
Name: ${client.pet_name}
Species: ${getScientificName()}
Breed: ${client.breed}
Age: ${getAge(client.birth_date)}
Sex: ${client.sex}
Spayed Neutered: ${client.spayed_or_neutered}
Color: ${client.color}
Microchip: ${''}

Secondary Contact Information:
First Name: ${secondaryFirstName}
Last Name: ${secondaryLastName}
Phone: ${secondaryContactPhone}
    `.trim();

        navigator.clipboard.writeText(clientInfo);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        await onDelete(client.id);
        setIsDeleting(false);
        setShowDeleteDialog(false);
    };

    const getPetIcon = () => {
        const species = client.species?.toLowerCase();
        if (species === 'dog')
            return <Dog className="h-5 w-5 text-[#03045E]" />;
        if (species === 'cat')
            return <Cat className="h-5 w-5 text-[#03045E]" />;
        return <AlertCircle className="h-5 w-5 text-[#03045E]" />;
    };

    const getScientificName = () => {
        const species = client.species?.toLowerCase();
        if (species === 'dog') return 'Canine';
        if (species === 'cat') return 'Feline';
        return 'Unknown';
    };

    const phoneFormat = (phone: string) => {
        return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    };

    return (
        <>
            <Card className="overflow-hidden border-[#737373]/20 bg-white hover:bg-white/95 transition-colors">
                <CardHeader className="bg-[#737373]/5 pb-2">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-bold text-[#03045E]">
                            {client.owner_name}
                        </CardTitle>
                        <Badge
                            variant="outline"
                            className="bg-[#56A0AE]/10 text-[#56A0AE] border-[#56A0AE]/30"
                        >
                            {client.initials}
                        </Badge>
                    </div>
                    <div className="text-sm text-[#737373]">
                        Added on {formatDate(client.created_at)}
                    </div>
                </CardHeader>
                <CardContent className="pt-4 pb-2">
                    <div className="space-y-4">
                        {/* Owner Information */}
                        <div>
                            <h3 className="text-md font-medium text-[#03045E] mb-1">
                                Owner Information
                            </h3>
                            <div className="space-y-1 text-sm">
                                <div>
                                    <span className="text-muted-foreground">
                                        Name:
                                    </span>{' '}
                                    {client.owner_name}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Email:
                                    </span>{' '}
                                    <span className="text-[#56A0AE] underline">
                                        {client.email}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Phone:
                                    </span>{' '}
                                    {phoneFormat(client.cell_phone)}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Address:
                                    </span>{' '}
                                    {client.street}, {client.city},{' '}
                                    {client.state} {client.zip_code}
                                </div>
                            </div>
                        </div>

                        {/* Pet Information */}
                        <div>
                            <h3 className="text-md font-medium text-[#03045E] mb-1 flex items-center gap-1">
                                {getPetIcon()} Pet Information
                            </h3>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                <div>
                                    <span className="text-muted-foreground">
                                        Name:
                                    </span>{' '}
                                    {client.pet_name}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Color:
                                    </span>{' '}
                                    <span
                                        className={
                                            isUnknown(client.color)
                                                ? 'text-[#C0091E]'
                                                : undefined
                                        }
                                    >
                                        {client.color}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Species:
                                    </span>{' '}
                                    <span
                                        className={
                                            isOtherSpecies(client.species)
                                                ? 'text-[#C0091E]'
                                                : undefined
                                        }
                                    >
                                        {client.species}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Breed:
                                    </span>{' '}
                                    <span
                                        className={
                                            isUnknown(client.breed)
                                                ? 'text-[#C0091E]'
                                                : undefined
                                        }
                                    >
                                        {client.breed}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Age:
                                    </span>{' '}
                                    {getAgeStringFromDate(client.birth_date)}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Sex:
                                    </span>{' '}
                                    <span
                                        className={
                                            isUnknown(client.sex)
                                                ? 'text-[#C0091E]'
                                                : undefined
                                        }
                                    >
                                        {client.sex}
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
                                                typeof client.spayed_or_neutered ===
                                                    'boolean'
                                                    ? client.spayed_or_neutered
                                                        ? 'yes'
                                                        : 'no'
                                                    : client.spayed_or_neutered
                                            )
                                                ? 'text-[#C0091E]'
                                                : undefined
                                        }
                                    >
                                        {client.spayed_or_neutered}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-muted-foreground">
                                        Microchip:
                                    </span>{' '}
                                    <span
                                        className={
                                            isUnknown(client.microchip)
                                                ? 'text-[#C0091E]'
                                                : undefined
                                        }
                                    >
                                        {client.microchip}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Secondary Contact Information */}
                        {(client.secondary_contact_name ||
                            client.secondary_contact_cell_phone) && (
                            <div>
                                <h3 className="text-md font-medium text-[#03045E] mb-1">
                                    Secondary Contact Information
                                </h3>
                                <div className="space-y-1 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">
                                            Name:
                                        </span>{' '}
                                        {client.secondary_contact_name}
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            Phone:
                                        </span>{' '}
                                        {phoneFormat(client.cell_phone)}
                                    </div>
                                </div>
                            </div>
                        )}
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
                            This will permanently delete {client.owner_name}
                            &apos;s client record and cannot be undone.
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
