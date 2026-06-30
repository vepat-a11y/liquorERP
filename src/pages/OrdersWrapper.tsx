import React from 'react';
import { useOutletContext } from 'react-router-dom';
import History from '../components/History';

export default function OrdersWrapper() {
  const context = useOutletContext<any>();
  return (
    <History 
      tenantId={context.activeTenantId} 
      theme={context.theme} 
      transactions={context.transactions}
      customers={context.customers}
      refreshData={context.fetchTenantData}
      showToast={context.showToast}
      permissionLevel={context.rolePermissions[context.currentUser?.role || 'Admin']?.['history'] || 'Admin'}
      activeUser={context.currentUser?.name || 'Elena Rostova'}
    />
  );
}
