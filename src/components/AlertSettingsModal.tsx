import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  Check, 
  History,
  MessageCircle,
  Share2,
  ExternalLink,
  Zap,
  CheckCircle2,
  Radio,
  Copy
} from 'lucide-react';
import { AlertPreferences, EmailDispatchRecord, ChannelDispatchRecord, JobDomain, JobType } from '../types';

interface AlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: AlertPreferences;
  onSavePreferences: (prefs: AlertPreferences) => void;
  onSendTestDigest: (email: string) => Promise<EmailDispatchRecord | null>;
  onSendWhatsApp?: (number?: string, webhookUrl?: string) => Promise<ChannelDispatchRecord | null>;
  onSendTelegram?: (channel?: string, botToken?: string) => Promise<ChannelDispatchRecord | null>;
  onForwardAll?: () => Promise<ChannelDispatchRecord[]>;
  dispatches: EmailDispatchRecord[];
  channelDispatches?: ChannelDispatchRecord[];
  onViewDispatch: (record: EmailDispatchRecord) => void;
}

const ALL_DOMAINS: JobDomain[] = [
  'Virtual Assistant & Allied',
  'RLHF & LLM Evaluation',
  'Code & STEM Annotation',
  'Multimodal & Vision',
  'AI Safety & Red Teaming',
  'Language & Audio',
  'Domain Expert (Law/Med/Finance)'
];

const ALL_TYPES: JobType[] = [
  'Hourly Contract',
  'Project-Based',
  'Full-Time Remote',
  'Part-Time'
];

export const AlertSettingsModal: React.FC<AlertSettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
  onSendTestDigest,
  onSendWhatsApp,
  onSendTelegram,
  onForwardAll,
  dispatches,
  channelDispatches = [],
  onViewDispatch
}) => {
  if (!isOpen) return null;

  const [tab, setTab] = useState<'settings' | 'channels' | 'history'>('channels');
  
  // Rule preferences
  const [email, setEmail] = useState(preferences.email);
  const [frequency, setFrequency] = useState(preferences.frequency);
  const [minHourlyRate, setMinHourlyRate] = useState(preferences.minHourlyRate);
  const [selectedDomains, setSelectedDomains] = useState<JobDomain[]>(preferences.selectedDomains);
  const [selectedTypes, setSelectedTypes] = useState<JobType[]>(preferences.selectedTypes);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(preferences.emailAlertsEnabled);
  const [pushEnabled, setPushEnabled] = useState(preferences.pushNotificationsEnabled);
  const [soundEnabled, setSoundEnabled] = useState(preferences.soundAlertsEnabled);
  const [keywords, setKeywords] = useState<string[]>(preferences.keywordWatchlist || []);
  const [newKeyword, setNewKeyword] = useState('');
  
  // Forwarding channels state
  const [whatsappEnabled, setWhatsappEnabled] = useState(preferences.whatsappEnabled ?? true);
  const [whatsappNumber, setWhatsappNumber] = useState(preferences.whatsappNumber || '+1 (555) 019-2834');
  const [whatsappWebhookUrl, setWhatsappWebhookUrl] = useState(preferences.whatsappWebhookUrl || '');
  
  const [telegramEnabled, setTelegramEnabled] = useState(preferences.telegramEnabled ?? true);
  const [telegramChannel, setTelegramChannel] = useState(preferences.telegramChannel || '@AIAnnotationJobsAlert');
  const [telegramBotToken, setTelegramBotToken] = useState(preferences.telegramBotToken || '');

  // Action status states
  const [sendingEmailTest, setSendingEmailTest] = useState(false);
  const [sendingWaTest, setSendingWaTest] = useState(false);
  const [sendingTgTest, setSendingTgTest] = useState(false);
  const [sendingAllTest, setSendingAllTest] = useState(false);
  const [lastWaLink, setLastWaLink] = useState<string | null>(null);
  const [lastTgLink, setLastTgLink] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'email' | 'whatsapp' | 'telegram'>('all');

  const toggleDomain = (domain: JobDomain) => {
    if (selectedDomains.includes(domain)) {
      setSelectedDomains(selectedDomains.filter(d => d !== domain));
    } else {
      setSelectedDomains([...selectedDomains, domain]);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePreferences({
      email,
      frequency,
      minHourlyRate,
      selectedDomains,
      selectedTypes,
      emailAlertsEnabled,
      pushNotificationsEnabled: pushEnabled,
      soundAlertsEnabled: soundEnabled,
      keywordWatchlist: keywords,
      whatsappEnabled,
      whatsappNumber,
      whatsappWebhookUrl,
      telegramEnabled,
      telegramChannel,
      telegramBotToken
    });
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
    }, 1500);
  };

  const handleTestDigestClick = async () => {
    setSendingEmailTest(true);
    const record = await onSendTestDigest(email);
    setSendingEmailTest(false);
    if (record) {
      onViewDispatch(record);
    }
  };

  const handleTestWhatsAppClick = async () => {
    if (!onSendWhatsApp) return;
    setSendingWaTest(true);
    const res = await onSendWhatsApp(whatsappNumber, whatsappWebhookUrl);
    setSendingWaTest(false);
    if (res?.directLink) {
      setLastWaLink(res.directLink);
    }
  };

  const handleTestTelegramClick = async () => {
    if (!onSendTelegram) return;
    setSendingTgTest(true);
    const res = await onSendTelegram(telegramChannel, telegramBotToken);
    setSendingTgTest(false);
    if (res?.directLink) {
      setLastTgLink(res.directLink);
    }
  };

  const handleForwardAllClick = async () => {
    if (!onForwardAll) return;
    setSendingAllTest(true);
    await onForwardAll();
    setSendingAllTest(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 1500);
  };

  // Filtered dispatches
  const filteredDispatches = channelDispatches.filter(d => {
    if (historyFilter === 'all') return true;
    return d.channel === historyFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-3xl bg-[#0A0A0B] text-[#F0F0F0] rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-800 text-[#C8FF00] flex items-center gap-1.5">
              <Zap className="w-5 h-5 text-[#C8FF00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#C8FF00] block">
                  ALERT AUTOMATION ENGINE
                </span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[9px] font-mono font-bold">
                  EMAIL • WHATSAPP • TELEGRAM
                </span>
              </div>
              <h3 className="text-base font-black uppercase tracking-tight text-white font-heading mt-0.5">
                Multi-Channel Job Alert Forwarding
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-zinc-800 px-5 bg-zinc-950 text-xs font-bold uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => setTab('channels')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'channels'
                ? 'border-[#C8FF00] text-[#C8FF00]'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>WhatsApp &amp; Telegram Forwarding</span>
          </button>
          
          <button
            onClick={() => setTab('settings')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'settings'
                ? 'border-[#C8FF00] text-[#C8FF00]'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Filters &amp; Rate Thresholds</span>
          </button>

          <button
            onClick={() => setTab('history')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'history'
                ? 'border-[#C8FF00] text-[#C8FF00]'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Dispatch Logs ({channelDispatches.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {tab === 'channels' ? (
            <div className="space-y-6">
              {/* Quick Multi-Channel Forward Toolbar */}
              <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#C8FF00]" />
                    Instant Multi-Channel Forward
                  </span>
                  <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                    Forward top matching roles across all enabled channels simultaneously.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleForwardAllClick}
                  disabled={sendingAllTest}
                  className="w-full sm:w-auto px-4 py-2 bg-[#C8FF00] hover:bg-[#b8eb00] text-black font-black uppercase text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Send className={`w-3.5 h-3.5 ${sendingAllTest ? 'animate-spin' : ''}`} />
                  <span>{sendingAllTest ? 'FORWARDING...' : 'BLAST TO ALL CHANNELS'}</span>
                </button>
              </div>

              {/* WHATSAPP FORWARDING CARD */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                        WhatsApp Forwarding
                        {whatsappEnabled ? (
                          <span className="text-[9px] bg-emerald-900/60 text-emerald-400 border border-emerald-700/50 px-1.5 py-0.5 rounded font-mono font-bold">
                            FORWARDING ACTIVE
                          </span>
                        ) : (
                          <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono font-bold">
                            MUTED
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] font-mono text-zinc-400">
                        Receive instant formatted job drops, direct apply links, and rate stats on your WhatsApp.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whatsappEnabled}
                      onChange={e => setWhatsappEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 block mb-1">
                      WhatsApp Phone / Group (with country code)
                    </label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={e => setWhatsappNumber(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
                      Include country code (+1, +44, +91, etc.)
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 block mb-1">
                      Optional Webhook URL (Twilio / Zapier / Make)
                    </label>
                    <input
                      type="url"
                      value={whatsappWebhookUrl}
                      onChange={e => setWhatsappWebhookUrl(e.target.value)}
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                      className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
                      Automate dispatch to WhatsApp Business bots or group channels.
                    </span>
                  </div>
                </div>

                {/* WhatsApp Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleTestWhatsAppClick}
                    disabled={sendingWaTest}
                    className="px-3.5 py-2 text-xs font-black uppercase tracking-wider text-black bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <MessageCircle className={`w-3.5 h-3.5 ${sendingWaTest ? 'animate-spin' : ''}`} />
                    <span>{sendingWaTest ? 'FORWARDING...' : 'TEST WHATSAPP FORWARD'}</span>
                  </button>

                  {lastWaLink && (
                    <a
                      href={lastWaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/60 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>OPEN IN WHATSAPP CHAT</span>
                    </a>
                  )}
                </div>

                {/* WhatsApp Message Preview Accordion */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-3 text-[11px] font-mono text-zinc-400">
                  <span className="text-[9px] uppercase font-bold text-emerald-400 block mb-1">
                    WhatsApp Message Preview:
                  </span>
                  <div className="text-zinc-300 bg-zinc-950 p-2.5 rounded border border-zinc-800/50 whitespace-pre-line leading-relaxed">
                    ⚡ *AI &amp; VIRTUAL ASSISTANT JOBS ALERT*{'\n'}
                    🎯 Found *3* new matching openings ($25+/hr):{'\n'}
                    1️⃣ *Athena* — Executive AI Virtual Assistant ($28-$42/hr){'\n'}
                    2️⃣ *Scale AI* — RLHF AI Prompt Evaluator ($45-$65/hr){'\n'}
                    👉 Direct Apply Links Included
                  </div>
                </div>
              </div>

              {/* TELEGRAM CHANNEL FORWARDING CARD */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-sky-950/80 text-sky-400 border border-sky-800/50">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                        Telegram Channel Forwarding
                        {telegramEnabled ? (
                          <span className="text-[9px] bg-sky-900/60 text-sky-400 border border-sky-700/50 px-1.5 py-0.5 rounded font-mono font-bold">
                            BROADCAST ACTIVE
                          </span>
                        ) : (
                          <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono font-bold">
                            MUTED
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] font-mono text-zinc-400">
                        Broadcast real-time job drops directly to your Telegram public channel or private group.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={telegramEnabled}
                      onChange={e => setTelegramEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 block mb-1">
                      Telegram Channel / Chat ID
                    </label>
                    <input
                      type="text"
                      value={telegramChannel}
                      onChange={e => setTelegramChannel(e.target.value)}
                      placeholder="@AIAnnotationJobsAlert"
                      className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                    <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
                      Use @channel_name for public channels or -100xxx for private groups.
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 block mb-1">
                      Optional Telegram Bot Token
                    </label>
                    <input
                      type="text"
                      value={telegramBotToken}
                      onChange={e => setTelegramBotToken(e.target.value)}
                      placeholder="123456789:ABCdefGHIjkLMNop..."
                      className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
                    />
                    <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
                      From @BotFather. Enables direct server-to-channel auto posting.
                    </span>
                  </div>
                </div>

                {/* Telegram Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleTestTelegramClick}
                    disabled={sendingTgTest}
                    className="px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white bg-sky-600 hover:bg-sky-500 rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${sendingTgTest ? 'animate-spin' : ''}`} />
                    <span>{sendingTgTest ? 'BROADCASTING...' : 'TEST TELEGRAM BROADCAST'}</span>
                  </button>

                  {lastTgLink && (
                    <a
                      href={lastTgLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 text-xs font-mono font-bold text-sky-400 bg-sky-950/60 border border-sky-800/60 hover:bg-sky-900/60 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>OPEN IN TELEGRAM</span>
                    </a>
                  )}
                </div>

                {/* Telegram Message Preview */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-3 text-[11px] font-mono text-zinc-400">
                  <span className="text-[9px] uppercase font-bold text-sky-400 block mb-1">
                    Telegram Markdown Preview:
                  </span>
                  <div className="text-zinc-300 bg-zinc-950 p-2.5 rounded border border-zinc-800/50 whitespace-pre-line leading-relaxed">
                    ⚡ *AI &amp; VIRTUAL ASSISTANT JOBS RADAR*{'\n'}
                    🎯 *3 Matching Opportunities* (Threshold: $25+/hr){'\n\n'}
                    *1. Athena — Executive AI Virtual Assistant*{'\n'}
                    💰 $28 - $42/hr • 🌍 Global Remote{'\n'}
                    🔗 [Quick Apply Online](https://athenaexecutives.com)
                  </div>
                </div>
              </div>

              {/* SAVE PREFERENCES BUTTON */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full py-3 bg-[#C8FF00] hover:bg-[#b8eb00] text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  {savedStatus ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>FORWARDING CHANNELS SAVED!</span>
                    </>
                  ) : (
                    <span>SAVE CHANNEL FORWARDING PREFERENCES</span>
                  )}
                </button>
              </div>
            </div>
          ) : tab === 'settings' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Recipient Email */}
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Email Digest Destination
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailAlertsEnabled}
                      onChange={e => setEmailAlertsEnabled(e.target.checked)}
                      className="rounded accent-[#C8FF00]"
                    />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-300">
                      Email Active
                    </span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="flex-1 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#C8FF00]"
                  />
                  <button
                    type="button"
                    onClick={handleTestDigestClick}
                    disabled={sendingEmailTest || !email}
                    className="px-3.5 py-2 text-xs font-black uppercase tracking-wider text-black bg-[#C8FF00] hover:bg-[#b8eb00] rounded-lg flex items-center gap-1.5 shrink-0 transition disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${sendingEmailTest ? 'animate-spin' : ''}`} />
                    <span>{sendingEmailTest ? 'SENDING...' : 'TEST EMAIL'}</span>
                  </button>
                </div>
              </div>

              {/* Alert Frequency & Rate Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 block mb-1.5">
                    Alert Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as any)}
                    className="w-full text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#C8FF00]"
                  >
                    <option value="instant">Instant (As Crawled)</option>
                    <option value="daily">Daily Digest (9:00 AM)</option>
                    <option value="weekly">Weekly Summary (Mondays)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 block mb-1.5">
                    Minimum Rate Threshold (${minHourlyRate}/hr)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={15}
                      max={80}
                      step={5}
                      value={minHourlyRate}
                      onChange={e => setMinHourlyRate(Number(e.target.value))}
                      className="flex-1 accent-[#C8FF00]"
                    />
                    <span className="font-mono font-black text-sm text-[#C8FF00] bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
                      ${minHourlyRate}/hr
                    </span>
                  </div>
                </div>
              </div>

              {/* Domain Subscriptions */}
              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 block mb-2">
                  Target Domain Specializations
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_DOMAINS.map(domain => {
                    const isChecked = selectedDomains.includes(domain);
                    return (
                      <button
                        type="button"
                        key={domain}
                        onClick={() => toggleDomain(domain)}
                        className={`text-left p-2.5 rounded-lg border text-xs font-mono transition flex items-center justify-between ${
                          isChecked
                            ? 'bg-zinc-900 border-[#C8FF00]/50 text-white'
                            : 'bg-zinc-950 border-zinc-800/80 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <span>{domain}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-[#C8FF00]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Keywords Watchlist */}
              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 block mb-1.5">
                  Keyword Watchlist (Auto-Trigger)
                </label>
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={e => setNewKeyword(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                    placeholder="Add keywords (e.g. Virtual Assistant, Executive Support, Python, Red Teaming)..."
                    className="flex-1 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-[#C8FF00]"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase rounded-lg transition"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {keywords.map(kw => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-zinc-900 text-zinc-300 px-2.5 py-1 rounded-md border border-zinc-800"
                    >
                      <span>{kw}</span>
                      <button
                        type="button"
                        onClick={() => removeKeyword(kw)}
                        className="text-zinc-500 hover:text-white"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* In-App Notifications & Sound */}
              <div className="pt-3 border-t border-zinc-800 flex flex-wrap gap-4 text-xs font-mono text-zinc-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushEnabled}
                    onChange={e => setPushEnabled(e.target.checked)}
                    className="rounded accent-[#C8FF00]"
                  />
                  <span>REAL-TIME IN-APP NOTIFICATIONS</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={e => setSoundEnabled(e.target.checked)}
                    className="rounded accent-[#C8FF00]"
                  />
                  <span>SOUND CHIME ON NEW MATCHES</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#C8FF00] hover:bg-[#b8eb00] text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  {savedStatus ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>FILTERS &amp; PREFERENCES SAVED!</span>
                    </>
                  ) : (
                    <span>SAVE ALERT PREFERENCES</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Filter chips */}
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <span className="text-[10px] font-mono uppercase text-zinc-500 mr-1">Filter Channel:</span>
                {(['all', 'whatsapp', 'telegram', 'email'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setHistoryFilter(c)}
                    className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg border transition ${
                      historyFilter === c
                        ? 'bg-[#C8FF00] text-black font-bold border-[#C8FF00]'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {filteredDispatches.length === 0 ? (
                <div className="py-12 text-center text-zinc-600">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-mono uppercase">No alert dispatches in this category</p>
                </div>
              ) : (
                filteredDispatches.map(item => (
                  <div
                    key={item.id}
                    className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2 hover:bg-zinc-900 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {item.channel === 'whatsapp' && (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase font-black bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded font-mono">
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                          </span>
                        )}
                        {item.channel === 'telegram' && (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase font-black bg-sky-950 text-sky-400 border border-sky-800/60 px-2 py-0.5 rounded font-mono">
                            <Send className="w-3 h-3" />
                            Telegram
                          </span>
                        )}
                        {item.channel === 'email' && (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase font-black bg-amber-950 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded font-mono">
                            <Mail className="w-3 h-3" />
                            Email
                          </span>
                        )}
                        <span className="text-xs font-bold text-white">
                          {item.title}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-zinc-500">
                        {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[11px] font-mono text-zinc-400">
                      Target: <strong className="text-zinc-200">{item.destination}</strong> • {item.jobCount} Opportunities
                    </p>

                    <div className="text-[11px] font-mono text-zinc-300 bg-zinc-950 p-2.5 rounded border border-zinc-800 whitespace-pre-line max-h-24 overflow-y-auto">
                      {item.body}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      {item.directLink && (
                        <a
                          href={item.directLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-xs font-mono font-bold text-black bg-[#C8FF00] hover:bg-[#b8eb00] rounded-lg transition inline-flex items-center gap-1"
                        >
                          <span>OPEN {item.channel.toUpperCase()}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        onClick={() => copyToClipboard(item.body, item.id)}
                        className="px-2.5 py-1 text-xs font-mono text-zinc-400 hover:text-white bg-zinc-800 rounded-lg transition inline-flex items-center gap-1"
                      >
                        {copiedLink === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#C8FF00]" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>COPY TEXT</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
