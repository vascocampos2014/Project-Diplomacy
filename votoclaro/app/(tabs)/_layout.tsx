import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useCores } from '@/components/ui';
import { Radii, Spacing } from '@/constants/Spacing';
import { Fonts } from '@/constants/Typography';

// Tab ativa: highlight em pill por trás do ícone (DESIGN.md › Navegação).
function TabIcon({ name, color, focused, fundo }: { name: keyof typeof MaterialIcons.glyphMap; color: string; focused: boolean; fundo: string }) {
  return (
    <View style={[styles.icone, focused && { backgroundColor: fundo }]}>
      <MaterialIcons name={name} size={22} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const cores = useCores();
  const icone = (name: keyof typeof MaterialIcons.glyphMap) =>
    function Icone({ color, focused }: { color: string; focused: boolean }) {
      return <TabIcon name={name} color={color} focused={focused} fundo={cores.tintBg} />;
    };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.tintInk,
        tabBarInactiveTintColor: cores.tabIconDefault,
        tabBarLabelStyle: { fontFamily: Fonts.semibold, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: cores.surface,
          borderTopColor: cores.border,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Feed', tabBarAccessibilityLabel: 'Feed de votações', tabBarIcon: icone('view-agenda') }}
      />
      <Tabs.Screen
        name="deputados"
        options={{ title: 'Deputados', tabBarAccessibilityLabel: 'Lista de deputados', tabBarIcon: icone('people') }}
      />
      <Tabs.Screen
        name="comparar"
        options={{ title: 'Comparar', tabBarAccessibilityLabel: 'Comparar partidos', tabBarIcon: icone('compare-arrows') }}
      />
      <Tabs.Screen
        name="quiz"
        options={{ title: 'Quiz', tabBarAccessibilityLabel: 'Teste de afinidade partidária', tabBarIcon: icone('quiz') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icone: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
});
