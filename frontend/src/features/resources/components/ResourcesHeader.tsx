import { Sparkles, HeartHandshake } from 'lucide-react';
import type { LocalizedText } from '../types';

interface ResourcesHeaderProps {
  language: 'en' | 'ar' | 'fr' | 'dz';
  theme: 'light' | 'dark';
  isRTL: boolean;
}

const texts: Record<string, LocalizedText> = {
  badge: {
    en: 'You took the first step',
    ar: 'لقد اتخذت الخطوة الأولى',
    fr: 'Vous avez fait le premier pas',
    dz: 'درت الخطوة الأولى',
  },
  title: {
    en: 'Resources to help you heal',
    ar: 'موارد لمساعدتك على الشفاء',
    fr: 'Ressources pour vous aider à guérir',
    dz: 'موارد باش تساعدك تبرا',
  },
  description: {
    en: 'Looking for help takes courage. Here you will find people and places ready to support you—no judgment, just care.',
    ar: 'البحث عن المساعدة يتطلب شجاعة. هنا ستجد أشخاصاً وأماكن مستعدة لدعمك—بدون أحكام، فقط رعاية.',
    fr: "Chercher de l'aide demande du courage. Ici vous trouverez des personnes et des lieux prêts à vous soutenir—sans jugement, juste de l'attention.",
    dz: 'البحث على المساعدة يحتاج شجاعة. هنا تلقى ناس وأماكن مستعدين يدعموك—بلا حكم، غير رعاية.',
  },
};

export function ResourcesHeader({ language, theme, isRTL }: ResourcesHeaderProps) {
  return (
    <section className="pt-24 pb-16 px-4 relative overflow-hidden">
      {/* Decorative Element */}
      <div className={`absolute top-20 ${isRTL ? 'left-10' : 'right-10'} opacity-5`}>
        <HeartHandshake className="w-64 h-64" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Badge */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-10 h-10 flex items-center justify-center ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}
            style={{ borderRadius: '0.75rem 0.25rem 0.75rem 0.25rem' }}
          >
            <Sparkles className="w-5 h-5 text-green-500" />
          </div>
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
            {texts.badge[language]}
          </span>
        </div>

        {/* Title */}
        <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
          {texts.title[language]}
        </h1>

        {/* Description */}
        <p className={`text-lg max-w-2xl ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
          {texts.description[language]}
        </p>
      </div>
    </section>
  );
}
