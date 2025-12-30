import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import { useT } from '../../../store/languageStore';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuthStore();
  const { theme } = useThemeStore();
  const t = useT();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const passwordRequirements = [
    { met: password.length >= 8, text: t('auth.chars8') },
    { met: /[A-Z]/.test(password), text: t('auth.uppercase') },
    { met: /[0-9]/.test(password), text: t('auth.oneNumber') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;
    if (!agreed) return;
    
    await signup(email, password, name);
    if (useAuthStore.getState().isAuthenticated) {
      navigate('/chat');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-6 py-20 ${
      theme === 'dark' ? 'bg-[#09090b]' : 'bg-zinc-50'
    }`}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-8">
            {/* Logo */}
            <svg viewBox="0 0 36 36" fill="none" className="w-10 h-10">
              <path 
                d="M18 2C18 2 32 8 32 20C32 28 26 34 18 34C10 34 4 28 4 20C4 8 18 2 18 2Z"
                className={theme === 'dark' ? 'fill-green-500' : 'fill-green-600'}
              />
              <path d="M18 8L12 24H15L18 16L21 24H24L18 8Z" fill={theme === 'dark' ? '#09090b' : 'white'} />
              <circle cx="18" cy="28" r="2" fill={theme === 'dark' ? '#09090b' : 'white'} />
            </svg>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>amal</span>
              <span className={`text-[10px] font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>dz</span>
            </div>
          </Link>
          <h1 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
            {t('auth.createAccount')}
          </h1>
          <p className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>
            {t('auth.startJourney')}
          </p>
        </div>

        {/* Form Card - organic shape */}
        <div className={`p-8 rounded-[1rem_2rem_1rem_2rem] ${
          theme === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-[0.5rem_1rem_0.5rem_1rem]">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
                <button type="button" onClick={clearError} className="ml-auto text-red-400">
                  &times;
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {t('auth.fullName')}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth.fullName')}
                  className={`w-full pl-12 pr-4 py-3 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] border transition-colors ${
                    theme === 'dark' 
                      ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-green-500' 
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-green-500'
                  } outline-none`}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={`w-full pl-12 pr-4 py-3 rounded-[0.5rem_1.5rem_0.5rem_1.5rem] border transition-colors ${
                    theme === 'dark' 
                      ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-green-500' 
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-green-500'
                  } outline-none`}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3 rounded-[1rem_0.75rem_1rem_0.75rem] border transition-colors ${
                    theme === 'dark' 
                      ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-green-500' 
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-green-500'
                  } outline-none`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                    theme === 'dark' ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password requirements */}
              <div className="space-y-1 pt-2">
                {passwordRequirements.map((req) => (
                  <div key={req.text} className="flex items-center gap-2 text-xs">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      req.met ? 'bg-green-500/20' : theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'
                    }`}>
                      <Check className={`w-3 h-3 ${req.met ? 'text-green-500' : 'text-zinc-500'}`} />
                    </div>
                    <span className={req.met ? (theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700') : 'text-zinc-500'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-4 py-3 rounded-[0.75rem_1rem_0.75rem_1rem] border transition-colors ${
                    theme === 'dark' 
                      ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-green-500' 
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-green-500'
                  } outline-none`}
                  required
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400">{t('auth.passwordsNoMatch')}</p>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className={`mt-1 w-4 h-4 rounded border ${
                  theme === 'dark' ? 'border-zinc-600 bg-zinc-800' : 'border-zinc-300 bg-white'
                } text-green-500 focus:ring-green-500`}
              />
              <span className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {t('auth.agreeTerms')}{' '}
                <Link to="/terms" className="text-green-500 hover:text-green-400">{t('auth.terms')}</Link>
                {' '}&{' '}
                <Link to="/privacy" className="text-green-500 hover:text-green-400">{t('auth.privacy')}</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading || !agreed || password !== confirmPassword}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('auth.creatingAccount')}
                </>
              ) : (
                <>
                  {t('auth.createAccount')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sign in link */}
        <p className={`text-center mt-8 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="text-green-500 hover:text-green-400 font-medium">
            {t('auth.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
