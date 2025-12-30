import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type Language = 'en' | 'ar' | 'fr' | 'dz';

export const languages: Record<Language, { name: string; nativeName: string; dir: 'ltr' | 'rtl' }> = {
  en: { name: 'English', nativeName: 'English', dir: 'ltr' },
  ar: { name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  fr: { name: 'French', nativeName: 'Français', dir: 'ltr' },
  dz: { name: 'Darija', nativeName: 'الدارجة', dir: 'rtl' },
};

type TranslationKeys = {
  nav: { home: string; resources: string; about: string; signIn: string; startChat: string };
  hero: { badge: string; title1: string; title2: string; title3: string; description: string; cta: string; crisis: string; evidenceBased: string; anonymous: string; madeFor: string };
  science: { badge: string; title: string; titleHighlight: string; description: string; brainRecovery: string; brainRecoveryDesc: string; physicalDetox: string; physicalDetoxDesc: string; habitFormation: string; habitFormationDesc: string; cognitiveRestoration: string; cognitiveRestorationDesc: string };
  timeline: { title: string; titleHighlight: string; description: string; detox: string; detoxDesc: string; acute: string; acuteDesc: string; early: string; earlyDesc: string; sustained: string; sustainedDesc: string };
  chat: { title: string; titleHighlight: string; description: string };
  features: { title: string; titleHighlight: string; aiPowered: string; aiPoweredDesc: string; evidenceBased: string; evidenceBasedDesc: string; personalized: string; personalizedDesc: string; privacy: string; privacyDesc: string; availability: string; availabilityDesc: string; language: string; languageDesc: string };
  stats: { affected: string; recovery: string; available: string; free: string };
  crisis: { title: string; description: string; cta: string; note: string };
  cta: { badge: string; title: string; description: string; button: string };
  footer: { description: string; support: string; startChat: string; crisisLine: string; resources: string; learn: string; addictionScience: string; recoveryStages: string; copingTechniques: string; languages: string; copyright: string; tagline: string };
  auth: { 
    welcomeBack: string; signInContinue: string; email: string; password: string; rememberMe: string; forgotPassword: string; signIn: string; signingIn: string; orContinue: string; noAccount: string; signUp: string;
    createAccount: string; startJourney: string; fullName: string; confirmPassword: string; passwordsNoMatch: string; agreeTerms: string; terms: string; privacy: string; creatingAccount: string; haveAccount: string;
    resetPassword: string; resetDesc: string; sendReset: string; sending: string; backToLogin: string; checkEmail: string; resetSent: string;
    chars8: string; uppercase: string; oneNumber: string;
  };
  chatPage: {
    title: string; status: string; private: string; thinking: string; placeholder: string; crisis: string; suggested: string;
    prompt1: string; prompt2: string; prompt3: string; prompt4: string; welcome: string;
    response1: string; response2: string; response3: string; response4: string;
    newChat: string; history: string; newConversation: string;
    temporaryChat: string; temporaryNotice: string; welcomeTemporary: string;
  };
};

const translations: Record<Language, TranslationKeys> = {
  en: {
    nav: { home: 'Home', resources: 'Resources', about: 'About', signIn: 'Sign in', startChat: 'Start chat' },
    hero: {
      badge: 'Science-backed recovery support',
      title1: 'Your brain can',
      title2: 'heal itself',
      title3: 'Let us show you how',
      description: "Amal combines AI technology with addiction science to guide your recovery. Get evidence-based support, understand what's happening in your brain, and build strategies that work. Free, confidential, in your language.",
      cta: 'Start recovery conversation',
      crisis: 'Crisis: 3033',
      evidenceBased: 'Evidence-based',
      anonymous: '100% Anonymous',
      madeFor: 'Made for Algeria',
    },
    science: {
      badge: 'The science of recovery',
      title: 'Your body is',
      titleHighlight: 'designed to heal',
      description: "Addiction changes your brain, but those changes aren't permanent.",
      brainRecovery: 'Brain Recovery',
      brainRecoveryDesc: 'Dopamine receptors can recover to near-normal levels within 14 months of abstinence.',
      physicalDetox: 'Physical Detox',
      physicalDetoxDesc: 'Most substances clear your system within 72 hours. The healing begins immediately.',
      habitFormation: 'Habit Formation',
      habitFormationDesc: 'New neural pathways strengthen after 21 days of consistent behavior change.',
      cognitiveRestoration: 'Cognitive Restoration',
      cognitiveRestorationDesc: 'Memory, focus, and decision-making significantly improve within 6 months.',
    },
    timeline: { 
      title: 'What happens when you', 
      titleHighlight: 'stop', 
      description: 'Understanding the recovery timeline helps you know what to expect.',
      detox: 'Detox Phase',
      detoxDesc: 'Body eliminates toxins. Brain starts rebalancing.',
      acute: 'Acute Recovery',
      acuteDesc: 'Dopamine receptors heal. Sleep improves.',
      early: 'Early Abstinence',
      earlyDesc: 'Brain chemistry stabilizes. New pathways form.',
      sustained: 'Sustained Recovery',
      sustainedDesc: 'Cognitive function improves significantly.',
    },
    chat: { title: 'Conversations that', titleHighlight: 'educate and support', description: 'Amal explains the science, suggests evidence-based techniques, and helps you understand your recovery.' },
    features: {
      title: 'Built for',
      titleHighlight: 'real recovery',
      aiPowered: 'AI-Powered Understanding',
      aiPoweredDesc: 'Advanced NLP trained on addiction science to provide accurate, empathetic responses.',
      evidenceBased: 'Evidence-Based Knowledge',
      evidenceBasedDesc: 'Access scientific research about addiction, recovery stages, and coping strategies.',
      personalized: 'Personalized Strategies',
      personalizedDesc: 'Get tailored advice based on your substance, duration of use, and personal triggers.',
      privacy: 'Complete Privacy',
      privacyDesc: 'End-to-end encryption. No data stored. Your journey remains yours alone.',
      availability: '24/7 Availability',
      availabilityDesc: "Cravings don't follow schedules. Neither do we. Support whenever you need it.",
      language: 'Your Language',
      languageDesc: 'Arabic, French, or Darija. Express yourself naturally without barriers.',
    },
    stats: { affected: 'Algerians affected', recovery: 'Recovery possible', available: 'Always available', free: 'Completely free' },
    crisis: { title: "In crisis? You're not alone.", description: "If you're experiencing severe withdrawal, overdose risk, or suicidal thoughts, call immediately.", cta: 'Call 3033 Now', note: 'Free, confidential, 24/7 from any phone in Algeria' },
    cta: { badge: 'Your recovery starts now', title: 'Ready to understand your brain?', description: 'Every conversation with Amal is a step toward understanding addiction and recovery.', button: 'Start learning about recovery' },
    footer: { description: 'AI-powered, science-backed support for drug recovery in Algeria.', support: 'Support', startChat: 'Start Chat', crisisLine: 'Crisis Line: 3033', resources: 'Resources', learn: 'Learn', addictionScience: 'Addiction Science', recoveryStages: 'Recovery Stages', copingTechniques: 'Coping Techniques', languages: 'Languages', copyright: '© 2024 Amal. Built with science and hope for Algeria.', tagline: 'For Algerians, by Algerians' },
    auth: {
      welcomeBack: 'Welcome back', signInContinue: 'Sign in to continue your journey', email: 'Email', password: 'Password', rememberMe: 'Remember me', forgotPassword: 'Forgot password?', signIn: 'Sign in', signingIn: 'Signing in...', orContinue: 'or continue with', noAccount: "Don't have an account?", signUp: 'Sign up',
      createAccount: 'Create your account', startJourney: 'Start your journey to recovery', fullName: 'Full name', confirmPassword: 'Confirm password', passwordsNoMatch: 'Passwords do not match', agreeTerms: 'I agree to the', terms: 'Terms of Service', privacy: 'Privacy Policy', creatingAccount: 'Creating account...', haveAccount: 'Already have an account?',
      resetPassword: 'Reset password', resetDesc: 'Enter your email and we will send you a reset link', sendReset: 'Send reset link', sending: 'Sending...', backToLogin: 'Back to login', checkEmail: 'Check your email', resetSent: 'We sent a password reset link to your email',
      chars8: 'At least 8 characters', uppercase: 'One uppercase letter', oneNumber: 'One number',
    },
    chatPage: {
      title: 'Amal Assistant', status: 'Always here for you', private: 'Your conversation is private and secure', thinking: 'Amal is thinking...', placeholder: 'Type your message...', crisis: 'In crisis? Call', suggested: 'Suggested topics:',
      prompt1: 'I want to talk about my struggles', prompt2: 'How can I manage cravings?', prompt3: 'I need someone to listen', prompt4: 'Tell me about recovery resources',
      welcome: "Welcome to Amal. I'm here to support you on your journey to recovery. Everything you share is confidential. How are you feeling today?",
      response1: "I hear you, and I want you to know that reaching out takes courage. Can you tell me more about what you're experiencing?",
      response2: "Recovery is a journey, not a destination. Every step forward matters, no matter how small. What would feel like a manageable first step for you?",
      response3: "Your feelings are valid. Many people on the path to recovery experience similar challenges. Would you like to explore some coping strategies together?",
      response4: "Thank you for trusting me with this. Remember, you're not alone in this journey. What support do you feel you need right now?",
      newChat: 'New chat', history: 'History', newConversation: 'New conversation',
      temporaryChat: 'Temporary chat', temporaryNotice: 'This chat will not be saved', welcomeTemporary: "Welcome to a temporary chat. This conversation won't be saved to your history. Feel free to share openly.",
    },
  },
  ar: {
    nav: { home: 'الرئيسية', resources: 'الموارد', about: 'حول', signIn: 'تسجيل الدخول', startChat: 'ابدأ المحادثة' },
    hero: {
      badge: 'دعم التعافي المبني على العلم',
      title1: 'دماغك يستطيع',
      title2: 'أن يشفي نفسه',
      title3: 'دعنا نريك كيف',
      description: 'أمل يجمع بين تقنية الذكاء الاصطناعي وعلم الإدمان لإرشادك في رحلة التعافي. احصل على دعم مبني على الأدلة، افهم ما يحدث في دماغك، وابنِ استراتيجيات فعالة. مجاني، سري، بلغتك.',
      cta: 'ابدأ محادثة التعافي',
      crisis: 'خط الأزمات: 3033',
      evidenceBased: 'مبني على الأدلة',
      anonymous: 'سري 100%',
      madeFor: 'صُنع للجزائر',
    },
    science: {
      badge: 'علم التعافي',
      title: 'جسمك',
      titleHighlight: 'مصمم للشفاء',
      description: 'الإدمان يغير دماغك، لكن هذه التغييرات ليست دائمة.',
      brainRecovery: 'تعافي الدماغ',
      brainRecoveryDesc: 'مستقبلات الدوبامين يمكن أن تتعافى إلى مستويات شبه طبيعية خلال 14 شهراً.',
      physicalDetox: 'التخلص من السموم',
      physicalDetoxDesc: 'معظم المواد تخرج من جسمك خلال 72 ساعة. الشفاء يبدأ فوراً.',
      habitFormation: 'تكوين العادات',
      habitFormationDesc: 'المسارات العصبية الجديدة تتقوى بعد 21 يوماً من التغيير المستمر.',
      cognitiveRestoration: 'استعادة الإدراك',
      cognitiveRestorationDesc: 'الذاكرة والتركيز واتخاذ القرار تتحسن بشكل ملحوظ خلال 6 أشهر.',
    },
    timeline: { 
      title: 'ماذا يحدث عندما', 
      titleHighlight: 'تتوقف', 
      description: 'فهم جدول التعافي يساعدك على معرفة ما تتوقعه.',
      detox: 'مرحلة التخلص',
      detoxDesc: 'الجسم يتخلص من السموم. الدماغ يبدأ بالتوازن.',
      acute: 'التعافي الحاد',
      acuteDesc: 'مستقبلات الدوبامين تشفى. النوم يتحسن.',
      early: 'الامتناع المبكر',
      earlyDesc: 'كيمياء الدماغ تستقر. مسارات جديدة تتشكل.',
      sustained: 'التعافي المستدام',
      sustainedDesc: 'الوظائف الإدراكية تتحسن بشكل ملحوظ.',
    },
    chat: { title: 'محادثات', titleHighlight: 'تعلم وتدعم', description: 'أمل يشرح العلم، يقترح تقنيات مبنية على الأدلة، ويساعدك على فهم تعافيك.' },
    features: {
      title: 'مبني من أجل',
      titleHighlight: 'تعافٍ حقيقي',
      aiPowered: 'فهم بالذكاء الاصطناعي',
      aiPoweredDesc: 'معالجة لغة طبيعية متقدمة مدربة على علم الإدمان لتقديم ردود دقيقة ومتعاطفة.',
      evidenceBased: 'معرفة مبنية على الأدلة',
      evidenceBasedDesc: 'الوصول إلى البحث العلمي حول الإدمان ومراحل التعافي.',
      personalized: 'استراتيجيات مخصصة',
      personalizedDesc: 'احصل على نصائح مخصصة بناءً على المادة ومدة الاستخدام.',
      privacy: 'خصوصية كاملة',
      privacyDesc: 'تشفير من طرف إلى طرف. لا بيانات مخزنة. رحلتك تبقى لك وحدك.',
      availability: 'متاح 24/7',
      availabilityDesc: 'الرغبات لا تتبع جداول. نحن كذلك. دعم متى احتجته.',
      language: 'بلغتك',
      languageDesc: 'العربية أو الفرنسية أو الدارجة. عبر عن نفسك بشكل طبيعي.',
    },
    stats: { affected: 'جزائريون متأثرون', recovery: 'التعافي ممكن', available: 'متاح دائماً', free: 'مجاني تماماً' },
    crisis: { title: 'في أزمة؟ لست وحدك.', description: 'إذا كنت تعاني من انسحاب شديد أو خطر جرعة زائدة أو أفكار انتحارية، اتصل فوراً.', cta: 'اتصل بـ 3033 الآن', note: 'مكالمة مجانية، سرية، 24/7 من أي هاتف في الجزائر' },
    cta: { badge: 'تعافيك يبدأ الآن', title: 'مستعد لفهم دماغك؟', description: 'كل محادثة مع أمل هي خطوة نحو فهم الإدمان ومحفزاتك وعلم التحسن.', button: 'ابدأ التعلم عن التعافي' },
    footer: { description: 'دعم مدعوم بالذكاء الاصطناعي والعلم للتعافي من المخدرات في الجزائر.', support: 'الدعم', startChat: 'ابدأ المحادثة', crisisLine: 'خط الأزمات: 3033', resources: 'الموارد', learn: 'تعلم', addictionScience: 'علم الإدمان', recoveryStages: 'مراحل التعافي', copingTechniques: 'تقنيات التأقلم', languages: 'اللغات', copyright: '© 2024 أمل. صُنع بالعلم والأمل للجزائر.', tagline: 'للجزائريين، من الجزائريين' },
    auth: {
      welcomeBack: 'مرحباً بعودتك', signInContinue: 'سجل دخولك لمتابعة رحلتك', email: 'البريد الإلكتروني', password: 'كلمة المرور', rememberMe: 'تذكرني', forgotPassword: 'نسيت كلمة المرور؟', signIn: 'تسجيل الدخول', signingIn: 'جاري الدخول...', orContinue: 'أو تابع بـ', noAccount: 'ليس لديك حساب؟', signUp: 'إنشاء حساب',
      createAccount: 'أنشئ حسابك', startJourney: 'ابدأ رحلتك نحو التعافي', fullName: 'الاسم الكامل', confirmPassword: 'تأكيد كلمة المرور', passwordsNoMatch: 'كلمات المرور غير متطابقة', agreeTerms: 'أوافق على', terms: 'شروط الخدمة', privacy: 'سياسة الخصوصية', creatingAccount: 'جاري إنشاء الحساب...', haveAccount: 'لديك حساب بالفعل؟',
      resetPassword: 'إعادة تعيين كلمة المرور', resetDesc: 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين', sendReset: 'إرسال رابط إعادة التعيين', sending: 'جاري الإرسال...', backToLogin: 'العودة لتسجيل الدخول', checkEmail: 'تحقق من بريدك', resetSent: 'أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك',
      chars8: '8 أحرف على الأقل', uppercase: 'حرف كبير واحد', oneNumber: 'رقم واحد',
    },
    chatPage: {
      title: 'مساعد أمل', status: 'دائماً هنا من أجلك', private: 'محادثتك خاصة وآمنة', thinking: 'أمل يفكر...', placeholder: 'اكتب رسالتك...', crisis: 'في أزمة؟ اتصل بـ', suggested: 'مواضيع مقترحة:',
      prompt1: 'أريد التحدث عن معاناتي', prompt2: 'كيف أتعامل مع الرغبات؟', prompt3: 'أحتاج من يستمع إلي', prompt4: 'أخبرني عن موارد التعافي',
      welcome: 'مرحباً بك في أمل. أنا هنا لدعمك في رحلة التعافي. كل ما تشاركه سري. كيف تشعر اليوم؟',
      response1: 'أسمعك، وأريدك أن تعرف أن طلب المساعدة يتطلب شجاعة. هل يمكنك إخباري المزيد عما تمر به؟',
      response2: 'التعافي رحلة وليس وجهة. كل خطوة للأمام مهمة مهما كانت صغيرة. ما الخطوة الأولى التي تشعر أنها ممكنة؟',
      response3: 'مشاعرك صحيحة. كثير من الناس في طريق التعافي يمرون بتحديات مماثلة. هل تريد استكشاف بعض استراتيجيات التأقلم معاً؟',
      response4: 'شكراً لثقتك بي. تذكر أنك لست وحدك في هذه الرحلة. ما الدعم الذي تشعر أنك تحتاجه الآن؟',
      newChat: 'محادثة جديدة', history: 'السجل', newConversation: 'محادثة جديدة',
      temporaryChat: 'محادثة مؤقتة', temporaryNotice: 'لن يتم حفظ هذه المحادثة', welcomeTemporary: 'مرحباً بك في محادثة مؤقتة. لن يتم حفظ هذه المحادثة في سجلك. شارك بحرية.',
    },
  },
  fr: {
    nav: { home: 'Accueil', resources: 'Ressources', about: 'À propos', signIn: 'Connexion', startChat: 'Commencer' },
    hero: {
      badge: 'Soutien au rétablissement basé sur la science',
      title1: 'Votre cerveau peut',
      title2: 'se guérir',
      title3: 'Laissez-nous vous montrer comment',
      description: "Amal combine la technologie IA avec la science de l'addiction pour guider votre rétablissement. Gratuit, confidentiel, dans votre langue.",
      cta: 'Commencer une conversation',
      crisis: 'Crise: 3033',
      evidenceBased: 'Basé sur des preuves',
      anonymous: '100% Anonyme',
      madeFor: "Fait pour l'Algérie",
    },
    science: {
      badge: 'La science du rétablissement',
      title: 'Votre corps est',
      titleHighlight: 'conçu pour guérir',
      description: "L'addiction change votre cerveau, mais ces changements ne sont pas permanents.",
      brainRecovery: 'Récupération cérébrale',
      brainRecoveryDesc: "Les récepteurs de dopamine peuvent récupérer dans les 14 mois d'abstinence.",
      physicalDetox: 'Détox physique',
      physicalDetoxDesc: 'La plupart des substances quittent votre système en 72 heures.',
      habitFormation: 'Formation des habitudes',
      habitFormationDesc: 'Les nouvelles voies neuronales se renforcent après 21 jours.',
      cognitiveRestoration: 'Restauration cognitive',
      cognitiveRestorationDesc: "La mémoire et la concentration s'améliorent en 6 mois.",
    },
    timeline: { 
      title: 'Ce qui se passe quand vous', 
      titleHighlight: 'arrêtez', 
      description: 'Comprendre le calendrier de récupération vous aide à savoir à quoi vous attendre.',
      detox: 'Phase de détox',
      detoxDesc: 'Le corps élimine les toxines. Le cerveau se rééquilibre.',
      acute: 'Récupération aiguë',
      acuteDesc: 'Les récepteurs de dopamine guérissent. Le sommeil améliore.',
      early: 'Abstinence précoce',
      earlyDesc: 'La chimie cérébrale se stabilise. De nouvelles voies se forment.',
      sustained: 'Récupération soutenue',
      sustainedDesc: "La fonction cognitive s'améliore significativement.",
    },
    chat: { title: 'Des conversations qui', titleHighlight: 'éduquent et soutiennent', description: 'Amal explique la science et vous aide à comprendre votre rétablissement.' },
    features: {
      title: 'Construit pour',
      titleHighlight: 'un vrai rétablissement',
      aiPowered: 'Compréhension par IA',
      aiPoweredDesc: "NLP avancé formé sur la science de l'addiction.",
      evidenceBased: 'Connaissances basées sur des preuves',
      evidenceBasedDesc: "Accédez à la recherche scientifique sur l'addiction.",
      personalized: 'Stratégies personnalisées',
      personalizedDesc: 'Obtenez des conseils adaptés à votre situation.',
      privacy: 'Confidentialité totale',
      privacyDesc: 'Chiffrement de bout en bout. Aucune donnée stockée.',
      availability: 'Disponible 24/7',
      availabilityDesc: 'Soutien quand vous en avez besoin.',
      language: 'Votre langue',
      languageDesc: 'Arabe, français ou darija. Exprimez-vous naturellement.',
    },
    stats: { affected: 'Algériens touchés', recovery: 'Récupération possible', available: 'Toujours disponible', free: 'Totalement gratuit' },
    crisis: { title: "En crise? Vous n'êtes pas seul.", description: 'Si vous souffrez de sevrage sévère ou de pensées suicidaires, appelez immédiatement.', cta: 'Appelez 3033 maintenant', note: 'Appel gratuit, confidentiel, 24/7' },
    cta: { badge: 'Votre rétablissement commence maintenant', title: 'Prêt à comprendre votre cerveau?', description: "Chaque conversation avec Amal est un pas vers la compréhension de l'addiction.", button: 'Commencer à apprendre' },
    footer: { description: "Soutien alimenté par l'IA pour le rétablissement en Algérie.", support: 'Soutien', startChat: 'Commencer le chat', crisisLine: 'Ligne de crise: 3033', resources: 'Ressources', learn: 'Apprendre', addictionScience: "Science de l'addiction", recoveryStages: 'Étapes de récupération', copingTechniques: "Techniques d'adaptation", languages: 'Langues', copyright: "© 2024 Amal. Fait avec science et espoir pour l'Algérie.", tagline: 'Pour les Algériens, par les Algériens' },
    auth: {
      welcomeBack: 'Bon retour', signInContinue: 'Connectez-vous pour continuer', email: 'Email', password: 'Mot de passe', rememberMe: 'Se souvenir de moi', forgotPassword: 'Mot de passe oublié?', signIn: 'Se connecter', signingIn: 'Connexion...', orContinue: 'ou continuer avec', noAccount: "Pas de compte?", signUp: "S'inscrire",
      createAccount: 'Créer votre compte', startJourney: 'Commencez votre parcours de rétablissement', fullName: 'Nom complet', confirmPassword: 'Confirmer le mot de passe', passwordsNoMatch: 'Les mots de passe ne correspondent pas', agreeTerms: "J'accepte les", terms: "Conditions d'utilisation", privacy: 'Politique de confidentialité', creatingAccount: 'Création du compte...', haveAccount: 'Déjà un compte?',
      resetPassword: 'Réinitialiser le mot de passe', resetDesc: 'Entrez votre email et nous vous enverrons un lien', sendReset: 'Envoyer le lien', sending: 'Envoi...', backToLogin: 'Retour à la connexion', checkEmail: 'Vérifiez votre email', resetSent: 'Nous avons envoyé un lien de réinitialisation',
      chars8: 'Au moins 8 caractères', uppercase: 'Une lettre majuscule', oneNumber: 'Un chiffre',
    },
    chatPage: {
      title: 'Assistant Amal', status: 'Toujours là pour vous', private: 'Votre conversation est privée et sécurisée', thinking: 'Amal réfléchit...', placeholder: 'Tapez votre message...', crisis: 'En crise? Appelez', suggested: 'Sujets suggérés:',
      prompt1: 'Je veux parler de mes difficultés', prompt2: 'Comment gérer les envies?', prompt3: "J'ai besoin de quelqu'un qui écoute", prompt4: 'Parlez-moi des ressources de rétablissement',
      welcome: "Bienvenue sur Amal. Je suis là pour vous soutenir dans votre parcours de rétablissement. Tout ce que vous partagez est confidentiel. Comment vous sentez-vous aujourd'hui?",
      response1: "Je vous entends, et je veux que vous sachiez que demander de l'aide demande du courage. Pouvez-vous m'en dire plus sur ce que vous vivez?",
      response2: "Le rétablissement est un voyage, pas une destination. Chaque pas en avant compte, aussi petit soit-il. Quelle serait une première étape gérable pour vous?",
      response3: "Vos sentiments sont valides. Beaucoup de personnes sur le chemin du rétablissement vivent des défis similaires. Voulez-vous explorer ensemble des stratégies d'adaptation?",
      response4: "Merci de me faire confiance. N'oubliez pas que vous n'êtes pas seul dans ce voyage. De quel soutien avez-vous besoin maintenant?",
      newChat: 'Nouvelle conversation', history: 'Historique', newConversation: 'Nouvelle conversation',
      temporaryChat: 'Chat temporaire', temporaryNotice: 'Cette conversation ne sera pas sauvegardée', welcomeTemporary: "Bienvenue dans un chat temporaire. Cette conversation ne sera pas enregistrée dans votre historique. Partagez librement.",
    },
  },
  dz: {
    nav: { home: 'الدار', resources: 'الموارد', about: 'علينا', signIn: 'دخول', startChat: 'ابدا الهدرة' },
    hero: {
      badge: 'دعم التعافي بالعلم',
      title1: 'مخك يقدر',
      title2: 'يبرا وحدو',
      title3: 'خلينا نوريوك كيفاش',
      description: 'أمل يجمع بين الذكاء الاصطناعي وعلم الإدمان باش يساعدك تتعافى. مجاني، سري، بلغتك.',
      cta: 'ابدا محادثة التعافي',
      crisis: 'خط الأزمات: 3033',
      evidenceBased: 'مبني على العلم',
      anonymous: 'سري 100%',
      madeFor: 'مصنوع للجزائر',
    },
    science: {
      badge: 'علم التعافي',
      title: 'جسمك',
      titleHighlight: 'مصمم باش يبرا',
      description: 'الإدمان يبدل مخك، بصح هاد التبديلات ماشي دايمة.',
      brainRecovery: 'تعافي المخ',
      brainRecoveryDesc: 'مستقبلات الدوبامين تقدر تولي عادية في 14 شهر.',
      physicalDetox: 'تنظيف الجسم',
      physicalDetoxDesc: 'أغلب المواد تخرج من جسمك في 72 ساعة.',
      habitFormation: 'تكوين العادات',
      habitFormationDesc: 'المسارات العصبية الجديدة تتقوى بعد 21 يوم.',
      cognitiveRestoration: 'رجوع التفكير',
      cognitiveRestorationDesc: 'الذاكرة والتركيز يتحسنو بزاف في 6 أشهر.',
    },
    timeline: { 
      title: 'واش يصرا كي', 
      titleHighlight: 'توقف', 
      description: 'فهم مراحل التعافي يساعدك تعرف واش تستنى.',
      detox: 'مرحلة التنظيف',
      detoxDesc: 'الجسم يخرج السموم. المخ يبدا يتوازن.',
      acute: 'التعافي الحاد',
      acuteDesc: 'مستقبلات الدوبامين تبرا. النوم يتحسن.',
      early: 'التوقف المبكر',
      earlyDesc: 'كيمياء المخ تستقر. مسارات جديدة تتشكل.',
      sustained: 'التعافي المستمر',
      sustainedDesc: 'التفكير يتحسن بزاف.',
    },
    chat: { title: 'هدرة', titleHighlight: 'تعلم وتدعم', description: 'أمل يشرحلك العلم ويساعدك تفهم تعافيك.' },
    features: {
      title: 'مبني من أجل',
      titleHighlight: 'تعافي حقيقي',
      aiPowered: 'فهم بالذكاء الاصطناعي',
      aiPoweredDesc: 'تقنية متقدمة مدربة على علم الإدمان.',
      evidenceBased: 'معرفة علمية',
      evidenceBasedDesc: 'وصول للبحث العلمي على الإدمان.',
      personalized: 'استراتيجيات مخصصة',
      personalizedDesc: 'نصائح مخصصة حسب حالتك.',
      privacy: 'خصوصية كاملة',
      privacyDesc: 'تشفير كامل. ما نخزنو والو.',
      availability: 'متاح 24/7',
      availabilityDesc: 'دعم وقتما حبيت.',
      language: 'بلغتك',
      languageDesc: 'العربية ولا الفرنسية ولا الدارجة.',
    },
    stats: { affected: 'جزائريين متأثرين', recovery: 'التعافي ممكن', available: 'متاح ديما', free: 'مجاني بالكامل' },
    crisis: { title: 'في أزمة؟ ماكش وحدك.', description: 'إذا راك تعاني من انسحاب شديد ولا أفكار سوداء، عيط فيسع.', cta: 'عيط لـ 3033 دروك', note: 'مكالمة مجانية، سرية، 24/7' },
    cta: { badge: 'تعافيك يبدا دروك', title: 'مستعد تفهم مخك؟', description: 'كل هدرة مع أمل هي خطوة باش تفهم الإدمان.', button: 'ابدا تتعلم على التعافي' },
    footer: { description: 'دعم بالذكاء الاصطناعي للتعافي في الجزائر.', support: 'الدعم', startChat: 'ابدا الهدرة', crisisLine: 'خط الأزمات: 3033', resources: 'الموارد', learn: 'تعلم', addictionScience: 'علم الإدمان', recoveryStages: 'مراحل التعافي', copingTechniques: 'طرق التأقلم', languages: 'اللغات', copyright: '© 2024 أمل. مصنوع بالعلم والأمل للجزائر.', tagline: 'للجزائريين، من الجزائريين' },
    auth: {
      welcomeBack: 'مرحبا بيك', signInContinue: 'ادخل باش تكمل رحلتك', email: 'الإيميل', password: 'كلمة السر', rememberMe: 'تفكرني', forgotPassword: 'نسيت كلمة السر؟', signIn: 'دخول', signingIn: 'راني ندخل...', orContinue: 'ولا كمل بـ', noAccount: 'ماعندكش حساب؟', signUp: 'سجل',
      createAccount: 'أنشئ حسابك', startJourney: 'ابدا رحلتك للتعافي', fullName: 'الاسم الكامل', confirmPassword: 'أكد كلمة السر', passwordsNoMatch: 'كلمات السر ماشي كيف كيف', agreeTerms: 'نوافق على', terms: 'شروط الخدمة', privacy: 'سياسة الخصوصية', creatingAccount: 'راني نخلق الحساب...', haveAccount: 'عندك حساب؟',
      resetPassword: 'بدل كلمة السر', resetDesc: 'دخل الإيميل تاعك ونبعثولك رابط', sendReset: 'ابعث الرابط', sending: 'راني نبعث...', backToLogin: 'ارجع للدخول', checkEmail: 'شوف الإيميل تاعك', resetSent: 'بعثنالك رابط باش تبدل كلمة السر',
      chars8: '8 حروف على الأقل', uppercase: 'حرف كبير واحد', oneNumber: 'رقم واحد',
    },
    chatPage: {
      title: 'مساعد أمل', status: 'ديما هنا معاك', private: 'الهدرة تاعك خاصة وآمنة', thinking: 'أمل راه يفكر...', placeholder: 'اكتب الرسالة تاعك...', crisis: 'في أزمة؟ عيط لـ', suggested: 'مواضيع مقترحة:',
      prompt1: 'نحب نهدر على المشاكل تاعي', prompt2: 'كيفاش نتعامل مع الرغبات؟', prompt3: 'نحتاج واحد يسمعني', prompt4: 'قولي على موارد التعافي',
      welcome: 'مرحبا بيك في أمل. راني هنا باش نساعدك في رحلة التعافي. كلش سري. كيراك اليوم؟',
      response1: 'راني نسمعك، وحبيت نقولك بلي طلب المساعدة يحتاج شجاعة. تقدر تقولي أكثر على واش راك تحس؟',
      response2: 'التعافي رحلة ماشي وجهة. كل خطوة للقدام مهمة مهما كانت صغيرة. واش هي الخطوة الأولى اللي تحس بلي تقدر تديرها؟',
      response3: 'المشاعر تاعك صحيحة. بزاف ناس في طريق التعافي يمرو بنفس التحديات. تحب نستكشفو مع بعض طرق التأقلم؟',
      response4: 'شكراً على الثقة تاعك. تفكر بلي ماكش وحدك في هاد الرحلة. واش هو الدعم اللي تحس بلي تحتاجو دروك؟',
      newChat: 'هدرة جديدة', history: 'السجل', newConversation: 'هدرة جديدة',
      temporaryChat: 'هدرة مؤقتة', temporaryNotice: 'هاد الهدرة ماراحش تتحفظ', welcomeTemporary: 'مرحبا بيك في هدرة مؤقتة. هاد المحادثة ماراحش تتحفظ في السجل تاعك. هدر براحتك.',
    },
  },
};

// Get saved language from localStorage
const getSavedLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('amal-language');
    if (saved && ['en', 'ar', 'fr', 'dz'].includes(saved)) {
      return saved as Language;
    }
  }
  return 'en';
};

// Initialize document direction on load
if (typeof window !== 'undefined') {
  const lang = getSavedLanguage();
  document.documentElement.dir = languages[lang].dir;
  document.documentElement.lang = lang;
}

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  subscribeWithSelector((set) => ({
    language: getSavedLanguage(),
    setLanguage: (lang: Language) => {
      localStorage.setItem('amal-language', lang);
      document.documentElement.dir = languages[lang].dir;
      document.documentElement.lang = lang;
      set({ language: lang });
    },
  }))
);

// Hook for components - subscribes to language changes and returns translation function
export function useT() {
  const language = useLanguageStore((state) => state.language);

  return function t(key: string): string {
    const [section, item] = key.split('.') as [keyof TranslationKeys, string];
    const sectionData = translations[language]?.[section];
    if (sectionData && item in sectionData) {
      return (sectionData as Record<string, string>)[item];
    }
    return key;
  };
}

// For use outside React components
export function getTranslation(key: string): string {
  const language = useLanguageStore.getState().language;
  const [section, item] = key.split('.') as [keyof TranslationKeys, string];
  const sectionData = translations[language]?.[section];
  if (sectionData && item in sectionData) {
    return (sectionData as Record<string, string>)[item];
  }
  return key;
}
