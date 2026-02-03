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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_vet_consultations: {
        Row: {
          additional_notes: string | null
          additional_symptoms: string[] | null
          created_at: string
          duration: string
          full_response: string | null
          id: string
          main_symptom: string
          pet_id: string
          severity: string
          summary: string | null
          urgency_level: string | null
          user_id: string
        }
        Insert: {
          additional_notes?: string | null
          additional_symptoms?: string[] | null
          created_at?: string
          duration: string
          full_response?: string | null
          id?: string
          main_symptom: string
          pet_id: string
          severity: string
          summary?: string | null
          urgency_level?: string | null
          user_id: string
        }
        Update: {
          additional_notes?: string | null
          additional_symptoms?: string[] | null
          created_at?: string
          duration?: string
          full_response?: string | null
          id?: string
          main_symptom?: string
          pet_id?: string
          severity?: string
          summary?: string | null
          urgency_level?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_vet_consultations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          id: string
          linked_visit_id: string | null
          merchant: string | null
          notes: string | null
          pet_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          id?: string
          linked_visit_id?: string | null
          merchant?: string | null
          notes?: string | null
          pet_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          linked_visit_id?: string | null
          merchant?: string | null
          notes?: string | null
          pet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_linked_visit_id_fkey"
            columns: ["linked_visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          created_at: string
          date: string
          id: string
          name: string
          next_due_date: string | null
          notes: string | null
          pet_id: string
          type: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          name: string
          next_due_date?: string | null
          notes?: string | null
          pet_id: string
          type: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          name?: string
          next_due_date?: string | null
          notes?: string | null
          pet_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_records_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_checkins: {
        Row: {
          check_in_date: string
          created_at: string
          id: string
          pet_id: string
          photo_url: string
          user_id: string
        }
        Insert: {
          check_in_date?: string
          created_at?: string
          id?: string
          pet_id: string
          photo_url: string
          user_id: string
        }
        Update: {
          check_in_date?: string
          created_at?: string
          id?: string
          pet_id?: string
          photo_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_checkins_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_tasks: {
        Row: {
          category: Database["public"]["Enums"]["task_category"]
          created_at: string
          description: string | null
          due_date: string
          id: string
          interval_days: number | null
          last_completed_at: string | null
          pet_id: string
          recurrence_type: Database["public"]["Enums"]["task_recurrence"]
          status: Database["public"]["Enums"]["task_status"]
          template_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["task_category"]
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          interval_days?: number | null
          last_completed_at?: string | null
          pet_id: string
          recurrence_type?: Database["public"]["Enums"]["task_recurrence"]
          status?: Database["public"]["Enums"]["task_status"]
          template_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["task_category"]
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          interval_days?: number | null
          last_completed_at?: string | null
          pet_id?: string
          recurrence_type?: Database["public"]["Enums"]["task_recurrence"]
          status?: Database["public"]["Enums"]["task_status"]
          template_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_tasks_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          avatar_url: string | null
          birthdate: string | null
          breed: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          sex: string | null
          species: string
          user_id: string
          weight: number | null
        }
        Insert: {
          avatar_url?: string | null
          birthdate?: string | null
          breed?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          sex?: string | null
          species: string
          user_id: string
          weight?: number | null
        }
        Update: {
          avatar_url?: string | null
          birthdate?: string | null
          breed?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          sex?: string | null
          species?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          language: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          id: string
          language?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          language?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          due_date: string
          id: string
          pet_id: string | null
          source_id: string | null
          source_type: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date: string
          id?: string
          pet_id?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          pet_id?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      slideshows: {
        Row: {
          created_at: string
          date_range_end: string | null
          date_range_start: string | null
          id: string
          music_track: string
          pet_id: string | null
          slideshow_type: string
          status: string
          title: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          id?: string
          music_track?: string
          pet_id?: string | null
          slideshow_type?: string
          status?: string
          title: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          id?: string
          music_track?: string
          pet_id?: string | null
          slideshow_type?: string
          status?: string
          title?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slideshows_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          category: Database["public"]["Enums"]["task_category"]
          created_at: string
          default_due_offset_days: number
          description: string | null
          id: string
          interval_days: number | null
          is_active: boolean
          recurrence_type: Database["public"]["Enums"]["task_recurrence"]
          species: Database["public"]["Enums"]["task_species"]
          title: string
        }
        Insert: {
          category: Database["public"]["Enums"]["task_category"]
          created_at?: string
          default_due_offset_days?: number
          description?: string | null
          id?: string
          interval_days?: number | null
          is_active?: boolean
          recurrence_type?: Database["public"]["Enums"]["task_recurrence"]
          species: Database["public"]["Enums"]["task_species"]
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["task_category"]
          created_at?: string
          default_due_offset_days?: number
          description?: string | null
          id?: string
          interval_days?: number | null
          is_active?: boolean
          recurrence_type?: Database["public"]["Enums"]["task_recurrence"]
          species?: Database["public"]["Enums"]["task_species"]
          title?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          clinic_name: string
          created_at: string
          diagnosis: string | null
          id: string
          invoice_photo_url: string | null
          notes: string | null
          pet_id: string
          reason: string
          total_cost: number | null
          treatment: string | null
          visit_date: string
        }
        Insert: {
          clinic_name: string
          created_at?: string
          diagnosis?: string | null
          id?: string
          invoice_photo_url?: string | null
          notes?: string | null
          pet_id: string
          reason: string
          total_cost?: number | null
          treatment?: string | null
          visit_date: string
        }
        Update: {
          clinic_name?: string
          created_at?: string
          diagnosis?: string | null
          id?: string
          invoice_photo_url?: string | null
          notes?: string | null
          pet_id?: string
          reason?: string
          total_cost?: number | null
          treatment?: string | null
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      task_category: "health" | "grooming" | "activity" | "training" | "admin"
      task_recurrence:
        | "one_time"
        | "daily"
        | "weekly"
        | "monthly"
        | "interval_days"
      task_species: "dog" | "cat"
      task_status: "active" | "done"
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
    Enums: {
      task_category: ["health", "grooming", "activity", "training", "admin"],
      task_recurrence: [
        "one_time",
        "daily",
        "weekly",
        "monthly",
        "interval_days",
      ],
      task_species: ["dog", "cat"],
      task_status: ["active", "done"],
    },
  },
} as const
