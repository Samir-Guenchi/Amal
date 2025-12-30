import { MapPin, Stethoscope } from 'lucide-react';
import type { TreatmentCenter, LocalizedText } from '../types';

interface CentersSectionProps {
  centers: TreatmentCenter[];
  language: 'en' | 'ar' | 'fr' | 'dz';
  theme: 'light' | 'dark';
  isRTL: boolean;
}

const texts: Record<string, LocalizedText> = {
  intro: {
    en: 'These centers have helped thousands of people in Algeria. Professional care, real recovery.',
    ar: 'هذه المراكز ساعدت آلاف الأشخاص في الجزائر. رعاية مهنية، تعافٍ حقيقي.',
    fr: 'Ces centres ont aidé des milliers de personnes en Algérie. Soins professionnels, vrai rétablissement.',
    dz: 'هاد المراكز ساعدت آلاف الناس في الجزائر. رعاية مهنية، تعافي حقيقي.',
  },
  contact: {
    en: 'Contact them directly for availability and admission information.',
    ar: 'اتصل بهم مباشرة للتوفر ومعلومات القبول.',
    fr: "Contactez-les directement pour la disponibilité et l'admission.",
    dz: 'عيطلهم مباشرة للتوفر ومعلومات القبول.',
  },
  strength: {
    en: 'Asking for help is a sign of strength, not weakness.',
    ar: 'طلب المساعدة علامة قوة، ليس ضعف.',
    fr: "Demander de l'aide est un signe de force, pas de faiblesse.",
    dz: 'طلب المساعدة علامة قوة، ماشي ضعف.',
  },
};

export function CentersSection({ centers, language, theme, isRTL }: CentersSectionProps) {
  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className={`mb-8 ${isRTL ? 'text-right' : ''}`}>
        <p className={`text-lg leading-relaxed mb-4 ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
          {texts.intro[language]}
        </p>
        <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>{texts.contact[language]}</p>
      </div>

      {/* Centers List */}
      {centers.map((center, i) => (
        <div
          key={i}
          className={`p-6 transition-all hover:scale-[1.01] ${
            theme === 'dark'
              ? 'bg-white/5 border border-white/10 hover:border-white/20'
              : 'bg-white border border-zinc-200/60 hover:border-zinc-300 shadow-sm hover:shadow'
          }`}
          style={{ borderRadius: '1.5rem 0.75rem 1.5rem 0.75rem' }}
        >
          <div className={`flex items-start gap-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-14 h-14 flex items-center justify-center flex-shrink-0 ${
                theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50 border border-blue-200'
              }`}
              style={{ borderRadius: '1rem 0.5rem 1rem 0.5rem' }}
            >
              <Stethoscope className="w-6 h-6 text-blue-500" />
            </div>
            <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
              <h3 className={`font-semibold text-lg mb-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                {center.name[language]}
              </h3>
              <div
                className={`inline-block px-3 py-1 text-xs font-medium mb-3 ${
                  theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                }`}
                style={{ borderRadius: '0.5rem' }}
              >
                {center.type[language]}
              </div>
              <div className={`flex items-center gap-1.5 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                <MapPin className="w-4 h-4" />
                {center.location[language]}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Encouragement */}
      <div className={`p-5 text-center ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-zinc-50'}`} style={{ borderRadius: '1rem' }}>
        <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>{texts.strength[language]}</p>
      </div>
    </div>
  );
}
