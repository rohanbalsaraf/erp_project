export const Theme = {
  colors: {
    primary: '#4F46E5', // Indigo 600
    primaryLight: '#EEF2FF', // Indigo 50
    primaryDark: '#3730A3', // Indigo 800
    secondary: '#8B5CF6', // Violet 600
    background: '#F9FAFB', // Gray 50
    surface: '#FFFFFF',
    text: {
      primary: '#111827', // Gray 900
      secondary: '#4B5563', // Gray 600
      muted: '#9CA3AF', // Gray 400
      white: '#FFFFFF',
    },
    status: {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
    },
    border: '#E5E7EB',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 30,
    full: 9999,
  },
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    medium: {
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 8,
    },
    up: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 10,
    },
  },
  typography: {
    display: {
      fontSize: 32,
      fontWeight: '900' as const,
      letterSpacing: -0.5,
    },
    h1: {
      fontSize: 24,
      fontWeight: '800' as const,
    },
    h2: {
      fontSize: 20,
      fontWeight: '700' as const,
    },
    h3: {
      fontSize: 18,
      fontWeight: '700' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: 12,
      fontWeight: '600' as const,
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
    },
  }
};
