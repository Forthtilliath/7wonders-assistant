import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ConfirmContextProvider } from '@lib';
import '@lib/i18next';
import { ROUTES } from '@constants';

export const router = createBrowserRouter(
  ROUTES.map((route) => ({
    path: route.path,
    element: route.element,
    children: route.children,
  }))
);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfirmContextProvider>
      <RouterProvider router={router} />
    </ConfirmContextProvider>
  </React.StrictMode>
);
