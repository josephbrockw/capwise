'use client';

import { useState } from 'react';
import Link from 'next/link';
import { register as registerUser } from '@/utils/auth';
import config from '@/config';
import { Button, Input, Card } from '@/components/ui';
import { Stack } from '@/components/bb/layout';
import { Alert } from '@/components/bb/feedback';
import { Checkbox } from '@/components/bb/ui';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < config.auth.minPasswordLength) {
      setError(`Password must be at least ${config.auth.minPasswordLength} characters`);
      return;
    }

    setIsLoading(true);

    try {
      await registerUser(email, password, name);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Get started with BaseBuild today
          </p>
        </div>

        {/* Register Form */}
        <Card>
          {isSuccess ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Check your email
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                We&apos;ve sent a verification email to <strong>{email}</strong>.
                Please click the link in the email to verify your account.
              </p>
              <div className="pt-4">
                <Link
                  href={config.navigation.login}
                  className="text-sm font-medium text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
                >
                  Return to login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
              {error && (
                <Alert variant="error">{error}</Alert>
              )}

            <Input
              id="name"
              name="name"
              type="text"
              label="Full name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <div>
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Must be at least {config.auth.minPasswordLength} characters
              </p>
            </div>

            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              label="Confirm password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Checkbox
              id="terms"
              name="terms"
              required
              label={
                <>
                  I agree to the{' '}
                  <Link href="#" className="font-medium hover:text-zinc-700 dark:hover:text-zinc-300">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="#" className="font-medium hover:text-zinc-700 dark:hover:text-zinc-300">
                    Privacy Policy
                  </Link>
                </>
              }
            />

            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              fullWidth
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
              </Stack>
          </form>
          )}

          {!isSuccess && (
            <div className="mt-6 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Already have an account?{' '}
              <Link
                href={config.navigation.login}
                className="font-medium text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
              >
                Sign in
              </Link>
            </p>
          </div>
          )}
        </Card>

        {/* Demo Info */}
        <Alert variant="info" className="mt-4">
          <strong>Demo mode:</strong> Registration creates a mock account for testing
        </Alert>
      </div>
    </div>
  );
}
