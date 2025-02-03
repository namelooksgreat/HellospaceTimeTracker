export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          user_id?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          color: string;
          created_at: string;
          user_id: string;
          customer_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          created_at?: string;
          user_id: string;
          customer_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          created_at?: string;
          user_id?: string;
          customer_id?: string;
        };
      };
      time_entries: {
        Row: {
          id: string;
          task_name: string;
          description?: string;
          duration: number;
          start_time: string;
          project_id?: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_name: string;
          description?: string;
          duration: number;
          start_time?: string;
          project_id?: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_name?: string;
          description?: string;
          duration?: number;
          start_time?: string;
          project_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      time_entry_tags: {
        Row: {
          id: string;
          time_entry_id: string;
          tag: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          time_entry_id: string;
          tag: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          time_entry_id?: string;
          tag?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
