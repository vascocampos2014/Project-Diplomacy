import { useEffect, useState } from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';

import { useThemeStore } from '@/store/themeStore';

// NOTE: The default React Native styling doesn't support server rendering.
// Server rendered styles should not change between the first render of the HTML
// and the first render on the client, so we start with 'light' and sync to the
// real system preference once mounted (and keep it in sync on changes).
export function useColorScheme(): 'light' | 'dark' {
  const [scheme, setScheme] = useState<ColorSchemeName>('light');
  const override = useThemeStore((state) => state.override);

  useEffect(() => {
    setScheme(Appearance.getColorScheme());
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  if (override) return override;
  return scheme === 'dark' ? 'dark' : 'light';
}
