import React from 'react';
import { useOutletContext } from 'react-router-dom';
import PrintMaterial from '../components/PrintMaterial';

export default function PrintWrapper() {
  const context = useOutletContext<any>();
  return (
    <PrintMaterial
      products={context.products}
      showToast={context.showToast}
    />
  );
}
