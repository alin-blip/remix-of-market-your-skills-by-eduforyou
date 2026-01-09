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
      ai_outputs: {
        Row: {
          created_at: string | null
          id: string
          input_json: Json | null
          output_json: Json | null
          prompt_version: string | null
          tool: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          input_json?: Json | null
          output_json?: Json | null
          prompt_version?: string | null
          tool: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          input_json?: Json | null
          output_json?: Json | null
          prompt_version?: string | null
          tool?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ikigai_results: {
        Row: {
          created_at: string | null
          id: string
          ikigai_statements: Json | null
          service_angles: Json | null
          updated_at: string | null
          user_id: string
          what_world_needs: Json | null
          what_you_can_be_paid_for: Json | null
          what_you_love: Json | null
          what_youre_good_at: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ikigai_statements?: Json | null
          service_angles?: Json | null
          updated_at?: string | null
          user_id: string
          what_world_needs?: Json | null
          what_you_can_be_paid_for?: Json | null
          what_you_love?: Json | null
          what_youre_good_at?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ikigai_statements?: Json | null
          service_angles?: Json | null
          updated_at?: string | null
          user_id?: string
          what_world_needs?: Json | null
          what_you_can_be_paid_for?: Json | null
          what_you_love?: Json | null
          what_youre_good_at?: Json | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          created_at: string | null
          id: string
          premium_package: Json | null
          pricing_justification: string | null
          smv: string | null
          standard_package: Json | null
          starter_package: Json | null
          target_market: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          premium_package?: Json | null
          pricing_justification?: string | null
          smv?: string | null
          standard_package?: Json | null
          starter_package?: Json | null
          target_market?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          premium_package?: Json | null
          pricing_justification?: string | null
          smv?: string | null
          standard_package?: Json | null
          starter_package?: Json | null
          target_market?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      outreach_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          platform: string
          sequence_order: number | null
          subject: string | null
          template_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          platform: string
          sequence_order?: number | null
          subject?: string | null
          template_type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          platform?: string
          sequence_order?: number | null
          subject?: string | null
          template_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          freedom_score: number | null
          full_name: string | null
          goals: Json | null
          id: string
          interests: Json | null
          locale: string | null
          onboarding_completed: boolean | null
          projects_experience: string | null
          role: Database["public"]["Enums"]["user_role"]
          study_field: string | null
          updated_at: string | null
          values: Json | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          freedom_score?: number | null
          full_name?: string | null
          goals?: Json | null
          id: string
          interests?: Json | null
          locale?: string | null
          onboarding_completed?: boolean | null
          projects_experience?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          study_field?: string | null
          updated_at?: string | null
          values?: Json | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          freedom_score?: number | null
          full_name?: string | null
          goals?: Json | null
          id?: string
          interests?: Json | null
          locale?: string | null
          onboarding_completed?: boolean | null
          projects_experience?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          study_field?: string | null
          updated_at?: string | null
          values?: Json | null
          verified?: boolean | null
        }
        Relationships: []
      }
      skill_entries: {
        Row: {
          category: string
          confidence: number | null
          created_at: string | null
          description: string | null
          evidence_links: Json | null
          id: string
          skill: string
          user_id: string
        }
        Insert: {
          category: string
          confidence?: number | null
          created_at?: string | null
          description?: string | null
          evidence_links?: Json | null
          id?: string
          skill: string
          user_id: string
        }
        Update: {
          category?: string
          confidence?: number | null
          created_at?: string | null
          description?: string | null
          evidence_links?: Json | null
          id?: string
          skill?: string
          user_id?: string
        }
        Relationships: []
      }
      verifications: {
        Row: {
          admin_id: string | null
          created_at: string | null
          document_type: string | null
          document_url: string | null
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["verification_status"] | null
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          document_type?: string | null
          document_url?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          user_id: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          document_type?: string | null
          document_url?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      user_role: "student" | "admin" | "mentor"
      verification_status: "pending" | "approved" | "rejected"
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
      user_role: ["student", "admin", "mentor"],
      verification_status: ["pending", "approved", "rejected"],
    },
  },
} as const
