import { Component, inject } from '@angular/core';
import { BUSINESS_PROFILE } from '../../site-profile';

@Component({
  selector: 'app-packages',
  imports: [],
  templateUrl: './packages.html',
  styleUrl: './packages.scss',
})
export class Packages {
  protected readonly business = inject(BUSINESS_PROFILE);
  protected readonly packages = this.business.packages;
}
