import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';

import { BarraSeparadores } from '@/components/BarraSeparadores';
import { BarraTopo } from '@/components/BarraTopo';
import { useCores } from '@/components/ui';
import { LARGURA_DESKTOP } from '@/constants/Spacing';

export default function TabLayout() {
  const cores = useCores();
  const { width } = useWindowDimensions();
  // No computador a navegação vive na barra de topo (texto); no telemóvel é a
  // cápsula flutuante em baixo (BarraSeparadores).
  const desktop = width >= LARGURA_DESKTOP;

  return (
    <Tabs
      tabBar={(props) => (desktop ? null : <BarraSeparadores {...props} />)}
      screenOptions={{
        header: () => <BarraTopo />,
        sceneStyle: { backgroundColor: cores.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Votações', tabBarAccessibilityLabel: 'Votações recentes' }} />
      <Tabs.Screen name="deputados" options={{ title: 'Deputados', tabBarAccessibilityLabel: 'Lista de deputados' }} />
      <Tabs.Screen name="perguntar" options={{ title: 'Perguntar', tabBarAccessibilityLabel: 'Perguntar sobre leis e votações' }} />
      <Tabs.Screen name="comparar" options={{ title: 'Comparar', tabBarAccessibilityLabel: 'Comparar partidos' }} />
    </Tabs>
  );
}
