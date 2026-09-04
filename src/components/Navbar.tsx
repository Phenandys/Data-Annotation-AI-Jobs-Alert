import React from 'react';
import { 
  Search, 
  Bell, 
  Mail, 
  Bookmark, 
  FileText, 
  RefreshCw, 
  Sparkles,
  Zap,
  HelpCircle
} from 'lucide-react';
import { FetchStatus } from '../types';

interface NavbarProps {
  activeTab: 'jobs' | 'applications' | 'saved' | 'alerts' | 'faq';
  setActiveTab: (tab: 'jobs' | 'applications' | 'saved' | 'alerts' | 'faq') => void;
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  onOpenAlertSettings: () => void;
  onTriggerDailyFetch: () => void;
  isFetching: boolean;
  fetchStatus: FetchStatus | null;
  savedCount: number;
  activeAppsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  unreadNotifsCount,
  onOpenNotifications,
  onOpenAlertSettings,
  onTriggerDailyFetch,
  isFetching,
  fetchStatus,
  savedCount,
  activeAppsCount
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0B]/95 backdrop-blur-md border-b border-zinc-800 text-[#F0F0F0]">
      {/* Top Ticker with Automated Daily Status */}
      <div className="bg-black/90 border-b border-zinc-900 text-zinc-400 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8FF00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C8FF00]"></span>
            </span>
            <span className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black">Scanner:</span>
            <span className="text-[#C8FF00] font-mono text-xs font-bold">LIVE &amp; SYNCED</span>
            <span className="hidden md:inline text-zinc-700">•</span>
            <span className="hidden md:inline text-zinc-400 text-[11px] font-mono">
              LAST FETCH: {fetchStatus ? new Date(fetchStatus.lastFetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00 AM'}
            </span>
            <span className="hidden lg:inline text-zinc-700">•</span>
            <span className="hidden lg:inline text-zinc-500 text-[11px] font-mono uppercase">
              Scale AI • Athena • Outlier • Double • Alignerr • Belay • DataAnnotation • Mercor
            </span>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              id="btn-scan-now"
              onClick={onTriggerDailyFetch}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider text-black bg-[#C8FF00] hover:bg-[#b8eb00] px-2.5 py-0.5 rounded transition disabled:opacity-50"
              title="Trigger an on-demand scan across AI annotation boards"
            >
              <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
              <span>{isFetching ? 'CRAWLING...' : 'SCAN NOW'}</span>
            </button>
            <button
              id="btn-nav-faq-ticker"
              onClick={() => setActiveTab('faq')}
              className={`text-[10px] uppercase font-mono tracking-wider flex items-center gap-1 transition ${
                activeTab === 'faq' ? 'text-[#C8FF00] font-bold' : 'text-zinc-400 hover:text-[#C8FF00]'
              }`}
              title="Read beginner guide and frequently asked questions"
            >
              <HelpCircle className="w-3 h-3 text-[#C8FF00]" />
              <span>HOW IT WORKS / FAQ</span>
            </button>
            <button
              id="btn-alert-preview"
              onClick={onOpenAlertSettings}
              className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 hover:text-[#C8FF00] flex items-center gap-1 transition"
            >
              <Mail className="w-3 h-3 text-[#C8FF00]" />
              <span>DIGEST ACTIVE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('jobs')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-9 h-9 bg-[#C8FF00] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(200,255,0,0.25)] group-hover:scale-105 transition-transform">
                <div className="w-3.5 h-3.5 bg-black rounded-xs rotate-45"></div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm uppercase tracking-[0.2em] text-[#F0F0F0]">
                    Annotate<span className="text-[#C8FF00]">.AI</span>
                  </span>
                  <span className="text-[9px] uppercase font-black tracking-widest bg-zinc-800 text-[#C8FF00] border border-zinc-700 px-1.5 py-0.5 rounded">
                    Radar
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 leading-none hidden sm:block mt-0.5">
                  RLHF &amp; Annotation Alert Engine
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
            <button
              id="nav-tab-jobs"
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider font-bold transition ${
                activeTab === 'jobs'
                  ? 'bg-[#C8FF00] text-black font-black shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Search className={`w-3.5 h-3.5 ${activeTab === 'jobs' ? 'text-black' : 'text-zinc-400'}`} />
              <span>Jobs Feed</span>
              {fetchStatus?.newJobsToday ? (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-black ${
                  activeTab === 'jobs' ? 'bg-black text-[#C8FF00]' : 'bg-zinc-800 text-[#C8FF00]'
                }`}>
                  +{fetchStatus.newJobsToday}
                </span>
              ) : null}
            </button>

            <button
              id="nav-tab-applications"
              onClick={() => setActiveTab('applications')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider font-bold transition ${
                activeTab === 'applications'
                  ? 'bg-[#C8FF00] text-black font-black shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <FileText className={`w-3.5 h-3.5 ${activeTab === 'applications' ? 'text-black' : 'text-zinc-400'}`} />
              <span>Career Tracker</span>
              {activeAppsCount > 0 && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-black ${
                  activeTab === 'applications' ? 'bg-black text-[#C8FF00]' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {activeAppsCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-saved"
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider font-bold transition ${
                activeTab === 'saved'
                  ? 'bg-[#C8FF00] text-black font-black shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${activeTab === 'saved' ? 'text-black' : 'text-zinc-400'}`} />
              <span>Saved</span>
              {savedCount > 0 && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-black ${
                  activeTab === 'saved' ? 'bg-black text-[#C8FF00]' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {savedCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-alerts"
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider font-bold transition ${
                activeTab === 'alerts'
                  ? 'bg-[#C8FF00] text-black font-black shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Mail className={`w-3.5 h-3.5 ${activeTab === 'alerts' ? 'text-black' : 'text-zinc-400'}`} />
              <span>Alerts Hub</span>
            </button>

            <button
              id="nav-tab-faq"
              onClick={() => setActiveTab('faq')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider font-bold transition ${
                activeTab === 'faq'
                  ? 'bg-[#C8FF00] text-black font-black shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <HelpCircle className={`w-3.5 h-3.5 ${activeTab === 'faq' ? 'text-black' : 'text-zinc-400'}`} />
              <span>FAQ &amp; Guide</span>
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2.5">
            <button
              id="btn-open-notifications"
              onClick={onOpenNotifications}
              className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-xl transition"
              aria-label="Open notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C8FF00] text-[9px] font-mono font-black text-black ring-2 ring-black">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            <button
              id="btn-open-alert-modal"
              onClick={onOpenAlertSettings}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl transition"
            >
              <Mail className="w-3.5 h-3.5 text-[#C8FF00]" />
              <span>Configure Alerts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0B]/95 backdrop-blur-md border-t border-zinc-800 px-3 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] uppercase font-bold tracking-wider ${
            activeTab === 'jobs' ? 'text-[#C8FF00]' : 'text-zinc-500'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] uppercase font-bold tracking-wider relative ${
            activeTab === 'applications' ? 'text-[#C8FF00]' : 'text-zinc-500'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Tracker</span>
          {activeAppsCount > 0 && (
            <span className="absolute top-0 right-3 h-2 w-2 rounded-full bg-[#C8FF00]"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] uppercase font-bold tracking-wider relative ${
            activeTab === 'saved' ? 'text-[#C8FF00]' : 'text-zinc-500'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span>Saved</span>
          {savedCount > 0 && (
            <span className="absolute top-0 right-3 h-2 w-2 rounded-full bg-[#C8FF00]"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] uppercase font-bold tracking-wider ${
            activeTab === 'alerts' ? 'text-[#C8FF00]' : 'text-zinc-500'
          }`}
        >
          <Mail className="w-5 h-5" />
          <span>Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('faq')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] uppercase font-bold tracking-wider ${
            activeTab === 'faq' ? 'text-[#C8FF00]' : 'text-zinc-500'
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          <span>FAQ</span>
        </button>
      </div>
    </header>
  );
};
