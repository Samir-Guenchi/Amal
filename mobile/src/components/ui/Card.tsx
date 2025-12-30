import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeStore, colors } from '../../store/themeStore';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'primary' | 'elevated';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: themeColors.surface,
      borderColor: themeColors.border,
      borderWidth: 1,
    },
    primary: {
      backgroundColor: themeColors.primaryMuted,
      borderColor: themeColors.primary,
      borderWidth: 1,
    },
    elevated: {
      backgroundColor: themeColors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  };

  return (
    <View style={[styles.card, variantStyles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
  },
});
