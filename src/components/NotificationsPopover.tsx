import React from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  ExternalLink, 
  Clock, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  X,
  Send
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsPopoverProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id?: string, markAll?: boolean) => void;
  onSelectJob: (jobId: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onSelectJob,
  soundEnabled,
  onToggleSound
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Annotate.AI Radar Alerts Enabled', {
          body: 'You will receive real-time push alerts when high-paying AI data annotation jobs are posted.',
          icon: '/favicon.ico'
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end md:justify-center md:items-start md:pt-16 p-0 md:p-4 bg-black/70 backdrop-blur-xs">
      <div 
        className="w-full md:max-w-md bg-[#0A0A0B] text-[#F0F0F0] rounded-t-2xl md:rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] md:max-h-[80vh] mt-auto md:mt-0 animate-in slide-in-from-bottom md:zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-[#C8FF00]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-xs uppercase tracking-widest text-white">Live Job Alerts</h3>
              <p className="text-[10px] font-mono text-zinc-500">
                {unreadCount > 0 ? `${unreadCount} UNREAD ALERTS` : 'ALL ALERTS CAUGHT UP'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleSound}
              className={`p-1.5 rounded-lg text-xs transition ${
                soundEnabled ? 'text-[#C8FF00] hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-800'
              }`}
              title={soundEnabled ? 'Alert chime enabled' : 'Alert chime muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Browser Push Permission Strip */}
        <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[#C8FF00] shrink-0" />
            <span>Enable browser push notifications</span>
          </span>
          <button
            onClick={requestBrowserPermission}
            className="text-[10px] uppercase font-black tracking-wider text-[#C8FF00] hover:underline"
          >
            Allow
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1 divide-y divide-zinc-800/80">
          {notifications.length === 0 ? (
            <div className="py-12 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-zinc-900 text-zinc-600 mx-auto flex items-center justify-center mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-xs font-black uppercase tracking-wider text-zinc-400">No notifications yet</p>
              <p className="text-[10px] font-mono text-zinc-600 mt-1">
                You will be notified immediately when daily crawls detect new annotation and RLHF jobs.
              </p>
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id}
                className={`p-4 transition hover:bg-zinc-900/60 flex items-start gap-3 cursor-pointer ${
                  !notif.read ? 'bg-zinc-900/40 border-l-2 border-[#C8FF00]' : 'bg-transparent'
                }`}
                onClick={() => {
                  onMarkAsRead(notif.id);
                  if (notif.jobId) {
                    onSelectJob(notif.jobId);
                    onClose();
                  }
                }}
              >
                <div className="mt-0.5 shrink-0">
                  {notif.type === 'new_match' && (
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 text-[#C8FF00] flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {notif.type === 'daily_fetch' && (
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 text-blue-400 flex items-center justify-center">
                      <Send className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {notif.type === 'deadline_reminder' && (
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 text-amber-400 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {notif.type === 'status_change' && (
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 text-[#C8FF00] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-bold uppercase tracking-wider ${!notif.read ? 'text-white' : 'text-zinc-400'}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] font-mono text-zinc-500 whitespace-nowrap">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  {notif.jobId && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#C8FF00] mt-1.5 hover:underline">
                      View Opportunity <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-[#C8FF00] shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs font-mono">
            <button
              onClick={() => onMarkAsRead(undefined, true)}
              className="text-zinc-400 hover:text-white font-medium flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#C8FF00]" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Mark all as read</span>
            </button>
            <span className="text-zinc-600 text-[10px] uppercase font-mono">Scanner: Active</span>
          </div>
        )}
      </div>
    </div>
  );
};
