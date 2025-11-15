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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      email_campaign_recipients: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          created_at: string
          error_message: string | null
          id: string
          opened_at: string | null
          prospect_id: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          prospect_id: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          prospect_id?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaign_recipients_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      prospect_groups: {
        Row: {
          created_at: string
          group_id: string
          id: string
          prospect_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          prospect_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          prospect_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospect_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospect_groups_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          click_count: number | null
          company: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          last_click_at: string | null
          notes: string | null
          phone: string | null
          source: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          click_count?: number | null
          company?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          last_click_at?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          click_count?: number | null
          company?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          last_click_at?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webinar_invitations: {
        Row: {
          created_at: string | null
          id: string
          joined_at: string | null
          opened_at: string | null
          prospect_id: string
          status: string | null
          webinar_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          opened_at?: string | null
          prospect_id: string
          status?: string | null
          webinar_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          opened_at?: string | null
          prospect_id?: string
          status?: string | null
          webinar_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webinar_invitations_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webinar_invitations_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      webinar_messages: {
        Row: {
          created_at: string | null
          id: string
          is_host: boolean | null
          message: string
          sender_email: string
          sender_name: string
          webinar_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_host?: boolean | null
          message: string
          sender_email: string
          sender_name: string
          webinar_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_host?: boolean | null
          message?: string
          sender_email?: string
          sender_name?: string
          webinar_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webinar_messages_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      webinars: {
        Row: {
          commercial_cta_link: string | null
          commercial_cta_text: string | null
          commercial_description: string | null
          commercial_title: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          scheduled_at: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
          viewer_link: string
        }
        Insert: {
          commercial_cta_link?: string | null
          commercial_cta_text?: string | null
          commercial_description?: string | null
          commercial_title?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          scheduled_at: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
          viewer_link?: string
        }
        Update: {
          commercial_cta_link?: string | null
          commercial_cta_text?: string | null
          commercial_description?: string | null
          commercial_title?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          scheduled_at?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          viewer_link?: string
        }
        Relationships: [
          {
            foreignKeyName: "webinars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
