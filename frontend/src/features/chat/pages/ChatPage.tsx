import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  ArrowLeft,
  ArrowRight,
  Brain,
  Shield,
  Sparkles,
  Phone,
  Mic,
  Paperclip,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  Menu,
  X,
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
  Pencil,
  Check,
  EyeOff,
  Heart,
  Clock,
  Copy,
  RotateCcw,
  ThumbsUp,
} from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';
import { useT, useLanguageStore, languages, Language } from '../../../store/languageStore';
import { sendChatMessage, ChatResponse } from '../../../services/api';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  intent?: string;
  source?: string;
  isError?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

export function ChatPage() {
  const { theme, toggleTheme } = useThemeStore();
  const t = useT();
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  // Chat sessions (history)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Current conversation',
      messages: [{ id: '1', content: t('chatPage.welcome'), role: 'assistant', timestamp: new Date() }],
      timestamp: new Date(),
    },
  ]);
  const [activeChatId, setActiveChatId] = useState('1');

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isTemporaryChat, setIsTemporaryChat] = useState(false);
  const [temporaryMessages, setTemporaryMessages] = useState<Message[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Check if RTL language
  const isRTL = language === 'ar' || language === 'dz';

  // Time-based greeting
  const getTimeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { en: 'Good morning', ar: 'صباح الخير', fr: 'Bonjour', dz: 'صباح الخير' };
    if (hour < 18) return { en: 'Good afternoon', ar: 'مساء الخير', fr: 'Bon après-midi', dz: 'مسا الخير' };
    return { en: 'Good evening', ar: 'مساء الخير', fr: 'Bonsoir', dz: 'مسا الخير' };
  }, []);

  // Empathy messages that appear occasionally
  const empathyMessages = useMemo(
    () => ({
      en: ['You are not alone', 'Every step matters', 'Your courage inspires'],
      ar: ['لست وحدك', 'كل خطوة مهمة', 'شجاعتك ملهمة'],
      fr: ["Vous n'êtes pas seul", 'Chaque pas compte', 'Votre courage inspire'],
      dz: ['ماكش وحدك', 'كل خطوة مهمة', 'الشجاعة تاعك ملهمة'],
    }),
    []
  );

  // Get active chat messages
  const activeChat = chatSessions.find((c) => c.id === activeChatId);
  const messages = isTemporaryChat ? temporaryMessages : (activeChat?.messages || []);

  // Close language menu and message actions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close message actions when scrolling
  useEffect(() => {
    const handleScroll = () => setSelectedMessageId(null);
    const messagesArea = document.querySelector('.overflow-y-auto');
    messagesArea?.addEventListener('scroll', handleScroll);
    return () => messagesArea?.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLangMenuOpen(false);
  };

  const getPrompts = () => [
    t('chatPage.prompt1'),
    t('chatPage.prompt2'),
    t('chatPage.prompt3'),
    t('chatPage.prompt4'),
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    if (isTemporaryChat) {
      // Temporary chat - don't save to history
      setTemporaryMessages((prev) => [...prev, userMessage]);
    } else {
      // Update chat session with new message
      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...chat.messages, userMessage],
                title: chat.messages.length === 1 ? input.slice(0, 30) + '...' : chat.title,
              }
            : chat
        )
      );
    }

    const userInput = input;
    setInput('');
    setIsTyping(true);

    try {
      // Call backend API
      const response: ChatResponse = await sendChatMessage(userInput);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        role: 'assistant',
        timestamp: new Date(),
        intent: response.intent,
        source: response.source,
      };

      if (isTemporaryChat) {
        setTemporaryMessages((prev) => [...prev, assistantMessage]);
      } else {
        setChatSessions((prev) =>
          prev.map((chat) =>
            chat.id === activeChatId ? { ...chat, messages: [...chat.messages, assistantMessage] } : chat
          )
        );
      }
    } catch (error) {
      // Fallback to local responses if backend is unavailable
      console.error('Backend error:', error);
      
      const fallbackResponses = [
        t('chatPage.response1'),
        t('chatPage.response2'),
        t('chatPage.response3'),
        t('chatPage.response4'),
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        role: 'assistant',
        timestamp: new Date(),
        isError: true,
      };

      if (isTemporaryChat) {
        setTemporaryMessages((prev) => [...prev, assistantMessage]);
      } else {
        setChatSessions((prev) =>
          prev.map((chat) =>
            chat.id === activeChatId ? { ...chat, messages: [...chat.messages, assistantMessage] } : chat
          )
        );
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const startNewChat = () => {
    setIsTemporaryChat(false);
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: t('chatPage.newConversation'),
      messages: [{ id: '1', content: t('chatPage.welcome'), role: 'assistant', timestamp: new Date() }],
      timestamp: new Date(),
    };
    setChatSessions((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setSidebarOpen(false);
  };

  const startTemporaryChat = () => {
    setIsTemporaryChat(true);
    setTemporaryMessages([
      { id: '1', content: t('chatPage.welcomeTemporary'), role: 'assistant', timestamp: new Date() },
    ]);
    setSidebarOpen(false);
  };

  const selectChat = (chatId: string) => {
    setIsTemporaryChat(false);
    setActiveChatId(chatId);
    setSidebarOpen(false);
  };

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (chatSessions.length === 1) {
      startNewChat();
    } else {
      setChatSessions((prev) => prev.filter((c) => c.id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(chatSessions[0].id === chatId ? chatSessions[1].id : chatSessions[0].id);
      }
    }
  };

  const startRenameChat = (chatId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  };

  const saveRenameChat = (chatId: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    if (editingTitle.trim()) {
      setChatSessions((prev) =>
        prev.map((chat) => (chat.id === chatId ? { ...chat, title: editingTitle.trim() } : chat))
      );
    }
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleRenameKeyDown = (chatId: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveRenameChat(chatId, e);
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
      setEditingTitle('');
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes typingDot {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
      <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-[#09090b]' : 'bg-white'}`}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 z-50 transform transition-all duration-300 overflow-hidden ${
          isRTL ? 'right-0' : 'left-0'
        } ${
          sidebarOpen
            ? 'translate-x-0 w-72'
            : isRTL
              ? 'translate-x-full w-72'
              : '-translate-x-full w-72'
        } ${
          sidebarCollapsed
            ? 'lg:w-0 lg:translate-x-0'
            : 'lg:relative lg:translate-x-0 lg:w-72'
        } ${
          !sidebarCollapsed &&
          (theme === 'dark'
            ? `bg-zinc-900 ${isRTL ? 'border-l border-zinc-800' : 'border-r border-zinc-800'}`
            : `bg-zinc-50 ${isRTL ? 'border-l border-zinc-200' : 'border-r border-zinc-200'}`)
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="p-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8">
                <path
                  d="M18 2C18 2 32 8 32 20C32 28 26 34 18 34C10 34 4 28 4 20C4 8 18 2 18 2Z"
                  className={theme === 'dark' ? 'fill-green-500' : 'fill-green-600'}
                />
                <path d="M18 8L12 24H15L18 16L21 24H24L18 8Z" fill={theme === 'dark' ? '#18181b' : 'white'} />
                <circle cx="18" cy="28" r="2" fill={theme === 'dark' ? '#18181b' : 'white'} />
              </svg>
              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>amal</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`lg:hidden p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-zinc-200'}`}
            >
              <X className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`} />
            </button>
          </div>

          {/* New chat button */}
          <div className="px-4 mb-2">
            <button
              onClick={startNewChat}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[1rem_0.5rem_1rem_0.5rem] transition-colors ${
                theme === 'dark'
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-green-600 hover:bg-green-500 text-white'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">{t('chatPage.newChat')}</span>
            </button>
          </div>

          {/* Temporary chat button */}
          <div className="px-4 mb-4">
            <button
              onClick={startTemporaryChat}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[0.5rem_1rem_0.5rem_1rem] transition-colors ${
                isTemporaryChat
                  ? theme === 'dark'
                    ? 'bg-amber-600/20 border border-amber-500/30 text-amber-400'
                    : 'bg-amber-50 border border-amber-300 text-amber-700'
                  : theme === 'dark'
                    ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300'
                    : 'bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-700'
              }`}
            >
              <EyeOff className="w-4 h-4" />
              <span className="text-sm">{t('chatPage.temporaryChat')}</span>
            </button>
          </div>

          {/* Chat history */}
          <div className="flex-1 overflow-y-auto px-4">
            <p className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>
              {t('chatPage.history')}
            </p>
            <div className="space-y-1">
              {chatSessions.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => editingChatId !== chat.id && selectChat(chat.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-[0.75rem_0.5rem_0.75rem_0.5rem] transition-colors group cursor-pointer ${
                    chat.id === activeChatId
                      ? theme === 'dark'
                        ? 'bg-white/10'
                        : 'bg-zinc-200'
                      : theme === 'dark'
                        ? 'hover:bg-white/5'
                        : 'hover:bg-zinc-100'
                  }`}
                >
                  <MessageSquare
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
                  />
                  <div className="flex-1 min-w-0 text-left">
                    {editingChatId === chat.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => handleRenameKeyDown(chat.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className={`w-full text-sm font-medium bg-transparent border-b outline-none ${
                          theme === 'dark'
                            ? 'text-zinc-200 border-green-500'
                            : 'text-zinc-800 border-green-500'
                        }`}
                      />
                    ) : (
                      <span
                        className={`text-sm font-medium truncate block ${
                          theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'
                        }`}
                      >
                        {chat.title}
                      </span>
                    )}
                    <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {chat.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {editingChatId === chat.id ? (
                      <button
                        onClick={(e) => saveRenameChat(chat.id, e)}
                        className={`p-1 rounded transition-colors ${
                          theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-zinc-300'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => startRenameChat(chat.id, chat.title, e)}
                          className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${
                            theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-zinc-300'
                          }`}
                        >
                          <Pencil className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`} />
                        </button>
                        <button
                          onClick={(e) => deleteChat(chat.id, e)}
                          className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${
                            theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-zinc-300'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header
          className={`sticky top-0 z-30 backdrop-blur-xl border-b ${
            theme === 'dark' ? 'bg-[#09090b]/90 border-white/5' : 'bg-white/90 border-zinc-200'
          }`}
        >
          <div className="px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className={`lg:hidden p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-zinc-100'}`}
              >
                <Menu className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`} />
              </button>
              {/* Desktop sidebar toggle */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`hidden lg:flex p-2 rounded-[0.75rem_0.5rem_0.75rem_0.5rem] transition-colors ${
                  theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-zinc-100'
                }`}
                title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
              >
                {isRTL ? (
                  sidebarCollapsed ? (
                    <PanelRight className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`} />
                  ) : (
                    <PanelRightClose className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`} />
                  )
                ) : sidebarCollapsed ? (
                  <PanelLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`} />
                ) : (
                  <PanelLeftClose className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`} />
                )}
              </button>
              <Link
                to="/"
                className={`p-2 rounded-[0.75rem_0.5rem_0.75rem_0.5rem] transition-colors ${
                  theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-zinc-100'
                }`}
              >
                {isRTL ? (
                  <ArrowRight className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`} />
                ) : (
                  <ArrowLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`} />
                )}
              </Link>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className={`w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center transition-transform duration-1000 ${
                      isTyping ? 'animate-pulse scale-105' : ''
                    }`}
                  >
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  {/* Breathing ring animation */}
                  <div
                    className={`absolute inset-0 rounded-full border-2 border-green-400/30 transition-all duration-1000 ${
                      isTyping ? 'scale-150 opacity-0' : 'scale-100 opacity-0'
                    }`}
                    style={{ animation: isTyping ? 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none' }}
                  />
                </div>
                <div>
                  <h1 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                    {t('chatPage.title')}
                  </h1>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 bg-green-500 rounded-full"
                      style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                    />
                    <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {getTimeGreeting[language]} · {t('chatPage.status')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language selector */}
              <div ref={langMenuRef} className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-[0.75rem_0.5rem_0.75rem_0.5rem] transition-colors ${
                    theme === 'dark'
                      ? 'text-zinc-400 hover:text-white hover:bg-white/5'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">{languages[language].nativeName}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {langMenuOpen && (
                  <div
                    className={`absolute top-full right-0 mt-2 py-2 rounded-[1rem_0.5rem_1rem_0.5rem] shadow-xl min-w-[160px] z-50 ${
                      theme === 'dark' ? 'bg-zinc-900 border border-white/10' : 'bg-white border border-zinc-200'
                    }`}
                  >
                    {(Object.keys(languages) as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center justify-between ${
                          language === lang
                            ? 'text-green-500 bg-green-500/10'
                            : theme === 'dark'
                              ? 'text-zinc-300 hover:bg-white/5'
                              : 'text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        <span>{languages[lang].nativeName}</span>
                        {language === lang && <span className="text-green-500">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-[0.5rem_0.75rem_0.5rem_0.75rem] transition-colors ${
                  theme === 'dark'
                    ? 'text-zinc-400 hover:text-white hover:bg-white/5'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {/* Privacy notice */}
            <div
              className={`flex items-center justify-center gap-2 mb-8 px-4 py-2 rounded-[1rem_0.5rem_1rem_0.5rem] w-fit mx-auto ${
                isTemporaryChat
                  ? theme === 'dark'
                    ? 'bg-amber-500/10 border border-amber-500/20'
                    : 'bg-amber-50 border border-amber-200'
                  : theme === 'dark'
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-green-50 border border-green-200'
              }`}
            >
              {isTemporaryChat ? (
                <>
                  <EyeOff className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-amber-600">{t('chatPage.temporaryNotice')}</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">{t('chatPage.private')}</span>
                </>
              )}
            </div>

            {/* Messages */}
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  style={{
                    animation: 'fadeInUp 0.4s ease-out forwards',
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  <div className="relative group">
                    <div
                      onClick={() => setSelectedMessageId(selectedMessageId === message.id ? null : message.id)}
                      className={`max-w-[85%] md:max-w-[70%] px-5 py-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-green-600 to-green-700 rounded-[1.25rem_1.25rem_0.25rem_1.25rem] shadow-lg shadow-green-500/10'
                          : theme === 'dark'
                            ? 'bg-white/5 rounded-[1.25rem_1.25rem_1.25rem_0.25rem] hover:bg-white/[0.07]'
                            : 'bg-zinc-100 border border-zinc-200 rounded-[1.25rem_1.25rem_1.25rem_0.25rem] shadow-sm hover:shadow-md'
                      } ${selectedMessageId === message.id ? 'ring-2 ring-green-500/50' : ''}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-green-500 font-medium">Amal</span>
                          </div>
                          {index > 0 && index % 3 === 0 && (
                            <div className="flex items-center gap-1 opacity-60">
                              <Heart className="w-3 h-3 text-rose-400" />
                            </div>
                          )}
                        </div>
                      )}
                      <p
                        className={`text-sm leading-relaxed ${
                          message.role === 'user' ? 'text-white' : theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                        }`}
                      >
                        {message.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {message.role === 'user' && <span className="text-xs text-green-300/70">✓</span>}
                      </div>
                    </div>

                    {/* Action buttons on click */}
                    {selectedMessageId === message.id && (
                      <div
                        className={`absolute ${message.role === 'user' ? 'right-0' : 'left-0'} -bottom-10 flex items-center gap-1 p-1 rounded-full ${
                          theme === 'dark' ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-zinc-200 shadow-lg'
                        }`}
                        style={{ animation: 'fadeInUp 0.2s ease-out' }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(message.content);
                            setSelectedMessageId(null);
                          }}
                          className={`p-2 rounded-full transition-colors ${
                            theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-zinc-100'
                          }`}
                          title="Copy"
                        >
                          <Copy className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`} />
                        </button>
                        {message.role === 'assistant' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMessageId(null);
                              }}
                              className={`p-2 rounded-full transition-colors ${
                                theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-zinc-100'
                              }`}
                              title="Regenerate"
                            >
                              <RotateCcw className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMessageId(null);
                              }}
                              className={`p-2 rounded-full transition-colors ${
                                theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-zinc-100'
                              }`}
                              title="Helpful"
                            >
                              <ThumbsUp className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator - more human-like */}
              {isTyping && (
                <div className="flex justify-start" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                  <div
                    className={`px-5 py-4 rounded-[1.25rem_1.25rem_1.25rem_0.25rem] ${
                      theme === 'dark' ? 'bg-white/5' : 'bg-zinc-100 border border-zinc-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-green-500 animate-pulse" />
                        <span className="text-xs text-green-500 font-medium">Amal</span>
                      </div>
                      <div className="flex gap-1.5">
                        <span
                          className="w-2 h-2 bg-green-500 rounded-full"
                          style={{ animation: 'typingDot 1.4s ease-in-out infinite', animationDelay: '0ms' }}
                        />
                        <span
                          className="w-2 h-2 bg-green-500 rounded-full"
                          style={{ animation: 'typingDot 1.4s ease-in-out infinite', animationDelay: '200ms' }}
                        />
                        <span
                          className="w-2 h-2 bg-green-500 rounded-full"
                          style={{ animation: 'typingDot 1.4s ease-in-out infinite', animationDelay: '400ms' }}
                        />
                      </div>
                      <span className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>
                        {t('chatPage.thinking')}
                      </span>
                    </div>
                    {/* Empathy message while typing */}
                    <p className={`text-xs mt-2 italic ${theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      {empathyMessages[language][Math.floor(Math.random() * 3)]}
                    </p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts - with staggered animation */}
            {messages.length === 1 && (
              <div className="mt-8">
                <p className={`text-sm mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-600'}`}>
                  <Sparkles className="w-4 h-4 text-green-500" />
                  {t('chatPage.suggested')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getPrompts().map((prompt, i) => {
                    const shapes = [
                      'rounded-[1rem_0.5rem_1rem_0.5rem]',
                      'rounded-[0.5rem_1rem_0.5rem_1rem]',
                      'rounded-[0.75rem_1.25rem_0.75rem_1.25rem]',
                      'rounded-[1.25rem_0.75rem_1.25rem_0.75rem]',
                    ];
                    const icons = [
                      <Heart key="heart" className="w-4 h-4 text-rose-400" />,
                      <Shield key="shield" className="w-4 h-4 text-blue-400" />,
                      <MessageSquare key="msg" className="w-4 h-4 text-amber-400" />,
                      <Brain key="brain" className="w-4 h-4 text-purple-400" />,
                    ];
                    return (
                      <button
                        key={`${language}-${i}`}
                        onClick={() => handlePromptClick(prompt)}
                        className={`group flex items-start gap-3 px-4 py-3 ${shapes[i]} text-sm transition-all duration-200 hover:scale-[1.02] ${
                          theme === 'dark'
                            ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:border-green-500/30'
                            : 'bg-white hover:bg-green-50 border border-zinc-200 text-zinc-700 shadow-sm hover:shadow-md hover:border-green-300'
                        }`}
                        style={{
                          animation: 'fadeInUp 0.4s ease-out forwards',
                          animationDelay: `${i * 0.1}s`,
                          opacity: 0,
                        }}
                      >
                        <span className="mt-0.5 transition-transform group-hover:scale-110">{icons[i]}</span>
                        <span className="text-left leading-relaxed">{prompt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input area */}
        <div
          className={`sticky bottom-0 pt-6 ${
            theme === 'dark'
              ? 'bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent'
              : 'bg-gradient-to-t from-white via-white to-transparent'
          }`}
        >
          <div className="max-w-3xl mx-auto px-4 pb-6">
            {/* Crisis line */}
            <div className={`flex items-center justify-center gap-2 mb-4 text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>
              <Phone className="w-4 h-4" />
              <span>
                {t('chatPage.crisis')}{' '}
                <a href="tel:3033" className="text-green-500 hover:underline">
                  3033
                </a>
              </span>
            </div>

            <div
              onClick={() => inputRef.current?.focus()}
              className={`flex items-end gap-3 p-2 rounded-[1.5rem_1rem_1.5rem_1rem] cursor-text transition-all duration-300 ${
                theme === 'dark'
                  ? `bg-white/5 border-2 ${
                      inputFocused
                        ? 'border-green-500/50 shadow-lg shadow-green-500/10 bg-white/[0.07]'
                        : input.trim()
                          ? 'border-green-500/30 shadow-lg shadow-green-500/5'
                          : 'border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                    }`
                  : `bg-zinc-50 border-2 ${
                      inputFocused
                        ? 'border-green-500 shadow-lg shadow-green-500/20 bg-white'
                        : input.trim()
                          ? 'border-green-400 shadow-lg shadow-green-500/10'
                          : 'border-zinc-300 hover:border-zinc-400 hover:bg-white'
                    } shadow-sm`
              }`}
            >
              <button
                className={`p-3 rounded-[0.75rem_0.5rem_0.75rem_0.5rem] transition-all duration-200 hover:scale-105 ${
                  theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-zinc-100'
                }`}
              >
                <Paperclip className={`w-5 h-5 transition-colors ${inputFocused ? 'text-green-500' : theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`} />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={t('chatPage.placeholder')}
                className={`flex-1 bg-transparent focus:outline-none py-3 ${
                  theme === 'dark' ? 'text-white placeholder:text-zinc-500' : 'text-zinc-900 placeholder:text-zinc-400'
                }`}
              />
              <button
                className={`p-3 rounded-[0.5rem_0.75rem_0.5rem_0.75rem] transition-all duration-200 hover:scale-105 ${
                  theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-zinc-100'
                }`}
              >
                <Mic className={`w-5 h-5 transition-colors ${inputFocused ? 'text-green-500' : theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`} />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-3 rounded-full transition-all duration-200 ${
                  input.trim()
                    ? 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 shadow-lg shadow-green-500/20 hover:scale-105'
                    : theme === 'dark'
                      ? 'bg-zinc-700'
                      : 'bg-zinc-200'
                } disabled:cursor-not-allowed`}
              >
                <Send className={`w-5 h-5 transition-transform ${input.trim() ? 'text-white translate-x-0.5 -translate-y-0.5' : 'text-zinc-400'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
