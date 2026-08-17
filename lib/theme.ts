import { useColorScheme } from 'react-native';

export type AppColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  income: string;
  expense: string;
  warning: string;
  white: string;
  tabBar: string;
};

const light: AppColors = {
  background: '#F5F7F4',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2ED',
  text: '#17211C',
  muted: '#758079',
  border: '#E3E8E4',
  primary: '#167A52',
  primaryDark: '#0C5537',
  primarySoft: '#DDF2E8',
  income: '#16865D',
  expense: '#E05A47',
  warning: '#E7A12C',
  white: '#FFFFFF',
  tabBar: '#FFFFFF',
};

const dark: AppColors = {
  background: '#0D1511',
  surface: '#151F1A',
  surfaceAlt: '#202B25',
  text: '#F2F6F3',
  muted: '#94A39A',
  border: '#29352E',
  primary: '#49B987',
  primaryDark: '#0E5138',
  primarySoft: '#193B2D',
  income: '#4BC08C',
  expense: '#FF806E',
  warning: '#F0B754',
  white: '#FFFFFF',
  tabBar: '#121C17',
};

export function useAppTheme() {
  const scheme = useColorScheme();
  return {
    colors: scheme === 'dark' ? dark : light,
    isDark: scheme === 'dark',
  };
}

export const categoryIcons: Record<string, string> = {
  Salary: 'briefcase-outline',
  Freelance: 'laptop-outline',
  Gift: 'gift-outline',
  Food: 'restaurant-outline',
  Transport: 'car-outline',
  Bills: 'receipt-outline',
  Shopping: 'bag-handle-outline',
  Health: 'medkit-outline',
  Other: 'ellipsis-horizontal',
};

export const categoryColors: Record<string, string> = {
  Salary: '#167A52',
  Freelance: '#3478C9',
  Gift: '#9A62D6',
  Food: '#E87539',
  Transport: '#3478C9',
  Bills: '#9A62D6',
  Shopping: '#D85278',
  Health: '#2F9C94',
  Other: '#69766E',
};
