---
sidebar_position: 3
---

# Data Display Components

Components for displaying data, tables, and status information.

**Location:** `next/src/components/bb/data-display/`

## Importing

```tsx
import { Table, Avatar, Badge, Progress, EmptyState } from '@/components/bb/data-display';
```

---

## Table

A data table with sorting support.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `TableColumn[]` | **Required** | Column definitions |
| `data` | `T[]` | **Required** | Data array |
| `keyField` | string | `'id'` | Unique row key field |
| `striped` | boolean | `false` | Alternate row colors |
| `bordered` | boolean | `false` | Show borders |
| `hover` | boolean | `true` | Hover effect |
| `compact` | boolean | `false` | Compact sizing |
| `sortable` | boolean | `false` | Enable sorting |
| `onRowClick` | function | | Row click handler |
| `emptyMessage` | string | `'No data available'` | Empty state message |

**TableColumn Interface:**

| Field | Type | Description |
|-------|------|-------------|
| `field` | string | Data field name |
| `label` | string | Column header text |
| `sortable` | boolean | Enable sorting for column |
| `render` | function | Custom cell renderer |
| `className` | string | Cell CSS class |
| `headerClassName` | string | Header CSS class |

**Usage:**

```tsx
import { Table } from '@/components/bb/data-display';
import { Badge } from '@/components/bb/data-display';
import { Button } from '@/components/bb/ui';

const columns = [
  { field: 'name', label: 'Name', sortable: true },
  { field: 'email', label: 'Email' },
  {
    field: 'status',
    label: 'Status',
    render: (value) => (
      <Badge variant={value === 'active' ? 'success' : 'warning'}>
        {value}
      </Badge>
    ),
  },
  {
    field: 'actions',
    label: '',
    render: (_, row) => (
      <Button variant="ghost" onClick={() => handleEdit(row)}>
        Edit
      </Button>
    ),
  },
];

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'pending' },
];

<Table
  columns={columns}
  data={users}
  sortable
  striped
  onRowClick={(row) => console.log('Clicked:', row)}
/>
```

---

## Avatar

A user avatar component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | string | | Image source URL |
| `alt` | string | | Alt text |
| `name` | string | | Name for initials fallback |
| `size` | `'xs'` \| `'sm'` \| `'md'` \| `'lg'` \| `'xl'` | `'md'` | Avatar size |
| `shape` | `'circle'` \| `'square'` | `'circle'` | Avatar shape |

**Usage:**

```tsx
// With image
<Avatar src="/path/to/avatar.jpg" alt="John Doe" />

// With initials fallback
<Avatar name="John Doe" size="lg" />

// Square avatar
<Avatar src="/logo.png" shape="square" size="sm" />
```

---

## Badge

A badge/tag component for status and labels.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default'` \| `'primary'` \| `'success'` \| `'warning'` \| `'danger'` | `'default'` | Badge color |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Badge size |
| `children` | ReactNode | | Badge content |

**Usage:**

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Expired</Badge>
<Badge variant="primary" size="sm">New</Badge>
```

---

## Progress

A progress bar component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | number | **Required** | Current value (0-100) |
| `max` | number | `100` | Maximum value |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Bar height |
| `color` | `'primary'` \| `'success'` \| `'warning'` \| `'danger'` | `'primary'` | Bar color |
| `showLabel` | boolean | `false` | Show percentage label |
| `animated` | boolean | `false` | Animate the bar |

**Usage:**

```tsx
// Basic progress
<Progress value={75} />

// With label
<Progress value={50} showLabel />

// Colored progress
<Progress value={90} color="success" />

// Animated
<Progress value={30} animated />
```

---

## EmptyState

An empty state placeholder component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | | Empty state title |
| `description` | string | | Description text |
| `icon` | ReactNode | | Icon to display |
| `action` | ReactNode | | Action button/link |

**Usage:**

```tsx
<EmptyState
  title="No results found"
  description="Try adjusting your search or filter to find what you're looking for."
  action={
    <Button variant="secondary" onClick={clearFilters}>
      Clear Filters
    </Button>
  }
/>
```
