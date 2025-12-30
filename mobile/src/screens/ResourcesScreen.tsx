import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, MapPin, ChevronDown, Heart, Shield, BookOpen, Users } from 'lucide-react-native';
import { useThemeStore, colors } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import type { LocalizedText } from '../types';

// Data - No emojis, use icons and colors instead for professional look
const emergencyContacts = [
  { name: { en: 'Crisis Line', ar: 'خط الأزمات', fr: 'Ligne de crise', dz: 'خط الأزمات' }, number: '3033', desc: { en: '24/7 · Free · Confidential', ar: 'مجاني · سري · 24/7', fr: 'Gratuit · Confidentiel · 24/7', dz: 'مجاني · سري · 24/7' }, primary: true },
  { name: { en: 'SAMU', ar: 'سامو', fr: 'SAMU', dz: 'سامو' }, number: '115', desc: { en: 'Medical', ar: 'طبي', fr: 'Médical', dz: 'طبي' }, primary: false },
  { name: { en: 'Police', ar: 'الشرطة', fr: 'Police', dz: 'البوليس' }, number: '17', desc: { en: 'Danger', ar: 'خطر', fr: 'Danger', dz: 'خطر' }, primary: false },
];

const treatmentCenters = [
  { name: { en: 'Frantz Fanon Hospital', ar: 'مستشفى فرانز فانون', fr: 'Hôpital Frantz Fanon', dz: 'سبيطار فرانز فانون' }, city: { en: 'Blida', ar: 'البليدة', fr: 'Blida', dz: 'البليدة' }, type: { en: 'Psychiatric', ar: 'نفسي', fr: 'Psychiatrique', dz: 'نفسي' } },
  { name: { en: 'Drid Hocine Hospital', ar: 'مستشفى دريد حسين', fr: 'Hôpital Drid Hocine', dz: 'سبيطار دريد حسين' }, city: { en: 'Algiers', ar: 'الجزائر', fr: 'Alger', dz: 'الجزائر' }, type: { en: 'Addiction', ar: 'إدمان', fr: 'Addiction', dz: 'إدمان' } },
  { name: { en: 'EHS Psychiatry', ar: 'مؤسسة الصحة النفسية', fr: 'EHS Psychiatrie', dz: 'مؤسسة الصحة النفسية' }, city: { en: 'Oran', ar: 'وهران', fr: 'Oran', dz: 'وهران' }, type: { en: 'Mental Health', ar: 'صحة نفسية', fr: 'Santé mentale', dz: 'صحة نفسية' } },
];

const learnTopics = [
  { title: { en: 'Understanding Addiction', ar: 'فهم الإدمان', fr: "Comprendre l'addiction", dz: 'فهم الإدمان' }, snippet: { en: 'Your brain can heal. It takes time, but recovery is real.', ar: 'دماغك يمكنه الشفاء. يحتاج وقت لكن التعافي حقيقي.', fr: 'Votre cerveau peut guérir.', dz: 'مخك يقدر يبرا. يحتاج وقت.' }, color: 'purple' },
  { title: { en: 'The First 90 Days', ar: 'أول 90 يوم', fr: 'Les 90 premiers jours', dz: 'أول 90 يوم' }, snippet: { en: 'What happens in your body and mind during early recovery.', ar: 'ماذا يحدث في جسمك وعقلك خلال التعافي المبكر.', fr: 'Ce qui se passe dans votre corps.', dz: 'واش يصرا في جسمك ومخك.' }, color: 'blue' },
  { title: { en: 'Staying Strong', ar: 'البقاء قوياً', fr: 'Rester fort', dz: 'البقاء قوي' }, snippet: { en: 'Practical tips to handle triggers and build new habits.', ar: 'نصائح عملية للتعامل مع المحفزات.', fr: 'Conseils pratiques.', dz: 'نصائح عملية للتعامل مع المحفزات.' }, color: 'green' },
];

const familyTips = [
  { q: { en: 'How do I start the conversation?', ar: 'كيف أبدأ الحديث؟', fr: 'Comment commencer?', dz: 'كيفاش نبدا الهدرة؟' }, a: { en: 'Pick a quiet moment. Say what you\'ve noticed without blame. Listen more than you talk.', ar: 'اختر لحظة هادئة. قل ما لاحظته بدون لوم. استمع أكثر مما تتكلم.', fr: 'Choisissez un moment calme.', dz: 'اختار وقت هادي. قول واش لاحظت بلا لوم.' } },
  { q: { en: 'They don\'t want help. Now what?', ar: 'لا يريدون المساعدة. ماذا أفعل؟', fr: 'Ils refusent l\'aide?', dz: 'ما يحبوش المساعدة. واش ندير؟' }, a: { en: 'You can\'t force someone to change. Set clear boundaries for yourself. Leave the door open.', ar: 'لا يمكنك إجبار أحد على التغيير. ضع حدوداً واضحة لنفسك.', fr: 'Vous ne pouvez pas forcer.', dz: 'ما تقدرش تجبر حد يتبدل. حط حدود.' } },
  { q: { en: 'I\'m exhausted. Is that normal?', ar: 'أنا منهك. هل هذا طبيعي؟', fr: 'Je suis épuisé. C\'est normal?', dz: 'أنا تعبان. هذا عادي؟' }, a: { en: 'Yes. Caring for someone with addiction is hard. Find a support group. Take breaks. Your health matters.', ar: 'نعم. رعاية شخص مدمن صعبة. ابحث عن مجموعة دعم.', fr: 'Oui. Trouvez un groupe de soutien.', dz: 'إيه. رعاية واحد مدمن صعيبة. لقى مجموعة دعم.' } },
];

const texts: Record<string, LocalizedText> = {
  greeting: { en: 'You\'re not alone in this', ar: 'لست وحدك في هذا', fr: 'Vous n\'êtes pas seul', dz: 'ماكش وحدك في هذا' },
  subtitle: { en: 'Real help. Real people. Anytime.', ar: 'مساعدة حقيقية. أشخاص حقيقيون. في أي وقت.', fr: 'Aide réelle. Personnes réelles.', dz: 'مساعدة حقيقية. ناس حقيقيين. أي وقت.' },
  emergency: { en: 'If you need help now', ar: 'إذا كنت بحاجة للمساعدة الآن', fr: 'Si vous avez besoin d\'aide', dz: 'إذا تحتاج مساعدة دروك' },
  callNow: { en: 'Call', ar: 'اتصل', fr: 'Appeler', dz: 'عيط' },
  centers: { en: 'Where to go', ar: 'أين تذهب', fr: 'Où aller', dz: 'وين تروح' },
  learn: { en: 'Understand what\'s happening', ar: 'افهم ما يحدث', fr: 'Comprendre', dz: 'افهم واش يصرا' },
  family: { en: 'For those who care', ar: 'لمن يهتمون', fr: 'Pour ceux qui aiment', dz: 'للي يهتمو' },
  strength: { en: 'Reaching out takes courage', ar: 'طلب المساعدة يحتاج شجاعة', fr: 'Demander de l\'aide demande du courage', dz: 'طلب المساعدة يحتاج شجاعة' },
};


// Neural Network Background (same as other screens)
const NEURAL_NODES = [
  { x: 85, y: 8, size: 5 }, { x: 92, y: 20, size: 4 }, { x: 88, y: 35, size: 6 },
  { x: 95, y: 50, size: 4 }, { x: 90, y: 65, size: 5 }, { x: 85, y: 80, size: 4 },
];

function NeuralNode({ x, y, size, delay, color }: { x: number; y: number; size: number; delay: number; color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.4, duration: 2500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.9, duration: 2500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 2500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.4, duration: 2500, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, opacity, transform: [{ scale }],
      shadowColor: color, shadowOpacity: 0.6, shadowRadius: 8, elevation: 3,
    }} />
  );
}

function NeuralBg({ color }: { color: string }) {
  return (
    <View style={styles.neuralBg}>
      {NEURAL_NODES.map((n, i) => (
        <NeuralNode key={i} x={n.x} y={n.y} size={n.size} delay={i * 200} color={color} />
      ))}
    </View>
  );
}

// Expandable FAQ Card - No emoji, uses icon
function FaqCard({ question, answer, c, theme, index }: { 
  question: string; answer: string; c: any; theme: string; index: number;
}) {
  const [open, setOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    setOpen(!open);
    Animated.spring(rotateAnim, { toValue: open ? 0 : 1, useNativeDriver: true, tension: 100, friction: 10 }).start();
  };

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <TouchableOpacity 
      onPress={toggle} 
      style={[styles.faqCard, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff' }]}
      activeOpacity={0.8}
    >
      <View style={styles.faqHeader}>
        <View style={[styles.faqIcon, { backgroundColor: c.primaryMuted }]}>
          <Users size={16} color={c.primary} />
        </View>
        <Text style={[styles.faqQ, { color: c.text }]}>{question}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronDown size={20} color={c.textMuted} />
        </Animated.View>
      </View>
      {open && <Text style={[styles.faqA, { color: c.textMuted }]}>{answer}</Text>}
    </TouchableOpacity>
  );
}

export function ResourcesScreen() {
  const { theme } = useThemeStore();
  const { language, isRTL } = useLanguageStore();
  const c = colors[theme];

  const handleCall = (num: string) => Linking.openURL(`tel:${num}`);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <NeuralBg color={c.primary} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Warm Header - Icon instead of emoji */}
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: c.primaryMuted }]}>
            <Heart size={28} color={c.primary} />
          </View>
          <Text style={[styles.greeting, { color: c.text }]}>{texts.greeting[language]}</Text>
          <Text style={[styles.subtitle, { color: c.textMuted }]}>{texts.subtitle[language]}</Text>
        </View>

        {/* Emergency Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>{texts.emergency[language]}</Text>
          
          {/* Primary Crisis Line - Icon instead of emoji */}
          {emergencyContacts.filter(e => e.primary).map((contact, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleCall(contact.number)}
              style={[styles.crisisCard, { backgroundColor: c.primary }]}
              activeOpacity={0.9}
            >
              <View style={styles.crisisLeft}>
                <View style={styles.crisisIconWrap}>
                  <Phone size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.crisisName}>{contact.name[language]}</Text>
                  <Text style={styles.crisisDesc}>{contact.desc[language]}</Text>
                </View>
              </View>
              <View style={styles.crisisRight}>
                <Text style={styles.crisisNumber}>{contact.number}</Text>
                <View style={styles.callBtn}>
                  <Phone size={18} color={c.primary} />
                  <Text style={[styles.callText, { color: c.primary }]}>{texts.callNow[language]}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Secondary Contacts - Icons instead of emojis */}
          <View style={styles.secondaryRow}>
            {emergencyContacts.filter(e => !e.primary).map((contact, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handleCall(contact.number)}
                style={[styles.secondaryCard, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff' }]}
                activeOpacity={0.8}
              >
                <View style={[styles.secondaryIcon, { backgroundColor: i === 0 ? c.blueMuted : c.primaryMuted }]}>
                  {i === 0 ? <Heart size={20} color={c.blue} /> : <Shield size={20} color={c.primary} />}
                </View>
                <Text style={[styles.secondaryName, { color: c.text }]}>{contact.name[language]}</Text>
                <Text style={[styles.secondaryNum, { color: c.primary }]}>{contact.number}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Treatment Centers */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>{texts.centers[language]}</Text>
          {treatmentCenters.map((center, i) => (
            <View 
              key={i} 
              style={[styles.centerCard, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff' }]}
            >
              <View style={[styles.centerIcon, { backgroundColor: c.blueMuted }]}>
                <MapPin size={20} color={c.blue} />
              </View>
              <View style={styles.centerInfo}>
                <Text style={[styles.centerName, { color: c.text }]}>{center.name[language]}</Text>
                <Text style={[styles.centerMeta, { color: c.textMuted }]}>
                  {center.city[language]} · {center.type[language]}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Learn Section - Color accent instead of emoji */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>{texts.learn[language]}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.learnScroll}>
            {learnTopics.map((topic, i) => {
              const accentColor = topic.color === 'purple' ? '#a855f7' : topic.color === 'blue' ? '#3b82f6' : '#22c55e';
              return (
                <View 
                  key={i} 
                  style={[styles.learnCard, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff' }]}
                >
                  <View style={[styles.learnAccent, { backgroundColor: accentColor }]}>
                    <BookOpen size={18} color="#fff" />
                  </View>
                  <Text style={[styles.learnTitle, { color: c.text }]}>{topic.title[language]}</Text>
                  <Text style={[styles.learnSnippet, { color: c.textMuted }]}>{topic.snippet[language]}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Family Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>{texts.family[language]}</Text>
          {familyTips.map((tip, i) => (
            <FaqCard 
              key={i} 
              index={i}
              question={tip.q[language]} 
              answer={tip.a[language]} 
              c={c} 
              theme={theme} 
            />
          ))}
        </View>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: c.primaryMuted }]}>
          <Text style={[styles.footerText, { color: c.text }]}>{texts.strength[language]}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 120 },
  
  // Neural Background
  neuralBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },

  // Header - Warm and human
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 10,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },

  // Section
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
    marginLeft: 4,
  },

  // Crisis Card - Primary
  crisisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  crisisLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  crisisIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crisisName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  crisisDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  crisisRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  crisisNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  callText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Secondary Contacts
  secondaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    gap: 8,
  },
  secondaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryNum: {
    fontSize: 20,
    fontWeight: '800',
  },

  // Center Cards
  centerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
  },
  centerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerInfo: {
    flex: 1,
  },
  centerName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  centerMeta: {
    fontSize: 13,
  },

  // Learn Cards - Horizontal scroll
  learnScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  learnCard: {
    width: 160,
    padding: 18,
    borderRadius: 20,
    marginRight: 12,
  },
  learnAccent: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  learnTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  learnSnippet: {
    fontSize: 13,
    lineHeight: 18,
  },

  // FAQ Cards
  faqCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  faqIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqQ: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  faqA: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 14,
    marginLeft: 36,
  },

  // Footer
  footer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    marginTop: 8,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
