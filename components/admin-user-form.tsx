'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { getAdminContext, saveUser } from '@/lib/edgeFunctions';
import { Loader2, UserPlus, UserCog } from 'lucide-react';

type Hospital = { id: string; name: string; slug: string | null };
type Profile = { id: string; email: string; role: string; hospital_id: string | null; is_active: boolean };

export default function AdminUserForm() {
    const { toast } = useToast();
    
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isLoadingContext, setIsLoadingContext] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [mode, setMode] = useState<'create' | 'update'>('create');
    
    // Form state
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Vet Tech');
    const [hospitalId, setHospitalId] = useState('');
    const [newHospitalName, setNewHospitalName] = useState('');
    const [isActive, setIsActive] = useState(true);

    const loadContext = async () => {
        try {
            const data = await getAdminContext();
            setHospitals(data.hospitals);
            setProfiles(data.profiles);
            return data;
        } catch (err) {
            console.error('Failed to load admin context:', err);
            toast({
                title: 'Error',
                description: 'Failed to load context. Please refresh.',
                variant: 'destructive',
            });
            throw err;
        }
    };

    useEffect(() => {
        loadContext()
            .then((data) => {
                if (data.hospitals.length > 0) {
                    setHospitalId(data.hospitals[0].id);
                }
            })
            .finally(() => setIsLoadingContext(false));
    }, [toast]);

    const handleModeChange = (newMode: string) => {
        setMode(newMode as 'create' | 'update');
        setEmail('');
        setRole('Vet Tech');
        setHospitalId(hospitals.length > 0 ? hospitals[0].id : '');
        setNewHospitalName('');
        setIsActive(true);
    };

    const handleUserSelect = (selectedEmail: string) => {
        setEmail(selectedEmail);
        if (!selectedEmail) {
            setRole('Vet Tech');
            setHospitalId(hospitals.length > 0 ? hospitals[0].id : '');
            setIsActive(true);
            return;
        }
        
        const profile = profiles.find(p => p.email === selectedEmail);
        if (profile) {
            setRole(profile.role);
            if (profile.hospital_id) {
                setHospitalId(profile.hospital_id);
            } else {
                setHospitalId(hospitals.length > 0 ? hospitals[0].id : '');
            }
            setNewHospitalName('');
            setIsActive(profile.is_active);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email || !role) {
            toast({ title: 'Error', description: 'Email and role are required.', variant: 'destructive' });
            return;
        }

        if (hospitalId === 'new' && !newHospitalName.trim()) {
            toast({ title: 'Error', description: 'New hospital name is required.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            await saveUser({
                email,
                role,
                is_active: isActive,
                hospital_id: hospitalId === 'new' ? undefined : hospitalId,
                new_hospital_name: hospitalId === 'new' ? newHospitalName.trim() : undefined,
                mode,
            });

            toast({
                title: 'Success',
                description: `User successfully ${mode === 'create' ? 'created' : 'updated'}.`,
            });

            const newData = await loadContext();

            if (mode === 'create') {
                // Reset form
                setEmail('');
                setRole('Vet Tech');
                setHospitalId(newData.hospitals.length > 0 ? newData.hospitals[0].id : '');
                setNewHospitalName('');
                setIsActive(true);
            } else {
                // Keep the selected user but ensure hospitalId matches the new list if a new hospital was added
                if (hospitalId === 'new') {
                    // Try to find the newly created hospital by name
                    const newHosp = newData.hospitals.find(h => h.name === newHospitalName.trim());
                    setHospitalId(newHosp?.id || (newData.hospitals.length > 0 ? newData.hospitals[0].id : ''));
                    setNewHospitalName('');
                }
            }
        } catch (err: any) {
            console.error('Save failed:', err);
            toast({
                title: 'Error',
                description: err.message || 'Failed to save user.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingContext) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#56A0AE]" />
            </div>
        );
    }

    return (
        <Card className="w-full max-w-2xl border-[#56A0AE] shadow-md">
            <CardHeader className="bg-[#03045E] text-[#FEFEFE] rounded-t-xl p-0">
                <Tabs value={mode} onValueChange={handleModeChange} className="w-full">
                    <TabsList className="w-full h-auto bg-transparent p-0 rounded-none border-b border-white/10">
                        <TabsTrigger 
                            value="create" 
                            className="flex-1 rounded-none py-4 text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Create New User
                        </TabsTrigger>
                        <TabsTrigger 
                            value="update" 
                            className="flex-1 rounded-none py-4 text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none"
                        >
                            <UserCog className="w-4 h-4 mr-2" />
                            Update Existing User
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {mode === 'create' ? (
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-semibold text-[#03045E]">
                                Email Address
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="border-[#737373]/30 focus-visible:ring-[#56A0AE]"
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label htmlFor="userSelect" className="text-sm font-semibold text-[#03045E]">
                                Select User
                            </label>
                            <select
                                id="userSelect"
                                value={email}
                                onChange={(e) => handleUserSelect(e.target.value)}
                                required
                                className="flex h-10 w-full rounded-md border border-[#737373]/30 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56A0AE] focus-visible:ring-offset-2"
                            >
                                <option value="" disabled>Select a user...</option>
                                {profiles.map((p) => (
                                    <option key={p.id} value={p.email}>
                                        {p.email} — {p.role}
                                    </option>
                                ))}
                            </select>
                            {email && (
                                <p className="text-xs text-[#737373] mt-1">
                                    Editing <span className="font-medium text-[#03045E]">{email}</span>
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="role" className="text-sm font-semibold text-[#03045E]">
                            Role
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-[#737373]/30 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56A0AE] focus-visible:ring-offset-2"
                        >
                            <option value="Vet Tech">Vet Tech</option>
                            <option value="Doctor">Doctor</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="hospital" className="text-sm font-semibold text-[#03045E]">
                            Hospital
                        </label>
                        <select
                            id="hospital"
                            value={hospitalId}
                            onChange={(e) => setHospitalId(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-[#737373]/30 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56A0AE] focus-visible:ring-offset-2"
                        >
                            {hospitals.map((h) => (
                                <option key={h.id} value={h.id}>
                                    {h.name}
                                </option>
                            ))}
                            <option value="new" className="font-semibold text-[#56A0AE]">
                                + Create new hospital...
                            </option>
                        </select>
                    </div>

                    {hospitalId === 'new' && (
                        <div className="space-y-2 pl-4 border-l-2 border-[#56A0AE]">
                            <label htmlFor="newHospitalName" className="text-sm font-semibold text-[#03045E]">
                                New Hospital Name
                            </label>
                            <Input
                                id="newHospitalName"
                                type="text"
                                placeholder="e.g. Valley Vet Clinic"
                                value={newHospitalName}
                                onChange={(e) => setNewHospitalName(e.target.value)}
                                required={hospitalId === 'new'}
                                className="border-[#737373]/30 focus-visible:ring-[#56A0AE]"
                            />
                        </div>
                    )}

                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 rounded border-[#737373]/30 text-[#56A0AE] focus:ring-[#56A0AE]"
                        />
                        <label
                            htmlFor="isActive"
                            className="text-sm font-semibold text-[#03045E] cursor-pointer"
                        >
                            Active User
                        </label>
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting || (mode === 'update' && !email)}
                        className="w-full bg-[#56A0AE] hover:bg-[#2c7d8c] text-white font-bold"
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mode === 'create' ? 'Create User' : 'Update User'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}