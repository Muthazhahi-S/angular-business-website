import { Component, inject } from '@angular/core';
import { BUSINESS_PROFILE } from '../../site-profile';

@Component({
  selector: 'app-why-us',
  imports: [],
  templateUrl: './why-us.html',
  styleUrl: './why-us.scss',
})
export class WhyUs {
  protected readonly business = inject(BUSINESS_PROFILE);
  protected readonly principles = this.business.why.principles.map((principle, index) => ({
    ...principle,
    number: String(index + 1).padStart(2, '0'),
  }));
}
