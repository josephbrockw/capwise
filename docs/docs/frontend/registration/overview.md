---
sidebar_position: 1
---

# Registration Flow Overview

The BaseBuild registration flow is designed to provide a streamlined user experience by splitting the registration process into two separate pages with distinct purposes.

## Registration Flow Architecture

The registration process in BaseBuild is divided into two main components:

1. **Basic Account Creation** (`/register`)
2. **Payment Registration** (`/register/payment`)

This separation allows users to create an account quickly with minimal information, while still providing the option for a more comprehensive registration process when payment is required.

## User Journey

The typical user journey through the registration flow is as follows:

1. User navigates to the `/register` page
2. User enters email and password to create a basic account
3. Upon successful account creation, user receives a success message
4. If payment is required, user can proceed to the `/register/payment` page
5. On the payment page, user selects a product, enters payment details, and completes the registration

## Key Components

### Basic Registration (`RegistrationPage.jsx`)

The basic registration page handles:

- Email input with validation
- Password creation with strength requirements
- Form submission to create the user account
- Success message display via AuthLayout
- Form hiding after successful registration

### Payment Registration (`PaymentRegistrationPage.jsx`)

The payment registration page handles:

- Multi-step registration process
- Product selection interface
- Payment details collection
- Order summary display
- Completion of the full registration process

## Technical Implementation

Both registration components are implemented as React components with their own state management, form validation, and API integration. They share common styling through the `Registration.css` file but maintain separate business logic appropriate to their specific functions.

## Integration with Backend

The registration flow integrates with the backend API through:

- User creation endpoints for basic registration
- Payment processing endpoints for the payment registration
- Authentication token management for maintaining user sessions

For more detailed information about each component of the registration flow, see the following pages:

- [Basic Registration](basic-registration.md)
- [Payment Registration](payment-registration.md)
