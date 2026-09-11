export type DeviceType = 'Desktop' | 'Mobile' | 'Tablet';

export type LoginMethod = 'password' | 'registration' | 'session_restore' | 'oauth';

export type LoginStatus = 'success' | 'failed';

export interface UserLoginRecord {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  company_name?: string;
  login_at: string;
  ip_address: string;
  user_agent: string;
  device_type: DeviceType;
  browser: string;
  operating_system: string;
  status: LoginStatus;
  login_method: LoginMethod;
  location_info?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface LoginLogFilterOptions {
  search?: string;
  role?: string;
  deviceType?: string;
  status?: string;
  timeRange?: 'all' | 'today' | '7days' | '30days';
}
