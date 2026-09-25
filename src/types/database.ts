import { ScheduleCategory, RepeatType, RepeatConfig } from './schedule';
import { AssignmentStatus } from './assignment';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      schedules: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          category: ScheduleCategory;
          start_date: string;
          start_time: string;
          end_time: string;
          repeat_type: RepeatType;
          repeat_config: RepeatConfig | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          category: ScheduleCategory;
          start_date: string;
          start_time: string;
          end_time: string;
          repeat_type?: RepeatType;
          repeat_config?: RepeatConfig | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          category?: ScheduleCategory;
          start_date?: string;
          start_time?: string;
          end_time?: string;
          repeat_type?: RepeatType;
          repeat_config?: RepeatConfig | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "schedules_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      assignments: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          course_name: string | null;
          due_date: string;
          due_time: string;
          estimated_duration_minutes: number;
          category: ScheduleCategory;
          status: AssignmentStatus;
          notes: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          course_name?: string | null;
          due_date: string;
          due_time?: string;
          estimated_duration_minutes?: number;
          category: ScheduleCategory;
          status?: AssignmentStatus;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          course_name?: string | null;
          due_date?: string;
          due_time?: string;
          estimated_duration_minutes?: number;
          category?: ScheduleCategory;
          status?: AssignmentStatus;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assignments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          last_used_at: string | null;
          created_at: string;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          last_used_at?: string | null;
          created_at?: string;
          revoked_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          key_hash?: string;
          key_prefix?: string;
          last_used_at?: string | null;
          created_at?: string;
          revoked_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "api_keys_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
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
}
