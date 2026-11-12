import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EcraVazio } from '@/components/EcraVazio';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function NotFoundScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Página não encontrada' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EcraVazio
          icone="search-off"
          titulo="Página não encontrada"
          descricao="Esta página não existe ou foi movida."
          accao={{ label: 'Ir para as votações', onPress: () => router.replace('/') }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
