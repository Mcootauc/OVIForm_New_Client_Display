import { supabase } from '@/utils/supabase/client';

export async function getHospital() {
    const { data, error } = await supabase
        .from('hospitals')
        .select('id, name, slug')
        .single();
    if (error) throw error;
    return data;
}
