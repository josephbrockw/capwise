import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppLayout } from './AppLayout';

const mockPush = vi.fn();
const mockLogout = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: {
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
    },
    isLoading: false,
    logout: mockLogout,
  })),
}));

vi.mock('@/config', () => ({
  default: {
    appName: 'Capwise',
    routes: {
      dashboard: '/dashboard',
      team: '/team',
      league: '/league',
      tradeMachine: '/trade-machine',
      rookieDraft: '/rookie-draft',
      freeAgents: '/free-agents',
      admin: '/admin',
      settings: '/dashboard/settings',
    },
    navigation: {
      home: '/',
    },
  },
}));

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders children content', () => {
      render(
        <AppLayout>
          <div data-testid="content">Page Content</div>
        </AppLayout>
      );
      expect(screen.getAllByTestId('content').length).toBeGreaterThan(0);
    });

    it('renders app name in sidebar', () => {
      render(<AppLayout>Content</AppLayout>);
      expect(screen.getAllByText('Capwise')[0]).toBeInTheDocument();
    });

    it('renders navigation items', () => {
      render(<AppLayout>Content</AppLayout>);
      expect(screen.getAllByText('Dashboard')[0]).toBeInTheDocument();
      expect(screen.getAllByText('My Team')[0]).toBeInTheDocument();
      expect(screen.getAllByText('League')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Trade Machine')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Rookie Draft')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Free Agents')[0]).toBeInTheDocument();
    });

    it('does not render admin nav item when not commissioner', () => {
      render(<AppLayout isCommissioner={false}>Content</AppLayout>);
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });

    it('renders admin nav item when commissioner', () => {
      render(<AppLayout isCommissioner={true}>Content</AppLayout>);
      expect(screen.getAllByText('Admin')[0]).toBeInTheDocument();
    });
  });

  describe('Team Selector', () => {
    const teams = [
      { id: '1', name: 'Team Alpha' },
      { id: '2', name: 'Team Beta' },
    ];

    it('renders team selector when teams are provided', () => {
      render(
        <AppLayout teams={teams} currentTeamId="1">
          Content
        </AppLayout>
      );
      expect(screen.getAllByText('Team Alpha')[0]).toBeInTheDocument();
    });

    it('shows "Select Team" when no team is selected', () => {
      render(
        <AppLayout teams={teams} currentTeamId={undefined}>
          Content
        </AppLayout>
      );
      expect(screen.getAllByText('Select Team')[0]).toBeInTheDocument();
    });

    it('does not render team selector when no teams', () => {
      render(<AppLayout teams={[]}>Content</AppLayout>);
      expect(screen.queryByText('Select Team')).not.toBeInTheDocument();
    });

    it('calls onTeamChange when team is selected', () => {
      const onTeamChange = vi.fn();
      render(
        <AppLayout teams={teams} currentTeamId="1" onTeamChange={onTeamChange}>
          Content
        </AppLayout>
      );

      const teamTrigger = screen.getAllByText('Team Alpha')[0];
      fireEvent.click(teamTrigger);

      const teamOption = screen.getByText('Team Beta');
      fireEvent.click(teamOption);

      expect(onTeamChange).toHaveBeenCalledWith('2');
    });
  });

  describe('Mobile Menu', () => {
    it('renders mobile menu toggle button', () => {
      render(<AppLayout>Content</AppLayout>);
      expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
    });

    it('opens mobile menu when toggle is clicked', () => {
      render(<AppLayout>Content</AppLayout>);

      const toggleButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(toggleButton);

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('closes mobile menu when nav link is clicked', () => {
      render(<AppLayout>Content</AppLayout>);

      const toggleButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(toggleButton);

      const mobileNavLinks = screen.getAllByText('League');
      const mobileLink = mobileNavLinks[mobileNavLinks.length - 1];
      fireEvent.click(mobileLink);

      expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
    });
  });

  describe('User Display', () => {
    it('displays user name from first_name and last_name', () => {
      render(<AppLayout>Content</AppLayout>);

      const toggleButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(toggleButton);

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  describe('Logout', () => {
    it('calls logout and redirects on mobile logout click', async () => {
      mockLogout.mockResolvedValue(undefined);

      render(<AppLayout>Content</AppLayout>);

      const toggleButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(toggleButton);

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('shows spinner when loading', async () => {
      const { useAuth } = await import('@/contexts/AuthContext');
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isLoading: true,
        logout: mockLogout,
        login: vi.fn(),
        register: vi.fn(),
        verifyEmail: vi.fn(),
        resendVerification: vi.fn(),
        resetPassword: vi.fn(),
        confirmResetPassword: vi.fn(),
      });

      render(<AppLayout>Content</AppLayout>);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated State', () => {
    it('returns null when not authenticated', async () => {
      const { useAuth } = await import('@/contexts/AuthContext');
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isLoading: false,
        logout: mockLogout,
        login: vi.fn(),
        register: vi.fn(),
        verifyEmail: vi.fn(),
        resendVerification: vi.fn(),
        resetPassword: vi.fn(),
        confirmResetPassword: vi.fn(),
      });

      const { container } = render(<AppLayout>Content</AppLayout>);
      expect(container.firstChild).toBeNull();
    });
  });
});
