import React, { useState } from 'react';
import { Users, Lock, Shield, Key, Plus, Trash2, Fingerprint, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

interface SettingsUser {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Cashier';
  pin: string;
}

interface SettingsProps {
  currentUser: SettingsUser;
  users: SettingsUser[];
  setUsers: (users: SettingsUser[]) => void;
  rolePermissions: Record<string, Record<string, string>>;
  setRolePermissions: (p: Record<string, Record<string, string>>) => void;
  onLock: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const MODULE_LABELS: Record<string, { title: string; desc: string }> = {
  register: { title: "Register & Checkout", desc: "Access the cash register, add items to cart, and process transactions" },
  inventory: { title: "Products & Stock", desc: "Manage catalog, add products, import/export data, and track real-time stock levels" },
  history: { title: "Sales Transactions", desc: "View complete sales records, receipt history, and customer details" },
  discounts: { title: "Promotions & Coupons", desc: "Create, configure, and delete bulk discounts or checkout coupon codes" },
  purchases: { title: "Purchases & Vendor Bills", desc: "Generate purchase orders and track bulk shipments from distributors" },
  marketing: { title: "Marketing Campaigns", desc: "Configure newsletters, loyalty levels, and active marketing lists" },
  print: { title: "Print Lab Designer", desc: "Design and print shelf tags, prices, or barcoded bottle stickers" },
  integrations: { title: "Cloud Integrations", desc: "Manage UberEats, DoorDash, and online omnichannel delivery feeds" },
  website: { title: "Online Web Builder", desc: "Customize the public-facing e-commerce storefront layout" },
  settings: { title: "System Settings & Users", desc: "Configure user roles, security PIN keys, and granular module permissions" },
};

export default function Settings({
  currentUser,
  users,
  setUsers,
  rolePermissions,
  setRolePermissions,
  onLock,
  showToast
}: SettingsProps) {
  const [newUser, setNewUser] = useState({ name: '', role: 'Cashier' as 'Admin' | 'Manager' | 'Cashier', pin: '' });
  const [activeSettingsTab, setActiveSettingsTab] = useState<'users' | 'rules'>('users');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim()) {
      showToast('User name cannot be empty', 'error');
      return;
    }
    if (newUser.pin.length !== 4 || isNaN(Number(newUser.pin))) {
      showToast('PIN must be exactly 4 digits', 'error');
      return;
    }
    if (users.some(u => u.pin === newUser.pin)) {
      showToast('This PIN is already assigned to another user', 'error');
      return;
    }

    const created: SettingsUser = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: newUser.name.trim(),
      role: newUser.role,
      pin: newUser.pin
    };

    setUsers([...users, created]);
    setNewUser({ name: '', role: 'Cashier', pin: '' });
    showToast(`Added profile: ${created.name} (${created.role})`, 'success');
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser.id) {
      showToast('You cannot delete your own active session account', 'error');
      return;
    }
    const filtered = users.filter(u => u.id !== id);
    setUsers(filtered);
    showToast('User account removed successfully', 'success');
  };

  const handlePermissionChange = (role: string, moduleKey: string, nextLevel: string) => {
    // Admins must always remain admins for system settings to prevent bricking the system
    if (role === 'Admin' && moduleKey === 'settings' && nextLevel !== 'Admin') {
      showToast('Admin role must retain Admin level for settings to prevent lockouts', 'error');
      return;
    }

    const updated = {
      ...rolePermissions,
      [role]: {
        ...rolePermissions[role],
        [moduleKey]: nextLevel
      }
    };
    setRolePermissions(updated);
    showToast(`Matrix Updated: ${role} now has "${nextLevel}" for ${MODULE_LABELS[moduleKey]?.title || moduleKey}`, 'success');
  };

  // Check if current user is allowed to edit rules (only Admin or Manager)
  const canEditRules = (currentUser?.role || 'Admin') === 'Admin' || (currentUser?.role || 'Admin') === 'Manager';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8f7f4] dark:bg-[#121212]">
      
      {/* Settings Top Title Section */}
      <div className="px-8 py-6 border-b border-[#1a1a1a]/10 dark:border-white/10 flex items-center justify-between shrink-0 bg-white dark:bg-[#121212]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#d97706] mb-1 block">System Governance</span>
          <h2 className="font-serif italic font-medium text-3xl text-[#1a1a1a] dark:text-[#f8f7f4] tracking-tight">
            Users & Module Restrictions
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onLock}
            className="flex items-center gap-2 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border border-[#1a1a1a] shadow-[2px_2px_0px_#d97706] hover:bg-zinc-800 dark:hover:bg-zinc-100 transition cursor-pointer"
          >
            <Lock className="h-3.5 w-3.5" />
            Lock Register
          </button>
        </div>
      </div>

      {/* Settings Navigation Bar */}
      <div className="px-8 border-b border-[#1a1a1a]/10 dark:border-white/10 flex gap-4 shrink-0 bg-zinc-50 dark:bg-[#151515]">
        <button
          onClick={() => setActiveSettingsTab('users')}
          className={`py-3.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSettingsTab === 'users'
              ? 'border-[#d97706] text-[#1a1a1a] dark:text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          Staff Directory & PIN Keys
        </button>
        <button
          onClick={() => setActiveSettingsTab('rules')}
          className={`py-3.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSettingsTab === 'rules'
              ? 'border-[#d97706] text-[#1a1a1a] dark:text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          Granular Permission Matrix
        </button>
      </div>

      {/* Settings Main Window */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        
        {activeSettingsTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* User Profile Form Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="brutalist-card bg-white dark:bg-[#18181b]">
                <div className="flex items-center gap-2 mb-4">
                  <Fingerprint className="h-5 w-5 text-[#d97706]" />
                  <h3 className="font-serif italic font-semibold text-lg text-[#1a1a1a] dark:text-white">
                    Create Security Credentials
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                  Provision new employee profiles. Each cashier or manager requires a distinct name and a 4-digit PIN for locks and compliance trails.
                </p>

                <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Employee Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Richard Hendricks"
                      className="w-full bg-zinc-100 dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 p-2.5 text-xs font-mono focus:outline-none focus:border-[#d97706] text-[#1a1a1a] dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Security PIN (4 Digits) *</label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={newUser.pin}
                        onChange={(e) => setNewUser(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))}
                        placeholder="e.g. 8832"
                        className="w-full bg-zinc-100 dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 p-2.5 text-xs font-mono focus:outline-none focus:border-[#d97706] text-[#1a1a1a] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Authority Role *</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as any }))}
                        className="w-full bg-zinc-100 dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 p-2.5 text-xs font-mono focus:outline-none focus:border-[#d97706] text-[#1a1a1a] dark:text-white cursor-pointer"
                      >
                        <option value="Cashier">Cashier</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-[#1a1a1a] dark:bg-[#f8f7f4] text-white dark:text-[#1a1a1a] hover:bg-[#d97706] hover:text-white font-mono font-bold py-3 border border-[#1a1a1a] shadow-[3px_3px_0px_#d97706] text-xs uppercase tracking-widest transition cursor-pointer"
                  >
                    Register Profile Keys
                  </button>
                </form>
              </div>

              {/* Active Session Info Card */}
              <div className="p-4 bg-zinc-100 dark:bg-[#18181b] border border-[#1a1a1a]/10 dark:border-white/10 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono">
                  <ShieldCheck className="h-4 w-4 text-[#10b981]" />
                  <span className="uppercase font-bold text-[10px] tracking-wider">Active Workspace Session</span>
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#1a1a1a] dark:text-white">{currentUser?.name || 'Active User'}</p>
                  <p className="text-zinc-500 font-mono text-[10px] mt-0.5">Role Level: <span className="text-[#d97706] font-bold">{currentUser?.role || 'Admin'}</span></p>
                </div>
              </div>
            </div>

            {/* User List Panel Column (7 cols) */}
            <div className="lg:col-span-7 brutalist-card bg-white dark:bg-[#18181b] space-y-6">
              <div className="flex items-center justify-between border-b border-[#1a1a1a]/10 dark:border-white/10 pb-3">
                <h3 className="font-serif italic font-semibold text-lg text-[#1a1a1a] dark:text-white">
                  Active Staff Directory
                </h3>
                <span className="bg-[#1a1a1a]/5 dark:bg-white/10 border border-[#1a1a1a]/10 text-zinc-600 dark:text-zinc-300 text-[10px] font-mono px-2 py-0.5 rounded">
                  {users.length} Employees
                </span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {users.map(user => (
                  <div key={user.id} className="py-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1a1a1a] dark:text-white text-sm">{user.name}</span>
                        {user.id === currentUser?.id && (
                          <span className="bg-[#10b981]/15 text-[#10b981] px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase border border-[#10b981]/10">You</span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-4">
                        <span>Role: <b className="text-zinc-700 dark:text-zinc-300 font-sans uppercase">{user.role}</b></span>
                        <span>PIN Key: <b className="text-zinc-700 dark:text-zinc-300 tracking-widest">{(currentUser?.role || 'Admin') === 'Admin' ? user.pin : '••••'}</b></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === currentUser?.id}
                      className="p-2 border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-red-500 hover:border-red-500/30 rounded-lg transition disabled:opacity-30 cursor-pointer"
                      title={user.id === currentUser?.id ? "Cannot delete yourself" : "Delete profile"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeSettingsTab === 'rules' && (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="p-5 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 font-mono font-bold text-[10px] tracking-wider uppercase text-[#d97706]">
                <Shield className="h-4 w-4" />
                <span>Security Governance Override Matrix</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Define what modules can be accessed, written, or configured by each employee authority level. Changes instantly re-compile the system's runtime permissions.
              </p>
              {!canEditRules && (
                <p className="text-[10px] font-mono text-red-500 font-bold mt-1 uppercase">
                  ⚠️ View Only: Your current profile level ({currentUser?.role || 'Admin'}) does not have permission to modify these restrictions. Only Admins and Managers can edit permissions.
                </p>
              )}
            </div>

            {/* Permissions Matrix Layout */}
            <div className="border border-[#1a1a1a]/10 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#18181b]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-[#151515] border-b border-[#1a1a1a]/10 dark:border-white/10 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    <th className="p-4 pl-6 font-bold w-1/3">Module / System Tab</th>
                    <th className="p-4 font-bold text-center">Cashier Permissions</th>
                    <th className="p-4 font-bold text-center">Manager Permissions</th>
                    <th className="p-4 font-bold text-center">Admin Permissions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                  {Object.keys(MODULE_LABELS).map((moduleKey) => {
                    const label = MODULE_LABELS[moduleKey];
                    const cashierPerm = rolePermissions['Cashier']?.[moduleKey] || 'No Access';
                    const managerPerm = rolePermissions['Manager']?.[moduleKey] || 'No Access';
                    const adminPerm = rolePermissions['Admin']?.[moduleKey] || 'Admin';

                    return (
                      <tr key={moduleKey} className="hover:bg-zinc-50/50 dark:hover:bg-[#1f1f23]/20">
                        <td className="p-4 pl-6 space-y-1">
                          <p className="font-bold text-[#1a1a1a] dark:text-white text-sm">{label.title}</p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-normal">{label.desc}</p>
                        </td>
                        
                        {/* Cashier Option */}
                        <td className="p-4 text-center">
                          <select
                            value={cashierPerm}
                            disabled={!canEditRules}
                            onChange={(e) => handlePermissionChange('Cashier', moduleKey, e.target.value)}
                            className="bg-zinc-100 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded p-1.5 text-[11px] font-mono text-[#1a1a1a] dark:text-white mx-auto block cursor-pointer focus:outline-none focus:border-[#d97706] disabled:opacity-60"
                          >
                            <option value="No Access">No Access (Hidden)</option>
                            <option value="Read Only">Read Only</option>
                            <option value="Write">Read & Write (Write)</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>

                        {/* Manager Option */}
                        <td className="p-4 text-center">
                          <select
                            value={managerPerm}
                            disabled={!canEditRules}
                            onChange={(e) => handlePermissionChange('Manager', moduleKey, e.target.value)}
                            className="bg-zinc-100 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded p-1.5 text-[11px] font-mono text-[#1a1a1a] dark:text-white mx-auto block cursor-pointer focus:outline-none focus:border-[#d97706] disabled:opacity-60"
                          >
                            <option value="No Access">No Access (Hidden)</option>
                            <option value="Read Only">Read Only</option>
                            <option value="Write">Read & Write (Write)</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>

                        {/* Admin Option */}
                        <td className="p-4 text-center">
                          <select
                            value={adminPerm}
                            disabled={!canEditRules || moduleKey === 'settings'} // Settings must remain Admin to prevent lockout
                            onChange={(e) => handlePermissionChange('Admin', moduleKey, e.target.value)}
                            className="bg-zinc-100 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded p-1.5 text-[11px] font-mono text-[#1a1a1a] dark:text-white mx-auto block cursor-pointer focus:outline-none focus:border-[#d97706] disabled:opacity-60"
                          >
                            <option value="No Access">No Access (Hidden)</option>
                            <option value="Read Only">Read Only</option>
                            <option value="Write">Read & Write (Write)</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
