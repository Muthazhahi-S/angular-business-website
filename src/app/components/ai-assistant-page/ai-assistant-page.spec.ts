import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AiAssistantApiService } from '../../services/ai-assistant-api.service';
import { LeadsApiService } from '../../services/leads-api.service';
import { LeadRecord } from '../../services/leads-api.types';
import { LeadStatus } from '../../services/dashboard-api.types';
import {
  AiAssistantPage,
  createFollowUpMessage,
  createWhatsAppUrl,
  getFollowUpCandidates,
  normalizeWhatsAppPhone,
} from './ai-assistant-page';

describe('AiAssistantPage', () => {
  let fixture: ComponentFixture<AiAssistantPage>;
  const api = { sendMessage: vi.fn() };
  const leadsApi = { getLeads: vi.fn() };

  const makeLead = (
    id: string,
    status: LeadStatus,
    dates: { createdAt?: string; updatedAt?: string } = {},
    phone: string | null = null,
  ): LeadRecord => ({
    id,
    businessId: 'business-1',
    customerId: `customer-${id}`,
    service: 'Renovation service',
    source: 'WEBSITE',
    status,
    message: 'Interested in next steps.',
    createdAt: dates.createdAt ?? '2026-09-27T10:00:00.000Z',
    updatedAt: dates.updatedAt ?? '2026-09-27T10:00:00.000Z',
    customer: {
      id: `customer-${id}`,
      name: 'Bharani',
      email: 'bharani@example.com',
      phone,
    },
  });

  beforeEach(async () => {
    api.sendMessage.mockReset();
    leadsApi.getLeads.mockReset();
    await TestBed.configureTestingModule({
      imports: [AiAssistantPage],
      providers: [
        { provide: AiAssistantApiService, useValue: api },
        { provide: LeadsApiService, useValue: leadsApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AiAssistantPage);
    fixture.detectChanges();
  });

  it('sends a suggested question and displays user and assistant messages', () => {
    api.sendMessage.mockReturnValue(of({ answer: 'You have 5 leads in total.' }));
    const element = fixture.nativeElement as HTMLElement;
    const suggestion = Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('How many leads do I have?'),
    );
    suggestion!.click();
    fixture.detectChanges();

    expect(api.sendMessage).toHaveBeenCalledWith('How many leads do I have?');
    expect(element.textContent).toContain('You');
    expect(element.textContent).toContain('How many leads do I have?');
    expect(element.textContent).toContain('You have 5 leads in total.');
    expect(element.querySelectorAll('.chat-message')).toHaveLength(2);
  });

  it('submits typed questions and displays recent enquiry data', () => {
    api.sendMessage.mockReturnValue(
      of({
        answer: 'Here are your 1 most recent enquiry.',
        data: {
          type: 'recent-enquiries',
          enquiries: [
            {
              id: 'enquiry-1',
              message: 'Interested in a consultation',
              source: 'WHATSAPP',
              status: 'NEW',
              createdAt: '2026-09-29T10:00:00.000Z',
              customer: { id: 'customer-1', name: 'Riya Shah', email: 'riya@example.com' },
            },
          ],
        },
      }),
    );
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector<HTMLTextAreaElement>('#assistant-question')!;
    input.value = 'Show my recent enquiries';
    input.dispatchEvent(new Event('input'));
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(api.sendMessage).toHaveBeenCalledWith('Show my recent enquiries');
    expect(element.textContent).toContain('Riya Shah');
    expect(element.textContent).toContain('Interested in a consultation');
  });

  it('shows an API error and retries the failed message', () => {
    api.sendMessage
      .mockReturnValueOnce(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 503,
              error: { message: 'unavailable' },
            }),
        ),
      )
      .mockReturnValueOnce(of({ answer: 'You have 5 leads in total.' }));
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector<HTMLTextAreaElement>('#assistant-question')!;
    input.value = 'How many leads?';
    input.dispatchEvent(new Event('input'));
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(element.textContent).toContain('Business data is temporarily unavailable.');

    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === 'Retry')!
      .click();
    fixture.detectChanges();

    expect(api.sendMessage).toHaveBeenCalledTimes(2);
    expect(api.sendMessage).toHaveBeenLastCalledWith('How many leads?');
    expect(element.textContent).toContain('You have 5 leads in total.');
    expect(element.querySelectorAll('.chat-message--user')).toHaveLength(1);
  });

  it('shows the friendly usage-limit message for HTTP 429 and keeps retry available', () => {
    api.sendMessage.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 429,
            error: {
              message: 'The AI assistant has reached its current usage limit. Please try again later.',
              statusCode: 429,
            },
          }),
      ),
    );
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector<HTMLTextAreaElement>('#assistant-question')!;
    input.value = 'How many leads?';
    input.dispatchEvent(new Event('input'));
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(element.textContent).toContain(
      'The AI assistant has reached its current usage limit. Please try again later.',
    );
    expect(
      Array.from(element.querySelectorAll('button')).some(
        (button) => button.textContent?.trim() === 'Retry',
      ),
    ).toBe(true);
    expect(element.textContent).not.toContain(
      'Your message could not be sent. Please try again.',
    );
  });

  it('shows an appropriate message for other API errors', () => {
    api.sendMessage.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector<HTMLTextAreaElement>('#assistant-question')!;
    input.value = 'How many leads?';
    input.dispatchEvent(new Event('input'));
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(element.textContent).toContain(
      'Your message could not be sent. Please try again.',
    );
  });

  it('finds CONTACTED and QUALIFIED leads and NEW leads older than one day', () => {
    const now = new Date('2026-09-29T12:00:00.000Z');
    const leads = [
      makeLead('contacted', 'CONTACTED', { createdAt: '2026-09-29T11:30:00.000Z' }),
      makeLead('qualified', 'QUALIFIED', { createdAt: '2026-09-29T11:30:00.000Z' }),
      makeLead('old-new', 'NEW', { createdAt: '2026-09-28T11:59:59.000Z' }),
      makeLead('recent-new', 'NEW', { createdAt: '2026-09-28T12:00:00.000Z' }),
    ];

    expect(getFollowUpCandidates(leads, now).map(({ lead }) => lead.id)).toEqual([
      'contacted',
      'qualified',
      'old-new',
    ]);
  });

  it('excludes CONVERTED and LOST leads', () => {
    const leads = [
      makeLead('converted', 'CONVERTED'),
      makeLead('lost', 'LOST'),
    ];
    expect(getFollowUpCandidates(leads)).toEqual([]);
  });

  it('includes CONTACTED and QUALIFIED leads when dates are unavailable', () => {
    const leads = [
      makeLead('contacted', 'CONTACTED', { createdAt: '', updatedAt: '' }),
      makeLead('qualified', 'QUALIFIED', { createdAt: '', updatedAt: '' }),
      makeLead('new', 'NEW', { createdAt: '', updatedAt: '' }),
    ];
    expect(getFollowUpCandidates(leads).map(({ lead }) => lead.id)).toEqual([
      'contacted',
      'qualified',
    ]);
  });

  it('uses updatedAt when createdAt is unavailable for NEW lead age', () => {
    const lead = makeLead('old-new', 'NEW', {
      createdAt: '',
      updatedAt: '2026-09-27T10:00:00.000Z',
    });
    expect(
      getFollowUpCandidates([lead], new Date('2026-09-29T12:00:00.000Z')).map(
        ({ lead: candidate }) => candidate.id,
      ),
    ).toEqual(['old-new']);
  });

  it('generates a follow-up reason for each included lead status', () => {
    const candidates = getFollowUpCandidates([
      makeLead('contacted', 'CONTACTED'),
      makeLead('qualified', 'QUALIFIED'),
      makeLead('old-new', 'NEW', { createdAt: '2026-09-27T10:00:00.000Z' }),
    ], new Date('2026-09-29T12:00:00.000Z'));

    expect(candidates.map(({ reason }) => reason)).toEqual([
      'This lead has been contacted and may need a follow-up.',
      'This qualified lead may be ready for the next steps.',
      'This new lead has been waiting for over a day.',
    ]);
  });

  it('generates a deterministic local draft message', () => {
    expect(createFollowUpMessage(makeLead('contacted', 'CONTACTED'))).toBe(
      'Hi Bharani, I’m following up regarding your enquiry about Renovation service. Please let us know if you’d like to discuss the next steps. We’d be happy to help.',
    );
  });

  it('normalizes Indian 10-digit and international phone numbers', () => {
    expect(normalizeWhatsAppPhone('98765 43210')).toBe('919876543210');
    expect(normalizeWhatsAppPhone('+1 (415) 555-2671')).toBe('14155552671');
    expect(normalizeWhatsAppPhone('+91-98765-43210')).toBe('919876543210');
  });

  it('rejects missing and invalid phone numbers', () => {
    expect(normalizeWhatsAppPhone(null)).toBeNull();
    expect(normalizeWhatsAppPhone('')).toBeNull();
    expect(normalizeWhatsAppPhone('1234567890')).toBeNull();
    expect(normalizeWhatsAppPhone('01234567890')).toBeNull();
    expect(normalizeWhatsAppPhone('1234567')).toBeNull();
  });

  it('generates a WhatsApp URL with an encoded message', () => {
    const message = 'Hi Bharani, are you ready to discuss next steps?';
    const url = createWhatsAppUrl('+91 (98765) 43210', message);
    expect(url).toBe(
      `https://wa.me/919876543210?text=${encodeURIComponent(message)}`,
    );
    expect(new URL(url!).searchParams.get('text')).toBe(message);
    expect(createWhatsAppUrl('invalid', message)).toBeNull();
  });

  it('shows the empty state when no leads need follow-up', () => {
    leadsApi.getLeads.mockReturnValue(of([makeLead('won', 'CONVERTED')]));
    const element = fixture.nativeElement as HTMLElement;
    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === 'Find leads to follow up')!
      .click();
    fixture.detectChanges();

    expect(leadsApi.getLeads).toHaveBeenCalledOnce();
    expect(element.textContent).toContain('No leads need follow-up right now.');
  });

  it('displays lead details and opens an editable local draft', () => {
    leadsApi.getLeads.mockReturnValue(of([makeLead('contacted', 'CONTACTED')]));
    const element = fixture.nativeElement as HTMLElement;
    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === 'Find leads to follow up')!
      .click();
    fixture.detectChanges();

    expect(element.textContent).toContain('Bharani');
    expect(element.textContent).toContain('Renovation service');
    expect(element.textContent).toContain('CONTACTED');
    expect(element.textContent).toContain('WEBSITE');
    expect(element.textContent).toContain('Interested in next steps.');
    expect(element.textContent).toContain('This lead has been contacted');

    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === 'Draft follow-up message')!
      .click();
    fixture.detectChanges();
    expect(
      element.querySelector<HTMLTextAreaElement>('#follow-up-draft-contacted')?.value,
    ).toContain('Hi Bharani, I’m following up');
  });

  it('opens WhatsApp in a new tab with the drafted message and selected lead phone', () => {
    leadsApi.getLeads.mockReturnValue(
      of([makeLead('contacted', 'CONTACTED', {}, '+91 (98765) 43210')]),
    );
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const element = fixture.nativeElement as HTMLElement;
    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === 'Find leads to follow up')!
      .click();
    fixture.detectChanges();
    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === 'Draft follow-up message')!
      .click();
    fixture.detectChanges();
    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === 'Send via WhatsApp')!
      .click();

    expect(open).toHaveBeenCalledWith(
      `https://wa.me/919876543210?text=${encodeURIComponent(createFollowUpMessage(makeLead('contacted', 'CONTACTED')))}`,
      '_blank',
      'noopener,noreferrer',
    );
    open.mockRestore();
  });

  it('disables WhatsApp and explains when the lead has no valid phone number', () => {
    leadsApi.getLeads.mockReturnValue(of([makeLead('contacted', 'CONTACTED')]));
    const element = fixture.nativeElement as HTMLElement;
    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === 'Find leads to follow up')!
      .click();
    fixture.detectChanges();
    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === 'Draft follow-up message')!
      .click();
    fixture.detectChanges();

    const whatsappButton = Array.from(element.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Send via WhatsApp',
    )!;
    expect(whatsappButton.disabled).toBe(true);
    expect(element.textContent).toContain('No valid phone number available for this lead.');
  });

  it('keeps the copy message action working for the drafted message', async () => {
    const previousClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    try {
      leadsApi.getLeads.mockReturnValue(
        of([makeLead('contacted', 'CONTACTED', {}, '9876543210')]),
      );
      const element = fixture.nativeElement as HTMLElement;
      Array.from(element.querySelectorAll('button'))
        .find((button) => button.textContent?.trim() === 'Find leads to follow up')!
        .click();
      fixture.detectChanges();
      Array.from(element.querySelectorAll('button'))
        .find((button) => button.textContent?.trim() === 'Draft follow-up message')!
        .click();
      fixture.detectChanges();
      Array.from(element.querySelectorAll('button'))
        .find((button) => button.textContent?.trim() === 'Copy message')!
        .click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(writeText).toHaveBeenCalledWith(createFollowUpMessage(makeLead('contacted', 'CONTACTED')));
      expect(element.textContent).toContain('Copied');
    } finally {
      if (previousClipboard) {
        Object.defineProperty(navigator, 'clipboard', previousClipboard);
      } else {
        Reflect.deleteProperty(navigator, 'clipboard');
      }
    }
  });

  it('shows an API error state with a retry action', () => {
    leadsApi.getLeads
      .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 503 })))
      .mockReturnValueOnce(of([makeLead('contacted', 'CONTACTED')]));
    const element = fixture.nativeElement as HTMLElement;
    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === 'Find leads to follow up')!
      .click();
    fixture.detectChanges();

    expect(element.textContent).toContain('Could not load leads for follow-up.');
    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === 'Retry')!
      .click();
    fixture.detectChanges();

    expect(leadsApi.getLeads).toHaveBeenCalledTimes(2);
    expect(element.textContent).toContain('Bharani');
  });
});
