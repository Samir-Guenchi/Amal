import { Brain } from 'lucide-react';
import type { EducationTopic, LocalizedText } from '../types';

interface EducationSectionProps {
  topics: EducationTopic[];
  language: 'en' | 'ar' | 'fr' | 'dz';
  theme: 'light' | 'dark';
  isRTL: boolean;
}

const texts: Record<string, LocalizedText> = {
  intro: {
    en: "Understanding what's happening in your brain is powerful. Knowledge turns fear into action.",
    ar: 'فهم ما يحدث في دماغك قوي. المعرفة تحول الخوف إلى عمل.',
    fr: 'Comprendre ce qui se passe dans votre cerveau est puissant. La connaissance transforme la peur en action.',
    dz: 'فهم واش يصرا في مخك قوي. المعرفة تحول الخوف لعمل.',
  },
  brainHeal: {
    en: 'Your brain can heal. Science proves it.',
    ar: 'دماغك يمكن أن يشفى. العلم يثبت ذلك.',
    fr: 'Votre cerveau peut guérir. La science le prouve.',
    dz: 'مخك يقدر يبرا. العلم يثبت هذا.',
  },
};

const colorSchemes = [
  { bg: 'bg-green-500/20', bgLight: 'bg-green-50 border border-green-200', icon: 'text-green-500' },
  { bg: 'bg-blue-500/20', bgLight: 'bg-blue-50 border border-blue-200', icon: 'text-blue-500' },
  { bg: 'bg-purple-500/20', bgLight: 'bg-purple-50 border border-purple-200', icon: 'text-purple-500' },
];

export function EducationSection({ topics, language, theme, isRTL }: EducationSectionProps) {
  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className={`mb-8 ${isRTL ? 'text-right' : ''}`}>
        <p className={`text-lg leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
          {texts.intro[language]}
        </p>
      </div>

      {/* Topics */}
      {topics.map((topic, i) => {
        const Icon = topic.icon;
        const color = colorSchemes[i % colorSchemes.length];

        return (
          <div
            key={i}
            className={`p-6 md:p-8 transition-all hover:scale-[1.01] ${
              theme === 'dark'
                ? 'bg-white/5 border border-white/10 hover:border-white/20'
                : 'bg-white border border-zinc-200/60 hover:border-zinc-300 shadow-sm hover:shadow'
            }`}
            style={{ borderRadius: '2rem 1rem 2rem 1rem' }}
          >
            <div className={`flex items-start gap-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div
                className={`w-14 h-14 flex items-center justify-center flex-shrink-0 ${
                  theme === 'dark' ? color.bg : color.bgLight
                }`}
                style={{ borderRadius: '1rem 0.5rem 1rem 0.5rem' }}
              >
                <Icon className={`w-7 h-7 ${color.icon}`} />
              </div>
              <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                <h3 className={`font-semibold text-xl mb-3 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                  {topic.title[language]}
                </h3>
                <p className={`leading-relaxed text-base ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {topic.description[language]}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Key Insight */}
      <div
        className={`p-6 text-center ${
          theme === 'dark' ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'
        }`}
        style={{ borderRadius: '1.5rem' }}
      >
        <Brain className={`w-8 h-8 mx-auto mb-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
        <p className={`font-medium ${theme === 'dark' ? 'text-green-300' : 'text-green-800'}`}>
          {texts.brainHeal[language]}
        </p>
      </div>
    </div>
  );
}
