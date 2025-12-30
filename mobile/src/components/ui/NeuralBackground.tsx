import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useThemeStore, colors } from '../../store/themeStore';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

function FloatingParticle({ particle, color }: { particle: Particle; color: string }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(particle.delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.5, duration: 2000, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -30, duration: 3000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          backgroundColor: color,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

interface NeuralBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
  style?: any;
}

export function NeuralBackground({ intensity = 'medium', style }: NeuralBackgroundProps) {
  const { theme } = useThemeStore();
  const c = colors[theme];
  
  const particleCount = intensity === 'low' ? 6 : intensity === 'medium' ? 10 : 15;

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * (width - 20),
      y: Math.random() * (height * 0.5),
      size: 4 + Math.random() * 4,
      delay: Math.random() * 3000,
    }));
  }, [particleCount]);

  const particleColor = theme === 'dark' ? c.primary : c.primaryDark;

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {particles.map((particle) => (
        <FloatingParticle key={particle.id} particle={particle} color={particleColor} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
  },
});
