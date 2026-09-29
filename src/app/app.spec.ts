import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { App } from './app';
import { APP_PAGES } from './app.types';
import { DashboardApiService } from './services/dashboard-api.service';
import { DashboardResponse } from './services/dashboard-api.types';
import { BusinessProfileApiService } from './services/business-profile-api.service';
import { AiAssistantApiService } from './services/ai-assistant-api.service';
import { EnquiriesApiService } from './services/enquiries-api.service';
import { LeadsApiService } from './services/leads-api.service';
import { BusinessProfile } from './services/business-profile-api.types';
import {
  BUSINESS_PROFILES,
  BUSINESS_TYPE_LABELS,
  BUSINESS_TYPES,
  DEMO_SETTINGS,
  WEBSITE_PACKAGES,
  WHATSAPP_CONFIG,
} from './site-profile';

const DASHBOARD_RESPONSE: DashboardResponse = {
  businessId: 'bizpilot-demo-urbannest',
  totalLeads: 5,
  newEnquiries: 1,
  contactedLeads: 1,
  convertedLeads: 1,
  recentEnquiries: [
    {
      id: 'enquiry-1',
      message: 'Looking for a home interior consultation.',
      source: 'WEBSITE',
      status: 'NEW',
      createdAt: '2026-09-29T10:42:00.000Z',
      customer: { id: 'customer-1', name: 'Rohan Kapoor', email: 'rohan@example.com' },
    },
  ],
  leadPipeline: { NEW: 1, CONTACTED: 1, QUALIFIED: 1, CONVERTED: 1, LOST: 1 },
};

const DEMO_PROFILE: BusinessProfile = {
  id: 'bizpilot-demo-urbannest',
  name: 'UrbanNest Interiors',
  email: 'hello@urbannest.in',
  phone: null,
  industry: 'Interior Design',
  location: null,
  createdAt: '2026-09-29T10:00:00.000Z',
  updatedAt: '2026-09-29T10:00:00.000Z',
};

describe('App', () => {
  const profileApi = { getProfile: vi.fn(), updateProfile: vi.fn() };

  beforeEach(async () => {
    window.sessionStorage.setItem('bizpilot-demo-onboarding-completed', 'true');
    profileApi.getProfile.mockReset();
    profileApi.updateProfile.mockReset().mockReturnValue(of(DEMO_PROFILE));
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: DashboardApiService,
          useValue: { getDashboard: vi.fn().mockReturnValue(of(DASHBOARD_RESPONSE)) },
        },
        {
          provide: LeadsApiService,
          useValue: { getLeads: vi.fn().mockReturnValue(of([])) },
        },
        {
          provide: EnquiriesApiService,
          useValue: {
            getEnquiries: vi.fn().mockReturnValue(of([])),
            createEnquiry: vi.fn(),
            updateEnquiry: vi.fn(),
          },
        },
        {
          provide: BusinessProfileApiService,
          useValue: profileApi,
        },
        {
          provide: AiAssistantApiService,
          useValue: { sendMessage: vi.fn() },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('shows onboarding only until it is completed or skipped during the session', async () => {
    window.sessionStorage.removeItem('bizpilot-demo-onboarding-completed');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('app-business-onboarding')).not.toBeNull();
    expect(element.querySelector('app-dashboard')).toBeNull();
    element.querySelector<HTMLButtonElement>('.onboarding-skip')!.click();
    fixture.detectChanges();
    expect(element.querySelector('app-business-onboarding')).toBeNull();
    expect(element.querySelector('app-dashboard')).not.toBeNull();
    expect(window.sessionStorage.getItem('bizpilot-demo-onboarding-completed')).toBe('true');

    fixture.destroy();
    const nextApp = TestBed.createComponent(App);
    await nextApp.whenStable();
    nextApp.detectChanges();
    expect((nextApp.nativeElement as HTMLElement).querySelector('app-business-onboarding')).toBeNull();

    window.sessionStorage.removeItem('bizpilot-demo-onboarding-completed');
  });

  it('shows onboarding when the session completion flag is absent', async () => {
    window.sessionStorage.removeItem('bizpilot-demo-onboarding-completed');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('app-business-onboarding')).not.toBeNull();
    expect(element.querySelector('app-dashboard')).toBeNull();
    fixture.destroy();
    window.sessionStorage.removeItem('bizpilot-demo-onboarding-completed');
  });

  it('does not show onboarding when the session completion flag is true', async () => {
    window.sessionStorage.setItem('bizpilot-demo-onboarding-completed', 'true');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('app-business-onboarding')).toBeNull();
    expect(element.querySelector('app-dashboard')).not.toBeNull();
    fixture.destroy();
    window.sessionStorage.removeItem('bizpilot-demo-onboarding-completed');
  });

  it('stores completion immediately after creating the workspace and respects it after refresh', async () => {
    window.sessionStorage.removeItem('bizpilot-demo-onboarding-completed');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const setField = (field: string, value: string): void => {
      const input = element.querySelector<HTMLInputElement>(`[formControlName="${field}"]`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };

    setField('name', 'UrbanNest Interiors');
    setField('industry', 'Interior Design');
    setField('email', 'hello@urbannest.in');
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    await fixture.whenStable();

    expect(profileApi.updateProfile).toHaveBeenCalledOnce();
    expect(element.textContent).toContain('Your business workspace is ready.');
    expect(window.sessionStorage.getItem('bizpilot-demo-onboarding-completed')).toBe('true');

    fixture.destroy();
    const refreshedApp = TestBed.createComponent(App);
    await refreshedApp.whenStable();
    refreshedApp.detectChanges();
    expect((refreshedApp.nativeElement as HTMLElement).querySelector('app-business-onboarding'))
      .toBeNull();
    expect((refreshedApp.nativeElement as HTMLElement).querySelector('app-dashboard')).not.toBeNull();
    refreshedApp.destroy();
    window.sessionStorage.removeItem('bizpilot-demo-onboarding-completed');
  });

  it('renders the BizPilot dashboard and its main overview sections', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand__text')?.textContent).toContain('BizPilot');
    expect(compiled.querySelectorAll('app-stat-card')).toHaveLength(4);
    expect(compiled.textContent).toContain('Total leads');
    expect(compiled.textContent).toContain('New enquiries');
    expect(compiled.textContent).toContain('Contacted leads');
    expect(compiled.textContent).toContain('Converted leads');
    expect(compiled.textContent).toContain('Recent enquiries');
    expect(compiled.textContent).toContain('Recent activity');
    expect(compiled.textContent).toContain('Rohan Kapoor');
    expect(compiled.textContent).toContain('Looking for a home interior consultation.');
    expect(compiled.querySelectorAll('.pipeline__stage')).toHaveLength(5);
    expect(compiled.querySelector('.pipeline__stage:last-child strong')?.textContent).toBe('1');
    expect(compiled.querySelectorAll('.navigation__item')).toHaveLength(APP_PAGES.length);
    expect(document.title).toBe('BizPilot AI | Lead management');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain(
      'BizPilot AI',
    );
  });

  it('shows all requested sections when selected in the sidebar', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const leadsLink = Array.from(
      compiled.querySelectorAll<HTMLButtonElement>('.navigation__item'),
    ).find((item) => item.textContent?.includes('Leads'));
    const aiLink = Array.from(
      compiled.querySelectorAll<HTMLButtonElement>('.navigation__item'),
    ).find((item) => item.textContent?.includes('AI Assistant'));
    leadsLink?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('app-topbar h1')?.textContent).toContain('Leads');
    aiLink?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('app-topbar h1')?.textContent).toContain('AI Assistant');
    expect(compiled.textContent).toContain('What would you like to know?');
  });

  it('opens the existing Lead Details view from Needs Attention', async () => {
    const selectedLead = {
      id: 'lead-attention',
      businessId: 'bizpilot-demo-urbannest',
      customerId: 'customer-attention',
      service: 'Kitchen design',
      source: 'WHATSAPP' as const,
      status: 'NEW' as const,
      message: 'Interested in a kitchen refresh.',
      createdAt: '2026-09-29T10:00:00.000Z',
      updatedAt: '2026-09-29T10:00:00.000Z',
      customer: {
        id: 'customer-attention',
        name: 'Asha Rao',
        email: 'asha@example.com',
        phone: '9876543210',
      },
    };
    vi.spyOn(TestBed.inject(LeadsApiService), 'getLeads').mockReturnValue(of([selectedLead]));
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled.querySelector<HTMLButtonElement>('.attention-item__action')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.querySelector('app-topbar h1')?.textContent).toContain('Leads');
    expect(compiled.querySelector('[role="dialog"]')?.textContent).toContain('Asha Rao');
    expect(compiled.querySelector('[role="dialog"]')?.textContent).toContain('Kitchen design');
  });

  it('opens the existing Add Lead dialog from the dashboard Quick Action', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    Array.from(compiled.querySelectorAll<HTMLButtonElement>('.quick-action'))
      .find((button) => button.textContent?.includes('+ Add Lead'))!
      .click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.querySelector('app-topbar h1')?.textContent).toContain('Leads');
    expect(compiled.querySelector('#create-lead-title')?.textContent).toContain('Add a lead');
  });

  it('opens the existing Add Enquiry dialog from the dashboard Quick Action', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    Array.from(compiled.querySelectorAll<HTMLButtonElement>('.quick-action'))
      .find((button) => button.textContent?.includes('+ Add Enquiry'))!
      .click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.querySelector('app-topbar h1')?.textContent).toContain('Customer Enquiries');
    expect(compiled.querySelector('#create-enquiry-title')?.textContent).toContain('Add an enquiry');
  });

  it.each([
    ['View Leads', 'Leads'],
    ['View Enquiries', 'Customer Enquiries'],
    ['AI Assistant', 'AI Assistant'],
  ])('navigates using the %s Quick Action', async (label, expectedPage) => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    Array.from(compiled.querySelectorAll<HTMLButtonElement>('.quick-action'))
      .find((button) => button.textContent?.includes(label))!
      .click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.querySelector('app-topbar h1')?.textContent).toContain(expectedPage);
  });

  it('provides complete customizable profiles for all six business types', () => {
    expect(BUSINESS_TYPES).toHaveLength(6);

    for (const type of BUSINESS_TYPES) {
      const profile = BUSINESS_PROFILES[type];
      expect(BUSINESS_TYPE_LABELS[type]).toBeTruthy();
      expect(profile.name).toBeTruthy();
      expect(profile.tagline).toBeTruthy();
      expect(profile.email).toContain('@');
      expect(profile.phone).toBeTruthy();
      expect(profile.address).toBeTruthy();
      expect(profile.pageTitle).toBeTruthy();
      expect(profile.pageDescription).toBeTruthy();
      expect(profile.navigation.contactCta).toBeTruthy();
      expect(profile.hero).toEqual(
        expect.objectContaining({
          eyebrow: expect.any(String),
          headingLead: expect.any(String),
          headingSecondLine: expect.any(String),
          headingEmphasis: expect.any(String),
          subheading: expect.any(String),
          contactCta: expect.any(String),
          imageUrl: expect.any(String),
          imageAlt: expect.any(String),
        }),
      );
      expect(profile.hero.headingLead).toBeTruthy();
      expect(profile.services.items).toHaveLength(6);
      expect(profile.services.eyebrow).toBeTruthy();
      expect(profile.services.headingLead).toBeTruthy();
      expect(profile.services.intro).toBeTruthy();
      expect(
        profile.services.items.every(
          (service) => service.name && service.description && service.symbol,
        ),
      ).toBe(true);
      expect(profile.about.values.length).toBeGreaterThan(0);
      expect(profile.about.headingLead).toBeTruthy();
      expect(profile.about.intro).toBeTruthy();
      expect(profile.about.description).toBeTruthy();
      expect(profile.about.imageUrl).toBeTruthy();
      expect(profile.about.imageAlt).toBeTruthy();
      expect(profile.why.principles.length).toBeGreaterThan(0);
      expect(profile.why.headingLead).toBeTruthy();
      expect(profile.why.intro).toBeTruthy();
      expect(
        profile.why.principles.every((principle) => principle.title && principle.description),
      ).toBe(true);
      expect(profile.process.steps).toHaveLength(3);
      expect(profile.process.headingLead).toBeTruthy();
      expect(profile.process.intro).toBeTruthy();
      expect(profile.process.steps.every((step) => step.title && step.description)).toBe(true);
      expect(profile.contact.formLabel).toContain(profile.name);
      expect(profile.contact.headingLead).toBeTruthy();
      expect(profile.contact.formCta).toBeTruthy();
      expect(profile.contact.servicePrompt).toBeTruthy();
      expect(profile.contact.projectPrompt).toBeTruthy();
      expect(profile.packages).toBe(WEBSITE_PACKAGES);
      expect(profile.whatsappNumber).toBe(
        type === 'professionalServices' ? '919000000032' : WHATSAPP_CONFIG.whatsappNumber,
      );
      expect(profile.whatsappMessage).toBe(WHATSAPP_CONFIG.whatsappMessage);
      expect(profile.enableWhatsapp).toBe(WHATSAPP_CONFIG.enableWhatsapp);
      expect(profile.whatsappUrl).toContain(encodeURIComponent(profile.whatsappMessage));
      expect(profile.showDemoReminders).toBe(DEMO_SETTINGS.showReminders);
      expect(profile.whatsappDemoReminder).toBe(DEMO_SETTINGS.whatsappReminder);
      expect(profile.footerDemoReminder).toBe(DEMO_SETTINGS.footerReminder);
    }

    expect(WEBSITE_PACKAGES).toHaveLength(3);
    expect(WEBSITE_PACKAGES.every((websitePackage) => websitePackage.price === null)).toBe(true);
  });
});
