import { supabase } from '@/utils/supabase/client';

export async function getHospital() {
    const { data, error } = await supabase
        .from('hospitals_v2')
        .select('id, name, slug')
        .single();
    if (error) throw error;
    return data;
}
