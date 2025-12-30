import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Animated, Dimensions, Modal, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Sun, ChevronRight, Sparkles, Heart, X, Phone, Shield, Brain, Users } from 'lucide-react-native';
import { useThemeStore, colors } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import type { Language, LocalizedText } from '../types';

const { width } = Dimensions.get('window');

const texts: Record<string, LocalizedText> = {
  badge: { en: 'Personalize your experience', ar: 'خصص تجربتك', fr: 'Personnalisez votre expérience', dz: 'خصص تجربتك' },
  title: { en: 'Settings', ar: 'الإعدادات', fr: 'Paramètres', dz: 'الإعدادات' },
  description: { en: 'Make Amal work the way you want', ar: 'اجعل أمل يعمل بالطريقة التي تريدها', fr: 'Faites fonctionner Amal comme vous le souhaitez', dz: 'خلي أمل يخدم كيما تحب' },
  appearance: { en: 'Appearance', ar: 'المظهر', fr: 'Apparence', dz: 'المظهر' },
  darkMode: { en: 'Dark Mode', ar: 'الوضع الداكن', fr: 'Mode sombre', dz: 'الوضع الداكن' },
  darkModeDesc: { en: 'Easier on the eyes at night', ar: 'أسهل على العينين في الليل', fr: 'Plus facile pour les yeux la nuit', dz: 'أسهل على العينين في الليل' },
  language: { en: 'Language', ar: 'اللغة', fr: 'Langue', dz: 'اللغة' },
  about: { en: 'About Amal', ar: 'حول أمل', fr: 'À propos de Amal', dz: 'على أمل' },
  aboutDesc: { en: 'Learn more about our mission', ar: 'تعرف على مهمتنا', fr: 'En savoir plus sur notre mission', dz: 'تعرف على مهمتنا' },
  version: { en: 'Version 1.0.0', ar: 'الإصدار 1.0.0', fr: 'Version 1.0.0', dz: 'الإصدار 1.0.0' },
  madeWith: { en: 'Made with love for Algeria', ar: 'صنع بحب للجزائر', fr: "Fait avec amour pour l'Algérie", dz: 'مصنوع بالحب للجزائر' },
  aboutTitle: { en: 'About Amal', ar: 'حول أمل', fr: 'À propos de Amal', dz: 'على أمل' },
  aboutMeaning: { en: 'Amal means "Hope" in Arabic', ar: 'أمل تعني الأمل', fr: 'Amal signifie "Espoir" en arabe', dz: 'أمل معناها الأمل' },
  mission: { en: 'Our Mission', ar: 'مهمتنا', fr: 'Notre Mission', dz: 'مهمتنا' },
  missionText: { en: 'Supporting recovery from addiction in Algeria through AI-powered compassionate assistance, available 24/7 in Arabic, French, Darija, and English.', ar: 'دعم التعافي من الإدمان في الجزائر من خلال المساعدة الرحيمة المدعومة بالذكاء الاصطناعي، متاحة على مدار الساعة بالعربية والفرنسية والدارجة والإنجليزية.', fr: "Soutenir le rétablissement de la dépendance en Algérie grâce à une assistance compatissante alimentée par l'IA, disponible 24h/24 en arabe, français, darija et anglais.", dz: 'ندعمو التعافي من الإدمان في الجزائر بالذكاء الاصطناعي، متوفر 24/7 بالعربية والفرنسية والدارجة والإنجليزية.' },
  features: { en: 'Features', ar: 'المميزات', fr: 'Fonctionnalités', dz: 'المميزات' },
  feature1: { en: 'AI-Powered Chat Support', ar: 'دعم محادثة بالذكاء الاصطناعي', fr: 'Support par chat IA', dz: 'دعم بالذكاء الاصطناعي' },
  feature2: { en: '100% Private & Confidential', ar: '100% خاص وسري', fr: '100% Privé et confidentiel', dz: '100% خاص وسري' },
  feature3: { en: 'Crisis Resources & Hotlines', ar: 'موارد الأزمات وخطوط المساعدة', fr: 'Ressources de crise', dz: 'موارد الأزمات' },
  feature4: { en: 'Multilingual Support', ar: 'دعم متعدد اللغات', fr: 'Support multilingue', dz: 'دعم بزاف لغات' },
  crisis: { en: 'Crisis Line', ar: 'خط الأزمات', fr: 'Ligne de crise', dz: 'خط الأزمات' },
  crisisAvailable: { en: 'Available 24/7 - Free & Confidential', ar: 'متاح 24/7 - مجاني وسري', fr: 'Disponible 24/7 - Gratuit', dz: 'متوفر 24/7 - مجاني وسري' },
  close: { en: 'Close', ar: 'إغلاق', fr: 'Fermer', dz: 'سكر' },
};

const languages: { code: Language; name: string; native: string; flag: string }[] = [
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'dz', name: 'Darija', native: 'الدارجة', flag: '🇩🇿' },
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
];

// Beautiful Language Card with slide indicator
function LanguageSelector({ currentLang, onSelect, c, theme }: { 
  currentLang: Language; onSelect: (lang: Language) => void; c: any; theme: string;
}) {
  const [containerWidth, setContainerWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(languages.map(() => new Animated.Value(1))).current;

  const itemWidth = containerWidth > 0 ? (containerWidth - 8) / 4 : 0;

  useEffect(() => {
    const index = languages.findIndex(l => l.code === currentLang);
    Animated.spring(slideAnim, {
      toValue: index * itemWidth,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();

    // Bounce selected
    Animated.sequence([
      Animated.timing(scaleAnims[index], { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnims[index], { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }),
    ]).start();
  }, [currentLang, itemWidth]);

  return (
    <View 
      style={[styles.langSelector, { 
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/* Sliding indicator */}
      {containerWidth > 0 && (
        <Animated.View 
          style={[
            styles.langIndicator, 
            { 
              backgroundColor: c.primary,
              width: itemWidth,
              transform: [{ translateX: slideAnim }],
            }
          ]} 
        />
      )}
      
      {/* Language options */}
      {languages.map((lang, index) => {
        const isSelected = lang.code === currentLang;
        return (
          <TouchableOpacity
            key={lang.code}
            onPress={() => onSelect(lang.code)}
            style={[styles.langOption, { width: itemWidth || 'auto' }]}
            activeOpacity={0.7}
          >
            <Animated.View style={[
              styles.langOptionInner,
              { transform: [{ scale: scaleAnims[index] }] }
            ]}>
              <Text style={styles.langOptionFlag}>{lang.flag}</Text>
              <Text style={[
                styles.langOptionText,
                { color: isSelected ? '#fff' : c.textMuted }
              ]}>
                {lang.code.toUpperCase()}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Simple Theme Toggle - Two buttons side by side (no animation delay)
function ThemeToggle({ isDark, onToggle, c }: { isDark: boolean; onToggle: () => void; c: any }) {
  return (
    <View style={styles.themeToggleContainer}>
      {/* Light Mode Button */}
      <TouchableOpacity
        onPress={() => isDark && onToggle()}
        style={[
          styles.themeBtn,
          { backgroundColor: !isDark ? '#FCD34D' : 'rgba(150,150,150,0.15)' }
        ]}
        activeOpacity={0.8}
      >
        <Sun size={20} color={!isDark ? '#fff' : '#999'} />
      </TouchableOpacity>

      {/* Dark Mode Button */}
      <TouchableOpacity
        onPress={() => !isDark && onToggle()}
        style={[
          styles.themeBtn,
          { backgroundColor: isDark ? c.primary : 'rgba(150,150,150,0.15)' }
        ]}
        activeOpacity={0.8}
      >
        <Moon size={20} color={isDark ? '#fff' : '#999'} />
      </TouchableOpacity>
    </View>
  );
}

// Glassmorphism Card Component
function GlassCard({ children, style, theme }: { children: React.ReactNode; style?: any; theme: string }) {
  return (
    <View style={[
      styles.glassCard,
      { 
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)',
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
      },
      style,
    ]}>
      {children}
    </View>
  );
}

// Algeria Neural Network - Same as HomeScreen
const STAR_CENTER = { x: 75, y: 40 };
const STAR_RADIUS = 15;

const getStarPoints = () => {
  const points = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * (Math.PI / 180);
    points.push({
      x: STAR_CENTER.x + STAR_RADIUS * Math.cos(angle),
      y: STAR_CENTER.y + STAR_RADIUS * Math.sin(angle) * 0.6,
      size: 8,
      isPrimary: true,
    });
  }
  return points;
};

const SCATTER_NODES = [
  { x: 88, y: 12, size: 4, isPrimary: false },
  { x: 92, y: 28, size: 3, isPrimary: false },
  { x: 95, y: 45, size: 4, isPrimary: false },
  { x: 90, y: 62, size: 3, isPrimary: false },
  { x: 85, y: 78, size: 4, isPrimary: false },
  { x: 70, y: 85, size: 3, isPrimary: false },
  { x: 55, y: 80, size: 4, isPrimary: false },
];


// Neural Node Component
function NeuralNode({ x, y, size, delay, color, isPrimary }: { 
  x: number; y: number; size: number; delay: number; color: string; isPrimary: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(isPrimary ? 0.8 : 0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: isPrimary ? 1.5 : 1.2, duration: 3000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 3000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 3000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: isPrimary ? 0.8 : 0.3, duration: 3000, useNativeDriver: true }),
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
        shadowRadius: isPrimary ? 12 : 5,
        elevation: isPrimary ? 6 : 2,
      }}
    />
  );
}

// Neural Line Component
function NeuralLine({ x1, y1, x2, y2, delay, color }: {
  x1: number; y1: number; x2: number; y2: number; delay: number; color: string;
}) {
  const opacity = useRef(new Animated.Value(0.08)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 0.35, duration: 1200, useNativeDriver: true }),
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

// Algeria Neural Network Background
function AlgeriaNeuralNetwork({ color }: { color: string }) {
  const starPoints = getStarPoints();
  const allNodes = [...starPoints, ...SCATTER_NODES];
  
  const connections: [number, number][] = [
    [0, 2], [2, 4], [4, 1], [1, 3], [3, 0],
    [0, 5], [1, 6], [2, 7], [3, 8], [4, 9],
  ];

  return (
    <View style={styles.neuralNetwork}>
      {connections.map(([i, j], index) => {
        if (!allNodes[i] || !allNodes[j]) return null;
        return (
          <NeuralLine
            key={`line-${index}`}
            x1={allNodes[i].x}
            y1={allNodes[i].y}
            x2={allNodes[j].x}
            y2={allNodes[j].y}
            delay={index * 200}
            color={color}
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
          color={color}
          isPrimary={node.isPrimary}
        />
      ))}
    </View>
  );
}

// About Modal Component
function AboutModal({ visible, onClose, c, theme, language }: { visible: boolean; onClose: () => void; c: any; theme: string; language: Language }) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 10 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const features = [
    { icon: Brain, text: texts.feature1[language], color: c.primary },
    { icon: Shield, text: texts.feature2[language], color: c.purple },
    { icon: Phone, text: texts.feature3[language], color: c.danger },
    { icon: Users, text: texts.feature4[language], color: c.blue },
  ];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        
        <Animated.View style={[styles.modalContent, { 
          backgroundColor: c.background, 
          transform: [{ translateY: slideAnim }] 
        }]}>
          <View style={[styles.modalHeader, { borderBottomColor: c.border }]}>
            <View style={styles.modalHeaderLeft}>
              <View style={[styles.modalLogo, { backgroundColor: c.primary }]}>
                <Sparkles size={24} color="#fff" />
              </View>
              <View>
                <Text style={[styles.modalTitle, { color: c.text }]}>{texts.aboutTitle[language]}</Text>
                <Text style={[styles.modalSubtitle, { color: c.primary }]}>{texts.aboutMeaning[language]}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.modalClose, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
              <X size={20} color={c.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: c.text }]}>{texts.mission[language]}</Text>
              <Text style={[styles.modalText, { color: c.textSecondary }]}>{texts.missionText[language]}</Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: c.text }]}>{texts.features[language]}</Text>
              <View style={styles.featuresGrid}>
                {features.map((f, i) => (
                  <View key={i} style={[styles.featureItem, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <View style={[styles.featureIcon, { backgroundColor: `${f.color}20` }]}>
                      <f.icon size={20} color={f.color} />
                    </View>
                    <Text style={[styles.featureText, { color: c.text }]}>{f.text}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.crisisCard, { backgroundColor: theme === 'dark' ? 'rgba(239,68,68,0.1)' : 'rgba(220,38,38,0.05)', borderColor: c.danger }]}
              onPress={() => Linking.openURL('tel:3033')}
              activeOpacity={0.8}
            >
              <View style={[styles.crisisIcon, { backgroundColor: c.danger }]}>
                <Phone size={24} color="#fff" />
              </View>
              <View style={styles.crisisInfo}>
                <Text style={[styles.crisisLabel, { color: c.danger }]}>{texts.crisis[language]}</Text>
                <Text style={[styles.crisisNumber, { color: c.text }]}>3033</Text>
                <Text style={[styles.crisisDesc, { color: c.textMuted }]}>{texts.crisisAvailable[language]}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.modalFooter}>
              <View style={[styles.footerBadge, { backgroundColor: c.primaryMuted }]}>
                <Heart size={14} color={c.primary} />
                <Text style={[styles.footerBadgeText, { color: c.textSecondary }]}>{texts.madeWith[language]}</Text>
                <Text>🇩🇿</Text>
              </View>
              <Text style={[styles.versionText, { color: c.textMuted }]}>{texts.version[language]}</Text>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}


export function SettingsScreen() {
  const { theme, toggleTheme } = useThemeStore();
  const { language, setLanguage, isRTL } = useLanguageStore();
  const c = colors[theme];
  const [aboutVisible, setAboutVisible] = useState(false);



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      {/* Algeria Neural Network Background */}
      <AlgeriaNeuralNetwork color={c.primary} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: c.primaryMuted }]}>
            <Sparkles size={14} color={c.primary} />
            <Text style={[styles.badgeText, { color: c.primary }]}>{texts.badge[language]}</Text>
          </View>
          <Text style={[styles.title, { color: c.text }, isRTL() && styles.rtlText]}>{texts.title[language]}</Text>
          <Text style={[styles.description, { color: c.textMuted }, isRTL() && styles.rtlText]}>{texts.description[language]}</Text>
        </View>

        {/* Theme & Language Combined Card */}
        <GlassCard theme={theme}>
          {/* Theme Row */}
          <View style={styles.settingRowNew}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingEmoji}>🌙</Text>
              <View>
                <Text style={[styles.settingLabel, { color: c.text }]}>{texts.darkMode[language]}</Text>
                <Text style={[styles.settingDesc, { color: c.textMuted }]}>{texts.darkModeDesc[language]}</Text>
              </View>
            </View>
            <ThemeToggle isDark={theme === 'dark'} onToggle={toggleTheme} c={c} />
          </View>

          <View style={[styles.divider, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]} />

          {/* Language Row */}
          <View style={styles.langSection}>
            <View style={styles.langHeader}>
              <Text style={styles.settingEmoji}>🌍</Text>
              <Text style={[styles.settingLabel, { color: c.text }]}>{texts.language[language]}</Text>
            </View>
            <LanguageSelector currentLang={language} onSelect={setLanguage} c={c} theme={theme} />
          </View>
        </GlassCard>

        {/* About Card */}
        <TouchableOpacity onPress={() => setAboutVisible(true)} activeOpacity={0.9}>
          <GlassCard theme={theme} style={styles.aboutCardNew}>
            <View style={styles.aboutContent}>
              <View style={[styles.aboutIcon, { backgroundColor: c.primaryMuted }]}>
                <Sparkles size={24} color={c.primary} />
              </View>
              <View style={styles.aboutText}>
                <Text style={[styles.settingLabel, { color: c.text }]}>{texts.about[language]}</Text>
                <Text style={[styles.settingDesc, { color: c.textMuted }]}>{texts.aboutDesc[language]}</Text>
              </View>
              <View style={[styles.aboutArrow, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                <ChevronRight size={20} color={c.textMuted} />
              </View>
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={[styles.footerCard, { backgroundColor: c.primaryMuted }]}>
            <Heart size={18} color={c.primary} />
            <Text style={[styles.footerText, { color: c.textSecondary }]}>{texts.madeWith[language]}</Text>
            <Text style={styles.flag}>🇩🇿</Text>
          </View>
          <Text style={[styles.versionTextMain, { color: c.textMuted }]}>{texts.version[language]}</Text>
        </View>
      </ScrollView>

      {/* About Modal */}
      <AboutModal visible={aboutVisible} onClose={() => setAboutVisible(false)} c={c} theme={theme} language={language} />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  
  // Neural Network
  neuralNetwork: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  
  // Header
  header: { marginBottom: 32, zIndex: 1 },
  badge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start', 
    gap: 8, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 50, 
    marginBottom: 20,
  },
  badgeText: { fontSize: 13, fontWeight: '600' },
  title: { fontSize: 34, fontWeight: '800', marginBottom: 10, letterSpacing: -0.5 },
  description: { fontSize: 16, lineHeight: 24, opacity: 0.7 },
  rtl: { flexDirection: 'row-reverse' },
  rtlText: { textAlign: 'right' },


  
  // Glass Card
  glassCard: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },

  // Setting Row New
  settingRowNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  settingEmoji: {
    fontSize: 28,
  },
  settingLabel: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  settingDesc: { fontSize: 13, opacity: 0.6 },

  // Theme Toggle - Two separate buttons
  themeToggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  themeBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Divider
  divider: {
    height: 1,
    marginVertical: 18,
  },

  // Language Section
  langSection: {
    gap: 14,
  },
  langHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  // Language Selector with sliding indicator
  langSelector: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  langIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: 12,
  },
  langOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    zIndex: 1,
  },
  langOptionInner: {
    alignItems: 'center',
    gap: 3,
  },
  langOptionFlag: {
    fontSize: 22,
  },
  langOptionText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // About Card New
  aboutCardNew: {
    marginBottom: 20,
  },
  aboutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  aboutIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutText: {
    flex: 1,
  },
  aboutArrow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer
  footer: { alignItems: 'center', marginTop: 20, paddingBottom: 20 },
  footerCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    paddingHorizontal: 24, 
    paddingVertical: 14, 
    borderRadius: 50, 
    marginBottom: 12,
  },
  footerText: { fontSize: 14, fontWeight: '500' },
  flag: { fontSize: 20 },
  versionTextMain: { fontSize: 13, opacity: 0.5 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { 
    maxHeight: '85%', 
    borderTopLeftRadius: 36, 
    borderTopRightRadius: 36, 
    overflow: 'hidden',
  },
  modalHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    borderBottomWidth: 1,
  },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  modalLogo: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  modalSubtitle: { fontSize: 13, marginTop: 2 },
  modalClose: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  modalBody: { padding: 20 },
  modalSection: { marginBottom: 24 },
  modalSectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  modalText: { fontSize: 15, lineHeight: 24 },

  featuresGrid: { gap: 10 },
  featureItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 14, 
    padding: 14, 
    borderRadius: 20,
  },
  featureIcon: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  featureText: { flex: 1, fontSize: 14, fontWeight: '500' },

  crisisCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    padding: 18, 
    borderRadius: 24, 
    borderWidth: 1.5, 
    marginBottom: 24,
  },
  crisisIcon: { 
    width: 54, 
    height: 54, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  crisisInfo: { flex: 1 },
  crisisLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  crisisNumber: { fontSize: 26, fontWeight: '800', marginVertical: 2 },
  crisisDesc: { fontSize: 12, opacity: 0.7 },

  modalFooter: { alignItems: 'center', paddingBottom: 30 },
  footerBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: 50, 
    marginBottom: 10,
  },
  footerBadgeText: { fontSize: 13 },
  versionText: { fontSize: 12, opacity: 0.5 },
});
