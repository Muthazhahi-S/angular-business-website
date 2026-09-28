import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
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

    this.submissionStatus.set('Opening your email app with your enquiry. If it does not open, email hello@northstar.studio.');
    window.location.href = `mailto:hello@northstar.studio?subject=Website%20enquiry&body=${encodeURIComponent(message)}`;
  }
}
