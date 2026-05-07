export { supabase } from './supabase/client';

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
    secondary_contact_name: string;
    secondary_contact_cell_phone: string;
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
