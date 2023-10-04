import { NavLink } from 'react-router-dom';

import { closeSidebar } from '../SidebarGlobal';

export function MenuItem({ href, icon: Icon, label }: MenuItem) {
  return (
    <li>
      <NavLink
        to={href}
        className="group flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
        onClick={closeSidebar}>
        <Icon />
        <span className="ml-3">{label}</span>
      </NavLink>
    </li>
  );
}
