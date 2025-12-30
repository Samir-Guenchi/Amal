import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Sparkles, Menu, Plus, Brain, X, Trash2, Edit3, MessageCircle, Check, EyeOff, Eye, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore, colors } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import { useChatStore } from '../store/chatStore';
import { llmService } from '../services/llm';
import { NeuralBackground } from '../components/ui';
import type { Message, ChatSession, LocalizedText } from '../types';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.85;

const texts: Record<string, LocalizedText> = {
  chatHistory: { en: 'Conversations', ar: 'المحادثات', fr: 'Conversations', dz: 'المحادثات' },
  newChat: { en: 'New Chat', ar: 'محادثة جديدة', fr: 'Nouvelle discussion', dz: 'هدرة جديدة' },
  tempChat: { en: 'Temporary', ar: 'مؤقتة', fr: 'Temporaire', dz: 'مؤقتة' },
  tempDesc: { en: 'Not saved', ar: 'لا تُحفظ', fr: 'Non sauvegardé', dz: 'ما تتحفظش' },
  tempActive: { en: 'Temporary Mode', ar: 'الوضع المؤقت', fr: 'Mode temporaire', dz: 'الوضع المؤقت' },
  noChats: { en: 'No conversations', ar: 'لا توجد محادثات', fr: 'Aucune conversation', dz: 'ما كاين والو' },
  startFirst: { en: 'Start chatting', ar: 'ابدأ المحادثة', fr: 'Commencez à discuter', dz: 'ابدا الهدرة' },
  delete: { en: 'Delete', ar: 'حذف', fr: 'Supprimer', dz: 'امسح' },
  deleteConfirm: { en: 'Delete conversation?', ar: 'حذف المحادثة؟', fr: 'Supprimer?', dz: 'تمسح الهدرة؟' },
  cancel: { en: 'Cancel', ar: 'إلغاء', fr: 'Annuler', dz: 'الغي' },
  exitTemp: { en: 'Exit temporary?', ar: 'الخروج؟', fr: 'Quitter?', dz: 'تخرج؟' },
  exitTempDesc: { en: 'Messages will be deleted', ar: 'ستُحذف الرسائل', fr: 'Messages supprimés', dz: 'الرسائل غادي يتمسحو' },
};


// Animated typing dots
function TypingDots({ color }: { color: string }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.typingDotsRow}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View key={i} style={[styles.typingDot, { backgroundColor: color, transform: [{ translateY: dot }] }]} />
      ))}
    </View>
  );
}

// Message bubble with entrance animation
function MessageBubble({ item, isUser, c, theme, isRTL, index }: { item: Message; isUser: boolean; c: any; theme: string; isRTL: boolean; index: number }) {
  const slideAnim = useRef(new Animated.Value(isUser ? 50 : -50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  return (
    <Animated.View style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow, isRTL && styles.rtlRow,
      { opacity: opacityAnim, transform: [{ translateX: slideAnim }] }]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: theme === 'dark' ? 'rgba(34,197,94,0.2)' : 'rgba(22,163,74,0.15)' }]}>
          <Sparkles size={14} color={c.primary} />
        </View>
      )}
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble,
        isUser ? { backgroundColor: c.primary } : { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', borderColor: c.border, borderWidth: 1 }]}>
        <Text style={[styles.messageText, { color: isUser ? '#ffffff' : c.text }]}>{item.content}</Text>
        <Text style={[styles.messageTime, { color: isUser ? 'rgba(255,255,255,0.6)' : c.textMuted }]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Animated.View>
  );
}

export function ChatScreen() {
  const { theme } = useThemeStore();
  const { t, isRTL, language } = useLanguageStore();
  const { 
    sessions, currentSessionId, createSession, addMessage, setLoading, isLoading, getCurrentSession,
    setCurrentSession, deleteSession, renameSession, isTemporaryMode, temporaryMessages,
    setTemporaryMode, addTemporaryMessage, clearTemporaryMessages,
  } = useChatStore();
  const c = colors[theme];

  const [input, setInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  const flatListRef = useRef<FlatList>(null);
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const inputScaleAnim = useRef(new Animated.Value(1)).current;

  const session = getCurrentSession();
  const messages = isTemporaryMode ? temporaryMessages : (session?.messages || []);


  const openDrawer = () => {
    setDrawerOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.spring(drawerAnim, { toValue: 0, useNativeDriver: true, tension: 50, friction: 10 }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(drawerAnim, { toValue: -DRAWER_WIDTH, useNativeDriver: true, tension: 50, friction: 10 }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  };

  useEffect(() => {
    if (isLoading) {
      Animated.loop(Animated.sequence([
        Animated.timing(breatheAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
        Animated.timing(breatheAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])).start();
    } else { breatheAnim.setValue(1); }
  }, [isLoading, breatheAnim]);

  useEffect(() => {
    Animated.spring(inputScaleAnim, { toValue: inputFocused ? 1.02 : 1, useNativeDriver: true, tension: 100, friction: 10 }).start();
  }, [inputFocused, inputScaleAnim]);

  useEffect(() => { if (!currentSessionId && !isTemporaryMode) createSession(); }, [currentSessionId, isTemporaryMode, createSession]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  const empathyMessages = [t('empathy1'), t('empathy2'), t('empathy3')];
  const [empathyIndex, setEmpathyIndex] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => setEmpathyIndex((i) => (i + 1) % empathyMessages.length), 2500);
      return () => clearInterval(interval);
    }
  }, [isLoading, empathyMessages.length]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isTemporaryMode) {
      addTemporaryMessage({ content: userMessage, role: 'user' });
      setLoading(true);
      try {
        const response = await llmService.chat({ message: userMessage, sessionId: 'temp', language });
        addTemporaryMessage({ content: response.content, role: 'assistant' });
      } catch { addTemporaryMessage({ content: 'Sorry, an error occurred.', role: 'assistant' }); }
      finally { setLoading(false); }
    } else {
      const sessionId = currentSessionId || createSession();
      addMessage(sessionId, { content: userMessage, role: 'user' });
      setLoading(true);
      try {
        const response = await llmService.chat({ message: userMessage, sessionId, language });
        addMessage(sessionId, { content: response.content, role: 'assistant' });
      } catch { addMessage(sessionId, { content: 'Sorry, an error occurred.', role: 'assistant' }); }
      finally { setLoading(false); }
    }
  };

  const handleSelectSession = (id: string) => { setCurrentSession(id); closeDrawer(); };
  const handleNewChat = () => { createSession(); closeDrawer(); };
  const handleStartTempChat = () => { setTemporaryMode(true); clearTemporaryMessages(); closeDrawer(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); };
  
  const handleExitTempMode = () => {
    if (temporaryMessages.length > 0) {
      Alert.alert(texts.exitTemp[language], texts.exitTempDesc[language], [
        { text: texts.cancel[language], style: 'cancel' },
        { text: 'OK', onPress: () => { setTemporaryMode(false); clearTemporaryMessages(); } },
      ]);
    } else { setTemporaryMode(false); }
  };

  const handleDeleteSession = (id: string) => {
    Alert.alert(texts.delete[language], texts.deleteConfirm[language], [
      { text: texts.cancel[language], style: 'cancel' },
      { text: texts.delete[language], style: 'destructive', onPress: () => deleteSession(id) },
    ]);
  };

  const handleStartRename = (s: ChatSession) => { setEditingId(s.id); setEditTitle(s.title); };
  const handleSaveRename = () => { if (editingId && editTitle.trim()) renameSession(editingId, editTitle.trim()); setEditingId(null); };

  const formatDate = (date: Date) => {
    const diff = new Date().getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return language === 'ar' || language === 'dz' ? 'اليوم' : language === 'fr' ? "Aujourd'hui" : 'Today';
    if (days === 1) return language === 'ar' || language === 'dz' ? 'أمس' : language === 'fr' ? 'Hier' : 'Yesterday';
    return `${days}d`;
  };


  const renderMessage = ({ item, index }: { item: Message; index: number }) => (
    <MessageBubble item={item} isUser={item.role === 'user'} c={c} theme={theme} isRTL={isRTL()} index={index} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Animated.View style={[styles.emptyIcon, { 
        backgroundColor: isTemporaryMode 
          ? (theme === 'dark' ? 'rgba(168,85,247,0.12)' : 'rgba(147,51,234,0.08)')
          : (theme === 'dark' ? 'rgba(34,197,94,0.12)' : 'rgba(22,163,74,0.08)'),
        borderColor: isTemporaryMode ? c.purple : c.primary,
        transform: [{ scale: breatheAnim }] 
      }]}>
        {isTemporaryMode ? <EyeOff size={36} color={c.purple} /> : <Brain size={36} color={c.primary} />}
      </Animated.View>
      
      <Text style={[styles.emptyGreeting, { color: c.textMuted }]}>{getGreeting()}</Text>
      <Text style={[styles.emptyTitle, { color: c.text }]}>{isTemporaryMode ? texts.tempChat[language] : t('welcome')}</Text>
      <Text style={[styles.emptySubtitle, { color: c.textSecondary }]}>{isTemporaryMode ? texts.tempDesc[language] : t('empathy1')}</Text>
      
      {!isTemporaryMode && (
        <View style={styles.promptsContainer}>
          {[
            { en: "I need to talk", ar: "أحتاج للتحدث", fr: "J'ai besoin de parler", dz: "نحتاج نهدر" },
            { en: "How does recovery work?", ar: "كيف يعمل التعافي؟", fr: "Comment ça marche?", dz: "كيفاش التعافي؟" },
            { en: "I feel overwhelmed", ar: "أشعر بالإرهاق", fr: "Je suis dépassé", dz: "راني مضغوط" },
          ].map((prompt, i) => (
            <TouchableOpacity key={i} style={[styles.promptChip, { 
              backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', 
              borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}
              onPress={() => setInput(prompt[language as keyof typeof prompt] || prompt.en)} activeOpacity={0.7}>
              <Text style={[styles.promptText, { color: c.textSecondary }]}>{prompt[language as keyof typeof prompt] || prompt.en}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const accentColor = isTemporaryMode ? c.purple : c.primary;
  const accentMuted = isTemporaryMode ? c.purpleMuted : c.primaryMuted;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <NeuralBackground intensity="low" style={{ opacity: 0.4 }} />
      
      {/* Temp Mode Indicator */}
      {isTemporaryMode && (
        <TouchableOpacity style={[styles.tempBanner, { backgroundColor: c.purpleMuted }]} onPress={handleExitTempMode} activeOpacity={0.8}>
          <EyeOff size={14} color={c.purple} />
          <Text style={[styles.tempBannerText, { color: c.purple }]}>{texts.tempActive[language]}</Text>
          <View style={[styles.tempBannerClose, { backgroundColor: 'rgba(168,85,247,0.2)' }]}><X size={12} color={c.purple} /></View>
        </TouchableOpacity>
      )}
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
        <TouchableOpacity style={[styles.headerBtn, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]} onPress={openDrawer}>
          <Menu size={20} color={c.textSecondary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={[styles.headerAvatar, { backgroundColor: accentColor }]}>
            {isTemporaryMode ? <EyeOff size={16} color="#fff" /> : <Sparkles size={16} color="#fff" />}
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: c.text }]}>{isTemporaryMode ? texts.tempChat[language] : 'Amal'}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: accentColor }]} />
              <Text style={[styles.headerStatus, { color: accentColor }]}>
                {isLoading ? empathyMessages[empathyIndex] : (isTemporaryMode ? texts.tempDesc[language] : 'Online')}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={[styles.headerBtn, { backgroundColor: accentMuted }]} onPress={isTemporaryMode ? handleExitTempMode : handleNewChat}>
          {isTemporaryMode ? <Eye size={20} color={accentColor} /> : <Plus size={20} color={accentColor} />}
        </TouchableOpacity>
      </View>


      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList ref={flatListRef} data={messages} renderItem={renderMessage} keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.messagesList, messages.length === 0 && styles.emptyList]}
          ListEmptyComponent={renderEmpty} onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })} 
          showsVerticalScrollIndicator={false} />

        {/* Typing Indicator */}
        {isLoading && (
          <View style={[styles.typingContainer, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }]}>
            <View style={[styles.typingAvatar, { backgroundColor: accentMuted }]}>
              <Sparkles size={12} color={accentColor} />
            </View>
            <TypingDots color={accentColor} />
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputWrapper}>
          <Animated.View style={[styles.inputContainer, { 
            backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
            borderColor: inputFocused ? accentColor : (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
            transform: [{ scale: inputScaleAnim }],
            shadowColor: inputFocused ? accentColor : 'transparent',
          }]}>
            <TextInput style={[styles.input, { color: c.text }, isRTL() && styles.rtlInput]} 
              placeholder={t('typeMessage')} placeholderTextColor={c.textMuted}
              value={input} onChangeText={setInput} 
              onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)} 
              multiline maxLength={1000} textAlign={isRTL() ? 'right' : 'left'} />
            <TouchableOpacity style={[styles.sendBtn, { backgroundColor: input.trim() ? accentColor : (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') }]} 
              onPress={handleSend} disabled={!input.trim() || isLoading}>
              <Send size={18} color={input.trim() ? '#fff' : c.textMuted} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>

      {/* Drawer */}
      {drawerOpen && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeDrawer} activeOpacity={1} />
          </Animated.View>
          
          <Animated.View style={[styles.drawer, { backgroundColor: c.background, transform: [{ translateX: drawerAnim }] }]}>
            <SafeAreaView style={styles.drawerInner} edges={['top']}>
              {/* Drawer Header */}
              <View style={[styles.drawerHeader, { borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                <Text style={[styles.drawerTitle, { color: c.text }]}>{texts.chatHistory[language]}</Text>
                <TouchableOpacity onPress={closeDrawer} style={[styles.drawerClose, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                  <X size={18} color={c.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={styles.drawerActions}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: c.primary }]} onPress={handleNewChat}>
                  <Plus size={18} color="#fff" /><Text style={styles.actionBtnText}>{texts.newChat[language]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtnOutline, { borderColor: c.purple, backgroundColor: c.purpleMuted }]} onPress={handleStartTempChat}>
                  <EyeOff size={18} color={c.purple} /><Text style={[styles.actionBtnTextOutline, { color: c.purple }]}>{texts.tempChat[language]}</Text>
                </TouchableOpacity>
              </View>


              {/* Sessions */}
              <ScrollView style={styles.sessionsList} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {sessions.length === 0 ? (
                  <View style={styles.emptyDrawer}>
                    <MessageCircle size={32} color={c.textMuted} strokeWidth={1.5} />
                    <Text style={[styles.emptyDrawerText, { color: c.textMuted }]}>{texts.noChats[language]}</Text>
                  </View>
                ) : (
                  sessions.map((s, idx) => (
                    <View key={s.id} style={[styles.sessionCard, { 
                      backgroundColor: s.id === currentSessionId && !isTemporaryMode 
                        ? (theme === 'dark' ? 'rgba(34,197,94,0.1)' : 'rgba(22,163,74,0.08)') 
                        : (theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                      borderColor: s.id === currentSessionId && !isTemporaryMode ? c.primary : 'transparent',
                    }]}>
                      {editingId === s.id ? (
                        <View style={styles.editRow}>
                          <TextInput style={[styles.editInput, { color: c.text, backgroundColor: c.surface, borderColor: c.primary }]} 
                            value={editTitle} onChangeText={setEditTitle} autoFocus onSubmitEditing={handleSaveRename} />
                          <TouchableOpacity onPress={handleSaveRename} style={[styles.editSave, { backgroundColor: c.primary }]}>
                            <Check size={16} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <>
                          <TouchableOpacity style={styles.sessionMain} onPress={() => handleSelectSession(s.id)} activeOpacity={0.7}>
                            <View style={[styles.sessionIcon, { backgroundColor: s.id === currentSessionId && !isTemporaryMode ? c.primary : (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') }]}>
                              <MessageCircle size={16} color={s.id === currentSessionId && !isTemporaryMode ? '#fff' : c.textMuted} />
                            </View>
                            <View style={styles.sessionInfo}>
                              <Text style={[styles.sessionTitle, { color: c.text }]} numberOfLines={1}>{s.title}</Text>
                              <View style={styles.sessionMeta}>
                                <Clock size={10} color={c.textMuted} />
                                <Text style={[styles.sessionMetaText, { color: c.textMuted }]}>{formatDate(s.updatedAt)}</Text>
                                <Text style={[styles.sessionMetaText, { color: c.textMuted }]}>·</Text>
                                <Text style={[styles.sessionMetaText, { color: c.textMuted }]}>{s.messages.length}</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                          <View style={styles.sessionBtns}>
                            <TouchableOpacity onPress={() => handleStartRename(s)} style={styles.sessionBtn}><Edit3 size={14} color={c.textMuted} /></TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteSession(s.id)} style={styles.sessionBtn}><Trash2 size={14} color={c.danger} /></TouchableOpacity>
                          </View>
                        </>
                      )}
                    </View>
                  ))
                )}
              </ScrollView>
            </SafeAreaView>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  
  // Temp Banner
  tempBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 16 },
  tempBannerText: { fontSize: 13, fontWeight: '600' },
  tempBannerClose: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerBtn: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: { width: 40, height: 40, borderRadius: 14, borderTopRightRadius: 6, borderBottomLeftRadius: 6, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  headerStatus: { fontSize: 12, fontWeight: '500' },

  // Messages
  messagesList: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  emptyList: { flex: 1, justifyContent: 'center' },
  messageRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-end' },
  rtlRow: { flexDirection: 'row-reverse' },
  userRow: { justifyContent: 'flex-end' },
  assistantRow: { justifyContent: 'flex-start' },
  avatar: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  messageBubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  userBubble: { borderBottomRightRadius: 6 },
  assistantBubble: { borderBottomLeftRadius: 6 },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTime: { fontSize: 10, marginTop: 6, textAlign: 'right' },

  // Empty
  emptyContainer: { alignItems: 'center', paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 26, borderTopRightRadius: 10, borderBottomLeftRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyGreeting: { fontSize: 13, marginBottom: 4 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 28 },
  promptsContainer: { gap: 10, width: '100%' },
  promptChip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1 },
  promptText: { fontSize: 14, textAlign: 'center' },

  // Typing
  typingContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, padding: 12, borderRadius: 16, gap: 10 },
  typingAvatar: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  typingDotsRow: { flexDirection: 'row', gap: 4 },
  typingDot: { width: 7, height: 7, borderRadius: 4 },

  // Input
  inputWrapper: { paddingHorizontal: 16, paddingBottom: 110, paddingTop: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 8, borderRadius: 24, borderWidth: 1.5, gap: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  input: { flex: 1, fontSize: 16, maxHeight: 100, paddingVertical: 10, paddingHorizontal: 8 },
  rtlInput: { textAlign: 'right' },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },

  // Drawer
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  drawer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: DRAWER_WIDTH, shadowColor: '#000', shadowOffset: { width: 8, height: 0 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 20 },
  drawerInner: { flex: 1 },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
  drawerTitle: { fontSize: 22, fontWeight: '700' },
  drawerClose: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  
  drawerActions: { flexDirection: 'row', gap: 10, padding: 16 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  actionBtnOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  actionBtnTextOutline: { fontSize: 14, fontWeight: '600' },

  sessionsList: { flex: 1, paddingHorizontal: 12 },
  emptyDrawer: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyDrawerText: { fontSize: 14 },

  sessionCard: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8, borderRadius: 14, borderWidth: 1.5 },
  sessionMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  sessionIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sessionInfo: { flex: 1 },
  sessionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  sessionMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sessionMetaText: { fontSize: 11 },
  sessionBtns: { flexDirection: 'row', gap: 4 },
  sessionBtn: { padding: 8 },

  editRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  editInput: { flex: 1, fontSize: 14, padding: 10, borderRadius: 10, borderWidth: 1 },
  editSave: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
