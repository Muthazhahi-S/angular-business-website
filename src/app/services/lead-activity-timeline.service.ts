import { Injectable, signal } from '@angular/core';
import { LeadStatus } from './dashboard-api.types';

export type LeadActivityIcon = 'created' | 'status' | 'draft' | 'copy' | 'whatsapp';

export interface LeadActivity {
  id: string;
  description: string;
  timestamp: string | null;
  icon: LeadActivityIcon;
}

@Injectable({ providedIn: 'root' })
export class LeadActivityTimelineService {
  private readonly activitiesByLead = signal<Record<string, LeadActivity[]>>({});
  private sequence = 0;

  activitiesForLead(leadId: string): LeadActivity[] {
    return this.activitiesByLead()[leadId] ?? [];
  }

  recordStatusChange(leadId: string, oldStatus: LeadStatus, newStatus: LeadStatus): void {
    if (oldStatus === newStatus) return;
    this.record(leadId, `Status changed from ${oldStatus} to ${newStatus}`, 'status');
  }

  recordFollowUpDrafted(leadId: string): void {
    this.record(leadId, 'Follow-up message drafted', 'draft');
  }

  recordFollowUpCopied(leadId: string): void {
    this.record(leadId, 'Follow-up message copied', 'copy');
  }

  recordWhatsAppOpened(leadId: string): void {
    this.record(leadId, 'WhatsApp follow-up opened', 'whatsapp');
  }

  private record(
    leadId: string,
    description: string,
    icon: Exclude<LeadActivityIcon, 'created'>,
  ): void {
    const activity: LeadActivity = {
      id: `${leadId}-${++this.sequence}`,
      description,
      timestamp: new Date().toISOString(),
      icon,
    };
    this.activitiesByLead.update((activities) => ({
      ...activities,
      [leadId]: [...(activities[leadId] ?? []), activity],
    }));
  }
}
