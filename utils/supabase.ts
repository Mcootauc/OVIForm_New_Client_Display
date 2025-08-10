import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type clientType = {
    id: number;
    timestamp: string;
    owner_name: string;
    street: string;
    city: string;
    state: string;
    zip_code: string;
    cell_phone: string;
    email: string;
    pet_name: string;
    species: string;
    breed: string;
    birth_date: string;
    sex: string;
    spayed_or_neutered: boolean;
    color: string;
    microchip: string;
    initials: string;
    created_at: string;
};

export type petType = {
    id: number;
    timestamp: string;
    owner_name: string;
    street: string;
    city: string;
    state: string;
    zip_code: string;
    cell_phone: string;
    email: string;
    pet_name: string;
    species: string;
    breed: string;
    birth_date: string;
    sex: string;
    spayed_or_neutered: boolean;
    color: string;
    microchip: string;
    initials: string;
    created_at: string;
};

export type Client = clientType;
export type Pet = petType;
