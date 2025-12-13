const config = {
  appName: 'BaseBuild',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8009',

  navigation: {
    home: '/',
    login: '/login',
    register: '/register',
    dashboard: '/dashboard',
    settings: {
      root: '/settings',
      account: '/settings#account',
      billing: '/settings#billing',
    },
  },

  api: {
    routes: {
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/sign-up',
        logout: '/api/auth/logout',
        verify: '/api/auth/verify',
        resendVerify: '/api/auth/resend-verify',
        passwordReset: '/api/auth/password/reset',
        passwordResetConfirm: '/api/auth/password/reset/confirm',
        tokenRefresh: '/api/auth/token/refresh',
      },
      user: {
        info: '/api/user/me',
      },
    },
  },

  auth: {
    minPasswordLength: 6,
    tokenKey: 'authToken',
  },
} as const;

export default config;
