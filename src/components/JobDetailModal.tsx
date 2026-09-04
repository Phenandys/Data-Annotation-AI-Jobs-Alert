import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ExternalLink, 
  Bookmark, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Copy, 
  Check, 
  AlertTriangle,
  FileText,
  MessageCircle,
  Send
} from 'lucide-react';
import { JobListing, AIFitAnalysis } from '../types';

interface JobDetailModalProps {
  job: JobListing | null;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'overview' | 'tips' | 'track';
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
  onSaveApplication: (appData: any) => void;
  isApplied: boolean;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  defaultTab = 'overview',
  isSaved,
  onToggleSave,
  onSaveApplication,
  isApplied
}) => {
  if (!isOpen || !job) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'tips' | 'track'>(defaultTab);
  const [userBackground, setUserBackground] = useState('Analytical thinker with Python coding, prompt review, and fact-checking experience');
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIFitAnalysis | null>(null);
  const [copiedPitch, setCopiedPitch] = useState(false);

  // Application tracker form fields inside modal
  const [appStatus, setAppStatus] = useState<any>('applied');
  const [appNotes, setAppNotes] = useState('');
  const [appDeadline, setAppDeadline] = useState('');
  const [appHours, setAppHours] = useState(20);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setActiveTab(defaultTab);
    setAiAnalysis(null);
    setSavedSuccess(false);
    if (defaultTab === 'tips') {
      fetchAiTips();
    }
  }, [job, defaultTab]);

  const fetchAiTips = async () => {
    if (!job) return;
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/job-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
          domain: job.domain,
          requiredSkills: job.requiredSkills,
          userBackground
        })
      });
      const data = await res.json();
      if (data.tips) {
        setAiAnalysis(data.tips);
      }
    } catch (err) {
      console.error('Error fetching AI tips:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    onSaveApplication({
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      domain: job.domain,
      payRate: `$${job.payRate.min}${job.payRate.max ? `-$${job.payRate.max}` : ''}/hr`,
      hourlyRateNumeric: job.payRate.min,
      status: appStatus,
      notes: appNotes || `Tracked via Annotate.AI Radar. Qualifier: ${job.assessmentType || 'Standard review'}.`,
      platformUrl: job.applyUrl,
      assessmentDeadline: appDeadline,
      weeklyHoursPlanned: Number(appHours)
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-[#0A0A0B] text-[#F0F0F0] rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-950 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-[#C8FF00] font-black text-lg flex items-center justify-center">
              {job.company.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest font-black text-[#C8FF00] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                  {job.company}
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  {job.location}
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5 font-heading uppercase tracking-tight">
                {job.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleSave(job.id)}
              className={`p-2 rounded-xl border transition ${
                isSaved
                  ? 'bg-zinc-900 text-[#C8FF00] border-[#C8FF00]/40'
                  : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-white'
              }`}
              title={isSaved ? 'Saved' : 'Save opportunity'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#C8FF00]' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 px-5 bg-zinc-950 text-xs uppercase tracking-wider font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-[#C8FF00] text-[#C8FF00] font-black'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Specs &amp; Pay
          </button>
          <button
            onClick={() => {
              setActiveTab('tips');
              if (!aiAnalysis) fetchAiTips();
            }}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'tips'
                ? 'border-[#C8FF00] text-[#C8FF00] font-black'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Test Tips &amp; Rubrics</span>
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'track'
                ? 'border-[#C8FF00] text-[#C8FF00] font-black'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Track Application</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Quick Forward to Channels Bar */}
          <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">
                Forward Opportunity:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `⚡ *AI Job Alert:* ${job.title} at *${job.company}*\n💰 $${job.payRate.min}${job.payRate.max ? `-$${job.payRate.max}` : ''}/${job.payRate.period} • ${job.domain}\n🔗 Apply: ${job.applyUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/60 rounded-lg inline-flex items-center gap-1.5 transition"
                title="Forward via WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(job.applyUrl)}&text=${encodeURIComponent(
                  `⚡ *${job.title}* at *${job.company}*\n💰 $${job.payRate.min}${job.payRate.max ? `-$${job.payRate.max}` : ''}/${job.payRate.period} • ${job.domain}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 text-[11px] font-mono font-bold text-sky-400 bg-sky-950/60 border border-sky-800/60 hover:bg-sky-900/60 rounded-lg inline-flex items-center gap-1.5 transition"
                title="Broadcast to Telegram"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </a>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `⚡ ${job.title} at ${job.company} ($${job.payRate.min}${job.payRate.max ? `-$${job.payRate.max}` : ''}/${job.payRate.period}) - Apply: ${job.applyUrl}`
                  );
                  setCopiedPitch(true);
                  setTimeout(() => setCopiedPitch(false), 2000);
                }}
                className="px-2.5 py-1 text-[11px] font-mono text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg inline-flex items-center gap-1 transition"
                title="Copy job alert text"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Compensation Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-zinc-500 block">Compensation</span>
                  <span className="text-base font-black font-mono text-[#C8FF00] block mt-0.5">
                    ${job.payRate.min}{job.payRate.max ? ` - $${job.payRate.max}` : ''} / hr
                  </span>
                </div>
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-zinc-500 block">Domain</span>
                  <span className="text-xs font-bold text-white block mt-0.5 truncate">
                    {job.domain}
                  </span>
                </div>
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-zinc-500 block">Weekly Hours</span>
                  <span className="text-xs font-mono font-bold text-white block mt-0.5">
                    {job.hoursPerWeek}
                  </span>
                </div>
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-zinc-500 block">Schedule</span>
                  <span className="text-xs font-mono font-bold text-white block mt-0.5">
                    {job.payoutSchedule}
                  </span>
                </div>
              </div>

              {/* Assessment Section */}
              {job.assessmentRequired && (
                <div className="bg-zinc-950 border-l-4 border-[#C8FF00] p-4 rounded-r-xl">
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-5 h-5 text-[#C8FF00] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#C8FF00]">
                        Qualification Assessment Required
                      </h4>
                      <p className="text-xs font-mono text-zinc-300 mt-1">
                        {job.assessmentType}
                      </p>
                      <button
                        onClick={() => {
                          setActiveTab('tips');
                          if (!aiAnalysis) fetchAiTips();
                        }}
                        className="mt-2 text-xs font-black uppercase tracking-wider text-[#C8FF00] hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>View Gemini strategy for passing this qualification test &rarr;</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Description */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                  Role Overview
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                  {job.description}
                </p>
              </div>

              {/* Skills required */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                  Skills &amp; Subject Areas
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills.map(skill => (
                    <span 
                      key={skill}
                      className="px-3 py-1 bg-zinc-950 text-zinc-300 rounded-lg text-xs font-mono border border-zinc-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verified Source */}
              <div className="pt-2 text-xs font-mono text-zinc-500 flex items-center justify-between border-t border-zinc-800">
                <span>SOURCE: <strong className="text-white">{job.source}</strong></span>
                <span>POSTED: {new Date(job.postedAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-4">
              {/* Background input */}
              <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1.5">
                  Tailor tips to your profile:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userBackground}
                    onChange={e => setUserBackground(e.target.value)}
                    placeholder="e.g., Computer science, STEM tutor, linguist..."
                    className="flex-1 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:border-[#C8FF00] focus:outline-none"
                  />
                  <button
                    onClick={fetchAiTips}
                    disabled={loadingAi}
                    className="px-3 py-2 text-xs font-black uppercase tracking-wider text-black bg-[#C8FF00] hover:bg-[#b8eb00] rounded-lg flex items-center gap-1 shrink-0 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
                    <span>{loadingAi ? 'Analyzing...' : 'Re-Analyze'}</span>
                  </button>
                </div>
              </div>

              {loadingAi ? (
                <div className="py-12 text-center">
                  <Sparkles className="w-8 h-8 text-[#C8FF00] animate-spin mx-auto mb-3" />
                  <p className="text-sm font-bold text-white uppercase tracking-wider">
                    Analyzing {job.company} Qualification Rubrics...
                  </p>
                  <p className="text-xs font-mono text-zinc-500 mt-1">
                    Generating calibration advice, screening pitfalls, and custom pitch.
                  </p>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-4">
                  {/* Match Score & Platform Advice */}
                  <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#C8FF00] flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" /> Platform Assessment Strategy
                      </span>
                      <span className="text-xs font-mono font-black text-black bg-[#C8FF00] px-2 py-0.5 rounded">
                        {aiAnalysis.matchScore}% MATCH
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                      {aiAnalysis.platformAdvice}
                    </p>
                  </div>

                  {/* Qualification Test Tips */}
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#C8FF00]" /> Passing the Screening Test
                    </h4>
                    <ul className="space-y-2 text-xs text-zinc-300">
                      {aiAnalysis.assessmentTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-[#C8FF00] text-black flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pitfalls and Hallucination Rubrics */}
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" /> Zero-Tolerance Rubrics
                    </h4>
                    <ul className="space-y-1.5 text-xs font-mono text-zinc-400">
                      {aiAnalysis.keyRubrics.map((rubric, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold shrink-0">•</span>
                          <span>{rubric}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tailored Application Pitch */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Tailored 1-Click Pitch Note
                      </h4>
                      <button
                        onClick={() => copyToClipboard(aiAnalysis.customPitch)}
                        className="text-xs font-mono font-bold text-[#C8FF00] hover:underline flex items-center gap-1"
                      >
                        {copiedPitch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPitch ? 'COPIED' : 'COPY PITCH'}</span>
                      </button>
                    </div>
                    <p className="text-xs font-mono text-zinc-300 bg-zinc-900 p-3 rounded-lg border border-zinc-800 italic leading-relaxed">
                      "{aiAnalysis.customPitch}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <button
                    onClick={fetchAiTips}
                    className="px-4 py-2 bg-[#C8FF00] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Test Tips</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'track' && (
            <form onSubmit={handleTrackSubmit} className="space-y-4">
              <div className="bg-zinc-900 border-l-4 border-[#C8FF00] rounded-r-xl p-3 text-xs font-mono text-zinc-300">
                Tracking this role links it to your weekly earnings calculator and qualification pipeline.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                    Application Status
                  </label>
                  <select
                    value={appStatus}
                    onChange={e => setAppStatus(e.target.value)}
                    className="w-full text-xs font-mono uppercase bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-[#C8FF00] focus:outline-none"
                  >
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="screening">In Screening</option>
                    <option value="assessment">Assessment in Progress</option>
                    <option value="interview">Interview Scheduled</option>
                    <option value="offer">Offer / Active Tasking</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                    Weekly Hours Planned
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={appHours}
                    onChange={e => setAppHours(Number(e.target.value))}
                    className="w-full text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-[#C8FF00] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                  Assessment / Follow-up Deadline
                </label>
                <input
                  type="date"
                  value={appDeadline}
                  onChange={e => setAppDeadline(e.target.value)}
                  className="w-full text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-[#C8FF00] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                  Personal Notes / Qualifier Code
                </label>
                <textarea
                  rows={3}
                  value={appNotes}
                  onChange={e => setAppNotes(e.target.value)}
                  placeholder="e.g., Completed English test. Assigned to Nightingale model queue..."
                  className="w-full text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-[#C8FF00] focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#C8FF00] hover:bg-[#b8eb00] text-black font-black uppercase tracking-wider text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>SAVED TO DASHBOARD!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>{isApplied ? 'UPDATE RECORD' : 'SAVE TO CAREER DASHBOARD'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-zinc-500 hover:text-white transition"
          >
            CLOSE
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('track')}
              className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition"
            >
              TRACK IN PIPELINE
            </button>

            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 text-xs font-black uppercase tracking-wider text-black bg-[#C8FF00] hover:bg-[#b8eb00] rounded-xl transition inline-flex items-center gap-1.5"
            >
              <span>APPLY ON {job.company.toUpperCase()}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
