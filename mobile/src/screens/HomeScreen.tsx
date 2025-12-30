import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Phone, BookOpen, Shield, Heart, Brain, Sparkles, ArrowRight, Zap } from 'lucide-react-native';
import { useThemeStore, colors } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import { useAuthStore } from '../store/authStore';
import { AuthScreen } from './AuthScreen';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');

// Algeria-inspired Neural Network - Star pattern with crescent arc
// Nodes form a star shape (5 points) with neural connections + crescent arc

// Star points (5-pointed star) + center brain node + crescent arc nodes
const STAR_CENTER = { x: 75, y: 45 };
const STAR_RADIUS = 18;
const CRESCENT_CENTER = { x: 60, y: 45 };

// Calculate star points
const getStarPoints = () => {
  const points = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * (Math.PI / 180); // Start from top
    points.push({
      x: STAR_CENTER.x + STAR_RADIUS * Math.cos(angle),
      y: STAR_CENTER.y + STAR_RADIUS * Math.sin(angle) * 0.8,
      size: 10,
      primary: true,
      isStar: true,
    });
  }
  return points;
};

// Crescent arc nodes (partial circle)
const getCrescentNodes = () => {
  const nodes = [];
  for (let i = 0; i < 7; i++) {
    const angle = (i * 30 + 120) * (Math.PI / 180); // Arc from ~120° to ~300°
    nodes.push({
      x: CRESCENT_CENTER.x + 25 * Math.cos(angle),
      y: CRESCENT_CENTER.y + 30 * Math.sin(angle) * 0.7,
      size: 6,
      primary: false,
      isStar: false,
    });
  }
  return nodes;
};

// Neural scatter nodes (AI brain pattern)
const SCATTER_NODES = [
  { x: 88, y: 15, size: 5, primary: false, isStar: false },
  { x: 92, y: 30, size: 4, primary: false, isStar: false },
  { x: 95, y: 50, size: 5, primary: false, isStar: false },
  { x: 90, y: 70, size: 4, primary: false, isStar: false },
  { x: 85, y: 85, size: 5, primary: false, isStar: false },
  { x: 70, y: 90, size: 4, primary: false, isStar: false },
  { x: 55, y: 88, size: 5, primary: false, isStar: false },
  { x: 40, y: 80, size: 4, primary: false, isStar: false },
  { x: 30, y: 65, size: 5, primary: false, isStar: false },
  { x: 25, y: 45, size: 4, primary: false, isStar: false },
  { x: 30, y: 25, size: 5, primary: false, isStar: false },
  { x: 45, y: 12, size: 4, primary: false, isStar: false },
  { x: 65, y: 8, size: 5, primary: false, isStar: false },
];

// Animated Neural Node - organic breathing
function NeuralNode({ x, y, size, delay, color, isPrimary }: { 
  x: number; y: number; size: number; delay: number; color: string; isPrimary: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(isPrimary ? 0.8 : 0.35)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: isPrimary ? 1.5 : 1.25, duration: 3000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 3000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 3000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: isPrimary ? 0.8 : 0.35, duration: 3000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: size / 2,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ scale }],
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: isPrimary ? 0.9 : 0.4,
        shadowRadius: isPrimary ? 15 : 6,
        elevation: isPrimary ? 8 : 3,
      }}
    />
  );
}

// Neural Connection Line
function NeuralLine({ x1, y1, x2, y2, delay, color }: {
  x1: number; y1: number; x2: number; y2: number; delay: number; color: string;
}) {
  const opacity = useRef(new Animated.Value(0.08)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.08, duration: 1200, useNativeDriver: true }),
        Animated.delay(2000),
      ])
    ).start();
  }, []);

  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${x1}%`,
        top: `${y1}%`,
        width: `${length}%`,
        height: 1,
        backgroundColor: color,
        opacity,
        transform: [{ rotate: `${angle}deg` }],
        transformOrigin: 'left center',
      }}
    />
  );
}

// Algeria Neural Network - Star + Crescent + Brain Pattern
function AlgeriaNeuralNetwork({ color, secondaryColor }: { color: string; secondaryColor: string }) {
  const starPoints = getStarPoints();
  const crescentNodes = getCrescentNodes();
  const allNodes = [...starPoints, ...crescentNodes, ...SCATTER_NODES];
  
  // Star connections
  const starConnections: [number, number][] = [
    [0, 2], [2, 4], [4, 1], [1, 3], [3, 0],
  ];
  
  // Crescent connections
  const crescentConnections: [number, number][] = [];
  for (let i = 5; i < 11; i++) {
    crescentConnections.push([i, i + 1]);
  }
  
  // Neural connections
  const neuralConnections: [number, number][] = [
    [0, 12], [1, 14], [2, 16], [3, 18], [4, 20],
    [12, 13], [14, 15], [16, 17], [18, 19],
  ];

  const allConnections = [...starConnections, ...crescentConnections, ...neuralConnections];

  return (
    <View style={styles.neuralNetwork}>
      {allConnections.map(([i, j], index) => {
        if (!allNodes[i] || !allNodes[j]) return null;
        const isStarConn = index < 5;
        return (
          <NeuralLine
            key={`line-${index}`}
            x1={allNodes[i].x}
            y1={allNodes[i].y}
            x2={allNodes[j].x}
            y2={allNodes[j].y}
            delay={index * 200}
            color={isStarConn ? color : secondaryColor}
          />
        );
      })}
      {allNodes.map((node, index) => (
        <NeuralNode
          key={`node-${index}`}
          x={node.x}
          y={node.y}
          size={node.size}
          delay={index * 150}
          color={node.isStar ? color : secondaryColor}
          isPrimary={node.isStar}
        />
      ))}
    </View>
  );
}

type TabParamList = {
  Home: undefined;
  Chat: undefined;
  Resources: undefined;
  Settings: undefined;
};

type HomeScreenProps = BottomTabScreenProps<TabParamList, 'Home'>;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { theme } = useThemeStore();
  const { t, isRTL } = useLanguageStore();
  const { isGuest, isAuthenticated } = useAuthStore();
  const c = colors[theme];

  const [authVisible, setAuthVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for CTA
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 2500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Algeria-inspired Neural Network - Star & Crescent with AI brain pattern */}
      <AlgeriaNeuralNetwork color={c.primary} secondaryColor={c.primary + '60'} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, isRTL() && styles.rtl]}>
          <View style={[styles.badge, { backgroundColor: c.primaryMuted, borderColor: c.primary }]}>
            <Sparkles size={14} color={c.primary} />
            <Text style={[styles.badgeText, { color: c.primary }]}>{t('empathy3')}</Text>
          </View>
          
          <Text style={[styles.greeting, { color: c.textSecondary }]}>{getGreeting()}</Text>
          <Text style={[styles.title, { color: c.text }]}>{t('welcome')}</Text>
          <Text style={[styles.tagline, { color: c.textMuted }]}>{t('tagline')}</Text>
        </View>

        {/* Beautiful Auth Card - Shows for guest users */}
        {isGuest && !isAuthenticated && (
          <TouchableOpacity
            style={[styles.authCard, { 
              backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
              borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
            }]}
            onPress={() => setAuthVisible(true)}
            activeOpacity={0.9}
          >
            <Text style={styles.authEmoji}>👋</Text>
            <View style={styles.authTextWrap}>
              <Text style={[styles.authCardTitle, { color: c.text }]}>
                Hey, want to save your chats?
              </Text>
              <Text style={[styles.authCardSubtitle, { color: c.textMuted }]}>
                Create a free account in seconds
              </Text>
            </View>
            <View style={[styles.authButton, { backgroundColor: c.primary }]}>
              <Text style={styles.authButtonText}>Join</Text>
              <ArrowRight size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        )}

        {/* Main CTA Card - Premium glass effect */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.ctaCard, { 
              backgroundColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(22, 163, 74, 0.1)',
              borderColor: c.primary,
            }]}
            onPress={() => navigation.navigate('Chat')}
            activeOpacity={0.9}
          >
            {/* Inner glow */}
            <View style={[styles.ctaGlow, { backgroundColor: c.primary }]} />
            
            <View style={styles.ctaContent}>
              <Animated.View style={[
                styles.ctaIconContainer, 
                { backgroundColor: c.primary, transform: [{ translateY: floatAnim }] }
              ]}>
                <Brain size={32} color="#ffffff" />
              </Animated.View>
              <View style={styles.ctaTextContainer}>
                <Text style={[styles.ctaTitle, { color: c.text }]}>{t('empathy1')}</Text>
                <Text style={[styles.ctaSubtitle, { color: c.textSecondary }]}>{t('startChat')}</Text>
              </View>
              <View style={[styles.ctaArrow, { backgroundColor: c.primary }]}>
                <ArrowRight size={22} color="#ffffff" />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>


        {/* Features Grid - Glass morphism cards */}
        <View style={styles.featuresGrid}>
          {/* Chat Feature */}
          <TouchableOpacity
            style={[styles.featureCard, styles.featureShape1, { 
              backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
              borderColor: c.border,
            }]}
            onPress={() => navigation.navigate('Chat')}
            activeOpacity={0.8}
          >
            <View style={[styles.featureIcon, styles.iconShape1, { backgroundColor: c.primaryMuted }]}>
              <MessageCircle size={24} color={c.primary} />
            </View>
            <Text style={[styles.featureLabel, { color: c.text }]}>{t('chat')}</Text>
            <Text style={[styles.featureDesc, { color: c.textMuted }]}>24/7</Text>
          </TouchableOpacity>

          {/* Resources Feature */}
          <TouchableOpacity
            style={[styles.featureCard, styles.featureShape2, { 
              backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
              borderColor: c.border,
            }]}
            onPress={() => navigation.navigate('Resources')}
            activeOpacity={0.8}
          >
            <View style={[styles.featureIcon, styles.iconShape2, { backgroundColor: c.blueMuted }]}>
              <BookOpen size={24} color={c.blue} />
            </View>
            <Text style={[styles.featureLabel, { color: c.text }]}>{t('resources')}</Text>
            <Text style={[styles.featureDesc, { color: c.textMuted }]}>Learn</Text>
          </TouchableOpacity>

          {/* Privacy Feature */}
          <TouchableOpacity
            style={[styles.featureCard, styles.featureShape3, { 
              backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
              borderColor: c.border,
            }]}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.8}
          >
            <View style={[styles.featureIcon, styles.iconShape3, { backgroundColor: c.purpleMuted }]}>
              <Shield size={24} color={c.purple} />
            </View>
            <Text style={[styles.featureLabel, { color: c.text }]}>100%</Text>
            <Text style={[styles.featureDesc, { color: c.textMuted }]}>Private</Text>
          </TouchableOpacity>

          {/* AI Feature */}
          <TouchableOpacity
            style={[styles.featureCard, styles.featureShape4, { 
              backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
              borderColor: c.border,
            }]}
            onPress={() => navigation.navigate('Chat')}
            activeOpacity={0.8}
          >
            <View style={[styles.featureIcon, styles.iconShape4, { backgroundColor: c.amberMuted }]}>
              <Zap size={24} color={c.amber} />
            </View>
            <Text style={[styles.featureLabel, { color: c.text }]}>AI</Text>
            <Text style={[styles.featureDesc, { color: c.textMuted }]}>Powered</Text>
          </TouchableOpacity>
        </View>

        {/* Crisis Banner - Premium design */}
        <TouchableOpacity
          style={[styles.crisisBanner, { 
            backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.05)',
            borderColor: c.danger,
          }]}
          onPress={() => navigation.navigate('Resources')}
          activeOpacity={0.9}
        >
          {/* Pulse indicator */}
          <View style={styles.pulseContainer}>
            <View style={[styles.pulseOuter, { borderColor: c.danger }]} />
            <View style={[styles.pulseDot, { backgroundColor: c.danger }]} />
          </View>

          <View style={styles.crisisContent}>
            <View style={[styles.crisisIconContainer, { backgroundColor: c.danger }]}>
              <Phone size={26} color="#ffffff" />
            </View>
            <View style={styles.crisisTextContainer}>
              <Text style={[styles.crisisLabel, { color: c.danger }]}>{t('crisisLine')}</Text>
              <Text style={[styles.crisisNumber, { color: c.text }]}>3033</Text>
              <Text style={[styles.crisisDesc, { color: c.textSecondary }]}>{t('available247')} · Free</Text>
            </View>
            <View style={[styles.crisisArrow, { backgroundColor: c.danger }]}>
              <ArrowRight size={20} color="#ffffff" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={[styles.footerCard, { backgroundColor: c.primaryMuted }]}>
            <Heart size={16} color={c.primary} />
            <Text style={[styles.footerText, { color: c.textSecondary }]}>Made with love for Algeria</Text>
            <Text style={styles.flag}>🇩🇿</Text>
          </View>
        </View>
      </ScrollView>

      {/* Auth Modal */}
      <Modal 
        visible={authVisible} 
        animationType="slide" 
        presentationStyle="pageSheet" 
        onRequestClose={() => setAuthVisible(false)}
      >
        <AuthScreen onClose={() => setAuthVisible(false)} />
      </Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 24, zIndex: 1 },
  rtl: { alignItems: 'flex-end' },
  
  // Neural Network Background
  neuralNetwork: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },

  // Auth Card - Glass effect
  authCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  authEmoji: {
    fontSize: 32,
  },
  authTextWrap: {
    flex: 1,
  },
  authCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  authCardSubtitle: {
    fontSize: 13,
    opacity: 0.6,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 50,
  },
  authButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Badge - Pill shape
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    borderWidth: 1,
    marginBottom: 20,
  },
  badgeText: { fontSize: 13, fontWeight: '600' },
  greeting: { fontSize: 16, marginBottom: 8, opacity: 0.8 },
  title: { fontSize: 34, fontWeight: '800', marginBottom: 12, letterSpacing: -0.5 },
  tagline: { fontSize: 16, lineHeight: 26, opacity: 0.7 },
  
  // CTA Card - Soft organic shape
  ctaCard: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  ctaGlow: {
    position: 'absolute',
    top: -60,
    left: '25%',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.15,
  },
  ctaContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ctaIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaTextContainer: { flex: 1 },
  ctaTitle: { fontSize: 19, fontWeight: '700', marginBottom: 5 },
  ctaSubtitle: { fontSize: 14, opacity: 0.75 },
  ctaArrow: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Features Grid - Organic varied shapes
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    width: (width - 52) / 2,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 0,
    alignItems: 'center',
  },
  // Soft rounded cards - no asymmetric corners
  featureShape1: { borderRadius: 24 },
  featureShape2: { borderRadius: 24 },
  featureShape3: { borderRadius: 24 },
  featureShape4: { borderRadius: 24 },
  featureIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderRadius: 20,
  },
  iconShape1: { borderRadius: 18 },
  iconShape2: { borderRadius: 16 },
  iconShape3: { borderRadius: 18 },
  iconShape4: { borderRadius: 16 },
  featureLabel: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  featureDesc: { fontSize: 13, opacity: 0.6 },

  // Crisis Banner - Clean rounded
  crisisBanner: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    marginBottom: 24,
    position: 'relative',
  },
  pulseContainer: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseOuter: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    opacity: 0.5,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  crisisContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  crisisIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  crisisTextContainer: { flex: 1 },
  crisisLabel: { fontSize: 11, fontWeight: '600', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.8, opacity: 0.9 },
  crisisNumber: { fontSize: 26, fontWeight: '800' },
  crisisDesc: { fontSize: 12, marginTop: 2, opacity: 0.7 },
  crisisArrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer - Friendly pill
  footer: { alignItems: 'center', paddingTop: 8 },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 50,
  },
  footerText: { fontSize: 14, fontWeight: '500' },
  flag: { fontSize: 20 },
});
