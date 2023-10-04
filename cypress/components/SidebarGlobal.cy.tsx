import React from 'react';

import {
  closeSidebar,
  openSidebar,
  SidebarGlobal,
} from '@/components/layout/SidebarGlobal';
import { METADATA } from '@/data/app';
import { menuPages } from '@/data/menu';

describe('<SidebarGlobal />', () => {
  beforeEach(() => {
    cy.mount(<SidebarGlobal />);
  });
  
  it('renders', () => {
    cy.get('#drawer-navigation-label').contains(METADATA.title);
  });

  it('openSidebar should open the sidebar', () => {
    cy.get('#drawer-navigation')
      .should('have.class', '-translate-x-full')
      .then(openSidebar);

    cy.get('#drawer-navigation').should('not.have.class', '-translate-x-full');
  });

  it('closeSidebar should close the sidebar', () => {
    cy.get('#drawer-navigation')
      .should('have.class', '-translate-x-full')
      .then(openSidebar);

    cy.get('#drawer-navigation')
      .should('not.have.class', '-translate-x-full')
      .then(closeSidebar);

    cy.get('#drawer-navigation').should('have.class', '-translate-x-full');
  });

  it('close button should close the sidebar', () => {
    cy.get('#drawer-navigation')
      .should('have.class', '-translate-x-full')
      .then(openSidebar);

    cy.get('#drawer-navigation')
      .should('not.have.class', '-translate-x-full')
      .then(() => {
        cy.get('#drawer-navigation button').click();
      });

    cy.get('#drawer-navigation').should('have.class', '-translate-x-full');
  });

  it('menu should has all links', () => {
    menuPages.forEach((menuItem) => {
      cy.get(`a[href*="${menuItem.href}"] span`).contains(menuItem.label);
    });
  });
});
