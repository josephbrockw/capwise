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
  dropdownMenubackgroundColor: '#ffffff',
  dropdownMenutextColor: '#3D3D3D',
  errorColor: '#ff5c5c',
  successColor: '#5bc85b',
  warningColor: '#f59e0b',
}

const typography = {
  fontFamily: 'Roboto, sans-serif',
  fontFamilyTitle: 'Couture, Arial, sans-serif',
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
  shadowSidebar: '2px 0 5px rgba(0, 0, 0, 0.1)', // Sidebar shadow
};

const buttons = {
  buttonPadding: '10px 20px', // Standard padding
  buttonFontSize: typography.fontSizeBase, // Matches base font size
  buttonPrimaryBackground: colors.primaryColor, // Matches primary color
  buttonPrimaryHover: colors.secondaryColor,
  buttonSecondaryHover: colors.primaryColor,
  buttonPrimaryText: colors.light, // White text on primary button
  buttonSecondaryBackground: colors.backgroundColor, // Matches background color
  buttonDisabledBackground: colors.lightGray, // Light gray for disabled buttons
};

const sideBarMenu = {
  sidebarBackground: colors.light,
  sidebarTextColor: colors.dark,
  sidebarLinkHoverBackground: colors.dark,
  sidebarLinkHoverTextColor: colors.light,
  sidebarLinkFontSize: '1rem',
};

const menuBar = {
  menuBarBackground: colors.dark,
  menuBarTextColor: colors.light,
  menuBarLinkHoverColor: colors.primaryColor,
  menuBarLinkFontSize: '1rem',
};


const tabsBorder = {
  activeThickness: '2px',
  inactiveThickness: '0px',
  style: 'solid',
  activeColor: colors.primaryColor,
  inactiveColor: colors.lightGray,
}

const tabs = {
  tabActiveBackground: 'transparent',
  tabActiveTextColor: colors.primaryColor,
  tabActiveBorderBottom: `${tabsBorder.activeThickness} ${tabsBorder.style} ${tabsBorder.activeColor}`,
  tabInactiveBackground: 'transparent',
  tabInactiveTextColor: colors.inactiveTextColor,
  tabInactiveBorderBottom: `${tabsBorder.inactiveThickness} ${tabsBorder.style} ${tabsBorder.inactiveColor}`,
  tabHoverColor: colors.contrastColor,
  scrollbarColor: colors.primaryColor,
  scrollbarWidth: 'thin', // Thin scrollbar for FireFox
  scrollbarSnapType: ' x mandatory',  // Enable horizontal snap scrolling
  scrollbarSnapAlign: 'center',  // centers each tab when scrolled
  // For webkit browsers (Chrome, Safari, Edge)
  scrollbarHeight: '.5rem',
  scrollbarTrackBackground: 'transparent',
};

const dropdowns = {
  dropdownBackground: colors.surface, // Matches surface color
  dropdownTextColor: colors.textColor, // Matches text color
  dropdownHoverBackground: colors.lightGray, // Light gray hover
  dropdownHoverTextColor: colors.dark, // Darker gray text on hover
  dropdownWidth: '250px',
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
  version: import.meta.env.APP_VERSION || '0.1.0',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8009',
  showSidebar: true,
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  theme: {
    ...colors,
    ...typography,
    ...borders,
    ...shadows,
    ...buttons,
    ...menuBar,
    ...sideBarMenu,
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
