import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BusinessProfileApiService } from '../../services/business-profile-api.service';
import { BusinessProfile } from '../../services/business-profile-api.types';

@Component({
  selector: 'app-business-profile-page',
  imports: [ReactiveFormsModule],
  templateUrl: './business-profile-page.html',
  styleUrl: './business-profile-page.scss',
})
export class BusinessProfilePage {
  private readonly profileApi = inject(BusinessProfileApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly saveError = signal<string | null>(null);
  protected readonly saved = signal(false);

  protected readonly profileForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(120)]],
    email: ['', [Validators.email, Validators.maxLength(254)]],
    phone: ['', [Validators.maxLength(40), Validators.pattern(/^\+?[\d\s().-]*$/), Validators.pattern(/(?:\D*\d){7,15}\D*|^$/)]],
    industry: ['', Validators.maxLength(120)],
    location: ['', Validators.maxLength(200)],
  });

  constructor() {
    this.loadProfile();
  }

  protected loadProfile(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.profileApi
      .getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          this.setFormValues(profile);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.loadError.set(this.getErrorMessage(error, 'load'));
          this.loading.set(false);
        },
      });
  }

  protected saveProfile(): void {
    if (this.saving()) return;
    this.saved.set(false);
    this.saveError.set(null);
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const values = this.profileForm.getRawValue();
    this.saving.set(true);
    this.profileApi
      .updateProfile({
        name: values.name.trim(),
        ...(values.email.trim() ? { email: values.email.trim() } : {}),
        phone: values.phone.trim() || null,
        industry: values.industry.trim() || null,
        location: values.location.trim() || null,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          this.setFormValues(profile);
          this.saved.set(true);
          this.saving.set(false);
        },
        error: (error: unknown) => {
          this.saveError.set(this.getErrorMessage(error, 'save'));
          this.saving.set(false);
        },
      });
  }

  protected hasError(field: 'name' | 'email' | 'phone' | 'industry' | 'location'): boolean {
    const control = this.profileForm.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  protected get canSave(): boolean {
    return this.profileForm.valid && !this.saving();
  }

  protected errorFor(
    field: 'name' | 'email' | 'phone' | 'industry' | 'location',
  ): string {
    const control = this.profileForm.controls[field];
    if (control.hasError('required')) return `${this.labelFor(field)} is required.`;
    if (field === 'name' && control.hasError('pattern')) return 'Business name cannot be blank.';
    if (control.hasError('email')) return 'Enter a valid email address.';
    if (field === 'phone' && control.hasError('pattern')) {
      return 'Enter a phone number with 7 to 15 digits and standard phone characters.';
    }
    if (control.hasError('maxlength')) return `${this.labelFor(field)} is too long.`;
    return 'Check this field.';
  }

  private setFormValues(profile: BusinessProfile): void {
    this.profileForm.reset({
      name: profile.name,
      email: profile.email,
      phone: profile.phone ?? '',
      industry: profile.industry ?? '',
      location: profile.location ?? '',
    });
  }

  private labelFor(field: string): string {
    return field.charAt(0).toUpperCase() + field.slice(1);
  }

  private getErrorMessage(error: unknown, operation: 'load' | 'save'): string {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      return 'The business profile could not be found. Please try again or contact support.';
    }
    if (error instanceof HttpErrorResponse && error.status === 503) {
      return 'The profile service is temporarily unavailable. Please try again shortly.';
    }
    return `The business profile could not be ${operation === 'load' ? 'loaded' : 'saved'}. Please try again.`;
  }
}
