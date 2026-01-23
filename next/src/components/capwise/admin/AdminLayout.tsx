'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { AppLayout } from '@/components/capwise/layout';
import { Spinner } from '@/components/bb/feedback';

export interface AdminNavItem {
  label: string;
  href: string;
  superAdminOnly?: boolean;
}

const adminNavItems: AdminNavItem[] = [
  { label: 'Rosters', href: '/admin/rosters' },
  { label: 'Draft Picks', href: '/admin/draft-picks' },
  { label: 'Players', href: '/admin/players', superAdminOnly: true },
  { label: 'Rookies', href: '/admin/rookies', superAdminOnly: true },
  { label: 'Settings', href: '/admin/settings' },
  { label: 'Sync', href: '/admin/sync' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSuperAdmin, isLoading: authLoading } = useAuth();
  const { isCommissioner, isLoading: teamLoading } = useTeam();

  const isLoading = authLoading || teamLoading;

  useEffect(() => {
    if (!isLoading && !isCommissioner) {
      router.push('/dashboard');
    }
  }, [isLoading, isCommissioner, router]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" label="Loading..." />
        </div>
      </AppLayout>
    );
  }

  if (!isCommissioner) {
    return null;
  }

  const visibleNavItems = adminNavItems.filter(
    (item) => !item.superAdminOnly || isSuperAdmin
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="border-b border-border pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-text">
                {title || 'Admin'}
              </h1>
              <p className="text-sm text-text-muted mt-1">
                Commissioner tools and settings
              </p>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors
                    ${
                      isActive
                        ? 'bg-primary-500 text-white'
                        : 'text-text-muted hover:text-text hover:bg-surface-hover'
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {children}
      </div>
    </AppLayout>
  );
}
