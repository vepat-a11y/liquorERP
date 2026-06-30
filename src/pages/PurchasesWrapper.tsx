import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Purchases from '../components/Purchases';

export default function PurchasesWrapper() {
  const context = useOutletContext<any>();
  return (
    <Purchases
      tenantId={context.activeTenantId}
      products={context.products}
      refreshData={context.fetchTenantData}
      showToast={context.showToast}
      permissionLevel={context.rolePermissions[context.currentUser?.role || 'Admin']?.['purchases'] || 'Admin'}
    />
  );
}
