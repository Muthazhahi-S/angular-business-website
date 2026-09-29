import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BusinessProfileApiService } from '../../services/business-profile-api.service';
import { BusinessProfile } from '../../services/business-profile-api.types';

@Component({
  selector: 'app-business-onboarding',
  imports: [ReactiveFormsModule],
  templateUrl: './business-onboarding.html',
  styleUrl: './business-onboarding.scss',
})
export class BusinessOnboarding {
  readonly skip = output<void>();
  readonly completed = output<void>();
  readonly goToDashboard = output<void>();

  private readonly profileApi = inject(BusinessProfileApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly succeeded = signal(false);
  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(120)]],
    industry: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    phone: [
      '',
      [
        Validators.maxLength(40),
        Validators.pattern(/^\+?[\d\s().-]*$/),
        Validators.pattern(/(?:\D*\d){7,15}\D*|^$/),
      ],
    ],
    location: ['', Validators.maxLength(200)],
  });

  protected hasError(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  protected errorFor(field: keyof typeof this.form.controls): string {
    const control = this.form.controls[field];
    if (control.hasError('required')) return `${this.labelFor(field)} is required.`;
    if (field === 'name' && control.hasError('pattern')) return 'Business name cannot be blank.';
    if (field === 'industry' && control.hasError('pattern')) return 'Industry cannot be blank.';
    if (control.hasError('email')) return 'Enter a valid email address.';
    if (field === 'phone' && control.hasError('pattern')) {
      return 'Enter a phone number with 7 to 15 digits and standard phone characters.';
    }
    if (control.hasError('maxlength')) return `${this.labelFor(field)} is too long.`;
    return 'Check this field.';
  }

  protected get canSubmit(): boolean {
    return this.form.valid && !this.saving();
  }

  protected submit(): void {
    if (this.saving()) return;
    this.saveError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    this.saving.set(true);
    this.profileApi
      .updateProfile({
        name: values.name.trim(),
        industry: values.industry.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || null,
        location: values.location.trim() || null,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (_profile: BusinessProfile) => {
          this.succeeded.set(true);
          this.saving.set(false);
          this.completed.emit();
        },
        error: (error: unknown) => {
          this.saveError.set(this.getErrorMessage(error));
          this.saving.set(false);
        },
      });
  }

  private labelFor(field: string): string {
    if (field === 'name') return 'Business name';
    return field.charAt(0).toUpperCase() + field.slice(1);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      return 'The demo business profile could not be found. Please try again or contact support.';
    }
    if (error instanceof HttpErrorResponse && error.status === 503) {
      return 'The profile service is temporarily unavailable. Please try again shortly.';
    }
    return 'Your business information could not be saved. Please try again.';
  }
}
