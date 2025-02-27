export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customer_balances: {
        Row: {
          balance: number | null
          customer_id: string
          total_amount: number | null
          total_paid: number | null
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          customer_id: string
          total_amount?: number | null
          total_paid?: number | null
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          customer_id?: string
          total_amount?: number | null
          total_paid?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_balances_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_payments: {
        Row: {
          amount: number
          created_at: string | null
          customer_id: string | null
          description: string | null
          id: string
          payment_date: string | null
          payment_method: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          payment_date?: string | null
          payment_method: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          payment_date?: string | null
          payment_method?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_rates: {
        Row: {
          created_at: string | null
          currency: string | null
          customer_id: string | null
          hourly_rate: number
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          hourly_rate: number
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          hourly_rate?: number
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_rates_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_users: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_users_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      developer_rates: {
        Row: {
          created_at: string | null
          currency: string
          hourly_rate: number
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string
          hourly_rate: number
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string
          hourly_rate?: number
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string | null
          created_by: string
          email: string
          expires_at: string
          id: string
          metadata: Json | null
          role: string
          token: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          email: string
          expires_at: string
          id?: string
          metadata?: Json | null
          role?: string
          token: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      project_members: {
        Row: {
          created_at: string
          id: string
          project_id: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          project_id?: string | null
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          color: string
          created_at: string
          customer_id: string | null
          icon: string | null
          id: string
          name: string
          status: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          customer_id?: string | null
          icon?: string | null
          id?: string
          name: string
          status?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          customer_id?: string | null
          icon?: string | null
          id?: string
          name?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string
          description: string | null
          duration: number
          id: string
          project_id: string | null
          start_time: string
          task_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration: number
          id?: string
          project_id?: string | null
          start_time?: string
          task_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          project_id?: string | null
          start_time?: string
          task_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entry_tags: {
        Row: {
          created_at: string
          id: string
          tag: string
          time_entry_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tag: string
          time_entry_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tag?: string
          time_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entry_tags_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      timer_states: {
        Row: {
          customer_id: string | null
          id: string
          last_synced: string | null
          project_id: string | null
          start_time: string | null
          state: string
          task_name: string | null
          time: number
          user_id: string
        }
        Insert: {
          customer_id?: string | null
          id?: string
          last_synced?: string | null
          project_id?: string | null
          start_time?: string | null
          state: string
          task_name?: string | null
          time?: number
          user_id: string
        }
        Update: {
          customer_id?: string | null
          id?: string
          last_synced?: string | null
          project_id?: string | null
          start_time?: string | null
          state?: string
          task_name?: string | null
          time?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timer_states_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timer_states_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_customers: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_customers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_projects: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          auto_stop_timer: number | null
          created_at: string | null
          currency: string | null
          default_rate: number | null
          email_notifications: boolean | null
          id: string
          time_format: string | null
          updated_at: string | null
          user_id: string | null
          week_starts_on: string | null
        }
        Insert: {
          auto_stop_timer?: number | null
          created_at?: string | null
          currency?: string | null
          default_rate?: number | null
          email_notifications?: boolean | null
          id?: string
          time_format?: string | null
          updated_at?: string | null
          user_id?: string | null
          week_starts_on?: string | null
        }
        Update: {
          auto_stop_timer?: number | null
          created_at?: string | null
          currency?: string | null
          default_rate?: number | null
          email_notifications?: boolean | null
          id?: string
          time_format?: string | null
          updated_at?: string | null
          user_id?: string | null
          week_starts_on?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          user_type?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          user_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      change_user_password: {
        Args: {
          user_id: string
          new_password: string
        }
        Returns: undefined
      }
      check_invitation_token: {
        Args: {
          p_token: string
        }
        Returns: {
          is_valid: boolean
          email: string
          role: string
          metadata: Json
        }[]
      }
      create_bug_reports_bucket: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      deactivate_user: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      initialize_customer_balance: {
        Args: {
          p_customer_id: string
        }
        Returns: undefined
      }
      update_customer_balance: {
        Args: {
          p_customer_id: string
          p_amount: number
        }
        Returns: undefined
      }
      update_customer_total_amount: {
        Args: {
          p_customer_id: string
          p_amount: number
        }
        Returns: undefined
      }
      update_user_associations: {
        Args: {
          p_user_id: string
          p_customer_ids: string[]
          p_project_ids: string[]
        }
        Returns: undefined
      }
    }
    Enums: {
      user_role:
        | "frontend_developer"
        | "backend_developer"
        | "fullstack_developer"
        | "designer"
        | "product_manager"
        | "project_manager"
      user_type: "admin" | "customer" | "developer" | "designer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
