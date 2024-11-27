import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import LogoutButton from '../../src/components/LogoutButton';
import { storageHelper } from '../../src/utils/apiInit';

describe('LogoutButton Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Mount LogoutButton with Router context
    cy.mount(
      <BrowserRouter>
        <LogoutButton />
      </BrowserRouter>
    );
  });

  it('renders with correct text and classes', () => {
    cy.get('[data-cy="logout-button"]')
      .should('exist')
      .and('have.text', 'Logout')
      .and('have.class', 'logout-button');
  });

  it('clears user data from localStorage on click', () => {
    // Set up test data
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userData', JSON.stringify({ id: 1, name: 'Test User' }));

    // Verify data is in localStorage
    expect(localStorage.getItem('token')).to.equal('test-token');
    expect(localStorage.getItem('userData')).to.exist;

    // Click logout button
    cy.get('[data-cy="logout-button"]').click();

    // Verify data is cleared
    cy.should(() => {
      expect(localStorage.getItem('token')).to.be.null;
      expect(localStorage.getItem('userData')).to.be.null;
    });
  });

  it('navigates to login page after logout', () => {
    cy.get('[data-cy="logout-button"]').click();
    cy.location('pathname').should('eq', '/login');
  });

  it('maintains functionality when clicked multiple times', () => {
    // Set up test data
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userData', JSON.stringify({ id: 1, name: 'Test User' }));

    // Click multiple times
    cy.get('[data-cy="logout-button"]')
      .click()
      .click()
      .click();

    // Verify final state
    cy.should(() => {
      expect(localStorage.getItem('token')).to.be.null;
      expect(localStorage.getItem('userData')).to.be.null;
    });
    cy.location('pathname').should('eq', '/login');
  });

  it('is keyboard accessible', () => {
    cy.get('[data-cy="logout-button"]')
      .focus()
      .should('be.focused')
      .type('{enter}');

    // Verify logout occurred
    cy.should(() => {
      expect(localStorage.getItem('token')).to.be.null;
      expect(localStorage.getItem('userData')).to.be.null;
    });
    cy.location('pathname').should('eq', '/login');
  });

  it('handles logout with no stored data', () => {
    // Ensure localStorage is empty
    localStorage.clear();

    // Click logout
    cy.get('[data-cy="logout-button"]').click();

    // Should still navigate to login
    cy.location('pathname').should('eq', '/login');
  });

  it('handles logout with invalid stored data', () => {
    // Set up invalid test data
    localStorage.setItem('token', 'invalid-token');
    localStorage.setItem('userData', 'invalid-json');

    // Click logout
    cy.get('[data-cy="logout-button"]').click();

    // Verify cleanup and navigation
    cy.should(() => {
      expect(localStorage.getItem('token')).to.be.null;
      expect(localStorage.getItem('userData')).to.be.null;
    });
    cy.location('pathname').should('eq', '/login');
  });

  it('maintains proper button styling', () => {
    cy.get('[data-cy="logout-button"]')
      .should('have.class', 'logout-button')
      .and('be.visible')
      .and('be.enabled');
  });
});
