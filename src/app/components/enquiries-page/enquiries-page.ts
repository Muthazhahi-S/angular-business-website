import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { EnquiryStatus, LeadSource, LeadStatus } from '../../services/dashboard-api.types';
import { EnquiriesApiService } from '../../services/enquiries-api.service';
import { CreateEnquiryRequest, EnquiryRecord } from '../../services/enquiries-api.types';
import { LeadsApiService } from '../../services/leads-api.service';
import { LeadCustomer } from '../../services/leads-api.types';

const ENQUIRY_STATUSES: EnquiryStatus[] = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const LEAD_STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];
const ENQUIRY_SOURCES: LeadSource[] = [
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
  selector: 'app-enquiries-page',
  imports: [DatePipe, FormsModule],
  templateUrl: './enquiries-page.html',
  styleUrl: './enquiries-page.scss',
})
export class EnquiriesPage {
  readonly searchTerm = input('');
  readonly createDialogRequestId = input<number | null>(null);
  readonly createDialogRequestHandled = output<void>();

  private readonly enquiriesApi = inject(EnquiriesApiService);
  private readonly leadsApi = inject(LeadsApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly enquiries = signal<EnquiryRecord[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly updatingEnquiryId = signal<string | null>(null);
  protected readonly statusFilter = signal<EnquiryStatus | ''>('');
  protected readonly sourceFilter = signal<LeadSource | ''>('');
  protected readonly createDialogOpen = signal(false);
  protected readonly createError = signal<string | null>(null);
  protected readonly convertingEnquiry = signal<EnquiryRecord | null>(null);
  protected readonly conversionService = signal('');
  protected readonly conversionSource = signal<LeadSource>('WEBSITE');
  protected readonly conversionStatus = signal<LeadStatus>('NEW');
  protected readonly conversionLoading = signal(false);
  protected readonly conversionError = signal<string | null>(null);
  protected readonly conversionSuccess = signal<string | null>(null);
  protected readonly convertedEnquiryIds = signal<ReadonlySet<string>>(new Set());
  private handledCreateDialogRequestId: number | null = null;
  protected readonly statuses = ENQUIRY_STATUSES;
  protected readonly sources = ENQUIRY_SOURCES;
  protected readonly leadStatuses = LEAD_STATUSES;
  private readonly openRequestedCreateDialog = effect(() => {
    const requestId = this.createDialogRequestId();
    if (requestId === null || requestId === this.handledCreateDialogRequestId) return;
    this.handledCreateDialogRequestId = requestId;
    this.openCreateDialog();
    this.createDialogRequestHandled.emit();
  });

  protected readonly customers = computed<LeadCustomer[]>(() => {
    const customersById = new Map<string, LeadCustomer>();
    for (const enquiry of this.enquiries()) {
      customersById.set(enquiry.customer.id, enquiry.customer);
    }
    return [...customersById.values()].sort((left, right) => left.name.localeCompare(right.name));
  });

  protected readonly filteredEnquiries = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.enquiries().filter((enquiry) => {
      const matchesStatus = !this.statusFilter() || enquiry.status === this.statusFilter();
      const matchesSource = !this.sourceFilter() || enquiry.source === this.sourceFilter();
      const matchesSearch =
        !term ||
        `${enquiry.customer.name} ${enquiry.customer.email ?? ''} ${enquiry.message}`
          .toLowerCase()
          .includes(term);
      return matchesStatus && matchesSource && matchesSearch;
    });
  });

  constructor() {
    this.loadEnquiries();
  }

  protected loadEnquiries(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.enquiriesApi
      .getEnquiries()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (enquiries) => {
          this.enquiries.set(enquiries);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.getErrorMessage(error));
          this.loading.set(false);
        },
      });
  }

  protected setStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as EnquiryStatus | '');
  }

  protected setSourceFilter(event: Event): void {
    this.sourceFilter.set((event.target as HTMLSelectElement).value as LeadSource | '');
  }

  protected updateEnquiryStatus(
    enquiry: EnquiryRecord,
    status: EnquiryStatus,
    select: HTMLSelectElement,
  ): void {
    if (status === enquiry.status || this.updatingEnquiryId() === enquiry.id) return;

    this.updatingEnquiryId.set(enquiry.id);
    this.actionError.set(null);
    this.enquiries.update((current) =>
      current.map((item) => (item.id === enquiry.id ? { ...item, status } : item)),
    );
    this.enquiriesApi
      .updateEnquiry(enquiry.id, { status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedEnquiry) => {
          this.enquiries.update((current) =>
            current.map((item) => (item.id === updatedEnquiry.id ? updatedEnquiry : item)),
          );
          this.updatingEnquiryId.set(null);
        },
        error: (error: unknown) => {
          this.enquiries.update((current) =>
            current.map((item) =>
              item.id === enquiry.id ? { ...item, status: enquiry.status } : item,
            ),
          );
          select.value = enquiry.status;
          this.actionError.set(this.getErrorMessage(error));
          this.updatingEnquiryId.set(null);
        },
      });
  }

  protected openCreateDialog(): void {
    this.createError.set(null);
    this.createDialogOpen.set(true);
  }

  protected openConvertDialog(enquiry: EnquiryRecord): void {
    if (this.isEnquiryConverted(enquiry) || this.conversionLoading()) return;
    this.conversionService.set(enquiry.service?.trim() || 'General enquiry');
    this.conversionSource.set(enquiry.source || 'OTHER');
    this.conversionStatus.set('NEW');
    this.conversionError.set(null);
    this.convertingEnquiry.set(enquiry);
  }

  protected closeConvertDialog(): void {
    if (!this.conversionLoading()) {
      this.convertingEnquiry.set(null);
      this.conversionError.set(null);
    }
  }

  protected isEnquiryConverted(enquiry: EnquiryRecord): boolean {
    return this.convertedEnquiryIds().has(enquiry.id);
  }

  protected updateConversionService(event: Event): void {
    this.conversionService.set((event.target as HTMLInputElement).value);
  }

  protected updateConversionSource(event: Event): void {
    this.conversionSource.set((event.target as HTMLSelectElement).value as LeadSource);
  }

  protected updateConversionStatus(event: Event): void {
    this.conversionStatus.set((event.target as HTMLSelectElement).value as LeadStatus);
  }

  protected convertEnquiryToLead(): void {
    const enquiry = this.convertingEnquiry();
    const service = this.conversionService().trim();
    if (
      !enquiry ||
      !service ||
      this.conversionLoading() ||
      this.isEnquiryConverted(enquiry)
    ) {
      return;
    }

    this.conversionLoading.set(true);
    this.conversionError.set(null);
    this.conversionSuccess.set(null);
    this.leadsApi
      .createLead({
        customerId: enquiry.customerId,
        service,
        source: this.conversionSource(),
        status: this.conversionStatus(),
        message: enquiry.message,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.convertedEnquiryIds.update((ids) => new Set(ids).add(enquiry.id));
          this.convertingEnquiry.set(null);
          this.conversionLoading.set(false);
          this.conversionSuccess.set('Enquiry converted to lead successfully.');
          this.loadEnquiries();
        },
        error: (error: unknown) => {
          this.conversionError.set(this.getConversionErrorMessage(error));
          this.conversionLoading.set(false);
        },
      });
  }

  protected closeCreateDialog(): void {
    if (!this.saving()) this.createDialogOpen.set(false);
  }

  protected createEnquiry(event: SubmitEvent): void {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;
    const values = new FormData(form);
    const enquiry: CreateEnquiryRequest = {
      customerId: String(values.get('customerId') ?? ''),
      message: String(values.get('message') ?? '').trim(),
      source: String(values.get('source') ?? '') as LeadSource,
      status: 'NEW',
    };

    this.saving.set(true);
    this.createError.set(null);
    this.enquiriesApi
      .createEnquiry(enquiry)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (createdEnquiry) => {
          this.enquiries.update((current) => [
            createdEnquiry,
            ...current.filter((item) => item.id !== createdEnquiry.id),
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
      .join(' ')
      .replace('Whatsapp', 'WhatsApp');
  }

  protected statusClass(status: EnquiryStatus): string {
    return status.toLowerCase().replace('_', '-');
  }

  protected trackEnquiry(_index: number, enquiry: EnquiryRecord): string {
    return enquiry.id;
  }

  private getErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'The enquiry request could not be completed. Please try again.';
    }
    if (error.status === 0) {
      return 'Could not connect to BizPilot. Check that the backend is running on port 3000.';
    }
    if (error.status === 404) {
      return 'The business, enquiry, or customer was not found. Refresh the page and try again.';
    }
    if (error.status === 503) {
      return 'The database is temporarily unavailable. Please try again shortly.';
    }
    if (error.status === 400) {
      return 'Some enquiry details are invalid. Check the form and try again.';
    }
    return 'The enquiry request could not be completed. Please try again.';
  }

  private getConversionErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 409) {
      return 'This enquiry may already have been converted. Refresh the enquiry list and try again.';
    }
    if (error instanceof HttpErrorResponse && error.status === 400) {
      return 'Check the service, source, and status, then try again.';
    }
    return 'The enquiry could not be converted to a lead. Please try again.';
  }
}
