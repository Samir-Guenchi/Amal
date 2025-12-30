import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Shield,
  Clock,
  Globe,
  Brain,
  Heart,
  Phone,
  ArrowRight,
  Leaf,
  Activity,
  Zap,
  BookOpen,
  Target,
  TrendingUp,
  Users,
  Microscope,
  HeartPulse,
} from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';
import { useT } from '../../../store/languageStore';

// Neural network visualization
function NeuralNetwork({ theme }: { theme: 'light' | 'dark' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 400;

    const nodes: { x: number; y: number; vx: number; vy: number }[] = [];
    for (let i = 0; i < 30; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        nodes.forEach((other, j) => {
          if (i === j) return;
          const dist = Math.hypot(node.x - other.x, node.y - other.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = theme === 'dark' 
              ? `rgba(34, 197, 94, ${0.3 - dist / 333})`
              : `rgba(22, 163, 74, ${0.4 - dist / 250})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = theme === 'dark' ? 'rgba(34, 197, 94, 0.6)' : 'rgba(22, 163, 74, 0.8)';
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [theme]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="w-full h-full opacity-60" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>Your brain can heal</p>
          <p className={`text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>Neuroplasticity is real</p>
        </div>
      </div>
    </div>
  );
}

// Science fact card - organic blob shape
function ScienceFact({ fact, index, theme }: { fact: { icon: React.ElementType; title: string; desc: string; stat: string }; index: number; theme: 'light' | 'dark' }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const Icon = fact.icon;
  
  // Varied border radius for organic feel
  const shapes = [
    'rounded-[2rem_1rem_2rem_1rem]',
    'rounded-[1rem_2rem_1rem_2rem]', 
    'rounded-[1.5rem_2.5rem_1.5rem_2.5rem]',
    'rounded-[2.5rem_1.5rem_2.5rem_1.5rem]',
  ];

  return (
    <div
      ref={ref}
      className={`relative p-6 ${shapes[index % 4]} transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${theme === 'dark' ? 'bg-white/[0.02] border border-white/5' : 'bg-zinc-50 border border-zinc-200'}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Organic icon container - squircle/blob */}
        <div className="w-12 h-12 rounded-[1rem_0.5rem_1rem_0.5rem] bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-green-500 mb-1">{fact.stat}</div>
          <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{fact.title}</h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>{fact.desc}</p>
        </div>
      </div>
    </div>
  );
}


// Recovery timeline - with translations and varied shapes
function RecoveryTimeline({ theme, t }: { theme: 'light' | 'dark'; t: (key: string) => string }) {
  const stages = [
    { time: '24-72h', icon: Activity, key: 'detox' },
    { time: '1-2 weeks', icon: HeartPulse, key: 'acute' },
    { time: '1-3 months', icon: Brain, key: 'early' },
    { time: '3+ months', icon: TrendingUp, key: 'sustained' },
  ];
  
  // Progressive shapes - from sharp to soft (representing healing journey)
  const cardShapes = [
    'rounded-[0.5rem_2rem_0.5rem_2rem]', // Start: more angular
    'rounded-[1rem_1.5rem_1rem_1.5rem]',
    'rounded-[1.5rem_1rem_1.5rem_1rem]',
    'rounded-[2rem_2rem_2rem_2rem]', // End: fully rounded (healed)
  ];
  
  const iconShapes = [
    'rounded-lg',
    'rounded-[0.75rem]',
    'rounded-[1rem]',
    'rounded-full', // Final stage: complete circle
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stages.map((stage, i) => {
        const Icon = stage.icon;
        return (
          <div key={stage.key} className={`relative p-6 ${cardShapes[i]} ${
            theme === 'dark' ? 'bg-zinc-900' : 'bg-white border border-zinc-100'
          }`}>
            {/* Step number */}
            <div className={`absolute top-4 right-4 text-xs font-medium ${
              theme === 'dark' ? 'text-zinc-600' : 'text-zinc-300'
            }`}>
              0{i + 1}
            </div>
            
            {/* Icon - shape evolves with stages */}
            <div className={`w-12 h-12 ${iconShapes[i]} flex items-center justify-center mb-4 ${
              theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'
            }`}>
              <Icon className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            
            {/* Time */}
            <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
              {stage.time}
            </div>
            
            {/* Title */}
            <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
              {t(`timeline.${stage.key}`)}
            </h4>
            
            {/* Description */}
            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {t(`timeline.${stage.key}Desc`)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// Stat card - innovative varied shapes
function StatCard({ 
  value, 
  label, 
  suffix = '', 
  icon: Icon,
  theme,
  accent = false,
  shape = 0
}: { 
  value: number; 
  label: string; 
  suffix?: string; 
  icon: React.ElementType;
  theme: 'light' | 'dark';
  accent?: boolean;
  shape?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  
  // Varied card shapes for visual interest
  const cardShapes = [
    'rounded-[1.5rem_0.5rem_1.5rem_0.5rem]', // Diagonal soft
    'rounded-[2rem]', // Pill-ish
    'rounded-[0.5rem_1.5rem_0.5rem_1.5rem]', // Inverse diagonal
    'rounded-[1rem_2rem_1rem_0.5rem]', // Asymmetric organic
  ];
  
  // Varied icon container shapes
  const iconShapes = [
    'rounded-full',
    'rounded-[0.75rem_0.25rem_0.75rem_0.25rem]',
    'rounded-lg',
    'rounded-[0.5rem_1rem_0.5rem_1rem]',
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const duration = 1500;
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div 
      ref={ref} 
      className={`relative p-6 ${cardShapes[shape % 4]} overflow-hidden ${
        accent 
          ? 'bg-green-600 text-white' 
          : theme === 'dark' 
            ? 'bg-zinc-900 border border-zinc-800' 
            : 'bg-white border border-zinc-200'
      }`}
    >
      {/* Background pattern for accent card - organic blobs */}
      {accent && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-[2rem_1rem_2rem_1rem] border-[20px] border-white" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-[1rem_2rem_1rem_2rem] border-[16px] border-white" />
        </div>
      )}
      
      <div className="relative">
        {/* Icon - varied shape */}
        <div className={`w-10 h-10 ${iconShapes[shape % 4]} flex items-center justify-center mb-4 ${
          accent 
            ? 'bg-white/20' 
            : theme === 'dark' 
              ? 'bg-green-500/10' 
              : 'bg-green-50'
        }`}>
          <Icon className={`w-5 h-5 ${
            accent ? 'text-white' : theme === 'dark' ? 'text-green-400' : 'text-green-600'
          }`} />
        </div>
        
        {/* Value */}
        <div className={`text-3xl md:text-4xl font-bold mb-1 ${
          accent ? 'text-white' : theme === 'dark' ? 'text-white' : 'text-zinc-900'
        }`}>
          {count.toLocaleString()}{suffix}
        </div>
        
        {/* Label */}
        <p className={`text-sm ${
          accent ? 'text-white/80' : theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
        }`}>
          {label}
        </p>
      </div>
    </div>
  );
}

// Chat preview
function ChatPreview({ theme }: { theme: 'light' | 'dark' }) {
  const [visibleMessages, setVisibleMessages] = useState(0);

  const messages = [
    { role: 'user', text: "I've been using for 3 years. Is it too late for my brain to recover?" },
    { role: 'ai', text: "It's never too late. Research shows the brain has remarkable neuroplasticity. Studies indicate significant recovery of dopamine receptors within 12-14 months of abstinence." },
    { role: 'user', text: "The cravings are so intense at night..." },
    { role: 'ai', text: "Night cravings are common - your circadian rhythm affects dopamine levels. Try the 4-7-8 breathing technique. Would you like me to guide you through it?" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleMessages((v) => (v < messages.length ? v + 1 : v));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative max-w-xl mx-auto">
      <div className={`relative rounded-3xl overflow-hidden ${
        theme === 'dark' ? 'bg-zinc-900/80 border border-white/10' : 'bg-white border border-zinc-200 shadow-xl'
      }`}>
        <div className={`flex items-center gap-3 p-4 border-b ${theme === 'dark' ? 'border-white/5' : 'border-zinc-100'}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Amal AI</p>
            <p className="text-xs text-green-500">Evidence-based support</p>
          </div>
        </div>

        <div className="p-4 space-y-4 min-h-[240px]">
          {messages.slice(0, visibleMessages).map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-sm'
                  : theme === 'dark' ? 'bg-white/5 text-zinc-300 rounded-bl-sm' : 'bg-zinc-100 text-zinc-700 rounded-bl-sm'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {visibleMessages < messages.length && (
            <div className="flex justify-start">
              <div className={`px-4 py-3 rounded-2xl rounded-bl-sm ${theme === 'dark' ? 'bg-white/5' : 'bg-zinc-100'}`}>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Feature card - varied organic shapes
function FeatureCard({ 
  feature, 
  theme,
  index = 0
}: { 
  feature: { icon: React.ElementType; title: string; desc: string }; 
  theme: 'light' | 'dark';
  index?: number;
}) {
  const Icon = feature.icon;
  
  // 6 different shapes for 6 feature cards
  const cardShapes = [
    'rounded-[1.5rem_0.75rem_1.5rem_0.75rem]',
    'rounded-[0.75rem_1.5rem_0.75rem_1.5rem]',
    'rounded-[2rem_1rem_0.5rem_1rem]',
    'rounded-[1rem_0.5rem_2rem_1rem]',
    'rounded-[0.5rem_2rem_1rem_1.5rem]',
    'rounded-[1.5rem_1rem_2rem_0.5rem]',
  ];
  
  const iconShapes = [
    'rounded-full',
    'rounded-[0.5rem_1rem_0.5rem_1rem]',
    'rounded-lg',
    'rounded-[1rem_0.5rem_1rem_0.5rem]',
    'rounded-[0.75rem]',
    'rounded-[0.25rem_0.75rem_0.25rem_0.75rem]',
  ];
  
  return (
    <div className={`p-6 ${cardShapes[index % 6]} ${
      theme === 'dark' ? 'bg-zinc-900' : 'bg-white border border-zinc-100'
    }`}>
      <div className={`w-10 h-10 ${iconShapes[index % 6]} flex items-center justify-center mb-5 ${
        theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'
      }`}>
        <Icon className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
      </div>
      <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
        {feature.title}
      </h3>
      <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
        {feature.desc}
      </p>
    </div>
  );
}


export function HomePage() {
  const { theme } = useThemeStore();
  const t = useT();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scienceFacts = [
    { icon: Brain, stat: '90%', title: t('science.brainRecovery'), desc: t('science.brainRecoveryDesc') },
    { icon: HeartPulse, stat: '72h', title: t('science.physicalDetox'), desc: t('science.physicalDetoxDesc') },
    { icon: Zap, stat: '21 days', title: t('science.habitFormation'), desc: t('science.habitFormationDesc') },
    { icon: Activity, stat: '6 months', title: t('science.cognitiveRestoration'), desc: t('science.cognitiveRestorationDesc') },
  ];

  const features = [
    { icon: Brain, title: t('features.aiPowered'), desc: t('features.aiPoweredDesc') },
    { icon: BookOpen, title: t('features.evidenceBased'), desc: t('features.evidenceBasedDesc') },
    { icon: Target, title: t('features.personalized'), desc: t('features.personalizedDesc') },
    { icon: Shield, title: t('features.privacy'), desc: t('features.privacyDesc') },
    { icon: Clock, title: t('features.availability'), desc: t('features.availabilityDesc') },
    { icon: Globe, title: t('features.language'), desc: t('features.languageDesc') },
  ];

  return (
    <main className="relative overflow-hidden">
      {/* Dynamic gradient */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${
            theme === 'dark' ? 'rgba(34, 197, 94, 0.06)' : 'rgba(34, 197, 94, 0.08)'
          }, transparent 40%)`,
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-[1rem_0.5rem_1rem_0.5rem]">
                <Microscope className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500">{t('hero.badge')}</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1]">
                <span className={theme === 'dark' ? 'text-white' : 'text-zinc-900'}>{t('hero.title1')}</span>
                <br />
                <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 bg-clip-text text-transparent">
                  {t('hero.title2')}
                </span>
                <br />
                <span className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}>{t('hero.title3')}</span>
              </h1>

              <p className={`text-lg max-w-lg leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {t('hero.description')}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/chat"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-full transition-all duration-300 shadow-lg shadow-green-600/25"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t('hero.cta')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="tel:3033"
                  className={`inline-flex items-center gap-3 px-8 py-4 rounded-full transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' 
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200'
                  }`}
                >
                  <Phone className="w-5 h-5" />
                  {t('hero.crisis')}
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-green-500" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>{t('hero.evidenceBased')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>{t('hero.anonymous')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-green-500" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>{t('hero.madeFor')}</span>
                </div>
              </div>
            </div>

            <NeuralNetwork theme={theme} />
          </div>
        </div>
      </section>

      {/* Science Facts */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-[0.5rem_1rem_0.5rem_1rem] mb-6">
              <BookOpen className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">{t('science.badge')}</span>
            </div>
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
              {t('science.title')} <span className="text-green-500">{t('science.titleHighlight')}</span>
            </h2>
            <p className={`max-w-2xl mx-auto ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {t('science.description')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {scienceFacts.map((fact, i) => (
              <ScienceFact key={fact.title} fact={fact} index={i} theme={theme} />
            ))}
          </div>
        </div>
      </section>

      {/* Recovery Timeline */}
      <section className={`relative py-32 ${theme === 'dark' ? 'bg-gradient-to-b from-transparent via-green-950/5 to-transparent' : 'bg-gradient-to-b from-transparent via-green-50/50 to-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
              {t('timeline.title')} <span className="text-green-500">{t('timeline.titleHighlight')}</span>
            </h2>
            <p className={`max-w-2xl mx-auto ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {t('timeline.description')}
            </p>
          </div>
          <RecoveryTimeline theme={theme} t={t} />
        </div>
      </section>

      {/* Chat Preview */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
              {t('chat.title')} <span className="text-green-500">{t('chat.titleHighlight')}</span>
            </h2>
            <p className={`max-w-2xl mx-auto ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {t('chat.description')}
            </p>
          </div>
          <ChatPreview theme={theme} />
        </div>
      </section>

      {/* Features */}
      <section className={`py-20 ${theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <h2 className={`text-2xl md:text-3xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
              {t('features.title')} <span className="text-green-500">{t('features.titleHighlight')}</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} theme={theme} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats - Innovative bento grid with varied shapes */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              value={3} 
              suffix="M+" 
              label={t('stats.affected')} 
              icon={Users}
              theme={theme}
              shape={0}
            />
            <StatCard 
              value={85} 
              suffix="%" 
              label={t('stats.recovery')} 
              icon={TrendingUp}
              theme={theme}
              accent
              shape={1}
            />
            <StatCard 
              value={24} 
              suffix="/7" 
              label={t('stats.available')} 
              icon={Clock}
              theme={theme}
              shape={2}
            />
            <StatCard 
              value={0} 
              suffix=" DZD" 
              label={t('stats.free')} 
              icon={Heart}
              theme={theme}
              shape={3}
            />
          </div>
        </div>
      </section>


      {/* Crisis Section - Premium Design */}
      <section className="relative py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-6">
          {/* Main container - Apple-inspired glass morphism with Sony's precision */}
          <div className={`relative overflow-hidden ${
            theme === 'dark' 
              ? 'bg-gradient-to-b from-zinc-800/40 to-zinc-900/60' 
              : 'bg-gradient-to-b from-white to-zinc-50'
          } rounded-[2.5rem] p-1`}>
            
            {/* Inner content with Samsung's bold contrast */}
            <div className={`relative rounded-[2.25rem] overflow-hidden ${
              theme === 'dark' ? 'bg-zinc-950/80' : 'bg-white'
            }`}>
              
              {/* Top section - Typography focused (Huawei elegance) */}
              <div className="px-8 md:px-16 pt-12 md:pt-16 pb-8">
                <p className={`text-sm font-medium tracking-[0.2em] uppercase mb-4 ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`}>
                  {t('crisis.note')}
                </p>
                
                <h2 className={`text-3xl md:text-5xl font-semibold tracking-tight leading-[1.1] mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-zinc-900'
                }`}>
                  {t('crisis.title')}
                </h2>
                
                <p className={`text-lg md:text-xl leading-relaxed max-w-2xl ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                }`}>
                  {t('crisis.description')}
                </p>
              </div>

              {/* Divider - Minimal line (Apple style) */}
              <div className="px-8 md:px-16">
                <div className={`h-px ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
              </div>

              {/* Bottom section - CTA (Samsung boldness meets Sony precision) */}
              <div className="px-8 md:px-16 py-8 md:py-12">
                <a 
                  href="tel:3033" 
                  className="group flex items-center justify-between"
                >
                  <div className="flex items-center gap-6">
                    {/* Icon container - Huawei's refined circles */}
                    <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-105 ${
                      theme === 'dark' 
                        ? 'bg-green-500' 
                        : 'bg-green-600'
                    }`}>
                      <Phone className="w-7 h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    
                    {/* Number display - Apple's confident typography */}
                    <div>
                      <span className={`block text-4xl md:text-6xl font-bold tracking-tight transition-colors ${
                        theme === 'dark' 
                          ? 'text-white group-hover:text-green-400' 
                          : 'text-zinc-900 group-hover:text-green-600'
                      }`}>
                        3033
                      </span>
                      <span className={`text-sm md:text-base ${
                        theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                      }`}>
                        {t('crisis.cta')}
                      </span>
                    </div>
                  </div>

                  {/* Arrow indicator - Sony's subtle motion */}
                  <div className={`hidden md:flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 group-hover:translate-x-2 ${
                    theme === 'dark' 
                      ? 'bg-zinc-800 group-hover:bg-zinc-700' 
                      : 'bg-zinc-100 group-hover:bg-zinc-200'
                  }`}>
                    <ArrowRight className={`w-6 h-6 ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                    }`} />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-[1.25rem_0.75rem_1.25rem_0.75rem] mb-8">
            <Leaf className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500">{t('cta.badge')}</span>
          </div>
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
            {t('cta.title')}
          </h2>
          <p className={`text-lg mb-8 max-w-2xl mx-auto ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {t('cta.description')}
          </p>
          <Link
            to="/chat"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-lg font-medium rounded-full transition-all duration-300 shadow-lg shadow-green-600/25"
          >
            <Brain className="w-6 h-6" />
            {t('cta.button')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 ${theme === 'dark' ? 'border-t border-white/5' : 'border-t border-zinc-200 bg-zinc-50'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-3 mb-4">
                {/* Logo mark */}
                <svg viewBox="0 0 36 36" fill="none" className="w-9 h-9">
                  <path 
                    d="M18 2C18 2 32 8 32 20C32 28 26 34 18 34C10 34 4 28 4 20C4 8 18 2 18 2Z"
                    className={theme === 'dark' ? 'fill-green-500' : 'fill-green-600'}
                  />
                  <path d="M18 8L12 24H15L18 16L21 24H24L18 8Z" fill={theme === 'dark' ? '#09090b' : 'white'} />
                  <circle cx="18" cy="28" r="2" fill={theme === 'dark' ? '#09090b' : 'white'} />
                </svg>
                <div className="flex items-baseline gap-1">
                  <span className={`text-[22px] font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>amal</span>
                  <span className={`text-[10px] font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>dz</span>
                </div>
              </Link>
              <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-600'}`}>
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{t('footer.support')}</h4>
              <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                <li><Link to="/chat" className="hover:text-green-500 transition-colors">{t('footer.startChat')}</Link></li>
                <li><a href="tel:3033" className="hover:text-green-500 transition-colors">{t('footer.crisisLine')}</a></li>
                <li><Link to="/resources" className="hover:text-green-500 transition-colors">{t('footer.resources')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{t('footer.learn')}</h4>
              <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                <li><Link to="/science" className="hover:text-green-500 transition-colors">{t('footer.addictionScience')}</Link></li>
                <li><Link to="/recovery" className="hover:text-green-500 transition-colors">{t('footer.recoveryStages')}</Link></li>
                <li><Link to="/techniques" className="hover:text-green-500 transition-colors">{t('footer.copingTechniques')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{t('footer.languages')}</h4>
              <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                <li><button className="hover:text-green-500 transition-colors font-arabic">العربية</button></li>
                <li><button className="hover:text-green-500 transition-colors">Français</button></li>
                <li><button className="hover:text-green-500 transition-colors">Darija</button></li>
                <li><button className="hover:text-green-500 transition-colors">English</button></li>
              </ul>
            </div>
          </div>
          <div className={`pt-8 flex flex-col md:flex-row justify-between items-center gap-4 ${theme === 'dark' ? 'border-t border-white/5' : 'border-t border-zinc-200'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>
              {t('footer.copyright')}
            </p>
            <div className={`flex items-center gap-4 text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>
              <Users className="w-4 h-4" />
              <span>{t('footer.tagline')}</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
