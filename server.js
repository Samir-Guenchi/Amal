require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// In-memory conversation storage (replace with database in production)
const conversations = new Map();

// Chat endpoint - ready for RAG integration
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Valid message is required' });
    }

    if (message.length > 4000) {
      return res.status(400).json({ error: 'Message too long (max 4000 characters)' });
    }

    const convId = conversationId || generateConversationId();
    
    // Store conversation history
    if (!conversations.has(convId)) {
      conversations.set(convId, []);
    }
    
    const history = conversations.get(convId);
    history.push({ role: 'user', content: message, timestamp: new Date().toISOString() });

    // TODO: Integrate with your RAG module here
    // Example structure for RAG integration:
    /*
    const ragResponse = await fetch(process.env.RAG_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RAG_API_KEY}`
      },
      body: JSON.stringify({
        query: message,
        conversationId: convId,
        history: history.slice(-10) // Send last 10 messages for context
      })
    });
    
    if (!ragResponse.ok) {
      throw new Error(`RAG API error: ${ragResponse.status}`);
    }
    
    const data = await ragResponse.json();
    const botMessage = data.response || data.message;
    */

    // Placeholder response with contextual awareness until RAG is integrated
    const botMessage = generateContextualResponse(message, history);
    
    history.push({ role: 'bot', content: botMessage, timestamp: new Date().toISOString() });

    // Clean up old conversations (keep last 100)
    if (conversations.size > 100) {
      const oldestKey = conversations.keys().next().value;
      conversations.delete(oldestKey);
    }

    const response = {
      message: botMessage,
      conversationId: convId,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'عذراً، حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.'
    });
  }
});

// Get conversation history
app.get('/api/conversation/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!conversations.has(id)) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const history = conversations.get(id);
    res.json({ conversationId: id, messages: history });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    activeConversations: conversations.size,
    ragConfigured: !!process.env.RAG_API_ENDPOINT
  });
});

// Generate conversation ID
function generateConversationId() {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Temporary contextual response generator (replace with RAG)
function generateContextualResponse(message, history) {
  const lowerMessage = message.toLowerCase();
  
  // Algerian dialect and Arabic keywords
  const greetings = ['سلام', 'مرحبا', 'صباح', 'مساء', 'كيفاش', 'كيف حالك', 'hello', 'hi', 'salam'];
  const helpKeywords = ['مساعدة', 'ساعدني', 'نحتاج', 'help', 'محتاج'];
  const stressKeywords = ['ضغط', 'قلق', 'خايف', 'stress', 'anxiety', 'متوتر'];
  const drugKeywords = ['مخدرات', 'إدمان', 'drugs', 'addiction', 'متعاطي'];
  const friendKeywords = ['صاحبي', 'صديقي', 'قريب', 'friend', 'أخي'];
  const preventionKeywords = ['وقاية', 'حماية', 'prevention', 'protect', 'نحمي'];
  const centerKeywords = ['مركز', 'مستشفى', 'center', 'hospital', 'وين نلقى'];

  // Check for greeting
  if (greetings.some(word => lowerMessage.includes(word)) && history.length <= 2) {
    return `أهلاً وسهلاً بيك! 🌟

أنا أمل، مساعدك الشخصي للدعم النفسي والوقاية من المخدرات. موجود هنا باش نساعدك ونسمعك بكل سرية واحترام.

كيفاش نقدر نساعدك اليوم؟ تقدر تحكيلي على:
• أي ضغط نفسي أو قلق تحس بيه
• معلومات على الوقاية من المخدرات
• كيفاش تساعد شخص قريب منك
• مراكز الدعم في الجزائر

تذكر: كل كلامك معايا محمي بسرية تامة. 🔒`;
  }

  // Check for stress/anxiety
  if (stressKeywords.some(word => lowerMessage.includes(word))) {
    return `نفهمك ونحس بيك. الضغط النفسي والقلق حاجة طبيعية، وما تخافش، راك ماشي وحدك. 💚

**بعض النصائح اللي تنجم تساعدك:**

1. **تنفس عميق**: خذ نفس عميق من أنفك لمدة 4 ثواني، احبسو 4 ثواني، وطلعو من فمك 6 ثواني. كرر هذا 5 مرات.

2. **تكلم مع حد تثق فيه**: ما تخليش الأفكار تتراكم. الكلام يخفف.

3. **نشاط بدني**: حتى مشي 15 دقيقة يقدر يحسن مزاجك.

4. **نوم كافي**: حاول تنام 7-8 ساعات كل ليلة.

إذا حسيت أن الضغط كبير برشا، ما تترددش تتصل بالخط الأخضر: **3033** (مجاني ومتاح 24/7)

حاب نحكيو أكثر على الموضوع؟`;
  }

  // Check for drug-related questions
  if (drugKeywords.some(word => lowerMessage.includes(word))) {
    return `موضوع مهم برشا، وشجاع منك أنك تسأل. 💪

**حقائق مهمة على المخدرات:**

• **الإدمان مرض**: مش ضعف أو نقص في الإرادة. يقدر يصيب أي واحد.

• **التعافي ممكن**: آلاف الناس في الجزائر تعافوا ورجعوا لحياة طبيعية.

• **الوقاية أسهل من العلاج**: فهم المخاطر والضغوطات يساعد في الحماية.

**علامات التحذير:**
- تغيير مفاجئ في السلوك
- إهمال المسؤوليات
- مشاكل مالية غير مبررة
- عزلة اجتماعية

**للمساعدة الفورية:**
📞 الخط الأخضر: **3033**
🏥 مراكز علاج الإدمان متوفرة في كل ولايات الجزائر

عندك سؤال محدد حاب نجاوبوك عليه؟`;
  }

  // Check for helping a friend
  if (friendKeywords.some(word => lowerMessage.includes(word))) {
    return `يشرفك أنك تهتم بصاحبك. هذا دليل على قلب كبير. ❤️

**كيفاش تساعد شخص قريب منك:**

1. **اسمعو بدون حكم**: خليه يحس أنك موجود ليه بدون ما تنتقدو.

2. **عبر على قلقك بلطف**: قولو "أنا قلقان عليك وحاب نساعدك" بدلاً من "راك غالط".

3. **اقترح المساعدة المهنية**: قولو على الخط الأخضر 3033 أو مراكز الدعم.

4. **ما تحاولش تحل المشكلة وحدك**: الإدمان يحتاج متخصصين.

5. **احمي نفسك**: ما تخليش مشاكلو تأثر على صحتك النفسية.

**مهم:** ما تقدرش تجبر حد يتعالج. يلزم يكون هو مستعد.

حاب نحكيو أكثر على الموضوع؟`;
  }

  // Check for prevention info
  if (preventionKeywords.some(word => lowerMessage.includes(word))) {
    return `الوقاية هي أحسن استثمار في صحتك! 🛡️

**استراتيجيات الوقاية:**

**1. بناء مهارات الحياة:**
- تعلم كيفاش تتعامل مع الضغط
- طور ثقتك في نفسك
- تعلم قول "لا" بثقة

**2. بيئة صحية:**
- احط روحك مع ناس إيجابيين
- ابعد على الأماكن والمواقف الخطيرة
- شارك في أنشطة رياضية وثقافية

**3. معرفة المخاطر:**
- فهم أضرار المخدرات على الجسم والعقل
- اعرف علامات التحذير المبكرة
- تعلم على الضغوطات الاجتماعية

**4. دعم عائلي وأصدقاء:**
- تواصل مع عائلتك
- كون صداقات صحية
- اطلب المساعدة وقت اللزوم

**في الجزائر:**
- برامج توعية في المدارس والجامعات
- مراكز الشباب والرياضة
- جمعيات المجتمع المدني

عندك سؤال محدد على الوقاية؟`;
  }

  // Check for centers/resources
  if (centerKeywords.some(word => lowerMessage.includes(word))) {
    return `في الجزائر، عندنا مراكز متخصصة في كل الولايات. 🏥

**مراكز الدعم الرئيسية:**

**1. المراكز المتوسطة لعلاج الإدمان (CISA)**
- موجودة في كل ولاية
- خدمات مجانية
- فريق متخصص (أطباء، نفسانيين، مساعدين اجتماعيين)

**2. الخط الأخضر: 3033**
- مجاني ومتاح 24/7
- سرية تامة
- استشارات وتوجيه

**3. مستشفيات الصحة النفسية:**
- أقسام متخصصة في علاج الإدمان
- برامج إعادة التأهيل

**4. الجمعيات:**
- جمعية "البدر" للوقاية من الإدمان
- جمعيات محلية في كل ولاية

**للحصول على معلومات دقيقة:**
- اتصل بـ 3033
- زور أقرب مركز صحي
- تواصل مع مديرية الصحة في ولايتك

حاب معلومات أكثر على مركز معين؟`;
  }

  // Default helpful response
  return `شكراً على ثقتك. أنا هنا باش نسمعك ونساعدك. 💚

نقدر نحكيو على:
• **الدعم النفسي**: إذا كنت تحس بضغط أو قلق
• **معلومات على المخدرات**: أضرارها وكيفاش نتجنبوها
• **مساعدة الآخرين**: كيفاش تساعد شخص قريب منك
• **مراكز الدعم**: وين تلقى مساعدة مهنية في الجزائر

**تذكر دائماً:**
- راك ماشي وحدك
- طلب المساعدة علامة قوة مش ضعف
- التعافي ممكن والأمل موجود

📞 **للطوارئ: 3033** (مجاني 24/7)

كيفاش نقدر نساعدك بالضبط؟`;
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'عذراً، حدث خطأ في الخادم.'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   أمل - Amal Support Chatbot          ║
║   Server running on port ${PORT}         ║
║   http://localhost:${PORT}                ║
║                                        ║
║   Made with ❤️ in Algeria 🇩🇿          ║
╚════════════════════════════════════════╝
  `);
  
  if (process.env.RAG_API_ENDPOINT) {
    console.log('✓ RAG module configured');
  } else {
    console.log('⚠ RAG module not configured (using placeholder responses)');
    console.log('  Set RAG_API_ENDPOINT in .env to enable RAG integration');
  }
});
