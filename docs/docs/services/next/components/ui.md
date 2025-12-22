---
sidebar_position: 1
---

# UI Components

Core UI components for building interfaces.

**Location:** `next/src/components/bb/ui/`

## Importing

```tsx
import { Button, Input, Checkbox, Select, Toggle, Label, LinkButton } from '@/components/bb/ui';
```

---

## Button

A styled button component with multiple variants.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | | Text to display on the button |
| `icon` | string | | Icon class name |
| `variant` | `'primary'` \| `'secondary'` \| `'light'` \| `'ghost'` | `'primary'` | Button style variant |
| `tag` | `'button'` \| `'div'` | `'button'` | HTML element to render |
| `fullWidth` | boolean | `false` | Whether button takes full width |
| `disabled` | boolean | `false` | Whether button is disabled |
| `children` | ReactNode | | Content to render inside button |

**Usage:**

```tsx
// Primary button
<Button label="Submit" type="submit" />

// Secondary button
<Button variant="secondary" label="Cancel" onClick={handleCancel} />

// Ghost button with full width
<Button variant="ghost" fullWidth>
  Learn More
</Button>

// Disabled button
<Button disabled label="Processing..." />
```

---

## Input

A flexible input component with support for text and textarea.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | **Required** | Unique identifier |
| `name` | string | **Required** | Input name attribute |
| `label` | string | | Label text |
| `error` | string | | Error message to display |
| `helperText` | string | | Helper text below input |
| `debounceTime` | number | `0` | Debounce delay in ms |
| `multiline` | boolean | `false` | Render as textarea |
| `rows` | number | `3` | Rows for textarea |
| `required` | boolean | `false` | Whether input is required |
| `disabled` | boolean | `false` | Whether input is disabled |

**Usage:**

```tsx
// Basic input
<Input
  id="email"
  name="email"
  label="Email Address"
  type="email"
  required
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// Input with error
<Input
  id="password"
  name="password"
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
/>

// Textarea
<Input
  id="description"
  name="description"
  label="Description"
  multiline
  rows={5}
  helperText="Maximum 500 characters"
/>

// Debounced input (for search)
<Input
  id="search"
  name="search"
  placeholder="Search..."
  debounceTime={300}
  onChange={(e) => handleSearch(e.target.value)}
/>
```

---

## Checkbox

A styled checkbox component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | **Required** | Unique identifier |
| `name` | string | **Required** | Checkbox name |
| `label` | string | | Label text |
| `checked` | boolean | `false` | Whether checked |
| `onChange` | function | | Change handler |
| `disabled` | boolean | `false` | Whether disabled |

**Usage:**

```tsx
<Checkbox
  id="terms"
  name="terms"
  label="I agree to the terms and conditions"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
/>
```

---

## Select

A dropdown select component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | **Required** | Unique identifier |
| `name` | string | **Required** | Select name |
| `label` | string | | Label text |
| `options` | `{value: string, label: string}[]` | | Options array |
| `value` | string | | Selected value |
| `onChange` | function | | Change handler |
| `placeholder` | string | | Placeholder text |
| `error` | string | | Error message |
| `disabled` | boolean | `false` | Whether disabled |

**Usage:**

```tsx
const options = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
];

<Select
  id="country"
  name="country"
  label="Country"
  options={options}
  value={country}
  onChange={(e) => setCountry(e.target.value)}
  placeholder="Select a country"
/>
```

---

## Toggle

An on/off toggle switch.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | **Required** | Unique identifier |
| `name` | string | **Required** | Toggle name |
| `label` | string | | Label text |
| `checked` | boolean | `false` | Whether on |
| `onChange` | function | | Change handler |
| `disabled` | boolean | `false` | Whether disabled |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Toggle size |

**Usage:**

```tsx
<Toggle
  id="notifications"
  name="notifications"
  label="Enable notifications"
  checked={notificationsEnabled}
  onChange={(e) => setNotificationsEnabled(e.target.checked)}
/>
```

---

## Label

A form label component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `htmlFor` | string | | Associated input id |
| `required` | boolean | `false` | Show required indicator |
| `disabled` | boolean | `false` | Disabled styling |
| `children` | ReactNode | | Label content |

**Usage:**

```tsx
<Label htmlFor="email" required>
  Email Address
</Label>
<Input id="email" name="email" type="email" />
```

---

## LinkButton

A button-styled link component for navigation.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | string | **Required** | Link destination |
| `variant` | `'primary'` \| `'secondary'` \| `'ghost'` | `'primary'` | Button style |
| `children` | ReactNode | | Link content |

**Usage:**

```tsx
<LinkButton href="/dashboard" variant="primary">
  Go to Dashboard
</LinkButton>
```
