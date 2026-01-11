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
      daily_tasks: {
        Row: {
          area_key: string | null
          completed_at: string | null
          created_at: string | null
          day_date: string
          day_of_week: string
          description: string | null
          id: string
          is_completed: boolean | null
          linked_goal_id: string | null
          position: number | null
          sprint_id: string | null
          task_type: string
          title: string
          user_id: string
        }
        Insert: {
          area_key?: string | null
          completed_at?: string | null
          created_at?: string | null
          day_date: string
          day_of_week: string
          description?: string | null
          id?: string
          is_completed?: boolean | null
          linked_goal_id?: string | null
          position?: number | null
          sprint_id?: string | null
          task_type: string
          title: string
          user_id: string
        }
        Update: {
          area_key?: string | null
          completed_at?: string | null
          created_at?: string | null
          day_date?: string
          day_of_week?: string
          description?: string | null
          id?: string
          is_completed?: boolean | null
          linked_goal_id?: string | null
          position?: number | null
          sprint_id?: string | null
          task_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_tasks_linked_goal_id_fkey"
            columns: ["linked_goal_id"]
            isOneToOne: false
            referencedRelation: "life_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_tasks_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "weekly_sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_income: {
        Row: {
          amount: number
          client_name: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          gig_id: string | null
          id: string
          payment_date: string
          payment_status: string | null
          platform: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          client_name?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          gig_id?: string | null
          id?: string
          payment_date: string
          payment_status?: string | null
          platform: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          client_name?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          gig_id?: string | null
          id?: string
          payment_date?: string
          payment_status?: string | null
          platform?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelance_income_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      gigs_jobs: {
        Row: {
          category: string | null
          created_at: string | null
          currency: string | null
          description: string
          id: string
          is_published: boolean | null
          location: string | null
          location_type: string | null
          platform: string | null
          platform_listing_url: string | null
          platform_specific_data: Json | null
          price_max: number | null
          price_min: number | null
          price_type: string | null
          published_at: string | null
          skills: Json | null
          source_package: string | null
          swipehire_id: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description: string
          id?: string
          is_published?: boolean | null
          location?: string | null
          location_type?: string | null
          platform?: string | null
          platform_listing_url?: string | null
          platform_specific_data?: Json | null
          price_max?: number | null
          price_min?: number | null
          price_type?: string | null
          published_at?: string | null
          skills?: Json | null
          source_package?: string | null
          swipehire_id?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string
          id?: string
          is_published?: boolean | null
          location?: string | null
          location_type?: string | null
          platform?: string | null
          platform_listing_url?: string | null
          platform_specific_data?: Json | null
          price_max?: number | null
          price_min?: number | null
          price_type?: string | null
          published_at?: string | null
          skills?: Json | null
          source_package?: string | null
          swipehire_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
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
      life_areas: {
        Row: {
          area_key: string
          created_at: string | null
          id: string
          is_active: boolean | null
          position: number | null
          user_id: string
        }
        Insert: {
          area_key: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          position?: number | null
          user_id: string
        }
        Update: {
          area_key?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          position?: number | null
          user_id?: string
        }
        Relationships: []
      }
      life_goals: {
        Row: {
          area_key: string
          created_at: string | null
          current_value: string | null
          description: string | null
          goal_type: string
          id: string
          measurable_result: string | null
          parent_goal_id: string | null
          period: string
          position: number | null
          progress: number | null
          status: string | null
          target_value: string | null
          title: string
          updated_at: string | null
          user_id: string
          vision_image_url: string | null
        }
        Insert: {
          area_key: string
          created_at?: string | null
          current_value?: string | null
          description?: string | null
          goal_type: string
          id?: string
          measurable_result?: string | null
          parent_goal_id?: string | null
          period: string
          position?: number | null
          progress?: number | null
          status?: string | null
          target_value?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          vision_image_url?: string | null
        }
        Update: {
          area_key?: string
          created_at?: string | null
          current_value?: string | null
          description?: string | null
          goal_type?: string
          id?: string
          measurable_result?: string | null
          parent_goal_id?: string | null
          period?: string
          position?: number | null
          progress?: number | null
          status?: string | null
          target_value?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          vision_image_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "life_goals_parent_goal_id_fkey"
            columns: ["parent_goal_id"]
            isOneToOne: false
            referencedRelation: "life_goals"
            referencedColumns: ["id"]
          },
        ]
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
          swipehire_user_id: string | null
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
          swipehire_user_id?: string | null
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
          swipehire_user_id?: string | null
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
      social_profiles: {
        Row: {
          about: string | null
          bio: string | null
          content_pillars: Json | null
          created_at: string
          cta: string | null
          hashtags: Json | null
          headline: string | null
          id: string
          platform: string
          updated_at: string
          user_id: string
          username_suggestions: Json | null
        }
        Insert: {
          about?: string | null
          bio?: string | null
          content_pillars?: Json | null
          created_at?: string
          cta?: string | null
          hashtags?: Json | null
          headline?: string | null
          id?: string
          platform: string
          updated_at?: string
          user_id: string
          username_suggestions?: Json | null
        }
        Update: {
          about?: string | null
          bio?: string | null
          content_pillars?: Json | null
          created_at?: string
          cta?: string | null
          hashtags?: Json | null
          headline?: string | null
          id?: string
          platform?: string
          updated_at?: string
          user_id?: string
          username_suggestions?: Json | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          ai_generations_used: number | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          gigs_used: number | null
          id: string
          plan: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_generations_used?: number | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          gigs_used?: number | null
          id?: string
          plan?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_generations_used?: number | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          gigs_used?: number | null
          id?: string
          plan?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      weekly_sprints: {
        Row: {
          created_at: string | null
          energy_level: number | null
          id: string
          lessons: Json | null
          planned_at: string | null
          reflection: string | null
          reviewed_at: string | null
          updated_at: string | null
          user_id: string
          week_goal: string | null
          week_key: string
          wins: Json | null
        }
        Insert: {
          created_at?: string | null
          energy_level?: number | null
          id?: string
          lessons?: Json | null
          planned_at?: string | null
          reflection?: string | null
          reviewed_at?: string | null
          updated_at?: string | null
          user_id: string
          week_goal?: string | null
          week_key: string
          wins?: Json | null
        }
        Update: {
          created_at?: string | null
          energy_level?: number | null
          id?: string
          lessons?: Json | null
          planned_at?: string | null
          reflection?: string | null
          reviewed_at?: string | null
          updated_at?: string | null
          user_id?: string
          week_goal?: string | null
          week_key?: string
          wins?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_app_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
      user_role: ["student", "admin", "mentor"],
      verification_status: ["pending", "approved", "rejected"],
    },
  },
} as const
