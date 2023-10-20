import { BrowserRouter } from 'react-router-dom';
import {
  closeSidebar,
  openSidebar,
  SidebarGlobal,
} from '@components/layout/Sidebar';
import { APP_CONST, ROUTES_MENU } from '@constants';
import { render, screen, userEvent, waitFor } from '../tests-utils';

beforeEach(() => {
  render(
    <BrowserRouter>
      <SidebarGlobal />
    </BrowserRouter>
  );
});

function getSidebar() {
  return screen.getByText(APP_CONST.title).closest('div');
}

it('renders', async () => {
  expect(getSidebar()).toBeInTheDocument();
});

it('openSidebar should open the sidebar', async () => {
  expect(getSidebar()).toHaveClass('-translate-x-full');
  await waitFor(openSidebar);
  expect(getSidebar()).not.toHaveClass('-translate-x-full');
});

it('closeSidebar should close the sidebar', async () => {
  expect(getSidebar()).toHaveClass('-translate-x-full');
  await waitFor(openSidebar);
  expect(getSidebar()).not.toHaveClass('-translate-x-full');
  await waitFor(closeSidebar);
  expect(getSidebar()).toHaveClass('-translate-x-full');
});

it('close button should close the sidebar', async () => {
  expect(getSidebar()).toHaveClass('-translate-x-full');
  await waitFor(openSidebar);
  expect(getSidebar()).not.toHaveClass('-translate-x-full');
  userEvent.click(screen.getByRole('button', { name: 'Close menu' }));
  expect(getSidebar()).not.toHaveClass('-translate-x-full');
});

it('menu should have all links', () => {
  ROUTES_MENU.forEach((menuItem) => {
    expect(screen.getByText(menuItem.label)).toBeInTheDocument();
  });
});
