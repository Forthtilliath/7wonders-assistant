import { NavLink } from 'react-router-dom';

import { closeSidebar } from '@/components/layout/Sidebar';

export function MenuItem({ path, icon: Icon, label }: MenuItem) {
  return (
    <li>
      <NavLink
        to={path}
        className="group flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
        onClick={closeSidebar}>
        <Icon />
        <span className="ml-3">{label}</span>
      </NavLink>
    </li>
  );
}
