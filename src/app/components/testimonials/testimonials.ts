import { Component, inject } from '@angular/core';
import { BUSINESS_PROFILE } from '../../site-profile';

@Component({
  selector: 'app-testimonials',
  imports: [],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
})
export class Testimonials {
  protected readonly business = inject(BUSINESS_PROFILE);
  protected readonly outcomes = this.business.process.steps.map((step, index) => ({
    ...step,
    number: String(index + 1).padStart(2, '0'),
  }));
}
