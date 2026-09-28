import { Component, inject } from '@angular/core';
import { BUSINESS_PROFILE } from '../../site-profile';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  protected readonly business = inject(BUSINESS_PROFILE);
}
