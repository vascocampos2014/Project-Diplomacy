import { useEffect, useState } from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';

import { lerTemaGuardado, useThemeStore } from '@/store/themeStore';

let temaGuardadoLido = false;

// O HTML é pré-gerado sem saber o tema do sistema: começa em 'light' e passa
// para a preferência real (e para a escolha guardada) depois de montar.
export function useColorScheme(): 'light' | 'dark' {
  const [scheme, setScheme] = useState<ColorSchemeName>('light');
  const override = useThemeStore((state) => state.override);

  useEffect(() => {
    if (!temaGuardadoLido) {
      temaGuardadoLido = true;
      const guardado = lerTemaGuardado();
      if (guardado) useThemeStore.setState({ override: guardado });
    }
    setScheme(Appearance.getColorScheme());
    const subscription = Appearance.addChangeListener(({ colorScheme }) => setScheme(colorScheme));
    return () => subscription.remove();
  }, []);

  if (override) return override;
  return scheme === 'dark' ? 'dark' : 'light';
}
