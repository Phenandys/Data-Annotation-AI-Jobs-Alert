export interface PayRate {
  min: number;
  max?: number;
  currency: string;
  period: 'hour' | 'task' | 'month';
}

export type JobDomain =
  | 'RLHF & LLM Evaluation'
  | 'Multimodal & Vision'
  | 'Code & STEM Annotation'
  | 'Language & Audio'
  | 'AI Safety & Red Teaming'
  | 'Domain Expert (Law/Med/Finance)'
  | 'Virtual Assistant & Allied';

export type JobType =
  | 'Hourly Contract'
  | 'Project-Based'
  | 'Full-Time Remote'
  | 'Part-Time';

export type ExperienceLevel =
  | 'Entry-Level'
  | 'Intermediate'
  | 'Advanced Specialist';

export interface JobListing {
  id: string;
  title: string;
  company: string;
  domain: JobDomain;
  jobType: JobType;
  payRate: PayRate;
  location: string;
  postedAt: string;
  isNewToday: boolean;
  source: string;
  applyUrl: string;
  description: string;
  requiredSkills: string[];
  assessmentRequired: boolean;
  assessmentType?: string;
  hoursPerWeek: string;
  payoutSchedule: string;
  difficultyLevel: ExperienceLevel;
  featured?: boolean;
}

export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'screening'
  | 'assessment'
  | 'interview'
  | 'offer'
  | 'rejected';

export interface ApplicationRecord {
  id: string;
  jobId?: string;
  jobTitle: string;
  company: string;
  domain: JobDomain | string;
  payRate: string;
  hourlyRateNumeric?: number;
  status: ApplicationStatus;
  dateApplied: string;
  lastUpdated: string;
  notes: string;
  platformUrl?: string;
  assessmentDeadline?: string;
  interviewDate?: string;
  weeklyHoursPlanned?: number;
}

export interface AlertPreferences {
  email: string;
  frequency: 'instant' | 'daily' | 'weekly';
  minHourlyRate: number;
  selectedDomains: JobDomain[];
  selectedTypes: JobType[];
  emailAlertsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  soundAlertsEnabled: boolean;
  keywordWatchlist: string[];
  // WhatsApp forwarding
  whatsappEnabled: boolean;
  whatsappNumber: string; // e.g. +1234567890
  whatsappWebhookUrl?: string;
  // Telegram Channel forwarding
  telegramEnabled: boolean;
  telegramChannel: string; // e.g. @AIAnnotationAlerts or channel ID
  telegramBotToken?: string; // Optional custom bot token
}

export interface ChannelDispatchRecord {
  id: string;
  channel: 'email' | 'whatsapp' | 'telegram';
  destination: string;
  title: string;
  body: string;
  jobCount: number;
  sentAt: string;
  status: 'delivered' | 'sent' | 'simulated';
  directLink?: string; // WhatsApp wa.me link or Telegram t.me link
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  jobId?: string;
  type: 'new_match' | 'daily_fetch' | 'deadline_reminder' | 'status_change';
}

export interface FetchStatus {
  lastFetchedAt: string;
  nextScheduledFetch: string;
  totalJobs: number;
  newJobsToday: number;
  isFetching: boolean;
  autoFetchIntervalMinutes: number;
  lastLog?: string;
}

export interface EmailDispatchRecord {
  id: string;
  recipient: string;
  subject: string;
  sentAt: string;
  jobCount: number;
  htmlContent: string;
  status: 'delivered' | 'simulated' | 'queued';
  frequency: string;
}

export interface AIFitAnalysis {
  assessmentTips: string[];
  keyRubrics: string[];
  platformAdvice: string;
  customPitch: string;
  matchScore: number;
}
