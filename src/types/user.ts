export type UserRole =
  | 'Admin'
  | 'Manager'
  | 'Sales'
  | 'Marketing'
  | 'Operations'
  | 'Viewer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  department?: string;
  password?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserFormData {
  email: string;
  full_name: string;
  phone?: string;
  role?: UserRole;
  department?: string;
  password?: string;
  is_active?: boolean;
}
