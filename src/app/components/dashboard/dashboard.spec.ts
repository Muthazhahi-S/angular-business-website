import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { DashboardApiService } from '../../services/dashboard-api.service';
import { LeadsApiService } from '../../services/leads-api.service';
import { LeadRecord } from '../../services/leads-api.types';
import { Dashboard } from './dashboard';

describe('Dashboard needs-attention leads', () => {
  let fixture: ComponentFixture<Dashboard>;
  const dashboardApi = { getDashboard: vi.fn() };
  const leadsApi = { getLeads: vi.fn() };

  const createLead = (id: string, status: LeadRecord['status']): LeadRecord => ({
    id,
    businessId: 'bizpilot-demo-urbannest',
    customerId: `customer-${id}`,
    service: `${id} service`,
    source: 'WHATSAPP',
    status,
    message: null,
    createdAt: '2026-09-29T10:00:00.000Z',
    updatedAt: '2026-09-29T10:00:00.000Z',
    customer: {
      id: `customer-${id}`,
      name: `Customer ${id}`,
      email: null,
      phone: null,
    },
  });

  beforeEach(async () => {
    dashboardApi.getDashboard.mockReset().mockReturnValue(
      of({
        businessId: 'bizpilot-demo-urbannest',
        totalLeads: 0,
        newEnquiries: 0,
        contactedLeads: 0,
        convertedLeads: 0,
        recentEnquiries: [],
        leadPipeline: { NEW: 0, CONTACTED: 0, QUALIFIED: 0, CONVERTED: 0, LOST: 0 },
      }),
    );
    leadsApi.getLeads.mockReset().mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: DashboardApiService, useValue: dashboardApi },
        { provide: LeadsApiService, useValue: leadsApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
  });

  const render = (leads: LeadRecord[]) => {
    leadsApi.getLeads.mockReturnValue(of(leads));
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  it.each([
    ['NEW', 'New lead — contact customer'],
    ['CONTACTED', 'Follow-up may be needed'],
    ['QUALIFIED', 'Qualified lead — next steps'],
  ] as const)('%s leads appear with the matching action', (status, reason) => {
    const element = render([createLead('attention', status)]);
    expect(element.querySelectorAll('.attention-item')).toHaveLength(1);
    expect(element.textContent).toContain(reason);
    expect(element.textContent).toContain('Customer attention');
    expect(element.textContent).toContain('attention service');
    expect(element.textContent).toContain('WhatsApp');
    expect(element.textContent).toContain(status === 'NEW' ? 'New' : status === 'CONTACTED' ? 'Contacted' : 'Qualified');
    expect(element.querySelector('.attention-item__action')?.textContent).toContain('View Lead');
  });

  it.each(['CONVERTED', 'LOST'] as const)('%s leads are excluded', (status) => {
    const element = render([createLead('closed', status)]);
    expect(element.querySelector('.attention-item')).toBeNull();
    expect(element.textContent).toContain('No leads need attention right now.');
  });

  it('shows at most five items', () => {
    const leads = Array.from({ length: 7 }, (_, index) => createLead(`${index}`, 'NEW'));
    const element = render(leads);
    expect(element.querySelectorAll('.attention-item')).toHaveLength(5);
  });

  it('sorts attention items by NEW, CONTACTED, then QUALIFIED priority', () => {
    const element = render([
      createLead('qualified', 'QUALIFIED'),
      createLead('contacted', 'CONTACTED'),
      createLead('new', 'NEW'),
    ]);
    const names = Array.from(element.querySelectorAll('.attention-item__identity strong')).map(
      (name) => name.textContent,
    );
    expect(names).toEqual(['Customer new', 'Customer contacted', 'Customer qualified']);
  });

  it('keeps the recent-enquiry avatar separate from the customer name', () => {
    dashboardApi.getDashboard.mockReturnValue(
      of({
        businessId: 'bizpilot-demo-urbannest',
        totalLeads: 0,
        newEnquiries: 1,
        contactedLeads: 0,
        convertedLeads: 0,
        recentEnquiries: [
          {
            id: 'enquiry-1',
            message: 'A recent enquiry',
            source: 'WHATSAPP',
            status: 'NEW',
            createdAt: '2026-09-29T10:00:00.000Z',
            customer: { id: 'customer-1', name: 'Neha Desai', email: 'neha@example.com' },
          },
        ],
        leadPipeline: { NEW: 0, CONTACTED: 0, QUALIFIED: 0, CONVERTED: 0, LOST: 0 },
      }),
    );
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const customer = element.querySelector<HTMLElement>('.customer');
    const avatar = element.querySelector<HTMLElement>('.customer__avatar');
    const name = element.querySelector<HTMLElement>('.customer__name');
    expect(avatar?.textContent?.trim()).toBe('N');
    expect(avatar?.getAttribute('aria-hidden')).toBe('true');
    expect(name?.textContent?.trim()).toBe('Neha Desai');
    expect(customer?.textContent?.match(/Neha Desai/g)).toHaveLength(1);
  });

  it('renders the Last 30 days control with an aligned decorative chevron icon', () => {
    const element = render([]);
    const button = element.querySelector<HTMLButtonElement>('.date-button');
    const chevron = button?.querySelector<SVGElement>('.date-button__chevron');

    expect(button?.textContent).toContain('Last 30 days');
    expect(chevron).not.toBeNull();
    expect(chevron?.getAttribute('aria-hidden')).toBe('true');
    expect(chevron?.querySelector('path')?.getAttribute('d')).toBe('m6 9 6 6 6-6');
  });

  it('opens the date range dropdown with all four options and Last 30 days selected', () => {
    const element = render([]);
    element.querySelector<HTMLButtonElement>('.date-button')!.click();
    fixture.detectChanges();

    const options = Array.from(element.querySelectorAll<HTMLButtonElement>('[role="option"]'));
    expect(options.map((option) => option.textContent?.trim())).toEqual([
      'Last 7 days',
      'Last 30 days',
      'Last 90 days',
      'All time',
    ]);
    expect(options[1]?.getAttribute('aria-selected')).toBe('true');
    expect(element.querySelector('.date-button')?.getAttribute('aria-expanded')).toBe('true');
  });

  it.each([
    ['Last 7 days', 'Last 7 days'],
    ['Last 90 days', 'Last 90 days'],
    ['All time', 'All time'],
  ])('updates the selected label when %s is selected', (optionLabel, expectedLabel) => {
    const element = render([]);
    element.querySelector<HTMLButtonElement>('.date-button')!.click();
    fixture.detectChanges();
    Array.from(element.querySelectorAll<HTMLButtonElement>('[role="option"]'))
      .find((option) => option.textContent?.includes(optionLabel))!
      .click();
    fixture.detectChanges();

    expect(element.querySelector('.date-button')?.textContent).toContain(expectedLabel);
    expect(element.querySelector('.date-range-menu')).toBeNull();
  });

  it('updates the selected date range label and filters recent enquiries with available dates', () => {
    const now = Date.now();
    dashboardApi.getDashboard.mockReturnValue(
      of({
        businessId: 'bizpilot-demo-urbannest',
        totalLeads: 3,
        newEnquiries: 3,
        contactedLeads: 0,
        convertedLeads: 0,
        recentEnquiries: [
          {
            id: 'recent',
            message: 'Recent',
            source: 'WHATSAPP',
            status: 'NEW',
            createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
            customer: { id: 'customer-recent', name: 'Recent Customer', email: null },
          },
          {
            id: 'older',
            message: 'Older',
            source: 'WHATSAPP',
            status: 'NEW',
            createdAt: new Date(now - 45 * 24 * 60 * 60 * 1000).toISOString(),
            customer: { id: 'customer-older', name: 'Older Customer', email: null },
          },
          {
            id: 'undated',
            message: 'Undated',
            source: 'WHATSAPP',
            status: 'NEW',
            createdAt: '',
            customer: { id: 'customer-undated', name: 'Undated Customer', email: null },
          },
        ],
        leadPipeline: { NEW: 3, CONTACTED: 0, QUALIFIED: 0, CONVERTED: 0, LOST: 0 },
      }),
    );
    const element = render([]);
    element.querySelector<HTMLButtonElement>('.date-button')!.click();
    fixture.detectChanges();
    const allTime = Array.from(element.querySelectorAll<HTMLButtonElement>('[role="option"]'))
      .find((option) => option.textContent?.includes('All time'))!;
    allTime.click();
    fixture.detectChanges();

    expect(element.querySelector('.date-button')?.textContent).toContain('All time');
    expect(element.querySelectorAll('.customer__name')).toHaveLength(3);

    element.querySelector<HTMLButtonElement>('.date-button')!.click();
    fixture.detectChanges();
    Array.from(element.querySelectorAll<HTMLButtonElement>('[role="option"]'))
      .find((option) => option.textContent?.includes('Last 7 days'))!
      .click();
    fixture.detectChanges();

    expect(element.querySelector('.date-button')?.textContent).toContain('Last 7 days');
    expect(element.querySelectorAll('.customer__name')).toHaveLength(2);
    expect(element.textContent).toContain('Recent Customer');
    expect(element.textContent).toContain('Undated Customer');
    expect(element.textContent).not.toContain('Older Customer');
    expect(element.querySelectorAll('app-stat-card')).toHaveLength(4);
  });

  it.each([
    ['Last 7 days', 2],
    ['Last 30 days', 3],
    ['Last 90 days', 4],
    ['All time', 5],
  ])('filters Recent Enquiries to the %s range', (label, expectedCount) => {
    const now = Date.now();
    const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
    dashboardApi.getDashboard.mockReturnValue(
      of({
        businessId: 'bizpilot-demo-urbannest',
        totalLeads: 5,
        newEnquiries: 5,
        contactedLeads: 0,
        convertedLeads: 0,
        recentEnquiries: [3, 20, 60, 120].map((days) => ({
          id: `enquiry-${days}`,
          message: `${days} days ago`,
          source: 'WHATSAPP' as const,
          status: 'NEW' as const,
          createdAt: daysAgo(days),
          customer: {
            id: `customer-${days}`,
            name: `Customer ${days}`,
            email: null,
          },
        })).concat([{
          id: 'enquiry-undated',
          message: 'Date unavailable',
          source: 'WHATSAPP' as const,
          status: 'NEW' as const,
          createdAt: 'not-a-date',
          customer: { id: 'customer-undated', name: 'Undated Customer', email: null },
        }]),
        leadPipeline: { NEW: 5, CONTACTED: 0, QUALIFIED: 0, CONVERTED: 0, LOST: 0 },
      }),
    );
    const element = render([]);
    if (label !== 'Last 30 days') {
      element.querySelector<HTMLButtonElement>('.date-button')!.click();
      fixture.detectChanges();
      Array.from(element.querySelectorAll<HTMLButtonElement>('[role="option"]'))
        .find((option) => option.textContent?.includes(label))!
        .click();
      fixture.detectChanges();
    }

    expect(element.querySelectorAll('.customer__name')).toHaveLength(expectedCount);
    expect(element.textContent).toContain('Undated Customer');
  });

  it('filters Needs Attention leads using the selected range and retains leads without usable dates', () => {
    const now = Date.now();
    const recent = createLead('recent-lead', 'NEW');
    const older = {
      ...createLead('older-lead', 'CONTACTED'),
      createdAt: new Date(now - 45 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const undated = { ...createLead('undated-lead', 'QUALIFIED'), createdAt: '' };
    const element = render([older, undated, recent]);

    expect(element.querySelectorAll('.attention-item')).toHaveLength(2);
    element.querySelector<HTMLButtonElement>('.date-button')!.click();
    fixture.detectChanges();
    Array.from(element.querySelectorAll<HTMLButtonElement>('[role="option"]'))
      .find((option) => option.textContent?.includes('All time'))!
      .click();
    fixture.detectChanges();

    expect(element.querySelectorAll('.attention-item')).toHaveLength(3);
    element.querySelector<HTMLButtonElement>('.date-button')!.click();
    fixture.detectChanges();
    Array.from(element.querySelectorAll<HTMLButtonElement>('[role="option"]'))
      .find((option) => option.textContent?.includes('Last 7 days'))!
      .click();
    fixture.detectChanges();

    expect(element.querySelectorAll('.attention-item')).toHaveLength(2);
    expect(element.textContent).toContain('Customer recent-lead');
    expect(element.textContent).toContain('Customer undated-lead');
    expect(element.textContent).not.toContain('Customer older-lead');
  });

  it.each([
    ['Last 7 days', 2],
    ['Last 30 days', 3],
    ['Last 90 days', 4],
    ['All time', 5],
  ])('filters Needs Attention leads to the %s range', (label, expectedCount) => {
    const now = Date.now();
    const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
    const leads = [3, 20, 60, 120].map((days, index) => ({
      ...createLead(`lead-${days}`, index % 2 === 0 ? 'NEW' : 'CONTACTED'),
      createdAt: daysAgo(days),
    }));
    leads.push({ ...createLead('lead-undated', 'QUALIFIED'), createdAt: 'invalid-date' });
    const element = render(leads);
    if (label !== 'Last 30 days') {
      element.querySelector<HTMLButtonElement>('.date-button')!.click();
      fixture.detectChanges();
      Array.from(element.querySelectorAll<HTMLButtonElement>('[role="option"]'))
        .find((option) => option.textContent?.includes(label))!
        .click();
      fixture.detectChanges();
    }

    expect(element.querySelectorAll('.attention-item')).toHaveLength(expectedCount);
    expect(element.textContent).toContain('Customer lead-undated');
  });

  it('closes the date range dropdown on outside click', () => {
    const element = render([]);
    element.querySelector<HTMLButtonElement>('.date-button')!.click();
    fixture.detectChanges();
    document.body.click();
    fixture.detectChanges();

    expect(element.querySelector('.date-range-menu')).toBeNull();
  });

  it('closes the date range dropdown on Escape', () => {
    const element = render([]);
    element.querySelector<HTMLButtonElement>('.date-button')!.click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(element.querySelector('.date-range-menu')).toBeNull();
  });

  it('shows the empty state when no leads need attention', () => {
    const element = render([]);
    expect(element.textContent).toContain('No leads need attention right now.');
  });

  it('shows an API error and retries the lead request', () => {
    leadsApi.getLeads
      .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 503 })))
      .mockReturnValueOnce(of([createLead('retry', 'NEW')]));
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('temporarily unavailable');

    element.querySelector<HTMLButtonElement>('.attention-state--error button')!.click();
    fixture.detectChanges();

    expect(leadsApi.getLeads).toHaveBeenCalledTimes(2);
    expect(element.querySelector('.attention-item')).not.toBeNull();
  });

  it('emits the selected lead for navigation to the existing details view', () => {
    const element = render([createLead('open', 'NEW')]);
    const emit = vi.fn();
    fixture.componentInstance.viewLead.subscribe(emit);

    element.querySelector<HTMLButtonElement>('.attention-item__action')!.click();
    expect(emit).toHaveBeenCalledWith('open');
  });

  it('renders the five responsive Quick Actions with clear labels and icons', () => {
    const element = render([]);
    const actions = element.querySelectorAll<HTMLButtonElement>('.quick-action');
    expect(element.textContent).toContain('Quick Actions');
    expect(
      Array.from(actions).map((action) => action.querySelector('span:last-child')?.textContent),
    ).toEqual([
      '+ Add Lead',
      '+ Add Enquiry',
      'View Leads',
      'View Enquiries',
      'AI Assistant',
    ]);
    expect(Array.from(actions).every((action) => action.querySelector('.quick-action__icon'))).toBe(true);
    expect(element.querySelector('.quick-actions-list')).not.toBeNull();
  });

  it.each([
    ['+ Add Lead', 'addLead'],
    ['+ Add Enquiry', 'addEnquiry'],
    ['View Leads', 'viewLeads'],
    ['View Enquiries', 'viewEnquiries'],
    ['AI Assistant', 'aiAssistant'],
  ] as const)('emits the %s Quick Action', (label, action) => {
    const element = render([]);
    const emit = vi.fn();
    fixture.componentInstance.quickAction.subscribe(emit);
    const button = Array.from(element.querySelectorAll<HTMLButtonElement>('.quick-action')).find(
      (item) => item.textContent?.includes(label),
    );

    button?.click();

    expect(emit).toHaveBeenCalledWith(action);
  });
});
