import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Integrations from '../components/Integrations';

export default function IntegrationsWrapper() {
  const context = useOutletContext<any>();
  return (
    <Integrations
      tenantId={context.activeTenantId}
      products={context.products}
      transactions={context.transactions}
      refreshData={context.fetchTenantData}
      showToast={context.showToast}
      incomingOrders={context.incomingOrders}
      setIncomingOrders={context.setIncomingOrders}
    />
  );
}
