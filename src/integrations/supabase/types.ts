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
      application_documents: {
        Row: {
          application_id: string
          created_at: string
          document_name: string
          document_type: string
          file_url: string | null
          id: string
          reviewed_at: string | null
          reviewer_notes: string | null
          status: string
          storage_path: string | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          document_name: string
          document_type: string
          file_url?: string | null
          id?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string
          storage_path?: string | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          document_name?: string
          document_type?: string
          file_url?: string | null
          id?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string
          storage_path?: string | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "student_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_notes: {
        Row: {
          application_id: string
          author_id: string
          content: string
          created_at: string
          id: string
          is_internal: boolean | null
          note_type: string
        }
        Insert: {
          application_id: string
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          note_type?: string
        }
        Update: {
          application_id?: string
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          note_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "student_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_steps: {
        Row: {
          application_id: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          phase: string
          status: string
          step_key: string
          step_label: string
          updated_at: string
        }
        Insert: {
          application_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          phase: string
          status?: string
          step_key: string
          step_label: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          phase?: string
          status?: string
          step_key?: string
          step_label?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_steps_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "student_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      badge_definitions: {
        Row: {
          category: string
          color: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          points_reward: number
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          category?: string
          color?: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          name: string
          points_reward?: number
          requirement_type: string
          requirement_value?: number
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          points_reward?: number
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      bundle_courses: {
        Row: {
          bundle_id: string
          course_id: string
          created_at: string | null
          id: string
          position: number | null
        }
        Insert: {
          bundle_id: string
          course_id: string
          created_at?: string | null
          id?: string
          position?: number | null
        }
        Update: {
          bundle_id?: string
          course_id?: string
          created_at?: string | null
          id?: string
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bundle_courses_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "course_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_purchases: {
        Row: {
          amount: number
          bundle_id: string
          currency: string | null
          id: string
          purchased_at: string | null
          status: string | null
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          bundle_id: string
          currency?: string | null
          id?: string
          purchased_at?: string | null
          status?: string | null
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bundle_id?: string
          currency?: string | null
          id?: string
          purchased_at?: string | null
          status?: string | null
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_purchases_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "course_bundles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_projects: {
        Row: {
          client_id: string
          created_at: string | null
          currency: string | null
          description: string | null
          end_date: string | null
          id: string
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          last_contact_at: string | null
          name: string
          next_followup_at: string | null
          notes: string | null
          phone: string | null
          source: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_contact_at?: string | null
          name: string
          next_followup_at?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_contact_at?: string | null
          name?: string
          next_followup_at?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      course_bundles: {
        Row: {
          bundle_price: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          is_published: boolean | null
          original_price: number
          slug: string | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          bundle_price: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          original_price: number
          slug?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          bundle_price?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          original_price?: number
          slug?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_free: boolean | null
          position: number
          resources: Json | null
          title: string
          video_storage_path: string | null
          video_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          position?: number
          resources?: Json | null
          title: string
          video_storage_path?: string | null
          video_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          position?: number
          resources?: Json | null
          title?: string
          video_storage_path?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_purchases: {
        Row: {
          amount: number
          course_id: string
          currency: string | null
          id: string
          purchased_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          course_id: string
          currency?: string | null
          id?: string
          purchased_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          course_id?: string
          currency?: string | null
          id?: string
          purchased_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_purchases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          comment: string | null
          course_id: string
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          course_id: string
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          course_id?: string
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          bundle_id: string | null
          category: string | null
          certificate: string | null
          course_type: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          download_url: string | null
          duration_minutes: number | null
          external_url: string | null
          funnel_id: string | null
          id: string
          is_published: boolean | null
          language: string | null
          lessons_count: number | null
          level: string
          platform: string
          prerequisites: string | null
          price: number
          product_type: string | null
          provider: string | null
          recommended_for: string | null
          requires_pro: boolean | null
          sales_page_content: Json | null
          slug: string | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          tags: Json | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          bundle_id?: string | null
          category?: string | null
          certificate?: string | null
          course_type?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          download_url?: string | null
          duration_minutes?: number | null
          external_url?: string | null
          funnel_id?: string | null
          id?: string
          is_published?: boolean | null
          language?: string | null
          lessons_count?: number | null
          level?: string
          platform?: string
          prerequisites?: string | null
          price?: number
          product_type?: string | null
          provider?: string | null
          recommended_for?: string | null
          requires_pro?: boolean | null
          sales_page_content?: Json | null
          slug?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          bundle_id?: string | null
          category?: string | null
          certificate?: string | null
          course_type?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          download_url?: string | null
          duration_minutes?: number | null
          external_url?: string | null
          funnel_id?: string | null
          id?: string
          is_published?: boolean | null
          language?: string | null
          lessons_count?: number | null
          level?: string
          platform?: string
          prerequisites?: string | null
          price?: number
          product_type?: string | null
          provider?: string | null
          recommended_for?: string | null
          requires_pro?: boolean | null
          sales_page_content?: Json | null
          slug?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_documents: {
        Row: {
          content: string
          created_at: string | null
          document_type: string
          id: string
          target_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string | null
          document_type: string
          id?: string
          target_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          document_type?: string
          id?: string
          target_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cv_documents_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "dream100_targets"
            referencedColumns: ["id"]
          },
        ]
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
      dna_quiz_results: {
        Row: {
          answers: Json
          created_at: string
          email: string | null
          followup_sent: boolean
          id: string
          lang: string
          result_type: string
          scores: Json
          user_id: string | null
        }
        Insert: {
          answers?: Json
          created_at?: string
          email?: string | null
          followup_sent?: boolean
          id?: string
          lang?: string
          result_type: string
          scores?: Json
          user_id?: string | null
        }
        Update: {
          answers?: Json
          created_at?: string
          email?: string | null
          followup_sent?: boolean
          id?: string
          lang?: string
          result_type?: string
          scores?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      dream100_targets: {
        Row: {
          ai_analysis: Json | null
          created_at: string | null
          decision_maker_role: string | null
          id: string
          industry: string | null
          kanban_stage: string
          linkedin_url: string | null
          name: string
          notes: string | null
          path_type: string
          reminder_date: string | null
          updated_at: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          created_at?: string | null
          decision_maker_role?: string | null
          id?: string
          industry?: string | null
          kanban_stage?: string
          linkedin_url?: string | null
          name: string
          notes?: string | null
          path_type?: string
          reminder_date?: string | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          created_at?: string | null
          decision_maker_role?: string | null
          id?: string
          industry?: string | null
          kanban_stage?: string
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          path_type?: string
          reminder_date?: string | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      dream100_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          target_id: string
          title: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          target_id: string
          title: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          target_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream100_tasks_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "dream100_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      followup_reminders: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          notes: string | null
          reminder_date: string
          title: string
          user_id: string
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          reminder_date: string
          title: string
          user_id: string
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          reminder_date?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followup_reminders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
      funnels: {
        Row: {
          basic_product_id: string | null
          created_at: string | null
          description: string | null
          free_product_id: string | null
          id: string
          is_active: boolean | null
          name: string
          premium_product_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          basic_product_id?: string | null
          created_at?: string | null
          description?: string | null
          free_product_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          premium_product_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          basic_product_id?: string | null
          created_at?: string | null
          description?: string | null
          free_product_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          premium_product_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funnels_basic_product_fkey"
            columns: ["basic_product_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funnels_free_product_fkey"
            columns: ["free_product_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funnels_premium_product_fkey"
            columns: ["premium_product_id"]
            isOneToOne: false
            referencedRelation: "courses"
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
      leads: {
        Row: {
          converted: boolean | null
          created_at: string | null
          email: string
          funnel_id: string | null
          id: string
          name: string | null
          product_id: string | null
          source: string | null
        }
        Insert: {
          converted?: boolean | null
          created_at?: string | null
          email: string
          funnel_id?: string | null
          id?: string
          name?: string | null
          product_id?: string | null
          source?: string | null
        }
        Update: {
          converted?: boolean | null
          created_at?: string | null
          email?: string
          funnel_id?: string | null
          id?: string
          name?: string | null
          product_id?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_path_courses: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          path_id: string
          position: number | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          path_id: string
          position?: number | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          path_id?: string
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_courses_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          category: string
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_published: boolean | null
          position: number | null
          title: string
        }
        Insert: {
          category: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          position?: number | null
          title: string
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          position?: number | null
          title?: string
        }
        Relationships: []
      }
      lesson_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_notes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_quizzes: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          passing_score: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          passing_score?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          passing_score?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
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
      outreach_sequences: {
        Row: {
          created_at: string | null
          id: string
          messages: Json
          path_type: string
          platform: string
          target_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages?: Json
          path_type?: string
          platform?: string
          target_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          messages?: Json
          path_type?: string
          platform?: string
          target_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outreach_sequences_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "dream100_targets"
            referencedColumns: ["id"]
          },
        ]
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
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          execution_dna: string | null
          freedom_score: number | null
          full_name: string | null
          goals: Json | null
          id: string
          interests: Json | null
          is_eduforyou_member: boolean
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
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          execution_dna?: string | null
          freedom_score?: number | null
          full_name?: string | null
          goals?: Json | null
          id: string
          interests?: Json | null
          is_eduforyou_member?: boolean
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
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          execution_dna?: string | null
          freedom_score?: number | null
          full_name?: string | null
          goals?: Json | null
          id?: string
          interests?: Json | null
          is_eduforyou_member?: boolean
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
      quiz_attempts: {
        Row: {
          answers: Json
          completed_at: string
          id: string
          passed: boolean
          quiz_id: string
          score: number
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string
          id?: string
          passed?: boolean
          quiz_id: string
          score: number
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "lesson_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_option: number
          created_at: string
          id: string
          options: Json
          position: number
          question: string
          quiz_id: string
        }
        Insert: {
          correct_option: number
          created_at?: string
          id?: string
          options?: Json
          position?: number
          question: string
          quiz_id: string
        }
        Update: {
          correct_option?: number
          created_at?: string
          id?: string
          options?: Json
          position?: number
          question?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "lesson_quizzes"
            referencedColumns: ["id"]
          },
        ]
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
      step_feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          step_key: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          step_key: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          step_key?: string
          user_id?: string
        }
        Relationships: []
      }
      student_applications: {
        Row: {
          application_status: string
          assigned_consultant: string | null
          course_choice: string | null
          course_match_status: string | null
          created_at: string
          current_phase: string
          current_step: string
          cv_status: string | null
          documents_status: string | null
          eligibility_status: string | null
          enrollment_confirmed: boolean | null
          finance_status: string | null
          id: string
          offer_status: string | null
          started_at: string
          test_prep_status: string | null
          university_choice: string | null
          university_response: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application_status?: string
          assigned_consultant?: string | null
          course_choice?: string | null
          course_match_status?: string | null
          created_at?: string
          current_phase?: string
          current_step?: string
          cv_status?: string | null
          documents_status?: string | null
          eligibility_status?: string | null
          enrollment_confirmed?: boolean | null
          finance_status?: string | null
          id?: string
          offer_status?: string | null
          started_at?: string
          test_prep_status?: string | null
          university_choice?: string | null
          university_response?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          application_status?: string
          assigned_consultant?: string | null
          course_choice?: string | null
          course_match_status?: string | null
          created_at?: string
          current_phase?: string
          current_step?: string
          cv_status?: string | null
          documents_status?: string | null
          eligibility_status?: string | null
          enrollment_confirmed?: boolean | null
          finance_status?: string | null
          id?: string
          offer_status?: string | null
          started_at?: string
          test_prep_status?: string | null
          university_choice?: string | null
          university_response?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_applications_assigned_consultant_fkey"
            columns: ["assigned_consultant"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_course_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string | null
          id: string
          lesson_id: string | null
          progress_percent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          progress_percent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          progress_percent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_course_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          courses_completed: number
          current_streak: number
          id: string
          last_activity_date: string | null
          lessons_completed: number
          longest_streak: number
          perfect_quizzes: number
          quizzes_passed: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          courses_completed?: number
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          lessons_completed?: number
          longest_streak?: number
          perfect_quizzes?: number
          quizzes_passed?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          courses_completed?: number
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          lessons_completed?: number
          longest_streak?: number
          perfect_quizzes?: number
          quizzes_passed?: number
          total_points?: number
          updated_at?: string
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
      waitlist_applications: {
        Row: {
          admin_notes: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          domain: string | null
          email: string
          freelance_experience: string | null
          full_name: string
          how_heard: string | null
          id: string
          is_eduforyou_member: boolean | null
          objective: string | null
          phone: string | null
          preferred_locale: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          study_field: string | null
        }
        Insert: {
          admin_notes?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          domain?: string | null
          email: string
          freelance_experience?: string | null
          full_name: string
          how_heard?: string | null
          id?: string
          is_eduforyou_member?: boolean | null
          objective?: string | null
          phone?: string | null
          preferred_locale?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          study_field?: string | null
        }
        Update: {
          admin_notes?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          domain?: string | null
          email?: string
          freelance_experience?: string | null
          full_name?: string
          how_heard?: string | null
          id?: string
          is_eduforyou_member?: boolean | null
          objective?: string | null
          phone?: string | null
          preferred_locale?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          study_field?: string | null
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
      quiz_questions_safe: {
        Row: {
          id: string | null
          options: Json | null
          position: number | null
          question: string | null
          quiz_id: string | null
        }
        Insert: {
          id?: string | null
          options?: Json | null
          position?: number | null
          question?: string | null
          quiz_id?: string | null
        }
        Update: {
          id?: string | null
          options?: Json | null
          position?: number | null
          question?: string | null
          quiz_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "lesson_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      award_activity: {
        Args: { p_points: number; p_type: string }
        Returns: undefined
      }
      check_and_award_badges: { Args: never; Returns: Json }
      check_quiz_answer: {
        Args: { p_question_id: string; p_selected_option: number }
        Returns: boolean
      }
      check_waitlist_status: { Args: { check_email: string }; Returns: string }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_app_admin: { Args: never; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      populate_profile_from_waitlist: {
        Args: { user_email: string }
        Returns: undefined
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      submit_quiz: {
        Args: { p_answers: Json; p_quiz_id: string }
        Returns: Json
      }
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
