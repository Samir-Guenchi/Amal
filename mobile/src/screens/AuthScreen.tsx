import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, Mail, Lock, User, ArrowLeft, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore, colors } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import { useAuthStore } from '../store/authStore';
import { NeuralBackground } from '../components/ui';
import type { LocalizedText } from '../types';

const { width } = Dimensions.get('window');

type AuthMode = 'signin' | 'signup' | 'forgot';

const texts: Record<string, LocalizedText> = {
  welcome: { en: 'Welcome to Amal', ar: 'مرحباً بك في أمل', fr: 'Bienvenue sur Amal', dz: 'مرحبا بيك في أمل' },
  signIn: { en: 'Sign In', ar: 'تسجيل الدخول', fr: 'Connexion', dz: 'دخول' },
  signUp: { en: 'Create Account', ar: 'إنشاء حساب', fr: 'Créer un compte', dz: 'انشاء حساب' },
  forgotPassword: { en: 'Forgot Password', ar: 'نسيت كلمة المرور', fr: 'Mot de passe oublié', dz: 'نسيت كلمة السر' },
  email: { en: 'Email', ar: 'البريد الإلكتروني', fr: 'Email', dz: 'الإيميل' },
  password: { en: 'Password', ar: 'كلمة المرور', fr: 'Mot de passe', dz: 'كلمة السر' },
  confirmPassword: { en: 'Confirm Password', ar: 'تأكيد كلمة المرور', fr: 'Confirmer le mot de passe', dz: 'أكد كلمة السر' },
  name: { en: 'Name (optional)', ar: 'الاسم (اختياري)', fr: 'Nom (optionnel)', dz: 'الاسم (اختياري)' },
  noAccount: { en: "Don't have an account?", ar: 'ليس لديك حساب؟', fr: "Pas de compte?", dz: 'ما عندكش حساب؟' },
  hasAccount: { en: 'Already have an account?', ar: 'لديك حساب بالفعل؟', fr: 'Déjà un compte?', dz: 'عندك حساب؟' },
  continueGuest: { en: 'Continue as Guest', ar: 'المتابعة كضيف', fr: 'Continuer en tant qu\'invité', dz: 'كمل كضيف' },
  resetPassword: { en: 'Reset Password', ar: 'إعادة تعيين كلمة المرور', fr: 'Réinitialiser', dz: 'رجع كلمة السر' },
  resetSent: { en: 'Reset link sent to your email', ar: 'تم إرسال رابط إعادة التعيين', fr: 'Lien envoyé à votre email', dz: 'الرابط راح للإيميل تاعك' },
  backToSignIn: { en: 'Back to Sign In', ar: 'العودة لتسجيل الدخول', fr: 'Retour à la connexion', dz: 'ارجع للدخول' },
  or: { en: 'or', ar: 'أو', fr: 'ou', dz: 'ولا' },
  guestNote: { en: 'Your data stays on this device', ar: 'بياناتك تبقى على هذا الجهاز', fr: 'Vos données restent sur cet appareil', dz: 'البيانات تبقى في التليفون' },
  signInDesc: { en: 'Sync your conversations across devices', ar: 'مزامنة محادثاتك عبر الأجهزة', fr: 'Synchronisez vos conversations', dz: 'زامن الهدرة تاعك' },
  signUpDesc: { en: 'Create an account to save your progress', ar: 'أنشئ حساباً لحفظ تقدمك', fr: 'Créez un compte pour sauvegarder', dz: 'انشئ حساب باش تحفظ' },
  passwordMismatch: { en: 'Passwords do not match', ar: 'كلمات المرور غير متطابقة', fr: 'Les mots de passe ne correspondent pas', dz: 'كلمات السر ما يتوافقوش' },
  invalidEmail: { en: 'Please enter a valid email', ar: 'أدخل بريداً إلكترونياً صالحاً', fr: 'Entrez un email valide', dz: 'دخل إيميل صحيح' },
  shortPassword: { en: 'Password must be at least 6 characters', ar: 'كلمة المرور 6 أحرف على الأقل', fr: 'Le mot de passe doit avoir 6 caractères', dz: 'كلمة السر لازم 6 حروف' },
};

// Animated glow orb component
function GlowOrb({ color, size, x, y, delay }: { color: string; size: number; x: number; y: number; delay: number }) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.3, duration: 4000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.5, duration: 4000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.8, duration: 4000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.2, duration: 4000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, [scale, opacity, delay]);

  return (
    <Animated.View style={[styles.glowOrb, { width: size, height: size, left: x, top: y, backgroundColor: color, opacity, transform: [{ scale }] }]} />
  );
}

interface AuthScreenProps {
  onClose?: () => void;
}

export function AuthScreen({ onClose }: AuthScreenProps) {
  const { theme } = useThemeStore();
  const { language, isRTL } = useLanguageStore();
  const { signIn, signUp, forgotPassword, continueAsGuest, isLoading } = useAuthStore();
  const c = colors[theme];

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const switchMode = (newMode: AuthMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -20, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setMode(newMode);
      setError('');
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    });
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!validateEmail(email)) {
      setError(texts.invalidEmail[language]);
      return;
    }

    if (mode !== 'forgot' && password.length < 6) {
      setError(texts.shortPassword[language]);
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError(texts.passwordMismatch[language]);
      return;
    }

    let success = false;
    if (mode === 'signin') {
      success = await signIn(email, password);
    } else if (mode === 'signup') {
      success = await signUp(email, password, name || undefined);
    } else {
      success = await forgotPassword(email);
      if (success) {
        Alert.alert('', texts.resetSent[language]);
        switchMode('signin');
        return;
      }
    }

    if (success && onClose) {
      onClose();
    }
  };

  const handleGuestContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    continueAsGuest();
    if (onClose) onClose();
  };

  const getTitle = () => {
    if (mode === 'signin') return texts.signIn[language];
    if (mode === 'signup') return texts.signUp[language];
    return texts.forgotPassword[language];
  };

  const getDescription = () => {
    if (mode === 'signin') return texts.signInDesc[language];
    if (mode === 'signup') return texts.signUpDesc[language];
    return '';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <NeuralBackground intensity="low" />
      
      <GlowOrb color={c.primary} size={200} x={-80} y={100} delay={0} />
      <GlowOrb color={c.purple} size={160} x={width - 60} y={300} delay={1500} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          {mode === 'forgot' && (
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
              onPress={() => switchMode('signin')}
            >
              <ArrowLeft size={20} color={c.text} />
            </TouchableOpacity>
          )}

          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: c.primaryMuted }]}>
              <Sparkles size={32} color={c.primary} />
            </View>
            <Text style={[styles.welcomeText, { color: c.textMuted }]}>{texts.welcome[language]}</Text>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              <Text style={[styles.title, { color: c.text }, isRTL() && styles.rtlText]}>{getTitle()}</Text>
              {getDescription() && (
                <Text style={[styles.description, { color: c.textSecondary }, isRTL() && styles.rtlText]}>
                  {getDescription()}
                </Text>
              )}
            </Animated.View>
          </View>

          {/* Form */}
          <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Name field (signup only) */}
            {mode === 'signup' && (
              <View style={[styles.inputContainer, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', borderColor: c.border }]}>
                <User size={20} color={c.textMuted} />
                <TextInput
                  style={[styles.input, { color: c.text }, isRTL() && styles.rtlInput]}
                  placeholder={texts.name[language]}
                  placeholderTextColor={c.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  textAlign={isRTL() ? 'right' : 'left'}
                />
              </View>
            )}

            {/* Email field */}
            <View style={[styles.inputContainer, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', borderColor: c.border }]}>
              <Mail size={20} color={c.textMuted} />
              <TextInput
                style={[styles.input, { color: c.text }, isRTL() && styles.rtlInput]}
                placeholder={texts.email[language]}
                placeholderTextColor={c.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textAlign={isRTL() ? 'right' : 'left'}
              />
            </View>

            {/* Password field */}
            {mode !== 'forgot' && (
              <View style={[styles.inputContainer, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', borderColor: c.border }]}>
                <Lock size={20} color={c.textMuted} />
                <TextInput
                  style={[styles.input, { color: c.text }, isRTL() && styles.rtlInput]}
                  placeholder={texts.password[language]}
                  placeholderTextColor={c.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  textAlign={isRTL() ? 'right' : 'left'}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color={c.textMuted} /> : <Eye size={20} color={c.textMuted} />}
                </TouchableOpacity>
              </View>
            )}

            {/* Confirm Password field (signup only) */}
            {mode === 'signup' && (
              <View style={[styles.inputContainer, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', borderColor: c.border }]}>
                <Lock size={20} color={c.textMuted} />
                <TextInput
                  style={[styles.input, { color: c.text }, isRTL() && styles.rtlInput]}
                  placeholder={texts.confirmPassword[language]}
                  placeholderTextColor={c.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  textAlign={isRTL() ? 'right' : 'left'}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={20} color={c.textMuted} /> : <Eye size={20} color={c.textMuted} />}
                </TouchableOpacity>
              </View>
            )}

            {/* Forgot password link */}
            {mode === 'signin' && (
              <TouchableOpacity onPress={() => switchMode('forgot')} style={styles.forgotLink}>
                <Text style={[styles.forgotText, { color: c.primary }]}>{texts.forgotPassword[language]}</Text>
              </TouchableOpacity>
            )}

            {/* Error message */}
            {error ? (
              <View style={[styles.errorContainer, { backgroundColor: `${c.danger}15` }]}>
                <Text style={[styles.errorText, { color: c.danger }]}>{error}</Text>
              </View>
            ) : null}

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: c.primary }]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitText}>
                    {mode === 'forgot' ? texts.resetPassword[language] : getTitle()}
                  </Text>
                  <ArrowRight size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {/* Mode switch */}
            {mode !== 'forgot' && (
              <View style={styles.switchContainer}>
                <Text style={[styles.switchText, { color: c.textSecondary }]}>
                  {mode === 'signin' ? texts.noAccount[language] : texts.hasAccount[language]}
                </Text>
                <TouchableOpacity onPress={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}>
                  <Text style={[styles.switchLink, { color: c.primary }]}>
                    {mode === 'signin' ? texts.signUp[language] : texts.signIn[language]}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
              <Text style={[styles.dividerText, { color: c.textMuted }]}>{texts.or[language]}</Text>
              <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
            </View>

            {/* Guest button */}
            <TouchableOpacity
              style={[styles.guestButton, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', borderColor: c.border }]}
              onPress={handleGuestContinue}
              activeOpacity={0.8}
            >
              <Text style={[styles.guestText, { color: c.text }]}>{texts.continueGuest[language]}</Text>
            </TouchableOpacity>
            <Text style={[styles.guestNote, { color: c.textMuted }]}>{texts.guestNote[language]}</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  glowOrb: { position: 'absolute', borderRadius: 200 },
  
  backButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 16,
  },
  
  header: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  logoContainer: { 
    width: 72, 
    height: 72, 
    borderRadius: 24,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 20,
  },
  welcomeText: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  description: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  rtlText: { textAlign: 'right' },
  
  form: { gap: 16 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 16 },
  rtlInput: { textAlign: 'right' },
  
  forgotLink: { alignSelf: 'flex-end', marginTop: -8 },
  forgotText: { fontSize: 14, fontWeight: '500' },
  
  errorContainer: { padding: 12, borderRadius: 12 },
  errorText: { fontSize: 14, textAlign: 'center' },
  
  submitButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderTopLeftRadius: 6,
    borderBottomRightRadius: 6,
    marginTop: 8,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  switchContainer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  switchText: { fontSize: 14 },
  switchLink: { fontSize: 14, fontWeight: '600' },
  
  divider: { flexDirection: 'row', alignItems: 'center', gap: 16, marginVertical: 24 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },
  
  guestButton: { 
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  guestText: { fontSize: 16, fontWeight: '500' },
  guestNote: { fontSize: 12, textAlign: 'center', marginTop: 8 },
});
