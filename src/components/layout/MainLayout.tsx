import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { PageWithAnimation } from './PageWithAnimation';
import { SidebarGlobal } from './Sidebar';
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
