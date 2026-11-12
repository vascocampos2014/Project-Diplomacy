import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import Colors from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { hexToRgba } from '@/lib/format';

function TabIcon({
  name,
  color,
  size,
  focused,
  tint,
}: {
  name: keyof typeof MaterialIcons.glyphMap;
  color: string;
  size: number;
  focused: boolean;
  tint: string;
}) {
  return (
    <View style={[styles.iconWrapper, focused && { backgroundColor: hexToRgba(tint, 0.12) }]}>
      <MaterialIcons name={name} size={size} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarAccessibilityLabel: 'Feed de votações',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="view-agenda" color={color} size={size} focused={focused} tint={colors.tint} />
          ),
        }}
      />
      <Tabs.Screen
        name="deputados"
        options={{
          title: 'Deputados',
          tabBarAccessibilityLabel: 'Lista de deputados',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="people" color={color} size={size} focused={focused} tint={colors.tint} />
          ),
        }}
      />
      <Tabs.Screen
        name="comparar"
        options={{
          title: 'Comparar',
          tabBarAccessibilityLabel: 'Comparador de partidos',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="compare-arrows" color={color} size={size} focused={focused} tint={colors.tint} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Quiz',
          tabBarAccessibilityLabel: 'Teste de afinidade partidária',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="quiz" color={color} size={size} focused={focused} tint={colors.tint} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.badge,
  },
});
