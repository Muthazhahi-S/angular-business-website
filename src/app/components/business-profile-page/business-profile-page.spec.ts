import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { BusinessProfileApiService } from '../../services/business-profile-api.service';
import { BusinessProfile } from '../../services/business-profile-api.types';
import { BusinessProfilePage } from './business-profile-page';

describe('BusinessProfilePage', () => {
  let fixture: ComponentFixture<BusinessProfilePage>;
  const profile: BusinessProfile = {
    id: 'bizpilot-demo-urbannest',
    name: 'UrbanNest Interiors',
    email: 'ananya@urbannest.in',
    phone: '+910000000000',
    industry: 'Interior Design',
    location: 'Bengaluru',
    createdAt: '2026-09-29T10:00:00.000Z',
    updatedAt: '2026-09-29T10:00:00.000Z',
  };
  const api = {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  };

  beforeEach(async () => {
    api.getProfile.mockReset().mockReturnValue(of(profile));
    api.updateProfile.mockReset();
    await TestBed.configureTestingModule({
      imports: [BusinessProfilePage],
      providers: [{ provide: BusinessProfileApiService, useValue: api }],
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessProfilePage);
    fixture.detectChanges();
  });

  it('loads and displays editable values from the API', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Business profile');
    expect(element.textContent).toContain('Business Information');
    expect(element.textContent).toContain('Contact Information');
    expect(element.textContent).toContain('Location');
    expect(element.querySelector<HTMLInputElement>('[formControlName="name"]')?.value).toBe(
      'UrbanNest Interiors',
    );
    expect(element.querySelector<HTMLInputElement>('[formControlName="email"]')?.value).toBe(
      'ananya@urbannest.in',
    );
    expect(element.querySelector<HTMLInputElement>('[formControlName="industry"]')?.value).toBe(
      'Interior Design',
    );
    expect(element.querySelector<HTMLInputElement>('[formControlName="phone"]')?.value).toBe(
      '+910000000000',
    );
    expect(element.querySelector<HTMLInputElement>('[formControlName="location"]')?.value).toBe(
      'Bengaluru',
    );
    expect(element.querySelector('[formControlName="description"]')).toBeNull();
    expect(element.querySelector('[formControlName="services"]')).toBeNull();
  });

  it('validates required profile fields before saving', () => {
    const element = fixture.nativeElement as HTMLElement;
    const name = element.querySelector<HTMLInputElement>('[formControlName="name"]')!;
    name.value = '';
    name.dispatchEvent(new Event('input'));
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(element.textContent).toContain('Name is required.');
    expect(api.updateProfile).not.toHaveBeenCalled();
  });

  it('validates an optional email only when provided', () => {
    const element = fixture.nativeElement as HTMLElement;
    const email = element.querySelector<HTMLInputElement>('[formControlName="email"]')!;
    email.value = 'not-an-email';
    email.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(element.textContent).toContain('Enter a valid email address.');
    expect(element.querySelector<HTMLButtonElement>('.profile-button')?.disabled).toBe(true);

    email.value = '';
    email.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(element.textContent).not.toContain('Enter a valid email address.');
  });

  it('validates a phone number when provided and accepts it when cleared', () => {
    const element = fixture.nativeElement as HTMLElement;
    const phone = element.querySelector<HTMLInputElement>('[formControlName="phone"]')!;
    phone.value = 'abc';
    phone.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(element.textContent).toContain('Enter a phone number with 7 to 15 digits');
    expect(element.querySelector<HTMLButtonElement>('.profile-button')?.disabled).toBe(true);

    phone.value = '';
    phone.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(element.textContent).not.toContain('Enter a phone number');
  });

  it('shows loading state while profile data is being fetched', () => {
    api.getProfile.mockReturnValue(new Subject<BusinessProfile>());
    fixture.destroy();
    fixture = TestBed.createComponent(BusinessProfilePage);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Loading business profile');
  });

  it('saves profile changes and shows success feedback', () => {
    const element = fixture.nativeElement as HTMLElement;
    api.updateProfile.mockReturnValue(
      of({ ...profile, name: 'UrbanNest Studio', location: 'Bengaluru, Karnataka' }),
    );
    const name = element.querySelector<HTMLInputElement>('[formControlName="name"]')!;
    name.value = 'UrbanNest Studio';
    name.dispatchEvent(new Event('input'));
    const location = element.querySelector<HTMLInputElement>('[formControlName="location"]')!;
    location.value = 'Bengaluru, Karnataka';
    location.dispatchEvent(new Event('input'));
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(api.updateProfile).toHaveBeenCalledWith({
      name: 'UrbanNest Studio',
      email: 'ananya@urbannest.in',
      phone: '+910000000000',
      industry: 'Interior Design',
      location: 'Bengaluru, Karnataka',
    });
    expect(element.textContent).toContain('saved successfully');
    expect(api.updateProfile.mock.calls[0][0]).not.toHaveProperty('description');
    expect(api.updateProfile.mock.calls[0][0]).not.toHaveProperty('services');
  });

  it('disables saving and ignores duplicate submits while a save is pending', () => {
    const pendingSave = new Subject<BusinessProfile>();
    api.updateProfile.mockReturnValue(pendingSave);
    const element = fixture.nativeElement as HTMLElement;
    const form = element.querySelector<HTMLFormElement>('form')!;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(api.updateProfile).toHaveBeenCalledOnce();
    expect(element.querySelector<HTMLButtonElement>('.profile-button')?.disabled).toBe(true);
    pendingSave.next(profile);
    pendingSave.complete();
  });

  it('shows a safe save API error and retries the save', () => {
    api.updateProfile
      .mockReturnValueOnce(throwError(() => new HttpErrorResponse({
        status: 400,
        error: { message: 'Unsupported business profile field: description.' },
      })))
      .mockReturnValueOnce(of(profile));
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(element.textContent).toContain('could not be saved');
    expect(element.textContent).not.toContain('Unsupported business profile field');
    element.querySelector<HTMLButtonElement>('.profile-retry')!.click();
    fixture.detectChanges();

    expect(api.updateProfile).toHaveBeenCalledTimes(2);
    expect(element.textContent).toContain('saved successfully');
  });

  it('shows API errors when the profile cannot be loaded and retries', () => {
    api.getProfile.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 404, error: { message: 'Business not found.' } })),
    );
    fixture.destroy();
    fixture = TestBed.createComponent(BusinessProfilePage);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('business profile could not be found');
    expect(element.textContent).not.toContain('Business not found.');
    api.getProfile.mockReturnValue(of(profile));
    element.querySelector<HTMLButtonElement>('.profile-button--secondary')!.click();
    fixture.detectChanges();
    expect(element.querySelector('form')).not.toBeNull();
  });
});
