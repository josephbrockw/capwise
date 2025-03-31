---
sidebar_position: 2
---

# Frontend Components

BaseBuild uses a component-based architecture with React to create reusable UI elements. This page provides detailed documentation for the key components used throughout the application.

## Layout Components

### AuthLayout

The `AuthLayout` component provides a consistent layout for authentication-related pages, including login and registration.

**Location:** `client/src/components/layout/AuthLayout/AuthLayout.jsx`

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `title` | string | Main title displayed at the top of the layout |
| `subtitle` | string | Subtitle displayed below the title |
| `subtext` | string | Optional text for additional context |
| `sublinkText` | string | Text for the optional link (e.g., "Log in here") |
| `sublinkUrl` | string | URL for the optional link |
| `message` | string | Success message to display |
| `errorMessage` | string | Error message to display |
| `children` | node | Content to render inside the layout |

**Usage:**

```jsx
import AuthLayout from "../../components/layout/AuthLayout/AuthLayout.jsx";

const RegistrationPage = () => {
  return (
    <AuthLayout
      title="Register"
      subtitle="Create your account"
      subtext="Already have an account?"
      sublinkText="Log in here."
      sublinkUrl="/login"
      message={successMessage}
      errorMessage={errorMessage}
    >
      {/* Form contents */}
    </AuthLayout>
  );
};
```

### DashboardLayout

Provides layout for authenticated user dashboard pages.

**Location:** `client/src/components/layout/DashboardLayout/DashboardLayout.jsx`

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `children` | node | Content to render inside the dashboard layout |
| `title` | string | Page title |
| `subtitle` | string | Optional subtitle |

## UI Components

### AddDiscount

A component for applying discount codes to purchases.

**Location:** `client/src/components/ui/AddDiscount/AddDiscount.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onApply` | function | | Function called when a discount code is applied |
| `productId` | number | | ID of the product to check discount code against |
| `initialCode` | string | | Optional pre-filled discount code |
| `onSuccess` | function | | Function called when a discount code is successfully applied |
| `onError` | function | | Function called when there's an error applying a discount code |

**Usage:**

```jsx
import AddDiscount from "../../components/ui/AddDiscount/AddDiscount.jsx";

<AddDiscount
  productId={formData.productId}
  onApply={(discountCode) => {
    // Handle discount code application
  }}
  onSuccess={(discountData) => {
    setFormData(prev => ({
      ...prev,
      discountCode: discountData
    }));
  }}
  onError={(error) => {
    setErrorMessage(error);
  }}
/>
```

### Button

A styled button component with multiple variants and sizes.

**Location:** `client/src/components/ui/Button/Button.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | `'primary'` | Button style variant (`'primary'`, `'secondary'`, `'outline'`, `'text'`) |
| `size` | string | `'medium'` | Button size (`'small'`, `'medium'`, `'large'`) |
| `fullWidth` | boolean | `false` | Whether the button should take up the full width of its container |
| `disabled` | boolean | `false` | Whether the button is disabled |
| `onClick` | function | | Function to call when the button is clicked |
| `type` | string | `'button'` | HTML button type (`'button'`, `'submit'`, `'reset'`) |
| `label` | string | | Text to display on the button |
| `icon` | node | | Optional icon to display alongside the text |
| `iconPosition` | string | `'left'` | Position of the icon (`'left'`, `'right'`) |

**Usage:**

```jsx
import Button from "../../components/ui/Button/Button.jsx";

// Primary button
<Button type="submit" variant="primary" fullWidth label="Create Account" />

// Secondary button with icon
<Button
  variant="secondary"
  label="Settings"
  icon={<SettingsIcon />}
  onClick={handleSettingsClick}
/>

// Outline button
<Button variant="outline" label="Cancel" onClick={handleCancel} />
```

### Card

A container component with consistent styling for displaying content.

**Location:** `client/src/components/ui/Card/Card.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | | Optional card title |
| `subtitle` | string | | Optional card subtitle |
| `children` | node | | Content to render inside the card |
| `footer` | node | | Optional footer content |
| `className` | string | | Additional CSS class names |
| `onClick` | function | | Optional click handler for the entire card |
| `elevation` | number | `1` | Shadow elevation level (1-5) |

**Usage:**

```jsx
import Card from "../../components/ui/Card/Card.jsx";

<Card title="User Profile" subtitle="Personal Information">
  <div className="card-content">
    <p>Name: John Doe</p>
    <p>Email: john@example.com</p>
  </div>
  <div slot="footer">
    <Button label="Edit Profile" variant="outline" />
  </div>
</Card>
```

### Chart

A data visualization component for rendering various types of charts.

**Location:** `client/src/components/ui/Chart/Chart.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | `'line'` | Chart type (`'line'`, `'bar'`, `'pie'`, `'doughnut'`) |
| `data` | object | | Data to display in the chart |
| `options` | object | | Chart configuration options |
| `height` | number | `300` | Chart height in pixels |
| `width` | number | | Chart width in pixels (defaults to container width) |

**Usage:**

```jsx
import Chart from "../../components/ui/Chart/Chart.jsx";

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [
    {
      label: 'Sales',
      data: [12, 19, 3, 5, 2],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
    },
  ],
};

<Chart type="line" data={data} height={250} />
```

### Chip

A small UI element for tags or status indicators.

**Location:** `client/src/components/ui/Chip/Chip.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | | Text to display in the chip |
| `color` | string | `'default'` | Color variant (`'default'`, `'primary'`, `'success'`, `'warning'`, `'error'`) |
| `size` | string | `'medium'` | Chip size (`'small'`, `'medium'`, `'large'`) |
| `onDelete` | function | | Function to call when the delete icon is clicked (if provided, shows a delete icon) |
| `icon` | node | | Optional icon to display at the start of the chip |
| `className` | string | | Additional CSS class names |

**Usage:**

```jsx
import Chip from "../../components/ui/Chip/Chip.jsx";

// Basic chip
<Chip label="Tag" />

// Colored chip with delete function
<Chip
  label="Removable"
  color="primary"
  onDelete={() => handleDelete(id)}
/>

// Chip with icon
<Chip
  label="Status: Active"
  color="success"
  icon={<CheckIcon />}
/>
```

### CustomSelect

An enhanced dropdown selector with improved styling and functionality.

**Location:** `client/src/components/ui/CustomSelect/CustomSelect.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | array | | Array of option objects with `value` and `label` properties |
| `value` | any | | Currently selected value |
| `onChange` | function | | Function to call when selection changes |
| `placeholder` | string | `'Select...'` | Placeholder text when no option is selected |
| `label` | string | | Label text for the select |
| `error` | string | | Error message to display |
| `disabled` | boolean | `false` | Whether the select is disabled |
| `className` | string | | Additional CSS class names |

**Usage:**

```jsx
import CustomSelect from "../../components/ui/CustomSelect/CustomSelect.jsx";

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

<CustomSelect
  label="Select an option"
  options={options}
  value={selectedOption}
  onChange={(value) => setSelectedOption(value)}
/>
```

### Drawer

A sliding panel for additional content or navigation.

**Location:** `client/src/components/ui/Drawer/Drawer.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | boolean | `false` | Whether the drawer is open |
| `onClose` | function | | Function to call when the drawer should close |
| `position` | string | `'left'` | Position of the drawer (`'left'`, `'right'`, `'top'`, `'bottom'`) |
| `width` | string | `'300px'` | Width of the drawer (for left/right drawers) |
| `height` | string | `'300px'` | Height of the drawer (for top/bottom drawers) |
| `children` | node | | Content to render inside the drawer |
| `title` | string | | Optional drawer title |
| `backdrop` | boolean | `true` | Whether to show a backdrop behind the drawer |

**Usage:**

```jsx
import Drawer from "../../components/ui/Drawer/Drawer.jsx";
import { useState } from 'react';

const [drawerOpen, setDrawerOpen] = useState(false);

<Button
  label="Open Drawer"
  onClick={() => setDrawerOpen(true)}
/>

<Drawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  position="right"
  title="Settings"
>
  <div className="drawer-content">
    {/* Drawer content here */}
  </div>
</Drawer>
```

### FloatLabel

A form input with floating label animation for improved user experience.

**Location:** `client/src/components/ui/FloatLabel/FloatLabel.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | | Unique identifier for the input |
| `label` | string | | Label text that floats above the input when focused or filled |
| `value` | string | | Current value of the input |
| `onChange` | function | | Function to call when the input value changes |
| `name` | string | | Name attribute for the input |
| `type` | string | `'text'` | Input type (`'text'`, `'email'`, `'password'`, etc.) |
| `required` | boolean | `false` | Whether the input is required |
| `error` | string | | Error message to display below the input |
| `disabled` | boolean | `false` | Whether the input is disabled |

**Usage:**

```jsx
import FloatLabel from "../../components/ui/FloatLabel/FloatLabel.jsx";

<FloatLabel
  id="email"
  label="Email"
  value={formData.email}
  onChange={handleChange}
  name="email"
  type="email"
  required
/>
```

### Forms

The Forms directory contains various form-related components for different input types and form layouts.

**Location:** `client/src/components/ui/Forms/`

**Key Components:**

- **FormGroup**: Container for grouping form elements
- **FormLabel**: Styled label for form inputs
- **FormInput**: Basic input component with consistent styling
- **FormSelect**: Styled select dropdown
- **FormCheckbox**: Styled checkbox input
- **FormRadio**: Styled radio button input

**Usage:**

```jsx
import { FormGroup, FormLabel, FormInput, FormCheckbox } from "../../components/ui/Forms";

<FormGroup>
  <FormLabel htmlFor="name">Full Name</FormLabel>
  <FormInput
    id="name"
    name="name"
    value={name}
    onChange={handleChange}
    required
  />
</FormGroup>

<FormGroup>
  <FormCheckbox
    id="terms"
    name="terms"
    checked={termsAccepted}
    onChange={handleCheckboxChange}
    label="I accept the terms and conditions"
  />
</FormGroup>
```

### MenuBar

A navigation component for displaying menu options.

**Location:** `client/src/components/ui/MenuBar/MenuBar.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | array | | Array of menu item objects |
| `activeItem` | string | | ID of the currently active menu item |
| `onItemClick` | function | | Function to call when a menu item is clicked |
| `orientation` | string | `'horizontal'` | Menu orientation (`'horizontal'`, `'vertical'`) |
| `className` | string | | Additional CSS class names |

**Usage:**

```jsx
import MenuBar from "../../components/ui/MenuBar/MenuBar.jsx";

const menuItems = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'profile', label: 'Profile', icon: <UserIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
];

<MenuBar
  items={menuItems}
  activeItem={activeMenuId}
  onItemClick={(id) => setActiveMenuId(id)}
/>
```

### MobileMenuDropdown

A dropdown menu specifically designed for mobile interfaces.

**Location:** `client/src/components/ui/MobileMenuDropdown/MobileMenuDropdown.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | array | | Array of menu item objects with `id`, `label`, and optional `icon` |
| `activeItem` | string | | ID of the currently active menu item |
| `onItemClick` | function | | Function called when a menu item is clicked |
| `label` | string | `'Menu'` | Text to display on the dropdown toggle |
| `className` | string | | Additional CSS class names |

**Usage:**

```jsx
import MobileMenuDropdown from "../../components/ui/MobileMenuDropdown/MobileMenuDropdown.jsx";

const menuItems = [
  { id: 'home', label: 'Home' },
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings' },
];

<MobileMenuDropdown
  items={menuItems}
  activeItem={activeMenuId}
  onItemClick={(id) => setActiveMenuId(id)}
  label="Navigation"
/>
```

### OtpInput

A specialized input component for one-time passwords or verification codes.

**Location:** `client/src/components/ui/OtpInput/OtpInput.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `length` | number | `6` | Number of digits in the OTP code |
| `value` | string | | Current value of the OTP |
| `onChange` | function | | Function called when the OTP value changes |
| `disabled` | boolean | `false` | Whether the input is disabled |
| `autoFocus` | boolean | `true` | Whether to focus the first input automatically |
| `className` | string | | Additional CSS class names |

**Usage:**

```jsx
import OtpInput from "../../components/ui/OtpInput/OtpInput.jsx";
import { useState } from 'react';

const [otpValue, setOtpValue] = useState('');

<OtpInput
  length={6}
  value={otpValue}
  onChange={(value) => setOtpValue(value)}
  autoFocus
/>
```

### Panel

A content container with optional header and footer.

**Location:** `client/src/components/ui/Panel/Panel.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | | Panel title displayed in the header |
| `subtitle` | string | | Optional subtitle displayed in the header |
| `children` | node | | Content to render inside the panel |
| `footer` | node | | Optional footer content |
| `headerActions` | node | | Optional actions to display in the header |
| `collapsible` | boolean | `false` | Whether the panel can be collapsed |
| `defaultCollapsed` | boolean | `false` | Whether the panel is collapsed by default |
| `className` | string | | Additional CSS class names |

**Usage:**

```jsx
import Panel from "../../components/ui/Panel/Panel.jsx";

<Panel
  title="User Statistics"
  subtitle="Last 30 days"
  headerActions={
    <Button label="Refresh" variant="text" size="small" />
  }
  collapsible
>
  <div className="panel-content">
    {/* Panel content here */}
  </div>
  <div slot="footer">
    <Button label="View Details" variant="outline" />
  </div>
</Panel>
```

### PaymentForm

Collects and validates payment information during registration.

**Location:** `client/src/components/ui/PaymentForm/PaymentForm.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `formData` | object | | Form data including product and pricing information |
| `onSubmit` | function | | Function called when payment information is submitted |
| `error` | string | | Error message to display |

**Usage:**

```jsx
import PaymentForm from "../../components/ui/PaymentForm/PaymentForm.jsx";
import StripeProvider from "../../components/providers/StripeProvider.jsx";

<StripeProvider>
  <PaymentForm
    formData={formData}
    onSubmit={(updates) => {
      setFormData(prev => ({
        ...prev,
        ...updates
      }));
    }}
  />
</StripeProvider>
```

### Product

Allows users to select a product and pricing tier during registration.

**Location:** `client/src/components/ui/Product/Product.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSelect` | function | | Function called when a product and tier are selected |
| `initialProductId` | number | | Optional pre-selected product ID |
| `initialTierId` | number | | Optional pre-selected tier ID |
| `initialPriceId` | number | | Optional pre-selected price ID |

**Usage:**

```jsx
import Product from "../../components/ui/Product/Product.jsx";

<Product
  onSelect={(productId, tierId, priceId, product, price) => {
    setFormData(prev => ({
      ...prev,
      productId,
      tierId,
      priceId,
      selectedProduct: product,
      selectedPrice: price,
      trialDays: product?.trial_days || 0
    }));
  }}
/>
```

### SelectableCards

A card-based selection interface for choosing between multiple options.

**Location:** `client/src/components/ui/SelectableCards/SelectableCards.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | array | | Array of option objects to display as cards |
| `value` | any | | Currently selected value |
| `onChange` | function | | Function called when selection changes |
| `title` | string | | Optional title for the component |
| `subtitle` | string | | Optional subtitle for the component |
| `columns` | number | `2` | Number of columns to display |
| `className` | string | | Additional CSS class names |

**Usage:**

```jsx
import SelectableCards from "../../components/ui/SelectableCards/SelectableCards.jsx";

const planOptions = [
  {
    id: 'basic',
    title: 'Basic Plan',
    description: 'For individuals',
    price: '$9.99/month',
    features: ['Feature 1', 'Feature 2']
  },
  {
    id: 'pro',
    title: 'Pro Plan',
    description: 'For professionals',
    price: '$19.99/month',
    features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4']
  }
];

<SelectableCards
  title="Choose a Plan"
  options={planOptions}
  value={selectedPlan}
  onChange={(value) => setSelectedPlan(value)}
  columns={2}
/>
```

### Sidebar

A navigation sidebar component for desktop layouts.

**Location:** `client/src/components/ui/Sidebar/Sidebar.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | array | | Array of navigation item objects |
| `activeItem` | string | | ID of the currently active item |
| `onItemClick` | function | | Function called when a navigation item is clicked |
| `collapsed` | boolean | `false` | Whether the sidebar is in collapsed state |
| `onToggleCollapse` | function | | Function called when the collapse toggle is clicked |
| `logo` | node | | Logo component to display at the top of the sidebar |
| `footer` | node | | Optional content to display at the bottom of the sidebar |
| `className` | string | | Additional CSS class names |

**Usage:**

```jsx
import Sidebar from "../../components/ui/Sidebar/Sidebar.jsx";
import { useState } from 'react';

const [activeItem, setActiveItem] = useState('dashboard');
const [collapsed, setCollapsed] = useState(false);

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'profile', label: 'Profile', icon: <ProfileIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  {
    id: 'billing',
    label: 'Billing',
    icon: <BillingIcon />,
    children: [
      { id: 'invoices', label: 'Invoices' },
      { id: 'payment-methods', label: 'Payment Methods' }
    ]
  }
];

<Sidebar
  items={navigationItems}
  activeItem={activeItem}
  onItemClick={(id) => setActiveItem(id)}
  collapsed={collapsed}
  onToggleCollapse={() => setCollapsed(!collapsed)}
  logo={<AppLogo />}
/>
```

### Skeleton

A loading placeholder component that mimics the shape of content while it's loading.

**Location:** `client/src/components/ui/Skeleton/Skeleton.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | `'text'` | Type of skeleton (`'text'`, `'circle'`, `'rectangle'`, `'card'`) |
| `width` | string or number | | Width of the skeleton (e.g., '100%', 200) |
| `height` | string or number | | Height of the skeleton |
| `count` | number | `1` | Number of skeleton items to display |
| `className` | string | | Additional CSS class names |
| `animation` | string | `'pulse'` | Animation type (`'pulse'`, `'wave'`, `'none'`) |

**Usage:**

```jsx
import Skeleton from "../../components/ui/Skeleton/Skeleton.jsx";

// Text skeleton for loading paragraph
<Skeleton variant="text" count={3} width="100%" />

// Avatar skeleton
<Skeleton variant="circle" width={40} height={40} />

// Card skeleton
<Skeleton variant="card" height={200} />
```

### Stepper Components

BaseBuild includes two types of stepper components for multi-step forms:

#### HorizontalStepper

Displays steps horizontally, ideal for desktop views.

**Location:** `client/src/components/ui/Stepper/HorizontalStepper.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | array | | Array of step objects with `title` and `validate` properties |
| `currentStep` | number | `0` | Index of the current active step |
| `setCurrentStep` | function | | Function to change the current step |
| `onSubmit` | function | | Function called when the final step is submitted |
| `formData` | object | | Form data to validate at each step |
| `children` | node | | Content to display for the current step |
| `dataCy` | string | | Data attribute for Cypress testing |

**Usage:**

```jsx
import HorizontalStepper from "@/components/ui/Stepper/HorizontalStepper.jsx";

const steps = [
  {
    title: 'Personal Info',
    validate: validateAccountDetails
  },
  {
    title: 'Product',
    validate: validateProductSelection
  },
  {
    title: 'Payment',
    validate: validatePaymentStep
  },
  {
    title: 'Confirmation',
    validate: validateConfirmation
  }
];

<HorizontalStepper
  steps={steps}
  currentStep={currentStep}
  setCurrentStep={setCurrentStep}
  onSubmit={handleSubmit}
  formData={formData}
  dataCy="registration"
>
  {renderStepContent()}
</HorizontalStepper>
```

#### VerticalStepper

Displays steps vertically, which can be better for mobile views or more complex steps.

**Location:** `client/src/components/ui/Stepper/VerticalStepper.jsx`

**Props:** Similar to HorizontalStepper

### Table

A data table component for displaying structured data in rows and columns.

**Location:** `client/src/components/ui/Table/Table.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | array | | Array of column definition objects |
| `data` | array | | Array of data objects to display in the table |
| `loading` | boolean | `false` | Whether the table is in a loading state |
| `pagination` | object | | Optional pagination configuration |
| `onRowClick` | function | | Function called when a row is clicked |
| `sortable` | boolean | `false` | Whether columns can be sorted |
| `onSort` | function | | Function called when a column is sorted |
| `emptyMessage` | string | `'No data available'` | Message to display when there is no data |
| `className` | string | | Additional CSS class names |

**Usage:**

```jsx
import Table from "../../components/ui/Table/Table.jsx";
import { useState } from 'react';

const columns = [
  { id: 'name', header: 'Name', accessor: 'name' },
  { id: 'email', header: 'Email', accessor: 'email' },
  { id: 'role', header: 'Role', accessor: 'role' },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    cell: (value) => (
      <Chip
        label={value}
        color={value === 'Active' ? 'success' : 'error'}
      />
    )
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (_, row) => (
      <Button
        variant="text"
        label="Edit"
        onClick={() => handleEdit(row.id)}
      />
    )
  },
];

const userData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Inactive' },
];

const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

<Table
  columns={columns}
  data={userData}
  sortable
  onSort={(column, direction) => setSortConfig({ key: column, direction })}
  onRowClick={(row) => handleRowClick(row)}
  pagination={{
    currentPage: 1,
    totalPages: 1,
    onPageChange: (page) => setCurrentPage(page),
  }}
/>
```

### Tabs

A tabbed interface component for organizing content into multiple sections.

**Location:** `client/src/components/ui/Tabs/Tabs.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | array | | Array of tab objects with `id`, `label`, and `content` properties |
| `activeTab` | string | | ID of the currently active tab |
| `onChange` | function | | Function called when a tab is selected |
| `orientation` | string | `'horizontal'` | Tab orientation (`'horizontal'`, `'vertical'`) |
| `className` | string | | Additional CSS class names |

**Usage:**

```jsx
import Tabs from "../../components/ui/Tabs/Tabs.jsx";

const tabs = [
  { id: 'tab1', label: 'General', content: <GeneralSettings /> },
  { id: 'tab2', label: 'Profile', content: <ProfileSettings /> },
  { id: 'tab3', label: 'Notifications', content: <NotificationSettings /> },
];

<Tabs
  tabs={tabs}
  activeTab={activeTabId}
  onChange={(id) => setActiveTabId(id)}
/>
```

### Toast System

BaseBuild includes a comprehensive toast notification system for displaying temporary messages to users. The system consists of multiple components working together.

#### Toast

The individual toast notification component that displays a message with styling based on its type.

**Location:** `client/src/components/ui/Toast/Toast.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | string | | Message to display in the toast |
| `type` | string | `'normal'` | Toast type (`'success'`, `'error'`, `'normal'`) |
| `duration` | number | `3000` | Duration in milliseconds to show the toast |
| `onClose` | function | | Function called when the toast is closed |
| `className` | string | | Additional CSS class names |
| `data-cy` | string | | Data attribute for Cypress testing |

#### ToastContainer

A container component that manages the display of all active toast notifications, grouping them by position.

**Location:** `client/src/components/ui/Toast/ToastContainer.jsx`

**Usage:**

The `ToastContainer` must be included once in your application, typically in your root layout component. It doesn't require any props as it automatically connects to the Toast context.

```jsx
import { ToastContainer } from "../../components/ui/Toast";

// In your root layout component
const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      {children}
      <ToastContainer />
    </div>
  );
};
```

#### ToastContext and ToastProvider

A context provider that makes toast functionality available throughout the application.

**Location:** `client/src/components/ui/Toast/ToastContext.jsx`

**Usage:**

The `ToastProvider` must wrap your application to enable the toast functionality:

```jsx
import { ToastProvider } from "../../components/ui/Toast";

// In your root component
const App = () => {
  return (
    <ToastProvider>
      <Router>
        <AppLayout>
          {/* Your app routes */}
        </AppLayout>
      </Router>
    </ToastProvider>
  );
};
```

#### useToast Hook

A custom hook that provides access to toast functions in any component.

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `toasts` | array | Array of active toast notifications |
| `addToast` | function | Function to add a custom toast |
| `removeToast` | function | Function to remove a toast by ID |
| `success` | function | Shorthand function to add a success toast |
| `error` | function | Shorthand function to add an error toast |
| `normal` | function | Shorthand function to add a normal toast |

**Usage:**

```jsx
import { useToast, POSITIONS } from "../../components/ui/Toast";

const MyComponent = () => {
  const { success, error, normal, addToast } = useToast();

  // Simple toast
  const handleSuccess = () => {
    success('Operation completed successfully!');
  };

  // Toast with custom options
  const handleCustomToast = () => {
    addToast({
      message: 'Custom toast with different position',
      type: 'normal',
      position: POSITIONS.TOP_RIGHT,
      duration: 5000
    });
  };

  return (
    <div>
      <Button onClick={handleSuccess}>Show Success</Button>
      <Button onClick={handleCustomToast}>Show Custom Toast</Button>
    </div>
  );
};
```

### Complete Toast System Implementation

To properly implement the toast system in your application:

1. **Wrap your application with ToastProvider**:
   ```jsx
   import { ToastProvider } from "./components/ui/Toast";

   const App = () => (
     <ToastProvider>
       <YourApp />
     </ToastProvider>
   );
   ```

2. **Add the ToastContainer to your layout**:
   ```jsx
   import { ToastContainer } from "./components/ui/Toast";

   const Layout = ({ children }) => (
     <div>
       {children}
       <ToastContainer />
     </div>
   );
   ```

3. **Use the useToast hook in your components**:
   ```jsx
   import { useToast } from "./components/ui/Toast";

   const Component = () => {
     const { success, error } = useToast();

     const handleSave = async () => {
       try {
         await saveData();
         success('Data saved successfully!');
       } catch (err) {
         error('Failed to save data: ' + err.message);
       }
     };

     return <Button onClick={handleSave}>Save</Button>;
   };
   ```

### When to Use ToastContainer

The `ToastContainer` component is **required** for the toast system to work properly. It should be included:

- **Once per application** - Including multiple ToastContainers can cause duplicate toasts
- **High in the component tree** - Typically in your root layout component
- **Outside of conditional rendering logic** - To ensure it's always present

Without the ToastContainer, toast notifications created with `useToast` will not be visible to users, as the ToastContainer is responsible for actually rendering the toast components in the DOM.

### Toast Positioning

The toast system supports multiple positions for displaying notifications:

- `POSITIONS.TOP_LEFT` - Top left corner of the screen
- `POSITIONS.TOP_RIGHT` - Top right corner of the screen
- `POSITIONS.BOTTOM_LEFT` - Bottom left corner of the screen (default)
- `POSITIONS.BOTTOM_RIGHT` - Bottom right corner of the screen

You can specify the position when creating a toast:

```jsx
addToast({
  message: 'This appears in the top right',
  position: POSITIONS.TOP_RIGHT
});
```

### Toggle

An on/off toggle switch component for binary settings.

**Location:** `client/src/components/ui/Toggle/Toggle.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | boolean | `false` | Whether the toggle is checked/on |
| `onChange` | function | | Function called when the toggle state changes |
| `label` | string | | Optional label text |
| `disabled` | boolean | `false` | Whether the toggle is disabled |
| `size` | string | `'medium'` | Toggle size (`'small'`, `'medium'`, `'large'`) |
| `className` | string | | Additional CSS class names |

**Usage:**

```jsx
import Toggle from "../../components/ui/Toggle/Toggle.jsx";
import { useState } from 'react';

const [notificationsEnabled, setNotificationsEnabled] = useState(false);

<Toggle
  label="Enable Notifications"
  checked={notificationsEnabled}
  onChange={(checked) => setNotificationsEnabled(checked)}
/>
```

### Tooltip

A component that displays additional information when users hover over an element.

**Location:** `client/src/components/ui/Tooltip/Tooltip.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | string or node | | Content to display in the tooltip |
| `position` | string | `'top'` | Tooltip position (`'top'`, `'right'`, `'bottom'`, `'left'`) |
| `children` | node | | Element that triggers the tooltip on hover |
| `delay` | number | `0` | Delay in milliseconds before showing the tooltip |
| `className` | string | | Additional CSS class names |

**Usage:**

```jsx
import Tooltip from "../../components/ui/Tooltip/Tooltip.jsx";

<Tooltip content="This is a helpful tip" position="top">
  <Button label="Help" variant="outline" />
</Tooltip>
```

## Component Best Practices

When working with BaseBuild components:

1. **Use existing components** rather than creating new ones for similar functionality
2. **Keep components small and focused** on a single responsibility
3. **Follow the established component structure** with separate directories for each component
4. **Use the provided UI components** for consistent styling throughout the application
5. **Leverage the layout components** for consistent page structure
