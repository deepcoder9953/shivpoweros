import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  Search,
  Download,
  RefreshCw,
  Database,
  Laptop,
  Smartphone,
  Tablet,
  Copy,
  Check,
  Calendar,
  Clock,
  Globe,
  User,
  PlusCircle,
  ExternalLink,
  Code2,
  AlertCircle,
  X,
  Building2,
  Shield,
  Filter,
  Users,
  UserPlus,
  Key,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { UserLoginRecord, DeviceType } from '../../types/loginLog';
import { User as UserAccount } from '../../types/user';
import { loginAuditService } from '../../lib/loginAuditService';
import { usersService } from '../../lib/usersService';
import { useAuth } from '../../auth/AuthContext';
import { SUPABASE_LOGIN_LOGS_SQL } from '../../lib/supabaseLoginLogsSchema';
import { isSupabaseConfigured } from '../../lib/supabase';
import { UserAccountsManagement } from './UserAccountsManagement';

export const UserLoginsManagement: React.FC = () => {
  const [activeView, setActiveView] = useState<'sessions' | 'users'>('sessions');
  const [logs, setLogs] = useState<UserLoginRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveDatabase, setIsLiveDatabase] = useState(isSupabaseConfigured);
  const [dbError, setDbError] = useState<string | undefined>();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'all' | 'today' | '7days' | '30days'>('all');

  // Modals
  const [selectedRecord, setSelectedRecord] = useState<UserLoginRecord | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [showTestLoginModal, setShowTestLoginModal] = useState(false);

  // Copy feedback
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  // Test connection state
  const [testResult, setTestResult] = useState<{
    checked: boolean;
    loading: boolean;
    tableExists?: boolean;
    message?: string;
  }>({ checked: false, loading: false });

  // Test login form state
  const [testEmail, setTestEmail] = useState('field.agent@shivpower.com');
  const [testName, setTestName] = useState('Arjun Verma');
  const [testRole, setTestRole] = useState('Sales');
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);

  // Load login logs
  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await loginAuditService.getLoginLogs();
      setLogs(result.logs);
      setIsLiveDatabase(result.isLive);
      setDbError(result.error);
    } catch (err: any) {
      console.error('Failed loading login logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Handle SQL copy
  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_LOGIN_LOGS_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Handle IP copy
  const handleCopyIp = async (ip: string) => {
    try {
      await navigator.clipboard.writeText(ip);
      setCopiedIp(ip);
      setTimeout(() => setCopiedIp(null), 2000);
    } catch {
      // Fallback
    }
  };

  // Run Supabase Table Check
  const handleTestConnection = async () => {
    setTestResult({ checked: false, loading: true });
    const res = await loginAuditService.testSupabaseConnection();
    setTestResult({
      checked: true,
      loading: false,
      tableExists: res.tableExists,
      message: res.message,
    });
  };

  // Create simulated / test login event
  const handleCreateTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;

    setIsSubmittingTest(true);
    try {
      await loginAuditService.recordLogin({
        email: testEmail.trim(),
        fullName: testName.trim() || testEmail.split('@')[0],
        role: testRole,
        companyName: 'Shiv Power Solution',
        loginMethod: 'password',
        status: 'success',
      });
      await loadLogs();
      setShowTestLoginModal(false);
    } catch (err) {
      console.error('Failed to record test login:', err);
    } finally {
      setIsSubmittingTest(false);
    }
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((record) => {
      // 1. Search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matches =
          record.email.toLowerCase().includes(query) ||
          record.full_name.toLowerCase().includes(query) ||
          record.ip_address.toLowerCase().includes(query) ||
          record.browser.toLowerCase().includes(query) ||
          record.operating_system.toLowerCase().includes(query) ||
          record.role.toLowerCase().includes(query);

        if (!matches) return false;
      }

      // 2. Role filter
      if (selectedRole !== 'all' && record.role.toLowerCase() !== selectedRole.toLowerCase()) {
        return false;
      }

      // 3. Device filter
      if (selectedDevice !== 'all' && record.device_type.toLowerCase() !== selectedDevice.toLowerCase()) {
        return false;
      }

      // 4. Time range filter
      if (selectedTimeRange !== 'all') {
        const recordTime = new Date(record.login_at).getTime();
        const now = Date.now();
        if (selectedTimeRange === 'today') {
          const startOfToday = new Date().setHours(0, 0, 0, 0);
          if (recordTime < startOfToday) return false;
        } else if (selectedTimeRange === '7days') {
          if (now - recordTime > 7 * 86400000) return false;
        } else if (selectedTimeRange === '30days') {
          if (now - recordTime > 30 * 86400000) return false;
        }
      }

      return true;
    });
  }, [logs, searchQuery, selectedRole, selectedDevice, selectedTimeRange]);

  // Key KPI stats
  const stats = useMemo(() => {
    const total = logs.length;
    const uniqueEmails = new Set(logs.map((l) => l.email.toLowerCase())).size;
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const todayCount = logs.filter((l) => new Date(l.login_at).getTime() >= startOfToday).length;
    const desktopCount = logs.filter((l) => l.device_type === 'Desktop').length;
    const mobileCount = logs.filter((l) => l.device_type === 'Mobile' || l.device_type === 'Tablet').length;
    const desktopPct = total > 0 ? Math.round((desktopCount / total) * 100) : 0;
    const mobilePct = total > 0 ? Math.round((mobileCount / total) * 100) : 0;

    return {
      total,
      uniqueEmails,
      todayCount,
      desktopPct,
      mobilePct,
    };
  }, [logs]);

  // Relative time formatter
  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const getDeviceIcon = (deviceType: DeviceType) => {
    switch (deviceType) {
      case 'Mobile':
        return <Smartphone className="w-3.5 h-3.5 text-indigo-500" />;
      case 'Tablet':
        return <Tablet className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Laptop className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
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
    <div className="space-y-6">
      {/* Top Banner & Title Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Admin: User Login Audit
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {logs.length} Total Logs
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comprehensive audit trail of all user logins, IP addresses, devices, and browser environments in Supabase.
                </p>
              </div>
            </div>

            {/* Supabase connection indicator status */}
            <div className="pt-2 flex items-center gap-2 flex-wrap">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  isLiveDatabase
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isLiveDatabase ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}
                />
                <Database className="w-3.5 h-3.5" />
                <span>
                  {isLiveDatabase
                    ? 'Supabase Database: Live Table Connected'
                    : 'Local Sync Buffer Active (Click SQL Setup to sync)'}
                </span>
              </div>

              {dbError && (
                <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{dbError}</span>
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setShowSqlModal(true);
                handleTestConnection();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors"
              title="View Supabase table schema & SQL migration"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Supabase SQL Setup</span>
            </button>

            <button
              type="button"
              onClick={() => setShowTestLoginModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Record a test login activity to verify database write"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-500" />
              <span>Record Test Login</span>
            </button>

            <button
              type="button"
              onClick={() => loginAuditService.exportLogsToCSV(filteredLogs)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Download login audit spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={loadLogs}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Refresh login logs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-view switcher tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveView('sessions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeView === 'sessions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Login Sessions Audit</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeView === 'sessions'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {logs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeView === 'users'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts & IDs (public.users)</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
            Supabase Table
          </span>
        </button>
      </div>

      {activeView === 'users' ? (
        <UserAccountsManagement />
      ) : (
        <>
          {/* KPI Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Logins</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.total}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Recorded user sessions</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Unique Users</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
              <User className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.uniqueEmails}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Individual accounts logged in</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Logins Today</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.todayCount}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            Active today
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Device Ratio</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-2">
            {stats.desktopPct}% <span className="text-xs font-normal text-slate-400">Desk /</span> {stats.mobilePct}% <span className="text-xs font-normal text-slate-400">Mob</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Desktop vs Mobile/Tablet</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="admin-search-logins"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user email, name, IP address, OS, or browser..."
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

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role filter */}
          <select
            id="admin-filter-role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="sales">Sales</option>
            <option value="marketing">Marketing</option>
            <option value="operations">Operations</option>
          </select>

          {/* Device filter */}
          <select
            id="admin-filter-device"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Devices</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>

          {/* Time range */}
          <select
            id="admin-filter-timerange"
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>

          {(searchQuery || selectedRole !== 'all' || selectedDevice !== 'all' || selectedTimeRange !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedRole('all');
                setSelectedDevice('all');
                setSelectedTimeRange('all');
              }}
              className="px-2.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Login Audit Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">User & Account</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Login Timestamp</th>
                <th className="py-3 px-4">IP Address & Location</th>
                <th className="py-3 px-4">Device & Browser</th>
                <th className="py-3 px-4">Method & Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Shield className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        No login records found matching criteria
                      </p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your filters or record a test login above.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const initial = (log.full_name || log.email).charAt(0).toUpperCase();

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedRecord(log)}
                    >
                      {/* User & Account */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                              {log.full_name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {log.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getRoleBadgeColor(
                            log.role
                          )}`}
                        >
                          {log.role}
                        </span>
                      </td>

                      {/* Login Timestamp */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatRelativeTime(log.login_at)}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {new Date(log.login_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}{' '}
                            - {new Date(log.login_at).toLocaleDateString()}
                          </p>
                        </div>
                      </td>

                      {/* IP Address & Location */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {log.ip_address}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyIp(log.ip_address);
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Copy IP address"
                          >
                            {copiedIp === log.ip_address ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5" />
                          <span>{log.location_info || 'India'}</span>
                        </p>
                      </td>

                      {/* Device & Browser */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800">
                            {getDeviceIcon(log.device_type)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                              {log.browser}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {log.operating_system} • {log.device_type}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Method & Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Authorized</span>
                          </span>
                          <p className="text-[10px] text-slate-400 capitalize">
                            Via {log.login_method.replace('_', ' ')}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(log);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                        >
                          View Session
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing {filteredLogs.length} of {logs.length} logged sessions
          </span>
          <span>Security Protocol: TLS 1.3 / Supabase Auth</span>
        </div>
      </div>
      </>
      )}

      {/* MODAL 1: Session Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shadow-xs">
                  {selectedRecord.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    User Session Inspection
                  </h3>
                  <p className="text-xs text-slate-400">Session ID: {selectedRecord.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              {/* Profile Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Identity Details
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Full Name</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {selectedRecord.full_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {selectedRecord.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Assigned Role</span>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mt-0.5 ${getRoleBadgeColor(
                        selectedRecord.role
                      )}`}
                    >
                      {selectedRecord.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Company / Organization</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {selectedRecord.company_name || 'Shiv Power Solution'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Network & Security Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Network & Authentication Context
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Client IP Address</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {selectedRecord.ip_address}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyIp(selectedRecord.ip_address)}
                        className="text-slate-400 hover:text-blue-500"
                        title="Copy IP"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Login Timestamp</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(selectedRecord.login_at).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Authentication Method</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                      {selectedRecord.login_method.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Status</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 capitalize">
                      {selectedRecord.status} (Verified)
                    </span>
                  </div>
                </div>
              </div>

              {/* Client Environment Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Client Environment
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block">Device</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedRecord.device_type}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block">Operating System</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedRecord.operating_system}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block">Browser</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedRecord.browser}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] mb-1">User-Agent Header</span>
                  <div className="p-2 bg-slate-900 text-slate-200 font-mono text-[10px] rounded-xl overflow-x-auto break-all border border-slate-800">
                    {selectedRecord.user_agent || 'Standard browser user agent'}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery(selectedRecord.email);
                  setSelectedRecord(null);
                }}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Filter table by this user ({selectedRecord.email})
              </button>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-xl text-xs text-slate-800 dark:text-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Supabase Database Setup & SQL Migration */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Supabase Database Setup: public.users & public.user_login_logs
                  </h3>
                  <p className="text-xs text-slate-400">
                    Creates both tables and the automatic trigger to sync auth user IDs into public.users.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              {/* Test Connection Box */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    Supabase Live Table Connection Test
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {testResult.checked
                      ? testResult.message
                      : testResult.loading
                      ? 'Checking connection to Supabase table...'
                      : 'Click test to verify whether the user_login_logs table is created.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testResult.loading}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 transition-colors"
                >
                  {testResult.loading ? 'Testing...' : 'Test Connection'}
                </button>
              </div>

              {/* Instructions */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  How to setup the database in Supabase:
                </h4>
                <ol className="list-decimal list-inside text-slate-600 dark:text-slate-300 space-y-1 text-xs pl-1">
                  <li>
                    Open your Supabase Dashboard (<span className="font-mono text-blue-600">supabase.com/dashboard</span>)
                  </li>
                  <li>Click on the <strong>SQL Editor</strong> tab on the left sidebar</li>
                  <li>Click <strong>+ New Query</strong></li>
                  <li>Copy and paste the SQL script below, then click <strong>Run</strong></li>
                </ol>
              </div>

              {/* Code Container with Copy Button */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                  <span className="font-mono">schema: public.user_login_logs</span>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy SQL Script</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-64 leading-relaxed scrollbar-thin">
                  {SUPABASE_LOGIN_LOGS_SQL}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Record Test Login Modal */}
      {showTestLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Record Test User Login
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTestLoginModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTestLogin} className="py-4 space-y-3.5 text-xs">
              <p className="text-slate-500 dark:text-slate-400">
                Immediately trigger an authentication event to test Supabase insertion and live UI updates.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  User Email Address
                </label>
                <input
                  type="email"
                  required
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="e.g. employee@shivpower.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g. Arjun Verma"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Role
                </label>
                <select
                  value={testRole}
                  onChange={(e) => setTestRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="Admin">Admin</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTestLoginModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTest}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-all"
                >
                  {isSubmittingTest ? 'Recording...' : 'Record Login Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
