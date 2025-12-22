---
sidebar_position: 6
---

# Layout Components

Components for page structure and spacing.

**Location:** `next/src/components/bb/layout/`

## Importing

```tsx
import { Container, Stack, Flex, Divider } from '@/components/bb/layout';
```

---

## Container

A responsive container component for constraining content width.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs'` \| `'sm'` \| `'md'` \| `'lg'` \| `'xl'` \| `'2xl'` | `'lg'` | Max width |
| `centered` | boolean | `true` | Center horizontally |
| `children` | ReactNode | | Content |

**Size Reference:**

| Size | Max Width |
|------|-----------|
| `xs` | 480px |
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

**Usage:**

```tsx
// Default container
<Container>
  <h1>Page Title</h1>
  <p>Content goes here...</p>
</Container>

// Narrow container for forms
<Container size="sm">
  <LoginForm />
</Container>

// Wide container for dashboards
<Container size="xl">
  <Dashboard />
</Container>
```

---

## Stack

A vertical stack layout component for consistent vertical spacing.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | number \| string | `4` | Gap between items (Tailwind spacing) |
| `align` | `'start'` \| `'center'` \| `'end'` \| `'stretch'` | `'stretch'` | Align items |
| `children` | ReactNode | | Content |

**Usage:**

```tsx
// Default stack
<Stack>
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</Stack>

// Stack with larger gap
<Stack gap={8}>
  <Section>Section 1</Section>
  <Section>Section 2</Section>
</Stack>

// Center-aligned stack
<Stack align="center">
  <Avatar />
  <h2>John Doe</h2>
  <p>Software Engineer</p>
</Stack>
```

---

## Flex

A flexbox layout component for horizontal and vertical arrangements.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'row'` \| `'column'` | `'row'` | Flex direction |
| `gap` | number \| string | `0` | Gap between items |
| `align` | `'start'` \| `'center'` \| `'end'` \| `'stretch'` \| `'baseline'` | `'stretch'` | Align items |
| `justify` | `'start'` \| `'center'` \| `'end'` \| `'between'` \| `'around'` \| `'evenly'` | `'start'` | Justify content |
| `wrap` | boolean | `false` | Flex wrap |
| `children` | ReactNode | | Content |

**Usage:**

```tsx
// Horizontal layout with space between
<Flex justify="between" align="center">
  <Logo />
  <nav>
    <NavLink href="/">Home</NavLink>
    <NavLink href="/about">About</NavLink>
  </nav>
</Flex>

// Centered content
<Flex justify="center" align="center" gap={4}>
  <Icon />
  <span>Loading...</span>
</Flex>

// Wrapping grid-like layout
<Flex wrap gap={4}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
  <Card>Item 4</Card>
</Flex>
```

---

## Divider

A divider/separator component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `'horizontal'` \| `'vertical'` | `'horizontal'` | Divider direction |
| `spacing` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Margin around divider |
| `label` | string | | Optional center label |

**Usage:**

```tsx
// Simple divider
<Divider />

// Divider with label
<Divider label="OR" />

// Divider with larger spacing
<Divider spacing="lg" />

// Vertical divider (in a Flex row)
<Flex align="center" gap={4}>
  <span>Item 1</span>
  <Divider orientation="vertical" />
  <span>Item 2</span>
</Flex>
```

---

## Layout Patterns

### Page Layout

```tsx
<Container>
  <Stack gap={8}>
    <header>
      <h1>Page Title</h1>
      <p>Description text</p>
    </header>

    <main>
      {/* Page content */}
    </main>

    <footer>
      {/* Footer content */}
    </footer>
  </Stack>
</Container>
```

### Card Grid

```tsx
<Container size="xl">
  <Flex wrap gap={6}>
    {items.map(item => (
      <div key={item.id} className="w-full md:w-1/2 lg:w-1/3">
        <Card>{item.content}</Card>
      </div>
    ))}
  </Flex>
</Container>
```

### Form Layout

```tsx
<Container size="sm">
  <Stack gap={6}>
    <FormGroup title="Account Details">
      <Stack gap={4}>
        <FormField label="Email">
          <Input id="email" name="email" />
        </FormField>
        <FormField label="Password">
          <Input id="password" name="password" type="password" />
        </FormField>
      </Stack>
    </FormGroup>

    <Divider />

    <Flex justify="end" gap={3}>
      <Button variant="ghost">Cancel</Button>
      <Button type="submit">Save</Button>
    </Flex>
  </Stack>
</Container>
```
