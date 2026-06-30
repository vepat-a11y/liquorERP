import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Marketing from '../components/Marketing';

export default function MarketingWrapper() {
  const context = useOutletContext<any>();
  return (
    <Marketing
      customers={context.customers}
      discountRules={context.discountRules}
      onAddDiscountRule={(rule) => context.saveDiscountRules([rule, ...context.discountRules])}
      showToast={context.showToast}
    />
  );
}
