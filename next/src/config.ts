const config = {
  appName: 'Capwise',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8009',
  isDevelopment: process.env.NODE_ENV === 'development',

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

  routes: {
    dashboard: '/dashboard',
    team: (id: string) => `/team/${id}`,
    league: '/league',
    tradeMachine: '/trade-machine',
    rookieDraft: '/rookie-draft',
    freeAgents: '/free-agents',
    admin: '/admin',
    settings: '/dashboard/settings',
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
        info: '/api/users/me',
        changePassword: '/api/users/change-password',
        myTeams: '/api/users/my-teams',
      },
      league: {
        list: '/api/league/leagues',
        detail: (id: string) => `/api/league/leagues/${id}`,
        teams: '/api/league/teams',
        teamDetail: (id: string) => `/api/league/teams/${id}`,
        players: '/api/league/players',
        playerDetail: (id: string) => `/api/league/players/${id}`,
        roster: '/api/league/roster',
        draftPicks: '/api/league/draft-picks',
        rookies: '/api/league/rookies',
        trades: '/api/league/trades',
        tradeDetail: (id: string) => `/api/league/trades/${id}`,
        sync: '/api/league/sync',
        syncStatus: '/api/league/sync/status',
        lotteryRun: '/api/league/lottery/run',
        lotteryOdds: '/api/league/lottery/odds',
        lotteryResults: '/api/league/lottery/results',
      },
    },
  },

  auth: {
    minPasswordLength: 6,
    tokenKey: 'authToken',
  },
} as const;

export default config;
