import { Component } from '@angular/core';
import { Brand } from '../brand/brand';
import { BUSINESS_PROFILE } from '../../site-profile';

@Component({
  selector: 'app-footer',
  imports: [Brand],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly year = new Date().getFullYear();
  protected readonly business = BUSINESS_PROFILE;
}
