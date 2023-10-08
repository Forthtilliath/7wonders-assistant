import { BrowserRouter } from 'react-router-dom';

import {
  closeSidebar,
  openSidebar,
  SidebarGlobal,
} from '@/components/layout/Sidebar';
import { APP_CONST } from '@/data/app';
import { routesMenu } from '@/data/routes';
import { render, screen, userEvent, waitFor } from '@/lib/tests-utils';

beforeEach(() => {
  render(
    <BrowserRouter>
      <SidebarGlobal />
    </BrowserRouter>
  );
});

async function getSidebar() {
  return screen.getByText(APP_CONST.title).closest('div');
}

it('renders', async () => {
  expect(await getSidebar()).toBeInTheDocument();
});

it('openSidebar should open the sidebar', async () => {
  expect(await getSidebar()).toHaveClass('-translate-x-full');
  await waitFor(openSidebar);
  expect(await getSidebar()).not.toHaveClass('-translate-x-full');
});

it('closeSidebar should close the sidebar', async () => {
  expect(await getSidebar()).toHaveClass('-translate-x-full');
  await waitFor(openSidebar);
  expect(await getSidebar()).not.toHaveClass('-translate-x-full');
  await waitFor(closeSidebar);
  expect(await getSidebar()).toHaveClass('-translate-x-full');
});

it('close button should close the sidebar', async () => {
  expect(await getSidebar()).toHaveClass('-translate-x-full');
  await waitFor(openSidebar);
  expect(await getSidebar()).not.toHaveClass('-translate-x-full');
  userEvent.click(screen.getByRole('button', { name: 'Close menu' }));
  expect(await getSidebar()).not.toHaveClass('-translate-x-full');
});

it('menu should have all links', () => {
  routesMenu.forEach((menuItem) => {
    expect(screen.getByText(menuItem.label)).toBeInTheDocument();
  });
});
