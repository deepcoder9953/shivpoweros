import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Copy,
  Check,
  PlusCircle,
  ShieldCheck,
  Building2,
  Phone,
  Calendar,
  AlertCircle,
  Database,
  CheckCircle2,
  X,
  UserCheck,
  Layers,
  ArrowUpDown,
  Mail,
  Fingerprint,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Trash2,
} from 'lucide-react';
import { User } from '../../types/user';
import { usersService } from '../../lib/usersService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../auth/AuthContext';

export const UserAccountsManagement: React.FC = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(isSupabaseConfigured);
  const [dbError, setDbError] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  // Modals & Feedback
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // New User Form State
  const [formId, setFormId] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<'Admin' | 'Sales' | 'Marketing' | 'Operations'>('Sales');
  const [formPhone, setFormPhone] = useState('');
  const [formDepartment, setFormDepartment] = useState('Sales & BD');
  const [formPassword, setFormPassword] = useState('Password@123');
  const [isSaving, setIsSaving] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [editingPasswordId, setEditingPasswordId] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Load users from Supabase / service
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await usersService.getUsers();
      setUsers(res.users);
      setIsLive(res.isLive);
      setDbError(res.error);
    } catch (err: any) {
      console.error('Failed to load user accounts:', err);
      setDbError(err?.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle Copy ID
  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  // Sync a single user record to Supabase
  const handleSyncSingleUser = async (user: User) => {
    try {
      const res = await usersService.syncUserToSupabase({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        phone: user.phone,
        companyName: user.department,
        password: user.password,
      });

      if (res.success) {
        setSyncFeedback({
          type: 'success',
          message: `User "${user.full_name}" (ID: ${user.id}) successfully confirmed in Supabase public.users!`,
        });
      } else {
        setSyncFeedback({
          type: 'error',
          message: `Sync failed: ${res.error || 'Check Supabase table schema'}`,
        });
      }
      await loadUsers();
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: err?.message || 'Sync error occurred',
      });
    }
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  // Sync All Users to Supabase
  const handleSyncAllUsers = async () => {
    setIsSyncingAll(true);
    setSyncFeedback(null);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const u of users) {
        const res = await usersService.syncUserToSupabase({
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          role: u.role,
          phone: u.phone,
          companyName: u.department,
          password: u.password,
        });
        if (res.success) successCount++;
        else errorCount++;
      }

      await loadUsers();
      if (errorCount === 0) {
        setSyncFeedback({
          type: 'success',
          message: `All ${successCount} user accounts successfully synchronized to Supabase public.users!`,
        });
      } else {
        setSyncFeedback({
          type: 'info',
          message: `Synchronized ${successCount} users to Supabase. (${errorCount} notices)`,
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: `Sync error: ${err?.message || 'Database connection error'}`,
      });
    } finally {
      setIsSyncingAll(false);
      setTimeout(() => setSyncFeedback(null), 6000);
    }
  };

  // Toggle user active / deactivated state
  const handleToggleStatus = async (user: User) => {
    try {
      const nextActive = !user.is_active;
      const res = await usersService.updateUser(user.id, { is_active: nextActive });
      if (res.user) {
        setSyncFeedback({
          type: 'success',
          message: `User ${user.full_name} is now ${nextActive ? 'Active' : 'Deactivated in Supabase panel'}.`,
        });
        await loadUsers();
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: `Status update error: ${err?.message}`,
      });
    }
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // Save new password for a user
  const handleSavePassword = async (userId: string) => {
    if (!newPasswordInput || newPasswordInput.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    try {
      const res = await usersService.updateUser(userId, { password: newPasswordInput.trim() });
      if (res.user) {
        setSyncFeedback({
          type: 'success',
          message: `Password updated in Supabase public.users table! User can now sign in with this new password.`,
        });
        setEditingPasswordId(null);
        setNewPasswordInput('');
        await loadUsers();
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: `Password update failed: ${err?.message}`,
      });
    }
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  // Delete user account
  const handleDeleteUser = async (user: User) => {
    if (user.email.toLowerCase() === 'sharmadeepanshu576@gmail.com') {
      alert('Cannot delete primary Admin account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${user.full_name}" (${user.email})?`)) {
      return;
    }
    try {
      const res = await usersService.deleteUser(user.id);
      if (res.success) {
        setSyncFeedback({
          type: 'success',
          message: `User ${user.full_name} deleted from Supabase and directory.`,
        });
        await loadUsers();
      } else {
        setSyncFeedback({
          type: 'error',
          message: `Delete failed: ${res.error}`,
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: `Delete error: ${err?.message}`,
      });
    }
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // Create new user account and push to Supabase
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail || !formName) return;

    setIsSaving(true);
    try {
      const assignedId = formId.trim() || crypto.randomUUID();
      const res = await usersService.createUser({
        id: assignedId,
        email: formEmail.trim().toLowerCase(),
        full_name: formName.trim(),
        role: formRole,
        phone: formPhone.trim(),
        department: formDepartment.trim() || 'Shiv Power Solution',
        password: formPassword.trim() || 'Password@123',
        is_active: true,
      });

      if (res.error) {
        setSyncFeedback({
          type: 'info',
          message: `Saved locally, but Supabase reported: ${res.error}. Run the SQL schema to create public.users table!`,
        });
      } else {
        setSyncFeedback({
          type: 'success',
          message: `Account created with ID: ${assignedId} and updated in Supabase public.users!`,
        });
      }

      await loadUsers();
      setShowAddModal(false);
      setFormId('');
      setFormEmail('');
      setFormName('');
      setFormPhone('');
      setFormPassword('Password@123');
    } catch (err: any) {
      console.error('Error creating user:', err);
      setSyncFeedback({
        type: 'error',
        message: err?.message || 'Failed to create user',
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.id.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.full_name.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q));

      const matchesRole =
        selectedRole === 'all' || u.role.toLowerCase() === selectedRole.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

  // Role stats
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'Admin').length;
    const sales = users.filter((u) => u.role === 'Sales').length;
    const active = users.filter((u) => u.is_active).length;
    return { total, admins, sales, active };
  }, [users]);

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'sales':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'marketing':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'operations':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total User IDs</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.total}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Records in public.users</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Administrators</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.admins}</p>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">Admin privilege</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sales Agents</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.sales}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Field & CRM agents</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Supabase Status</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {isLive ? 'Live DB Active' : 'Local / Offline'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">public.users table</p>
        </div>
      </div>

      {/* Sync Feedback Toast Banner */}
      {syncFeedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between gap-3 border shadow-2xs animate-in fade-in ${
            syncFeedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
              : syncFeedback.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {syncFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{syncFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Actions and Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="admin-search-users"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by User ID, Name, Email, Phone, or Company..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter and Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            id="admin-filter-users-role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
          </select>

          <button
            type="button"
            onClick={handleSyncAllUsers}
            disabled={isSyncingAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
            title="Upsert all user IDs to public.users table in Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'Syncing...' : 'Sync All to Supabase'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFormId(crypto.randomUUID());
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Create a new user ID directly"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-500" />
            <span>Add User ID</span>
          </button>

          <button
            type="button"
            onClick={loadUsers}
            disabled={isLoading}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Reload user accounts"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table: Registered Users in public.users */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">User ID (public.users)</th>
                <th className="py-3 px-4">User & Contact</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department / Company</th>
                <th className="py-3 px-4">Credentials (Password)</th>
                <th className="py-3 px-4">Status & Control</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                    <span>Loading registered users from database...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2 opacity-60" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">No user accounts found</p>
                    <p className="text-xs text-slate-400 mt-1">Try changing your search query or add a new user.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrentAdmin = user.email.toLowerCase() === userProfile.email.toLowerCase();
                  const isPasswordVisible = Boolean(visiblePasswords[user.id]);
                  const isEditingPassword = editingPasswordId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* User ID with 1-click Copy */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <code className="font-mono text-[11px] font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            {user.id}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyId(user.id)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Copy exact User ID"
                          >
                            {copiedId === user.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Full Name & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {user.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <span>{user.full_name}</span>
                              {isCurrentAdmin && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Department / Company */}
                      <td className="py-3 px-4">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                          {user.department || 'Shiv Power Solution'}
                        </div>
                        {user.phone && (
                          <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Credentials / Password */}
                      <td className="py-3 px-4">
                        {isEditingPassword ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={newPasswordInput}
                              onChange={(e) => setNewPasswordInput(e.target.value)}
                              placeholder="New password"
                              className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-blue-400 rounded-lg w-28 font-mono"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePassword(user.id)}
                              className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                              title="Save to Supabase"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPasswordId(null);
                                setNewPasswordInput('');
                              }}
                              className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/60">
                              {isPasswordVisible ? (
                                user.password || 'Password@123'
                              ) : (
                                '••••••••'
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setVisiblePasswords((prev) => ({
                                  ...prev,
                                  [user.id]: !prev[user.id],
                                }))
                              }
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title={isPasswordVisible ? 'Hide password' : 'View password'}
                            >
                              {isPasswordVisible ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPasswordId(user.id);
                                setNewPasswordInput(user.password || 'Password@123');
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                              title="Change password in Supabase"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status Toggle (Admin Control) */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
                            user.is_active
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80 hover:bg-rose-100'
                          }`}
                          title={`Click to ${user.is_active ? 'deactivate' : 'activate'} this user in Supabase`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{user.is_active ? 'Active' : 'Disabled'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleSyncSingleUser(user)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                            title="Verify and upsert to Supabase public.users"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Sync</span>
                          </button>
                          {!isCurrentAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add User ID to Database */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Create User ID in Database
                  </h3>
                  <p className="text-xs text-slate-400">
                    Directly registers and updates this user ID into Supabase public.users.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  User ID (UUID or Key)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                    className="flex-1 font-mono px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setFormId(crypto.randomUUID())}
                    className="px-2.5 py-2 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                    title="Generate new UUID"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. agent@shivpower.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Company
                </label>
                <input
                  type="text"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  placeholder="e.g. Shiv Power Solution"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sign-In Password (Saved to Supabase public.users) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="e.g. Password@123"
                    className="flex-1 font-mono px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setFormPassword('ShivPower@' + Math.floor(1000 + Math.random() * 9000))}
                    className="px-2.5 py-2 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                    title="Generate secure password"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  This password is saved into Supabase public.users and can be checked or edited directly in your Supabase panel.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-all"
                >
                  {isSaving ? 'Creating & Syncing...' : 'Save & Sync to Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
