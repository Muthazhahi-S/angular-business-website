import { TestBed } from '@angular/core/testing';
import { App } from './app';
import {
  BUSINESS_PROFILES,
  BUSINESS_PROFILE,
  BUSINESS_TYPE_LABELS,
  BUSINESS_TYPES,
  ACTIVE_BUSINESS_TYPE,
  ACTIVE_BUSINESS_TYPE_TOKEN,
  DEMO_SETTINGS,
  WEBSITE_PACKAGES,
  WHATSAPP_CONFIG,
} from './site-profile';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the active salon profile across the site sections', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hair & beauty care');
    expect(compiled.querySelectorAll('.service-card h3')).toHaveLength(6);
    expect(compiled.querySelectorAll('.package-card')).toHaveLength(3);
    expect(compiled.querySelectorAll('.package-card__cta[href="#contact"]')).toHaveLength(3);
    expect(compiled.querySelector('.package-card[aria-labelledby="package-starter"]')?.textContent).toContain('1–3 pages');
    expect(compiled.querySelector('.package-card[aria-labelledby="package-business"]')?.textContent).toContain('WhatsApp / contact CTA');
    expect(compiled.querySelector('.package-card[aria-labelledby="package-custom"]')?.textContent).toContain('API integration when required');
    expect(compiled.textContent).toContain('GreenLeaf Salon');
    expect(compiled.querySelector('.brand__name')?.textContent).toContain('GreenLeaf Salon');
    expect(compiled.querySelector('.nav__contact')?.textContent).toContain('Enquire about an appointment');
    expect(compiled.querySelector('.hero__actions .button')?.textContent).toContain('Enquire about an appointment');
    expect(compiled.querySelector('.hero__description')?.textContent).toContain('ask about appointments');
    expect(compiled.querySelector('.contact__details a[href="mailto:greenleaf@example.com"]')?.textContent).toContain('greenleaf@example.com');
    expect(compiled.querySelector('.contact__details a[href="tel:+919876543210"]')?.textContent).toContain('+91 98765 43210');
    const expectedWhatsAppUrl = `https://wa.me/${WHATSAPP_CONFIG.whatsappNumber}?text=${encodeURIComponent(WHATSAPP_CONFIG.whatsappMessage)}`;
    expect(compiled.querySelector('.contact__whatsapp-link')?.getAttribute('href')).toBe(expectedWhatsAppUrl);
    expect(compiled.querySelector('.contact__whatsapp-link')?.getAttribute('aria-label')).toBe('Chat with GreenLeaf Salon on WhatsApp');
    expect(compiled.querySelector('.contact__whatsapp')?.textContent).not.toContain('Demo WhatsApp number');
    expect(compiled.querySelector('.contact__availability')).toBeNull();
    expect(compiled.querySelector('.footer__bottom')?.textContent).not.toContain('sample contact details');
    expect(compiled.textContent).not.toContain('Browse a sample');
    expect(compiled.querySelector('app-whatsapp-float .whatsapp-float')?.getAttribute('href')).toBe(expectedWhatsAppUrl);
    expect(compiled.querySelector('app-whatsapp-float .whatsapp-float')?.getAttribute('aria-label')).toBe('Chat with GreenLeaf Salon on WhatsApp');
    expect(compiled.querySelector('.contact__address')?.textContent).toContain('Salem, Tamil Nadu');
    expect(compiled.querySelector('.contact__form')?.getAttribute('aria-label')).toBe('Contact GreenLeaf Salon');
    expect(compiled.querySelector('.footer__brand p')?.textContent).toContain('Professional Hair & Beauty Care');
    expect(compiled.querySelector('.footer__bottom')?.textContent).toContain('GreenLeaf Salon');
    expect(compiled.querySelector('.footer__links a[href="mailto:greenleaf@example.com"]')).not.toBeNull();
    expect(compiled.querySelector('.footer__links a[href="tel:+919876543210"]')?.textContent).toContain('+91 98765 43210');
    expect(compiled.querySelector('.footer__links')?.textContent).toContain('Salem, Tamil Nadu');
    expect(document.title).toContain('GreenLeaf Salon');
    expect(compiled.querySelectorAll('.outcome-card')).toHaveLength(3);
    expect(compiled.querySelectorAll('.contact__form option')).toHaveLength(8);
  });

  it('renders a different selected profile throughout the site', async () => {
    const profile = BUSINESS_PROFILES.restaurantCafe;
    TestBed.overrideProvider(ACTIVE_BUSINESS_TYPE_TOKEN, { useValue: 'restaurantCafe' });

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(profile.name).not.toBe(BUSINESS_PROFILES[ACTIVE_BUSINESS_TYPE].name);
    expect(compiled.querySelector('.brand__name')?.textContent).toContain(profile.name);
    expect(compiled.querySelector('.footer__brand p')?.textContent).toContain(profile.tagline);
    expect(compiled.querySelector('h1')?.textContent).toContain(profile.hero.headingLead);
    expect(compiled.querySelector('.hero__description')?.textContent).toContain(profile.hero.subheading);
    expect(compiled.querySelector('.service-card h3')?.textContent).toBe(profile.services.items[0].name);
    expect(compiled.querySelector('#about-title')?.textContent).toContain(profile.about.headingLead);
    expect(compiled.querySelector('#why-title')?.textContent).toContain(profile.why.headingLead);
    expect(compiled.querySelector('#process-title')?.textContent).toContain(profile.process.headingLead);
    expect(compiled.querySelector('.nav__contact')?.textContent).toContain(profile.navigation.contactCta);
    expect(compiled.querySelector('.contact__form')?.getAttribute('aria-label')).toBe(profile.contact.formLabel);
    expect(compiled.querySelector('#contact-title')?.textContent).toContain(profile.contact.headingLead);
    expect(document.title).toBe(profile.pageTitle);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(profile.pageDescription);
    expect(compiled.querySelectorAll('.package-card')).toHaveLength(WEBSITE_PACKAGES.length);
    expect(compiled.querySelector('.contact__whatsapp-link')?.getAttribute('href')).toBe(profile.whatsappUrl);
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
      expect(profile.hero).toEqual(expect.objectContaining({
        eyebrow: expect.any(String),
        headingLead: expect.any(String),
        headingSecondLine: expect.any(String),
        headingEmphasis: expect.any(String),
        subheading: expect.any(String),
        contactCta: expect.any(String),
        imageUrl: expect.any(String),
        imageAlt: expect.any(String),
      }));
      expect(profile.hero.headingLead).toBeTruthy();
      expect(profile.services.items).toHaveLength(6);
      expect(profile.services.eyebrow).toBeTruthy();
      expect(profile.services.headingLead).toBeTruthy();
      expect(profile.services.intro).toBeTruthy();
      expect(profile.services.items.every((service) => service.name && service.description && service.symbol)).toBe(true);
      expect(profile.about.values.length).toBeGreaterThan(0);
      expect(profile.about.headingLead).toBeTruthy();
      expect(profile.about.intro).toBeTruthy();
      expect(profile.about.description).toBeTruthy();
      expect(profile.about.imageUrl).toBeTruthy();
      expect(profile.about.imageAlt).toBeTruthy();
      expect(profile.why.principles.length).toBeGreaterThan(0);
      expect(profile.why.headingLead).toBeTruthy();
      expect(profile.why.intro).toBeTruthy();
      expect(profile.why.principles.every((principle) => principle.title && principle.description)).toBe(true);
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
      expect(profile.whatsappNumber).toBe(WHATSAPP_CONFIG.whatsappNumber);
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
