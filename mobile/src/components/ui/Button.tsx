import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore, colors } from '../../store/themeStore';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
}: ButtonProps) {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const variantStyles: Record<string, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: { backgroundColor: themeColors.primary },
      text: { color: '#ffffff' },
    },
    secondary: {
      container: { backgroundColor: themeColors.surface, borderWidth: 1, borderColor: themeColors.border },
      text: { color: themeColors.text },
    },
    ghost: {
      container: { backgroundColor: 'transparent' },
      text: { color: themeColors.primary },
    },
  };

  const sizeStyles: Record<string, { container: ViewStyle; text: TextStyle }> = {
    sm: { container: { paddingVertical: 8, paddingHorizontal: 16 }, text: { fontSize: 14 } },
    md: { container: { paddingVertical: 12, paddingHorizontal: 24 }, text: { fontSize: 16 } },
    lg: { container: { paddingVertical: 16, paddingHorizontal: 32 }, text: { fontSize: 18 } },
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        variantStyles[variant].container,
        sizeStyles[size].container,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#ffffff' : themeColors.primary} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, variantStyles[variant].text, sizeStyles[size].text, icon && styles.textWithIcon]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  text: {
    fontWeight: '600',
  },
  textWithIcon: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});
