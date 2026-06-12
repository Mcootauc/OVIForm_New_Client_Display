import type { Database } from '@/types/supabase';
export { supabase } from './supabase/client';

export type ClientRow = Database['public']['Tables']['clients']['Row'];
export type PetRow = Database['public']['Tables']['pets']['Row'];
export type HospitalRow = Database['public']['Tables']['hospitals']['Row'];

// One submission = one pet row joined to its owner row.
// Driven off pets so each card is one IDEXX paste job.
export type Submission = PetRow & {
    clients: ClientRow | null;
};
