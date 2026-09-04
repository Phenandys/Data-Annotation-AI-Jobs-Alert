import React from 'react';
import { 
  Bookmark, 
  Sparkles, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Flame, 
  MapPin,
  MessageCircle,
  Send
} from 'lucide-react';
import { JobListing } from '../types';

interface JobCardProps {
  job: JobListing;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
  onOpenDetails: (job: JobListing, defaultTab?: 'overview' | 'tips') => void;
  onTrackApplication: (job: JobListing) => void;
  isApplied: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved,
  onToggleSave,
  onOpenDetails,
  onTrackApplication,
  isApplied
}) => {
  return (
    <div 
      className="bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800 hover:border-[#C8FF00] rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between group shadow-none"
    >
      <div>
        {/* Top Header: Company, Location, Badges & Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 text-[#F0F0F0] flex items-center justify-center font-black text-xs shrink-0 group-hover:border-[#C8FF00] group-hover:text-[#C8FF00] transition">
              {job.company.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-black uppercase text-[#C8FF00] tracking-widest truncate">
                  {job.company}
                </span>
                {job.isNewToday && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.2 rounded">
                    <Flame className="w-2.5 h-2.5 text-rose-400" /> NEW
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 mt-0.5">
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-zinc-600" /> {job.location}
                </span>
                <span>•</span>
                <span className="text-zinc-500">
                  {job.hoursPerWeek}
                </span>
              </div>
            </div>
          </div>

          <button
            id={`btn-save-${job.id}`}
            onClick={() => onToggleSave(job.id)}
            className={`p-2 rounded-xl transition ${
              isSaved 
                ? 'bg-[#C8FF00]/10 text-[#C8FF00]' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save opportunity'}
            aria-label="Save job"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#C8FF00] text-[#C8FF00]' : ''}`} />
          </button>
        </div>

        {/* Job Title */}
        <h3 
          onClick={() => onOpenDetails(job)}
          className="text-base sm:text-lg font-black text-white group-hover:text-[#C8FF00] transition cursor-pointer mb-2 font-heading tracking-tight leading-snug"
        >
          {job.title}
        </h3>

        {/* Compensation Highlight with Bold Mono Pay */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="inline-flex items-baseline gap-1 bg-zinc-950 border border-zinc-800 px-3 py-1 rounded-xl">
            <span className="font-mono text-base font-black text-white">
              ${job.payRate.min}{job.payRate.max ? ` - $${job.payRate.max}` : ''}
            </span>
            <span className="font-mono text-[10px] text-zinc-500 uppercase font-semibold">
              / {job.payRate.period}
            </span>
          </div>

          <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700/60">
            {job.domain}
          </span>

          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
            {job.jobType}
          </span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
          {job.description}
        </p>

        {/* Required Skills Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {job.requiredSkills.slice(0, 4).map(skill => (
            <span 
              key={skill}
              className="text-[10px] font-mono text-zinc-400 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded"
            >
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 4 && (
            <span className="text-[10px] font-mono text-zinc-600 px-1 py-0.5">
              +{job.requiredSkills.length - 4} MORE
            </span>
          )}
        </div>

        {/* Assessment Requirement Alert */}
        {job.assessmentRequired && (
          <div className="bg-zinc-950 border-l-2 border-[#C8FF00] rounded-r-lg px-2.5 py-1.5 mb-4 text-[11px] text-zinc-300 flex items-start gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#C8FF00] shrink-0 mt-0.5" />
            <div className="min-w-0 font-mono text-[10px]">
              <span className="font-bold text-[#C8FF00] uppercase">SCREENING: </span>
              <span className="text-zinc-400">{job.assessmentType || 'Test required'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            id={`btn-ai-tips-${job.id}`}
            onClick={() => onOpenDetails(job, 'tips')}
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#C8FF00] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-[#C8FF00]/60 px-2.5 py-1.5 rounded-lg transition"
            title="Get AI assessment test tips and custom application pitch"
          >
            <Sparkles className="w-3 h-3 text-[#C8FF00]" />
            <span>TEST TIPS</span>
          </button>

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              `⚡ *AI Job Alert:* ${job.title} at *${job.company}* ($${job.payRate.min}${job.payRate.max ? `-$${job.payRate.max}` : ''}/${job.payRate.period})\n👉 Apply: ${job.applyUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-emerald-950/80 text-zinc-500 hover:text-emerald-400 border border-zinc-800/80 hover:border-emerald-800/50 transition"
            title="Forward to WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </a>

          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(job.applyUrl)}&text=${encodeURIComponent(
              `⚡ *${job.title}* at *${job.company}* ($${job.payRate.min}${job.payRate.max ? `-$${job.payRate.max}` : ''}/${job.payRate.period})`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-sky-950/80 text-zinc-500 hover:text-sky-400 border border-zinc-800/80 hover:border-sky-800/50 transition"
            title="Broadcast to Telegram"
          >
            <Send className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex items-center gap-2">
          <button
            id={`btn-track-${job.id}`}
            onClick={() => onTrackApplication(job)}
            className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-lg border transition ${
              isApplied
                ? 'bg-zinc-800 text-[#C8FF00] border-[#C8FF00]/40'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {isApplied ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-[#C8FF00]" />
                <span>TRACKED</span>
              </>
            ) : (
              <>
                <FileText className="w-3 h-3 text-zinc-500" />
                <span>TRACK</span>
              </>
            )}
          </button>

          <a
            id={`btn-apply-${job.id}`}
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-black bg-[#C8FF00] hover:bg-[#b8eb00] px-3.5 py-1.5 rounded-lg shadow-sm transition"
          >
            <span>APPLY</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
