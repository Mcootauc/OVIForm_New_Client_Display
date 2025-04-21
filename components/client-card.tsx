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
import type { VVH_Client } from '@/utils/supabase';
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
    client: VVH_Client;
    onDelete: (id: number) => Promise<void>;
}

export default function ClientCard({ client, onDelete }: ClientCardProps) {
    const [copied, setCopied] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const copyToClipboard = () => {
        const clientInfo = `
Client Information:
First Name: ${client.owner_name.split(' ')[0]}
Last Name: ${client.owner_name.split(' ')[1]}
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
Spayed Neutered: ${client.spayed_or_neutered ? 'Yes' : 'No'}
Color: ${client.color}
Microchip: ${client.microchip ? client.microchip : ''}
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
        if (species === 'dog') return <Dog className="h-5 w-5 text-blue-400" />;
        if (species === 'cat') return <Cat className="h-5 w-5 text-blue-400" />;
        return <AlertCircle className="h-5 w-5 text-blue-400" />;
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
            <Card className="overflow-hidden border-blue-900/20 bg-card/95 hover:bg-card/80 transition-colors">
                <CardHeader className="bg-blue-950/30 pb-2">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-bold text-primary-foreground">
                            {client.owner_name}
                        </CardTitle>
                        <Badge
                            variant="outline"
                            className="bg-blue-500/20 text-blue-300 border-blue-700"
                        >
                            {client.initials}
                        </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Added on {formatDate(client.created_at)}
                    </div>
                </CardHeader>
                <CardContent className="pt-4 pb-2">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-blue-400 mb-1">
                                Owner Information
                            </h3>
                            <div className="space-y-1 text-sm">
                                <p>{client.owner_name}</p>
                                <p>{client.street}</p>
                                <p>
                                    {client.city}, {client.state}{' '}
                                    {client.zip_code}
                                </p>
                                <p>{phoneFormat(client.cell_phone)}</p>
                                <p className="text-blue-300">{client.email}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-blue-400 mb-1 flex items-center gap-1">
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
                                        Species:
                                    </span>{' '}
                                    {client.species}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Breed:
                                    </span>{' '}
                                    {client.breed}
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
                                    {client.sex}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Color:
                                    </span>{' '}
                                    {client.color}
                                </div>
                                <div className="col-span-2">
                                    <span className="text-muted-foreground">
                                        Spayed/Neutered:
                                    </span>{' '}
                                    {client.spayed_or_neutered ? 'Yes' : 'No'}
                                </div>
                                <div className="col-span-2">
                                    <span className="text-muted-foreground">
                                        Microchip:
                                    </span>{' '}
                                    {client.microchip
                                        ? client.microchip
                                        : 'None'}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pt-2 flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-blue-300 border-blue-800 hover:bg-blue-900/30 hover:text-blue-100"
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
                        className="bg-red-900/80 hover:bg-red-800 text-red-100"
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
