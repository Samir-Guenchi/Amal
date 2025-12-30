import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Shield,
  Brain,
  Phone,
  ArrowRight,
  Leaf,
  MessageCircle,
  Quote,
  Sparkles,
  Clock,
  MapPin,
} from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';
import { useLanguageStore } from '../../../store/languageStore';

export function AboutPage() {
  const { theme } = useThemeStore();
  const language = useLanguageStore((state) => state.language);
  const isRTL = language === 'ar' || language === 'dz';
  const [activeStory, setActiveStory] = useState(0);

  // Rotate through stories
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStory((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stories = [
    {
      quote: {
        en: '"I was afraid to talk to anyone. Amal listened without judging me."',
        ar: '"كنت خائفاً من التحدث لأي شخص. أمل استمع لي بدون أن يحكم علي."',
        fr: '"J\'avais peur de parler à qui que ce soit. Amal m\'a écouté sans me juger."',
        dz: '"كنت خايف نهدر مع أي واحد. أمل سمعني بلا ما يحكم عليا."',
      },
      age: '24',
      location: { en: 'Algiers', ar: 'الجزائر', fr: 'Alger', dz: 'الجزائر' },
    },
    {
      quote: {
        en: '"Understanding what was happening in my brain helped me fight back."',
        ar: '"فهم ما كان يحدث في دماغي ساعدني على المقاومة."',
        fr: '"Comprendre ce qui se passait dans mon cerveau m\'a aidé à me battre."',
        dz: '"فهمت واش كان يصرا في مخي وهذا ساعدني نقاوم."',
      },
      age: '31',
      location: { en: 'Oran', ar: 'وهران', fr: 'Oran', dz: 'وهران' },
    },
    {
      quote: {
        en: '"At 3am when I couldn\'t sleep, Amal was there. That meant everything."',
        ar: '"في الثالثة صباحاً عندما لم أستطع النوم، كان أمل هناك. هذا يعني كل شيء."',
        fr: '"À 3h du matin quand je ne pouvais pas dormir, Amal était là. Ça signifiait tout."',
        dz: '"في 3 تاع الصباح كي ما قدرتش نرقد، أمل كان هنا. هذا يعني كلش."',
      },
      age: '28',
      location: { en: 'Constantine', ar: 'قسنطينة', fr: 'Constantine', dz: 'قسنطينة' },
    },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#09090b]' : 'bg-[#fafafa]'}`}>
      {/* Opening - Personal, not corporate */}
      <section className="relative pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Hand-drawn style underline effect */}
          <div className="mb-12">
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
              {{
                en: 'Why we built this',
                ar: 'لماذا بنينا هذا',
                fr: 'Pourquoi nous avons créé ceci',
                dz: 'علاش بنينا هذا',
              }[language]}
            </p>
            <h1 className={`text-3xl md:text-4xl font-bold leading-tight ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
              {{
                en: (
                  <>
                    Because someone we loved<br />
                    <span className="relative inline-block">
                      needed help
                      <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                        <path d="M2 6C50 2 150 2 198 6" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </span>
                    {' '}at 3am.
                  </>
                ),
                ar: (
                  <>
                    لأن شخصاً نحبه<br />
                    <span className="relative inline-block">
                      احتاج المساعدة
                      <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                        <path d="M2 6C50 2 150 2 198 6" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </span>
                    {' '}في الثالثة صباحاً.
                  </>
                ),
                fr: (
                  <>
                    Parce que quelqu'un qu'on aimait<br />
                    <span className="relative inline-block">
                      avait besoin d'aide
                      <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                        <path d="M2 6C50 2 150 2 198 6" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </span>
                    {' '}à 3h du matin.
                  </>
                ),
                dz: (
                  <>
                    لأن واحد نحبوه<br />
                    <span className="relative inline-block">
                      احتاج المساعدة
                      <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                        <path d="M2 6C50 2 150 2 198 6" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </span>
                    {' '}في 3 تاع الصباح.
                  </>
                ),
              }[language]}
            </h1>
          </div>

          <div className={`text-lg leading-relaxed space-y-6 ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-800'}`}>
            <p>
              {{
                en: "There was no one to call. No clinic open. No friend awake. Just silence and fear. That night changed everything for us.",
                ar: "لم يكن هناك أحد للاتصال به. لا عيادة مفتوحة. لا صديق مستيقظ. فقط الصمت والخوف. تلك الليلة غيرت كل شيء بالنسبة لنا.",
                fr: "Il n'y avait personne à appeler. Aucune clinique ouverte. Aucun ami éveillé. Juste le silence et la peur. Cette nuit a tout changé pour nous.",
                dz: "ما كانش حتى واحد نعيطوله. حتى عيادة مفتوحة. حتى صاحب فايق. غير السكوت والخوف. هديك الليلة بدلت كلش.",
              }[language]}
            </p>
            <p>
              {{
                en: "Amal exists because we believe no one in Algeria should face addiction alone. Not at 3am. Not ever.",
                ar: "أمل موجود لأننا نؤمن بأنه لا ينبغي لأحد في الجزائر أن يواجه الإدمان وحده. ليس في الثالثة صباحاً. ولا في أي وقت.",
                fr: "Amal existe parce que nous croyons que personne en Algérie ne devrait affronter l'addiction seul. Pas à 3h du matin. Jamais.",
                dz: "أمل موجود لأننا نآمنو بلي ما يلزمش حتى واحد في الجزائر يواجه الإدمان وحدو. لا في 3 تاع الصباح. لا أبداً.",
              }[language]}
            </p>
          </div>
        </div>
      </section>

      {/* The Name - Meaningful */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div
            className={`relative p-8 md:p-12 ${
              theme === 'dark' ? 'bg-white/[0.02]' : 'bg-white border border-zinc-200/60 shadow-sm'
            }`}
            style={{ borderRadius: '3rem 1rem 3rem 1rem' }}
          >
            {/* Decorative quote mark */}
            <div className="absolute top-4 left-4 opacity-10">
              <Quote className="w-16 h-16 text-green-500" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center" style={{ borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }}>
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                    أمل
                  </h2>
                  <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-700'}`}>
                    /ˈamal/
                  </p>
                </div>
              </div>
              
              <p className={`text-xl mb-4 ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}`}>
                {{
                  en: '"Hope" in Arabic.',
                  ar: '"الأمل" بالعربية.',
                  fr: '"Espoir" en arabe.',
                  dz: '"الأمل" بالعربية.',
                }[language]}
              </p>
              
              <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-700'}`}>
                {{
                  en: "We chose this name because recovery starts with hope. Even when everything feels impossible, hope is the first step back to life.",
                  ar: "اخترنا هذا الاسم لأن التعافي يبدأ بالأمل. حتى عندما يبدو كل شيء مستحيلاً، الأمل هو الخطوة الأولى للعودة إلى الحياة.",
                  fr: "Nous avons choisi ce nom parce que le rétablissement commence par l'espoir. Même quand tout semble impossible, l'espoir est le premier pas vers la vie.",
                  dz: "اخترنا هذا الاسم لأن التعافي يبدا بالأمل. حتى كي يبان كلش مستحيل، الأمل هو الخطوة الأولى للرجوع للحياة.",
                }[language]}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Stories - Rotating testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className={`text-sm mb-8 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
            {{
              en: 'Real words from real people',
              ar: 'كلمات حقيقية من أشخاص حقيقيين',
              fr: 'De vraies paroles de vraies personnes',
              dz: 'كلام حقيقي من ناس حقيقيين',
            }[language]}
          </p>
          
          <div className="relative min-h-[200px]">
            {stories.map((story, i) => (
              <div
                key={i}
                className={`transition-all duration-700 ${
                  activeStory === i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none'
                }`}
              >
                <blockquote className={`text-2xl md:text-3xl font-medium leading-relaxed mb-6 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                  {story.quote[language]}
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-white/10' : 'bg-zinc-100 border border-zinc-200'}`}>
                    <Heart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}`}>
                      {{
                        en: `Anonymous, ${story.age}`,
                        ar: `مجهول، ${story.age}`,
                        fr: `Anonyme, ${story.age}`,
                        dz: `مجهول، ${story.age}`,
                      }[language]}
                    </p>
                    <p className={`text-sm flex items-center gap-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-600'}`}>
                      <MapPin className="w-3 h-3" />
                      {story.location[language]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Story indicators */}
          <div className="flex gap-2 mt-8">
            {stories.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveStory(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeStory === i
                    ? 'w-8 bg-green-500'
                    : `w-4 ${theme === 'dark' ? 'bg-white/20' : 'bg-zinc-300 hover:bg-zinc-400'}`
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different - Not a list, a conversation */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className={`text-2xl font-bold mb-12 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
            {{
              en: "We're not a hospital. We're not a hotline.",
              ar: "نحن لسنا مستشفى. ولسنا خط ساخن.",
              fr: "Nous ne sommes pas un hôpital. Ni une hotline.",
              dz: "ماناش سبيطار. ماناش خط ساخن.",
            }[language]}
          </h2>
          
          <div className="space-y-8">
            {/* Conversation-style blocks */}
            <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div
                className={`flex-1 p-5 ${theme === 'dark' ? 'bg-white/5' : 'bg-white border border-zinc-200 shadow-sm'}`}
                style={{ borderRadius: '0.5rem 1.5rem 1.5rem 1.5rem' }}
              >
                <p className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                  {{
                    en: "We're a friend who happens to know a lot about addiction science.",
                    ar: "نحن صديق يعرف الكثير عن علم الإدمان.",
                    fr: "Nous sommes un ami qui connaît beaucoup sur la science de l'addiction.",
                    dz: "حنا صاحب يعرف بزاف على علم الإدمان.",
                  }[language]}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-700'}`}>
                  {{
                    en: "We explain what's happening in your brain. Why cravings hit. Why recovery is possible. Knowledge is power.",
                    ar: "نشرح ما يحدث في دماغك. لماذا تأتي الرغبات. لماذا التعافي ممكن. المعرفة قوة.",
                    fr: "Nous expliquons ce qui se passe dans votre cerveau. Pourquoi les envies frappent. Pourquoi le rétablissement est possible.",
                    dz: "نشرحولك واش يصرا في مخك. علاش تجيك الرغبات. علاش التعافي ممكن. المعرفة قوة.",
                  }[language]}
                </p>
              </div>
            </div>

            <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div
                className={`flex-1 p-5 ${theme === 'dark' ? 'bg-white/5' : 'bg-white border border-zinc-200 shadow-sm'}`}
                style={{ borderRadius: '0.5rem 1.5rem 1.5rem 1.5rem' }}
              >
                <p className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                  {{
                    en: "We're here at 3am. And 3pm. And every moment in between.",
                    ar: "نحن هنا في الثالثة صباحاً. والثالثة مساءً. وكل لحظة بينهما.",
                    fr: "Nous sommes là à 3h du matin. Et à 15h. Et chaque moment entre les deux.",
                    dz: "حنا هنا في 3 تاع الصباح. و3 تاع العشية. وكل لحظة بيناتهم.",
                  }[language]}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-700'}`}>
                  {{
                    en: "Cravings don't follow schedules. Neither do we. Whenever you need to talk, we're here.",
                    ar: "الرغبات لا تتبع جداول. ونحن كذلك. متى احتجت للتحدث، نحن هنا.",
                    fr: "Les envies ne suivent pas d'horaires. Nous non plus. Quand vous avez besoin de parler, nous sommes là.",
                    dz: "الرغبات ما تتبعش الوقت. وحنا كيفكيف. وقتما تحتاج تهدر، حنا هنا.",
                  }[language]}
                </p>
              </div>
            </div>

            <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-50 border border-purple-200'}`}>
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div
                className={`flex-1 p-5 ${theme === 'dark' ? 'bg-white/5' : 'bg-white border border-zinc-200 shadow-sm'}`}
                style={{ borderRadius: '0.5rem 1.5rem 1.5rem 1.5rem' }}
              >
                <p className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                  {{
                    en: "We don't know your name. We don't want to.",
                    ar: "لا نعرف اسمك. ولا نريد ذلك.",
                    fr: "Nous ne connaissons pas votre nom. Nous ne voulons pas le connaître.",
                    dz: "ما نعرفوش اسمك. وما نحبوش نعرفوه.",
                  }[language]}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-700'}`}>
                  {{
                    en: "Complete anonymity. No accounts. No data stored. Your journey is yours alone.",
                    ar: "سرية تامة. لا حسابات. لا بيانات محفوظة. رحلتك لك وحدك.",
                    fr: "Anonymat complet. Pas de comptes. Pas de données stockées. Votre parcours vous appartient.",
                    dz: "سرية كاملة. بلا حسابات. بلا بيانات محفوظة. الرحلة تاعك ليك وحدك.",
                  }[language]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Science - Simple, not intimidating */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Brain className="w-6 h-6 text-green-500" />
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
              {{
                en: 'The science is clear',
                ar: 'العلم واضح',
                fr: 'La science est claire',
                dz: 'العلم واضح',
              }[language]}
            </h2>
          </div>
          
          <div className={`text-lg leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-800'}`}>
            <p className="mb-6">
              {{
                en: "Your brain can heal. Dopamine receptors recover. Neural pathways rebuild. This isn't wishful thinking—it's neuroscience.",
                ar: "دماغك يمكن أن يشفى. مستقبلات الدوبامين تتعافى. المسارات العصبية تُعاد بناؤها. هذا ليس تفكيراً بالتمني—إنه علم الأعصاب.",
                fr: "Votre cerveau peut guérir. Les récepteurs de dopamine récupèrent. Les voies neuronales se reconstruisent. Ce n'est pas de l'espoir—c'est de la neuroscience.",
                dz: "مخك يقدر يبرا. مستقبلات الدوبامين تتعافى. المسارات العصبية تتبنى من جديد. هذا ماشي تمني—هذا علم الأعصاب.",
              }[language]}
            </p>
            
            {/* Visual timeline - simple */}
            <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-white/5' : 'bg-white border border-zinc-200/60 shadow-sm'}`}>
              <div className="flex items-center justify-between text-center">
                <div className="flex-1">
                  <div className={`text-2xl font-bold text-green-500 mb-1`}>72h</div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-700'}`}>
                    {{
                      en: 'Toxins clear',
                      ar: 'تخرج السموم',
                      fr: 'Toxines éliminées',
                      dz: 'السموم تخرج',
                    }[language]}
                  </p>
                </div>
                <div className={`w-8 h-px ${theme === 'dark' ? 'bg-white/20' : 'bg-zinc-300'}`} />
                <div className="flex-1">
                  <div className={`text-2xl font-bold text-green-500 mb-1`}>21d</div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-700'}`}>
                    {{
                      en: 'New habits form',
                      ar: 'عادات جديدة',
                      fr: 'Nouvelles habitudes',
                      dz: 'عادات جديدة',
                    }[language]}
                  </p>
                </div>
                <div className={`w-8 h-px ${theme === 'dark' ? 'bg-white/20' : 'bg-zinc-300'}`} />
                <div className="flex-1">
                  <div className={`text-2xl font-bold text-green-500 mb-1`}>14m</div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-700'}`}>
                    {{
                      en: 'Brain recovers',
                      ar: 'المخ يتعافى',
                      fr: 'Cerveau récupère',
                      dz: 'المخ يبرا',
                    }[language]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crisis - Always visible, not hidden */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div
            className={`p-8 text-center ${theme === 'dark' ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50/50 border border-red-200/60 shadow-sm'}`}
            style={{ borderRadius: '2rem 1rem 2rem 1rem' }}
          >
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
              {{
                en: "If you're in crisis right now",
                ar: "إذا كنت في أزمة الآن",
                fr: "Si vous êtes en crise maintenant",
                dz: "إذا راك في أزمة دروك",
              }[language]}
            </p>
            <p className={`text-xl font-medium mb-6 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
              {{
                en: "You don't have to face this alone. Real humans are waiting to help.",
                ar: "لا يجب أن تواجه هذا وحدك. أشخاص حقيقيون ينتظرون لمساعدتك.",
                fr: "Vous n'avez pas à affronter cela seul. De vraies personnes attendent pour vous aider.",
                dz: "ما يلزمكش تواجه هذا وحدك. ناس حقيقيين يستناو باش يساعدوك.",
              }[language]}
            </p>
            <a
              href="tel:3033"
              className="inline-flex items-center gap-3 px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-semibold transition-all hover:scale-105"
              style={{ borderRadius: '1rem 0.5rem 1rem 0.5rem' }}
            >
              <Phone className="w-5 h-5" />
              <span className="text-xl">3033</span>
            </a>
            <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-600'}`}>
              {{
                en: 'Free · Confidential · 24/7 · From any phone in Algeria',
                ar: 'مجاني · سري · 24/7 · من أي هاتف في الجزائر',
                fr: 'Gratuit · Confidentiel · 24/7 · Depuis n\'importe quel téléphone',
                dz: 'مجاني · سري · 24/7 · من أي تيليفون في الجزائر',
              }[language]}
            </p>
          </div>
        </div>
      </section>

      {/* CTA - Personal, not salesy */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <Sparkles className="w-8 h-8 text-green-500 mx-auto mb-4" />
            <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
              {{
                en: "Ready when you are.",
                ar: "جاهزون عندما تكون مستعداً.",
                fr: "Prêt quand vous l'êtes.",
                dz: "جاهزين وقتما تكون مستعد.",
              }[language]}
            </h2>
            <p className={`text-lg ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-700'}`}>
              {{
                en: "No pressure. No judgment. Just a conversation whenever you need one.",
                ar: "لا ضغط. لا أحكام. فقط محادثة متى احتجتها.",
                fr: "Pas de pression. Pas de jugement. Juste une conversation quand vous en avez besoin.",
                dz: "بلا ضغط. بلا حكم. غير هدرة وقتما تحتاجها.",
              }[language]}
            </p>
          </div>
          
          <Link
            to="/chat"
            className={`inline-flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-semibold transition-all hover:scale-105 ${
              theme === 'dark' ? 'shadow-lg shadow-green-500/20' : 'shadow-lg shadow-zinc-300'
            }`}
            style={{ borderRadius: '1.5rem 0.75rem 1.5rem 0.75rem' }}
          >
            {{
              en: 'Start a conversation',
              ar: 'ابدأ محادثة',
              fr: 'Commencer une conversation',
              dz: 'ابدا هدرة',
            }[language]}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer note - Honest */}
      <section className={`py-8 px-4 border-t ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200/60 bg-white'}`}>
        <div className="max-w-3xl mx-auto">
          <p className={`text-sm text-center ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-600'}`}>
            {{
              en: "Amal is a support tool, not a replacement for professional medical care. If you need medical help, please reach out to a healthcare provider.",
              ar: "أمل أداة دعم، وليس بديلاً عن الرعاية الطبية المهنية. إذا كنت بحاجة إلى مساعدة طبية، يرجى التواصل مع مقدم رعاية صحية.",
              fr: "Amal est un outil de soutien, pas un remplacement pour les soins médicaux professionnels.",
              dz: "أمل أداة دعم، ماشي بديل على الرعاية الطبية. إذا تحتاج مساعدة طبية، تواصل مع طبيب.",
            }[language]}
          </p>
          <p className={`text-xs text-center mt-4 ${theme === 'dark' ? 'text-zinc-600' : 'text-zinc-500'}`}>
            {{
              en: 'Made with hope for Algeria 🇩🇿',
              ar: 'صُنع بالأمل للجزائر 🇩🇿',
              fr: "Fait avec espoir pour l'Algérie 🇩🇿",
              dz: 'مصنوع بالأمل للجزائر 🇩🇿',
            }[language]}
          </p>
        </div>
      </section>
    </div>
  );
}
