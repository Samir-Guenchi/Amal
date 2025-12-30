import { create } from 'zustand';
import type { Language, LocalizedText } from '../types';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
  isRTL: () => boolean;
}

export const translations = {
  // App
  appName: { en: 'Amal', ar: 'أمل', fr: 'Amal', dz: 'أمل' },
  
  // Navigation
  home: { en: 'Home', ar: 'الرئيسية', fr: 'Accueil', dz: 'الرئيسية' },
  chat: { en: 'Chat', ar: 'محادثة', fr: 'Discussion', dz: 'هدرة' },
  resources: { en: 'Resources', ar: 'الموارد', fr: 'Ressources', dz: 'الموارد' },
  settings: { en: 'Settings', ar: 'الإعدادات', fr: 'Paramètres', dz: 'الإعدادات' },
  
  // Home
  welcome: { en: 'Welcome to Amal', ar: 'مرحباً بك في أمل', fr: 'Bienvenue sur Amal', dz: 'مرحبا بيك في أمل' },
  tagline: { en: 'Your companion in recovery', ar: 'رفيقك في رحلة التعافي', fr: 'Votre compagnon de rétablissement', dz: 'رفيقك في رحلة التعافي' },
  startChat: { en: 'Start a conversation', ar: 'ابدأ محادثة', fr: 'Commencer une conversation', dz: 'ابدا هدرة' },
  
  // Chat
  typeMessage: { en: 'Type your message...', ar: 'اكتب رسالتك...', fr: 'Écrivez votre message...', dz: 'اكتب رسالتك...' },
  thinking: { en: 'Thinking...', ar: 'جاري التفكير...', fr: 'Réflexion...', dz: 'راني نفكر...' },
  newChat: { en: 'New Chat', ar: 'محادثة جديدة', fr: 'Nouvelle discussion', dz: 'هدرة جديدة' },
  chatHistory: { en: 'Chat History', ar: 'سجل المحادثات', fr: 'Historique', dz: 'تاريخ الهدرة' },
  
  // Greetings
  goodMorning: { en: 'Good morning', ar: 'صباح الخير', fr: 'Bonjour', dz: 'صباح الخير' },
  goodAfternoon: { en: 'Good afternoon', ar: 'مساء الخير', fr: 'Bon après-midi', dz: 'مسا الخير' },
  goodEvening: { en: 'Good evening', ar: 'مساء الخير', fr: 'Bonsoir', dz: 'مسا الخير' },
  
  // Resources
  emergency: { en: 'Emergency', ar: 'طوارئ', fr: 'Urgence', dz: 'طوارئ' },
  crisisLine: { en: 'Crisis Line', ar: 'خط الأزمات', fr: 'Ligne de crise', dz: 'خط الأزمات' },
  available247: { en: 'Available 24/7', ar: 'متاح 24/7', fr: 'Disponible 24/7', dz: 'متوفر 24/7' },
  
  // Settings
  language: { en: 'Language', ar: 'اللغة', fr: 'Langue', dz: 'اللغة' },
  darkMode: { en: 'Dark Mode', ar: 'الوضع الداكن', fr: 'Mode sombre', dz: 'الوضع الداكن' },
  about: { en: 'About', ar: 'حول', fr: 'À propos', dz: 'على أمل' },
  
  // Empathy messages
  empathy1: { en: "I'm here for you", ar: 'أنا هنا من أجلك', fr: 'Je suis là pour vous', dz: 'راني هنا معاك' },
  empathy2: { en: 'Take your time', ar: 'خذ وقتك', fr: 'Prenez votre temps', dz: 'خذ وقتك' },
  empathy3: { en: "You're not alone", ar: 'لست وحدك', fr: "Vous n'êtes pas seul", dz: 'ماكش وحدك' },
} satisfies Record<string, LocalizedText>;

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'ar',
  setLanguage: (language) => set({ language }),
  t: (key) => translations[key][get().language],
  isRTL: () => get().language === 'ar' || get().language === 'dz',
}));
