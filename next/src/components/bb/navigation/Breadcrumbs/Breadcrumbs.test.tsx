import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Breadcrumbs } from './Breadcrumbs';

describe('Breadcrumbs', () => {
  const items = [
    { label: 'Products', href: '/products' },
    { label: 'Category', href: '/products/category' },
    { label: 'Item' },
  ];

  describe('Rendering', () => {
    it('renders with navigation role', () => {
      render(<Breadcrumbs items={items} />);
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Breadcrumb');
    });

    it('renders all items', () => {
      render(<Breadcrumbs items={items} />);
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Item')).toBeInTheDocument();
    });

    it('renders home icon by default', () => {
      render(<Breadcrumbs items={items} data-testid="breadcrumbs" />);
      const nav = screen.getByTestId('breadcrumbs');
      expect(nav.querySelector('svg')).toBeInTheDocument();
    });

    it('hides home when showHome is false', () => {
      render(<Breadcrumbs items={items} showHome={false} />);
      expect(screen.queryByRole('link', { name: /home/i })).not.toBeInTheDocument();
    });
  });

  describe('Links', () => {
    it('renders items with href as links', () => {
      render(<Breadcrumbs items={items} />);
      expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/products');
    });

    it('renders last item as text (not link)', () => {
      render(<Breadcrumbs items={items} />);
      expect(screen.queryByRole('link', { name: 'Item' })).not.toBeInTheDocument();
      expect(screen.getByText('Item')).toBeInTheDocument();
    });

    it('sets aria-current on last item', () => {
      render(<Breadcrumbs items={items} />);
      expect(screen.getByText('Item')).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Separator', () => {
    it('renders default separator', () => {
      render(<Breadcrumbs items={items} data-testid="breadcrumbs" />);
      const nav = screen.getByTestId('breadcrumbs');
      const separators = nav.querySelectorAll('[aria-hidden="true"]');
      expect(separators.length).toBeGreaterThan(0);
    });

    it('renders custom separator', () => {
      render(<Breadcrumbs items={items} separator={<span>/</span>} />);
      const slashes = screen.getAllByText('/');
      expect(slashes.length).toBeGreaterThan(0);
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Breadcrumbs items={items} className="custom-class" data-testid="breadcrumbs" />);
      expect(screen.getByTestId('breadcrumbs')).toHaveClass('custom-class');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to nav element', () => {
      const ref = createRef<HTMLElement>();
      render(<Breadcrumbs ref={ref} items={items} />);
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('Display name', () => {
    it('has correct displayName', () => {
      expect(Breadcrumbs.displayName).toBe('Breadcrumbs');
    });
  });
});
