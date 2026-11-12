import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';

const ITENS: { label: string; icone: keyof typeof MaterialIcons.glyphMap; rota: '/definicoes' | '/glossario' }[] = [
  { label: 'Definições', icone: 'settings', rota: '/definicoes' },
  { label: 'Glossário', icone: 'menu-book', rota: '/glossario' },
];

export function MenuTresPontos() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.botao}
        onPress={() => setAberto(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Mais opções"
      >
        <MaterialIcons name="more-vert" size={24} color={colors.text} />
      </TouchableOpacity>
      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAberto(false)} accessibilityLabel="Fechar menu">
          <View
            style={[
              styles.menu,
              { top: insets.top + Spacing.xxxl, backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {ITENS.map((item, index) => (
              <TouchableOpacity
                key={item.rota}
                style={[
                  styles.item,
                  index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                ]}
                onPress={() => {
                  setAberto(false);
                  router.push(item.rota);
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <MaterialIcons name={item.icone} size={20} color={colors.text} />
                <Text style={[Typography.bodySm, styles.itemLabel, { color: colors.text }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  botao: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.pill,
  },
  backdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    right: Spacing.lg,
    minWidth: 180,
    borderRadius: Radii.chip,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  itemLabel: {
    fontFamily: 'PublicSans_600SemiBold',
  },
});
