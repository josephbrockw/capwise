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
import {
  ToastProvider,
  useToast,
  Alert,
  Modal,
  ConfirmDialog,
  Spinner,
  Skeleton,
  CardSkeleton,
  TableRowSkeleton,
  AvatarSkeleton,
} from "@/components/bb/feedback";
import {
  Table,
  EmptyState,
  Badge,
  Avatar,
  AvatarGroup,
} from "@/components/bb/data-display";
import {
  Tabs,
  TabPanel,
  Breadcrumbs,
  Dropdown,
} from "@/components/bb/navigation";

const sampleTableData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'active' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Viewer', status: 'inactive' },
];

const sampleTableColumns = [
  { field: 'name', label: 'Name', sortable: true },
  { field: 'email', label: 'Email', sortable: true },
  { field: 'role', label: 'Role' },
  {
    field: 'status',
    label: 'Status',
    render: (value: unknown) => (
      <Badge variant={value === 'active' ? 'success' : 'default'} size="sm" rounded dot>
        {String(value)}
      </Badge>
    ),
  },
];

function ToastDemo() {
  const { success, error, warning, info } = useToast();
  return (
    <Flex gap="sm" wrap>
      <Button variant="primary" onClick={() => success('Success toast!')}>Success</Button>
      <Button variant="secondary" onClick={() => error('Error toast!')}>Error</Button>
      <Button variant="light" onClick={() => warning('Warning toast!')}>Warning</Button>
      <Button variant="ghost" onClick={() => info('Info toast!')}>Info</Button>
    </Flex>
  );
}

export default function ComponentLibrary() {
  const [selectValue, setSelectValue] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [checkboxValue, setCheckboxValue] = useState<boolean>(false);
  const [toggleValue, setToggleValue] = useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [alertVisible, setAlertVisible] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('tab1');

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
    <ToastProvider>
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

          {/* Feedback Components Demo */}
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">Feedback Components</h2>

            {/* Toast Demo */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">Toast</h3>
              <p className="text-sm text-text-muted mb-3">Click buttons to trigger toast notifications.</p>
              <ToastDemo />
            </div>

            <Divider />

            {/* Alert Demo */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">Alert</h3>
              <Stack gap="sm">
                <Alert variant="info" title="Information">This is an informational alert.</Alert>
                <Alert variant="success">Operation completed successfully!</Alert>
                <Alert variant="warning" title="Warning">Please review before continuing.</Alert>
                <Alert variant="error">Something went wrong. Please try again.</Alert>
                {alertVisible && (
                  <Alert variant="info" onClose={() => setAlertVisible(false)}>
                    This alert can be dismissed. Click the X to close.
                  </Alert>
                )}
                {!alertVisible && (
                  <Button variant="ghost" onClick={() => setAlertVisible(true)}>Show dismissable alert</Button>
                )}
              </Stack>
            </div>

            <Divider />

            {/* Modal Demo */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">Modal</h3>
              <Button variant="primary" onClick={() => setShowModal(true)}>Open Modal</Button>
              <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                title="Example Modal"
                footer={
                  <Flex gap="sm" justify="end">
                    <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={() => setShowModal(false)}>Save Changes</Button>
                  </Flex>
                }
              >
                <p className="text-text-secondary">This is the modal content. You can put any content here.</p>
                <p className="text-text-muted text-sm mt-2">Press Escape or click outside to close.</p>
              </Modal>
            </div>

            <Divider />

            {/* ConfirmDialog Demo */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">Confirm Dialog</h3>
              <Flex gap="sm">
                <Button variant="secondary" onClick={() => setShowConfirm(true)}>Delete Item</Button>
              </Flex>
              <ConfirmDialog
                open={showConfirm}
                onCancel={() => setShowConfirm(false)}
                onConfirm={() => {
                  console.log('Confirmed!');
                  setShowConfirm(false);
                }}
                title="Delete Item?"
                message="Are you sure you want to delete this item? This action cannot be undone."
                variant="danger"
                confirmLabel="Delete"
              />
            </div>

            <Divider />

            {/* Spinner Demo */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">Spinner</h3>
              <Flex gap="lg" align="end">
                <Stack gap="xs" align="center">
                  <Spinner size="sm" />
                  <span className="text-xs text-text-muted">Small</span>
                </Stack>
                <Stack gap="xs" align="center">
                  <Spinner size="md" />
                  <span className="text-xs text-text-muted">Medium</span>
                </Stack>
                <Stack gap="xs" align="center">
                  <Spinner size="lg" />
                  <span className="text-xs text-text-muted">Large</span>
                </Stack>
                <Spinner size="md" label="Loading..." />
              </Flex>
            </div>

            <Divider />

            {/* Skeleton Demo */}
            <div>
              <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">Skeleton</h3>
              <Stack gap="md">
                <div>
                  <p className="text-sm text-text-muted mb-2">Basic variants:</p>
                  <Stack gap="sm">
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="title" width="40%" />
                    <Flex gap="sm">
                      <Skeleton variant="circular" width={40} height={40} />
                      <Skeleton variant="rectangular" width={100} height={40} />
                      <Skeleton variant="button" />
                    </Flex>
                  </Stack>
                </div>
                <Divider />
                <div>
                  <p className="text-sm text-text-muted mb-2">Preset skeletons:</p>
                  <Flex gap="md" wrap>
                    <div className="w-64">
                      <p className="text-xs text-text-muted mb-1">CardSkeleton</p>
                      <CardSkeleton />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">AvatarSkeleton</p>
                      <AvatarSkeleton />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-xs text-text-muted mb-1">TableRowSkeleton</p>
                      <TableRowSkeleton />
                      <TableRowSkeleton />
                    </div>
                  </Flex>
                </div>
              </Stack>
            </div>
          </Card>

          {/* Data Display Components Demo */}
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">Data Display Components</h2>

            {/* Table Demo */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">Table</h3>
              <p className="text-sm text-text-muted mb-3">Sortable table with custom cell rendering.</p>
              <Table
                columns={sampleTableColumns}
                data={sampleTableData}
                sortable
                hover
              />
            </div>

            <Divider />

            {/* EmptyState Demo */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">Empty State</h3>
              <div className="border border-border rounded-lg">
                <EmptyState
                  title="No results found"
                  message="Try adjusting your search or filter to find what you're looking for."
                  actionLabel="Clear filters"
                  onAction={() => console.log('Clear filters clicked')}
                />
              </div>
            </div>

            <Divider />

            {/* Badge Demo */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">Badge</h3>
              <Stack gap="sm">
                <div>
                  <p className="text-sm text-text-muted mb-2">Variants:</p>
                  <Flex gap="sm" wrap>
                    <Badge variant="default">Default</Badge>
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="danger">Danger</Badge>
                  </Flex>
                </div>
                <div>
                  <p className="text-sm text-text-muted mb-2">With dot indicator:</p>
                  <Flex gap="sm" wrap>
                    <Badge variant="success" dot>Active</Badge>
                    <Badge variant="danger" dot>Offline</Badge>
                    <Badge variant="warning" dot>Pending</Badge>
                  </Flex>
                </div>
                <div>
                  <p className="text-sm text-text-muted mb-2">Rounded (pill):</p>
                  <Flex gap="sm" wrap>
                    <Badge variant="primary" rounded>v1.0.0</Badge>
                    <Badge variant="success" rounded>New</Badge>
                    <Badge variant="default" rounded onRemove={() => console.log('Remove')}>Removable</Badge>
                  </Flex>
                </div>
                <div>
                  <p className="text-sm text-text-muted mb-2">Sizes:</p>
                  <Flex gap="sm" align="center" wrap>
                    <Badge size="sm">Small</Badge>
                    <Badge size="md">Medium</Badge>
                    <Badge size="lg">Large</Badge>
                  </Flex>
                </div>
              </Stack>
            </div>

            <Divider />

            {/* Avatar Demo */}
            <div>
              <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">Avatar</h3>
              <Stack gap="sm">
                <div>
                  <p className="text-sm text-text-muted mb-2">With initials:</p>
                  <Flex gap="sm" align="center">
                    <Avatar name="John Doe" size="xs" />
                    <Avatar name="Jane Smith" size="sm" />
                    <Avatar name="Bob Wilson" size="md" />
                    <Avatar name="Alice" size="lg" />
                    <Avatar name="Charlie Brown" size="xl" />
                  </Flex>
                </div>
                <div>
                  <p className="text-sm text-text-muted mb-2">Fallback (no name or image):</p>
                  <Flex gap="sm" align="center">
                    <Avatar size="md" />
                    <Avatar size="md" rounded={false} />
                  </Flex>
                </div>
                <div>
                  <p className="text-sm text-text-muted mb-2">Avatar Group:</p>
                  <AvatarGroup max={4}>
                    <Avatar name="John Doe" />
                    <Avatar name="Jane Smith" />
                    <Avatar name="Bob Wilson" />
                    <Avatar name="Alice Johnson" />
                    <Avatar name="Charlie Brown" />
                    <Avatar name="Diana Prince" />
                  </AvatarGroup>
                </div>
              </Stack>
            </div>
          </Card>

          {/* Navigation Components Demo */}
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">Navigation Components</h2>

            {/* Breadcrumbs Demo */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">Breadcrumbs</h3>
              <Breadcrumbs
                items={[
                  { label: 'Products', href: '/products' },
                  { label: 'Electronics', href: '/products/electronics' },
                  { label: 'Phones' },
                ]}
              />
            </div>

            <Divider />

            {/* Tabs Demo */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">Tabs</h3>
              <Stack gap="md">
                <div>
                  <p className="text-sm text-text-muted mb-2">Line variant (default):</p>
                  <Tabs
                    tabs={[
                      { id: 'tab1', label: 'Overview' },
                      { id: 'tab2', label: 'Features' },
                      { id: 'tab3', label: 'Pricing', disabled: true },
                    ]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                  />
                  <div className="p-4 border border-t-0 border-border rounded-b-lg">
                    <TabPanel tabId="tab1" activeTab={activeTab}>
                      <p className="text-text-secondary">Overview content goes here.</p>
                    </TabPanel>
                    <TabPanel tabId="tab2" activeTab={activeTab}>
                      <p className="text-text-secondary">Features content goes here.</p>
                    </TabPanel>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-text-muted mb-2">Pills variant:</p>
                  <Tabs
                    tabs={[
                      { id: 'p1', label: 'All' },
                      { id: 'p2', label: 'Active' },
                      { id: 'p3', label: 'Archived' },
                    ]}
                    activeTab="p1"
                    onChange={() => {}}
                    variant="pills"
                  />
                </div>
              </Stack>
            </div>

            <Divider />

            {/* Dropdown Demo */}
            <div>
              <h3 className="text-lg font-medium mb-2 text-zinc-700 dark:text-zinc-300">Dropdown</h3>
              <Flex gap="md">
                <Dropdown
                  trigger={
                    <Button variant="secondary">
                      Actions
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>
                  }
                  items={[
                    { id: 'edit', label: 'Edit', onClick: () => console.log('Edit') },
                    { id: 'duplicate', label: 'Duplicate', onClick: () => console.log('Duplicate') },
                    { id: 'divider1', label: '', divider: true },
                    { id: 'archive', label: 'Archive', onClick: () => console.log('Archive') },
                    { id: 'delete', label: 'Delete', onClick: () => console.log('Delete'), disabled: true },
                  ]}
                />
                <Dropdown
                  trigger={
                    <Button variant="ghost">
                      With Submenu
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>
                  }
                  items={[
                    { id: 'profile', label: 'Profile', href: '/profile' },
                    {
                      id: 'settings',
                      label: 'Settings',
                      items: [
                        { id: 'account', label: 'Account', href: '/settings/account' },
                        { id: 'privacy', label: 'Privacy', href: '/settings/privacy' },
                      ],
                    },
                    { id: 'divider', label: '', divider: true },
                    { id: 'logout', label: 'Logout', onClick: () => console.log('Logout') },
                  ]}
                  align="right"
                />
              </Flex>
            </div>
          </Card>
        </Stack>
      </main>
    </div>
    </ToastProvider>
  );
}
