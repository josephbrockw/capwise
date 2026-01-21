'use client';

import { useState } from 'react';
import Link from 'next/link';
import config from '@/config';
import { requestPasswordReset } from '@/api/auth';
import { Card, Button } from '@/components/ui';
import { Stack } from '@/components/bb/layout';
import { Alert } from '@/components/bb/feedback';
import { Input } from '@/components/bb/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await requestPasswordReset({ email });
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
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
            {isSuccess ? 'Check Your Email' : 'Forgot Password'}
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {isSuccess
              ? 'If an account exists with that email, you will receive a reset link'
              : 'Enter your email address and we\'ll send you a reset link'}
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Email Sent
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Please check your inbox and follow the instructions to reset your password.
              </p>
              <div className="pt-4">
                <Link
                  href={config.navigation.login}
                  className="inline-block w-full cursor-pointer rounded-lg bg-zinc-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  Back to Login
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
                  id="email"
                  name="email"
                  type="email"
                  label="Email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  variant="primary"
                  fullWidth
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </Stack>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href={config.navigation.login}
              className="cursor-pointer text-sm font-medium text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
            >
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
