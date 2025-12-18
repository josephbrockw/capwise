'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import config from '@/config';
import { Card } from '@/components/ui';
import { Button } from '@/components/bb/ui';
import { Spinner } from '@/components/bb/feedback';
import { Progress } from '@/components/bb/data-display';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const displayName = user?.name ||
    (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : null) ||
    user?.first_name ||
    user?.email?.split('@')[0] ||
    'User';

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(config.navigation.login);
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push(config.navigation.home);
  };

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
      {/* Navigation */}
      <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href={config.navigation.dashboard} className="text-xl font-bold text-zinc-900 dark:text-white">
                {config.appName}
              </Link>
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  href={config.navigation.dashboard}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-800"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/projects"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  Projects
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {displayName}
              </div>
              <Button onClick={handleLogout} variant="primary">
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Welcome back, {displayName}!
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Projects</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">12</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">+2 from last month</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active Tasks</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">28</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">5 due this week</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Completed</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">156</p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">+12 this week</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Team Members</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">8</p>
              </div>
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">3 online now</p>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">Recent Projects</h2>
            <div className="space-y-4">
              {[
                { name: 'Website Redesign', status: 'In Progress', progress: 65 },
                { name: 'Mobile App', status: 'Planning', progress: 20 },
                { name: 'API Integration', status: 'In Progress', progress: 80 },
              ].map((project, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-zinc-100 pb-4 last:border-0 dark:border-zinc-800">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">{project.name}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{project.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={project.progress} size="sm" className="w-24" />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{project.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { action: 'Completed task "Update documentation"', time: '5 minutes ago' },
                { action: 'Created new project "Marketing Site"', time: '1 hour ago' },
                { action: 'Added 2 team members', time: '3 hours ago' },
                { action: 'Deployed version 2.1.0', time: '1 day ago' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 border-b border-zinc-100 pb-4 last:border-0 dark:border-zinc-800">
                  <div className="mt-1 h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                  <div className="flex-1">
                    <p className="text-sm text-zinc-900 dark:text-white">{activity.action}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
