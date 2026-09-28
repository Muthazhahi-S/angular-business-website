import { Component, inject } from '@angular/core';
import { BUSINESS_PROFILE } from '../../site-profile';

@Component({
  selector: 'app-brand',
  imports: [],
  templateUrl: './brand.html',
  styleUrl: './brand.scss',
})
export class Brand {
  protected readonly business = inject(BUSINESS_PROFILE);
}
