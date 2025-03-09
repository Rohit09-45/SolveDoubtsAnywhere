declare module '@theme/theme' {
  export const COLORS: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    textSecondary: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    card: string;
    border: string;
    white: string;
    black: string;
    transparent: string;
  };

  export const SIZES: {
    base: number;
    font: number;
    radius: number;
    padding: number;
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    body1: number;
    body2: number;
    body3: number;
    width: number;
    height: number;
  };

  export const FONTS: {
    h1: {
      fontSize: number;
      fontWeight: '700';
    };
    h2: {
      fontSize: number;
      fontWeight: '600';
    };
    h3: {
      fontSize: number;
      fontWeight: '600';
    };
    h4: {
      fontSize: number;
      fontWeight: '600';
    };
    body1: {
      fontSize: number;
      fontWeight: '400';
    };
    body2: {
      fontSize: number;
      fontWeight: '400';
    };
    body3: {
      fontSize: number;
      fontWeight: '400';
    };
  };

  const appTheme: {
    COLORS: typeof COLORS;
    SIZES: typeof SIZES;
    FONTS: typeof FONTS;
  };

  export default appTheme;
} 