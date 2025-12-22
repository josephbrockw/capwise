---
sidebar_position: 2
---

# Feedback Components

Components for user feedback, notifications, and loading states.

**Location:** `next/src/components/bb/feedback/`

## Importing

```tsx
import { Modal, Toast, useToast, ToastProvider, Alert, Spinner, Skeleton, ConfirmDialog } from '@/components/bb/feedback';
```

---

## Modal

A dialog modal component with backdrop.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | boolean | **Required** | Whether modal is open |
| `onClose` | function | **Required** | Close handler |
| `title` | ReactNode | | Modal title |
| `footer` | ReactNode | | Footer content (buttons) |
| `size` | `'sm'` \| `'md'` \| `'lg'` \| `'xl'` \| `'full'` | `'md'` | Modal width |
| `dismissable` | boolean | `true` | Allow closing via ESC/backdrop |
| `children` | ReactNode | | Modal content |

**Size Reference:**

| Size | Max Width |
|------|-----------|
| `sm` | 384px |
| `md` | 448px |
| `lg` | 512px |
| `xl` | 576px |
| `full` | Full width (with margin) |

**Usage:**

```tsx
import { Modal } from '@/components/bb/feedback';
import { Button } from '@/components/bb/ui';
import { useState } from 'react';

const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Open Modal</Button>

<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>Confirm</Button>
    </>
  }
>
  <p>Are you sure you want to proceed with this action?</p>
</Modal>
```

---

## Toast System

A notification system with provider and hook.

### ToastProvider

Wrap your app with the ToastProvider to enable toasts.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | | App content |
| `position` | string | `'top-right'` | Toast position |

**Position options:** `'top-right'`, `'top-left'`, `'bottom-right'`, `'bottom-left'`, `'top-center'`, `'bottom-center'`

### useToast Hook

| Method | Description |
|--------|-------------|
| `success(message, duration?)` | Show success toast |
| `error(message, duration?)` | Show error toast |
| `warning(message, duration?)` | Show warning toast |
| `info(message, duration?)` | Show info toast |
| `addToast(message, type?, duration?)` | Custom toast |
| `removeToast(id)` | Remove specific toast |

**Usage:**

```tsx
// In layout.tsx or _app.tsx
import { ToastProvider } from '@/components/bb/feedback';

export default function RootLayout({ children }) {
  return (
    <ToastProvider position="top-right">
      {children}
    </ToastProvider>
  );
}

// In any component
import { useToast } from '@/components/bb/feedback';

function MyComponent() {
  const { success, error, warning, info } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      success('Saved successfully!');
    } catch (err) {
      error('Failed to save');
    }
  };

  return <Button onClick={handleSave}>Save</Button>;
}
```

---

## Alert

A static alert/banner component for inline messages.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'success'` \| `'error'` \| `'warning'` \| `'info'` | `'info'` | Alert type |
| `title` | string | | Alert title |
| `dismissable` | boolean | `false` | Show close button |
| `onDismiss` | function | | Dismiss handler |
| `children` | ReactNode | | Alert content |

**Usage:**

```tsx
<Alert type="warning" title="Warning">
  Your session will expire in 5 minutes.
</Alert>

<Alert type="error" dismissable onDismiss={() => setShowError(false)}>
  An error occurred while processing your request.
</Alert>
```

---

## Spinner

A loading spinner component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Spinner size |
| `color` | string | `'primary'` | Spinner color |

**Usage:**

```tsx
// Default spinner
<Spinner />

// Large spinner
<Spinner size="lg" />

// Small spinner inline with text
<Button disabled>
  <Spinner size="sm" /> Loading...
</Button>
```

---

## Skeleton

A loading placeholder component for content that's loading.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'text'` \| `'circle'` \| `'rectangle'` | `'text'` | Shape variant |
| `width` | string \| number | | Width |
| `height` | string \| number | | Height |
| `lines` | number | `1` | Number of text lines |

**Usage:**

```tsx
// Text skeleton
<Skeleton variant="text" lines={3} />

// Avatar placeholder
<Skeleton variant="circle" width={48} height={48} />

// Card placeholder
<Skeleton variant="rectangle" width="100%" height={200} />
```

---

## ConfirmDialog

A specialized modal for confirmation actions.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | boolean | **Required** | Whether dialog is open |
| `onClose` | function | **Required** | Close handler |
| `onConfirm` | function | **Required** | Confirm handler |
| `title` | string | `'Confirm'` | Dialog title |
| `message` | string | | Confirmation message |
| `confirmLabel` | string | `'Confirm'` | Confirm button text |
| `cancelLabel` | string | `'Cancel'` | Cancel button text |
| `variant` | `'danger'` \| `'warning'` \| `'info'` | `'info'` | Dialog style |

**Usage:**

```tsx
<ConfirmDialog
  open={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Delete Item"
  message="Are you sure you want to delete this item? This action cannot be undone."
  confirmLabel="Delete"
  variant="danger"
/>
```
