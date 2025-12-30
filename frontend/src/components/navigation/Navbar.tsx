import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle, Sun, Moon, Globe, ChevronDown } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useLanguageStore, useT, languages, Language } from '../../store/languageStore';

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = useT();
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLangMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? theme === 'dark'
            ? 'bg-[#09090b]/90 backdrop-blur-xl border-b border-white/5'
            : 'bg-white/90 backdrop-blur-xl border-b border-zinc-200'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {/* Innovative logo - Intertwined paths representing journey & hope */}
            <div className="relative w-9 h-9">
              <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
                {/* Outer organic shape - like a seed/beginning */}
                <path 
                  d="M18 2C18 2 32 8 32 20C32 28 26 34 18 34C10 34 4 28 4 20C4 8 18 2 18 2Z"
                  className={`${theme === 'dark' ? 'fill-green-500' : 'fill-green-600'} transition-colors duration-300 group-hover:fill-emerald-500`}
                />
                {/* Inner negative space - creates "A" and rising path */}
                <path 
                  d="M18 8L12 24H15L18 16L21 24H24L18 8Z"
                  fill={theme === 'dark' ? '#09090b' : 'white'}
                />
                {/* Dot - the spark of hope */}
                <circle 
                  cx="18" 
                  cy="28" 
                  r="2"
                  fill={theme === 'dark' ? '#09090b' : 'white'}
                />
              </svg>
            </div>
            {/* Wordmark */}
            <div className="flex items-baseline gap-1">
              <span className={`text-[22px] font-bold tracking-tight ${
                theme === 'dark' ? 'text-white' : 'text-zinc-900'
              }`}>
                amal
              </span>
              <span className={`text-[10px] font-medium ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                dz
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm transition-colors ${
                isActive('/')
                  ? theme === 'dark' ? 'text-white' : 'text-zinc-900'
                  : theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/resources"
              className={`text-sm transition-colors ${
                isActive('/resources')
                  ? theme === 'dark' ? 'text-white' : 'text-zinc-900'
                  : theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t('nav.resources')}
            </Link>
            <Link
              to="/about"
              className={`text-sm transition-colors ${
                isActive('/about')
                  ? theme === 'dark' ? 'text-white' : 'text-zinc-900'
                  : theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t('nav.about')}
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language selector */}
            <div ref={langMenuRef} className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'text-zinc-400 hover:text-white hover:bg-white/5'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">{languages[language].nativeName}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {langMenuOpen && (
                <div className={`absolute top-full right-0 mt-2 py-2 rounded-xl shadow-xl min-w-[160px] z-50 ${
                  theme === 'dark' ? 'bg-zinc-900 border border-white/10' : 'bg-white border border-zinc-200'
                }`}>
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
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'text-zinc-400 hover:text-white hover:bg-white/5'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link
              to="/login"
              className={`text-sm transition-colors ${
                theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t('nav.signIn')}
            </Link>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-full transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t('nav.startChat')}
            </Link>
          </div>

          {/* Mobile buttons */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile language selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}
              >
                <Globe className="w-5 h-5" />
              </button>
              {langMenuOpen && (
                <div className={`absolute top-full right-0 mt-2 py-2 rounded-xl shadow-xl min-w-[140px] z-50 ${
                  theme === 'dark' ? 'bg-zinc-900 border border-white/10' : 'bg-white border border-zinc-200'
                }`}>
                  {(Object.keys(languages) as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`w-full px-4 py-2 text-left text-sm ${
                        language === lang
                          ? 'text-green-500 bg-green-500/10'
                          : theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                      }`}
                    >
                      {languages[lang].nativeName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden ${theme === 'dark' ? 'bg-[#09090b] border-t border-white/5' : 'bg-white border-t border-zinc-200'}`}>
          <div className="px-6 py-4 space-y-4">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`block ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
              {t('nav.home')}
            </Link>
            <Link to="/resources" onClick={() => setMobileMenuOpen(false)} className={`block ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
              {t('nav.resources')}
            </Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className={`block ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
              {t('nav.about')}
            </Link>
            <div className={`pt-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-zinc-200'} flex gap-3`}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className={`flex-1 py-2.5 text-center rounded-full ${theme === 'dark' ? 'text-zinc-300 bg-white/5' : 'text-zinc-700 bg-zinc-100'}`}>
                {t('nav.signIn')}
              </Link>
              <Link to="/chat" onClick={() => setMobileMenuOpen(false)} className="flex-1 py-2.5 text-center text-white bg-green-600 rounded-full">
                {t('nav.startChat')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
