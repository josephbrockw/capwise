'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import config from '@/config';
import { Spinner } from '@/components/bb/feedback';
import { Dropdown } from '@/components/bb/navigation';
import { Avatar } from '@/components/bb/data-display';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  adminOnly?: boolean;
}

function getNavItems(teamId?: string): NavItem[] {
  return [
    {
      label: 'Dashboard',
      href: config.routes.dashboard,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'My Team',
      href: teamId ? `/team/${teamId}` : '/team',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: 'League',
      href: config.routes.league,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      label: 'Trade Machine',
      href: config.routes.tradeMachine,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      label: 'Rookie Draft',
      href: config.routes.rookieDraft,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      label: 'Free Agents',
      href: config.routes.freeAgents,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    {
      label: 'Admin',
      href: config.routes.admin,
      adminOnly: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];
}

interface Team {
  id: string;
  name: string;
}

interface AppLayoutProps {
  children: ReactNode;
  teams?: Team[];
  currentTeamId?: string;
  onTeamChange?: (teamId: string) => void;
  isCommissioner?: boolean;
}

export function AppLayout({
  children,
  teams = [],
  currentTeamId: propTeamId,
  onTeamChange,
  isCommissioner = false,
}: AppLayoutProps) {
  const { user, isLoading, logout } = useAuth();
  const { currentTeam: contextTeam, userTeams, isCommissioner: contextIsCommissioner } = useTeam();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Use context team ID if prop not provided
  const currentTeamId = propTeamId || contextTeam?.id;
  const effectiveTeams = teams.length > 0 ? teams : userTeams.map(t => ({ id: t.id, name: t.name }));
  const effectiveIsCommissioner = isCommissioner || contextIsCommissioner;

  const displayName =
    user?.name ||
    (user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : null) ||
    user?.first_name ||
    user?.email?.split('@')[0] ||
    'User';

  const currentTeam = effectiveTeams.find((t) => t.id === currentTeamId);

  const handleLogout = async () => {
    await logout();
    router.push(config.navigation.home);
  };

  const navItems = getNavItems(currentTeamId);
  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || effectiveIsCommissioner
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-surface">
          <div className="flex h-16 items-center px-6 border-b border-border">
            <Link
              href={config.routes.dashboard}
              className="text-xl font-bold text-text hover:text-text-secondary transition-colors"
            >
              {config.appName}
            </Link>
          </div>

          {/* Team Selector */}
          {teams.length > 0 && (
            <div className="px-4 py-4 border-b border-border">
              <Dropdown
                trigger={
                  <div className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-surface-hover hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer">
                    <span className="text-sm font-medium text-text truncate">
                      {currentTeam?.name || 'Select Team'}
                    </span>
                    <svg
                      className="w-4 h-4 text-text-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                }
                items={teams.map((team) => ({
                  id: team.id,
                  label: team.name,
                  onClick: () => onTeamChange?.(team.id),
                }))}
                width="trigger"
              />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text'
                    }
                  `}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          {/* Top Navbar */}
          <header className="sticky top-0 z-30 h-16 border-b border-border bg-surface">
            <div className="flex h-full items-center justify-end px-6">
              <Dropdown
                trigger={
                  <Avatar
                    name={displayName}
                    color="bg-secondary-500"
                    size="sm"
                    className="cursor-pointer"
                  />
                }
                items={[
                  {
                    id: 'settings',
                    label: 'Settings',
                    href: config.routes.settings,
                  },
                  { id: 'divider', label: '', divider: true },
                  { id: 'logout', label: 'Logout', onClick: handleLogout },
                ]}
                align="right"
              />
            </div>
          </header>

          {/* Page Content */}
          <main className="px-6 py-6">{children}</main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Navbar */}
        <header className="sticky top-0 z-50 h-16 border-b border-border bg-surface">
          <div className="flex h-full items-center justify-between px-4">
            <Link
              href={config.routes.dashboard}
              className="text-xl font-bold text-text"
            >
              {config.appName}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-text-secondary hover:bg-surface-hover"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Mobile Full-Screen Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-surface pt-16">
            <div className="flex flex-col h-full">
              {/* Team Selector */}
              {teams.length > 0 && (
                <div className="px-4 py-4 border-b border-border">
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    Current Team
                  </p>
                  <Dropdown
                    trigger={
                      <div className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-surface-hover cursor-pointer">
                        <span className="text-sm font-medium text-text">
                          {currentTeam?.name || 'Select Team'}
                        </span>
                        <svg
                          className="w-4 h-4 text-text-muted"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    }
                    items={teams.map((team) => ({
                      id: team.id,
                      label: team.name,
                      onClick: () => {
                        onTeamChange?.(team.id);
                        setMobileMenuOpen(false);
                      },
                    }))}
                    width="trigger"
                  />
                </div>
              )}

              {/* Navigation */}
              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {filteredNavItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors
                        ${
                          isActive
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                            : 'text-text-secondary hover:bg-surface-hover hover:text-text'
                        }
                      `}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* User Section */}
              <div className="border-t border-border px-4 py-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    name={displayName}
                    color="bg-secondary-500"
                    size="md"
                  />
                  <div>
                    <p className="font-medium text-text">{displayName}</p>
                    <p className="text-sm text-text-muted">{user?.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href={config.routes.settings}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-text-secondary hover:bg-surface-hover hover:text-text"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        {!mobileMenuOpen && <main className="px-4 py-4">{children}</main>}
      </div>
    </div>
  );
}
