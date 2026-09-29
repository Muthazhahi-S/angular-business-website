import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LeadRecord } from '../../services/leads-api.types';
import { LeadsApiService } from '../../services/leads-api.service';
import {
  createFollowUpMessage,
  createWhatsAppUrl,
} from '../../services/lead-follow-up.utils';
import { LeadsPage } from './leads-page';

describe('LeadsPage', () => {
  let fixture: ComponentFixture<LeadsPage>;
  const lead: LeadRecord = {
    id: 'lead-1',
    businessId: 'bizpilot-demo-urbannest',
    customerId: 'customer-1',
    service: 'Kitchen design',
    source: 'WEBSITE',
    status: 'NEW',
    message: 'Interested in a renovation.',
    createdAt: '2026-09-29T10:00:00.000Z',
    updatedAt: '2026-09-29T10:00:00.000Z',
    customer: {
      id: 'customer-1',
      name: 'Riya Shah',
      email: 'riya@example.com',
      phone: '9876543210',
    },
  };
  const api = {
    getLeads: vi.fn(),
    createLead: vi.fn(),
    updateLead: vi.fn(),
  };

  beforeEach(async () => {
    api.getLeads.mockReset().mockReturnValue(of([lead]));
    api.createLead.mockReset();
    api.updateLead.mockReset();

    await TestBed.configureTestingModule({
      imports: [LeadsPage],
      providers: [{ provide: LeadsApiService, useValue: api }],
    }).compileComponents();

    fixture = TestBed.createComponent(LeadsPage);
    fixture.detectChanges();
  });

  it('renders customer and lead details from the API', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Riya Shah');
    expect(element.textContent).toContain('riya@example.com');
    expect(element.textContent).toContain('Kitchen design');
    expect(element.textContent).toContain('Interested in a renovation.');
    const customer = element.querySelector<HTMLElement>('.lead-customer');
    const avatar = element.querySelector<HTMLElement>('.lead-avatar');
    const name = element.querySelector<HTMLElement>('.lead-customer strong');
    expect(avatar?.textContent?.trim()).toBe('R');
    expect(avatar?.getAttribute('aria-hidden')).toBe('true');
    expect(name?.textContent?.trim()).toBe('Riya Shah');
    expect(customer?.textContent?.match(/Riya Shah/g)).toHaveLength(1);
  });

  it('filters by status and source', () => {
    const element = fixture.nativeElement as HTMLElement;
    const filters = element.querySelectorAll<HTMLSelectElement>('.lead-filters select');
    const status = filters[0];
    const source = filters[1];

    status!.value = 'CONVERTED';
    status!.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(element.textContent).toContain('No matching leads');

    source!.value = 'WEBSITE';
    source!.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(element.textContent).toContain('No matching leads');
  });

  it('sends a status change to the API', () => {
    api.updateLead.mockReturnValue(of({ ...lead, status: 'CONTACTED' }));
    const element = fixture.nativeElement as HTMLElement;
    const status = element.querySelector<HTMLSelectElement>('.status-control select');
    expect(status).not.toBeNull();

    status!.value = 'CONTACTED';
    status!.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(api.updateLead).toHaveBeenCalledWith('lead-1', { status: 'CONTACTED' });
    expect(element.querySelector<HTMLSelectElement>('.status-select')?.value).toBe('CONTACTED');
  });

  it.each([
    ['NEW', 'New'],
    ['CONTACTED', 'Contacted'],
    ['QUALIFIED', 'Qualified'],
    ['CONVERTED', 'Converted'],
    ['LOST', 'Lost'],
  ] as const)('renders the API status %s as the selected %s option', async (apiStatus, label) => {
    api.getLeads.mockReturnValue(of([{ ...lead, status: apiStatus }]));
    fixture.destroy();
    fixture = TestBed.createComponent(LeadsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const select = (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLSelectElement>('.status-control select')!;
    expect(select.value).toBe(apiStatus);
    expect(select.selectedOptions[0]?.textContent?.trim()).toBe(label);
  });

  it('displays the persisted API status after refreshing the Leads page', async () => {
    api.getLeads.mockReturnValue(of([{ ...lead, status: 'CONVERTED' }]));
    fixture.destroy();
    fixture = TestBed.createComponent(LeadsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const select = (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLSelectElement>('.status-control select')!;
    expect(select.value).toBe('CONVERTED');
    expect(select.selectedOptions[0]?.textContent?.trim()).toBe('Converted');
  });

  it('shows the API-returned status in the row after a successful update', async () => {
    api.updateLead.mockReturnValue(of({ ...lead, status: 'QUALIFIED' }));
    const element = fixture.nativeElement as HTMLElement;
    const select = element.querySelector<HTMLSelectElement>('.status-control select')!;
    await fixture.whenStable();
    select.value = 'QUALIFIED';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(api.updateLead).toHaveBeenCalledWith('lead-1', { status: 'QUALIFIED' });
    expect(element.querySelector<HTMLSelectElement>('.status-control select')?.value)
      .toBe('QUALIFIED');
    expect(element.querySelector('.status-control select')?.className)
      .toContain('status-select--qualified');
  });

  it('restores the previous row status and shows a safe error when the update fails', async () => {
    api.updateLead.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 503 })));
    const element = fixture.nativeElement as HTMLElement;
    const select = element.querySelector<HTMLSelectElement>('.status-control select')!;
    await fixture.whenStable();
    select.value = 'CONTACTED';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(api.updateLead).toHaveBeenCalledWith('lead-1', { status: 'CONTACTED' });
    expect(element.querySelector<HTMLSelectElement>('.status-control select')?.value).toBe('NEW');
    expect(element.textContent).toContain('temporarily unavailable');
  });

  it('disables only the row being updated while a status request is pending', async () => {
    const update = new Subject<LeadRecord>();
    api.getLeads.mockReturnValue(of([
      lead,
      { ...lead, id: 'lead-2', status: 'CONTACTED', service: 'Bathroom design' },
    ]));
    api.updateLead.mockReturnValue(update);
    fixture.destroy();
    fixture = TestBed.createComponent(LeadsPage);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const selects = element.querySelectorAll<HTMLSelectElement>('.status-control select');
    await fixture.whenStable();
    selects[0]!.value = 'QUALIFIED';
    selects[0]!.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(api.updateLead).toHaveBeenCalledWith('lead-1', { status: 'QUALIFIED' });
    const updatedSelects = element.querySelectorAll<HTMLSelectElement>('.status-control select');
    expect(updatedSelects[0]!.disabled).toBe(true);
    expect(updatedSelects[1]!.disabled).toBe(false);
    update.next({ ...lead, status: 'QUALIFIED' });
    update.complete();
  });

  it('opens lead details and displays the existing customer and lead information', () => {
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.lead-view-button')!.click();
    fixture.detectChanges();

    expect(element.querySelector('[role="dialog"]')).not.toBeNull();
    expect(element.textContent).toContain('Riya Shah');
    expect(element.textContent).toContain('riya@example.com');
    expect(element.textContent).toContain('9876543210');
    expect(element.textContent).toContain('Kitchen design');
    expect(element.textContent).toContain('Interested in a renovation.');
    expect(element.textContent).toContain('Website');
    expect(element.textContent).toContain('Created');
    expect(element.textContent).toContain('Updated');
  });

  it('shows the lead-created activity with its creation date and the empty session state', () => {
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.lead-view-button')!.click();
    fixture.detectChanges();

    const activity = element.querySelector<HTMLElement>('.lead-details-activity')!;
    expect(activity.textContent).toContain('Lead created');
    expect(activity.querySelector('time')?.textContent).toContain('29 Sep 2026');
    expect(activity.textContent).toContain('No recent activity.');
    expect(activity.textContent).toContain('Activity shown here is from this browser session.');
  });

  it('updates lead status in the details view using the existing API', () => {
    api.updateLead.mockReturnValue(of({ ...lead, status: 'QUALIFIED' }));
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.lead-view-button')!.click();
    fixture.detectChanges();
    const status = element.querySelector<HTMLSelectElement>('.lead-details-status select')!;
    status.value = 'QUALIFIED';
    status.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(api.updateLead).toHaveBeenCalledWith('lead-1', { status: 'QUALIFIED' });
    expect(element.querySelector<HTMLSelectElement>('.lead-details-status select')?.value)
      .toBe('QUALIFIED');
    expect(element.querySelector('.lead-details-activity')?.textContent)
      .toContain('Status changed from NEW to QUALIFIED');
    expect(element.querySelector('.lead-details-activity__empty')).toBeNull();
  });

  it('shows the saving state while a details status update is pending', () => {
    const update = new Subject<LeadRecord>();
    api.updateLead.mockReturnValue(update);
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.lead-view-button')!.click();
    fixture.detectChanges();
    const status = element.querySelector<HTMLSelectElement>('.lead-details-status select')!;
    status.value = 'CONTACTED';
    status.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(element.textContent).toContain('Saving status…');
    expect(status.disabled).toBe(true);
    update.next({ ...lead, status: 'CONTACTED' });
    update.complete();
    fixture.detectChanges();
    expect(element.textContent).not.toContain('Saving status…');
  });

  it('shows a status API error and retries the pending change', () => {
    api.updateLead
      .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 503 })))
      .mockReturnValueOnce(of({ ...lead, status: 'CONTACTED' }));
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.lead-view-button')!.click();
    fixture.detectChanges();
    const status = element.querySelector<HTMLSelectElement>('.lead-details-status select')!;
    status.value = 'CONTACTED';
    status.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(element.textContent).toContain('temporarily unavailable');
    element.querySelector<HTMLButtonElement>('.lead-details-error button')!.click();
    fixture.detectChanges();

    expect(api.updateLead).toHaveBeenCalledTimes(2);
    expect(element.querySelector<HTMLSelectElement>('.lead-details-status select')?.value)
      .toBe('CONTACTED');
    expect(element.querySelector('.lead-details-error')).toBeNull();
  });

  it('uses the shared follow-up draft and WhatsApp helpers in lead details', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.lead-view-button')!.click();
    fixture.detectChanges();
    element.querySelector<HTMLButtonElement>('.lead-details-primary-button')!.click();
    fixture.detectChanges();

    const textarea = element.querySelector<HTMLTextAreaElement>('#lead-details-follow-up-draft')!;
    expect(textarea.value).toBe(createFollowUpMessage(lead));
    expect(element.querySelector('.lead-details-activity')?.textContent)
      .toContain('Follow-up message drafted');

    element.querySelector<HTMLButtonElement>('.lead-details-whatsapp-button')!.click();
    fixture.detectChanges();
    expect(open).toHaveBeenCalledWith(
      createWhatsAppUrl(lead.customer?.phone, createFollowUpMessage(lead)),
      '_blank',
      'noopener,noreferrer',
    );
    expect(element.querySelector('.lead-details-activity')?.textContent)
      .toContain('WhatsApp follow-up opened');
    open.mockRestore();
  });

  it('displays the newest lead activity first', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-29T12:00:00.000Z'));
    try {
      const element = fixture.nativeElement as HTMLElement;
      element.querySelector<HTMLButtonElement>('.lead-view-button')!.click();
      fixture.detectChanges();
      element.querySelector<HTMLButtonElement>('.lead-details-primary-button')!.click();
      fixture.detectChanges();
      vi.advanceTimersByTime(1000);
      element.querySelector<HTMLButtonElement>('.lead-details-whatsapp-button')!.click();
      fixture.detectChanges();

      const descriptions = Array.from(
        element.querySelectorAll<HTMLElement>('.lead-details-activity__content p'),
      ).map((item) => item.textContent?.trim());
      expect(descriptions).toEqual([
        'WhatsApp follow-up opened',
        'Follow-up message drafted',
        'Lead created',
      ]);
    } finally {
      vi.useRealTimers();
      open.mockRestore();
    }
  });

  it('keeps the copy action available for drafted details messages', async () => {
    const previousClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    try {
      const element = fixture.nativeElement as HTMLElement;
      element.querySelector<HTMLButtonElement>('.lead-view-button')!.click();
      fixture.detectChanges();
      element.querySelector<HTMLButtonElement>('.lead-details-primary-button')!.click();
      fixture.detectChanges();
      element.querySelector<HTMLButtonElement>('.lead-details-actions .lead-details-primary-button')!.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(writeText).toHaveBeenCalledWith(createFollowUpMessage(lead));
      expect(element.textContent).toContain('Copied');
      expect(element.querySelector('.lead-details-activity')?.textContent)
        .toContain('Follow-up message copied');
    } finally {
      if (previousClipboard) {
        Object.defineProperty(navigator, 'clipboard', previousClipboard);
      } else {
        Reflect.deleteProperty(navigator, 'clipboard');
      }
    }
  });

  it('displays the unavailable customer information message when customer data is absent', () => {
    const detailsLead = { ...lead, customer: undefined };
    api.getLeads.mockReturnValue(of([detailsLead]));
    fixture = TestBed.createComponent(LeadsPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.lead-view-button')!.click();
    fixture.detectChanges();

    expect(element.textContent).toContain('Customer information unavailable.');
  });
});
