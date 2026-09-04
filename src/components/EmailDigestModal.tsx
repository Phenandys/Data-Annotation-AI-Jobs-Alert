import React from 'react';
import { X, Mail, CheckCircle2 } from 'lucide-react';
import { EmailDispatchRecord } from '../types';

interface EmailDigestModalProps {
  dispatchRecord: EmailDispatchRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmailDigestModal: React.FC<EmailDigestModalProps> = ({
  dispatchRecord,
  isOpen,
  onClose
}) => {
  if (!isOpen || !dispatchRecord) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-3xl bg-[#0A0A0B] text-[#F0F0F0] rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-800 text-[#C8FF00]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-black bg-[#C8FF00] px-2 py-0.5 rounded">
                  DISPATCH CONFIRMED
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  To: <strong className="text-white">{dispatchRecord.recipient}</strong>
                </span>
              </div>
              <h3 className="text-sm md:text-base font-black text-white uppercase tracking-tight font-heading mt-0.5">
                {dispatchRecord.subject}
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

        {/* Email Metadata Ribbon */}
        <div className="px-5 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400 flex flex-wrap items-center justify-between gap-2">
          <span>SENT: {new Date(dispatchRecord.sentAt).toLocaleString()}</span>
          <span>MATCHES: <strong className="text-[#C8FF00]">{dispatchRecord.jobCount} POSITIONS</strong></span>
          <span className="text-[#C8FF00] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> CRON DISPATCH: ACTIVE
          </span>
        </div>

        {/* Rendered HTML Email Preview */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 bg-zinc-950">
          <div 
            className="email-render-container bg-white text-slate-900 p-4 rounded-xl border border-zinc-700"
            dangerouslySetInnerHTML={{ __html: dispatchRecord.htmlContent }}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <span className="text-[11px] font-mono text-zinc-500">
            This preview mirrors the automated HTML digest delivered to your inbox.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase text-xs rounded-xl transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
