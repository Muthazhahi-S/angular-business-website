import { Component, inject, signal } from '@angular/core';
import { BUSINESS_PROFILE } from '../../site-profile';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  protected readonly business = inject(BUSINESS_PROFILE);
  protected readonly submissionStatus = signal('');

  protected submitContact(event: Event, form: HTMLFormElement): void {
    event.preventDefault();

    const fields = new FormData(form);
    const message = [
      `Name: ${fields.get('name')}`,
      `Email: ${fields.get('email')}`,
      `Area of interest: ${fields.get('interest')}`,
      `Project details: ${fields.get('details')}`,
    ].join('\n\n');

    this.submissionStatus.set(`Opening your email app with your enquiry. If it does not open, email ${this.business.email}.`);
    window.location.href = `mailto:${this.business.email}?subject=Website%20enquiry&body=${encodeURIComponent(message)}`;
  }
}
