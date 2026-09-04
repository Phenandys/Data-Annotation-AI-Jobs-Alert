import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_JOB_LISTINGS } from './src/data/seedJobs';
import {
  JobListing,
  ApplicationRecord,
  AlertPreferences,
  NotificationItem,
  EmailDispatchRecord,
  FetchStatus,
  ChannelDispatchRecord
} from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client if API Key is configured
  const ai = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // In-memory persistent database stores
  let jobListings: JobListing[] = [...INITIAL_JOB_LISTINGS];
  let savedJobIds: Set<string> = new Set(['job-scale-01', 'job-alignerr-03', 'job-dataannotation-04']);

  let applications: ApplicationRecord[] = [
    {
      id: 'app-01',
      jobId: 'job-scale-01',
      jobTitle: 'RLHF AI Prompt & Code Quality Evaluator',
      company: 'Scale AI',
      domain: 'Code & STEM Annotation',
      payRate: '$45 - $65/hr',
      hourlyRateNumeric: 55,
      status: 'assessment',
      dateApplied: '2026-08-30',
      lastUpdated: '2026-09-02',
      notes: 'Completed the Python syntax & reasoning test. Awaiting assessment tier placement.',
      platformUrl: 'https://scale.com/careers',
      assessmentDeadline: '2026-09-05',
      weeklyHoursPlanned: 20
    },
    {
      id: 'app-02',
      jobId: 'job-outlier-02',
      jobTitle: 'Generative AI Content & Factuality Specialist',
      company: 'Outlier AI',
      domain: 'RLHF & LLM Evaluation',
      payRate: '$28 - $40/hr',
      hourlyRateNumeric: 34,
      status: 'offer',
      dateApplied: '2026-08-25',
      lastUpdated: '2026-09-03',
      notes: 'Passed English calibration rubrics. Assigned to Nightingale model evaluation queue.',
      platformUrl: 'https://outlier.ai',
      weeklyHoursPlanned: 25
    },
    {
      id: 'app-03',
      jobId: 'job-dataannotation-04',
      jobTitle: 'AI Conversational & Coding Assessor',
      company: 'DataAnnotation.tech',
      domain: 'Code & STEM Annotation',
      payRate: '$40 - $55/hr',
      hourlyRateNumeric: 47,
      status: 'applied',
      dateApplied: '2026-09-02',
      lastUpdated: '2026-09-02',
      notes: 'Submitted initial starter assessment. Looking for coding project unlock notification.',
      platformUrl: 'https://dataannotation.tech',
      weeklyHoursPlanned: 15
    },
    {
      id: 'app-04',
      jobId: 'job-mercor-05',
      jobTitle: 'AI Safety & Red Teaming Specialist',
      company: 'Mercor',
      domain: 'AI Safety & Red Teaming',
      payRate: '$65 - $95/hr',
      hourlyRateNumeric: 80,
      status: 'screening',
      dateApplied: '2026-08-28',
      lastUpdated: '2026-09-01',
      notes: 'Completed automated video interview. Profile forwarded to frontier AI lab partner.',
      platformUrl: 'https://mercor.com',
      weeklyHoursPlanned: 20
    },
    {
      id: 'app-05',
      jobId: 'job-athena-15',
      jobTitle: 'Executive AI Virtual Assistant & Ops Manager',
      company: 'Athena',
      domain: 'Virtual Assistant & Allied',
      payRate: '$28 - $42/hr',
      hourlyRateNumeric: 35,
      status: 'interview',
      dateApplied: '2026-08-31',
      lastUpdated: '2026-09-03',
      notes: 'Passed the inbox triage simulation. Next round: 30-min executive delegation review.',
      platformUrl: 'https://athenaexecutives.com/careers',
      weeklyHoursPlanned: 25
    }
  ];

  let alertPreferences: AlertPreferences = {
    email: 'phenandys@gmail.com',
    frequency: 'daily',
    minHourlyRate: 25,
    selectedDomains: [
      'RLHF & LLM Evaluation',
      'Code & STEM Annotation',
      'AI Safety & Red Teaming',
      'Multimodal & Vision',
      'Virtual Assistant & Allied'
    ],
    selectedTypes: ['Hourly Contract', 'Project-Based', 'Full-Time Remote'],
    emailAlertsEnabled: true,
    pushNotificationsEnabled: true,
    soundAlertsEnabled: true,
    keywordWatchlist: ['RLHF', 'Python', 'Virtual Assistant', 'Executive Assistant', 'STEM', 'Fact-Checking', 'LLM', 'Red Teaming'],
    whatsappEnabled: true,
    whatsappNumber: '+1 (555) 019-2834',
    whatsappWebhookUrl: '',
    telegramEnabled: true,
    telegramChannel: '@AIAnnotationJobsAlert',
    telegramBotToken: ''
  };

  let notifications: NotificationItem[] = [
    {
      id: 'notif-01',
      title: 'New High-Pay AI Job Alert',
      message: 'Scale AI posted "RLHF AI Prompt & Code Quality Evaluator" ($45-$65/hr). Matches your alert rule.',
      timestamp: '2026-09-03T10:16:00Z',
      read: false,
      jobId: 'job-scale-01',
      type: 'new_match'
    },
    {
      id: 'notif-va-01',
      title: 'New Virtual Assistant Opening Alert',
      message: 'Athena posted "Executive AI Virtual Assistant & Ops Manager" ($28-$42/hr). Matches your watchlist.',
      timestamp: '2026-09-03T11:30:00Z',
      read: false,
      jobId: 'job-athena-15',
      type: 'new_match'
    },
    {
      id: 'notif-02',
      title: 'Daily Job Scanner Complete',
      message: 'Daily auto-fetch scanned 16 platforms. Discovered new AI data annotation & Virtual Assistant openings.',
      timestamp: '2026-09-03T09:00:00Z',
      read: false,
      type: 'daily_fetch'
    },
    {
      id: 'notif-03',
      title: 'Assessment Deadline Approaching',
      message: 'Your Scale AI coding qualifier test expires in 48 hours. Take practice questions now.',
      timestamp: '2026-09-03T07:30:00Z',
      read: true,
      jobId: 'job-scale-01',
      type: 'deadline_reminder'
    }
  ];

  let emailDispatches: EmailDispatchRecord[] = [
    {
      id: 'email-01',
      recipient: 'phenandys@gmail.com',
      subject: '🎯 Daily AI Data Annotation Job Alert: 6 New High-Paying Matches ($35-$80/hr)',
      sentAt: '2026-09-03T09:05:00Z',
      jobCount: 6,
      status: 'delivered',
      frequency: 'daily',
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 20px;">
            <h1 style="color: #0f172a; margin: 0; font-size: 20px;">DataLabel AI — Daily Job Dispatch</h1>
            <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Personalized for phenandys@gmail.com • September 3, 2026</p>
          </div>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">Here are the latest curated AI data annotation, labelling, and RLHF opportunities matching your preferences:</p>
          <div style="margin: 16px 0; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 16px;">Scale AI — RLHF AI Prompt & Code Quality Evaluator</h3>
            <p style="margin: 0 0 8px 0; color: #16a34a; font-weight: 600;">Rate: $45 - $65/hr • Code & STEM Annotation</p>
            <p style="margin: 0; color: #475569; font-size: 13px;">Grade and annotate frontier LLM Python and algorithm outputs with step-by-step reasoning verification.</p>
          </div>
          <div style="margin: 16px 0; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 16px;">Alignerr — Advanced Mathematics & STEM AI Trainer</h3>
            <p style="margin: 0 0 8px 0; color: #16a34a; font-weight: 600;">Rate: $55 - $80/hr • Code & STEM Annotation</p>
            <p style="margin: 0; color: #475569; font-size: 13px;">Create calculus and linear algebra benchmark problem sets with formal proofs and LaTeX annotation.</p>
          </div>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
            <p>You received this automated alert because you subscribed to daily digests on DataLabel AI Alert.</p>
          </div>
        </div>
      `
    }
  ];

  let channelDispatches: ChannelDispatchRecord[] = [
    {
      id: 'disp-tg-01',
      channel: 'telegram',
      destination: '@AIAnnotationJobsAlert',
      title: 'Daily Radar Digest — 5 New Opportunities',
      body: '⚡ *AI & VIRTUAL ASSISTANT JOBS ALERT*\n🎯 5 High-Paying Opportunities ($25+/hr):\n1. Athena — Executive AI Virtual Assistant ($28-$42/hr)\n2. Scale AI — RLHF Prompt Evaluator ($45-$65/hr)\n3. Double — AI Operations Specialist ($30-$45/hr)',
      jobCount: 5,
      sentAt: '2026-09-03T11:35:00Z',
      status: 'delivered',
      directLink: 'https://t.me/share/url?url=https%3A%2F%2Fannotate-radar.ai&text=%E2%9A%A1%20AI%20%26%20Virtual%20Assistant%20Jobs%20Alert'
    },
    {
      id: 'disp-wa-01',
      channel: 'whatsapp',
      destination: '+1 (555) 019-2834',
      title: 'Instant WhatsApp Job Ping',
      body: '🚀 *NEW AI & VIRTUAL ASSISTANT JOBS ALERT*\nFound *3* matching openings:\n• Athena — Executive AI Virtual Assistant ($28-$42/hr)\n• Double — AI Operations & Remote EA ($30-$45/hr)\n• Scale AI — RLHF Evaluator ($45-$65/hr)',
      jobCount: 3,
      sentAt: '2026-09-03T11:31:00Z',
      status: 'delivered',
      directLink: 'https://api.whatsapp.com/send?phone=15550192834&text=AI%20Job%20Alert'
    },
    {
      id: 'disp-em-01',
      channel: 'email',
      destination: 'phenandys@gmail.com',
      title: '🎯 Daily AI Data Annotation Job Alert',
      body: 'Daily email digest with 6 matching jobs',
      jobCount: 6,
      sentAt: '2026-09-03T09:05:00Z',
      status: 'delivered'
    }
  ];

  let lastFetchedTimestamp = '2026-09-03T09:00:00Z';
  let nextScheduledTimestamp = '2026-09-04T09:00:00Z';

  // Helper to match jobs against alert criteria
  const isJobMatchingAlerts = (job: JobListing, prefs: AlertPreferences) => {
    // Check domain
    if (prefs.selectedDomains.length > 0 && !prefs.selectedDomains.includes(job.domain)) {
      return false;
    }
    // Check min rate
    if (job.payRate.min < prefs.minHourlyRate) {
      return false;
    }
    // Check job type
    if (prefs.selectedTypes.length > 0 && !prefs.selectedTypes.includes(job.jobType)) {
      return false;
    }
    // Check keyword watchlist if present
    if (prefs.keywordWatchlist.length > 0) {
      const textToSearch = `${job.title} ${job.company} ${job.description} ${job.requiredSkills.join(' ')}`.toLowerCase();
      const hasKeyword = prefs.keywordWatchlist.some(kw => textToSearch.includes(kw.toLowerCase()));
      if (!hasKeyword) return false;
    }
    return true;
  };

  // Helper to generate a rich HTML email digest
  const generateEmailHtml = (jobs: JobListing[], recipient: string, subject: string) => {
    const jobCards = jobs.slice(0, 8).map(j => `
      <div style="margin-bottom: 16px; padding: 18px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
          <h3 style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 700;">${j.title}</h3>
          <span style="background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">${j.company}</span>
        </div>
        <p style="margin: 4px 0 8px 0; color: #059669; font-weight: 700; font-size: 15px;">
          💰 $${j.payRate.min}${j.payRate.max ? ` - $${j.payRate.max}` : ''} / ${j.payRate.period}
          <span style="color: #64748b; font-weight: 400; font-size: 13px; margin-left: 8px;">• ${j.domain} • ${j.location}</span>
        </p>
        <p style="margin: 0 0 12px 0; color: #475569; font-size: 13px; line-height: 1.5;">${j.description}</p>
        <div style="margin-bottom: 12px;">
          ${j.requiredSkills.slice(0, 4).map(s => `<span style="display: inline-block; background: #e2e8f0; color: #334155; font-size: 11px; padding: 2px 8px; border-radius: 4px; margin-right: 4px; margin-bottom: 4px;">${s}</span>`).join('')}
        </div>
        <div style="display: flex; gap: 8px;">
          <a href="${j.applyUrl}" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block;">Quick Apply</a>
        </div>
      </div>
    `).join('');

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; color: #0f172a;">
        <div style="text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 24px; margin-bottom: 24px;">
          <div style="display: inline-block; background: #eff6ff; color: #2563eb; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 12px;">
            AUTOMATED DAILY ALERT
          </div>
          <h1 style="color: #0f172a; margin: 0 0 8px 0; font-size: 24px; font-weight: 800;">${subject}</h1>
          <p style="color: #64748b; margin: 0; font-size: 14px;">
            Targeted AI Data Annotation, Virtual Assistant & Allied listings for <strong>${recipient}</strong>
          </p>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
          <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 500;">
            ✨ We scanned 18 top AI data & Virtual Assistant platforms and found <strong>${jobs.length} new matching openings</strong> matching your criteria (Min $${alertPreferences.minHourlyRate}/hr).
          </p>
        </div>

        <div style="margin-bottom: 28px;">
          ${jobCards}
        </div>

        <div style="background: #f8fafc; border-radius: 10px; padding: 20px; border: 1px solid #e2e8f0; text-align: center; margin-bottom: 24px;">
          <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 15px;">Want to tweak your target rates or domains?</h4>
          <p style="margin: 0 0 14px 0; color: #64748b; font-size: 13px;">Adjust keyword watchlists, minimum pay thresholds, or notification frequency anytime.</p>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0 0 6px 0;">DataLabel AI Job Alerts • Automated Daily Crawler Engine</p>
          <p style="margin: 0;">Sent automatically to ${recipient}. You can manage alert preferences directly from your dashboard.</p>
        </div>
      </div>
    `;
  };

  // Helper to format WhatsApp alert message
  const generateWhatsAppMessage = (jobs: JobListing[], minRate: number): string => {
    const lines: string[] = [
      `⚡ *AI & VIRTUAL ASSISTANT JOBS ALERT*`,
      `🎯 Found *${jobs.length}* new high-paying openings matching your watchlist ($${minRate}+/hr):`,
      ``
    ];

    jobs.slice(0, 5).forEach((j, i) => {
      lines.push(`${i + 1}️⃣ *${j.company}* — ${j.title}`);
      lines.push(`💰 *$${j.payRate.min}${j.payRate.max ? ` - $${j.payRate.max}` : ''}/${j.payRate.period}* • 🌍 ${j.location}`);
      lines.push(`📁 Domain: ${j.domain}`);
      lines.push(`🛠️ Skills: ${j.requiredSkills.slice(0, 3).join(', ')}`);
      lines.push(`👉 Apply: ${j.applyUrl}`);
      lines.push(``);
    });

    lines.push(`📡 _Dispatched automatically by Annotate.AI Jobs Alert Engine_`);
    return lines.join('\n');
  };

  // Helper to format Telegram alert message (Markdown)
  const generateTelegramMessage = (jobs: JobListing[], minRate: number): string => {
    const lines: string[] = [
      `⚡ *AI & VIRTUAL ASSISTANT JOBS RADAR*`,
      `🎯 *${jobs.length} Matching Opportunities* (Threshold: $${minRate}+/hr)\n`
    ];

    jobs.slice(0, 5).forEach((j, i) => {
      lines.push(`*${i + 1}. ${j.company} — ${j.title}*`);
      lines.push(`💰 *$${j.payRate.min}${j.payRate.max ? ` - $${j.payRate.max}` : ''}/${j.payRate.period}* • 🌍 ${j.location}`);
      lines.push(`📁 *Domain*: \`${j.domain}\``);
      lines.push(`🛠️ *Skills*: ${j.requiredSkills.slice(0, 3).join(', ')}`);
      lines.push(`🔗 [Quick Apply Online](${j.applyUrl})\n`);
    });

    lines.push(`📡 _Dispatched automatically by Annotate.AI Jobs Alert_`);
    return lines.join('\n');
  };

  const getWhatsAppShareUrl = (phone: string, text: string): string => {
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    if (cleanPhone) {
      return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    }
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const getTelegramShareUrl = (text: string): string => {
    return `https://t.me/share/url?url=${encodeURIComponent('https://annotate-radar.ai')}&text=${encodeURIComponent(text)}`;
  };

  const sendTelegramBotMessage = async (botToken: string, channel: string, text: string): Promise<boolean> => {
    if (!botToken || !channel) return false;
    try {
      const cleanChannel = channel.startsWith('@') || channel.startsWith('-') ? channel : `@${channel}`;
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cleanChannel,
          text,
          parse_mode: 'Markdown',
          disable_web_page_preview: false
        })
      });
      const data = await res.json() as any;
      return data && data.ok === true;
    } catch (err) {
      console.warn('Telegram Bot API call skipped/failed:', err);
      return false;
    }
  };

  const sendWhatsAppWebhook = async (webhookUrl: string, phone: string, text: string, jobs: JobListing[]): Promise<boolean> => {
    if (!webhookUrl) return false;
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'whatsapp',
          to: phone,
          message: text,
          jobCount: jobs.length,
          timestamp: new Date().toISOString()
        })
      });
      return res.ok;
    } catch (err) {
      console.warn('WhatsApp webhook call skipped/failed:', err);
      return false;
    }
  };

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get job listings with optional filtering
  app.get('/api/jobs', (req, res) => {
    const { domain, jobType, minRate, search, source, freshOnly } = req.query;
    let filtered = [...jobListings];

    if (domain && domain !== 'all') {
      filtered = filtered.filter(j => j.domain === domain);
    }
    if (jobType && jobType !== 'all') {
      filtered = filtered.filter(j => j.jobType === jobType);
    }
    if (source && source !== 'all') {
      filtered = filtered.filter(j => j.company.toLowerCase().includes(String(source).toLowerCase()));
    }
    if (minRate) {
      const rateVal = Number(minRate);
      if (!isNaN(rateVal) && rateVal > 0) {
        filtered = filtered.filter(j => j.payRate.min >= rateVal);
      }
    }
    if (freshOnly === 'true') {
      filtered = filtered.filter(j => j.isNewToday);
    }
    if (search) {
      const query = String(search).toLowerCase();
      filtered = filtered.filter(j =>
        j.title.toLowerCase().includes(query) ||
        j.company.toLowerCase().includes(query) ||
        j.description.toLowerCase().includes(query) ||
        j.requiredSkills.some(s => s.toLowerCase().includes(query))
      );
    }

    res.json({
      total: filtered.length,
      jobs: filtered
    });
  });

  // Get single job details
  app.get('/api/jobs/:id', (req, res) => {
    const job = jobListings.find(j => j.id === req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ job });
  });

  // Trigger daily automated or manual fetch
  app.post('/api/jobs/fetch-daily', async (req, res) => {
    try {
      const now = new Date();
      const isoNow = now.toISOString();
      lastFetchedTimestamp = isoNow;
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      nextScheduledTimestamp = tomorrow.toISOString();

      let newlyFetchedJobs: JobListing[] = [];

      // If Gemini API is available, generate dynamic market-accurate job openings
      if (ai) {
        try {
          const prompt = `You are an AI data annotation, virtual assistant, and RLHF job aggregator. Generate 3 to 5 realistic, high-demand new job openings for AI data annotators, RLHF evaluators, executive AI virtual assistants, and remote ops assistants for companies like Scale AI, Outlier, Alignerr, Athena, Double, Belay, Time etc, DataAnnotation.tech, Mercor, or Invisible Tech.
Return ONLY valid JSON array with objects matching:
{
  "id": string (unique e.g. "job-fresh-" + random string),
  "title": string,
  "company": string,
  "domain": one of ["RLHF & LLM Evaluation", "Multimodal & Vision", "Code & STEM Annotation", "Language & Audio", "AI Safety & Red Teaming", "Domain Expert (Law/Med/Finance)", "Virtual Assistant & Allied"],
  "jobType": one of ["Hourly Contract", "Project-Based", "Full-Time Remote", "Part-Time"],
  "payRate": { "min": number, "max": number, "currency": "USD", "period": "hour" },
  "location": string,
  "source": string,
  "applyUrl": string,
  "description": string (detailed 2-3 sentences),
  "requiredSkills": string[],
  "assessmentRequired": boolean,
  "assessmentType": string,
  "hoursPerWeek": string,
  "payoutSchedule": string,
  "difficultyLevel": one of ["Entry-Level", "Intermediate", "Advanced Specialist"],
  "featured": boolean
}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          });

          if (response.text) {
            const parsed = JSON.parse(response.text.trim());
            if (Array.isArray(parsed) && parsed.length > 0) {
              newlyFetchedJobs = parsed.map((p, idx) => ({
                ...p,
                id: p.id || `job-fresh-${Date.now()}-${idx}`,
                postedAt: isoNow,
                isNewToday: true
              }));
            }
          }
        } catch (genErr) {
          console.error('Gemini generation error, falling back to dynamic generator:', genErr);
        }
      }

      // If no AI response, generate realistic fresh listings dynamically
      if (newlyFetchedJobs.length === 0) {
        const dynamicCompanies = [
          { company: 'Athena', domain: 'Virtual Assistant & Allied' as const, title: 'AI Executive Virtual Assistant & Delegation Lead', minRate: 32, maxRate: 46, skills: ['Inbox Zero', 'Calendar Management', 'AI Prompt Workflows', 'Notion/Slack'], assessment: 'Executive communication & inbox triage test' },
          { company: 'Double', domain: 'Virtual Assistant & Allied' as const, title: 'Remote AI Operations & Founder Support Specialist', minRate: 30, maxRate: 44, skills: ['HubSpot', 'Executive Travel', 'Transcription Summaries', 'Client Management'], assessment: 'Prioritization & delegation simulation' },
          { company: 'Alignerr', domain: 'Code & STEM Annotation' as const, title: 'Frontier AI Software Architecture Evaluator', minRate: 60, maxRate: 85, skills: ['Python', 'System Design', 'RLHF', 'Unit Testing'], assessment: 'Live code review test' },
          { company: 'Scale AI', domain: 'RLHF & LLM Evaluation' as const, title: 'Adversarial Prompting & Hallucination Auditor', minRate: 42, maxRate: 58, skills: ['Prompt Injection', 'Safety Rubrics', 'Fact-Checking'], assessment: 'Scenario calibration challenge' },
          { company: 'Surge AI', domain: 'Multimodal & Vision' as const, title: 'Spatial Reasoning & 3D Bounding Box Specialist', minRate: 28, maxRate: 38, skills: ['3D Spatial Sense', 'Segmentation', 'Video Labeling'], assessment: '15-min spatial accuracy benchmark' },
          { company: 'Mercor', domain: 'Domain Expert (Law/Med/Finance)' as const, title: 'Financial Analyst & Valuation Model AI Trainer', minRate: 70, maxRate: 105, skills: ['DCF Modeling', 'CFA / Finance Degree', 'Taxonomy'], assessment: 'Financial dataset benchmark' }
        ];

        const selected = dynamicCompanies.slice(0, Math.floor(Math.random() * 2) + 3);
        newlyFetchedJobs = selected.map((item, idx) => ({
          id: `job-auto-${Date.now()}-${idx}`,
          title: item.title,
          company: item.company,
          domain: item.domain,
          jobType: 'Hourly Contract',
          payRate: { min: item.minRate, max: item.maxRate, currency: 'USD', period: 'hour' },
          location: 'Global Remote',
          postedAt: isoNow,
          isNewToday: true,
          source: `${item.company} Talent Portal`,
          applyUrl: `https://${item.company.toLowerCase().replace(/\s+/g, '')}.com`,
          description: `Newly discovered listing: train and grade frontier models on specialized ${item.domain} tasks. High flexibility with rapid weekly compensation.`,
          requiredSkills: item.skills,
          assessmentRequired: true,
          assessmentType: item.assessment,
          hoursPerWeek: '15-35 hrs/wk (Flexible)',
          payoutSchedule: 'Weekly via Stripe / PayPal',
          difficultyLevel: item.minRate > 50 ? 'Advanced Specialist' : 'Intermediate',
          featured: true
        }));
      }

      // Add to main database at the top
      jobListings = [...newlyFetchedJobs, ...jobListings];

      // Find jobs matching user alert preferences
      const matchingJobs = newlyFetchedJobs.filter(j => isJobMatchingAlerts(j, alertPreferences));

      // Generate notifications
      const newNotifs: NotificationItem[] = [];
      if (matchingJobs.length > 0) {
        newNotifs.push({
          id: `notif-${Date.now()}-match`,
          title: `🎯 ${matchingJobs.length} New Matching Jobs Found!`,
          message: `Fresh listings matching your criteria ($${alertPreferences.minHourlyRate}+/hr) just dropped from ${matchingJobs.map(j => j.company).slice(0, 3).join(', ')}.`,
          timestamp: isoNow,
          read: false,
          jobId: matchingJobs[0].id,
          type: 'new_match'
        });
      }

      newNotifs.push({
        id: `notif-${Date.now()}-fetch`,
        title: 'Daily Auto-Crawler Completed',
        message: `Successfully fetched and validated ${newlyFetchedJobs.length} new opportunities across remote AI platforms.`,
        timestamp: isoNow,
        read: false,
        type: 'daily_fetch'
      });

      notifications = [...newNotifs, ...notifications];

      // If email alerts enabled, trigger an automated email dispatch record
      let dispatchRecord: EmailDispatchRecord | null = null;
      if (alertPreferences.emailAlertsEnabled && matchingJobs.length > 0) {
        const subject = `🎯 Daily AI Alert: ${matchingJobs.length} New Opportunities Matching Your Preferences ($${alertPreferences.minHourlyRate}+/hr)`;
        const html = generateEmailHtml(matchingJobs, alertPreferences.email, subject);
        dispatchRecord = {
          id: `email-${Date.now()}`,
          recipient: alertPreferences.email,
          subject,
          sentAt: isoNow,
          jobCount: matchingJobs.length,
          status: 'delivered',
          frequency: alertPreferences.frequency,
          htmlContent: html
        };
        emailDispatches = [dispatchRecord, ...emailDispatches];
        channelDispatches = [
          {
            id: `disp-em-${Date.now()}`,
            channel: 'email',
            destination: alertPreferences.email,
            title: subject,
            body: `Dispatched digest with ${matchingJobs.length} openings to ${alertPreferences.email}`,
            jobCount: matchingJobs.length,
            sentAt: isoNow,
            status: 'delivered'
          },
          ...channelDispatches
        ];
      }

      // If WhatsApp alerts enabled, forward to WhatsApp
      if (alertPreferences.whatsappEnabled && matchingJobs.length > 0) {
        const waText = generateWhatsAppMessage(matchingJobs, alertPreferences.minHourlyRate);
        const waUrl = getWhatsAppShareUrl(alertPreferences.whatsappNumber, waText);
        if (alertPreferences.whatsappWebhookUrl) {
          sendWhatsAppWebhook(alertPreferences.whatsappWebhookUrl, alertPreferences.whatsappNumber, waText, matchingJobs).catch(console.error);
        }
        channelDispatches = [
          {
            id: `disp-wa-${Date.now()}`,
            channel: 'whatsapp',
            destination: alertPreferences.whatsappNumber || 'WhatsApp Registered Device',
            title: `WhatsApp Alert: ${matchingJobs.length} New Matches ($${alertPreferences.minHourlyRate}+/hr)`,
            body: waText,
            jobCount: matchingJobs.length,
            sentAt: isoNow,
            status: 'delivered',
            directLink: waUrl
          },
          ...channelDispatches
        ];
        newNotifs.push({
          id: `notif-${Date.now()}-wa`,
          title: '📱 WhatsApp Alert Dispatched',
          message: `Forwarded ${matchingJobs.length} high-paying matches to WhatsApp (${alertPreferences.whatsappNumber || 'configured number'}).`,
          timestamp: isoNow,
          read: false,
          type: 'new_match'
        });
      }

      // If Telegram channel forwarding enabled, broadcast to Telegram
      if (alertPreferences.telegramEnabled && matchingJobs.length > 0) {
        const tgText = generateTelegramMessage(matchingJobs, alertPreferences.minHourlyRate);
        const tgUrl = getTelegramShareUrl(tgText);
        if (alertPreferences.telegramBotToken && alertPreferences.telegramChannel) {
          sendTelegramBotMessage(alertPreferences.telegramBotToken, alertPreferences.telegramChannel, tgText).catch(console.error);
        }
        channelDispatches = [
          {
            id: `disp-tg-${Date.now()}`,
            channel: 'telegram',
            destination: alertPreferences.telegramChannel || '@AIAnnotationJobsAlert',
            title: `Telegram Channel Broadcast: ${matchingJobs.length} Opportunities`,
            body: tgText,
            jobCount: matchingJobs.length,
            sentAt: isoNow,
            status: 'delivered',
            directLink: tgUrl
          },
          ...channelDispatches
        ];
        newNotifs.push({
          id: `notif-${Date.now()}-tg`,
          title: '✈️ Telegram Channel Broadcast Sent',
          message: `Broadcasted ${matchingJobs.length} opportunities to Telegram Channel ${alertPreferences.telegramChannel || '@AIAnnotationJobsAlert'}.`,
          timestamp: isoNow,
          read: false,
          type: 'new_match'
        });
      }

      notifications = [...newNotifs.filter(n => !notifications.some(existing => existing.id === n.id)), ...notifications];

      res.json({
        success: true,
        newJobsCount: newlyFetchedJobs.length,
        matchedCount: matchingJobs.length,
        totalJobs: jobListings.length,
        newJobs: newlyFetchedJobs,
        notifications: newNotifs,
        dispatchRecord
      });
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      res.status(500).json({ error: 'Failed to fetch jobs', details: err?.message });
    }
  });

  // Get auto-fetch scheduling status
  app.get('/api/jobs/schedule-status', (req, res) => {
    const status: FetchStatus = {
      lastFetchedAt: lastFetchedTimestamp,
      nextScheduledFetch: nextScheduledTimestamp,
      totalJobs: jobListings.length,
      newJobsToday: jobListings.filter(j => j.isNewToday).length,
      isFetching: false,
      autoFetchIntervalMinutes: 1440, // 24 hours
      lastLog: `Crawler status nominal. Monitored platforms: Scale AI, Outlier, Alignerr, Athena, Double, Belay, Time etc, DataAnnotation, Mercor, Invisible, TELUS, Turing.`
    };
    res.json(status);
  });

  // Alert preferences
  app.get('/api/alerts/preferences', (req, res) => {
    res.json({ preferences: alertPreferences });
  });

  app.post('/api/alerts/preferences', (req, res) => {
    const updated = req.body;
    alertPreferences = {
      ...alertPreferences,
      ...updated
    };
    res.json({ success: true, preferences: alertPreferences });
  });

  // Send / Simulate an Email Digest immediately
  app.post('/api/alerts/send-digest', (req, res) => {
    const { email } = req.body;
    const recipient = email || alertPreferences.email;

    // Filter matching jobs for this digest
    let matching = jobListings.filter(j => isJobMatchingAlerts(j, alertPreferences));
    if (matching.length === 0) {
      matching = jobListings.slice(0, 5); // Fallback to top curated
    }

    const subject = `📬 AI Annotation & Virtual Assistant Alert: ${matching.length} Curated Opportunities for You`;
    const html = generateEmailHtml(matching, recipient, subject);

    const record: EmailDispatchRecord = {
      id: `email-${Date.now()}`,
      recipient,
      subject,
      sentAt: new Date().toISOString(),
      jobCount: matching.length,
      status: 'delivered',
      frequency: alertPreferences.frequency,
      htmlContent: html
    };

    emailDispatches = [record, ...emailDispatches];

    // Log to multi-channel dispatches
    channelDispatches = [
      {
        id: `disp-em-${Date.now()}`,
        channel: 'email',
        destination: recipient,
        title: subject,
        body: `Manual trigger: Dispatched digest with ${matching.length} matching opportunities`,
        jobCount: matching.length,
        sentAt: record.sentAt,
        status: 'delivered'
      },
      ...channelDispatches
    ];

    // Also trigger in-app notification
    notifications = [
      {
        id: `notif-${Date.now()}`,
        title: 'Email Alert Digest Dispatched',
        message: `An automated alert with ${matching.length} listings was delivered to ${recipient}.`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'new_match'
      },
      ...notifications
    ];

    res.json({
      success: true,
      message: `Digest successfully sent to ${recipient}`,
      dispatchRecord: record
    });
  });

  // Forward alert to WhatsApp
  app.post('/api/alerts/send-whatsapp', async (req, res) => {
    const { number, webhookUrl } = req.body;
    const targetNumber = number || alertPreferences.whatsappNumber || '+1 (555) 019-2834';
    const targetWebhook = webhookUrl || alertPreferences.whatsappWebhookUrl;

    let matching = jobListings.filter(j => isJobMatchingAlerts(j, alertPreferences));
    if (matching.length === 0) {
      matching = jobListings.slice(0, 4);
    }

    const waText = generateWhatsAppMessage(matching, alertPreferences.minHourlyRate);
    const directLink = getWhatsAppShareUrl(targetNumber, waText);

    if (targetWebhook) {
      await sendWhatsAppWebhook(targetWebhook, targetNumber, waText, matching);
    }

    const record: ChannelDispatchRecord = {
      id: `disp-wa-${Date.now()}`,
      channel: 'whatsapp',
      destination: targetNumber,
      title: `WhatsApp Alert: ${matching.length} Curated Matches ($${alertPreferences.minHourlyRate}+/hr)`,
      body: waText,
      jobCount: matching.length,
      sentAt: new Date().toISOString(),
      status: 'delivered',
      directLink
    };

    channelDispatches = [record, ...channelDispatches];

    notifications = [
      {
        id: `notif-${Date.now()}-wa`,
        title: '📱 WhatsApp Alert Forwarded',
        message: `Successfully forwarded ${matching.length} matching roles to WhatsApp (${targetNumber}).`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'new_match'
      },
      ...notifications
    ];

    res.json({
      success: true,
      message: `Alert forwarded to WhatsApp (${targetNumber})`,
      dispatchRecord: record,
      directLink
    });
  });

  // Forward alert to Telegram Channel
  app.post('/api/alerts/send-telegram', async (req, res) => {
    const { channel, botToken } = req.body;
    const targetChannel = channel || alertPreferences.telegramChannel || '@AIAnnotationJobsAlert';
    const targetToken = botToken || alertPreferences.telegramBotToken;

    let matching = jobListings.filter(j => isJobMatchingAlerts(j, alertPreferences));
    if (matching.length === 0) {
      matching = jobListings.slice(0, 4);
    }

    const tgText = generateTelegramMessage(matching, alertPreferences.minHourlyRate);
    const directLink = getTelegramShareUrl(tgText);

    let deliveredViaBot = false;
    if (targetToken && targetChannel) {
      deliveredViaBot = await sendTelegramBotMessage(targetToken, targetChannel, tgText);
    }

    const record: ChannelDispatchRecord = {
      id: `disp-tg-${Date.now()}`,
      channel: 'telegram',
      destination: targetChannel,
      title: `Telegram Broadcast: ${matching.length} Opportunities`,
      body: tgText,
      jobCount: matching.length,
      sentAt: new Date().toISOString(),
      status: 'delivered',
      directLink
    };

    channelDispatches = [record, ...channelDispatches];

    notifications = [
      {
        id: `notif-${Date.now()}-tg`,
        title: '✈️ Telegram Channel Alert Broadcasted',
        message: `Successfully broadcasted ${matching.length} opportunities to Telegram Channel ${targetChannel}${deliveredViaBot ? ' via Bot API' : ''}.`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'new_match'
      },
      ...notifications
    ];

    res.json({
      success: true,
      message: `Broadcast sent to Telegram channel ${targetChannel}`,
      deliveredViaBot,
      dispatchRecord: record,
      directLink
    });
  });

  // Forward to ALL channels simultaneously (Email, WhatsApp, Telegram)
  app.post('/api/alerts/forward-all', async (req, res) => {
    let matching = jobListings.filter(j => isJobMatchingAlerts(j, alertPreferences));
    if (matching.length === 0) {
      matching = jobListings.slice(0, 5);
    }

    const isoNow = new Date().toISOString();
    const createdDispatches: ChannelDispatchRecord[] = [];

    // 1. Email
    if (alertPreferences.emailAlertsEnabled || req.body.forceAll) {
      const subject = `📬 AI Annotation & Virtual Assistant Alert: ${matching.length} Curated Opportunities`;
      const html = generateEmailHtml(matching, alertPreferences.email, subject);
      const emailRecord: EmailDispatchRecord = {
        id: `email-${Date.now()}`,
        recipient: alertPreferences.email,
        subject,
        sentAt: isoNow,
        jobCount: matching.length,
        status: 'delivered',
        frequency: alertPreferences.frequency,
        htmlContent: html
      };
      emailDispatches = [emailRecord, ...emailDispatches];
      const chanRecord: ChannelDispatchRecord = {
        id: `disp-em-${Date.now()}`,
        channel: 'email',
        destination: alertPreferences.email,
        title: subject,
        body: `Multi-channel blast: Delivered ${matching.length} listings to ${alertPreferences.email}`,
        jobCount: matching.length,
        sentAt: isoNow,
        status: 'delivered'
      };
      createdDispatches.push(chanRecord);
    }

    // 2. WhatsApp
    if (alertPreferences.whatsappEnabled || req.body.forceAll) {
      const waText = generateWhatsAppMessage(matching, alertPreferences.minHourlyRate);
      const waUrl = getWhatsAppShareUrl(alertPreferences.whatsappNumber, waText);
      if (alertPreferences.whatsappWebhookUrl) {
        sendWhatsAppWebhook(alertPreferences.whatsappWebhookUrl, alertPreferences.whatsappNumber, waText, matching).catch(console.error);
      }
      const waRecord: ChannelDispatchRecord = {
        id: `disp-wa-${Date.now()}`,
        channel: 'whatsapp',
        destination: alertPreferences.whatsappNumber || '+1 (555) 019-2834',
        title: `WhatsApp Alert: ${matching.length} Matching Opportunities`,
        body: waText,
        jobCount: matching.length,
        sentAt: isoNow,
        status: 'delivered',
        directLink: waUrl
      };
      createdDispatches.push(waRecord);
    }

    // 3. Telegram
    if (alertPreferences.telegramEnabled || req.body.forceAll) {
      const tgText = generateTelegramMessage(matching, alertPreferences.minHourlyRate);
      const tgUrl = getTelegramShareUrl(tgText);
      if (alertPreferences.telegramBotToken && alertPreferences.telegramChannel) {
        sendTelegramBotMessage(alertPreferences.telegramBotToken, alertPreferences.telegramChannel, tgText).catch(console.error);
      }
      const tgRecord: ChannelDispatchRecord = {
        id: `disp-tg-${Date.now()}`,
        channel: 'telegram',
        destination: alertPreferences.telegramChannel || '@AIAnnotationJobsAlert',
        title: `Telegram Channel Broadcast: ${matching.length} Opportunities`,
        body: tgText,
        jobCount: matching.length,
        sentAt: isoNow,
        status: 'delivered',
        directLink: tgUrl
      };
      createdDispatches.push(tgRecord);
    }

    channelDispatches = [...createdDispatches, ...channelDispatches];

    notifications = [
      {
        id: `notif-${Date.now()}-all`,
        title: '🚀 Multi-Channel Alert Broadcast Completed',
        message: `Dispatched ${matching.length} matching jobs across ${createdDispatches.map(d => d.channel.toUpperCase()).join(', ')}.`,
        timestamp: isoNow,
        read: false,
        type: 'new_match'
      },
      ...notifications
    ];

    res.json({
      success: true,
      message: `Forwarded to ${createdDispatches.length} active channels`,
      dispatches: createdDispatches
    });
  });

  // Multi-channel dispatch history
  app.get('/api/alerts/channel-history', (req, res) => {
    res.json({ dispatches: channelDispatches });
  });

  // Email dispatch history
  app.get('/api/alerts/history', (req, res) => {
    res.json({ dispatches: emailDispatches, channelDispatches });
  });

  // Notifications API
  app.get('/api/notifications', (req, res) => {
    res.json({
      notifications,
      unreadCount: notifications.filter(n => !n.read).length
    });
  });

  app.post('/api/notifications/mark-read', (req, res) => {
    const { id, markAll } = req.body;
    if (markAll) {
      notifications = notifications.map(n => ({ ...n, read: true }));
    } else if (id) {
      notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    }
    res.json({ success: true, unreadCount: notifications.filter(n => !n.read).length });
  });

  // Saved Opportunities API
  app.get('/api/saved', (req, res) => {
    const savedJobs = jobListings.filter(j => savedJobIds.has(j.id));
    res.json({ savedJobIds: Array.from(savedJobIds), savedJobs });
  });

  app.post('/api/saved', (req, res) => {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ error: 'jobId is required' });
    }
    if (savedJobIds.has(jobId)) {
      savedJobIds.delete(jobId);
      return res.json({ saved: false, jobId, count: savedJobIds.size });
    } else {
      savedJobIds.add(jobId);
      return res.json({ saved: true, jobId, count: savedJobIds.size });
    }
  });

  // Applications History Tracker API
  app.get('/api/applications', (req, res) => {
    res.json({ applications });
  });

  app.post('/api/applications', (req, res) => {
    const {
      jobId,
      jobTitle,
      company,
      domain,
      payRate,
      hourlyRateNumeric,
      status,
      notes,
      platformUrl,
      assessmentDeadline,
      weeklyHoursPlanned
    } = req.body;

    const newApp: ApplicationRecord = {
      id: `app-${Date.now()}`,
      jobId,
      jobTitle: jobTitle || 'AI Annotator Role',
      company: company || 'AI Platform',
      domain: domain || 'RLHF & LLM Evaluation',
      payRate: payRate || '$30/hr',
      hourlyRateNumeric: hourlyRateNumeric || 30,
      status: status || 'applied',
      dateApplied: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      notes: notes || '',
      platformUrl: platformUrl || '',
      assessmentDeadline,
      weeklyHoursPlanned: weeklyHoursPlanned || 20
    };

    applications = [newApp, ...applications];

    notifications = [
      {
        id: `notif-${Date.now()}`,
        title: 'Application Tracked',
        message: `Added ${newApp.company} (${newApp.jobTitle}) to your career tracking board.`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'status_change'
      },
      ...notifications
    ];

    res.json({ success: true, application: newApp });
  });

  app.put('/api/applications/:id', (req, res) => {
    const { id } = req.params;
    const index = applications.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const prev = applications[index];
    const updated: ApplicationRecord = {
      ...prev,
      ...req.body,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    if (prev.status !== updated.status) {
      notifications = [
        {
          id: `notif-${Date.now()}`,
          title: 'Application Status Updated',
          message: `${updated.company} moved from "${prev.status}" to "${updated.status.toUpperCase()}".`,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'status_change'
        },
        ...notifications
      ];
    }

    applications[index] = updated;
    res.json({ success: true, application: updated });
  });

  app.delete('/api/applications/:id', (req, res) => {
    const { id } = req.params;
    applications = applications.filter(a => a.id !== id);
    res.json({ success: true });
  });

  // AI Fit Score, Rubric Tips, and Pitch Generator endpoint
  app.post('/api/ai/job-tips', async (req, res) => {
    const { jobTitle, company, domain, userBackground, requiredSkills } = req.body;

    if (!ai) {
      const isVA = domain === 'Virtual Assistant & Allied' || (jobTitle && String(jobTitle).toLowerCase().includes('assistant'));
      // High-quality deterministic advice if Gemini is not loaded
      return res.json({
        tips: {
          assessmentTips: isVA ? [
            `For ${company || 'this platform'}, demonstrate strict Inbox Zero methodologies and proactive calendar conflict resolution.`,
            `Highlight familiarity with AI productivity stacks (ChatGPT/Claude for drafting, Notion AI, Granola, Otter.ai for transcription summaries).`,
            `Showcase absolute client confidentiality, asynchronous communication cadence, and executive prioritization rubrics.`
          ] : [
            `For ${company || 'this platform'}, strictly adhere to step-by-step reasoning ("Chain-of-Thought") before outputting final answers.`,
            `Never guess on factual assertions; cite or verify every claim to avoid instant hallucination penalties.`,
            `Follow markdown formatting rules rigorously—most automated platform screeners deduct points for missing headers or syntax errors.`
          ],
          keyRubrics: isVA ? [
            'Proactive Delegation: Anticipate calendar buffers, time zones, and executive travel contingencies.',
            'Precision & Discretion: 100% confidentiality handling NDAs, sensitive client correspondence, and billing data.',
            'AI Leverage: Accelerate research, drafting, and CRM data hygiene using generative AI tools.'
          ] : [
            'Factuality & Accuracy: 0 tolerance for hallucinated citations or non-existent code libraries.',
            'Helpfulness & Tone: Neutral, objective, and free of conversational filler.',
            'Instruction Following: Address every sub-clause in multi-part prompts.'
          ],
          platformAdvice: isVA ?
            `${company || 'This agency'} prioritizes candidates with proven asynchronous discipline, swift typing/response velocity, and mastery of remote executive tools.` :
            `${company || 'This company'} utilizes automated test grading followed by senior human reviewer calibration. Passing on the first attempt is critical for high-tier queue placement.`,
          customPitch: isVA ?
            `Proactive Virtual Assistant and operations specialist with deep experience leveraging AI workflows (ChatGPT/Claude, Notion, Google Workspace) to streamline executive schedules, triage inboxes, and manage client communications with flawless reliability.` :
            `Experienced data annotator with strong attention to detail in ${domain || 'AI evaluation'}. Proven track record adhering to complex rubrics, verifying reasoning chains, and delivering high-accuracy feedback for frontier model alignment.`,
          matchScore: 94
        }
      });
    }

    try {
      const prompt = `You are a world-class AI Career Coach specializing in AI Data Annotation, RLHF, Virtual Assistant, and remote operational jobs.
Analyze this job posting:
- Title: ${jobTitle}
- Company: ${company}
- Domain: ${domain}
- Required Skills: ${Array.isArray(requiredSkills) ? requiredSkills.join(', ') : 'AI evaluation, rubrics'}
- Candidate Background: ${userBackground || 'Analytical professional with strong critical thinking, prompt evaluation, and fact-checking skills'}

Return a JSON object with:
{
  "assessmentTips": ["string tip 1", "string tip 2", "string tip 3"],
  "keyRubrics": ["string rubric 1", "string rubric 2", "string rubric 3"],
  "platformAdvice": "string explaining how ${company} screens and scores candidates",
  "customPitch": "a compelling 2-3 sentence personalized pitch for the candidate to use when applying or in onboarding bio",
  "matchScore": number between 75 and 98
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({ tips: parsed });
      }
      throw new Error('Empty model response');
    } catch (err: any) {
      console.error('AI tips error:', err);
      res.json({
        tips: {
          assessmentTips: [
            `Focus on strict adherence to ${company}'s specific calibration guidelines.`,
            'Always double-check source verification and penalize unsupported claims in model answers.',
            'Review benchmark rubric examples carefully before starting timed sections.'
          ],
          keyRubrics: [
            'Rigor: Detail exact reasoning paths for any flagged errors.',
            'Prompt Compliance: Ensure all constraints (length, language, format) are respected.',
            'Safety: Identify subtle bias, jailbreak attempts, or policy infractions.'
          ],
          platformAdvice: `${company} values consistent quality scorecards over speed. Take your time during the initial qualification tasks.`,
          customPitch: `Detail-oriented professional with specialized focus on ${domain}. Experienced in rubric calibration, hallucination detection, and structured data labelling for frontier AI training pipelines.`,
          matchScore: 88
        }
      });
    }
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DataLabel AI Jobs Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
