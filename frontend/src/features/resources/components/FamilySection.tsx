import { useState } from 'react';
import { Heart, ChevronDown } from 'lucide-react';
import type { FAQ, LocalizedText } from '../types';

interface FamilySectionProps {
  faqs: FAQ[];
  language: 'en' | 'ar' | 'fr' | 'dz';
  theme: 'light' | 'dark';
  isRTL: boolean;
}

const texts: Record<string, LocalizedText> = {
  title: {
    en: 'This is hard. We see you.',
    ar: 'هذا صعب. نحن نراك.',
    fr: "C'est difficile. Nous vous voyons.",
    dz: 'هذا صعيب. حنا نشوفوك.',
  },
  intro: {
    en: 'Watching someone you love struggle with addiction is painful. Your feelings are valid. Your wellbeing matters too.',
    ar: 'مشاهدة شخص تحبه يعاني من الإدمان مؤلم. مشاعرك صحيحة. صحتك مهمة أيضاً.',
    fr: "Regarder quelqu'un que vous aimez lutter contre l'addiction est douloureux. Vos sentiments sont valides.",
    dz: 'تشوف واحد تحبو يعاني من الإدمان مؤلم. مشاعرك صحيحة. صحتك مهمة هي زادة.',
  },
  commonQuestions: {
    en: 'Common questions',
    ar: 'أسئلة شائعة',
    fr: 'Questions fréquentes',
    dz: 'أسئلة شائعة',
  },
  selfCare: {
    en: "You can't pour from an empty cup. Take care of yourself too.",
    ar: 'لا يمكنك أن تعطي من كوب فارغ. اعتنِ بنفسك أيضاً.',
    fr: "On ne peut pas verser d'une tasse vide. Prenez soin de vous aussi.",
    dz: 'ما تقدرش تعطي من كاس فارغ. اعتني بروحك هي زادة.',
  },
};

export function FamilySection({ faqs, language, theme, isRTL }: FamilySectionProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      {/* Empathetic Intro */}
      <div
        className={`p-6 md:p-8 ${
          theme === 'dark' ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50/50 border border-purple-200'
        }`}
        style={{ borderRadius: '2rem 1rem 2rem 1rem' }}
      >
        <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div
            className={`w-12 h-12 flex items-center justify-center flex-shrink-0 ${
              theme === 'dark' ? 'bg-purple-500/30' : 'bg-purple-100'
            }`}
            style={{ borderRadius: '1rem 0.5rem 1rem 0.5rem' }}
          >
            <Heart className="w-6 h-6 text-purple-500" />
          </div>
          <div className={isRTL ? 'text-right' : ''}>
            <h3 className={`font-semibold text-lg mb-2 ${theme === 'dark' ? 'text-purple-200' : 'text-purple-900'}`}>
              {texts.title[language]}
            </h3>
            <p className={`${theme === 'dark' ? 'text-purple-300/80' : 'text-purple-800'}`}>{texts.intro[language]}</p>
          </div>
        </div>
      </div>

      {/* FAQ Header */}
      <div className={`mb-4 ${isRTL ? 'text-right' : ''}`}>
        <h3 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
          {texts.commonQuestions[language]}
        </h3>
      </div>

      {/* FAQ Items */}
      {faqs.map((faq, i) => (
        <div
          key={i}
          className={`overflow-hidden transition-all ${
            expandedFaq === i
              ? theme === 'dark'
                ? 'bg-white/[0.07] border border-white/20'
                : 'bg-white border border-zinc-300 shadow-sm'
              : theme === 'dark'
                ? 'bg-white/5 border border-white/10 hover:border-white/20'
                : 'bg-white border border-zinc-200/60 hover:border-zinc-300'
          }`}
          style={{ borderRadius: '1.25rem 0.5rem 1.25rem 0.5rem' }}
        >
          <button
            onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
            className={`w-full p-5 flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
          >
            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
              {faq.question[language]}
            </span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                expandedFaq === i
                  ? theme === 'dark'
                    ? 'bg-green-500/20 rotate-180'
                    : 'bg-green-100 rotate-180'
                  : theme === 'dark'
                    ? 'bg-white/10'
                    : 'bg-zinc-100'
              }`}
            >
              <ChevronDown
                className={`w-4 h-4 ${expandedFaq === i ? 'text-green-500' : theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}
              />
            </div>
          </button>
          <div className={`grid transition-all duration-300 ${expandedFaq === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <div className={`px-5 pb-5 ${isRTL ? 'text-right' : ''}`}>
                <p className={`leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {faq.answer[language]}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Self-care Reminder */}
      <div className={`p-5 text-center ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-zinc-50'}`} style={{ borderRadius: '1rem' }}>
        <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>{texts.selfCare[language]}</p>
      </div>
    </div>
  );
}
