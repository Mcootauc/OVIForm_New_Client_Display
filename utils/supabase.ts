import type { Database } from '@/types/supabase';
export { supabase } from './supabase/client';

export type ClientRow = Database['public']['Tables']['clients_v2']['Row'];
export type PetRow = Database['public']['Tables']['pets_v2']['Row'];
export type HospitalRow = Database['public']['Tables']['hospitals_v2']['Row'];

// One submission = one pet row joined to its owner row.
// Driven off pets_v2 so each card is one IDEXX paste job.
export type Submission = PetRow & {
    clients_v2: ClientRow | null;
};
