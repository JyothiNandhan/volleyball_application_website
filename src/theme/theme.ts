import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

const brand = {
  green: '#1E7A58',
  coral: '#C4513E',
  ink: '#17201C',
  court: '#F4F2EA'
};

export const lightTheme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.green,
    secondary: brand.coral,
    tertiary: '#315F96',
    background: brand.court,
    surface: '#FFFFFF',
    surfaceVariant: '#E5EBE6',
    onSurface: brand.ink
  }
};

export const darkTheme = {
  ...MD3DarkTheme,
  roundness: 3,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#55C494',
    secondary: '#FF947F',
    tertiary: '#8DB8EA',
    background: '#0E1915',
    surface: '#17231E',
    surfaceVariant: '#26342E',
    onSurface: '#EDF4EF'
  }
};
