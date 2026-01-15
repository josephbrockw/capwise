'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { login as loginUser } from '@/utils/auth';
import config from '@/config';
import { Button, Input, Card } from '@/components/ui';
import { Stack, Flex } from '@/components/bb/layout';
import { Alert } from '@/components/bb/feedback';
import { Checkbox } from '@/components/bb/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await loginUser(email, password, rememberMe);
      login(user);
      router.push(config.navigation.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href={config.navigation.home} className="text-2xl font-bold text-zinc-900 dark:text-white">
            {config.appName}
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-zinc-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
            {error && (
              <Alert variant="error">{error}</Alert>
            )}

            <Input
              id="email"
              type="email"
              label="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <Input
              id="password"
              type="password"
              label="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Flex justify="between" align="center">
              <Checkbox
                id="remember-me"
                name="remember-me"
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <Link
                href="/forgot-password"
                className="cursor-pointer text-sm font-medium text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
              >
                Forgot password?
              </Link>
            </Flex>

            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              fullWidth
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
            </Stack>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Don&apos;t have an account?{' '}
              <Link
                href={config.navigation.register}
                className="font-medium text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>

        {/* Demo Info */}
        <Alert variant="info" className="mt-4">
          <strong>Demo mode:</strong> Use any email and password (min 6 characters) to login
        </Alert>
      </div>
    </div>
  );
}
