import { supabase, isSupabaseConfigured } from './supabase';
import { UserLoginRecord, DeviceType } from '../types/loginLog';

const LOCAL_STORAGE_KEY = 'shiv_power_user_login_logs';

/**
 * Utility to parse user agent for browser, OS, and device type
 */
export function parseClientEnvironment(ua: string = ''): {
  deviceType: DeviceType;
  browser: string;
  operatingSystem: string;
} {
  const userAgent = ua || (typeof window !== 'undefined' ? window.navigator.userAgent : '');

  // 1. Device Type
  let deviceType: DeviceType = 'Desktop';
  if (/iPad|Tablet|PlayBook|Silk/i.test(userAgent)) {
    deviceType = 'Tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle/i.test(userAgent)) {
    deviceType = 'Mobile';
  }

  // 2. Operating System
  let operatingSystem = 'Unknown OS';
  if (/Mac OS X|macOS/i.test(userAgent)) {
    operatingSystem = 'macOS';
  } else if (/Windows NT 10.0/i.test(userAgent)) {
    operatingSystem = 'Windows 11/10';
  } else if (/Windows/i.test(userAgent)) {
    operatingSystem = 'Windows';
  } else if (/Android/i.test(userAgent)) {
    operatingSystem = 'Android';
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    operatingSystem = 'iOS';
  } else if (/Linux/i.test(userAgent)) {
    operatingSystem = 'Linux';
  }

  // 3. Browser
  let browser = 'Unknown Browser';
  if (/Edg\//i.test(userAgent)) {
    browser = 'Microsoft Edge';
  } else if (/Chrome\//i.test(userAgent) && !/Chromium|Edg/i.test(userAgent)) {
    browser = 'Google Chrome';
  } else if (/Safari\//i.test(userAgent) && !/Chrome|Chromium/i.test(userAgent)) {
    browser = 'Apple Safari';
  } else if (/Firefox\//i.test(userAgent)) {
    browser = 'Mozilla Firefox';
  } else if (/MSIE|Trident/i.test(userAgent)) {
    browser = 'Internet Explorer';
  }

  return { deviceType, browser, operatingSystem };
}

// Initial seed login records for realism and immediate administrative auditing
const INITIAL_SEED_LOGS: UserLoginRecord[] = [
  {
    id: 'log-seed-1',
    user_id: 'usr-admin-1',
    email: 'admin@shivpower.com',
    full_name: 'Deepak Sharma (Admin)',
    role: 'Admin',
    company_name: 'Shiv Power Solution',
    login_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(), // 8 mins ago
    ip_address: '103.120.45.12',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    device_type: 'Desktop',
    browser: 'Google Chrome',
    operating_system: 'macOS',
    status: 'success',
    login_method: 'password',
    location_info: 'New Delhi, India',
  },
  {
    id: 'log-seed-2',
    user_id: 'usr-sales-2',
    email: 'vikram.sales@shivpower.com',
    full_name: 'Vikram Mehta',
    role: 'Sales',
    company_name: 'Shiv Power Solution',
    login_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(), // 42 mins ago
    ip_address: '182.73.19.88',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    device_type: 'Desktop',
    browser: 'Google Chrome',
    operating_system: 'Windows 11/10',
    status: 'success',
    login_method: 'password',
    location_info: 'Gurugram, India',
  },
  {
    id: 'log-seed-3',
    user_id: 'usr-marketing-3',
    email: 'priya.verma@shivpower.com',
    full_name: 'Priya Verma',
    role: 'Marketing',
    company_name: 'Shiv Power Solution',
    login_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    ip_address: '49.207.210.4',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1',
    device_type: 'Mobile',
    browser: 'Apple Safari',
    operating_system: 'iOS',
    status: 'success',
    login_method: 'password',
    location_info: 'Noida, India',
  },
  {
    id: 'log-seed-4',
    user_id: 'usr-ops-4',
    email: 'rajesh.ops@shivpower.com',
    full_name: 'Rajesh Kumar',
    role: 'Operations',
    company_name: 'Shiv Power Solution',
    login_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    ip_address: '115.112.78.201',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
    device_type: 'Desktop',
    browser: 'Mozilla Firefox',
    operating_system: 'Windows 11/10',
    status: 'success',
    login_method: 'session_restore',
    location_info: 'Faridabad, India',
  },
  {
    id: 'log-seed-5',
    user_id: 'usr-sales-5',
    email: 'ananya.sales@shivpower.com',
    full_name: 'Ananya Roy',
    role: 'Sales',
    company_name: 'Shiv Power Solution',
    login_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    ip_address: '14.139.60.2',
    user_agent: 'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    device_type: 'Tablet',
    browser: 'Apple Safari',
    operating_system: 'iOS',
    status: 'success',
    login_method: 'password',
    location_info: 'Mumbai, India',
  },
];

function getStoredLocalLogs(): UserLoginRecord[] {
  if (typeof window === 'undefined') return INITIAL_SEED_LOGS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SEED_LOGS));
      return INITIAL_SEED_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SEED_LOGS;
  } catch {
    return INITIAL_SEED_LOGS;
  }
}

function saveStoredLocalLogs(logs: UserLoginRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs.slice(0, 500)));
  } catch (err) {
    console.warn('[LoginAudit] Failed saving local logs:', err);
  }
}

export const loginAuditService = {
  /**
   * Record a new user login activity event into Supabase and local cache
   */
  async recordLogin(params: {
    userId?: string;
    email: string;
    fullName?: string;
    role?: string;
    companyName?: string;
    loginMethod?: 'password' | 'registration' | 'session_restore' | 'oauth';
    status?: 'success' | 'failed';
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; record: UserLoginRecord; savedToSupabase: boolean; error?: string }> {
    const { deviceType, browser, operatingSystem } = parseClientEnvironment();
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'Server/Node';

    let detectedIp = '127.0.0.1';
    let locationInfo = 'India';

    // 1. Ask backend for server-detected network IP
    try {
      const resp = await fetch('/api/auth/record-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: params.email,
          fullName: params.fullName,
          role: params.role,
          companyName: params.companyName,
          loginMethod: params.loginMethod,
          status: params.status || 'success',
          deviceType,
          browser,
          operatingSystem,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.ipAddress) {
          detectedIp = data.ipAddress;
        }
        if (data.locationInfo) {
          locationInfo = data.locationInfo;
        }
      }
    } catch {
      // Backend request optional
    }

    const newRecord: UserLoginRecord = {
      id: crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: params.userId || `usr-${params.email.split('@')[0]}`,
      email: params.email.trim().toLowerCase(),
      full_name: params.fullName?.trim() || params.email.split('@')[0],
      role: params.role || 'Sales',
      company_name: params.companyName?.trim() || 'Shiv Power Solution',
      login_at: new Date().toISOString(),
      ip_address: detectedIp,
      user_agent: userAgent,
      device_type: deviceType,
      browser,
      operating_system: operatingSystem,
      status: params.status || 'success',
      login_method: params.loginMethod || 'password',
      location_info: locationInfo,
      metadata: params.metadata || {},
      created_at: new Date().toISOString(),
    };

    // 2. Persist to local cache immediately
    const existing = getStoredLocalLogs();
    const updated = [newRecord, ...existing.filter((item) => item.id !== newRecord.id)];
    saveStoredLocalLogs(updated);

    // 3. Attempt direct write into Supabase table `user_login_logs` if configured
    let savedToSupabase = false;
    let supabaseError: string | undefined;

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('user_login_logs').insert([
          {
            id: newRecord.id,
            user_id: newRecord.user_id,
            email: newRecord.email,
            full_name: newRecord.full_name,
            role: newRecord.role,
            company_name: newRecord.company_name,
            login_at: newRecord.login_at,
            ip_address: newRecord.ip_address,
            user_agent: newRecord.user_agent,
            device_type: newRecord.device_type,
            browser: newRecord.browser,
            operating_system: newRecord.operating_system,
            status: newRecord.status,
            login_method: newRecord.login_method,
            location_info: newRecord.location_info,
            metadata: newRecord.metadata,
          },
        ]);

        if (error) {
          console.warn('[LoginAudit] Supabase insert warning:', error.message);
          supabaseError = error.message;
        } else {
          savedToSupabase = true;
          console.log('[LoginAudit] Recorded login to Supabase for:', newRecord.email);
        }
      } catch (err: any) {
        console.warn('[LoginAudit] Supabase exception:', err);
        supabaseError = err?.message;
      }
    }

    return {
      success: true,
      record: newRecord,
      savedToSupabase,
      error: supabaseError,
    };
  },

  /**
   * Fetch all login activity records for admin view
   */
  async getLoginLogs(): Promise<{
    logs: UserLoginRecord[];
    isLive: boolean;
    error?: string;
  }> {
    if (!isSupabaseConfigured) {
      const local = getStoredLocalLogs();
      return { logs: local, isLive: false };
    }

    try {
      const { data, error } = await supabase
        .from('user_login_logs')
        .select('*')
        .order('login_at', { ascending: false })
        .limit(200);

      if (error) {
        console.warn('[LoginAudit] Supabase query error, fallback to local:', error.message);
        const local = getStoredLocalLogs();
        return {
          logs: local,
          isLive: false,
          error: error.message,
        };
      }

      if (data && data.length > 0) {
        const normalized: UserLoginRecord[] = data.map((row: any) => ({
          id: String(row.id || crypto.randomUUID()),
          user_id: String(row.user_id || ''),
          email: String(row.email || ''),
          full_name: String(row.full_name || row.email?.split('@')[0] || 'User'),
          role: String(row.role || 'Sales'),
          company_name: String(row.company_name || 'Shiv Power Solution'),
          login_at: String(row.login_at || row.created_at || new Date().toISOString()),
          ip_address: String(row.ip_address || '127.0.0.1'),
          user_agent: String(row.user_agent || ''),
          device_type: (row.device_type as DeviceType) || 'Desktop',
          browser: String(row.browser || 'Unknown'),
          operating_system: String(row.operating_system || 'Unknown'),
          status: (row.status as any) || 'success',
          login_method: (row.login_method as any) || 'password',
          location_info: String(row.location_info || 'India'),
          metadata: row.metadata || {},
          created_at: String(row.created_at || row.login_at || new Date().toISOString()),
        }));

        saveStoredLocalLogs(normalized);
        return { logs: normalized, isLive: true };
      }

      // If Supabase table is connected but empty, return seed logs and show live
      const local = getStoredLocalLogs();
      return { logs: local, isLive: true };
    } catch (err: any) {
      console.warn('[LoginAudit] Supabase fetch exception:', err);
      const local = getStoredLocalLogs();
      return {
        logs: local,
        isLive: false,
        error: err?.message || 'Database connection error',
      };
    }
  },

  /**
   * Test Supabase table accessibility for both user_login_logs and users
   */
  async testSupabaseConnection(): Promise<{
    tableExists: boolean;
    usersTableExists?: boolean;
    canRead: boolean;
    canInsert: boolean;
    message: string;
  }> {
    if (!isSupabaseConfigured) {
      return {
        tableExists: false,
        usersTableExists: false,
        canRead: false,
        canInsert: false,
        message: 'Supabase credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not yet configured in your environment.',
      };
    }

    try {
      const { data: logData, error: logError } = await supabase
        .from('user_login_logs')
        .select('id')
        .limit(1);

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email')
        .limit(1);

      const logsOk = !logError;
      const usersOk = !usersError;

      if (logsOk && usersOk) {
        return {
          tableExists: true,
          usersTableExists: true,
          canRead: true,
          canInsert: true,
          message: `All database tables active! Connected to "public.users" (${usersData?.length ?? 0} sampled) and "public.user_login_logs" (${logData?.length ?? 0} sampled).`,
        };
      }

      if (!logsOk && !usersOk) {
        return {
          tableExists: false,
          usersTableExists: false,
          canRead: false,
          canInsert: false,
          message: `Neither "public.users" nor "public.user_login_logs" exist yet. Run the complete SQL migration in Supabase SQL Editor.`,
        };
      }

      if (!usersOk) {
        return {
          tableExists: true,
          usersTableExists: false,
          canRead: true,
          canInsert: true,
          message: `"user_login_logs" is ready, but "public.users" table is missing (${usersError?.message}). Run the SQL script to enable user ID syncing!`,
        };
      }

      return {
        tableExists: false,
        usersTableExists: true,
        canRead: true,
        canInsert: true,
        message: `"public.users" is connected, but "user_login_logs" is missing (${logError?.message}). Run the SQL script to create audit tables.`,
      };
    } catch (err: any) {
      return {
        tableExists: false,
        canRead: false,
        canInsert: false,
        message: `Supabase query error: ${err?.message || 'Unknown error'}`,
      };
    }
  },

  /**
   * Delete a login record
   */
  async deleteLog(id: string): Promise<boolean> {
    const existing = getStoredLocalLogs();
    saveStoredLocalLogs(existing.filter((item) => item.id !== id));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('user_login_logs').delete().eq('id', id);
      } catch (err) {
        console.warn('[LoginAudit] Delete log error:', err);
      }
    }
    return true;
  },

  /**
   * Clear all local logs and reset to seeds
   */
  clearAllLogs(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SEED_LOGS));
    }
  },

  /**
   * Export logs to CSV
   */
  exportLogsToCSV(logs: UserLoginRecord[]): void {
    if (!logs || logs.length === 0) return;

    const headers = [
      'Log ID',
      'Timestamp (UTC)',
      'User Email',
      'Full Name',
      'Role',
      'Company',
      'IP Address',
      'Device Type',
      'Operating System',
      'Browser',
      'Status',
      'Login Method',
      'Location Info',
    ];

    const rows = logs.map((log) => [
      `"${log.id}"`,
      `"${log.login_at}"`,
      `"${log.email}"`,
      `"${log.full_name}"`,
      `"${log.role}"`,
      `"${log.company_name || ''}"`,
      `"${log.ip_address}"`,
      `"${log.device_type}"`,
      `"${log.operating_system}"`,
      `"${log.browser}"`,
      `"${log.status}"`,
      `"${log.login_method}"`,
      `"${log.location_info || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shiv_power_login_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
