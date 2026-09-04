import React, { useState, useEffect, useMemo } from 'react';
import { 
  JobListing, 
  ApplicationRecord, 
  AlertPreferences, 
  NotificationItem, 
  EmailDispatchRecord, 
  ChannelDispatchRecord,
  FetchStatus 
} from './types';
import { Navbar } from './components/Navbar';
import { FiltersBar } from './components/FiltersBar';
import { JobCard } from './components/JobCard';
import { JobDetailModal } from './components/JobDetailModal';
import { ApplicationTracker } from './components/ApplicationTracker';
import { SavedOpportunities } from './components/SavedOpportunities';
import { AlertSettingsModal } from './components/AlertSettingsModal';
import { NotificationsPopover } from './components/NotificationsPopover';
import { EmailDigestModal } from './components/EmailDigestModal';
import { FAQSection } from './components/FAQSection';
import { 
  Sparkles, 
  RefreshCw, 
  Mail, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Flame,
  MessageCircle,
  Send,
  Radio,
  Copy,
  Check,
  HelpCircle
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'saved' | 'alerts' | 'faq'>('jobs');

  // Core Data Stores
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus | null>(null);
  const [emailDispatches, setEmailDispatches] = useState<EmailDispatchRecord[]>([]);
  const [channelDispatches, setChannelDispatches] = useState<ChannelDispatchRecord[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'whatsapp' | 'telegram' | 'email'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [alertPreferences, setAlertPreferences] = useState<AlertPreferences>({
    email: 'phenandys@gmail.com',
    frequency: 'daily',
    minHourlyRate: 25,
    selectedDomains: [],
    selectedTypes: [],
    emailAlertsEnabled: true,
    pushNotificationsEnabled: true,
    soundAlertsEnabled: true,
    keywordWatchlist: [],
    whatsappEnabled: true,
    whatsappNumber: '+1 (555) 019-2834',
    whatsappWebhookUrl: '',
    telegramEnabled: true,
    telegramChannel: '@AIAnnotationJobsAlert',
    telegramBotToken: ''
  });

  // Loading and Crawler Action states
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isFetchingCrawler, setIsFetchingCrawler] = useState(false);
  const [crawlerToast, setCrawlerToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [minRate, setMinRate] = useState(0);
  const [freshOnly, setFreshOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'highest-rate' | 'newest' | 'company'>('highest-rate');

  // Modal controls
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<JobListing | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'overview' | 'tips' | 'track'>('overview');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAlertSettingsOpen, setIsAlertSettingsOpen] = useState(false);
  const [selectedDispatchForPreview, setSelectedDispatchForPreview] = useState<EmailDispatchRecord | null>(null);

  // Sound chime helper
  const playAlertSound = () => {
    if (!alertPreferences.soundAlertsEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // AudioContext blocked
    }
  };

  // Initial Data Load
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoadingJobs(true);
    try {
      const jobsRes = await fetch('/api/jobs');
      const jobsData = await jobsRes.json();
      if (jobsData.jobs) setJobs(jobsData.jobs);

      const savedRes = await fetch('/api/saved');
      const savedData = await savedRes.json();
      if (savedData.savedJobIds) setSavedJobIds(new Set(savedData.savedJobIds));

      const appsRes = await fetch('/api/applications');
      const appsData = await appsRes.json();
      if (appsData.applications) setApplications(appsData.applications);

      const notifsRes = await fetch('/api/notifications');
      const notifsData = await notifsRes.json();
      if (notifsData.notifications) setNotifications(notifsData.notifications);

      const prefsRes = await fetch('/api/alerts/preferences');
      const prefsData = await prefsRes.json();
      if (prefsData.preferences) setAlertPreferences(prefsData.preferences);

      const schedRes = await fetch('/api/jobs/schedule-status');
      const schedData = await schedRes.json();
      setFetchStatus(schedData);

      const dispRes = await fetch('/api/alerts/history');
      const dispData = await dispRes.json();
      if (dispData.dispatches) setEmailDispatches(dispData.dispatches);

      const chanRes = await fetch('/api/alerts/channel-history');
      const chanData = await chanRes.json();
      if (chanData.dispatches) setChannelDispatches(chanData.dispatches);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // Trigger Daily Fetch Crawler
  const handleTriggerDailyFetch = async () => {
    setIsFetchingCrawler(true);
    try {
      const res = await fetch('/api/jobs/fetch-daily', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const jobsRes = await fetch('/api/jobs');
        const jobsData = await jobsRes.json();
        if (jobsData.jobs) setJobs(jobsData.jobs);

        const notifsRes = await fetch('/api/notifications');
        const notifsData = await notifsRes.json();
        if (notifsData.notifications) setNotifications(notifsData.notifications);

        const schedRes = await fetch('/api/jobs/schedule-status');
        const schedData = await schedRes.json();
        setFetchStatus(schedData);

        if (data.dispatchRecord) {
          setEmailDispatches(prev => [data.dispatchRecord, ...prev]);
        }

        if (data.channelDispatches && Array.isArray(data.channelDispatches)) {
          setChannelDispatches(prev => [...data.channelDispatches, ...prev]);
        }

        playAlertSound();

        setCrawlerToast({
          message: `Scanner complete! Discovered ${data.newJobsCount} fresh AI opportunities (${data.matchedCount} matching alert filters). Multi-channel alerts dispatched.`,
          type: 'success'
        });
        setTimeout(() => setCrawlerToast(null), 5000);
      }
    } catch (err) {
      console.error('Crawler failed:', err);
    } finally {
      setIsFetchingCrawler(false);
    }
  };

  // Toggle Save Job
  const handleToggleSave = async (jobId: string) => {
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });
      const data = await res.json();
      setSavedJobIds(prev => {
        const next = new Set(prev);
        if (data.saved) next.add(jobId);
        else next.delete(jobId);
        return next;
      });
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  // Applications Actions
  const handleSaveApplication = async (appData: any) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData)
      });
      const data = await res.json();
      if (data.success) {
        setApplications(prev => [data.application, ...prev]);
        const notifsRes = await fetch('/api/notifications');
        const notifsData = await notifsRes.json();
        if (notifsData.notifications) setNotifications(notifsData.notifications);
      }
    } catch (err) {
      console.error('Error saving application:', err);
    }
  };

  const handleUpdateApplication = async (id: string, updates: Partial<ApplicationRecord>) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        setApplications(prev => prev.map(a => a.id === id ? data.application : a));
      }
    } catch (err) {
      console.error('Error updating application:', err);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      await fetch(`/api/applications/${id}`, { method: 'DELETE' });
      setApplications(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting application:', err);
    }
  };

  // Notifications Actions
  const handleMarkAsRead = async (id?: string, markAll?: boolean) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, markAll })
      });
      if (markAll) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } else if (id) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error('Error marking notifications:', err);
    }
  };

  // Alert Preferences Save
  const handleSavePreferences = async (newPrefs: AlertPreferences) => {
    try {
      const res = await fetch('/api/alerts/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs)
      });
      const data = await res.json();
      if (data.preferences) setAlertPreferences(data.preferences);
    } catch (err) {
      console.error('Error saving preferences:', err);
    }
  };

  // Send Test Email Digest
  const handleSendTestDigest = async (email: string): Promise<EmailDispatchRecord | null> => {
    try {
      const res = await fetch('/api/alerts/send-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success && data.dispatchRecord) {
        setEmailDispatches(prev => [data.dispatchRecord, ...prev]);
        playAlertSound();
        return data.dispatchRecord;
      }
      return null;
    } catch (err) {
      console.error('Error sending test digest:', err);
      return null;
    }
  };

  // Send WhatsApp Forward
  const handleSendWhatsAppAlert = async (number?: string, webhookUrl?: string): Promise<ChannelDispatchRecord | null> => {
    try {
      const res = await fetch('/api/alerts/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, webhookUrl })
      });
      const data = await res.json();
      if (data.success && data.dispatchRecord) {
        setChannelDispatches(prev => [data.dispatchRecord, ...prev]);
        playAlertSound();
        setCrawlerToast({
          message: `Forwarded matching jobs to WhatsApp (${data.dispatchRecord.destination})!`,
          type: 'success'
        });
        setTimeout(() => setCrawlerToast(null), 5000);
        return data.dispatchRecord;
      }
      return null;
    } catch (err) {
      console.error('Error forwarding to WhatsApp:', err);
      return null;
    }
  };

  // Send Telegram Broadcast
  const handleSendTelegramAlert = async (channel?: string, botToken?: string): Promise<ChannelDispatchRecord | null> => {
    try {
      const res = await fetch('/api/alerts/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, botToken })
      });
      const data = await res.json();
      if (data.success && data.dispatchRecord) {
        setChannelDispatches(prev => [data.dispatchRecord, ...prev]);
        playAlertSound();
        setCrawlerToast({
          message: `Broadcasted matching jobs to Telegram Channel (${data.dispatchRecord.destination})!`,
          type: 'success'
        });
        setTimeout(() => setCrawlerToast(null), 5000);
        return data.dispatchRecord;
      }
      return null;
    } catch (err) {
      console.error('Error broadcasting to Telegram:', err);
      return null;
    }
  };

  // Multi-Channel Blast
  const handleForwardAllAlerts = async (): Promise<ChannelDispatchRecord[]> => {
    try {
      const res = await fetch('/api/alerts/forward-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceAll: true })
      });
      const data = await res.json();
      if (data.success && data.dispatches) {
        setChannelDispatches(prev => [...data.dispatches, ...prev]);
        playAlertSound();
        setCrawlerToast({
          message: `Dispatched matching jobs across all active channels (Email, WhatsApp, Telegram)!`,
          type: 'success'
        });
        setTimeout(() => setCrawlerToast(null), 5000);
        return data.dispatches;
      }
      return [];
    } catch (err) {
      console.error('Error blasting to all channels:', err);
      return [];
    }
  };

  // Open details modal
  const handleOpenDetails = (job: JobListing, defaultTab: 'overview' | 'tips' | 'track' = 'overview') => {
    setSelectedJobForDetail(job);
    setDetailModalTab(defaultTab);
  };

  // Quick track helper
  const handleQuickTrack = (job: JobListing) => {
    handleOpenDetails(job, 'track');
  };

  // Copy helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Filtered & Sorted Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Search term
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesCompany = job.company.toLowerCase().includes(q);
        const matchesSkills = job.requiredSkills.some(s => s.toLowerCase().includes(q));
        const matchesDesc = job.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCompany && !matchesSkills && !matchesDesc) return false;
      }

      // Domain
      if (selectedDomain !== 'all' && job.domain !== selectedDomain) return false;

      // Job Type
      if (selectedType !== 'all' && job.jobType !== selectedType) return false;

      // Rate threshold
      if (minRate > 0 && job.payRate.min < minRate) return false;

      // Fresh only (scraped within last 24h)
      if (freshOnly) {
        const scrapedDate = new Date(job.scrapedAt).getTime();
        const now = Date.now();
        if (now - scrapedDate > 24 * 60 * 60 * 1000) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'highest-rate') {
        return (b.payRate.max || b.payRate.min) - (a.payRate.max || a.payRate.min);
      }
      if (sortBy === 'newest') {
        return new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime();
      }
      if (sortBy === 'company') {
        return a.company.localeCompare(b.company);
      }
      return 0;
    });
  }, [jobs, searchQuery, selectedDomain, selectedType, minRate, freshOnly, sortBy]);

  // Saved jobs list
  const savedJobsList = useMemo(() => {
    return jobs.filter(j => savedJobIds.has(j.id));
  }, [jobs, savedJobIds]);

  // Applied job IDs set
  const appliedJobIdsSet = useMemo(() => {
    return new Set(applications.map(a => a.jobId));
  }, [applications]);

  // Unread notifications count
  const unreadNotifsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Filtered dispatches for Tab 4
  const filteredDispatchesList = useMemo(() => {
    if (historyFilter === 'all') return channelDispatches;
    return channelDispatches.filter(d => d.channel === historyFilter);
  }, [channelDispatches, historyFilter]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F0F0F0] font-sans flex flex-col selection:bg-[#C8FF00] selection:text-black">
      {/* Toast Notification */}
      {crawlerToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#C8FF00] text-black font-mono font-bold text-xs px-4 py-3 rounded-xl shadow-2xl border-2 border-black flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-black shrink-0" />
          <span>{crawlerToast.message}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAlertSettings={() => setIsAlertSettingsOpen(true)}
        onTriggerDailyFetch={handleTriggerDailyFetch}
        isFetching={isFetchingCrawler}
        fetchStatus={fetchStatus}
        savedCount={savedJobIds.size}
        activeAppsCount={applications.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* VIEW 1: JOBS RADAR & FEED */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {/* Filter Bar with Live Counts */}
            <FiltersBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedDomain={selectedDomain}
              setSelectedDomain={setSelectedDomain}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              minRate={minRate}
              setMinRate={setMinRate}
              freshOnly={freshOnly}
              setFreshOnly={setFreshOnly}
              sortBy={sortBy}
              setSortBy={setSortBy}
              totalMatches={filteredJobs.length}
              onOpenAlertSettings={() => setIsAlertSettingsOpen(true)}
            />

            {/* Jobs Stream Grid */}
            {isLoadingJobs ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                <RefreshCw className="w-8 h-8 animate-spin text-[#C8FF00] mb-3" />
                <p className="text-xs font-mono uppercase tracking-widest">
                  Scanning AI Platforms &amp; Synchronizing Listings...
                </p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="py-20 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800 p-8">
                <ShieldCheck className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-base font-black uppercase text-white font-heading">
                  No matching jobs found
                </h3>
                <p className="text-xs font-mono text-zinc-400 mt-1 max-w-md mx-auto">
                  Try lowering your minimum rate threshold or clearing the search keywords to see all opportunities.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDomain('all');
                    setSelectedType('all');
                    setMinRate(0);
                    setFreshOnly(false);
                  }}
                  className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs uppercase font-bold rounded-xl transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={savedJobIds.has(job.id)}
                    onToggleSave={handleToggleSave}
                    onOpenDetails={handleOpenDetails}
                    onTrackApplication={handleQuickTrack}
                    isApplied={appliedJobIdsSet.has(job.id)}
                  />
                ))}
              </div>
            )}

            {/* Beginner Guide Callout Banner */}
            <div className="mt-8 p-5 bg-gradient-to-r from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 text-[#C8FF00] flex items-center justify-center shrink-0 border border-zinc-700">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase font-heading">
                    New to AI Data Annotation &amp; Remote Work?
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Check our simple FAQ &amp; Guide to learn how companies pay you to grade AI, what RLHF means, and how to pass entrance tests.
                  </p>
                </div>
              </div>

              <button
                id="btn-goto-faq-feed"
                onClick={() => setActiveTab('faq')}
                className="px-4 py-2 bg-zinc-800 hover:bg-[#C8FF00] hover:text-black text-white font-mono font-bold text-xs uppercase rounded-xl transition border border-zinc-700 shrink-0"
              >
                Read Beginner FAQ
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: CAREER & APPLICATION PIPELINE TRACKER */}
        {activeTab === 'applications' && (
          <ApplicationTracker
            applications={applications}
            onUpdateApplication={handleUpdateApplication}
            onDeleteApplication={handleDeleteApplication}
            onOpenJobDetails={jobId => {
              const target = jobs.find(j => j.id === jobId);
              if (target) handleOpenDetails(target);
            }}
            onNavigateToJobs={() => setActiveTab('jobs')}
          />
        )}

        {/* VIEW 3: SAVED OPPORTUNITIES */}
        {activeTab === 'saved' && (
          <SavedOpportunities
            savedJobs={savedJobsList}
            onToggleSave={handleToggleSave}
            onOpenDetails={handleOpenDetails}
            onTrackApplication={handleQuickTrack}
            onNavigateToJobs={() => setActiveTab('jobs')}
          />
        )}

        {/* VIEW 4: MULTI-CHANNEL ALERT HUB (EMAIL, WHATSAPP, TELEGRAM) */}
        {activeTab === 'alerts' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Hub Header */}
            <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-[#C8FF00] flex items-center justify-center">
                    <Radio className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#C8FF00] block">
                        ALERT AUTOMATION HUB
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[9px] font-mono font-bold">
                        EMAIL • WHATSAPP • TELEGRAM
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight font-heading mt-0.5">
                      Multi-Channel Job Alert Delivery
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setIsAlertSettingsOpen(true)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase tracking-wider text-xs rounded-xl border border-zinc-700 transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <span>Configure Channels</span>
                </button>
              </div>

              {/* Status Banner */}
              <div className="mt-6 p-4 bg-zinc-950 border-l-4 border-[#C8FF00] rounded-r-xl text-xs font-mono text-zinc-300 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C8FF00] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm text-white uppercase tracking-wider block">
                    Automated Multi-Channel Forwarding Active
                  </span>
                  <p className="mt-1 text-zinc-400 leading-relaxed">
                    Every morning at 09:00 AM, the server crawls top annotation platforms (Scale AI, Outlier, Alignerr, Athena, Double, Belay, DataAnnotation, Mercor), matches your rate threshold (${alertPreferences.minHourlyRate}+/hr), and forwards the drops directly to your inbox, WhatsApp number, and Telegram channel.
                  </p>
                </div>
              </div>

              {/* Three Channel Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {/* Email Card */}
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400">
                        <Mail className="w-3.5 h-3.5" />
                        Email Digest
                      </span>
                      {alertPreferences.emailAlertsEnabled ? (
                        <span className="text-[9px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 px-1.5 py-0.5 rounded">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">
                          MUTED
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-white block mt-2 truncate">
                      {alertPreferences.email}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 block mt-0.5 uppercase">
                      Cadence: {alertPreferences.frequency}
                    </span>
                  </div>

                  <button
                    onClick={async () => {
                      const record = await handleSendTestDigest(alertPreferences.email);
                      if (record) setSelectedDispatchForPreview(record);
                    }}
                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold uppercase text-[11px] font-mono rounded-lg transition border border-zinc-800"
                  >
                    Test Email Digest
                  </button>
                </div>

                {/* WhatsApp Card */}
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp Alert
                      </span>
                      {alertPreferences.whatsappEnabled ? (
                        <span className="text-[9px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">
                          MUTED
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-white block mt-2 truncate">
                      {alertPreferences.whatsappNumber || '+1 (555) 019-2834'}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">
                      {alertPreferences.whatsappWebhookUrl ? 'Webhook active' : 'Direct Link & API'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSendWhatsAppAlert(alertPreferences.whatsappNumber, alertPreferences.whatsappWebhookUrl)}
                    className="w-full py-2 bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-400 font-bold uppercase text-[11px] font-mono rounded-lg transition border border-emerald-800/50"
                  >
                    Forward to WhatsApp
                  </button>
                </div>

                {/* Telegram Card */}
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-sky-400">
                        <Send className="w-3.5 h-3.5" />
                        Telegram Channel
                      </span>
                      {alertPreferences.telegramEnabled ? (
                        <span className="text-[9px] font-mono font-bold bg-sky-950/80 text-sky-300 border border-sky-800/60 px-1.5 py-0.5 rounded">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">
                          MUTED
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-white block mt-2 truncate">
                      {alertPreferences.telegramChannel || '@AIAnnotationJobsAlert'}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">
                      {alertPreferences.telegramBotToken ? 'Bot token active' : 'Direct Share Link & API'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSendTelegramAlert(alertPreferences.telegramChannel, alertPreferences.telegramBotToken)}
                    className="w-full py-2 bg-sky-950/50 hover:bg-sky-900/50 text-sky-400 font-bold uppercase text-[11px] font-mono rounded-lg transition border border-sky-800/50"
                  >
                    Broadcast to Channel
                  </button>
                </div>
              </div>

              {/* Master Blast Button */}
              <div className="mt-6 pt-6 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase text-white block">
                    Instant Multi-Channel Dispatch
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Forward current top qualifying roles across Email, WhatsApp, and Telegram in 1 click.
                  </span>
                </div>

                <button
                  onClick={handleForwardAllAlerts}
                  className="px-5 py-2.5 bg-[#C8FF00] hover:bg-[#b8eb00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition flex items-center gap-2 shadow-[0_0_20px_rgba(200,255,0,0.25)]"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>BLAST TO ALL CHANNELS NOW</span>
                </button>
              </div>
            </div>

            {/* Dispatches Stream */}
            <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <h3 className="text-sm font-black uppercase tracking-widest text-white">
                  Multi-Channel Dispatch Stream ({channelDispatches.length})
                </h3>

                {/* Filter chips */}
                <div className="flex items-center gap-1.5">
                  {(['all', 'whatsapp', 'telegram', 'email'] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => setHistoryFilter(c)}
                      className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg border transition ${
                        historyFilter === c
                          ? 'bg-[#C8FF00] text-black font-bold border-[#C8FF00]'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {filteredDispatchesList.length === 0 ? (
                  <div className="py-12 text-center text-zinc-600">
                    <Radio className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-mono uppercase">No dispatches in this channel yet</p>
                  </div>
                ) : (
                  filteredDispatchesList.map(item => (
                    <div
                      key={item.id}
                      className="p-4 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-2.5 hover:border-zinc-700 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
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
                          {new Date(item.sentAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>Recipient: <strong className="text-zinc-200">{item.destination}</strong></span>
                        <span className="text-[#C8FF00]">{item.jobCount} Matched Opportunities</span>
                      </div>

                      <div className="text-[11px] font-mono text-zinc-300 bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800/60 whitespace-pre-line max-h-24 overflow-y-auto">
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
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#C8FF00]" />
                              <span>COPIED</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>COPY MESSAGE</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: FAQ & BEGINNER GUIDE (YEAR 10 FRIENDLY) */}
        {activeTab === 'faq' && (
          <FAQSection
            onNavigateToJobs={() => setActiveTab('jobs')}
            onNavigateToAlerts={() => setActiveTab('alerts')}
            onNavigateToTracker={() => setActiveTab('applications')}
          />
        )}
      </main>

      {/* Modals & Popovers */}
      <JobDetailModal
        job={selectedJobForDetail}
        isOpen={!!selectedJobForDetail}
        onClose={() => setSelectedJobForDetail(null)}
        defaultTab={detailModalTab}
        isSaved={selectedJobForDetail ? savedJobIds.has(selectedJobForDetail.id) : false}
        onToggleSave={handleToggleSave}
        onSaveApplication={handleSaveApplication}
        isApplied={selectedJobForDetail ? appliedJobIdsSet.has(selectedJobForDetail.id) : false}
      />

      <NotificationsPopover
        notifications={notifications}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onMarkAsRead={handleMarkAsRead}
        onSelectJob={jobId => {
          const target = jobs.find(j => j.id === jobId);
          if (target) {
            setSelectedJobForDetail(target);
            setDetailModalTab('overview');
          }
        }}
        soundEnabled={alertPreferences.soundAlertsEnabled}
        onToggleSound={() => handleSavePreferences({ ...alertPreferences, soundAlertsEnabled: !alertPreferences.soundAlertsEnabled })}
      />

      <AlertSettingsModal
        isOpen={isAlertSettingsOpen}
        onClose={() => setIsAlertSettingsOpen(false)}
        preferences={alertPreferences}
        onSavePreferences={handleSavePreferences}
        onSendTestDigest={handleSendTestDigest}
        onSendWhatsApp={handleSendWhatsAppAlert}
        onSendTelegram={handleSendTelegramAlert}
        onForwardAll={handleForwardAllAlerts}
        dispatches={emailDispatches}
        channelDispatches={channelDispatches}
        onViewDispatch={record => setSelectedDispatchForPreview(record)}
      />

      <EmailDigestModal
        dispatchRecord={selectedDispatchForPreview}
        isOpen={!!selectedDispatchForPreview}
        onClose={() => setSelectedDispatchForPreview(null)}
      />
    </div>
  );
}
