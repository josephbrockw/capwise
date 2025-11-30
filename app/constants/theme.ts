const colors = {
  primary: '#3498DB', // Example primary color
  secondary: '#5CC3FF', // Example secondary color
  accent: '#ffd33d', // Example accent color
  background: '#25292e', // Example background color
  surface: '#FFFFFF', // Example surface color (like cards)
  text: '#fff', // Main text color
  textSecondary: '#6c757d', // Lighter text color
  border: '#E0E0E0', // Border color
  error: '#ff5c5c',
  success: '#5bc85b',
  warning: '#f59e0b',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#ccc',
  lightGray: '#e9ecef',
  darkGray: '#6c757d',
} as const;

const typography = {
  // Consider using platform-specific fonts or loading custom fonts
  fontFamilyRegular: 'System', // Default system font
  fontFamilyBold: 'System', // Default system font (bold variant)
  fontSizeBase: 16,
  fontSizeSmall: 14,
  fontSizeLarge: 20,
  fontSizeTitle: 24,
  fontWeightRegular: '400',
  fontWeightBold: '700',
  lineHeightBase: 24, // Adjust as needed (often 1.5 * fontSize)
  lineHeightSmall: 20,
  lineHeightLarge: 28,
} as const;

const spacing = {
  xxs: 4,
  xs: 8,
  s: 12,
  m: 16, // Base spacing unit
  l: 24,
  xl: 32,
  xxl: 48,
} as const;

const borders = {
  borderRadiusSmall: 4,
  borderRadiusMedium: 8,
  borderRadiusLarge: 16,
  borderWidth: 1,
  borderColor: colors.border,
} as const;

const shadows = {
  // Shadows in React Native work differently than web
  // Often defined directly in StyleSheet with elevation (Android)
  // or shadow properties (iOS)
  // Example iOS shadow properties:
  shadowSmall: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // For Android
  },
  shadowMedium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5, // For Android
  },
} as const;

const buttons = {
  primary: {
    container: {
      width: 320,
      height: 68,
      marginHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 3
    },
    button: {
      borderRadius: 10,
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    color: colors.white,
    fontSize: 16,
    icon: {
      paddingRight: 8,
    }
  },
  secondary: {
    backgroundColor: colors.secondary,
    color: colors.white,
  },
  accent: {
    backgroundColor: colors.accent,
    color: colors.white,
  },
  circle: {
    container: {
      width: 84,
      height: 84,
      marginHorizontal: 60,
      borderWidth: 4,
      borderColor: colors.accent,
      padding: 3,
    },
    borderRadius: 42,
    background: colors.white,
  },
  icon: {
    color: colors.white,
    marginTop: 12,
  },
  borderRadius: 5,
  padding: 10,

} as const;

export { colors, typography, spacing, borders, shadows, buttons };
