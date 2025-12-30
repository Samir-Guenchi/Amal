import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import { useT } from '../../../store/languageStore';

export function ForgotPasswordPage() {
  const { theme } = useThemeStore();
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  const t = useT();
  
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await forgotPassword(email);
    if (result.success) {
      setSent(true);
      setMessage(result.message || '');
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
          
          {sent ? (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                {t('auth.checkEmail')}
              </h1>
              <p className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>
                {t('auth.resetSent')}
              </p>
            </>
          ) : (
            <>
              <h1 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                {t('auth.resetPassword')}
              </h1>
              <p className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>
                {t('auth.resetDesc')}
              </p>
            </>
          )}
        </div>

        {/* Form Card - organic shape */}
        <div className={`p-8 rounded-[1.5rem_1rem_1.5rem_1rem] ${
          theme === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm'
        }`}>
          {sent ? (
            <div className="text-center">
              <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {email}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-green-500 hover:text-green-400 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('auth.backToLogin')}
              </Link>
            </div>
          ) : (
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
                    {t('auth.sending')}
                  </>
                ) : (
                  <>
                    {t('auth.sendReset')}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <Link
                to="/login"
                className={`flex items-center justify-center gap-2 text-sm ${
                  theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                {t('auth.backToLogin')}
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
