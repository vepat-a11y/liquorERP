import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Page, LayoutGrid, LayoutSection } from '../components/Polaris/Page';
import { Card } from '../components/Polaris/Card';
import { DataTable, Column } from '../components/Polaris/DataTable';
import { Badge } from '../components/Polaris/Badge';
import { Customer } from '../types';
import { Search, Plus, UserPlus, Mail, Phone, Calendar } from 'lucide-react';

export default function CustomersWrapper() {
  const context = useOutletContext<any>();
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Customer State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const customers: Customer[] = context.customers || [];

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      context.showToast('Please enter a name and phone number', 'error');
      return;
    }

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: context.activeTenantId,
          name,
          email: email || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone,
          dob: dob || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to register customer');

      context.showToast(`Customer "${name}" registered successfully!`, 'success');
      context.fetchTenantData(); // Refresh list
      
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setDob('');
      setIsAdding(false);
    } catch (error: any) {
      context.showToast(error.message, 'error');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const columns: Column[] = [
    {
      key: 'name',
      title: 'Customer Name',
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 flex items-center justify-center font-bold text-xs">
            {row.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{row.name}</span>
            <div className="text-[10px] text-zinc-450 dark:text-zinc-400 font-mono mt-0.5">ID: {row.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Email Address',
      render: (val) => <span className="font-mono text-xs">{val || '—'}</span>,
    },
    {
      key: 'phone',
      title: 'Phone Number',
      render: (val) => <span className="font-mono text-xs">{val || '—'}</span>,
    },
    {
      key: 'dob',
      title: 'Age Check DOB',
      render: (val) => val ? (
        <Badge tone="attention">
          {val}
        </Badge>
      ) : (
        <span className="text-zinc-400 font-sans italic text-xs">Unverified</span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Joined Date',
      render: (val) => <span className="font-mono text-xs">{new Date(val).toLocaleDateString()}</span>,
    },
  ];

  return (
    <Page
      title="Customers CRM"
      titleMetadata={<Badge tone="info">{customers.length} Registered</Badge>}
      primaryAction={{
        content: isAdding ? 'View List' : 'Add Customer',
        onAction: () => setIsAdding(!isAdding),
      }}
    >
      {isAdding ? (
        <LayoutGrid>
          <LayoutSection>
            <Card title="Register New Customer Profile">
              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Full Name *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-3.5 py-2 pl-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition"
                        required
                      />
                      <UserPlus className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Phone Number *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 555-0199"
                        className="w-full px-3.5 py-2 pl-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition"
                        required
                      />
                      <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. john@example.com"
                        className="w-full px-3.5 py-2 pl-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition"
                      />
                      <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Date of Birth (DOB)</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-3.5 py-2 pl-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition"
                      />
                      <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#008060] hover:bg-[#006e52] text-xs font-semibold text-white rounded-md shadow-xs transition"
                  >
                    Save Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold rounded-md transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Card>
          </LayoutSection>
          
          <LayoutSection secondary>
            <Card title="Compliance Verification">
              <p className="text-xs leading-relaxed text-zinc-500">
                Registering client records allows POS operators to perform rapid age-verification scanning during checkout. When a customer profile is linked to an order, previous ID verification logs are checked.
              </p>
            </Card>
          </LayoutSection>
        </LayoutGrid>
      ) : (
        <Card sectioned={false}>
          {/* Filtering Header */}
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter customers by name, phone, or email..."
                className="w-full px-3.5 py-1.5 pl-9 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg text-xs outline-none focus:border-[#008060] transition"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            </div>
          </div>

          {/* Customer list data table */}
          <DataTable
            columns={columns}
            rows={filteredCustomers}
          />
        </Card>
      )}
    </Page>
  );
}
