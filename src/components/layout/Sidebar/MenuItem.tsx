import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { cn } from '@helpers';
import { closeSidebar } from './';

export function MenuItem({ path, icon: Icon, label }: MenuItem) {
  const { t } = useTranslation();

  return (
    <li>
      <NavLink
        to={path}
        className={({ isActive }) =>
          cn(
            'group flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700',
            {
              'bg-black/50 dark:text-yellow-400': isActive,
            }
          )
        }
        onClick={closeSidebar}>
        <Icon />
        <span className="ml-3">{t(label)}</span>
      </NavLink>
    </li>
  );
}
