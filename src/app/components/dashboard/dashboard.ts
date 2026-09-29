import { DatePipe, isPlatformBrowser, UpperCasePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppPage, DashboardQuickAction } from '../../app.types';
import { BIZPILOT_BUSINESS_ID, DashboardApiService } from '../../services/dashboard-api.service';
import { DashboardResponse, LeadStatus, RecentEnquiry } from '../../services/dashboard-api.types';
import { LeadsApiService } from '../../services/leads-api.service';
import { LeadRecord } from '../../services/leads-api.types';
import { StatCard } from '../stat-card/stat-card';

interface Metric {
  label: string;
  value: string;
  icon: string;
  tone: 'green' | 'blue' | 'amber' | 'violet';
}

interface PipelineStage {
  label: string;
  status: LeadStatus;
  count: number;
}

interface AttentionItem {
  lead: LeadRecord;
  reason: string;
}

type DateRange = '7' | '30' | '90' | 'all';

interface DateRangeOption {
  value: DateRange;
  label: string;
}

const PIPELINE_STAGES: { label: string; status: LeadStatus }[] = [
  { label: 'New', status: 'NEW' },
  { label: 'Contacted', status: 'CONTACTED' },
  { label: 'Qualified', status: 'QUALIFIED' },
  { label: 'Converted', status: 'CONVERTED' },
  { label: 'Lost', status: 'LOST' },
];

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, UpperCasePipe, StatCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  readonly searchTerm = input('');
  readonly navigate = output<AppPage>();
  readonly viewLead = output<string>();
  readonly quickAction = output<DashboardQuickAction>();

  private readonly api = inject(DashboardApiService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly leadsApi = inject(LeadsApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly today = new Date();
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly dashboard = signal<DashboardResponse | null>(null);
  protected readonly attentionLeads = signal<LeadRecord[]>([]);
  protected readonly attentionLoading = signal(true);
  protected readonly attentionError = signal<string | null>(null);
  protected readonly dateRangeMenuOpen = signal(false);
  protected readonly selectedDateRange = signal<DateRange>('30');
  protected readonly dateRangeOptions: DateRangeOption[] = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: 'all', label: 'All time' },
  ];
  protected readonly selectedDateRangeLabel = computed(
    () => this.dateRangeOptions.find((option) => option.value === this.selectedDateRange())?.label ?? 'Last 30 days',
  );

  protected readonly attentionItems = computed<AttentionItem[]>(() => {
    const priority: Record<LeadStatus, number> = {
      NEW: 0,
      CONTACTED: 1,
      QUALIFIED: 2,
      CONVERTED: 3,
      LOST: 4,
    };
    const reasons: Partial<Record<LeadStatus, string>> = {
      NEW: 'New lead — contact customer',
      CONTACTED: 'Follow-up may be needed',
      QUALIFIED: 'Qualified lead — next steps',
    };
    return this.attentionLeads()
      .filter(
        (lead) =>
          (lead.status === 'NEW' || lead.status === 'CONTACTED' || lead.status === 'QUALIFIED') &&
          this.isWithinSelectedDateRange(lead.createdAt),
      )
      .sort((left, right) => priority[left.status] - priority[right.status])
      .slice(0, 5)
      .map((lead) => ({ lead, reason: reasons[lead.status] ?? '' }));
  });

  protected readonly metrics = computed<Metric[]>(() => {
    const data = this.dashboard();
    if (!data) return [];

    return [
      {
        label: 'Total leads',
        value: data.totalLeads.toLocaleString('en-IN'),
        icon: 'leads',
        tone: 'green',
      },
      {
        label: 'New enquiries',
        value: data.newEnquiries.toLocaleString('en-IN'),
        icon: 'enquiries',
        tone: 'blue',
      },
      {
        label: 'Contacted leads',
        value: data.contactedLeads.toLocaleString('en-IN'),
        icon: 'contacted',
        tone: 'amber',
      },
      {
        label: 'Converted leads',
        value: data.convertedLeads.toLocaleString('en-IN'),
        icon: 'converted',
        tone: 'violet',
      },
    ];
  });

  protected readonly filteredEnquiries = computed(() => {
    const enquiries = this.dashboard()?.recentEnquiries ?? [];
    const term = this.searchTerm().trim().toLowerCase();
    return enquiries.filter((enquiry) => {
      const matchesSearch =
        !term ||
          `${enquiry.customer.name} ${enquiry.message} ${enquiry.source} ${enquiry.status}`
            .toLowerCase()
            .includes(term);
      return matchesSearch && this.isWithinSelectedDateRange(enquiry.createdAt);
    });
  });

  protected readonly pipelineStages = computed<PipelineStage[]>(() => {
    const pipeline = this.dashboard()?.leadPipeline;
    return pipeline
      ? PIPELINE_STAGES.map((stage) => ({ ...stage, count: pipeline[stage.status] }))
      : [];
  });

  protected readonly maxPipelineCount = computed(() =>
    Math.max(1, ...this.pipelineStages().map((stage) => stage.count)),
  );

  protected readonly activities = [
    {
      initials: 'PM',
      text: 'Priya Menon was contacted on WhatsApp',
      time: '24 min ago',
      color: 'peach',
    },
    {
      initials: 'AI',
      text: 'AI assistant qualified 3 new leads',
      time: '1 hour ago',
      color: 'mint',
    },
    { initials: 'ND', text: 'Neha Desai moved to Converted', time: '3 hours ago', color: 'lilac' },
  ];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboard();
      this.loadAttentionLeads();
    }
  }

  protected loadDashboard(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.api
      .getDashboard(BIZPILOT_BUSINESS_ID)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.dashboard.set(data);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.getErrorMessage(error));
          this.loading.set(false);
        },
      });
  }

  protected loadAttentionLeads(): void {
    this.attentionLoading.set(true);
    this.attentionError.set(null);
    this.leadsApi
      .getLeads()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (leads) => {
          this.attentionLeads.set(leads);
          this.attentionLoading.set(false);
        },
        error: (error: unknown) => {
          this.attentionError.set(this.getErrorMessage(error));
          this.attentionLoading.set(false);
        },
      });
  }

  protected openLead(lead: LeadRecord): void {
    this.viewLead.emit(lead.id);
  }

  protected toggleDateRangeMenu(): void {
    this.dateRangeMenuOpen.update((isOpen) => !isOpen);
  }

  protected selectDateRange(range: DateRange): void {
    this.selectedDateRange.set(range);
    this.dateRangeMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  protected closeDateRangeMenuOnOutsideClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.dateRangeMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected closeDateRangeMenuOnEscape(): void {
    this.dateRangeMenuOpen.set(false);
  }

  protected formatSource(source: string): string {
    return this.formatEnumLabel(source);
  }

  protected formatStatus(status: string): string {
    return this.formatEnumLabel(status);
  }

  protected statusClass(status: RecentEnquiry['status']): string {
    return status.toLowerCase().replace('_', '-');
  }

  protected formatEnquiryDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  }

  protected pipelineWidth(count: number): number {
    return (count / this.maxPipelineCount()) * 100;
  }

  protected showAllEnquiries(): void {
    this.navigate.emit('Customer Enquiries');
  }

  private formatEnumLabel(value: string): string {
    return value
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private isWithinSelectedDateRange(timestamp: string | null | undefined): boolean {
    const range = this.selectedDateRange();
    if (range === 'all' || !timestamp) return true;
    const createdAt = Date.parse(timestamp);
    if (Number.isNaN(createdAt)) return true;
    const rangeInDays = Number(range);
    const now = Date.now();
    const cutoff = now - rangeInDays * 24 * 60 * 60 * 1000;
    return createdAt >= cutoff && createdAt <= now;
  }

  private getErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Dashboard data could not be loaded. Please try again.';
    }

    if (error.status === 0) {
      return 'Could not connect to BizPilot. Check that the backend is running on port 3000.';
    }

    if (error.status === 404) {
      return 'The demo business was not found. Run the backend database seed and try again.';
    }

    if (error.status === 503) {
      return 'The database is temporarily unavailable. Please try again shortly.';
    }

    return 'Dashboard data could not be loaded. Please try again.';
  }
}
