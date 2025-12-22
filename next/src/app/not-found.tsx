'use client';

import Link from 'next/link';
import config from '@/config';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-primary-500">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-text">Page Not Found</h2>
        <p className="mt-2 text-text-muted">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={config.navigation.home}
            className="inline-flex items-center justify-center px-6 py-3 rounded-button bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 rounded-button bg-surface hover:bg-surface-hover text-text border border-border font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
