import { Component, inject } from '@angular/core';
import { BUSINESS_PROFILE } from '../../site-profile';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  protected readonly business = inject(BUSINESS_PROFILE);
}
