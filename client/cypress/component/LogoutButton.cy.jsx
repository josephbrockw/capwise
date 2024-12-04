import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import LogoutButton from '../../src/components/LogoutButton';
import { useAuthStore } from '../../src/stores';

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

    // Click logout button
    cy.get('[data-cy="logout-button"]').click();

    // Wait for navigation to confirm logout completed
    cy.url().should('include', '/login');

    // Then verify data is cleared
    cy.window().then(() => {
      expect(localStorage.getItem('token')).to.be.null;
      expect(localStorage.getItem('userData')).to.be.null;
    });
  });

  it('navigates to login page after logout', () => {
    cy.get('[data-cy="logout-button"]').click();
    cy.url().should('include', '/login');
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

    // Wait for navigation to confirm logout completed
    cy.url().should('include', '/login');

    // Then verify data is cleared
    cy.window().then(() => {
      expect(localStorage.getItem('token')).to.be.null;
      expect(localStorage.getItem('userData')).to.be.null;
    });
  });

  it('is keyboard accessible', () => {
    cy.get('[data-cy="logout-button"]')
      .focus()
      .type('{enter}');

    // Wait for navigation to confirm logout completed
    cy.url().should('include', '/login');

    // Then verify data is cleared
    cy.window().then(() => {
      expect(localStorage.getItem('token')).to.be.null;
      expect(localStorage.getItem('userData')).to.be.null;
    });
  });

  it('handles logout with no stored data', () => {
    // Clear any existing data
    localStorage.clear();

    // Click logout button
    cy.get('[data-cy="logout-button"]').click();

    // Should still navigate to login
    cy.url().should('include', '/login');
  });

  it('handles logout with invalid stored data', () => {
    // Set invalid data
    localStorage.setItem('token', 'invalid-token');
    localStorage.setItem('userData', 'invalid-data');

    // Click logout button
    cy.get('[data-cy="logout-button"]').click();

    // Wait for navigation to confirm logout completed
    cy.url().should('include', '/login');

    // Then verify data is cleared
    cy.window().then(() => {
      expect(localStorage.getItem('token')).to.be.null;
      expect(localStorage.getItem('userData')).to.be.null;
    });
  });

  it('maintains proper button styling', () => {
    cy.get('[data-cy="logout-button"]')
      .should('have.class', 'logout-button')
      .and('have.css', 'cursor', 'pointer');
  });
});
