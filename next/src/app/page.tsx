'use client';

import { useState } from "react";
import Link from "next/link";
import config from "@/config";
import { Card } from "@/components/ui";
import {
  Input,
  Select,
  Button,
  Checkbox,
  Toggle,
  Label,
} from "@/components/bb/ui";
import {
  Container,
  Stack,
  Flex,
  Divider
} from "@/components/bb/layout";


export default function Home() {
  const [selectValue, setSelectValue] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [checkboxValue, setCheckboxValue] = useState<boolean>(false);
  const [toggleValue, setToggleValue] = useState<boolean>(false);
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href={config.navigation.home} className="text-xl font-bold text-zinc-900 dark:text-white">
                {config.appName}
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={config.navigation.login}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Log in
              </Link>
              <Link
                href={config.navigation.register}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
              <Link
                href={config.navigation.register}
                className="rounded-lg bg-zinc-900 px-8 py-3 text-base font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Get Started
              </Link>
              <Link
                href={config.navigation.login}
                className="rounded-lg border border-zinc-300 px-8 py-3 text-base font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
              >
                Sign In
              </Link>
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
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">Form Components</h2>
              <Stack gap="md">
                <Stack gap="xs">
                  <Label htmlFor="select">Select Component</Label>
                  <Select
                    id="select"
                    name="select"
                    value={selectValue}
                    options={[
                      { label: 'Option 1', value: '1' },
                      { label: 'Option 2', value: '2' },
                      { label: 'Option 3', value: '3' }
                    ]}
                    onChange={(e) => {
                      console.log('Selected:', e.target.value);
                      setSelectValue(e.target.value);
                    }}
                  />
                </Stack>

                <Stack gap="xs">
                  <Label htmlFor="input">Input Component</Label>
                  <Input
                    id="input"
                    name="input"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type something..."
                  />
                </Stack>

                <Checkbox
                  id="checkbox"
                  name="checkbox"
                  label="Checkbox Component"
                  checked={checkboxValue}
                  onChange={(e) => setCheckboxValue(e.target.checked)}
                />

                <Toggle
                  id="toggle"
                  name="toggle"
                  label="Toggle Component"
                  checked={toggleValue}
                  onChange={(checked) => setToggleValue(checked)}
                />

                <Divider />

                <Stack gap="sm">
                  <Flex gap="sm" wrap>
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="light">Light</Button>
                    <Button variant="ghost">Ghost</Button>
                  </Flex>
                  <Button variant="primary" fullWidth>Full Width Button</Button>
                </Stack>
              </Stack>
            </Card>

            {/* Layout Components Demo */}
            <Card className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">Layout Components</h2>

              {/* Container Demo */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">Container</h3>
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2">
                  <Container size="sm" className="bg-primary-100 dark:bg-primary-900 rounded p-4">
                    <p className="text-sm text-center">Container (size=&quot;sm&quot;)</p>
                  </Container>
                </div>
              </div>

              <Divider />

              {/* Stack Demo */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">Stack</h3>
                <Stack gap="sm" className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
                  <div className="bg-primary-200 dark:bg-primary-800 rounded p-2 text-center text-sm">Stack Item 1</div>
                  <div className="bg-primary-200 dark:bg-primary-800 rounded p-2 text-center text-sm">Stack Item 2</div>
                  <div className="bg-primary-200 dark:bg-primary-800 rounded p-2 text-center text-sm">Stack Item 3</div>
                </Stack>
              </div>

              <Divider />

              {/* Flex Demo */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">Flex</h3>
                <Flex gap="md" justify="between" className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
                  <div className="bg-primary-200 dark:bg-primary-800 rounded p-2 text-center text-sm">Flex Item 1</div>
                  <div className="bg-primary-200 dark:bg-primary-800 rounded p-2 text-center text-sm">Flex Item 2</div>
                  <div className="bg-primary-200 dark:bg-primary-800 rounded p-2 text-center text-sm">Flex Item 3</div>
                </Flex>
              </div>

              <Divider />

              {/* Divider Demo */}
              <div>
                <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">Divider</h3>
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
                  <p className="text-sm text-center mb-0">Content above divider</p>
                  <Divider spacing="md" />
                  <p className="text-sm text-center mt-0">Content below divider</p>

                  <Flex gap="md" align="stretch" justify="center" className="h-16 mt-4">
                    <span className="text-sm">Left</span>
                    <Divider orientation="vertical" spacing="sm" />
                    <span className="text-sm">Right</span>
                  </Flex>
                </div>
              </div>
            </Card>
      </main>
    </div>
  );
}
