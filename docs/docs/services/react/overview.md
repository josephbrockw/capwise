---
sidebar_position: 1
---

# React Overview

The BaseBuild React frontend is built with React and Vite, providing a modern, responsive user interface for the application.

## Technology Stack

- **React**: JavaScript library for building user interfaces
- **Vite**: Build tool and development server
- **React Router**: For handling navigation and routing
- **Axios**: For API requests
- **Stripe**: For payment processing integration
- **Cypress**: For end-to-end testing

## Project Structure

The frontend code is organized in the `react` directory with the following structure:

```
react/
├── cypress/            # End-to-end tests
│   ├── component/      # Component tests
│   ├── e2e/            # E2E test specs
│   └── fixtures/       # Test fixtures
├── public/             # Static assets
├── src/                # Source code
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable UI components
│   │   ├── layout/     # Layout components
│   │   ├── providers/  # Context providers
│   │   └── ui/         # UI components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # Application entry point
│   └── config.js       # Configuration
└── package.json        # Dependencies and scripts
```

## Key Components

### Layout Components

Layout components in `src/components/layout/` provide consistent page structures:

- **AuthLayout**: Layout for authentication pages (login, registration)
- **DashboardLayout**: Layout for authenticated user dashboard pages

### Provider Components

Provider components in `src/components/providers/` supply context to the application:

- **StripeProvider**: Provides Stripe payment functionality

### UI Components

A comprehensive set of reusable UI components located in `src/components/ui/`. See the [Components](./components) page for detailed documentation.

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

## API Integration

The frontend communicates with the backend API using Axios. API endpoints are called directly from the components, with base URL configuration coming from environment variables:

```jsx
const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/sign-up`, {
  // Request data
});
```

## Styling

The application uses CSS modules for component-specific styling, with global styles defined in appropriate CSS files. Each component typically has its own CSS file for styling.

## Testing

The frontend includes Cypress for end-to-end testing:

```bash
# Run Cypress tests
npm run cypress:run

# Open Cypress interactive mode
npm run cypress:open

# Using the bb CLI
bb test react
```

## Getting Started

To start working with the React frontend:

1. Make sure you have Node.js installed
2. Navigate to the `react` directory
3. Install dependencies with `npm install`
4. Start the development server with `npm run dev`

The application will be available at http://localhost:5173 (or another port if 5173 is in use).
