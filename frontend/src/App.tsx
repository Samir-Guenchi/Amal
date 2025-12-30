import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/navigation/Navbar';
import { HomePage } from './features/home/pages/HomePage';
import { ChatPage } from './features/chat/pages/ChatPage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SignupPage } from './features/auth/pages/SignupPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';
import { AboutPage } from './features/about/pages/AboutPage';
import { ResourcesPage } from './features/resources/pages/ResourcesPage';
import { useThemeStore } from './store/themeStore';
import { useLanguageStore, languages } from './store/languageStore';

function AppContent() {
  const { theme } = useThemeStore();
  const language = useLanguageStore((state) => state.language);
  const location = useLocation();
  
  // Pages that have their own header/navigation
  const hideNavbar = ['/chat', '/login', '/signup', '/forgot-password'].includes(location.pathname);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = languages[language].dir;
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#09090b] text-white' : 'bg-white text-zinc-900'
      }`}
    >
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
