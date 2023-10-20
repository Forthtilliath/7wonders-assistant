import { useState } from 'react';
import { sidebarActions } from './';
import { Sidebar } from './Sidebar';

export const SidebarGlobal = () => {
  const [isOpen, setIsOpen] = useState(false);

  sidebarActions.current = {
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((b) => !b),
  };

  return <Sidebar isOpen={isOpen} />;
};
