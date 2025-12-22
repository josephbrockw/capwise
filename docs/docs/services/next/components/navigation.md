---
sidebar_position: 4
---

# Navigation Components

Components for navigation, menus, and routing.

**Location:** `next/src/components/bb/navigation/`

## Importing

```tsx
import { Tabs, TabPanel, Navbar, NavLink, Breadcrumbs, Dropdown } from '@/components/bb/navigation';
```

---

## Tabs

A tabbed interface component.

**Tab Interface:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique tab identifier |
| `label` | string | Tab button text |
| `icon` | ReactNode | Optional icon |
| `disabled` | boolean | Disable tab |

**Tabs Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `Tab[]` | **Required** | Tab definitions |
| `activeTab` | string | **Required** | Active tab id |
| `onChange` | function | **Required** | Tab change handler |
| `variant` | `'line'` \| `'pills'` \| `'enclosed'` | `'line'` | Tab style |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Tab size |
| `fullWidth` | boolean | `false` | Full width tabs |

**TabPanel Props:**

| Prop | Type | Description |
|------|------|-------------|
| `tabId` | string | Associated tab id |
| `activeTab` | string | Currently active tab id |
| `children` | ReactNode | Panel content |

**Usage:**

```tsx
import { Tabs, TabPanel } from '@/components/bb/navigation';
import { useState } from 'react';

const [activeTab, setActiveTab] = useState('general');

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'security', label: 'Security' },
  { id: 'notifications', label: 'Notifications', disabled: true },
];

<Tabs
  tabs={tabs}
  activeTab={activeTab}
  onChange={setActiveTab}
  variant="pills"
/>

<TabPanel tabId="general" activeTab={activeTab}>
  <p>General settings content</p>
</TabPanel>

<TabPanel tabId="security" activeTab={activeTab}>
  <p>Security settings content</p>
</TabPanel>
```

**Variant Examples:**

```tsx
// Line tabs (default)
<Tabs tabs={tabs} activeTab={active} onChange={setActive} variant="line" />

// Pill tabs
<Tabs tabs={tabs} activeTab={active} onChange={setActive} variant="pills" />

// Enclosed tabs
<Tabs tabs={tabs} activeTab={active} onChange={setActive} variant="enclosed" />
```

---

## Navbar

A navigation bar component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `brand` | ReactNode | | Brand/logo element |
| `children` | ReactNode | | Nav items |
| `sticky` | boolean | `true` | Stick to top |
| `transparent` | boolean | `false` | Transparent background |

**Usage:**

```tsx
<Navbar brand={<Logo />}>
  <NavLink href="/">Home</NavLink>
  <NavLink href="/about">About</NavLink>
  <NavLink href="/contact">Contact</NavLink>
</Navbar>
```

---

## NavLink

A navigation link with active state detection.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | string | **Required** | Link destination |
| `exact` | boolean | `false` | Exact path matching |
| `children` | ReactNode | | Link content |
| `className` | string | | Additional classes |
| `activeClassName` | string | | Classes when active |

**Usage:**

```tsx
<NavLink href="/dashboard" exact>
  Dashboard
</NavLink>

<NavLink href="/settings">
  Settings
</NavLink>
```

---

## Breadcrumbs

A breadcrumb navigation component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `{label: string, href?: string}[]` | **Required** | Breadcrumb items |
| `separator` | ReactNode | `'/'` | Separator between items |

**Usage:**

```tsx
const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Electronics', href: '/products/electronics' },
  { label: 'Laptops' }, // Current page, no href
];

<Breadcrumbs items={breadcrumbs} />

// Custom separator
<Breadcrumbs items={breadcrumbs} separator=">" />
```

---

## Dropdown

A dropdown menu component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | ReactNode | **Required** | Trigger element |
| `items` | `DropdownItem[]` | **Required** | Menu items |
| `align` | `'left'` \| `'right'` | `'left'` | Menu alignment |

**DropdownItem Interface:**

| Field | Type | Description |
|-------|------|-------------|
| `label` | string | Item text |
| `onClick` | function | Click handler |
| `href` | string | Link destination |
| `icon` | ReactNode | Optional icon |
| `disabled` | boolean | Disable item |
| `divider` | boolean | Show divider after |

**Usage:**

```tsx
const menuItems = [
  { label: 'Profile', href: '/profile' },
  { label: 'Settings', href: '/settings' },
  { divider: true },
  { label: 'Logout', onClick: handleLogout },
];

<Dropdown
  trigger={<Button variant="ghost">Menu</Button>}
  items={menuItems}
  align="right"
/>
```
