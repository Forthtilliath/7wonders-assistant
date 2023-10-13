import { Outlet } from 'react-router-dom';
import { ResetGame } from '../utils/ResetGame';
import { Header } from './Header';
import { PageWithAnimation } from './PageWithAnimation';
import { SidebarGlobal } from './Sidebar';
import '@/index.css';

export function MainLayout() {
  return (
    <>
      <ResetGame />
      <SidebarGlobal />

      <Header />
      <PageWithAnimation>
        <Outlet />
      </PageWithAnimation>
    </>
  );
}
