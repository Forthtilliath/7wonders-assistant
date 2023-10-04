'use client';

import { useState } from 'react';

import { Sidebar } from './sidebar/Sidebar';

const sidebarActions = {
  current: {
    open: () => {},
    close: () => {},
    toggle: () => {},
  },
};

export function openSidebar() {
  return sidebarActions.current.open();
}

export function closeSidebar() {
  return sidebarActions.current.close();
}

export function SidebarGlobal() {
  const [isOpen, setIsOpen] = useState(false);

  sidebarActions.current = {
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((b) => !b),
  };

  return <Sidebar isOpen={isOpen} />;
}
