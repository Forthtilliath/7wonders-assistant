export const sidebarActions = {
  current: {
    open: () => {},
    close: () => {},
    toggle: () => {},
  },
};

export const openSidebar = () => sidebarActions.current.open();
export const closeSidebar = () => sidebarActions.current.close();