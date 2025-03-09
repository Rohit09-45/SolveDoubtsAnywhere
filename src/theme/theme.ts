import {Dimensions, Platform} from 'react-native';

const {width, height} = Dimensions.get('window');

export const COLORS = {
  primary: '#6C63FF', // Modern purple
  secondary: '#FF6584', // Coral pink
  background: '#FFFFFF',
  text: '#1E1E1E',
  textSecondary: '#666666',
  success: '#4CAF50',
  error: '#FF5252',
  warning: '#FFC107',
  info: '#2196F3',
  card: '#F8F9FA',
  border: '#E0E0E0',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,

  // Font sizes
  h1: 32,
  h2: 24,
  h3: 18,
  h4: 16,
  body1: 16,
  body2: 14,
  body3: 12,

  // App dimensions
  width,
  height,
  tabBarHeight: 60,
  bottomSpacing: Platform.OS === 'ios' ? 34 : 24,
};

export const FONTS = {
  h1: {
    fontSize: SIZES.h1,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: SIZES.h2,
    fontWeight: '600' as const,
  },
  h3: {
    fontSize: SIZES.h3,
    fontWeight: '600' as const,
  },
  h4: {
    fontSize: SIZES.h4,
    fontWeight: '600' as const,
  },
  body1: {
    fontSize: SIZES.body1,
    fontWeight: '400' as const,
  },
  body2: {
    fontSize: SIZES.body2,
    fontWeight: '400' as const,
  },
  body3: {
    fontSize: SIZES.body3,
    fontWeight: '400' as const,
  },
};

const appTheme = {COLORS, SIZES, FONTS};

export default appTheme; 