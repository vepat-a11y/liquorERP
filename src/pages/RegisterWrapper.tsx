import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Register from '../components/Register';

export default function RegisterWrapper() {
  const context = useOutletContext<any>();
  return (
    <Register 
      tenantId={context.activeTenantId} 
      theme={context.theme} 
      products={context.products}
      customers={context.customers}
      refreshData={context.fetchTenantData}
      showToast={context.showToast}
      discountRules={context.discountRules}
      activeUserId={context.currentUser?.id || 'usr_1'}
      activeUser={context.currentUser?.name || 'Elena Rostova'}
    />
  );
}
