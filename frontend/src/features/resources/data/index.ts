import { Phone, MapPin, BookOpen, Users, Brain, Clock, Shield } from 'lucide-react';
import type { Category, EmergencyContact, TreatmentCenter, EducationTopic, FAQ } from '../types';

export const categories: Category[] = [
  {
    id: 'emergency',
    icon: Phone,
    label: { en: 'Emergency', ar: 'طوارئ', fr: 'Urgence', dz: 'طوارئ' },
  },
  {
    id: 'centers',
    icon: MapPin,
    label: { en: 'Treatment Centers', ar: 'مراكز العلاج', fr: 'Centres de traitement', dz: 'مراكز العلاج' },
  },
  {
    id: 'education',
    icon: BookOpen,
    label: { en: 'Learn', ar: 'تعلم', fr: 'Apprendre', dz: 'تعلم' },
  },
  {
    id: 'family',
    icon: Users,
    label: { en: 'For Families', ar: 'للعائلات', fr: 'Pour les familles', dz: 'للعائلات' },
  },
];

export const emergencyContacts: EmergencyContact[] = [
  {
    name: { en: 'National Crisis Line', ar: 'خط الأزمات الوطني', fr: 'Ligne de crise nationale', dz: 'خط الأزمات الوطني' },
    number: '3033',
    description: { en: 'Free, confidential, 24/7', ar: 'مجاني، سري، 24/7', fr: 'Gratuit, confidentiel, 24/7', dz: 'مجاني، سري، 24/7' },
    primary: true,
  },
  {
    name: { en: 'SAMU (Medical Emergency)', ar: 'سامو (طوارئ طبية)', fr: 'SAMU (Urgence médicale)', dz: 'سامو (طوارئ طبية)' },
    number: '115',
    description: { en: 'Medical emergencies', ar: 'حالات الطوارئ الطبية', fr: 'Urgences médicales', dz: 'حالات الطوارئ الطبية' },
    primary: false,
  },
  {
    name: { en: 'Police', ar: 'الشرطة', fr: 'Police', dz: 'البوليس' },
    number: '17',
    description: { en: 'If in danger', ar: 'إذا كنت في خطر', fr: 'Si en danger', dz: 'إذا راك في خطر' },
    primary: false,
  },
];


export const treatmentCenters: TreatmentCenter[] = [
  {
    name: { en: 'Frantz Fanon Hospital - Blida', ar: 'مستشفى فرانز فانون - البليدة', fr: 'Hôpital Frantz Fanon - Blida', dz: 'سبيطار فرانز فانون - البليدة' },
    type: { en: 'Psychiatric Hospital', ar: 'مستشفى نفسي', fr: 'Hôpital psychiatrique', dz: 'سبيطار نفسي' },
    location: { en: 'Blida', ar: 'البليدة', fr: 'Blida', dz: 'البليدة' },
  },
  {
    name: { en: 'Drid Hocine Hospital', ar: 'مستشفى دريد حسين', fr: 'Hôpital Drid Hocine', dz: 'سبيطار دريد حسين' },
    type: { en: 'Addiction Treatment', ar: 'علاج الإدمان', fr: 'Traitement des addictions', dz: 'علاج الإدمان' },
    location: { en: 'Algiers', ar: 'الجزائر', fr: 'Alger', dz: 'الجزائر' },
  },
  {
    name: { en: 'EHS Psychiatry - Oran', ar: 'مؤسسة الصحة النفسية - وهران', fr: 'EHS Psychiatrie - Oran', dz: 'مؤسسة الصحة النفسية - وهران' },
    type: { en: 'Mental Health Center', ar: 'مركز الصحة النفسية', fr: 'Centre de santé mentale', dz: 'مركز الصحة النفسية' },
    location: { en: 'Oran', ar: 'وهران', fr: 'Oran', dz: 'وهران' },
  },
];

export const educationTopics: EducationTopic[] = [
  {
    icon: Brain,
    title: { en: 'How Addiction Works', ar: 'كيف يعمل الإدمان', fr: "Comment fonctionne l'addiction", dz: 'كيفاش يخدم الإدمان' },
    description: {
      en: 'Addiction changes brain chemistry. Dopamine pathways get hijacked, making the substance feel necessary for survival.',
      ar: 'الإدمان يغير كيمياء الدماغ. مسارات الدوبامين تُختطف، مما يجعل المادة تبدو ضرورية للبقاء.',
      fr: "L'addiction modifie la chimie du cerveau. Les voies de la dopamine sont détournées.",
      dz: 'الإدمان يبدل كيمياء المخ. مسارات الدوبامين تتخطف، وتخلي المادة تبان ضرورية للحياة.',
    },
  },
  {
    icon: Clock,
    title: { en: 'Recovery Timeline', ar: 'جدول التعافي', fr: 'Chronologie du rétablissement', dz: 'جدول التعافي' },
    description: {
      en: '72 hours: toxins clear. 2-3 weeks: acute withdrawal ends. 3-6 months: brain chemistry stabilizes. 14 months: dopamine receptors fully recover.',
      ar: '72 ساعة: تخرج السموم. 2-3 أسابيع: تنتهي أعراض الانسحاب. 3-6 أشهر: تستقر كيمياء الدماغ. 14 شهر: تتعافى مستقبلات الدوبامين.',
      fr: '72h: élimination des toxines. 2-3 semaines: fin du sevrage aigu. 3-6 mois: stabilisation.',
      dz: '72 ساعة: السموم تخرج. 2-3 أسابيع: أعراض الانسحاب تكمل. 3-6 شهور: كيمياء المخ تستقر.',
    },
  },
  {
    icon: Shield,
    title: { en: 'Preventing Relapse', ar: 'منع الانتكاس', fr: 'Prévenir la rechute', dz: 'منع الانتكاس' },
    description: {
      en: 'Identify triggers. Build healthy routines. Stay connected to support. Relapse is not failure—it is part of many recovery journeys.',
      ar: 'حدد المحفزات. ابنِ روتيناً صحياً. ابقَ متصلاً بالدعم. الانتكاس ليس فشلاً—إنه جزء من رحلات التعافي.',
      fr: 'Identifiez les déclencheurs. Construisez des routines saines. La rechute fait partie du parcours.',
      dz: 'حدد المحفزات. ابني روتين صحي. ابقى متصل بالدعم. الانتكاس ماشي فشل—هو جزء من رحلة التعافي.',
    },
  },
];

export const familyFaqs: FAQ[] = [
  {
    question: { en: 'How do I talk to someone about their addiction?', ar: 'كيف أتحدث مع شخص عن إدمانه؟', fr: "Comment parler à quelqu'un de son addiction?", dz: 'كيفاش نهدر مع واحد على إدمانو؟' },
    answer: {
      en: 'Choose a calm moment. Use "I" statements ("I am worried about you"). Listen without judgment. Avoid ultimatums. Express love and concern, not anger.',
      ar: 'اختر لحظة هادئة. استخدم عبارات "أنا" ("أنا قلق عليك"). استمع بدون حكم. تجنب الإنذارات. عبّر عن الحب والقلق، ليس الغضب.',
      fr: 'Choisissez un moment calme. Utilisez des phrases en "je". Écoutez sans juger. Évitez les ultimatums.',
      dz: 'اختار وقت هادي. استعمل عبارات "أنا" ("أنا قلقان عليك"). اسمع بلا ما تحكم. تجنب الإنذارات. عبّر على الحب والقلق، ماشي الغضب.',
    },
  },
  {
    question: { en: 'What if they refuse help?', ar: 'ماذا لو رفضوا المساعدة؟', fr: "Et s'ils refusent l'aide?", dz: 'واش نديرو إذا رفضو المساعدة؟' },
    answer: {
      en: 'You cannot force recovery. Set boundaries to protect yourself. Keep communication open. Let them know help is available when they are ready. Take care of your own mental health.',
      ar: 'لا يمكنك فرض التعافي. ضع حدوداً لحماية نفسك. أبقِ التواصل مفتوحاً. أخبرهم أن المساعدة متاحة عندما يكونون مستعدين.',
      fr: 'Vous ne pouvez pas forcer le rétablissement. Fixez des limites. Gardez la communication ouverte.',
      dz: 'ما تقدرش تفرض التعافي. حط حدود باش تحمي روحك. خلي التواصل مفتوح. قولهم المساعدة موجودة كي يكونو مستعدين.',
    },
  },
  {
    question: { en: 'How do I take care of myself?', ar: 'كيف أعتني بنفسي؟', fr: 'Comment prendre soin de moi-même?', dz: 'كيفاش نعتني بروحي؟' },
    answer: {
      en: 'Supporting someone with addiction is exhausting. Join a support group for families. Set boundaries. It is not selfish to prioritize your wellbeing—you cannot help others if you are depleted.',
      ar: 'دعم شخص مدمن مرهق. انضم لمجموعة دعم للعائلات. ضع حدوداً. ليس أنانية أن تعطي الأولوية لصحتك—لا يمكنك مساعدة الآخرين إذا كنت منهكاً.',
      fr: "Soutenir quelqu'un avec une addiction est épuisant. Rejoignez un groupe de soutien. Ce n'est pas égoïste de prioriser votre bien-être.",
      dz: 'دعم واحد مدمن متعب. انضم لمجموعة دعم للعائلات. حط حدود. ماشي أنانية تعطي الأولوية لصحتك—ما تقدرش تساعد الآخرين إذا كنت منهك.',
    },
  },
];
