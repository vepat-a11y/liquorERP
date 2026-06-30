import React from 'react';
import { useOutletContext } from 'react-router-dom';
import WebsiteBuilder from '../components/WebsiteBuilder';

export default function WebsiteWrapper() {
  const context = useOutletContext<any>();
  return (
    <WebsiteBuilder
      tenantId={context.activeTenantId}
      products={context.products}
      discountRules={context.discountRules}
      incomingOrders={context.incomingOrders}
      setIncomingOrders={context.setIncomingOrders}
      showToast={context.showToast}
    />
  );
}
