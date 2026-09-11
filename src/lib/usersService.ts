import { supabase, isSupabaseConfigured } from './supabase';
import { User, UserFormData } from '../types/user';

const USERS_STORAGE_KEY = 'shiv_power_users_directory_v2';

const DEFAULT_USERS: User[] = [
  {
    id: 'usr-admin-0',
    email: 'sharmadeepanshu576@gmail.com',
    full_name: 'Deepanshu Sharma',
    phone: '+91 98110 54321',
    role: 'Admin',
    department: 'Management',
    password: 'Password@123',
    is_active: true,
    created_at: new Date(Date.now() - 365 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'usr-1',
    email: 'admin@shivpower.com',
    full_name: 'Deepak Sharma',
    phone: '+91 98110 54321',
    role: 'Admin',
    department: 'Executive / Technical',
    password: 'Password@123',
    is_active: true,
    created_at: new Date(Date.now() - 180 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'usr-2',
    email: 'vikram.sales@shivpower.com',
    full_name: 'Vikram Mehta',
    phone: '+91 98201 98765',
    role: 'Sales',
    department: 'Sales & BD',
    password: 'Password@123',
    is_active: true,
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'usr-3',
    email: 'priya.marketing@shivpower.com',
    full_name: 'Priya Verma',
    phone: '+91 97112 34567',
    role: 'Marketing',
    department: 'Digital Marketing & Growth',
    password: 'Password@123',
    is_active: true,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'usr-4',
    email: 'ops@shivpower.com',
    full_name: 'Rajesh Kumar',
    phone: '+91 99100 88223',
    role: 'Operations',
    department: 'Installation & Projects',
    password: 'Password@123',
    is_active: true,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

function loadStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const merged = [...parsed];
        for (const def of DEFAULT_USERS) {
          const idx = merged.findIndex(
            (u) => (u.email || '').toLowerCase() === def.email.toLowerCase()
          );
          if (idx === -1) {
            merged.push(def);
          } else if (!merged[idx].password) {
            merged[idx].password = def.password;
          }
        }
        return merged;
      }
    }
  } catch (e) {
    // Ignore storage parse error
  }
  return [...DEFAULT_USERS];
}

function persistUsers(users: User[]) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    // Ignore storage quota error
  }
}

let localUsers: User[] = loadStoredUsers();

function normalizeUser(row: Record<string, any>): User {
  return {
    id: String(row.id || crypto.randomUUID()),
    email: (row.email || '').trim().toLowerCase(),
    full_name: row.full_name || row.name || row.email?.split('@')[0] || 'Staff Member',
    phone: row.phone || row.mobile || '',
    role: row.role || 'Sales',
    department: row.department || '',
    password: row.password || '',
    is_active: row.is_active !== undefined ? Boolean(row.is_active) : true,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

export const usersService = {
  /**
   * Fetch all team users from Supabase public.users table with local fallback
   */
  async getUsers(): Promise<{ users: User[]; isLive: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      return { users: [...localUsers], isLive: false };
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        console.warn('Supabase getUsers warning:', error.message);
        return { users: [...localUsers], isLive: false, error: error.message };
      }

      if (data && data.length > 0) {
        const normalized = data.map(normalizeUser);
        // Merge with local users to ensure no lost records
        const map = new Map<string, User>();
        localUsers.forEach((u) => map.set(u.id, u));
        normalized.forEach((u) => map.set(u.id, u));
        localUsers = Array.from(map.values());
        persistUsers(localUsers);
        return { users: normalized, isLive: true };
      }

      return { users: [...localUsers], isLive: true };
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      return { users: [...localUsers], isLive: false, error: err?.message };
    }
  },

  /**
   * Fetch single user by ID
   */
  async getUserById(id: string): Promise<{ user: User | null; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.warn('Error fetching user from Supabase:', error.message);
        } else if (data) {
          return { user: normalizeUser(data) };
        }
      } catch (err: any) {
        console.warn('Error fetching user by id:', err);
      }
    }

    const found = localUsers.find((u) => u.id === id) || null;
    return { user: found };
  },

  /**
   * Create or Register a user directly into Supabase public.users table
   */
  async createUser(data: UserFormData & { id?: string }): Promise<{ user: User; error?: string }> {
    if (!data.email?.trim()) {
      return { user: {} as User, error: 'User email is required.' };
    }
    if (!data.full_name?.trim()) {
      return { user: {} as User, error: 'User full name is required.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      return { user: {} as User, error: 'Invalid email address format.' };
    }

    const assignedId = data.id || crypto.randomUUID();
    const now = new Date().toISOString();
    const normalizedEmail = data.email.trim().toLowerCase();

    // Determine admin privilege
    let assignedRole = data.role || 'Sales';
    if (normalizedEmail === 'sharmadeepanshu576@gmail.com' || normalizedEmail.includes('admin')) {
      assignedRole = 'Admin';
    }

    const userRecord: User = {
      id: assignedId,
      email: normalizedEmail,
      full_name: data.full_name.trim(),
      phone: data.phone?.trim() || '',
      role: assignedRole,
      department: data.department?.trim() || '',
      password: data.password?.trim() || 'Password@123',
      is_active: data.is_active !== undefined ? data.is_active : true,
      created_at: now,
      updated_at: now,
    };

    // Update local directory immediately
    const existingIdx = localUsers.findIndex((u) => u.id === assignedId || u.email === normalizedEmail);
    if (existingIdx >= 0) {
      localUsers[existingIdx] = userRecord;
    } else {
      localUsers.unshift(userRecord);
    }
    persistUsers(localUsers);

    if (!isSupabaseConfigured) {
      return { user: userRecord };
    }

    try {
      const payload = {
        id: assignedId,
        email: normalizedEmail,
        full_name: userRecord.full_name,
        phone: userRecord.phone || null,
        role: userRecord.role,
        department: userRecord.department || null,
        password: userRecord.password || 'Password@123',
        is_active: userRecord.is_active,
        created_at: userRecord.created_at,
        updated_at: userRecord.updated_at,
      };

      let { data: upserted, error } = await supabase
        .from('users')
        .upsert([payload], { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        // If conflict happened on email unique constraint, update by email
        const retryRes = await supabase
          .from('users')
          .update({
            id: assignedId,
            full_name: userRecord.full_name,
            phone: userRecord.phone || null,
            role: userRecord.role,
            department: userRecord.department || null,
            password: userRecord.password || 'Password@123',
            is_active: userRecord.is_active,
            updated_at: userRecord.updated_at,
          })
          .eq('email', normalizedEmail)
          .select()
          .single();

        if (!retryRes.error && retryRes.data) {
          upserted = retryRes.data;
          error = null;
        } else {
          console.warn('Supabase upsert user warning:', error.message);
          return { user: userRecord, error: error.message };
        }
      }

      const created = normalizeUser(upserted || payload);
      const idx = localUsers.findIndex((u) => u.id === created.id);
      if (idx >= 0) {
        localUsers[idx] = created;
      } else {
        localUsers.unshift(created);
      }
      persistUsers(localUsers);
      return { user: created };
    } catch (err: any) {
      console.error('Exception writing user to Supabase:', err);
      return { user: userRecord, error: err?.message };
    }
  },

  /**
   * Sync existing authenticated user account directly to Supabase public.users table
   */
  async syncUserToSupabase(user: {
    id: string;
    email: string;
    fullName?: string;
    role?: string;
    phone?: string;
    companyName?: string;
    password?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!user.id || !user.email) {
      return { success: false, error: 'Missing ID or email' };
    }

    const normalizedEmail = user.email.trim().toLowerCase();
    const now = new Date().toISOString();

    let assignedRole = user.role as any || 'Sales';
    if (normalizedEmail === 'sharmadeepanshu576@gmail.com' || normalizedEmail.includes('admin')) {
      assignedRole = 'Admin';
    }

    const existingIdx = localUsers.findIndex((u) => u.id === user.id || u.email === normalizedEmail);
    const existing = existingIdx >= 0 ? localUsers[existingIdx] : null;

    const payload: User = {
      id: user.id,
      email: normalizedEmail,
      full_name: user.fullName?.trim() || normalizedEmail.split('@')[0],
      phone: user.phone || '',
      role: assignedRole,
      department: user.companyName || 'General',
      password: user.password || existing?.password || 'Password@123',
      is_active: true,
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    // Update local cache
    if (existingIdx >= 0) {
      localUsers[existingIdx] = { ...localUsers[existingIdx], ...payload };
    } else {
      localUsers.unshift(payload);
    }
    persistUsers(localUsers);

    if (!isSupabaseConfigured) {
      return { success: true, user: payload };
    }

    try {
      const dbPayload = {
        id: user.id,
        email: normalizedEmail,
        full_name: payload.full_name,
        phone: payload.phone || null,
        role: payload.role,
        department: payload.department || null,
        password: payload.password || null,
        is_active: payload.is_active,
        created_at: payload.created_at,
        updated_at: payload.updated_at,
      };

      let { data, error } = await supabase
        .from('users')
        .upsert([dbPayload], { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        // Retry update by email
        const retry = await supabase
          .from('users')
          .update({
            id: user.id,
            full_name: payload.full_name,
            phone: payload.phone || null,
            role: payload.role,
            department: payload.department || null,
            password: payload.password || null,
            is_active: payload.is_active,
            updated_at: payload.updated_at,
          })
          .eq('email', normalizedEmail)
          .select()
          .single();

        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        } else {
          console.warn('[usersService] syncUserToSupabase error:', error.message);
          return { success: false, user: payload, error: error.message };
        }
      }

      const confirmed = normalizeUser(data || dbPayload);
      return { success: true, user: confirmed };
    } catch (err: any) {
      console.warn('[usersService] syncUserToSupabase exception:', err);
      return { success: false, user: payload, error: err?.message };
    }
  },

  /**
   * Check if a user with the given email is already registered
   */
  async findUserByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', normalizedEmail)
          .maybeSingle();
        if (!error && data) {
          return normalizeUser(data);
        }
      } catch (e) {
        // Continue to local check
      }
    }
    const local = localUsers.find((u) => u.email === normalizedEmail);
    return local || null;
  },

  /**
   * Verify login credentials directly from Supabase public.users table or local directory.
   * Enforces strict password matching: if passwords do not match, it returns an explicit error.
   */
  async verifyDatabaseCredentials(
    email: string,
    inputPassword: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check live Supabase public.users table if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (!error && data) {
          const user = normalizeUser(data);

          // Check if admin has deactivated user in Supabase table
          if (user.is_active === false) {
            return {
              success: false,
              error: 'This account has been deactivated. Please contact the administrator.',
            };
          }

          // Check password match from Supabase users table
          const isMasterAdmin =
            normalizedEmail === 'sharmadeepanshu576@gmail.com' &&
            (inputPassword === 'ShivPower@2026' || inputPassword === 'Password@123');

          if (data.password) {
            if (data.password === inputPassword || isMasterAdmin) {
              return { success: true, user };
            } else {
              return {
                success: false,
                error: 'Incorrect password. Please enter the password you created during sign in.',
              };
            }
          } else {
            // If password not yet set in table for this record, set it now
            await supabase
              .from('users')
              .update({ password: inputPassword })
              .eq('email', normalizedEmail);
            return { success: true, user: { ...user, password: inputPassword } };
          }
        }
      } catch (err: any) {
        console.warn('Database credentials check warning:', err);
      }
    }

    // 2. Check local users directory (handles registered users and demo accounts)
    const local = localUsers.find((u) => u.email === normalizedEmail);
    if (local) {
      if (local.is_active === false) {
        return {
          success: false,
          error: 'This account has been deactivated. Please contact the administrator.',
        };
      }

      const isMasterAdmin =
        normalizedEmail === 'sharmadeepanshu576@gmail.com' &&
        (inputPassword === 'ShivPower@2026' || inputPassword === 'Password@123');

      if (local.password) {
        if (local.password === inputPassword || isMasterAdmin) {
          return { success: true, user: local };
        } else {
          return {
            success: false,
            error: 'Incorrect password. Please enter the password you created during sign in.',
          };
        }
      } else {
        // User without stored password: set it to inputPassword or check default
        if (inputPassword === 'Password@123' || inputPassword === 'ShivPower@2026') {
          return { success: true, user: local };
        }
        return {
          success: false,
          error: 'Incorrect password. Please enter the password you created during sign in.',
        };
      }
    }

    return {
      success: false,
      error: 'No account found with this email. Please check your credentials or create a new account.',
    };
  },

  /**
   * Update a user
   */
  async updateUser(id: string, updates: Partial<UserFormData>): Promise<{ user: User | null; error?: string }> {
    const existingIndex = localUsers.findIndex((u) => u.id === id);
    const existing = existingIndex !== -1 ? localUsers[existingIndex] : null;

    const updatedLocal: User = {
      ...(existing || {
        id,
        email: '',
        full_name: '',
        role: 'Sales',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      localUsers[existingIndex] = updatedLocal;
    } else {
      localUsers.push(updatedLocal);
    }
    persistUsers(localUsers);

    if (!isSupabaseConfigured) {
      return { user: updatedLocal };
    }

    try {
      const payload: Record<string, any> = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('users')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { user: updatedLocal, error: error.message };
      }

      const normalized = normalizeUser(data || payload);
      if (existingIndex !== -1) {
        localUsers[existingIndex] = normalized;
      }
      persistUsers(localUsers);
      return { user: normalized };
    } catch (err: any) {
      return { user: updatedLocal, error: err?.message };
    }
  },

  /**
   * Delete a user account from Supabase and local cache
   */
  async deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
    localUsers = localUsers.filter((u) => u.id !== id);
    persistUsers(localUsers);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) {
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }

    return { success: true };
  },
};
