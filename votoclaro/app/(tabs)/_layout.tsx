import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { BarraTopo } from '@/components/BarraTopo';
import { useCores } from '@/components/ui';
import { LARGURA_DESKTOP } from '@/constants/Spacing';
import { Fonts } from '@/constants/Typography';

// Separador ativo: uma barra Blue Bell por cima do ícone ("estás aqui").
function TabIcon({ name, color, focused, marcador }: { name: keyof typeof MaterialIcons.glyphMap; color: string; focused: boolean; marcador: string }) {
  return (
    <View style={styles.icone}>
      <View style={[styles.indicador, { backgroundColor: focused ? marcador : 'transparent' }]} />
      <MaterialIcons name={name} size={22} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const cores = useCores();
  const { width } = useWindowDimensions();
  const desktop = width >= LARGURA_DESKTOP;
  const icone = (name: keyof typeof MaterialIcons.glyphMap) =>
    function Icone({ color, focused }: { color: string; focused: boolean }) {
      return <TabIcon name={name} color={color} focused={focused} marcador={cores.marcador} />;
    };

  return (
    <Tabs
      screenOptions={{
        header: () => <BarraTopo />,
        tabBarActiveTintColor: cores.tabIconSelected,
        tabBarInactiveTintColor: cores.tabIconDefault,
        tabBarLabelStyle: { fontFamily: Fonts.semibold, fontSize: 11 },
        sceneStyle: { backgroundColor: cores.background },
        tabBarStyle: desktop
          ? { display: 'none' }
          : {
              backgroundColor: cores.surface,
              borderTopColor: cores.border,
              borderTopWidth: StyleSheet.hairlineWidth,
              height: 64,
              paddingTop: 0,
              paddingBottom: 8,
            },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Votações', tabBarAccessibilityLabel: 'Votações recentes', tabBarIcon: icone('how-to-vote') }}
      />
      <Tabs.Screen
        name="deputados"
        options={{ title: 'Deputados', tabBarAccessibilityLabel: 'Lista de deputados', tabBarIcon: icone('people-outline') }}
      />
      <Tabs.Screen
        name="perguntar"
        options={{ title: 'Perguntar', tabBarAccessibilityLabel: 'Perguntar sobre leis e votações', tabBarIcon: icone('chat-bubble-outline') }}
      />
      <Tabs.Screen
        name="comparar"
        options={{ title: 'Comparar', tabBarAccessibilityLabel: 'Comparar partidos', tabBarIcon: icone('compare-arrows') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icone: {
    alignItems: 'center',
    paddingTop: 8,
  },
  indicador: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 3,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});
