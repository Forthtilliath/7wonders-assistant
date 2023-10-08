import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { routes } from '@/data/routes';

export const router = createBrowserRouter(
  routes.map((route) => ({
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
