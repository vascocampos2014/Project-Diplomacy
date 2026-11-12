import { useColorScheme as useColorSchemeCore } from 'react-native';

import { useThemeStore } from '@/store/themeStore';

export const useColorScheme = (): 'light' | 'dark' => {
  const coreScheme = useColorSchemeCore();
  const override = useThemeStore((state) => state.override);
  if (override) return override;
  return coreScheme === 'dark' ? 'dark' : 'light';
};
