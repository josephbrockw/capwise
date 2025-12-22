---
sidebar_position: 1
---

# Mobile App Overview

The BaseBuild mobile app is built with React Native and Expo, providing a cross-platform mobile experience for iOS and Android.

:::note Work in Progress
The mobile app is currently under development. This documentation will be expanded as features are implemented.
:::

## Technology Stack

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform and tooling
- **React Navigation**: Mobile navigation

## Project Structure

The mobile app code is located in the `app` directory:

```
app/
├── app/                  # Expo Router app directory
│   ├── (tabs)/           # Tab-based navigation
│   ├── _layout.tsx       # Root layout
│   └── +not-found.tsx    # 404 screen
├── assets/
│   ├── fonts/            # Custom fonts
│   └── images/           # App images
├── components/
│   └── bb/               # BaseBuild components
├── app.json              # Expo configuration
└── package.json
```

## Getting Started

```bash
# Navigate to the app directory
cd app

# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

## Running on Devices

```bash
# iOS Simulator (macOS only)
npx expo start --ios

# Android Emulator
npx expo start --android

# Scan QR code with Expo Go app
npx expo start
```

## Configuration

The app is configured via `app.json`:

- **name**: App display name
- **slug**: URL-friendly identifier
- **version**: App version
- **orientation**: Screen orientation settings
- **icon**: App icon path
- **splash**: Splash screen configuration

## Planned Features

- User authentication
- Dashboard views
- Push notifications
- Offline support

## Related Documentation

- [Django API](/docs/services/django/overview) - Backend API
- [Environment Variables](/docs/devops/environment-variables) - Configuration
