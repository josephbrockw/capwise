'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import config from '@/config';
import { confirmPasswordReset } from '@/api/auth';
import { Card, Button } from '@/components/ui';
import { Stack } from '@/components/bb/layout';
import { Alert, Spinner } from '@/components/bb/feedback';
import { Input } from '@/components/bb/ui';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const validatePassword = (): string | null => {
    if (password.length < config.auth.minPasswordLength) {
      return `Password must be at least ${config.auth.minPasswordLength} characters`;
    }
    if (password !== passwordConfirm) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!token) {
      setError('Reset token is required');
      return;
    }

    setIsLoading(true);

    try {
      await confirmPasswordReset({
        token,
        password,
        password_confirm: passwordConfirm,
      });
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
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
            {isSuccess ? 'Password Reset!' : 'Reset Your Password'}
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {isSuccess
              ? 'Your password has been successfully reset'
              : 'Enter your new password below'}
          </p>
        </div>

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
                All set!
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                You can now sign in with your new password.
              </p>
              <div className="pt-4">
                <Link
                  href={config.navigation.login}
                  className="inline-block w-full cursor-pointer rounded-lg bg-zinc-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                {error && (
                  <Alert variant="error">{error}</Alert>
                )}

                {!tokenFromUrl && (
                  <Input
                    id="token"
                    name="token"
                    type="text"
                    label="Reset Token"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter reset token from email"
                    disabled={isLoading}
                  />
                )}

                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="New Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                />

                <Input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  label="Confirm New Password"
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  disabled={isLoading || !password || !passwordConfirm || !token}
                  variant="primary"
                  fullWidth
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </Stack>
            </form>
          )}

          {!isSuccess && (
            <div className="mt-6 text-center">
              <Link
                href={config.navigation.login}
                className="cursor-pointer text-sm font-medium text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
              >
                Back to Login
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
