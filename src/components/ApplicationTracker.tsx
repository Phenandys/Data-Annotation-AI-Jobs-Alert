import React, { useState } from 'react';
import { 
  FileText, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Edit3, 
  Building2,
  ArrowRight
} from 'lucide-react';
import { ApplicationRecord, ApplicationStatus } from '../types';

interface ApplicationTrackerProps {
  applications: ApplicationRecord[];
  onUpdateApplication: (id: string, updates: Partial<ApplicationRecord>) => void;
  onDeleteApplication: (id: string) => void;
  onAddCustomApplication: (app: Partial<ApplicationRecord>) => void;
  onNavigateToJobs: () => void;
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; badge: string }> = {
  saved: { label: 'SAVED', badge: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
  applied: { label: 'APPLIED', badge: 'bg-zinc-800 text-blue-400 border-blue-500/30' },
  screening: { label: 'SCREENING', badge: 'bg-zinc-800 text-purple-400 border-purple-500/30' },
  assessment: { label: 'ASSESSMENT DUE', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  interview: { label: 'INTERVIEW', badge: 'bg-zinc-800 text-indigo-400 border-indigo-500/30' },
  offer: { label: 'OFFER / ACTIVE', badge: 'bg-[#C8FF00]/20 text-[#C8FF00] border-[#C8FF00]/40' },
  rejected: { label: 'ARCHIVED', badge: 'bg-zinc-900 text-zinc-500 border-zinc-800' }
};

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  onUpdateApplication,
  onDeleteApplication,
  onAddCustomApplication,
  onNavigateToJobs
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  // Form for custom application
  const [customCompany, setCustomCompany] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customRate, setCustomRate] = useState(35);
  const [customHours, setCustomHours] = useState(20);
  const [customStatus, setCustomStatus] = useState<ApplicationStatus>('applied');
  const [customNotes, setCustomNotes] = useState('');

  // KPI Calculations
  const totalTracked = applications.length;
  const inPipeline = applications.filter(a => ['applied', 'screening', 'assessment', 'interview'].includes(a.status)).length;
  const activeOffers = applications.filter(a => a.status === 'offer').length;

  const weeklyProjectedEarned = applications
    .filter(a => a.status === 'offer')
    .reduce((acc, a) => acc + (a.hourlyRateNumeric || 30) * (a.weeklyHoursPlanned || 20), 0);

  const potentialWeeklyFromPipeline = applications
    .filter(a => ['assessment', 'interview'].includes(a.status))
    .reduce((acc, a) => acc + (a.hourlyRateNumeric || 30) * (a.weeklyHoursPlanned || 20), 0);

  const filteredApps = selectedStatusFilter === 'all'
    ? applications
    : applications.filter(a => a.status === selectedStatusFilter);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCompany || !customTitle) return;

    onAddCustomApplication({
      company: customCompany,
      jobTitle: customTitle,
      domain: 'RLHF & LLM Evaluation',
      payRate: `$${customRate}/hr`,
      hourlyRateNumeric: customRate,
      weeklyHoursPlanned: customHours,
      status: customStatus,
      notes: customNotes
    });

    setCustomCompany('');
    setCustomTitle('');
    setCustomNotes('');
    setIsAddingCustom(false);
  };

  return (
    <div className="space-y-6 text-[#F0F0F0]">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#C8FF00]">
              CAREER PIPELINE
            </span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight font-heading">
            Personal Application Dashboard
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Track qualification tests, platform contracts, and projected weekly earnings.
          </p>
        </div>

        <button
          onClick={() => setIsAddingCustom(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-black bg-[#C8FF00] hover:bg-[#b8eb00] rounded-xl shadow-[0_0_15px_rgba(200,255,0,0.25)] transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>TRACK CUSTOM PLATFORM</span>
        </button>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Tracked</p>
          <p className="text-3xl font-black text-white font-mono">{totalTracked}</p>
          <p className="text-[10px] text-zinc-500 font-mono mt-1">Opportunities in log</p>
        </div>

        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Screening / Test</p>
          <p className="text-3xl font-black text-amber-400 font-mono">{inPipeline}</p>
          <p className="text-[10px] text-zinc-500 font-mono mt-1">Awaiting review / test</p>
        </div>

        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Active Contracts</p>
          <p className="text-3xl font-black text-[#C8FF00] font-mono">{activeOffers}</p>
          <p className="text-[10px] text-zinc-500 font-mono mt-1">Task queues assigned</p>
        </div>

        {/* Featured Weekly Goal Card styled like the theme */}
        <div className="p-4 rounded-2xl bg-[#C8FF00] text-black flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase font-black tracking-wider mb-0.5">Weekly Projected</p>
            <p className="text-3xl font-black font-mono leading-none mb-2">
              ${weeklyProjectedEarned.toLocaleString()}
            </p>
          </div>
          <div>
            <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden mb-1.5">
              <div 
                className="h-full bg-black" 
                style={{ width: `${Math.min(100, Math.round((weeklyProjectedEarned / 2000) * 100))}%` }}
              ></div>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-wider">
              +${potentialWeeklyFromPipeline.toLocaleString()} in pipeline
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-800">
        <button
          onClick={() => setSelectedStatusFilter('all')}
          className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-lg transition whitespace-nowrap ${
            selectedStatusFilter === 'all'
              ? 'bg-[#C8FF00] text-black font-black'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          ALL ({totalTracked})
        </button>

        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const count = applications.filter(a => a.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setSelectedStatusFilter(key)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
                selectedStatusFilter === key
                  ? 'bg-[#C8FF00] text-black font-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <span>{config.label}</span>
              {count > 0 && (
                <span className={`text-[10px] font-mono px-1 py-0.2 rounded font-bold ${
                  selectedStatusFilter === key ? 'bg-black text-[#C8FF00]' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add Custom Application Drawer */}
      {isAddingCustom && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
            <h3 className="text-xs uppercase font-black tracking-widest text-[#C8FF00] flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>Track External Annotation Platform</span>
            </h3>
            <button
              onClick={() => setIsAddingCustom(false)}
              className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Company / Platform</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Remotasks, Invisible Tech, Surge AI..."
                  value={customCompany}
                  onChange={e => setCustomCompany(e.target.value)}
                  className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-[#C8FF00] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Senior RLHF Code Annotator..."
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-[#C8FF00] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Hourly Pay ($/hr)</label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={customRate}
                  onChange={e => setCustomRate(Number(e.target.value))}
                  className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-[#C8FF00] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Weekly Target Hours</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={customHours}
                  onChange={e => setCustomHours(Number(e.target.value))}
                  className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-[#C8FF00] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Status</label>
                <select
                  value={customStatus}
                  onChange={e => setCustomStatus(e.target.value as ApplicationStatus)}
                  className="w-full text-xs font-mono uppercase bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-[#C8FF00] focus:outline-none"
                >
                  <option value="applied">Applied</option>
                  <option value="screening">Screening</option>
                  <option value="assessment">Assessment Due</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer / Active</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Notes / Qualifier Code</label>
              <textarea
                rows={2}
                placeholder="Assessment instructions, queue links, or follow-up notes..."
                value={customNotes}
                onChange={e => setCustomNotes(e.target.value)}
                className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-[#C8FF00] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-black uppercase tracking-wider text-black bg-[#C8FF00] hover:bg-[#b8eb00] rounded-xl transition"
              >
                Add to Dashboard
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-3">
        {filteredApps.length === 0 ? (
          <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-500 mx-auto flex items-center justify-center mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">No applications in this category</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Track openings from the job feed to manage screening tests, interview schedules, and payouts.
            </p>
            <button
              onClick={onNavigateToJobs}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider text-black bg-[#C8FF00] hover:bg-[#b8eb00] rounded-xl transition"
            >
              <span>Explore Jobs Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          filteredApps.map(app => {
            const statusStyle = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
            const isEditing = editingId === app.id;

            return (
              <div
                key={app.id}
                className="bg-zinc-900/50 hover:bg-zinc-900/80 rounded-2xl border border-zinc-800 p-4 md:p-5 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-black text-base text-white font-heading">
                        {app.company}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        • {app.jobTitle}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${statusStyle.badge}`}>
                        {statusStyle.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-400">
                      <span className="font-bold text-[#C8FF00]">
                        {app.payRate}
                      </span>
                      <span>•</span>
                      <span>
                        Target: <strong className="text-white">{app.weeklyHoursPlanned || 20} hrs/wk</strong> (~${((app.hourlyRateNumeric || 30) * (app.weeklyHoursPlanned || 20)).toLocaleString()}/wk)
                      </span>
                      <span>•</span>
                      <span className="text-zinc-500">Applied: {app.dateApplied}</span>
                      {app.assessmentDeadline && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due: {app.assessmentDeadline}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={app.status}
                      onChange={e => onUpdateApplication(app.id, { status: e.target.value as ApplicationStatus })}
                      className="text-[10px] font-mono uppercase bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-zinc-300 focus:outline-none focus:border-[#C8FF00] cursor-pointer"
                    >
                      <option value="saved">Saved</option>
                      <option value="applied">Applied</option>
                      <option value="screening">Screening</option>
                      <option value="assessment">Assessment</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer / Active</option>
                      <option value="rejected">Archived</option>
                    </select>

                    {app.platformUrl && (
                      <a
                        href={app.platformUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-zinc-500 hover:text-[#C8FF00] hover:bg-zinc-800 rounded-lg transition"
                        title="Open platform portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => onDeleteApplication(app.id)}
                      className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notes & Quick Editor */}
                <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-start justify-between gap-3 text-xs">
                  {isEditing ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        className="flex-1 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#C8FF00]"
                      />
                      <button
                        onClick={() => {
                          onUpdateApplication(app.id, { notes: editNotes });
                          setEditingId(null);
                        }}
                        className="px-3 py-1.5 bg-[#C8FF00] text-black text-xs font-black uppercase rounded-lg"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 leading-relaxed italic flex-1 font-mono">
                      {app.notes ? `"${app.notes}"` : <span className="text-zinc-600">No notes added yet.</span>}
                    </p>
                  )}

                  {!isEditing && (
                    <button
                      onClick={() => {
                        setEditingId(app.id);
                        setEditNotes(app.notes || '');
                      }}
                      className="text-[10px] font-mono uppercase text-zinc-500 hover:text-[#C8FF00] flex items-center gap-1 shrink-0"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Notes</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
