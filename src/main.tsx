import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export const router = createBrowserRouter(
  ROUTES.map((route) => ({
    path: route.path,
    element: route.element,
    children: route.children,
  }))
);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
