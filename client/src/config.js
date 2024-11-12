const config = {
  appName: 'BaseBuild',
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8009',
  showSidebar: true,
  theme: {
    primaryColor: '#3498DB',
    secondaryColor: '#5CC3FF',
    contrastColor: '#EB984E',
    backgroundColor: '#f8f9fa',
    white: '#ffffff',
    dark: '#2C3E50',
    gray: '#ccc',
    textColor: '#3D3D3D',
    menuBar: {
      backgroundColor: '#2c3e50',
      textColor: '#ffffff',
    },
    dropdownMenu: {
      backgroundColor: '#ffffff',
      textColor: '#3D3D3D',
    },
    errorColor: '#ff5c5c',
    successColor: '#5bc85b',
    fontFamily: 'Roboto, sans-serif',
    borderRadius: '4px',
  },
  tabs: {
    settings: ['account', 'billing'],  // Default tabs for the Settings page
  },
  breakpoints: {
    mobile: 768,  // Mobile breakpoint
  }
}

export default config;
