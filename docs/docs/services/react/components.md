---
sidebar_position: 2
---

# React Components

BaseBuild uses a component-based architecture with React to create reusable UI elements. This page provides detailed documentation for the key components used throughout the application.

## Layout Components

### AuthLayout

The `AuthLayout` component provides a consistent layout for authentication-related pages, including login and registration.

**Location:** `react/src/components/layout/AuthLayout/AuthLayout.jsx`

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

**Location:** `react/src/components/layout/DashboardLayout/DashboardLayout.jsx`

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `children` | node | Content to render inside the dashboard layout |
| `title` | string | Page title |
| `subtitle` | string | Optional subtitle |

## UI Components

### Button

A styled button component with multiple variants and sizes.

**Location:** `react/src/components/ui/Button/Button.jsx`

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

**Location:** `react/src/components/ui/Card/Card.jsx`

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

**Location:** `react/src/components/ui/Chart/Chart.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | `'line'` | Chart type (`'line'`, `'bar'`, `'pie'`, `'doughnut'`) |
| `data` | object | | Data to display in the chart |
| `options` | object | | Chart configuration options |
| `height` | number | `300` | Chart height in pixels |
| `width` | number | | Chart width in pixels (defaults to container width) |

### Chip

A small UI element for tags or status indicators.

**Location:** `react/src/components/ui/Chip/Chip.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | | Text to display in the chip |
| `color` | string | `'default'` | Color variant (`'default'`, `'primary'`, `'success'`, `'warning'`, `'error'`) |
| `size` | string | `'medium'` | Chip size (`'small'`, `'medium'`, `'large'`) |
| `onDelete` | function | | Function to call when the delete icon is clicked |
| `icon` | node | | Optional icon to display at the start of the chip |

### CustomSelect

An enhanced dropdown selector with improved styling.

**Location:** `react/src/components/ui/CustomSelect/CustomSelect.jsx`

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

### Drawer

A sliding panel for additional content or navigation.

**Location:** `react/src/components/ui/Drawer/Drawer.jsx`

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

### FloatLabel

A form input with floating label animation.

**Location:** `react/src/components/ui/FloatLabel/FloatLabel.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | | Unique identifier for the input |
| `label` | string | | Label text that floats above the input |
| `value` | string | | Current value of the input |
| `onChange` | function | | Function to call when the input value changes |
| `name` | string | | Name attribute for the input |
| `type` | string | `'text'` | Input type (`'text'`, `'email'`, `'password'`, etc.) |
| `required` | boolean | `false` | Whether the input is required |
| `error` | string | | Error message to display below the input |
| `disabled` | boolean | `false` | Whether the input is disabled |

### OtpInput

A specialized input component for one-time passwords or verification codes.

**Location:** `react/src/components/ui/OtpInput/OtpInput.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `length` | number | `6` | Number of digits in the OTP code |
| `value` | string | | Current value of the OTP |
| `onChange` | function | | Function called when the OTP value changes |
| `disabled` | boolean | `false` | Whether the input is disabled |
| `autoFocus` | boolean | `true` | Whether to focus the first input automatically |

### Panel

A content container with optional header and footer.

**Location:** `react/src/components/ui/Panel/Panel.jsx`

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

### Stepper Components

#### HorizontalStepper

Displays steps horizontally, ideal for desktop views.

**Location:** `react/src/components/ui/Stepper/HorizontalStepper.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | array | | Array of step objects with `title` and `validate` properties |
| `currentStep` | number | `0` | Index of the current active step |
| `setCurrentStep` | function | | Function to change the current step |
| `onSubmit` | function | | Function called when the final step is submitted |
| `formData` | object | | Form data to validate at each step |
| `children` | node | | Content to display for the current step |

#### VerticalStepper

Displays steps vertically, which can be better for mobile views.

**Location:** `react/src/components/ui/Stepper/VerticalStepper.jsx`

### Table

A data table component for displaying structured data.

**Location:** `react/src/components/ui/Table/Table.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | array | | Array of column definition objects |
| `data` | array | | Array of data objects to display |
| `loading` | boolean | `false` | Whether the table is in a loading state |
| `pagination` | object | | Optional pagination configuration |
| `onRowClick` | function | | Function called when a row is clicked |
| `sortable` | boolean | `false` | Whether columns can be sorted |
| `emptyMessage` | string | `'No data available'` | Message when there is no data |

### Tabs

A tabbed interface component for organizing content.

**Location:** `react/src/components/ui/Tabs/Tabs.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | array | | Array of tab objects with `id`, `label`, and `content` properties |
| `activeTab` | string | | ID of the currently active tab |
| `onChange` | function | | Function called when a tab is selected |
| `orientation` | string | `'horizontal'` | Tab orientation (`'horizontal'`, `'vertical'`) |

### Toast System

The toast system provides temporary notification messages.

**Components:**

- **Toast**: Individual toast notification
- **ToastContainer**: Container for all active toasts
- **ToastProvider**: Context provider for toast functionality
- **useToast**: Hook for accessing toast functions

**Location:** `react/src/components/ui/Toast/`

**Usage:**

```jsx
import { useToast } from "../../components/ui/Toast";

const MyComponent = () => {
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

### Toggle

An on/off toggle switch component.

**Location:** `react/src/components/ui/Toggle/Toggle.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | boolean | `false` | Whether the toggle is checked/on |
| `onChange` | function | | Function called when the toggle state changes |
| `label` | string | | Optional label text |
| `disabled` | boolean | `false` | Whether the toggle is disabled |
| `size` | string | `'medium'` | Toggle size (`'small'`, `'medium'`, `'large'`) |

### Tooltip

Displays additional information on hover.

**Location:** `react/src/components/ui/Tooltip/Tooltip.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | string or node | | Content to display in the tooltip |
| `position` | string | `'top'` | Tooltip position (`'top'`, `'right'`, `'bottom'`, `'left'`) |
| `children` | node | | Element that triggers the tooltip on hover |
| `delay` | number | `0` | Delay in milliseconds before showing the tooltip |

## Component Best Practices

When working with BaseBuild components:

1. **Use existing components** rather than creating new ones for similar functionality
2. **Keep components small and focused** on a single responsibility
3. **Follow the established component structure** with separate directories for each component
4. **Use the provided UI components** for consistent styling throughout the application
5. **Leverage the layout components** for consistent page structure
