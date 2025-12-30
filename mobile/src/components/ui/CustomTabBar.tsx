import React, { useEffect, useRef } from 'react';
import { View, Pressable, StyleSheet, Animated } from 'react-native';
import { Home, MessageCircle, BookOpen, Settings } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore, colors } from '../../store/themeStore';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const icons = [Home, MessageCircle, BookOpen, Settings];
const labels = ['Home', 'Chat', 'Resources', 'Settings'];

function TabItem({ 
  icon: Icon, 
  label,
  isFocused, 
  onPress, 
  c,
  theme,
}: { 
  icon: any;
  label: string;
  isFocused: boolean; 
  onPress: () => void; 
  c: any;
  theme: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const bgOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const labelOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const iconTranslate = useRef(new Animated.Value(isFocused ? -2 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(bgOpacity, { toValue: isFocused ? 1 : 0, duration: 150, useNativeDriver: true }),
      Animated.timing(labelOpacity, { toValue: isFocused ? 1 : 0, duration: 120, useNativeDriver: true }),
      Animated.timing(iconTranslate, { toValue: isFocused ? -2 : 0, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [isFocused, bgOpacity, labelOpacity, iconTranslate]);

  const onPressIn = () => {
    Animated.timing(scale, { toValue: 0.92, duration: 80, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable 
      onPress={handlePress} 
      onPressIn={onPressIn} 
      onPressOut={onPressOut}
      style={styles.tabPressable}
    >
      <Animated.View style={[styles.tab, { transform: [{ scale }] }]}>
        {/* Background pill */}
        <Animated.View style={[
          styles.tabBg,
          { backgroundColor: c.primary, opacity: bgOpacity }
        ]} />
        
        {/* Content */}
        <View style={styles.tabContent}>
          <Animated.View style={{ transform: [{ translateY: iconTranslate }] }}>
            <Icon size={22} color={isFocused ? '#fff' : c.textMuted} strokeWidth={isFocused ? 2.2 : 1.8} />
          </Animated.View>
          
          <Animated.Text style={[
            styles.label, 
            { color: isFocused ? '#fff' : c.textMuted, opacity: labelOpacity }
          ]}>
            {isFocused ? label : ''}
          </Animated.Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { theme } = useThemeStore();
  const c = colors[theme];

  return (
    <View style={styles.container}>
      <View style={[
        styles.bar,
        { 
          backgroundColor: theme === 'dark' ? 'rgba(18,18,20,0.92)' : 'rgba(255,255,255,0.96)',
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
        },
      ]}>
        {state.routes.map((route, index) => (
          <TabItem
            key={route.key}
            icon={icons[index]}
            label={labels[index]}
            isFocused={state.index === index}
            onPress={() => state.index !== index && navigation.navigate(route.name)}
            c={c}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 28,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  tabPressable: {
    marginHorizontal: 2,
  },
  tab: {
    position: 'relative',
    minWidth: 52,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  tabBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  tabContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
