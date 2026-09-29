import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { EnquiriesApiService } from '../../services/enquiries-api.service';
import { EnquiryRecord } from '../../services/enquiries-api.types';
import { LeadsApiService } from '../../services/leads-api.service';
import { EnquiriesPage } from './enquiries-page';

describe('EnquiriesPage', () => {
  let fixture: ComponentFixture<EnquiriesPage>;
  const enquiry: EnquiryRecord = {
    id: 'enquiry-1',
    businessId: 'bizpilot-demo-urbannest',
    customerId: 'customer-1',
    message: 'Interested in a consultation.',
    source: 'WHATSAPP',
    status: 'NEW',
    createdAt: '2026-09-29T10:00:00.000Z',
    updatedAt: '2026-09-29T10:00:00.000Z',
    customer: {
      id: 'customer-1',
      name: 'Riya Shah',
      email: 'riya@example.com',
      phone: null,
    },
  };
  const api = {
    getEnquiries: vi.fn(),
    createEnquiry: vi.fn(),
    updateEnquiry: vi.fn(),
  };
  const leadsApi = { createLead: vi.fn() };

  beforeEach(async () => {
    api.getEnquiries.mockReset().mockReturnValue(of([enquiry]));
    api.createEnquiry.mockReset();
    api.updateEnquiry.mockReset();
    leadsApi.createLead.mockReset();

    await TestBed.configureTestingModule({
      imports: [EnquiriesPage],
      providers: [
        { provide: EnquiriesApiService, useValue: api },
        { provide: LeadsApiService, useValue: leadsApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EnquiriesPage);
    fixture.detectChanges();
  });

  it('renders customer and enquiry details from the API', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Riya Shah');
    expect(element.textContent).toContain('riya@example.com');
    expect(element.textContent).toContain('Interested in a consultation.');
    expect(element.textContent).toContain('WhatsApp');
    const customer = element.querySelector<HTMLElement>('.enquiry-customer');
    const avatar = element.querySelector<HTMLElement>('.enquiry-avatar');
    const name = element.querySelector<HTMLElement>('.enquiry-customer strong');
    expect(avatar?.textContent?.trim()).toBe('R');
    expect(avatar?.getAttribute('aria-hidden')).toBe('true');
    expect(name?.textContent?.trim()).toBe('Riya Shah');
    expect(customer?.textContent?.match(/Riya Shah/g)).toHaveLength(1);
  });

  it.each([
    ['NEW', 'New'],
    ['IN_PROGRESS', 'In Progress'],
    ['RESOLVED', 'Resolved'],
    ['CLOSED', 'Closed'],
  ] as const)('renders the API status %s as the selected %s option', async (apiStatus, label) => {
    api.getEnquiries.mockReturnValue(of([{ ...enquiry, status: apiStatus }]));
    fixture.destroy();
    fixture = TestBed.createComponent(EnquiriesPage);
    fixture.detectChanges();
    await fixture.whenStable();

    const select = (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLSelectElement>('.enquiry-status-control select')!;
    expect(select.value).toBe(apiStatus);
    expect(select.selectedOptions[0]?.textContent?.trim()).toBe(label);
  });

  it('renders a refreshed IN_PROGRESS API response as In Progress, not New', async () => {
    api.getEnquiries.mockReturnValue(of([{ ...enquiry, status: 'IN_PROGRESS' }]));
    fixture.destroy();
    fixture = TestBed.createComponent(EnquiriesPage);
    fixture.detectChanges();
    await fixture.whenStable();

    const select = (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLSelectElement>('.enquiry-status-control select')!;
    expect(select.value).toBe('IN_PROGRESS');
    expect(select.selectedOptions[0]?.textContent?.trim()).toBe('In Progress');
  });

  it('filters enquiries by status and source', async () => {
    const element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    const filters = element.querySelectorAll<HTMLSelectElement>('.enquiry-filters select');
    filters[0]!.value = 'CLOSED';
    filters[0]!.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(element.textContent).toContain('No matching enquiries');

    filters[0]!.value = '';
    filters[0]!.dispatchEvent(new Event('change'));
    filters[1]!.value = 'EMAIL';
    filters[1]!.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(element.textContent).toContain('No matching enquiries');
  });

  it('changes an enquiry from New to In Progress using the backend enum value', async () => {
    api.updateEnquiry.mockReturnValue(of({ ...enquiry, status: 'IN_PROGRESS' }));
    const element = fixture.nativeElement as HTMLElement;
    const status = element.querySelector<HTMLSelectElement>('.enquiry-status-control select');
    expect(status).not.toBeNull();

    await fixture.whenStable();
    expect(status!.value).toBe('NEW');
    status!.value = 'IN_PROGRESS';
    status!.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(api.updateEnquiry).toHaveBeenCalledWith('enquiry-1', { status: 'IN_PROGRESS' });
    expect(element.querySelector<HTMLSelectElement>('.enquiry-status-select')?.value).toBe('IN_PROGRESS');
    expect(element.querySelector('.enquiry-status-select')?.textContent).toContain('In Progress');
  });

  it('changes an enquiry from In Progress to Resolved using the API-returned status', async () => {
    api.updateEnquiry
      .mockReturnValueOnce(of({ ...enquiry, status: 'IN_PROGRESS' }))
      .mockReturnValueOnce(of({ ...enquiry, status: 'RESOLVED' }));
    const element = fixture.nativeElement as HTMLElement;
    const status = element.querySelector<HTMLSelectElement>('.enquiry-status-control select')!;
    await fixture.whenStable();
    status.value = 'IN_PROGRESS';
    status.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(status.value).toBe('IN_PROGRESS');
    status.value = 'RESOLVED';
    status.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(api.updateEnquiry).toHaveBeenNthCalledWith(1, 'enquiry-1', { status: 'IN_PROGRESS' });
    expect(api.updateEnquiry).toHaveBeenCalledWith('enquiry-1', { status: 'RESOLVED' });
    expect(element.querySelector<HTMLSelectElement>('.enquiry-status-select')?.value).toBe('RESOLVED');
  });

  it('restores the previous status when the update request fails', async () => {
    api.updateEnquiry.mockReturnValue(throwError(() => new Error('request failed')));
    const element = fixture.nativeElement as HTMLElement;
    const status = element.querySelector<HTMLSelectElement>('.enquiry-status-control select')!;
    await fixture.whenStable();
    status.value = 'IN_PROGRESS';
    status.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(api.updateEnquiry).toHaveBeenCalledWith('enquiry-1', { status: 'IN_PROGRESS' });
    expect(element.querySelector<HTMLSelectElement>('.enquiry-status-select')?.value).toBe('NEW');
    expect(element.textContent).toContain('could not be completed');
  });

  it('disables the status control while the update request is pending', async () => {
    const update = new Subject<EnquiryRecord>();
    api.updateEnquiry.mockReturnValue(update);
    const element = fixture.nativeElement as HTMLElement;
    const status = element.querySelector<HTMLSelectElement>('.enquiry-status-control select')!;
    await fixture.whenStable();
    status.value = 'IN_PROGRESS';
    status.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(status.disabled).toBe(true);
    update.next({ ...enquiry, status: 'IN_PROGRESS' });
    update.complete();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(element.querySelector<HTMLSelectElement>('.enquiry-status-control select')?.disabled).toBe(false);
  });

  it('opens the conversion dialog with enquiry details and default values', () => {
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.enquiry-convert-button')!.click();
    fixture.detectChanges();

    expect(element.querySelector('[role="dialog"]')).not.toBeNull();
    expect(element.textContent).toContain('Riya Shah');
    expect(element.textContent).toContain('riya@example.com');
    expect(element.textContent).toContain('Not provided');
    expect(element.textContent).toContain('Interested in a consultation.');
    expect(element.querySelector<HTMLInputElement>('[name="service"]')?.value).toBe('General enquiry');
    expect(
      Array.from(element.querySelectorAll<HTMLSelectElement>('.enquiry-dialog select'))
        .find((select) => select.closest('label')?.textContent?.includes('Lead source'))?.value,
    ).toBe('WHATSAPP');
    expect(
      Array.from(element.querySelectorAll<HTMLSelectElement>('.enquiry-dialog select'))
        .find((select) => select.closest('label')?.textContent?.includes('Lead status'))?.value,
    ).toBe('NEW');
  });

  it('creates a lead using the existing customer ID and enquiry values', () => {
    leadsApi.createLead.mockReturnValue(of({ id: 'lead-1' }));
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.enquiry-convert-button')!.click();
    fixture.detectChanges();

    const service = element.querySelector<HTMLInputElement>('[name="service"]')!;
    service.value = 'Kitchen renovation';
    service.dispatchEvent(new Event('input'));
    const status = Array.from(element.querySelectorAll<HTMLSelectElement>('.enquiry-dialog select'))
      .find((select) => select.closest('label')?.textContent?.includes('Lead status'))!;
    status.value = 'QUALIFIED';
    status.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    element.querySelector<HTMLFormElement>('.enquiry-dialog form')!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(leadsApi.createLead).toHaveBeenCalledWith({
      customerId: 'customer-1',
      service: 'Kitchen renovation',
      source: 'WHATSAPP',
      status: 'QUALIFIED',
      message: 'Interested in a consultation.',
    });
    expect(element.textContent).toContain('Enquiry converted to lead successfully.');
    expect(element.textContent).toContain('Converted to lead');
    expect(api.getEnquiries).toHaveBeenCalledTimes(2);
    expect(element.querySelector('.enquiry-convert-button')).toBeNull();
  });

  it('shows a conversion API error and allows retrying', () => {
    leadsApi.createLead
      .mockReturnValueOnce(throwError(() => new Error('request failed')))
      .mockReturnValueOnce(of({ id: 'lead-1' }));
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.enquiry-convert-button')!.click();
    fixture.detectChanges();
    element.querySelector<HTMLFormElement>('.enquiry-dialog form')!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(element.textContent).toContain('The enquiry could not be converted to a lead.');
    element.querySelector<HTMLButtonElement>('.enquiry-conversion-error button')!.click();
    fixture.detectChanges();

    expect(leadsApi.createLead).toHaveBeenCalledTimes(2);
    expect(element.textContent).toContain('Enquiry converted to lead successfully.');
  });

  it('prevents duplicate conversion attempts while the request is in progress', () => {
    const conversion = new Subject<{ id: string }>();
    leadsApi.createLead.mockReturnValue(conversion);
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.enquiry-convert-button')!.click();
    fixture.detectChanges();
    const form = element.querySelector<HTMLFormElement>('.enquiry-dialog form')!;

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(leadsApi.createLead).toHaveBeenCalledOnce();
    expect(element.querySelector<HTMLButtonElement>('.enquiry-dialog [type="submit"]')?.disabled)
      .toBe(true);
    conversion.next({ id: 'lead-1' });
    conversion.complete();
    fixture.detectChanges();
  });

  it('does not show the convert action for an enquiry already converted in this page session', () => {
    leadsApi.createLead.mockReturnValue(of({ id: 'lead-1' }));
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.enquiry-convert-button')!.click();
    fixture.detectChanges();
    element.querySelector<HTMLFormElement>('.enquiry-dialog form')!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(element.querySelector('.enquiry-convert-button')).toBeNull();
    expect(element.textContent).toContain('Converted to lead');
  });
});
