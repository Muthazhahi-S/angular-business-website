import { Component } from '@angular/core';
import { Brand } from '../brand/brand';

@Component({
  selector: 'app-footer',
  imports: [Brand],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly year = new Date().getFullYear();
}
