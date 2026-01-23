import { render, screen } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { AdminLayout } from './AdminLayout';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/contexts/TeamContext', () => ({
  useTeam: vi.fn(),
}));

vi.mock('@/components/capwise/layout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="app-layout">{children}</div>,
}));

describe('AdminLayout', () => {
  const mockRouter = { push: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/admin/rosters');
  });

  it('shows loading spinner while loading', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      isSuperAdmin: false,
      isLoading: true,
    });
    (useTeam as ReturnType<typeof vi.fn>).mockReturnValue({
      isCommissioner: false,
      isLoading: true,
    });

    render(<AdminLayout>Content</AdminLayout>);

    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
  });

  it('redirects non-commissioners to dashboard', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      isSuperAdmin: false,
      isLoading: false,
    });
    (useTeam as ReturnType<typeof vi.fn>).mockReturnValue({
      isCommissioner: false,
      isLoading: false,
    });

    render(<AdminLayout>Content</AdminLayout>);

    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
  });

  it('renders admin layout for commissioners', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      isSuperAdmin: false,
      isLoading: false,
    });
    (useTeam as ReturnType<typeof vi.fn>).mockReturnValue({
      isCommissioner: true,
      isLoading: false,
    });

    render(<AdminLayout title="Test Title">Content</AdminLayout>);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('shows all nav items for super admins', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      isSuperAdmin: true,
      isLoading: false,
    });
    (useTeam as ReturnType<typeof vi.fn>).mockReturnValue({
      isCommissioner: true,
      isLoading: false,
    });

    render(<AdminLayout>Content</AdminLayout>);

    expect(screen.getByText('Rosters')).toBeInTheDocument();
    expect(screen.getByText('Draft Picks')).toBeInTheDocument();
    expect(screen.getByText('Players')).toBeInTheDocument();
    expect(screen.getByText('Rookies')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Sync')).toBeInTheDocument();
  });

  it('hides super admin only nav items for non-super admins', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      isSuperAdmin: false,
      isLoading: false,
    });
    (useTeam as ReturnType<typeof vi.fn>).mockReturnValue({
      isCommissioner: true,
      isLoading: false,
    });

    render(<AdminLayout>Content</AdminLayout>);

    expect(screen.getByText('Rosters')).toBeInTheDocument();
    expect(screen.getByText('Draft Picks')).toBeInTheDocument();
    expect(screen.queryByText('Players')).not.toBeInTheDocument();
    expect(screen.queryByText('Rookies')).not.toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Sync')).toBeInTheDocument();
  });

  it('highlights active nav item', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      isSuperAdmin: false,
      isLoading: false,
    });
    (useTeam as ReturnType<typeof vi.fn>).mockReturnValue({
      isCommissioner: true,
      isLoading: false,
    });
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/admin/rosters');

    render(<AdminLayout>Content</AdminLayout>);

    const rostersLink = screen.getByText('Rosters');
    expect(rostersLink).toHaveClass('bg-primary-500');
  });
});
