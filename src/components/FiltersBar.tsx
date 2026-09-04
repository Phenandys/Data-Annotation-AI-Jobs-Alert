import React from 'react';
import { 
  Search, 
  X, 
  Flame, 
  DollarSign, 
  ArrowUpDown
} from 'lucide-react';

interface FiltersBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDomain: string;
  setSelectedDomain: (domain: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  minRate: number;
  setMinRate: (rate: number) => void;
  freshOnly: boolean;
  setFreshOnly: (val: boolean) => void;
  sortBy: 'highest-rate' | 'newest' | 'company';
  setSortBy: (sort: 'highest-rate' | 'newest' | 'company') => void;
  totalMatches: number;
  onResetFilters: () => void;
}

const DOMAINS: { label: string; value: string }[] = [
  { label: 'ALL DOMAINS', value: 'all' },
  { label: 'VIRTUAL ASSISTANT & ALLIED', value: 'Virtual Assistant & Allied' },
  { label: 'RLHF & LLM EVAL', value: 'RLHF & LLM Evaluation' },
  { label: 'CODE & STEM', value: 'Code & STEM Annotation' },
  { label: 'MULTIMODAL & VISION', value: 'Multimodal & Vision' },
  { label: 'AI SAFETY & RED TEAM', value: 'AI Safety & Red Teaming' },
  { label: 'LANGUAGE & AUDIO', value: 'Language & Audio' },
  { label: 'DOMAIN EXPERTS', value: 'Domain Expert (Law/Med/Finance)' }
];

const PAY_PRESETS = [0, 25, 40, 60, 80];

export const FiltersBar: React.FC<FiltersBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedDomain,
  setSelectedDomain,
  selectedType,
  setSelectedType,
  minRate,
  setMinRate,
  freshOnly,
  setFreshOnly,
  sortBy,
  setSortBy,
  totalMatches,
  onResetFilters
}) => {
  const isFiltered = searchQuery !== '' || selectedDomain !== 'all' || selectedType !== 'all' || minRate > 0 || freshOnly;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 md:p-5 mb-6 text-[#F0F0F0]">
      {/* Search and Secondary Dropdowns */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            id="input-search-jobs"
            type="text"
            placeholder="Search keywords (e.g., Python RLHF, Multimodal, Outlier, Scale, Medical)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00]/40 transition placeholder:text-zinc-600 text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white rounded-md"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Rate & Sort Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            id="filter-fresh-toggle"
            onClick={() => setFreshOnly(!freshOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider font-black shrink-0 transition ${
              freshOnly
                ? 'bg-[#C8FF00] text-black shadow-[0_0_15px_rgba(200,255,0,0.25)]'
                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${freshOnly ? 'text-black' : 'text-[#C8FF00]'}`} />
            <span>NEW TODAY</span>
          </button>

          {/* Job Type Dropdown */}
          <select
            id="select-job-type"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="text-xs font-mono uppercase bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-[#C8FF00] cursor-pointer"
          >
            <option value="all">ALL JOB TYPES</option>
            <option value="Hourly Contract">HOURLY CONTRACT</option>
            <option value="Project-Based">PROJECT-BASED</option>
            <option value="Full-Time Remote">FULL-TIME REMOTE</option>
            <option value="Part-Time">PART-TIME</option>
          </select>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <select
              id="select-sort-by"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-mono uppercase text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="highest-rate">HIGHEST PAY ($/HR)</option>
              <option value="newest">NEWEST FIRST</option>
              <option value="company">COMPANY (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Domain Chips */}
      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#C8FF00] shrink-0 mr-1">
          FILTERS:
        </span>
        {DOMAINS.map(d => (
          <button
            key={d.value}
            onClick={() => setSelectedDomain(d.value)}
            className={`px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold whitespace-nowrap transition shrink-0 ${
              selectedDomain === d.value
                ? 'bg-[#C8FF00] text-black font-black shadow-[0_0_12px_rgba(200,255,0,0.2)]'
                : 'bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Min Rate Selector Pills & Results Count */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-mono text-[11px] uppercase flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-[#C8FF00]" />
            MIN PAY:
          </span>
          <div className="flex items-center gap-1 font-mono">
            {PAY_PRESETS.map(p => (
              <button
                key={p}
                onClick={() => setMinRate(p)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                  minRate === p
                    ? 'bg-[#C8FF00] text-black font-black'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {p === 0 ? 'ANY' : `$${p}+/HR`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-zinc-400 font-mono text-xs">
            RADAR: <strong className="text-white font-bold">{totalMatches}</strong> ACTIVE OPPORTUNITIES
          </span>
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="text-[#C8FF00] hover:underline text-[10px] uppercase font-black tracking-wider flex items-center gap-1"
            >
              RESET
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
