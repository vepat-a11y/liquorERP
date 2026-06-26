import React, { useState } from 'react';
import { Users, Shield, ShieldCheck, UserPlus, Lock, Key, Check } from 'lucide-react';

interface SettingsProps {
  activeRole: 'Admin' | 'Manager' | 'Cashier';
  onChangeRole: (role: 'Admin' | 'Manager' | 'Cashier') => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface UserPermission {
  id: string;
  name: string;
  description: string;
  cashierAllowed: boolean;
  managerAllowed: boolean;
  adminAllowed: boolean;
}

export default function Settings({ activeRole, onChangeRole, showToast }: SettingsProps) {
  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe (Admin)', role: 'Admin' as const, pin: '1234' },
    { id: '2', name: 'Sarah Connor (Manager)', role: 'Manager' as const, pin: '5678' },
    { id: '3', name: 'Kyle Reese (Cashier)', role: 'Cashier' as const, pin: '0000' }
  ]);

  const [permissions, setPermissions] = useState<UserPermission[]>([
    { id: 'p1', name: 'Access Register & Checkout', description: 'Allowed to run transactions and charge clients', cashierAllowed: true, managerAllowed: true, adminAllowed: true },
    { id: 'p2', name: 'Modify Product Inventory', description: 'Allowed to add products or receive stock manually', cashierAllowed: false, managerAllowed: true, adminAllowed: true },
    { id: 'p3', name: 'Create Purchase Orders', description: 'Allowed to generate and print PO documentation', cashierAllowed: false, managerAllowed: true, adminAllowed: true },
    { id: 'p4', name: 'Modify Sales Tax Rates', description: 'Allowed to modify standard municipal tax compliance rates', cashierAllowed: false, managerAllowed: false, adminAllowed: true },
    { id: 'p5', name: 'Void Transactions', description: 'Allowed to run manual refunds and void cash ledger entries', cashierAllowed: false, managerAllowed: true, adminAllowed: true }
  ]);

  const [newUser, setNewUser] = useState({ name: '', role: 'Cashier' as 'Admin' | 'Manager' | 'Cashier', pin: '' });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.pin.trim()) {
      showToast('Please fill in both name and security PIN', 'error');
      return;
    }

    setUsers(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        name: newUser.name,
        role: newUser.role,
        pin: newUser.pin
      }
    ]);

    setNewUser({ name: '', role: 'Cashier', pin: '' });
    showToast(`User "${newUser.name}" added successfully as ${newUser.role}!`, 'success');
  };

  const handleTogglePermission = (pId: string, roleKey: 'cashierAllowed' | 'managerAllowed' | 'adminAllowed') => {
    setPermissions(prev => prev.map(p => {
      if (p.id === pId) {
        const nextVal = !p[roleKey];
        showToast(`Permission updated!`, 'info');
        return { ...p, [roleKey]: nextVal };
      }
      return p;
    }));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#fafafa] dark:bg-[#09090b]">
      
      {/* Header bar */}
      <div className="h-16 px-6 border-b border-[#e4e4e7] dark:border-[#27272a] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-sm font-bold text-[#09090b] dark:text-white uppercase tracking-wider">
            ERP User Management & Permissions
          </h2>
        </div>
        <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 font-bold">
          Active Role: <span className="text-[#10b981] font-mono">{activeRole}</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Quick Role Switcher panel */}
        <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#10b981]" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-white">
              Simulator: Select Active Logged In Role
            </h3>
          </div>
          <p className="text-xs text-zinc-500">
            Switch your current session role to see how the system restrictions adapt to different permissions!
          </p>

          <div className="grid grid-cols-3 gap-4">
            {(['Admin', 'Manager', 'Cashier'] as const).map(role => (
              <button
                key={role}
                onClick={() => {
                  onChangeRole(role);
                  showToast(`Session switched to ${role} Role!`, 'success');
                }}
                className={`p-4 border rounded-xl flex flex-col items-center gap-2 font-semibold transition-all cursor-pointer ${
                  activeRole === role
                    ? 'border-[#10b981] bg-[#10b981]/5 text-zinc-950 dark:text-white'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
                }`}
              >
                <ShieldCheck className={`h-5 w-5 ${activeRole === role ? 'text-[#10b981]' : 'text-zinc-400'}`} />
                <span className="text-xs font-bold">{role}</span>
              </button>
            ))}
          </div>
        </div>

        {/* System Telemetry & Diagnostics Panel */}
        <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <ShieldCheck className="h-4.5 w-4.5 text-amber-500" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-white">
              System Diagnostics & Telemetry
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 bg-[#fafafa] dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Connection Node</span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ONLINE (9ms latency)
              </div>
            </div>

            <div className="p-3 bg-[#fafafa] dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Security Protocol</span>
              <div className="text-xs font-bold text-[#d97706] font-mono uppercase">
                ACTIVE [TLS 1.3 AES-256]
              </div>
            </div>

            <div className="p-3 bg-[#fafafa] dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Local Timezone</span>
              <div className="text-xs font-bold text-zinc-600 dark:text-zinc-300 font-mono">
                {new Date().toLocaleTimeString()} (UTC)
              </div>
            </div>

            <div className="p-3 bg-[#fafafa] dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Database Workspace</span>
              <div className="text-xs font-bold text-[#10b981] font-mono">
                HEALTHY (Replica Sync)
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User List Panel */}
          <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-6 space-y-6">
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800">
              Assigned Store Users & Cashiers
            </h3>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {users.map(user => (
                <div key={user.id} className="py-3 flex items-center justify-between text-xs font-medium">
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white">{user.name}</p>
                    <p className="text-[10px] text-zinc-500">Role: <span className="font-bold">{user.role}</span> | Pin: <span className="font-mono">{user.pin}</span></p>
                  </div>
                  <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded">
                    Active
                  </span>
                </div>
              ))}
            </div>

            {/* Add User Subform */}
            <form onSubmit={handleCreateUser} className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-4 text-xs">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Add New User</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Rachel Green"
                    className="w-full bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1">Security PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={newUser.pin}
                    onChange={(e) => setNewUser(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))}
                    placeholder="e.g. 1122"
                    className="w-full bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-zinc-500 font-bold uppercase mb-1">Assigned Security Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-2.5"
                >
                  <option value="Cashier">Cashier</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin (Full Access)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5"
              >
                <UserPlus className="h-4 w-4" />
                Add User to System
              </button>
            </form>
          </div>

          {/* Permissions Matrix */}
          <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-6 space-y-6">
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800">
              Granular Permission Matrix
            </h3>

            <div className="space-y-4">
              {permissions.map(p => (
                <div key={p.id} className="text-xs border border-zinc-100 dark:border-zinc-800 p-3.5 rounded-xl space-y-2">
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white">{p.name}</p>
                    <p className="text-[10px] text-zinc-400">{p.description}</p>
                  </div>

                  <div className="flex gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleTogglePermission(p.id, 'cashierAllowed')}
                      className={`px-2.5 py-1 rounded-full border transition-all ${
                        p.cashierAllowed 
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-bold' 
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
                      }`}
                    >
                      Cashier: {p.cashierAllowed ? 'YES' : 'NO'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTogglePermission(p.id, 'managerAllowed')}
                      className={`px-2.5 py-1 rounded-full border transition-all ${
                        p.managerAllowed 
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-bold' 
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
                      }`}
                    >
                      Manager: {p.managerAllowed ? 'YES' : 'NO'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTogglePermission(p.id, 'adminAllowed')}
                      className={`px-2.5 py-1 rounded-full border transition-all ${
                        p.adminAllowed 
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-bold' 
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
                      }`}
                    >
                      Admin: {p.adminAllowed ? 'YES' : 'NO'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
