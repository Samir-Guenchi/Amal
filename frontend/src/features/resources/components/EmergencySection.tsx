import { useState } from 'react';
import { Phone, AlertTriangle } from 'lucide-react';
import type { EmergencyContact, LocalizedText } from '../types';

interface EmergencySectionProps {
  contacts: EmergencyContact[];
  language: 'en' | 'ar' | 'fr' | 'dz';
  theme: 'light' | 'dark';
  isRTL: boolean;
}

const texts: Record<string, LocalizedText> = {
  intro: {
    en: "If you're struggling right now, these people are ready to listen. One call can change everything.",
    ar: "إذا كنت تعاني الآن، هؤلاء الأشخاص مستعدون للاستماع. مكالمة واحدة يمكن أن تغير كل شيء.",
    fr: "Si vous traversez un moment difficile, ces personnes sont prêtes à écouter. Un appel peut tout changer.",
    dz: "إذا راك تعاني دروك، هاد الناس مستعدين يسمعوك. عيطة وحدة تقدر تبدل كلش.",
  },
  available: {
    en: 'Available 24/7 · Free · Confidential',
    ar: 'متاح 24/7 · مجاني · سري',
    fr: 'Disponible 24/7 · Gratuit · Confidentiel',
    dz: 'متوفر 24/7 · مجاني · سري',
  },
  realHumans: {
    en: 'Real humans ready to listen, right now',
    ar: 'أشخاص حقيقيون مستعدون للاستماع، الآن',
    fr: 'De vraies personnes prêtes à écouter, maintenant',
    dz: 'ناس حقيقيين مستعدين يسمعوك، دروك',
  },
  warning: {
    en: 'If you or someone is in immediate physical danger, call emergency services.',
    ar: 'إذا كنت أنت أو شخص ما في خطر جسدي فوري، اتصل بخدمات الطوارئ.',
    fr: "Si vous ou quelqu'un êtes en danger physique immédiat, appelez les urgences.",
    dz: 'إذا راك نت ولا واحد في خطر جسدي فوري، عيط للطوارئ.',
  },
};

export function EmergencySection({ contacts, language, theme, isRTL }: EmergencySectionProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const primaryContacts = contacts.filter((c) => c.primary);
  const secondaryContacts = contacts.filter((c) => !c.primary);

  return (
    <div className="space-y-5">
      {/* Intro */}
      <div className={`mb-8 ${isRTL ? 'text-right' : ''}`}>
        <p className={`text-lg leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
          {texts.intro[language]}
        </p>
      </div>

      {/* Primary Contact - 3033 */}
      {primaryContacts.map((contact, i) => (
        <a
          key={i}
          href={`tel:${contact.number}`}
          className={`block p-6 md:p-8 transition-all hover:scale-[1.02] relative overflow-hidden group ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30'
              : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-sm'
          }`}
          style={{ borderRadius: '2rem 1rem 2rem 1rem' }}
        >
          {/* Pulse animation */}
          <div className="absolute top-4 right-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>

          <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                {texts.available[language]}
              </p>
              <h3 className={`font-bold text-xl mb-1 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                {contact.name[language]}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {texts.realHumans[language]}
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-green-500' : 'bg-green-600'
                } group-hover:scale-110 transition-transform shadow-lg`}
              >
                <Phone className="w-7 h-7 text-white" />
              </div>
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                {contact.number}
              </span>
            </div>
          </div>
        </a>
      ))}

      {/* Warning Banner */}
      <div
        className={`p-4 flex items-start gap-3 ${
          theme === 'dark' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50/80 border border-amber-200/60'
        }`}
        style={{ borderRadius: '1rem' }}
      >
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className={`text-sm ${theme === 'dark' ? 'text-amber-200' : 'text-amber-800'}`}>{texts.warning[language]}</p>
      </div>

      {/* Secondary Contacts */}
      <div className="grid md:grid-cols-2 gap-4">
        {secondaryContacts.map((contact, i) => (
          <a
            key={i}
            href={`tel:${contact.number}`}
            onMouseEnter={() => setHoveredCard(i)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`block p-5 transition-all ${
              theme === 'dark'
                ? 'bg-white/5 border border-white/10 hover:border-white/20'
                : 'bg-white border border-zinc-200/60 hover:border-zinc-300 shadow-sm hover:shadow'
            }`}
            style={{ borderRadius: '1.25rem 0.5rem 1.25rem 0.5rem' }}
          >
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                  {contact.name[language]}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {contact.description[language]}
                </p>
              </div>
              <div
                className={`flex items-center gap-2 transition-transform ${hoveredCard === i ? 'scale-110' : ''} ${
                  theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                }`}
              >
                <Phone className="w-5 h-5" />
                <span className="text-xl font-bold">{contact.number}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
