import { useState } from 'react';

import { Sidebar } from './Sidebar';
import { sidebarActions } from './sidebarActions';

export const SidebarGlobal = () => {
  const [isOpen, setIsOpen] = useState(false);

  sidebarActions.current = {
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((b) => !b),
  };

  return <Sidebar isOpen={isOpen} />;
};
