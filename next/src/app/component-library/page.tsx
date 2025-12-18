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
import {
  FormField,
  FormGroup,
  useForm,
  validators,
  type ValidationRule,
} from "@/components/bb/forms";

export default function ComponentLibrary() {
  const [selectValue, setSelectValue] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [checkboxValue, setCheckboxValue] = useState<boolean>(false);
  const [toggleValue, setToggleValue] = useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      bio: '',
      notifications: false,
      plan: '',
    },
    validationSchema: {
      firstName: [validators.required('First name is required')],
      lastName: [validators.required('Last name is required')],
      email: [validators.required('Email is required'), validators.email() as ValidationRule],
      password: [validators.required('Password is required'), validators.minLength(8, 'Password must be at least 8 characters') as ValidationRule],
      confirmPassword: [validators.required('Please confirm your password'), validators.match('password', 'Passwords do not match')],
    },
    onSubmit: async (values) => {
      console.log('Form submitted:', values);
      setFormSubmitted(true);
      setTimeout(() => setFormSubmitted(false), 3000);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href={config.navigation.home} className="text-xl font-bold text-zinc-900 dark:text-white">
                {config.appName}
              </Link>
              <span className="text-zinc-400">/</span>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Component Library</span>
            </div>
            <Link
              href={config.navigation.home}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Component Library</h1>
          <p className="text-zinc-600 dark:text-zinc-400">A showcase of all available UI components.</p>
        </div>

        <Stack gap="lg">
          {/* Form Components */}
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
          <Card>
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

          {/* Form System Demo */}
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">Form System</h2>
            <p className="text-sm text-text-muted mb-6">Complete form with validation using useForm hook, FormField, and FormGroup components.</p>

            {formSubmitted && (
              <div className="mb-4 p-3 bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300 rounded-lg text-sm">
                Form submitted successfully!
              </div>
            )}

            <form onSubmit={form.handleSubmit}>
              <Stack gap="lg">
                <FormGroup title="Personal Information" description="Please enter your basic details.">
                  <Flex gap="md" className="flex-col sm:flex-row">
                    <FormField
                      label="First Name"
                      htmlFor="firstName"
                      error={form.getFieldProps('firstName').error}
                      required
                      className="flex-1"
                    >
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={form.values.firstName as string}
                        onChange={form.getFieldProps('firstName').onChange}
                        onBlur={form.getFieldProps('firstName').onBlur}
                      />
                    </FormField>
                    <FormField
                      label="Last Name"
                      htmlFor="lastName"
                      error={form.getFieldProps('lastName').error}
                      required
                      className="flex-1"
                    >
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={form.values.lastName as string}
                        onChange={form.getFieldProps('lastName').onChange}
                        onBlur={form.getFieldProps('lastName').onBlur}
                      />
                    </FormField>
                  </Flex>
                  <FormField
                    label="Email"
                    htmlFor="email"
                    error={form.getFieldProps('email').error}
                    required
                  >
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={form.values.email as string}
                      onChange={form.getFieldProps('email').onChange}
                      onBlur={form.getFieldProps('email').onBlur}
                    />
                  </FormField>
                  <FormField
                    label="Bio"
                    htmlFor="bio"
                    helperText="Tell us a little about yourself (optional)"
                  >
                    <Input
                      id="bio"
                      name="bio"
                      multiline
                      rows={3}
                      placeholder="I'm a developer who loves..."
                      value={form.values.bio as string}
                      onChange={form.getFieldProps('bio').onChange}
                    />
                  </FormField>
                </FormGroup>

                <Divider />

                <FormGroup title="Security" description="Create a secure password for your account.">
                  <FormField
                    label="Password"
                    htmlFor="password"
                    error={form.getFieldProps('password').error}
                    required
                  >
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={form.values.password as string}
                      onChange={form.getFieldProps('password').onChange}
                      onBlur={form.getFieldProps('password').onBlur}
                    />
                  </FormField>
                  <FormField
                    label="Confirm Password"
                    htmlFor="confirmPassword"
                    error={form.getFieldProps('confirmPassword').error}
                    required
                  >
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={form.values.confirmPassword as string}
                      onChange={form.getFieldProps('confirmPassword').onChange}
                      onBlur={form.getFieldProps('confirmPassword').onBlur}
                    />
                  </FormField>
                </FormGroup>

                <Divider />

                <FormGroup title="Preferences" gap="sm">
                  <FormField label="Plan" htmlFor="plan">
                    <Select
                      id="plan"
                      name="plan"
                      value={form.values.plan as string}
                      options={[
                        { label: 'Select a plan...', value: '' },
                        { label: 'Free', value: 'free' },
                        { label: 'Pro ($9/mo)', value: 'pro' },
                        { label: 'Enterprise (Contact us)', value: 'enterprise' },
                      ]}
                      onChange={form.getFieldProps('plan').onChange}
                    />
                  </FormField>
                  <Checkbox
                    id="notifications"
                    name="notifications"
                    label="Send me email notifications about updates"
                    checked={form.values.notifications as boolean}
                    onChange={(e) => form.setValue('notifications', e.target.checked)}
                  />
                </FormGroup>

                <Divider />

                <Flex gap="md" justify="between" align="center">
                  <div className="text-sm text-text-muted">
                    {form.isDirty && <span>Unsaved changes</span>}
                  </div>
                  <Flex gap="sm">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => form.reset()}
                      disabled={!form.isDirty}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={form.isSubmitting}
                    >
                      {form.isSubmitting ? 'Submitting...' : 'Create Account'}
                    </Button>
                  </Flex>
                </Flex>
              </Stack>
            </form>
          </Card>
        </Stack>
      </main>
    </div>
  );
}
