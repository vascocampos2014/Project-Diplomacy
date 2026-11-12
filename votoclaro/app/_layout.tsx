import { Newsreader_600SemiBold, Newsreader_700Bold } from '@expo-google-fonts/newsreader';
import { PublicSans_400Regular, PublicSans_600SemiBold, PublicSans_700Bold } from '@expo-google-fonts/public-sans';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { queryClient } from '@/lib/queryClient';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Newsreader_600SemiBold,
    Newsreader_700Bold,
    PublicSans_400Regular,
    PublicSans_600SemiBold,
    PublicSans_700Bold,
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

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { fontFamily: 'PublicSans_700Bold', fontSize: 17, color: colors.text },
          headerTintColor: colors.tint,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
