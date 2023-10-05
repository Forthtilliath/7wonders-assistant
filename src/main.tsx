import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';

import { routes } from '@/data/routes';

export const router = createBrowserRouter(
  routes.map((route) => ({
    path: route.path,
    element: route.element,
    children: route.children,
  }))
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
