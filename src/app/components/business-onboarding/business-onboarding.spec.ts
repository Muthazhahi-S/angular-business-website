import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { BusinessProfileApiService } from '../../services/business-profile-api.service';
import { BusinessProfile } from '../../services/business-profile-api.types';
import { BusinessOnboarding } from './business-onboarding';

describe('BusinessOnboarding', () => {
  let fixture: ComponentFixture<BusinessOnboarding>;
  const api = { updateProfile: vi.fn() };
  const profile: BusinessProfile = {
    id: 'bizpilot-demo-urbannest',
    name: 'UrbanNest Interiors',
    email: 'hello@urbannest.in',
    phone: null,
    industry: 'Interior Design',
    location: null,
    createdAt: '2026-09-29T10:00:00.000Z',
    updatedAt: '2026-09-29T10:00:00.000Z',
  };

  beforeEach(async () => {
    api.updateProfile.mockReset().mockReturnValue(of(profile));
    await TestBed.configureTestingModule({
      imports: [BusinessOnboarding],
      providers: [{ provide: BusinessProfileApiService, useValue: api }],
    }).compileComponents();
    fixture = TestBed.createComponent(BusinessOnboarding);
    fixture.detectChanges();
  });

  function setField(field: string, value: string): void {
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector<HTMLInputElement>(`[formControlName="${field}"]`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function submit(): void {
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
  }

  it('renders the onboarding explanation and validates required fields', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Set up your business');
    expect(element.textContent).toContain(
      'Tell BizPilot about your business so your workspace can use your business information.',
    );
    expect(element.querySelector<HTMLButtonElement>('.onboarding-submit')?.disabled).toBe(true);

    submit();

    expect(element.textContent).toContain('Business name is required.');
    expect(element.textContent).toContain('Industry is required.');
    expect(element.textContent).toContain('Email is required.');
    expect(api.updateProfile).not.toHaveBeenCalled();
  });

  it('validates email and optional phone only when provided', () => {
    setField('name', 'UrbanNest');
    setField('industry', 'Interior Design');
    setField('email', 'invalid-email');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Enter a valid email address.',
    );
    expect((fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.onboarding-submit')?.disabled)
      .toBe(true);

    setField('email', 'hello@urbannest.in');
    setField('phone', 'letters');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Enter a phone number with 7 to 15 digits',
    );

    setField('phone', '');
    expect((fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.onboarding-submit')?.disabled)
      .toBe(false);
  });

  it('updates the existing demo profile and displays success', () => {
    const completed = vi.fn();
    fixture.componentInstance.completed.subscribe(completed);
    setField('name', 'UrbanNest Interiors');
    setField('industry', 'Interior Design');
    setField('email', 'hello@urbannest.in');
    setField('phone', '+91 98765 43210');
    setField('location', 'Bengaluru');
    submit();

    expect(api.updateProfile).toHaveBeenCalledWith({
      name: 'UrbanNest Interiors',
      industry: 'Interior Design',
      email: 'hello@urbannest.in',
      phone: '+91 98765 43210',
      location: 'Bengaluru',
    });
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Your business workspace is ready.',
    );
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Go to Dashboard');
    expect(completed).toHaveBeenCalledOnce();
  });

  it('shows a safe API error and retries with existing form data', () => {
    api.updateProfile
      .mockReturnValueOnce(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 400,
              error: { message: 'Raw technical server details should stay hidden.' },
            }),
        ),
      )
      .mockReturnValueOnce(of(profile));
    setField('name', 'UrbanNest');
    setField('industry', 'Interior Design');
    setField('email', 'hello@urbannest.in');
    submit();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('could not be saved');
    expect(element.textContent).not.toContain('Raw technical server details');
    element.querySelector<HTMLButtonElement>('.onboarding-error button')!.click();
    fixture.detectChanges();

    expect(api.updateProfile).toHaveBeenCalledTimes(2);
    expect(element.textContent).toContain('Your business workspace is ready.');
  });

  it('shows a saving state and prevents repeated submission', () => {
    const pending = new Subject<BusinessProfile>();
    api.updateProfile.mockReturnValue(pending);
    setField('name', 'UrbanNest');
    setField('industry', 'Interior Design');
    setField('email', 'hello@urbannest.in');
    submit();
    submit();

    expect(api.updateProfile).toHaveBeenCalledOnce();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Saving workspace…');
    pending.next(profile);
    pending.complete();
  });

  it('emits skip and dashboard actions without submitting additional profile changes', () => {
    const skip = vi.fn();
    const goToDashboard = vi.fn();
    fixture.componentInstance.skip.subscribe(skip);
    fixture.componentInstance.goToDashboard.subscribe(goToDashboard);
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector<HTMLButtonElement>('.onboarding-skip')!.click();
    expect(skip).toHaveBeenCalledOnce();
    expect(api.updateProfile).not.toHaveBeenCalled();

    setField('name', 'UrbanNest');
    setField('industry', 'Interior Design');
    setField('email', 'hello@urbannest.in');
    api.updateProfile.mockReturnValue(of(profile));
    submit();
    element.querySelector<HTMLButtonElement>('.onboarding-success .onboarding-submit')!.click();
    expect(goToDashboard).toHaveBeenCalledOnce();
  });
});
