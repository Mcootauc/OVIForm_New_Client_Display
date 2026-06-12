import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type clientType = {
    id: string;
    hospital_id: string;
    owner_name: string;
    secondary_contact_name: string | null;
    secondary_contact_cell_phone: string | null;
    street: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    cell_phone: string | null;
    email: string | null;
    initials: string | null;
    created_at: string;
    pets?: petType[];
};

export type petType = {
    id: string;
    client_id: string;
    hospital_id: string;
    pet_name: string;
    species: string | null;
    breed: string | null;
    birth_date: string | null;
    sex: string | null;
    spayed_or_neutered: string | null;
    color: string | null;
    microchip: string | null;
    initials: string | null;
    created_at: string;
    clients?: Pick<clientType, 'owner_name' | 'email' | 'cell_phone'> | null;
};

export type Client = clientType;
export type Pet = petType;
