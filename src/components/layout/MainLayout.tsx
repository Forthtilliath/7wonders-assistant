import { Outlet } from 'react-router-dom';

import { Header } from '@/components/layout/Header';
import PageWithAnimation from '@/components/layout/PageWithAnimation';
import { SidebarGlobal } from '@/components/layout/Sidebar/SidebarGlobal';
import '@/index.css';

export function MainLayout() {
  return (
    <>
      <SidebarGlobal />

      <Header />
      <PageWithAnimation>
        <Outlet />
      </PageWithAnimation>
    </>
  );
}
