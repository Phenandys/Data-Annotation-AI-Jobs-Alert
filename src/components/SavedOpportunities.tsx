import React from 'react';
import { 
  Bookmark, 
  ExternalLink, 
  FileText, 
  ArrowRight 
} from 'lucide-react';
import { JobListing } from '../types';

interface SavedOpportunitiesProps {
  savedJobs: JobListing[];
  onToggleSave: (jobId: string) => void;
  onOpenDetails: (job: JobListing) => void;
  onTrackApplication: (job: JobListing) => void;
  onNavigateToJobs: () => void;
}

export const SavedOpportunities: React.FC<SavedOpportunitiesProps> = ({
  savedJobs,
  onToggleSave,
  onOpenDetails,
  onTrackApplication,
  onNavigateToJobs
}) => {
  return (
    <div className="space-y-6 text-[#F0F0F0]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#C8FF00]">
            SAVED BENCH
          </span>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight font-heading mt-0.5">
            Saved Opportunities
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-0.5">
            Bookmarked AI data annotation and RLHF jobs ready for application.
          </p>
        </div>
        <span className="text-xs font-mono font-black bg-zinc-900 text-[#C8FF00] border border-zinc-800 px-3 py-1 rounded-full">
          {savedJobs.length} SAVED
        </span>
      </div>

      {/* List */}
      {savedJobs.length === 0 ? (
        <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-500 mx-auto flex items-center justify-center mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">No saved jobs yet</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Click the bookmark icon on any job card to save opportunities you want to research or apply to later.
          </p>
          <button
            onClick={onNavigateToJobs}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider text-black bg-[#C8FF00] hover:bg-[#b8eb00] rounded-xl transition"
          >
            <span>Browse Active Openings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map(job => (
            <div
              key={job.id}
              className="bg-zinc-900/50 hover:bg-zinc-900/80 rounded-2xl border border-zinc-800 p-5 flex flex-col justify-between transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[9px] font-black uppercase text-[#C8FF00] tracking-widest">
                      {job.company}
                    </span>
                    <h3 
                      onClick={() => onOpenDetails(job)}
                      className="text-base font-black text-white mt-1 hover:text-[#C8FF00] transition cursor-pointer font-heading leading-snug"
                    >
                      {job.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => onToggleSave(job.id)}
                    className="p-1.5 text-[#C8FF00] hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition"
                    title="Remove from saved"
                  >
                    <Bookmark className="w-4 h-4 fill-[#C8FF00]" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono font-bold text-white bg-zinc-950 px-2.5 py-0.5 rounded border border-zinc-800">
                    ${job.payRate.min}{job.payRate.max ? ` - $${job.payRate.max}` : ''}/hr
                  </span>
                  <span className="text-[10px] font-mono uppercase text-zinc-400">
                    {job.domain}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 mb-3 font-mono">
                  {job.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onTrackApplication(job)}
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-300 hover:text-white bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-lg transition"
                >
                  <FileText className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Move to Tracker</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenDetails(job)}
                    className="text-xs font-mono text-[#C8FF00] hover:underline px-2 py-1"
                  >
                    Specs
                  </button>
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#C8FF00] hover:bg-[#b8eb00] text-black font-black text-xs uppercase tracking-wider rounded-lg transition"
                  >
                    <span>Apply</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
