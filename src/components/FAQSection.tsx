import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  DollarSign, 
  Brain, 
  Mail, 
  MessageCircle, 
  Send, 
  FileText, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'basics' | 'qualifications' | 'how-it-works' | 'tests-tracker';
  categoryLabel: string;
  question: string;
  shortAnswer: string;
  detailedAnswer: string[];
  tips?: string;
  badge?: string;
}

const FAQ_DATA: FAQItem[] = [
  // CATEGORY 1: THE BASICS
  {
    id: 'faq-1',
    category: 'basics',
    categoryLabel: 'The Basics',
    badge: 'Core Purpose',
    question: 'What is the main purpose of this app?',
    shortAnswer: 'This app is a real-time radar that finds flexible, high-paying work-from-home jobs helping train artificial intelligence or assisting busy professionals.',
    detailedAnswer: [
      'Artificial intelligence systems like ChatGPT, Gemini, and Claude do not learn by magic—they learn from examples written and evaluated by real people.',
      'Because AI frequently makes mistakes, invents false facts (called hallucinations), or writes buggy code, top tech companies pay real people between $20 and $80+ per hour to test, grade, and improve these AI systems.',
      'Instead of having to manually search 15 different company websites every day, this app does all the hard work for you. It scans the web every morning at 09:00 AM, filters out scams and low-paying gigs, and puts all verified, high-paying opportunities in one easy place.'
    ],
    tips: 'Think of this app like an automated job finder robot that watches the market 24/7 so you never miss a new opening.'
  },
  {
    id: 'faq-2',
    category: 'basics',
    categoryLabel: 'The Basics',
    badge: 'Explain Like I\'m 15',
    question: 'What do words like "AI Data Annotation" and "RLHF" actually mean?',
    shortAnswer: 'They are simple terms for teaching, grading, and correcting computers so they become smarter and more helpful.',
    detailedAnswer: [
      '🏷️ Data Annotation (Labeling): Imagine teaching a toddler what a cat is by pointing to 100 pictures of cats. Data annotation is doing that for computers. You might highlight text, label objects in images, or tag audio clips.',
      '📝 RLHF (Reinforcement Learning from Human Feedback): Think of yourself as a school teacher grading student essays. The AI creates two different answers to a user prompt, and your job is to choose which answer is more accurate, polite, and helpful, and write a sentence explaining why.',
      '🛡️ AI Safety & Red Teaming: You test the AI with tricky or confusing questions to make sure it doesn’t say dangerous, offensive, or incorrect things.',
      '💻 Code & STEM Annotation: For people who like coding or math, you review code written by an AI to verify if it compiles and runs without bugs.'
    ],
    tips: 'You do not need to build AI algorithms to do this—you are simply acting as the human judge and coach.'
  },
  {
    id: 'faq-3',
    category: 'basics',
    categoryLabel: 'The Basics',
    badge: 'Virtual Assistant',
    question: 'What are "AI Virtual Assistant" jobs?',
    shortAnswer: 'Remote assistant roles where you help business leaders organize their work, using AI tools like ChatGPT to work faster.',
    detailedAnswer: [
      'A Virtual Assistant (VA) is someone who works remotely from a laptop doing everyday tasks for busy founders, doctors, or companies.',
      'Common tasks include organizing emails, scheduling calendar meetings, booking travel, taking notes, or researching answers online.',
      'Modern "AI-assisted" VAs use tools like ChatGPT, Claude, and automation software to write emails faster and organize data in minutes. Because of this high efficiency, top VA agencies (like Athena, Double, and Belay) pay $25 to $45/hr.'
    ]
  },

  // CATEGORY 2: QUALIFICATIONS & PAY
  {
    id: 'faq-4',
    category: 'qualifications',
    categoryLabel: 'Pay & Qualifications',
    badge: 'No Degree Required',
    question: 'Do I need a university degree or years of experience?',
    shortAnswer: 'No! Many beginner roles only require good English skills, critical thinking, and the ability to follow instructions carefully.',
    detailedAnswer: [
      'For general annotation, conversational testing, and entry-level virtual assistant tasks, companies care about your thinking skills and attention to detail—not what school you went to.',
      'When you apply, you usually take a short online test (like writing a clear explanation or fact-checking an article). If you pass, you are in!',
      'Some specialized roles (like advanced Python coding or college-level calculus) do require expertise, but there are plenty of generalist roles that anyone with good reading comprehension can do.'
    ],
    tips: 'The most important skill is reading the guidelines word-for-word. AI companies fail applicants who rush and ignore the rubric instructions.'
  },
  {
    id: 'faq-5',
    category: 'qualifications',
    categoryLabel: 'Pay & Qualifications',
    badge: 'Safety & Trust',
    question: 'Is this app free, and how do I know these jobs are legitimate?',
    shortAnswer: 'The app is 100% free, and every employer featured on our radar is a verified, established company with a proven payout history.',
    detailedAnswer: [
      'Zero Fees: We will NEVER ask you for money or your credit card. Legitimate employers never charge you money to apply or work for them.',
      'Verified Companies: Platforms like Scale AI, Outlier, Alignerr (by Labelbox), DataAnnotation.tech, Athena, and Double are well-known international companies backed by major tech firms.',
      'Direct Payments: When you get hired, the company pays you directly to your bank account or PayPal account on a regular schedule (usually weekly or bi-weekly).'
    ],
    tips: 'Rule of thumb: If any company on the internet asks you to pay for "training materials" or "starter kits", run away! Real jobs pay YOU.'
  },
  {
    id: 'faq-6',
    category: 'qualifications',
    categoryLabel: 'Pay & Qualifications',
    question: 'How much can I earn, and how flexible are the hours?',
    shortAnswer: 'Pay ranges from $20 to $65+/hour, and you can usually choose your own hours from anywhere with an internet connection.',
    detailedAnswer: [
      'Typical Hourly Rates:',
      '• General Writing & LLM Evaluation: $20 – $35 / hour',
      '• Virtual Assistant & Executive Support: $25 – $45 / hour',
      '• Coding, Math, and STEM Annotation: $40 – $75 / hour',
      '• AI Safety & Red Teaming: $50 – $95 / hour',
      'Flexible Scheduling: Most annotation platforms use task-based queues. You can log in at 8 PM after school or work, do 2 hours of tasks, and log off. You are not forced to work 9-to-5 unless you take a full-time contract.'
    ]
  },

  // CATEGORY 3: HOW THE APP WORKS & ALERTS
  {
    id: 'faq-7',
    category: 'how-it-works',
    categoryLabel: 'How It Works & Alerts',
    badge: 'Automation',
    question: 'How does the automated scanner work?',
    shortAnswer: 'Our background engine automatically inspects the job boards of top AI companies every morning, checking for new job drops.',
    detailedAnswer: [
      '1. Scanning: At 09:00 AM every day (or whenever you click "Scan Now"), the system visits official hiring portals.',
      '2. Filtering: It checks the pay rate, required skills, remote eligibility, and whether an assessment test is required.',
      '3. Matching: If a job matches your minimum pay rate setting (for example, $25+/hr), it flags the job as a match.',
      '4. Notification: It posts the role to your feed and queues alerts for your chosen channels.'
    ]
  },
  {
    id: 'faq-8',
    category: 'how-it-works',
    categoryLabel: 'How It Works & Alerts',
    badge: 'Multi-Channel',
    question: 'How do I get alerts on Email, WhatsApp, and Telegram?',
    shortAnswer: 'Go to the "Alerts & Automation" tab to switch on the channels you want alerts delivered to.',
    detailedAnswer: [
      '📧 Email Digest: Get a neat, organized summary sent to your inbox once a day or whenever new jobs appear.',
      '💬 WhatsApp Alerts: Enter your phone number to receive alerts formatted with bullet points, pay rates, and direct 1-click apply links right in WhatsApp.',
      '✈️ Telegram Channel: Put in your Telegram channel handle (like @MyJobAlerts) or connect a bot to broadcast new jobs directly to your community or study group.',
      '⚡ 1-Click Multi-Blast: You can even hit "Blast to All Channels Now" to send top matching jobs across all three channels at once!'
    ],
    tips: 'You can also click the WhatsApp or Telegram icon on any individual job card to instantly forward just that single job to a friend.'
  },
  {
    id: 'faq-9',
    category: 'how-it-works',
    categoryLabel: 'How It Works & Alerts',
    question: 'How do I filter jobs to find what is best for me?',
    shortAnswer: 'Use the quick filter bar at the top of the Jobs Feed to narrow down by pay, domain, or newness.',
    detailedAnswer: [
      'Search Bar: Type any keyword, like "Python", "Writing", "Biology", or "Part-time".',
      'Minimum Rate Slider: Set the slider to $30 or $40/hr to hide lower-paying tasks.',
      'Domain Filter: Select specific fields like "RLHF & LLM Evaluation", "Code & STEM", or "Virtual Assistant".',
      'Fresh Drops Only: Check this box to only see jobs discovered in the last 24 hours.'
    ]
  },

  // CATEGORY 4: ASSESSMENTS & TRACKER
  {
    id: 'faq-10',
    category: 'tests-tracker',
    categoryLabel: 'Tests & Career Tracker',
    badge: 'Secret Weapon',
    question: 'What is the "Test Tips" button, and how does it help me?',
    shortAnswer: 'It is an AI test coach that gives you specific advice on how to pass the company’s entrance screening exam.',
    detailedAnswer: [
      'Almost every company (like Outlier or Scale AI) makes you take an initial test before giving you paid work. Over 70% of people fail simply because they do not understand the grading rubric!',
      'When you click "Test Tips" on any job card, our app reveals:',
      '• Exact Rubrics: What the graders look for (factuality, tone, formatting, logic).',
      '• Common Mistakes: Why people fail and how to avoid those traps.',
      '• Tailored Pitch: A customized cover statement highlighting your strengths for that exact role.'
    ],
    tips: 'Always review the test tips BEFORE opening the application link. It can easily double your chance of passing.'
  },
  {
    id: 'faq-11',
    category: 'tests-tracker',
    categoryLabel: 'Tests & Career Tracker',
    badge: 'Organize',
    question: 'How do I use the Career Tracker?',
    shortAnswer: 'It is your personal command center for tracking every job you apply for so nothing slips through the cracks.',
    detailedAnswer: [
      '1. Quick Add: Click "Track" on any job card to add it to your pipeline.',
      '2. Update Status: Move your application between stages: Saved → Applied → Assessment → Interview → Offer.',
      '3. Deadlines & Notes: Jot down assessment deadlines, test results, and login links so you never forget to take an exam.',
      '4. Projected Earnings: The tracker automatically calculates how much money you could make per week based on your planned hours and hourly rate.'
    ]
  },
  {
    id: 'faq-12',
    category: 'tests-tracker',
    categoryLabel: 'Tests & Career Tracker',
    question: 'What should I do if my application gets rejected?',
    shortAnswer: 'Do not be discouraged! These platforms hire continually and there are multiple different companies looking for people every day.',
    detailedAnswer: [
      'It is completely normal to not pass every single assessment test. The test rubrics are very strict and sometimes automated.',
      'The beauty of AI annotation is that there are many different companies (Outlier, Scale AI, Alignerr, DataAnnotation, Athena, OneForma, Mercor) running different projects.',
      'Apply to 3 or 4 platforms at the same time. If one doesn’t work out, another one often will, and once you get approved on one platform, you can work steady hours.'
    ]
  }
];

interface FAQSectionProps {
  onNavigateToJobs: () => void;
  onNavigateToAlerts: () => void;
  onNavigateToTracker: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  onNavigateToJobs,
  onNavigateToAlerts,
  onNavigateToTracker
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['faq-1', 'faq-2']));

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(FAQ_DATA.map(f => f.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Filtered FAQs
  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQ = item.question.toLowerCase().includes(q);
        const matchesShort = item.shortAnswer.toLowerCase().includes(q);
        const matchesDetailed = item.detailedAnswer.some(a => a.toLowerCase().includes(q));
        const matchesTips = item.tips ? item.tips.toLowerCase().includes(q) : false;
        if (!matchesQ && !matchesShort && !matchesDetailed && !matchesTips) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Hero Explainer Header */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 rounded-2xl border border-zinc-800 p-6 sm:p-8 md:p-10 relative overflow-hidden shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#C8FF00]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-xs font-mono text-[#C8FF00] font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>HELP CENTER &amp; BEGINNER GUIDE</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight font-heading">
            Everything You Need To Know <br className="hidden sm:block" />
            <span className="text-[#C8FF00]">About This App &amp; AI Jobs</span>
          </h1>

          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            New to AI Data Annotation, RLHF, or remote Virtual Assistant work? Here is a clear, simple guide explaining how this app works, why companies pay real people to teach AI, and how you can get started earning from home.
          </p>

          {/* 3 Step Quick Explainer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-[#C8FF00] flex items-center justify-center font-black shrink-0 font-mono text-xs border border-zinc-800">
                01
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase text-white font-mono">Daily Auto-Scan</h3>
                <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                  Our server scans verified AI career boards (Scale AI, Outlier, Athena, etc.) every morning.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-[#C8FF00] flex items-center justify-center font-black shrink-0 font-mono text-xs border border-zinc-800">
                02
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase text-white font-mono">Instant Alerts</h3>
                <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                  Receive curated drops via Email, WhatsApp messages, or Telegram channels above your rate target.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-[#C8FF00] flex items-center justify-center font-black shrink-0 font-mono text-xs border border-zinc-800">
                03
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase text-white font-mono">Ace Tests &amp; Track</h3>
                <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                  Use built-in AI test tips to pass platform exams and manage your applications in one tracker.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Category Bar */}
      <div className="space-y-4">
        {/* Search input and Expand controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-faq-search"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g., 'degree', 'how much pay', 'WhatsApp', 'RLHF', 'tests')..."
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#C8FF00] transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={expandAll}
              className="text-[11px] font-mono uppercase px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-[11px] font-mono uppercase px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Questions', count: FAQ_DATA.length },
            { id: 'basics', label: '💡 The Basics', count: FAQ_DATA.filter(f => f.category === 'basics').length },
            { id: 'qualifications', label: '💰 Pay & Qualifications', count: FAQ_DATA.filter(f => f.category === 'qualifications').length },
            { id: 'how-it-works', label: '📡 How It Works & Alerts', count: FAQ_DATA.filter(f => f.category === 'how-it-works').length },
            { id: 'tests-tracker', label: '📝 Tests & Career Tracker', count: FAQ_DATA.filter(f => f.category === 'tests-tracker').length }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 border ${
                selectedCategory === cat.id
                  ? 'bg-[#C8FF00] text-black border-[#C8FF00]'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedCategory === cat.id ? 'bg-black text-[#C8FF00]' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-3">
        {filteredFAQs.length === 0 ? (
          <div className="py-16 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800 p-6">
            <HelpCircle className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold uppercase text-white font-mono">No matching answers found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              We couldn't find any questions matching "{searchQuery}". Try searching for words like "pay", "degree", "test", or "scanner".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-white rounded-xl uppercase font-bold transition"
            >
              Reset Search
            </button>
          </div>
        ) : (
          filteredFAQs.map(item => {
            const isExpanded = expandedIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'bg-zinc-900/90 border-zinc-700 shadow-lg'
                    : 'bg-zinc-900/50 hover:bg-zinc-900/80 border-zinc-800/80'
                }`}
              >
                {/* Accordion Header Button */}
                <button
                  id={`btn-faq-toggle-${item.id}`}
                  onClick={() => toggleExpand(item.id)}
                  className="w-full text-left p-5 flex items-start justify-between gap-4 cursor-pointer group"
                  aria-expanded={isExpanded}
                >
                  <div className="space-y-1.5 pr-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#C8FF00] bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                        {item.categoryLabel}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#C8FF00] transition-colors leading-snug">
                      {item.question}
                    </h3>
                    {!isExpanded && (
                      <p className="text-xs text-zinc-400 line-clamp-1 mt-1 font-sans">
                        {item.shortAnswer}
                      </p>
                    )}
                  </div>

                  <div className={`w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-white transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 bg-[#C8FF00] text-black' : ''
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Accordion Expanded Body */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-zinc-800/80 space-y-4 animate-in fade-in duration-200">
                    {/* Short Takeaway Banner */}
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-mono text-[#C8FF00] flex items-start gap-2.5">
                      <Zap className="w-4 h-4 text-[#C8FF00] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-sans text-xs">Quick Answer:</strong>
                        <span className="text-zinc-300 font-sans">{item.shortAnswer}</span>
                      </div>
                    </div>

                    {/* Detailed Points */}
                    <div className="space-y-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                      {item.detailedAnswer.map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))}
                    </div>

                    {/* Pro Tip Box if available */}
                    {item.tips && (
                      <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-emerald-200 block font-mono text-[11px] uppercase tracking-wider">Top Tip for Beginners:</strong>
                          <span>{item.tips}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Quick-Action Roadmap */}
      <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800 p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-[0.25em] text-[#C8FF00] block">
            READY TO TAKE ACTION?
          </span>
          <h2 className="text-xl font-bold uppercase text-white font-heading mt-0.5">
            Your 3 Next Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-[#C8FF00] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white uppercase">1. Browse Available Jobs</h4>
              <p className="text-xs text-zinc-400 leading-normal">
                Check today’s live feed of vetted AI Annotation, RLHF, and Virtual Assistant openings.
              </p>
            </div>
            <button
              onClick={onNavigateToJobs}
              className="w-full py-2 bg-[#C8FF00] hover:bg-[#b8eb00] text-black font-bold uppercase text-xs font-mono rounded-lg transition inline-flex items-center justify-center gap-1.5"
            >
              <span>Explore Jobs Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-emerald-400 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white uppercase">2. Turn On Alerts</h4>
              <p className="text-xs text-zinc-400 leading-normal">
                Connect your WhatsApp number or email so you never miss high-paying roles that match your skills.
              </p>
            </div>
            <button
              onClick={onNavigateToAlerts}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-xs font-mono rounded-lg transition inline-flex items-center justify-center gap-1.5"
            >
              <span>Set Up Alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-sky-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white uppercase">3. Track Applications</h4>
              <p className="text-xs text-zinc-400 leading-normal">
                Organize tests, note assessment dates, and monitor your expected weekly income in one place.
              </p>
            </div>
            <button
              onClick={onNavigateToTracker}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-xs font-mono rounded-lg transition inline-flex items-center justify-center gap-1.5"
            >
              <span>Open Career Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
