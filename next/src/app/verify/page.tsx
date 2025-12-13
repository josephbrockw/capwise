'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import config from '@/config';
import { verifyEmail, resendVerificationEmail } from '@/api/auth';
import { Card, Button } from '@/components/ui';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showResendForm, setShowResendForm] = useState(false);

  const handleVerify = useCallback(async (verificationToken?: string) => {
    const tokenToVerify = verificationToken || token;

    if (!tokenToVerify) {
      setError('Please enter a verification code');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await verifyEmail({ token: tokenToVerify });
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setShowResendForm(true);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // If token is in URL, verify immediately
    if (tokenFromUrl) {
      handleVerify(tokenFromUrl);
    }
  }, [tokenFromUrl, handleVerify]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setIsResending(true);

    try {
      const response = await resendVerificationEmail(email);
      setError('');
      alert(response.message || 'Verification email sent! Please check your inbox.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
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
            {isSuccess ? 'Email Verified!' : 'Verify Your Email'}
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {isSuccess
              ? 'Your email has been successfully verified'
              : 'Enter the 6-digit code sent to your email'}
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
                You can now sign in to your account.
              </p>
              <div className="pt-4">
                <Link
                  href={config.navigation.login}
                  className="inline-block w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="token" className="block text-sm font-medium text-zinc-900 dark:text-white">
                    Verification Code
                  </label>
                  <input
                    id="token"
                    type="text"
                    maxLength={6}
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value.toUpperCase())}
                    className="input-field mt-1 w-full text-center text-2xl tracking-widest"
                    placeholder="X X X X X X"
                    disabled={isLoading}
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Enter the 6-character code from your email
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || token.length !== 6}
                  variant="primary"
                  className="w-full"
                >
                  {isLoading ? 'Verifying...' : 'Verify Email'}
                </Button>
              </form>

              {showResendForm && (
                <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                  <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                    Didn&apos;t receive the code?
                  </p>
                  <form onSubmit={handleResend} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-zinc-900 dark:text-white">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field mt-1 w-full"
                        placeholder="you@example.com"
                        disabled={isResending}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isResending}
                      variant="secondary"
                      className="w-full"
                    >
                      {isResending ? 'Sending...' : 'Resend Verification Email'}
                    </Button>
                  </form>
                </div>
              )}

              {!showResendForm && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setShowResendForm(true)}
                    className="text-sm font-medium text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
                  >
                    Didn&apos;t receive a code?
                  </button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
