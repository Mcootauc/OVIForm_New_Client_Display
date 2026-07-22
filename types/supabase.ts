export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      breeds: {
        Row: {
          id: number
          name: string | null
          species: string
        }
        Insert: {
          id?: number
          name?: string | null
          species: string
        }
        Update: {
          id?: number
          name?: string | null
          species?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          cell_phone: string | null
          city: string | null
          created_at: string
          email: string | null
          hospital_id: string
          id: string
          initials: string | null
          owner_name: string
          secondary_contact_cell_phone: string | null
          secondary_contact_name: string | null
          state: string | null
          street: string | null
          zip_code: string | null
        }
        Insert: {
          cell_phone?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          hospital_id: string
          id?: string
          initials?: string | null
          owner_name: string
          secondary_contact_cell_phone?: string | null
          secondary_contact_name?: string | null
          state?: string | null
          street?: string | null
          zip_code?: string | null
        }
        Update: {
          cell_phone?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          hospital_id?: string
          id?: string
          initials?: string | null
          owner_name?: string
          secondary_contact_cell_phone?: string | null
          secondary_contact_name?: string | null
          state?: string | null
          street?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_v2_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      legacy_id_map: {
        Row: {
          migrated_at: string
          new_id: string
          source_id: number
          source_table: string
        }
        Insert: {
          migrated_at?: string
          new_id: string
          source_id: number
          source_table: string
        }
        Update: {
          migrated_at?: string
          new_id?: string
          source_id?: number
          source_table?: string
        }
        Relationships: []
      }
      pets: {
        Row: {
          birth_date: string | null
          breed: string | null
          client_id: string
          color: string | null
          created_at: string
          hospital_id: string
          id: string
          initials: string | null
          microchip: string | null
          pet_name: string
          sex: string | null
          spayed_or_neutered: string | null
          species: string | null
        }
        Insert: {
          birth_date?: string | null
          breed?: string | null
          client_id: string
          color?: string | null
          created_at?: string
          hospital_id: string
          id?: string
          initials?: string | null
          microchip?: string | null
          pet_name: string
          sex?: string | null
          spayed_or_neutered?: string | null
          species?: string | null
        }
        Update: {
          birth_date?: string | null
          breed?: string | null
          client_id?: string
          color?: string | null
          created_at?: string
          hospital_id?: string
          id?: string
          initials?: string | null
          microchip?: string | null
          pet_name?: string
          sex?: string | null
          spayed_or_neutered?: string | null
          species?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_v2_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pets_v2_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      pets_unmatched: {
        Row: {
          birth_date: string | null
          breed: string | null
          candidate_client_ids: string[]
          candidate_match_count: number
          cell_phone: string | null
          color: string | null
          email: string | null
          id: string
          initials: string | null
          legacy_hospital_id: number
          microchip: string | null
          owner_name: string | null
          pet_name: string | null
          quarantined_at: string
          sex: string | null
          source_created_at: string | null
          source_pet_id: number
          spayed_or_neutered: string | null
          species: string | null
        }
        Insert: {
          birth_date?: string | null
          breed?: string | null
          candidate_client_ids?: string[]
          candidate_match_count?: number
          cell_phone?: string | null
          color?: string | null
          email?: string | null
          id?: string
          initials?: string | null
          legacy_hospital_id: number
          microchip?: string | null
          owner_name?: string | null
          pet_name?: string | null
          quarantined_at?: string
          sex?: string | null
          source_created_at?: string | null
          source_pet_id: number
          spayed_or_neutered?: string | null
          species?: string | null
        }
        Update: {
          birth_date?: string | null
          breed?: string | null
          candidate_client_ids?: string[]
          candidate_match_count?: number
          cell_phone?: string | null
          color?: string | null
          email?: string | null
          id?: string
          initials?: string | null
          legacy_hospital_id?: number
          microchip?: string | null
          owner_name?: string | null
          pet_name?: string | null
          quarantined_at?: string
          sex?: string | null
          source_created_at?: string | null
          source_pet_id?: number
          spayed_or_neutered?: string | null
          species?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          hospital_id: string | null
          id: string
          is_active: boolean
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          hospital_id?: string | null
          id: string
          is_active?: boolean
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          hospital_id?: string | null
          id?: string
          is_active?: boolean
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          id: string
          hospital_id: string
          client_name: string
          pet_name: string
          phone_number: string
          visit_reason: string
          needs_info_update: boolean
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          hospital_id: string
          client_name: string
          pet_name: string
          phone_number: string
          visit_reason: string
          needs_info_update?: boolean
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          hospital_id?: string
          client_name?: string
          pet_name?: string
          phone_number?: string
          visit_reason?: string
          needs_info_update?: boolean
          resolved_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_client_with_pet: {
        Args: { p_client: Json; p_pet: Json }
        Returns: Json
      }
      create_pet_for_client: { Args: { p_pet: Json }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
