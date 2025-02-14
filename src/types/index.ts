export interface Customer {
  id: string;
  name: string;
  logo_url?: string | null;
  created_at: string;
  user_id: string;
  projects?: Project[];
  customer_rates?: Array<{
    hourly_rate: number;
    currency: string;
  }>;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  created_at: string;
  user_id: string;
  customer_id: string;
  customer?: Customer;
}

export interface TimeEntry {
  id: string;
  task_name: string;
  description?: string | null;
  duration: number;
  start_time: string;
  created_at: string;
  user_id: string;
  project_id?: string | null;
  project?: {
    id: string;
    name: string;
    color: string;
    customer?: {
      id: string;
      name: string;
    };
  } | null;
}

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  role?: string | null;
  created_at: string;
}
