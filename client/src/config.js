const colors = {
  primaryColor: '#3498DB',
  secondaryColor: '#5CC3FF',
  contrastColor: '#EB984E',
  backgroundColor: '#f8f9fa',
  light: '#ffffff',
  surface: '#ffffff',
  dark: '#2C3E50',
  gray: '#ccc',
  lightGray: '#e9ecef',
  darkGray: '#6c757d',
  textColor: '#3D3D3D',
  inactiveTextColor: '#6c757d',
  menuBarBackgroundColor: '#2c3e50',
  menuBarTextColor: '#ffffff',
  dropdownMenubackgroundColor: '#ffffff',
  dropdownMenutextColor: '#3D3D3D',
  errorColor: '#ff5c5c',
  successColor: '#5bc85b',
}

const typography = {
  fontFamily: 'Roboto, sans-serif',
  fontSizeBase: '1rem',
  fontSizeSmall: '0.875rem',
  fontSizeLarge: '1.25rem',
  lineHeightBase: '1.25',
  fontWeightRegular: '400',
  fontWeightBold: '700',
}

const borders = {
  borderColor: colors.dark, // Matches existing gray
  borderRadius: '4px', // Matches existing theme
  borderWidth: '1px', // Standard thin border
  focusOutline: colors.primaryColor, // Matches primary color for focus
};

const shadows = {
  shadowSmall: '0px 1px 3px rgba(0, 0, 0, 0.1)', // Subtle shadow
  shadowMedium: '0px 3px 6px rgba(0, 0, 0, 0.15)', // Moderate shadow
  shadowLarge: '0px 5px 15px rgba(0, 0, 0, 0.2)', // Prominent shadow
};

const buttons = {
  buttonPadding: '10px 20px', // Standard padding
  buttonFontSize: typography.fontSizeBase, // Matches base font size
  buttonPrimaryBackground: colors.primaryColor, // Matches primary color
  buttonPrimaryHover: colors.secondaryColor,
  buttonPrimaryText: colors.light, // White text on primary button
  buttonSecondaryBackground: colors.backgroundColor, // Matches background color
  buttonDisabledBackground: colors.lightGray, // Light gray for disabled buttons
};

const tabs = {
  tabActiveBackground: colors.primaryColor, // Matches primary color
  tabActiveTextColor: colors.light, // White text on active tab
  tabInactiveBackground: colors.lightGray, // Light gray for inactive tabs
  tabInactiveTextColor: colors.inactiveTextColor, // Secondary text color
};

const dropdowns = {
  dropdownBackground: colors.surface, // Matches surface color
  dropdownTextColor: colors.textColor, // Matches text color
  dropdownHoverBackground: colors.lightGray, // Light gray hover
  dropdownHoverTextColor: colors.dark, // Darker gray text on hover
};

const inputs = {
  inputBackground: colors.light, // White for input fields
  inputTextColor: colors.dark, // Matches text color
  inputBorderColor: colors.secondaryColor, // Matches border color
  inputFocusBorderColor: colors.primaryColor, // Matches primary color
  floatLabelColor: colors.darkGray,
  floatLabelBorderColor: colors.gray, // Light gray for float label
  floatLabelBackgroundColor: colors.light, // White background for float label
  floatLabelFocusBorderColor: colors.secondaryColor,
  floatLabelActiveColor: colors.primaryColor,
  floatLabelActiveBorderColor: colors.primaryColor,
};

const tooltips = {
  tooltipBackground: colors.dark, // Dark background
  tooltipTextColor: colors.light, // White text
};

const animations = {
  transitionDuration: '0.3s', // Smooth transitions
  transitionTimingFunction: 'ease-in-out', // Natural easing
  animationSpeedFast: '0.2s', // Quick animations
  animationSpeedSlow: '0.5s', // Subtle animations
};

const accessibility = {
  focusRingColor: colors.secondaryColor, // Matches secondary color
  focusRingOffset: '2px', // Slight gap between focus ring and element
};

const utilities = {
  white: '#ffffff', // Pure white
  black: '#000000', // Pure black
  disabledOpacity: '0.6', // Semi-transparent for disabled elements
  linkColor: colors.primaryColor, // Matches primary color
  linkHoverColor: colors.secondaryColor, // Matches secondary color
};

const config = {
  appName: 'BaseBuild',
  version: process.env.APP_VERSION || '0.1.0',
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8009',
  showSidebar: true,
  theme: {
    ...colors,
    ...typography,
    ...borders,
    ...shadows,
    ...buttons,
    ...tabs,
    ...dropdowns,
    ...inputs,
    ...tooltips,
    ...animations,
    ...accessibility,
    ...utilities,
  },
  tabs: {
    settings: ['account', 'billing'],  // Default tabs for the Settings page
  },
  navigation: {
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
        register: '/api/auth/register',
        logout: '/api/auth/logout',
        passwordReset: '/api/auth/password/reset',
        passwordResetConfirm: '/api/auth/password/reset/confirm',
      },
      user: {
        info: '/api/user/me',
      },
    },
  }
}

export default config;
