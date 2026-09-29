import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LeadSource, LeadStatus } from '../../services/dashboard-api.types';
import { LeadActivity, LeadActivityTimelineService } from '../../services/lead-activity-timeline.service';
import { LeadsApiService } from '../../services/leads-api.service';
import { CreateLeadRequest, LeadCustomer, LeadRecord } from '../../services/leads-api.types';
import {
  createFollowUpMessage,
  createWhatsAppUrl,
  normalizeWhatsAppPhone,
} from '../../services/lead-follow-up.utils';

const LEAD_STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];
const LEAD_SOURCES: LeadSource[] = [
  'WEBSITE',
  'WHATSAPP',
  'INSTAGRAM',
  'FACEBOOK',
  'REFERRAL',
  'PHONE',
  'EMAIL',
  'OTHER',
];

@Component({
  selector: 'app-leads-page',
  imports: [DatePipe, FormsModule],
  templateUrl: './leads-page.html',
  styleUrl: './leads-page.scss',
})
export class LeadsPage {
  readonly searchTerm = input('');
  readonly selectedLeadId = input<string | null>(null);
  readonly createDialogRequestId = input<number | null>(null);
  readonly leadSelectionHandled = output<void>();
  readonly createDialogRequestHandled = output<void>();

  private readonly leadsApi = inject(LeadsApiService);
  private readonly activityTimeline = inject(LeadActivityTimelineService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly leads = signal<LeadRecord[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly updatingLeadIds = signal<ReadonlySet<string>>(new Set());
  protected readonly statusFilter = signal<LeadStatus | ''>('');
  protected readonly sourceFilter = signal<LeadSource | ''>('');
  protected readonly createDialogOpen = signal(false);
  protected readonly createError = signal<string | null>(null);
  protected readonly detailsLead = signal<LeadRecord | null>(null);
  protected readonly detailsSaving = signal(false);
  protected readonly detailsError = signal<string | null>(null);
  protected readonly detailsPendingStatus = signal<LeadStatus | null>(null);
  protected readonly detailsDraft = signal('');
  protected readonly detailsCopied = signal(false);
  protected readonly detailsCopyError = signal<string | null>(null);
  protected readonly statuses = LEAD_STATUSES;
  protected readonly sources = LEAD_SOURCES;
  private handledLeadId: string | null = null;
  private handledCreateDialogRequestId: number | null = null;
  private readonly openSelectedLead = effect(() => {
    const selectedId = this.selectedLeadId();
    if (!selectedId) {
      this.handledLeadId = null;
      return;
    }
    const lead = this.leads().find((item) => item.id === selectedId);
    if (!lead || this.handledLeadId === selectedId) return;
    this.handledLeadId = selectedId;
    this.openDetails(lead);
    this.leadSelectionHandled.emit();
  });
  private readonly openRequestedCreateDialog = effect(() => {
    const requestId = this.createDialogRequestId();
    if (requestId === null || requestId === this.handledCreateDialogRequestId) return;
    this.handledCreateDialogRequestId = requestId;
    this.openCreateDialog();
    this.createDialogRequestHandled.emit();
  });

  protected readonly detailsActivities = computed<LeadActivity[]>(() => {
    const lead = this.detailsLead();
    if (!lead) return [];

    const createdActivity: LeadActivity = {
      id: `created-${lead.id}`,
      description: 'Lead created',
      timestamp: this.validTimestamp(lead.createdAt),
      icon: 'created',
    };
    return [createdActivity, ...this.activityTimeline.activitiesForLead(lead.id)].sort(
      (left, right) =>
        (right.timestamp ? Date.parse(right.timestamp) : Number.NEGATIVE_INFINITY) -
        (left.timestamp ? Date.parse(left.timestamp) : Number.NEGATIVE_INFINITY),
    );
  });

  protected readonly customers = computed<LeadCustomer[]>(() => {
    const customersById = new Map<string, LeadCustomer>();
    for (const lead of this.leads()) {
      if (lead.customer) customersById.set(lead.customer.id, lead.customer);
    }
    return [...customersById.values()].sort((left, right) => left.name.localeCompare(right.name));
  });

  protected readonly filteredLeads = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.leads().filter((lead) => {
      const matchesStatus = !this.statusFilter() || lead.status === this.statusFilter();
      const matchesSource = !this.sourceFilter() || lead.source === this.sourceFilter();
      const matchesSearch =
        !term ||
        `${lead.customer?.name ?? ''} ${lead.customer?.email ?? ''} ${lead.service} ${lead.message ?? ''}`
          .toLowerCase()
          .includes(term);
      return matchesStatus && matchesSource && matchesSearch;
    });
  });

  constructor() {
    this.loadLeads();
  }

  protected loadLeads(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.leadsApi
      .getLeads()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (leads) => {
          this.leads.set(leads);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.getErrorMessage(error));
          this.loading.set(false);
        },
      });
  }

  protected setStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as LeadStatus | '');
  }

  protected setSourceFilter(event: Event): void {
    this.sourceFilter.set((event.target as HTMLSelectElement).value as LeadSource | '');
  }

  protected updateLeadStatus(
    lead: LeadRecord,
    status: LeadStatus,
    select: HTMLSelectElement,
  ): void {
    if (status === lead.status || this.updatingLeadIds().has(lead.id)) return;

    this.updatingLeadIds.update((ids) => new Set(ids).add(lead.id));
    this.actionError.set(null);
    this.leads.update((current) =>
      current.map((item) => (item.id === lead.id ? { ...item, status } : item)),
    );
    this.leadsApi
      .updateLead(lead.id, { status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedLead) => {
          this.activityTimeline.recordStatusChange(lead.id, lead.status, updatedLead.status);
          this.leads.update((current) =>
            current.map((item) => (item.id === updatedLead.id ? updatedLead : item)),
          );
          this.updatingLeadIds.update((ids) => {
            const next = new Set(ids);
            next.delete(lead.id);
            return next;
          });
        },
        error: (error: unknown) => {
          this.leads.update((current) =>
            current.map((item) =>
              item.id === lead.id ? { ...item, status: lead.status } : item,
            ),
          );
          select.value = lead.status;
          this.actionError.set(this.getErrorMessage(error));
          this.updatingLeadIds.update((ids) => {
            const next = new Set(ids);
            next.delete(lead.id);
            return next;
          });
        },
      });
  }

  protected openDetails(lead: LeadRecord): void {
    this.detailsLead.set(lead);
    this.detailsError.set(null);
    this.detailsPendingStatus.set(null);
    this.clearDetailsDraft();
  }

  protected closeDetails(): void {
    if (this.detailsSaving()) return;
    this.detailsLead.set(null);
    this.detailsError.set(null);
    this.detailsPendingStatus.set(null);
    this.clearDetailsDraft();
  }

  protected updateDetailsStatus(event: Event): void {
    const lead = this.detailsLead();
    const status = (event.target as HTMLSelectElement).value as LeadStatus;
    if (!lead || status === lead.status || this.detailsSaving()) return;
    this.saveDetailsStatus(lead, status);
  }

  protected retryDetailsStatus(): void {
    const lead = this.detailsLead();
    const status = this.detailsPendingStatus();
    if (lead && status) this.saveDetailsStatus(lead, status);
  }

  protected customerInformationAvailable(lead: LeadRecord): boolean {
    return Boolean(lead.customer?.name || lead.customer?.email || lead.customer?.phone);
  }

  protected draftDetailsFollowUp(): void {
    const lead = this.detailsLead();
    if (!lead) return;
    this.detailsDraft.set(createFollowUpMessage(lead));
    this.detailsCopied.set(false);
    this.detailsCopyError.set(null);
    this.activityTimeline.recordFollowUpDrafted(lead.id);
  }

  protected updateDetailsDraft(event: Event): void {
    this.detailsDraft.set((event.target as HTMLTextAreaElement).value);
    this.detailsCopied.set(false);
  }

  protected async copyDetailsDraft(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.detailsDraft());
      this.detailsCopied.set(true);
      this.detailsCopyError.set(null);
      const lead = this.detailsLead();
      if (lead) this.activityTimeline.recordFollowUpCopied(lead.id);
    } catch {
      this.detailsCopyError.set('Could not copy the message. Please select and copy it manually.');
    }
  }

  protected whatsAppPhone(phone: string | null | undefined): string | null {
    return normalizeWhatsAppPhone(phone);
  }

  protected sendDetailsViaWhatsApp(phone: string | null | undefined): void {
    const url = createWhatsAppUrl(phone, this.detailsDraft());
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      const lead = this.detailsLead();
      if (lead) this.activityTimeline.recordWhatsAppOpened(lead.id);
    }
  }

  protected clearDetailsDraft(): void {
    this.detailsDraft.set('');
    this.detailsCopied.set(false);
    this.detailsCopyError.set(null);
  }

  protected openCreateDialog(): void {
    this.createError.set(null);
    this.createDialogOpen.set(true);
  }

  protected closeCreateDialog(): void {
    if (!this.saving()) this.createDialogOpen.set(false);
  }

  protected createLead(event: SubmitEvent): void {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;
    const values = new FormData(form);
    const lead: Omit<CreateLeadRequest, 'businessId'> = {
      customerId: String(values.get('customerId') ?? ''),
      service: String(values.get('service') ?? '').trim(),
      source: String(values.get('source') ?? 'WEBSITE') as LeadSource,
      status: 'NEW',
      message: String(values.get('message') ?? '').trim() || null,
    };

    this.saving.set(true);
    this.createError.set(null);
    this.leadsApi
      .createLead(lead)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (createdLead) => {
          this.leads.update((current) => [
            createdLead,
            ...current.filter((item) => item.id !== createdLead.id),
          ]);
          this.statusFilter.set('');
          this.sourceFilter.set('');
          this.createDialogOpen.set(false);
          this.saving.set(false);
        },
        error: (error: unknown) => {
          this.createError.set(this.getErrorMessage(error));
          this.saving.set(false);
        },
      });
  }

  protected formatEnumLabel(value: string): string {
    return value
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  protected statusClass(status: LeadStatus): string {
    return status.toLowerCase();
  }

  protected trackLead(_index: number, lead: LeadRecord): string {
    return lead.id;
  }

  private getErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'The lead request could not be completed. Please try again.';
    }
    if (error.status === 0) {
      return 'Could not connect to BizPilot. Check that the backend is running on port 3000.';
    }
    if (error.status === 404) {
      return 'The business, lead, or customer was not found. Refresh the page and try again.';
    }
    if (error.status === 503) {
      return 'The database is temporarily unavailable. Please try again shortly.';
    }
    if (error.status === 400) {
      return 'Some lead details are invalid. Check the form and try again.';
    }
    return 'The lead request could not be completed. Please try again.';
  }

  private saveDetailsStatus(lead: LeadRecord, status: LeadStatus): void {
    this.detailsSaving.set(true);
    this.detailsError.set(null);
    this.detailsPendingStatus.set(status);
    this.leadsApi
      .updateLead(lead.id, { status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedLead) => {
          this.activityTimeline.recordStatusChange(lead.id, lead.status, updatedLead.status);
          this.leads.update((current) =>
            current.map((item) => (item.id === updatedLead.id ? updatedLead : item)),
          );
          this.detailsLead.set(updatedLead);
          this.detailsPendingStatus.set(null);
          this.detailsSaving.set(false);
        },
        error: (error: unknown) => {
          this.detailsError.set(this.getErrorMessage(error));
          this.detailsSaving.set(false);
        },
      });
  }

  private validTimestamp(timestamp: string | null | undefined): string | null {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
}
