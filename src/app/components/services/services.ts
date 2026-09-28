import { Component, inject } from '@angular/core';
import { BUSINESS_PROFILE } from '../../site-profile';

@Component({
  selector: 'app-services',
  imports: [],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services {
  protected readonly business = inject(BUSINESS_PROFILE);
  protected readonly services = this.business.services.items.map((service, index) => ({
    ...service,
    number: String(index + 1).padStart(2, '0'),
  }));
}
