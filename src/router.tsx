import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShellLayout from './pages/AppShellLayout';
import ProductsIndex from './pages/products/Index';
import ProductDetail from './pages/products/Detail';

// Dummy or wrapper pages for the rest of the navigation links so they are fully routing-driven!
import RegisterWrapper from './pages/RegisterWrapper';
import OrdersWrapper from './pages/OrdersWrapper';
import CustomersWrapper from './pages/CustomersWrapper';
import MarketingWrapper from './pages/MarketingWrapper';
import SettingsWrapper from './pages/SettingsWrapper';
import PurchasesWrapper from './pages/PurchasesWrapper';
import PrintWrapper from './pages/PrintWrapper';
import IntegrationsWrapper from './pages/IntegrationsWrapper';
import WebsiteWrapper from './pages/WebsiteWrapper';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/admin/products" replace />,
  },
  {
    path: '/admin',
    element: <AppShellLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="/admin/products" replace />,
      },
      {
        path: 'products',
        element: <ProductsIndex />,
      },
      {
        path: 'products/:id',
        element: <ProductDetail />,
      },
      {
        path: 'register',
        element: <RegisterWrapper />,
      },
      {
        path: 'orders',
        element: <OrdersWrapper />,
      },
      {
        path: 'customers',
        element: <CustomersWrapper />,
      },
      {
        path: 'marketing',
        element: <MarketingWrapper />,
      },
      {
        path: 'purchases',
        element: <PurchasesWrapper />,
      },
      {
        path: 'print',
        element: <PrintWrapper />,
      },
      {
        path: 'integrations',
        element: <IntegrationsWrapper />,
      },
      {
        path: 'website',
        element: <WebsiteWrapper />,
      },
      {
        path: 'settings',
        element: <SettingsWrapper />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/admin/products" replace />,
  },
]);
