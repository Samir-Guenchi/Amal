import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import { useT } from '../../../store/languageStore';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { theme } = useThemeStore();
  const t = useT();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
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
            {t('auth.welcomeBack')}
          </h1>
          <p className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>
            {t('auth.signInContinue')}
          </p>
        </div>

        {/* Form Card - organic shape */}
        <div className={`p-8 rounded-[2rem_1rem_2rem_1rem] ${
          theme === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-[1rem_0.5rem_1rem_0.5rem]">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
                <button type="button" onClick={clearError} className="ml-auto text-red-400 hover:text-red-300">
                  &times;
                </button>
              </div>
            )}

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
                  className={`w-full pl-12 pr-4 py-3 rounded-[1rem_0.5rem_1rem_0.5rem] border transition-colors ${
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
                  className={`w-full pl-12 pr-12 py-3 rounded-[0.5rem_1rem_0.5rem_1rem] border transition-colors ${
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
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className={`w-4 h-4 rounded border ${
                    theme === 'dark' ? 'border-zinc-600 bg-zinc-800' : 'border-zinc-300 bg-white'
                  } text-green-500 focus:ring-green-500`} 
                />
                <span className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {t('auth.rememberMe')}
                </span>
              </label>
              <Link to="/forgot-password" className="text-sm text-green-500 hover:text-green-400">
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('auth.signingIn')}
                </>
              ) : (
                <>
                  {t('auth.signIn')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'}`} />
            </div>
            <div className="relative flex justify-center">
              <span className={`px-4 text-sm ${
                theme === 'dark' ? 'bg-zinc-900 text-zinc-500' : 'bg-white text-zinc-500'
              }`}>
                {t('auth.orContinue')}
              </span>
            </div>
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-4">
            <button className={`flex items-center justify-center gap-2 px-4 py-3 rounded-[0.75rem_1.25rem_0.75rem_1.25rem] border transition-colors ${
              theme === 'dark' 
                ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' 
                : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className={`flex items-center justify-center gap-2 px-4 py-3 rounded-[1.25rem_0.75rem_1.25rem_0.75rem] border transition-colors ${
              theme === 'dark' 
                ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' 
                : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              GitHub
            </button>
          </div>
        </div>

        {/* Sign up link */}
        <p className={`text-center mt-8 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
          {t('auth.noAccount')}{' '}
          <Link to="/signup" className="text-green-500 hover:text-green-400 font-medium">
            {t('auth.signUp')}
          </Link>
        </p>
      </div>
    </div>
  );
}
