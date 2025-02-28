export interface User {
  id: string;
  email: string;
  full_name: string | null;
  user_type: string;
  created_at: string | null;
  is_active: boolean | null;
  avatar_url: string | null;
  last_active: string | null;
}

export interface Customer {
  id: string;
  name: string;
  logo_url?: string;
  user_id: string;
  created_at: string;
  customer_rates?: Array<{
    hourly_rate: number;
    currency: string;
  }>;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  customer_id: string;
  user_id: string;
  customer?: {
    id: string;
    name: string;
    customer_rates?: Array<{
      hourly_rate: number;
      currency: string;
    }>;
  };
  created_at: string;
}

export interface TimeEntry {
  id: string;
  task_name: string;
  project_id?: string;
  duration: number;
  start_time: string;
  description?: string;
  user_id: string;
  project?: {
    id: string;
    name: string;
    color: string;
    customer?: {
      id: string;
      name: string;
      customer_rates?: Array<{
        hourly_rate: number;
        currency: string;
      }>;
    };
  };
  created_at: string;
  tags?: Array<{ id: string; name: string; color: string }>;
}

export interface TimeEntryDisplay {
  id: string;
  taskName: string;
  projectName: string;
  duration: number;
  startTime: string;
  createdAt: string;
  projectColor: string;
}

export type DateRange = {
  from: Date;
  to?: Date;
};
