import Link from "next/link";
import config from "@/config";
import { Card } from "@/components/ui";
import { Container } from "@/components/bb/layout";
import { Navbar } from "@/components/bb/navigation";
import { LinkButton } from "@/components/bb/ui";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      <Navbar
        logo={config.appName}
        logoHref={config.navigation.home}
        actions={
          <>
            <Link
              href="/component-library"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Components
            </Link>
            <Link
              href={config.navigation.login}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Log in
            </Link>
            <LinkButton href={config.navigation.register} size="sm">
              Sign up
            </LinkButton>
          </>
        }
      />

      {/* Hero Section */}
      <main>
        <Container>
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
          <div className="space-y-8">
            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl md:text-7xl">
              Build Something
              <span className="block text-zinc-600 dark:text-zinc-400">Amazing Today</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl">
              Your all-in-one platform for building modern web applications.
              Start creating, collaborating, and shipping faster than ever before.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <LinkButton href={config.navigation.register} size="lg">
                Get Started
              </LinkButton>
              <LinkButton href={config.navigation.login} variant="secondary" size="lg">
                Sign In
              </LinkButton>
            </div>
          </div>

          {/* Features */}
          <div className="mt-20 grid w-full gap-8 sm:grid-cols-3">
            <Card>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
                <svg className="h-6 w-6" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">Fast & Reliable</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Built on modern infrastructure for lightning-fast performance.
              </p>
            </Card>

            <Card>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-success)', opacity: 0.1 }}>
                <svg className="h-6 w-6" style={{ color: 'var(--color-success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">Secure by Default</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Enterprise-grade security to keep your data safe and protected.
              </p>
            </Card>

            <Card>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-contrast)', opacity: 0.1 }}>
                <svg className="h-6 w-6" style={{ color: 'var(--color-contrast)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">Easy to Use</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Intuitive interface designed for developers and teams of all sizes.
              </p>
            </Card>
          </div>
        </div>
        </Container>
      </main>
    </div>
  );
}
