import React, { useState, useEffect } from 'react';
import { 
  Users, Lock, Shield, Key, Plus, Trash2, Fingerprint, 
  CheckCircle2, ShieldCheck, HelpCircle, Store, Percent, 
  AlertCircle, RefreshCw, Terminal, Laptop, Printer, Scan, Save
} from 'lucide-react';
import { ContextualSaveBar } from './Polaris/ContextualSaveBar';

interface SettingsUser {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Cashier';
  pin: string;
  email?: string;
  status?: 'Active' | 'Inactive';
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
  // Navigation Menu tabs
  const [activeMenu, setActiveMenu] = useState<'profile' | 'compliance' | 'staff' | 'hardware'>('profile');

  // Loading States
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // View 1: Store Profile Fields
  const [profile, setProfile] = useState({
    storeName: '',
    legalName: '',
    address: '',
    retail_license_num: '',
    wholesale_license_num: ''
  });
  const [savedProfile, setSavedProfile] = useState<typeof profile | null>(null);

  // View 2: Taxes & Compliance Fields
  const [compliance, setCompliance] = useState({
    sales_tax_rate: 8.5,
    minimum_legal_age: 21,
    sales_cutoff_time: '02:00 AM',
    cutoff_enabled: true,
    max_spirits_per_transaction_gallons: 2.5
  });
  const [savedCompliance, setSavedCompliance] = useState<typeof compliance | null>(null);

  // View 3: Staff/Permissions state
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '',
    role: 'Cashier' as 'Admin' | 'Manager' | 'Cashier', 
    pin: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  // View 4: Connected Hardware (interactive state)
  const [hardware, setHardware] = useState({
    cashDrawerStatus: 'Connected (USB Port 1)',
    cashDrawerTarget: '192.168.1.185',
    receiptPrinterStatus: 'Connected (Epson Print Service)',
    receiptPrinterTarget: '192.168.1.192',
    barcodeScannerStatus: 'Connected (HID Keyboard Wedge Mode)',
    barcodeScannerTarget: 'COM3',
    stripeReaderStatus: 'Connected (WiFi Stripe BBPOS)',
    stripeReaderTarget: '192.168.1.150'
  });
  const [savedHardware, setSavedHardware] = useState<typeof hardware | null>(null);

  // Console Logs for Hardware actions
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[System Startup] Initializing connection pings to connected registers...",
    "[Hardware Registry] Thermal Printer TM-T88V resolved at DHCP lease 192.168.1.192.",
    "[Hardware Registry] 2D Barcode scanner linked at baud rate 9600 on COM3.",
    "[Hardware Registry] Cash Drawer solenoid loop verified via EPSON receipt printer kick port."
  ]);

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const [profileRes, complianceRes, hardwareRes] = await Promise.all([
          fetch('/api/settings/profile'),
          fetch('/api/settings/compliance'),
          fetch('/api/settings/hardware')
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
          setSavedProfile(profileData);
        }
        if (complianceRes.ok) {
          const complianceData = await complianceRes.json();
          setCompliance(complianceData);
          setSavedCompliance(complianceData);
        }
        if (hardwareRes.ok) {
          const hardwareData = await hardwareRes.json();
          setHardware(hardwareData);
          setSavedHardware(hardwareData);
        }
      } catch (err) {
        console.error("Failed to fetch settings from API, using defaults.", err);
      }
    }
    loadSettings();
  }, []);

  // Dirty check
  useEffect(() => {
    if (activeMenu === 'profile' && savedProfile) {
      const dirty = JSON.stringify(profile) !== JSON.stringify(savedProfile);
      setIsDirty(dirty);
    } else if (activeMenu === 'compliance' && savedCompliance) {
      const dirty = JSON.stringify(compliance) !== JSON.stringify(savedCompliance);
      setIsDirty(dirty);
    } else if (activeMenu === 'hardware' && savedHardware) {
      const dirty = JSON.stringify(hardware) !== JSON.stringify(savedHardware);
      setIsDirty(dirty);
    } else {
      setIsDirty(false);
    }
  }, [profile, savedProfile, compliance, savedCompliance, hardware, savedHardware, activeMenu]);

  const handleDiscard = () => {
    if (activeMenu === 'profile' && savedProfile) {
      setProfile(savedProfile);
    } else if (activeMenu === 'compliance' && savedCompliance) {
      setCompliance(savedCompliance);
    } else if (activeMenu === 'hardware' && savedHardware) {
      setHardware(savedHardware);
    }
    setIsDirty(false);
    showToast("Changes discarded", "info");
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      if (activeMenu === 'profile') {
        const res = await fetch('/api/settings/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        });
        if (res.ok) {
          const updated = await res.json();
          setProfile(updated);
          setSavedProfile(updated);
          showToast("Store profile saved successfully!", "success");
        } else {
          throw new Error("Failed to save profile");
        }
      } else if (activeMenu === 'compliance') {
        // Validate inputs
        if (Number(compliance.sales_tax_rate) < 0 || Number(compliance.sales_tax_rate) > 100) {
          showToast("Sales Tax Rate must be between 0% and 100%", "error");
          setIsSaving(false);
          return;
        }
        if (Number(compliance.minimum_legal_age) < 18 || Number(compliance.minimum_legal_age) > 99) {
          showToast("Minimum legal age must be a realistic number (18-99)", "error");
          setIsSaving(false);
          return;
        }

        const res = await fetch('/api/settings/compliance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(compliance)
        });
        if (res.ok) {
          const updated = await res.json();
          setCompliance(updated);
          setSavedCompliance(updated);
          showToast("Compliance rules updated in system core!", "success");
        } else {
          throw new Error("Failed to save compliance rules");
        }
      } else if (activeMenu === 'hardware') {
        const res = await fetch('/api/settings/hardware', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(hardware)
        });
        if (res.ok) {
          const updated = await res.json();
          setHardware(updated);
          setSavedHardware(updated);
          showToast("Hardware configurations locked in!", "success");
        } else {
          throw new Error("Failed to save hardware targets");
        }
      }
      setIsDirty(false);
    } catch (err: any) {
      showToast(err.message || "Could not persist changes", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Staff Creation inside Staff Directory
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
      email: newUser.email || `${newUser.name.trim().toLowerCase().replace(/\s+/g, '')}@obsidianretail.com`,
      role: newUser.role,
      pin: newUser.pin,
      status: newUser.status
    };

    setUsers([...users, created]);
    setNewUser({ name: '', email: '', role: 'Cashier', pin: '', status: 'Active' });
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

  // Granular role permission level updater
  const handlePermissionChange = (role: string, moduleKey: string, nextLevel: string) => {
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

  // Simulated Hardware Testing Pings
  const runHardwareAction = (device: string, actionName: string) => {
    const timestamp = new Date().toLocaleTimeString();
    let message = '';
    if (device === 'drawer') {
      message = `[${timestamp}] [Cash Drawer Kicker] Kicking drawer pulse command issued successfully to EPSON TM-T88 solenoid loops.`;
    } else if (device === 'printer') {
      message = `[${timestamp}] [Thermal Printer] Sending ESC/POS mock test receipt format packet: ${compliance.sales_tax_rate}% TAX, Legal Age limit ${compliance.minimum_legal_age}...`;
    } else if (device === 'scanner') {
      message = `[${timestamp}] [Barcode Scanner] Initiating laser diode calibration check. Handshake verified. Scanner status: ACTIVE.`;
    } else if (device === 'stripe') {
      message = `[${timestamp}] [Stripe terminal] Connecting to reader at IP ${hardware.stripeReaderTarget}... Handshake success. Battery level: 84%.`;
    }
    
    setConsoleLogs(prev => [message, ...prev]);
    showToast(`Triggered ${actionName}! Check logs.`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f1f2f4] dark:bg-[#0b0c0e]">
      {/* Contextual Save Bar Hooked into state */}
      <ContextualSaveBar 
        isDirty={isDirty} 
        onSave={handleSaveChanges} 
        onDiscard={handleDiscard} 
        isSaving={isSaving}
      />

      {/* Main Settings Header */}
      <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-850 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900 shadow-xs">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#008060] mb-0.5 block">Enterprise POS Operations</span>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">System Settings</h1>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={onLock}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold rounded-md shadow-xs transition cursor-pointer"
          >
            <Lock className="h-3.5 w-3.5" />
            Lock Register
          </button>
        </div>
      </div>

      {/* Sub-Dashboard Area with Split Left Navigation Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left-side Navigation Rail */}
        <div className="w-60 shrink-0 border-r border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 overflow-y-auto py-4 px-3 flex flex-col gap-1.5">
          <button
            onClick={() => setActiveMenu('profile')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeMenu === 'profile'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-[#008060] dark:text-emerald-400 font-bold'
                : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            <Store className="h-4 w-4 shrink-0" />
            Store Profile
          </button>
          
          <button
            onClick={() => setActiveMenu('compliance')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeMenu === 'compliance'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-[#008060] dark:text-emerald-400 font-bold'
                : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Taxes & Compliance Laws
          </button>

          <button
            onClick={() => setActiveMenu('staff')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeMenu === 'staff'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-[#008060] dark:text-emerald-400 font-bold'
                : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            <Users className="h-4 w-4 shrink-0" />
            Staff & Security Directory
          </button>

          <button
            onClick={() => setActiveMenu('hardware')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeMenu === 'hardware'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-[#008060] dark:text-emerald-400 font-bold'
                : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            <Laptop className="h-4 w-4 shrink-0" />
            Connected Hardware Configs
          </button>

          <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-850">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-lg">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Active Cashier Session</div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-[#008060] text-white flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-150 truncate max-w-[130px]">{currentUser.name}</div>
                  <div className="text-[9px] font-mono text-zinc-450 dark:text-zinc-400">{currentUser.role} Level</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right-side Active Sub-View Form Area (2/3 + 1/3 layout grid) */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {activeMenu === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form panel (2/3) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg shadow-xs p-6 space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-850">
                    <Store className="h-4.5 w-4.5 text-[#008060]" />
                    <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Retail Location Store Profile</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Store Name / DBA Name</label>
                      <input 
                        type="text"
                        value={profile.storeName}
                        onChange={(e) => setProfile({ ...profile, storeName: e.target.value })}
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition"
                        placeholder="Store name displayed on public receipts..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Legal Entity Name</label>
                      <input 
                        type="text"
                        value={profile.legalName}
                        onChange={(e) => setProfile({ ...profile, legalName: e.target.value })}
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition"
                        placeholder="Registered LLC or Corp name..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Corporate Address</label>
                      <input 
                        type="text"
                        value={profile.address}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition"
                        placeholder="Corporate business address..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">State Retail Liquor License Number</label>
                      <input 
                        type="text"
                        value={profile.retail_license_num}
                        onChange={(e) => setProfile({ ...profile, retail_license_num: e.target.value })}
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition"
                        placeholder="Retail license..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Wholesale Distribution License</label>
                      <input 
                        type="text"
                        value={profile.wholesale_license_num}
                        onChange={(e) => setProfile({ ...profile, wholesale_license_num: e.target.value })}
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition"
                        placeholder="Wholesale bulk distributor license..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contextual notes sidebar (1/3) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">Licensing Regulatory Mandates</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed space-y-2">
                    State law requires POS invoices and printed receipts to display active location license numbers, registered DBA titles, and physical storefront coordinates.
                  </p>
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-450">Retail License Class</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">Active Class A</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-450">Next Inspection Date</span>
                      <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-350">2026-10-15</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'compliance' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form panel (2/3) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg shadow-xs p-6 space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-850">
                    <Shield className="h-4.5 w-4.5 text-[#008060]" />
                    <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Tax Rates & Compliance Control Panel</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Default State Sales Tax Rate (%)</label>
                      <input 
                        type="number"
                        step="0.01"
                        value={compliance.sales_tax_rate}
                        onChange={(e) => setCompliance({ ...compliance, sales_tax_rate: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Minimum Legal Sale Age</label>
                      <input 
                        type="number"
                        value={compliance.minimum_legal_age}
                        onChange={(e) => setCompliance({ ...compliance, minimum_legal_age: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Strict Sales Cutoff Time</label>
                      <input 
                        type="text"
                        value={compliance.sales_cutoff_time}
                        onChange={(e) => setCompliance({ ...compliance, sales_cutoff_time: e.target.value })}
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition font-mono"
                        placeholder="e.g. 02:00 AM"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Max spirits per transaction (Gallons)</label>
                      <input 
                        type="number"
                        step="0.1"
                        value={compliance.max_spirits_per_transaction_gallons}
                        onChange={(e) => setCompliance({ ...compliance, max_spirits_per_transaction_gallons: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2 flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mt-2">
                      <div>
                        <div className="text-xs font-bold text-amber-800 dark:text-amber-450">Lock Checkout POS After Cutoff Hours</div>
                        <div className="text-[10px] text-zinc-550 dark:text-zinc-400 mt-0.5">Enforces strict county lockdown times, preventing cashier checkout.</div>
                      </div>
                      <input 
                        type="checkbox"
                        checked={compliance.cutoff_enabled}
                        onChange={(e) => setCompliance({ ...compliance, cutoff_enabled: e.target.checked })}
                        className="h-4.5 w-4.5 rounded text-[#008060] border-zinc-300 focus:ring-[#008060] accent-[#008060] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contextual notes sidebar (1/3) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">Age Verification Protocol</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed">
                    Under liquor retail standards, any order containing items classified as <b>Spirits, Wine, or Beer</b> is flagged automatically by the checkout register, requiring DOB logging.
                  </p>
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-[11px] text-zinc-450">
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Violating minimum age laws triggers immediate $10,000 corporate fines and potential license forfeiture.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'staff' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Main panel (2/3) - Directory & RBAC Matrix */}
              <div className="lg:col-span-8 space-y-6">
                {/* Staff directory */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg shadow-xs p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-850 justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4.5 w-4.5 text-[#008060]" />
                      <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Authorized Staff Directory</h2>
                    </div>
                    <span className="font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded font-bold text-zinc-600 dark:text-zinc-400">
                      {users.length} Employees Registered
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-450 font-bold">
                          <th className="py-2.5 px-2">Employee Name</th>
                          <th className="py-2.5 px-2">Assigned Role</th>
                          <th className="py-2.5 px-2 font-mono">Secured PIN</th>
                          <th className="py-2.5 px-2 text-center">Status</th>
                          <th className="py-2.5 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50 dark:divide-zinc-850">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-zinc-50/55 dark:hover:bg-zinc-850/20 text-zinc-700 dark:text-zinc-300">
                            <td className="py-3 px-2 font-semibold">
                              <div>{u.name}</div>
                              <div className="text-[10px] text-zinc-400 font-mono font-normal">{u.email || 'N/A'}</div>
                            </td>
                            <td className="py-3 px-2">
                              <select 
                                value={u.role}
                                onChange={(e) => {
                                  const updated = users.map(usr => usr.id === u.id ? { ...usr, role: e.target.value as any } : usr);
                                  setUsers(updated);
                                  showToast(`Role updated for ${u.name} to ${e.target.value}`, 'success');
                                }}
                                className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs outline-none focus:border-[#008060]"
                              >
                                <option value="Admin">Admin (Full Control)</option>
                                <option value="Manager">Manager</option>
                                <option value="Cashier">Cashier (POS Checkout)</option>
                              </select>
                            </td>
                            <td className="py-3 px-2 font-mono tracking-wider font-semibold">•••• (4-digit)</td>
                            <td className="py-3 px-2 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.status === 'Inactive' 
                                  ? 'bg-zinc-150 dark:bg-zinc-800 text-zinc-500' 
                                  : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                              }`}>
                                {u.status || 'Active'}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-rose-500 hover:text-rose-600 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                                title="Remove staff member"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* RBAC Rules Policy Matrix */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg shadow-xs p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-850">
                    <Shield className="h-4.5 w-4.5 text-[#008060]" />
                    <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Granular Module Security Matrix</h2>
                  </div>

                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Set baseline permission levels for Cashiers, Managers, and Admins across major POS and catalog management wrappers.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-450 font-bold">
                          <th className="py-2 px-1">ERP Module Block</th>
                          <th className="py-2 px-1">Cashier Base</th>
                          <th className="py-2 px-1">Manager Base</th>
                          <th className="py-2 px-1">Admin Base</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50 dark:divide-zinc-850">
                        {Object.entries(MODULE_LABELS).map(([key, label]) => (
                          <tr key={key} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/10">
                            <td className="py-2.5 px-1 font-semibold">
                              <div>{label.title}</div>
                              <div className="text-[10px] text-zinc-400 font-normal">{label.desc}</div>
                            </td>
                            {['Cashier', 'Manager', 'Admin'].map((role) => (
                              <td key={role} className="py-2.5 px-1">
                                <select
                                  value={rolePermissions[role]?.[key] || 'No Access'}
                                  onChange={(e) => handlePermissionChange(role, key, e.target.value)}
                                  className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] outline-none"
                                >
                                  <option value="Admin">Admin Power</option>
                                  <option value="Write">Write & Modify</option>
                                  <option value="Read Only">Read Only</option>
                                  <option value="No Access">No Access</option>
                                </select>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Add New Staff form (1/3) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg p-5 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-150 dark:border-zinc-800">
                    Register New Employee
                  </h3>

                  <form onSubmit={handleCreateUser} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Full Name *</label>
                      <input 
                        type="text"
                        required
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs outline-none focus:border-[#008060] transition"
                        placeholder="e.g. Elena Rostova"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Work Email</label>
                      <input 
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs outline-none focus:border-[#008060] transition"
                        placeholder="e.g. elena@obsidian.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Default Security Role</label>
                      <select 
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                        className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs outline-none focus:border-[#008060] transition"
                      >
                        <option value="Admin">Admin (Full Overrides)</option>
                        <option value="Manager">Manager</option>
                        <option value="Cashier">Cashier</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">4-Digit Security PIN *</label>
                      <input 
                        type="password"
                        maxLength={4}
                        required
                        value={newUser.pin}
                        onChange={(e) => setNewUser({ ...newUser, pin: e.target.value })}
                        className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs outline-none focus:border-[#008060] transition tracking-widest font-bold"
                        placeholder="e.g. 5555"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-1.5 px-3 bg-[#008060] hover:bg-[#006e52] text-white font-semibold rounded text-xs shadow-xs transition mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add to Directory
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'hardware' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Main panel (2/3) - Device Dashboard */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg shadow-xs p-6 space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-850">
                    <Laptop className="h-4.5 w-4.5 text-[#008060]" />
                    <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">POS Connected Hardware Registry</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Device 1: Cash Drawer */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-2.5 items-center">
                          <div className="p-1.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            <Key className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100">Cash Drawer Solenoid</div>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">● ACTIVE</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => runHardwareAction('drawer', 'Cash Drawer Solenoid Kick')}
                          className="px-2 py-1 bg-zinc-200 dark:bg-zinc-750 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-200 text-[10px] font-bold rounded transition cursor-pointer"
                        >
                          Trigger Test Kick
                        </button>
                      </div>
                      <div className="space-y-1 pt-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Device Connection IP/Serial</label>
                        <input 
                          type="text"
                          value={hardware.cashDrawerTarget}
                          onChange={(e) => setHardware({ ...hardware, cashDrawerTarget: e.target.value })}
                          className="w-full px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Device 2: Thermal Printer */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-2.5 items-center">
                          <div className="p-1.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            <Printer className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100">TM-T88V Receipt Printer</div>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">● ACTIVE</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => runHardwareAction('printer', 'ESC/POS Receipt Test Print')}
                          className="px-2 py-1 bg-zinc-200 dark:bg-zinc-750 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-200 text-[10px] font-bold rounded transition cursor-pointer"
                        >
                          Test Receipt Print
                        </button>
                      </div>
                      <div className="space-y-1 pt-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">IP Target Address</label>
                        <input 
                          type="text"
                          value={hardware.receiptPrinterTarget}
                          onChange={(e) => setHardware({ ...hardware, receiptPrinterTarget: e.target.value })}
                          className="w-full px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Device 3: Barcode scanner */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-2.5 items-center">
                          <div className="p-1.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            <Scan className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100">Handheld Barcode Scanner</div>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">● ACTIVE</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => runHardwareAction('scanner', 'Laser Scanner Diagnostic')}
                          className="px-2 py-1 bg-zinc-200 dark:bg-zinc-750 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-200 text-[10px] font-bold rounded transition cursor-pointer"
                        >
                          Calibrate Scanner
                        </button>
                      </div>
                      <div className="space-y-1 pt-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Serial Port COM Target</label>
                        <input 
                          type="text"
                          value={hardware.barcodeScannerTarget}
                          onChange={(e) => setHardware({ ...hardware, barcodeScannerTarget: e.target.value })}
                          className="w-full px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Device 4: Stripe Terminal */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-2.5 items-center">
                          <div className="p-1.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            <Laptop className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100">Stripe Terminal Reader</div>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">● ACTIVE</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => runHardwareAction('stripe', 'WiFi Reader Ping handshake')}
                          className="px-2 py-1 bg-zinc-200 dark:bg-zinc-750 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-200 text-[10px] font-bold rounded transition cursor-pointer"
                        >
                          Ping Reader Link
                        </button>
                      </div>
                      <div className="space-y-1 pt-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Reader WiFi IP target</label>
                        <input 
                          type="text"
                          value={hardware.stripeReaderTarget}
                          onChange={(e) => setHardware({ ...hardware, stripeReaderTarget: e.target.value })}
                          className="w-full px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Diagnostic Serial/Terminal Feed */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 shadow-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-300">
                      <Terminal className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                      <span>Live Diagnostic Hardware Logs</span>
                    </div>
                    <button 
                      onClick={() => setConsoleLogs([])}
                      className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
                    >
                      Clear Log Feed
                    </button>
                  </div>
                  <div className="h-32 overflow-y-auto font-mono text-[10px] text-zinc-400 space-y-1.5 select-all">
                    {consoleLogs.length === 0 ? (
                      <div className="text-zinc-650 italic">[Log cleared. Trigger diagnostic action to populate...]</div>
                    ) : (
                      consoleLogs.map((log, idx) => (
                        <div key={idx} className="leading-relaxed">
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Contextual notes sidebar (1/3) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">Hardware Overrides</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed">
                    Connected devices utilize low-level secure web socket interfaces to communicate with local hardware targets. Adjust host target IPs only if DHCP leases change.
                  </p>
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-450">Epson Handshake</span>
                      <span className="text-emerald-500 font-bold">OK (23ms)</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-450">Drawer Solenoid Pulse</span>
                      <span className="text-emerald-500 font-bold">Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
