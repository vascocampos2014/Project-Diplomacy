import {
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_600SemiBold,
  PublicSans_700Bold,
  PublicSans_800ExtraBold,
} from '@expo-google-fonts/public-sans';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { inject as injectAnalytics } from '@vercel/analytics';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { BarraTopo } from '@/components/BarraTopo';
import { queryClient } from '@/lib/queryClient';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // A deep link straight to a detail page still gets the tabs underneath, so "back" works.
  initialRouteName: '(tabs)',
};

// Vercel Web Analytics (web only): cookieless page views. The script and its
// beacons are served from this origin (/_vercel/insights), so the CSP's 'self'
// already allows them. It hooks history.pushState, so Expo Router navigations count.
if (Platform.OS === 'web') injectAnalytics();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PublicSans_400Regular,
    PublicSans_500Medium,
    PublicSans_600SemiBold,
    PublicSans_700Bold,
    PublicSans_800ExtraBold,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // On web the HTML is pre-rendered at build time, but react-native-web's atomic
  // class order and the icon font differ between that render and the browser,
  // which made React throw a hydration error (#418). All content is fetched in
  // the browser anyway, so the pre-rendered page only carries <head> (title,
  // link-preview tags) and the app renders once mounted.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  // <Head> sits outside the mount gate so the title is written into the
  // pre-rendered HTML (tabs, bookmarks, link previews).
  return (
    <>
      <Head>
        <title>VotoClaro — Como vota o Parlamento</title>
      </Head>
      {loaded && montado ? (
        <QueryClientProvider client={queryClient}>
          <RootLayoutNav />
        </QueryClientProvider>
      ) : null}
    </>
  );
}

// Tema da navegação com as cores do boletim (fundo, linhas, texto).
function tema(escuro: boolean) {
  const base = escuro ? DarkTheme : DefaultTheme;
  const c = Colors[escuro ? 'dark' : 'light'];
  return {
    ...base,
    colors: { ...base.colors, primary: c.tintInk, background: c.background, card: c.surface, text: c.text, border: c.border },
  };
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <ThemeProvider value={tema(colorScheme === 'dark')}>
      <Stack
        screenOptions={{
          // A mesma barra (logótipo + navegação) em todos os ecrãs, com seta de voltar.
          header: () => <BarraTopo voltar />,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
