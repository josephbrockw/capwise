---
sidebar_position: 1
---

# Frontend Overview

The BaseBuild frontend is built with React and provides a modern, responsive user interface for the application.

## Technology Stack

- **React**: JavaScript library for building user interfaces
- **Vite**: Build tool and development server
- **React Router**: For handling navigation and routing
- **Axios**: For API requests
- **Stripe**: For payment processing integration
- **Cypress**: For end-to-end testing

## Project Structure

The frontend code is organized in the `client` directory with the following structure:

```
client/
├── cypress/            # End-to-end tests
├── public/             # Static assets
├── src/                # Source code
│   ├── components/     # Reusable UI components
│   │   ├── layout/     # Layout components
│   │   ├── providers/  # Context providers
│   │   └── ui/         # UI components
│   ├── pages/          # Page components
│   │   ├── Registration/  # Registration-related pages
│   │   └── ...         # Other pages
│   ├── services/       # API service functions
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Application entry point
└── package.json        # Dependencies and scripts
```

## Key Components

### UI Components

The frontend includes a comprehensive set of reusable UI components located in `src/components/ui/`. These include:

- **Button** (`client/src/components/ui/Button/Button.jsx`): Styled button component with multiple variants, supporting different sizes, colors, and states (primary, secondary, disabled, etc.).

- **FloatLabel** (`client/src/components/ui/FloatLabel/FloatLabel.jsx`): Form inputs with animated floating labels that move above the input when the field is focused or contains content, improving user experience.

- **Card** (`client/src/components/ui/Card/Card.jsx`): Container component with consistent styling for displaying content, supporting headers, footers, and various content layouts.

- **Chart** (`client/src/components/ui/Chart/Chart.jsx`): Data visualization component for rendering various types of charts (line, bar, pie) to represent data visually.

- **Chip** (`client/src/components/ui/Chip/Chip.jsx`): Small UI element used for tags, status indicators, or compact information display, with optional dismiss functionality.

- **CustomSelect** (`client/src/components/ui/CustomSelect/CustomSelect.jsx`): Enhanced dropdown selector with improved styling and functionality compared to the native HTML select element.

- **Drawer** (`client/src/components/ui/Drawer/Drawer.jsx`): Sliding panel that appears from the edge of the screen, used for additional content, navigation, or forms without leaving the current page.

- **MenuBar** (`client/src/components/ui/MenuBar/MenuBar.jsx`): Navigation component for displaying menu options, typically used in the application header.

- **Panel** (`client/src/components/ui/Panel/Panel.jsx`): Content container with optional header, footer, and configurable styling, used for grouping related content.

- **Product** (`client/src/components/ui/Product/Product.jsx`): Component for displaying and selecting products and pricing tiers during the registration process.

- **PaymentForm** (`client/src/components/ui/PaymentForm/PaymentForm.jsx`): Form component for collecting and validating payment information, integrated with Stripe for secure payment processing.

- **SelectableCards** (`client/src/components/ui/SelectableCards/SelectableCards.jsx`): Card-based selection interface where users can choose between multiple options presented as cards.

- **Stepper** (`client/src/components/ui/Stepper/`): Components for multi-step forms and processes:
  - **HorizontalStepper** (`HorizontalStepper.jsx`): Displays steps horizontally, ideal for desktop views
  - **VerticalStepper** (`VerticalStepper.jsx`): Displays steps vertically, better for mobile views or complex steps

- **Tabs** (`client/src/components/ui/Tabs/Tabs.jsx`): Tabbed interface component for organizing content into multiple sections that can be accessed without navigating to a different page.

- **Toast** (`client/src/components/ui/Toast/Toast.jsx`): Notification display component for showing temporary messages to users (success, error, warning, etc.).

- **Toggle** (`client/src/components/ui/Toggle/Toggle.jsx`): On/off toggle switch component for binary settings or options, with customizable styling.

- **Tooltip** (`client/src/components/ui/Tooltip/Tooltip.jsx`): Component that displays additional information when users hover over an element, improving usability without cluttering the interface.

### Layout Components

Layout components in `src/components/layout/` provide consistent page structures:

- **AuthLayout**: Layout for authentication pages (login, registration)
- **DashboardLayout**: Layout for authenticated user dashboard pages

### Provider Components

Provider components in `src/components/providers/` supply context to the application:

- **StripeProvider**: Provides Stripe payment functionality

## Registration Flow

The registration flow is split into two separate pages:

1. **Basic Registration** (`/register`)
   - Implemented in `src/pages/Registration/RegistrationPage.jsx`
   - Handles basic account creation with email and password
   - Uses the `AuthLayout` component for consistent styling
   - Shows a success message after successful registration

2. **Payment Registration** (`/register/payment`)
   - Implemented in `src/pages/Registration/PaymentRegistrationPage.jsx`
   - Provides a multi-step registration process with:
     - Account creation
     - Product selection
     - Payment details collection
     - Order summary
   - Uses the `HorizontalStepper` component to manage the multi-step process

This split allows for a simpler account creation process while maintaining the option for a full registration with payment when needed.

## API Integration

The frontend communicates with the backend API using Axios. API endpoints are called directly from the components, with base URL configuration coming from environment variables:

```jsx
const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/sign-up`, {
  // Request data
});
```

## Styling

The application uses CSS modules for component-specific styling, with global styles defined in appropriate CSS files. Each component typically has its own CSS file for styling, such as `Registration.css` for the registration pages.

## Testing

The frontend includes Cypress for end-to-end testing, with test files located in the `cypress/e2e/` directory. These tests verify critical user flows like authentication.

## Getting Started

To start working with the frontend code:

1. Make sure you have Node.js installed
2. Navigate to the `client` directory
3. Install dependencies with `npm install`
4. Start the development server with `npm run dev`

The application will be available at http://localhost:5173 (or another port if 5173 is in use).
