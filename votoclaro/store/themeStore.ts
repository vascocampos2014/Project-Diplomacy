import { Platform } from 'react-native';
import { create } from 'zustand';

export type ThemeOverride = 'light' | 'dark' | null;

interface ThemeState {
  override: ThemeOverride;
  setOverride: (override: ThemeOverride) => void;
}

// No web a escolha fica guardada no browser. Não uso `zustand/middleware`
// (persist): o build ESM usa `import.meta`, que o bundle web do Expo não
// suporta e que deixava a app em branco. localStorage pode falhar (modo
// privado, cookies bloqueados): nesse caso a app segue o tema do sistema.
export const CHAVE_TEMA = 'votoclaro-tema';

export function lerTemaGuardado(): ThemeOverride {
  if (Platform.OS !== 'web') return null;
  try {
    const v = globalThis.localStorage?.getItem(CHAVE_TEMA);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

function guardarTema(override: ThemeOverride) {
  if (Platform.OS !== 'web') return;
  try {
    if (override) globalThis.localStorage?.setItem(CHAVE_TEMA, override);
    else globalThis.localStorage?.removeItem(CHAVE_TEMA);
  } catch {
    /* sem persistência */
  }
}

// `override` força claro/escuro; `null` segue o sistema (por defeito).
// Começa sempre em null e lê o valor guardado depois de montar (ver
// useColorScheme.web), para o primeiro render ser igual ao HTML pré-gerado.
export const useThemeStore = create<ThemeState>((set) => ({
  override: null,
  setOverride: (override) => {
    guardarTema(override);
    set({ override });
  },
}));
