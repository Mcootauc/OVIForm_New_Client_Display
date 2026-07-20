import { supabase } from '@/utils/supabase/client';

export async function getHospital() {
    const { data, error } = await supabase
        .from('hospitals')
        .select('id, name, slug')
        .single();
    if (error) throw error;
    return data;
}

export async function getAdminContext() {
    const { data, error } = await supabase.functions.invoke('admin-manage-user', {
        body: { action: 'context' },
    });
    if (error) throw error;
    return data as { 
        hospitals: { id: string; name: string; slug: string | null }[],
        profiles: { id: string; email: string; role: string; hospital_id: string | null; is_active: boolean }[]
    };
}

export async function saveUser(payload: {
    email: string;
    role: string;
    is_active: boolean;
    hospital_id?: string;
    new_hospital_name?: string;
    mode: 'create' | 'update';
}) {
    const { data, error } = await supabase.functions.invoke('admin-manage-user', {
        body: { action: 'save', ...payload },
    });
    if (error) throw error;
    return data;
}
