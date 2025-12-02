import Header from '../../src/components/Header';
import { BrowserRouter } from 'react-router-dom';

describe('Header Component', () => {
  beforeEach(() => {
    // Mount Header with Router context
    cy.mount(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
  });

  it('renders all navigation links', () => {
    cy.get('nav').should('exist');
    cy.get('nav ul li').should('have.length', 4);
  });

  it('contains correct link text and destinations', () => {
    const links = [
      { text: 'Home', path: '/' },
      { text: 'Login', path: '/login' },
      { text: 'Register', path: '/register' },
      { text: 'Dashboard', path: '/dashboard' }
    ];

    links.forEach(link => {
      cy.get('nav')
        .contains(link.text)
        .should('have.attr', 'href', link.path);
    });
  });

  it('renders links in correct order', () => {
    cy.get('nav ul li').eq(0).should('contain', 'Home');
    cy.get('nav ul li').eq(1).should('contain', 'Login');
    cy.get('nav ul li').eq(2).should('contain', 'Register');
    cy.get('nav ul li').eq(3).should('contain', 'Dashboard');
  });

  it('has proper HTML structure', () => {
    cy.get('nav').within(() => {
      cy.get('ul').should('exist');
      cy.get('ul > li').should('have.length', 4);
      cy.get('ul > li > a').should('have.length', 4);
    });
  });

  it('has working navigation links', () => {
    // Test each link click
    const links = ['/', '/login', '/register', '/dashboard'];

    links.forEach(path => {
      cy.get(`a[href="${path}"]`).click();
      // In component test, we can verify the link exists and is clickable
      cy.location('pathname').should('eq', path);
    });
  });

  it('applies active styles to current route', () => {
    cy.get('a[href="/"]').click();
    cy.get('a[href="/"]').should('have.class', 'active');

    cy.get('a[href="/login"]').click();
    cy.get('a[href="/login"]').should('have.class', 'active');
  });

  it('maintains accessibility standards', () => {
    // Check if nav has proper ARIA role
    cy.get('nav').should('have.attr', 'role', 'navigation');

    // Verify links are keyboard accessible
    cy.get('nav a').each($link => {
      cy.wrap($link)
        .should('have.attr', 'href')
        .and('not.be.empty');
    });
  });

  it('handles keyboard focus', () => {
    // Test that we can focus each link
    cy.get('nav a').each($link => {
      cy.wrap($link).focus().should('be.focused');
    });
  });

  it('maintains link functionality when clicked multiple times', () => {
    // Click same link multiple times
    cy.get('a[href="/login"]').click().click().click();
    cy.location('pathname').should('eq', '/login');

    cy.get('a[href="/"]').click();
    cy.location('pathname').should('eq', '/');
  });
});
