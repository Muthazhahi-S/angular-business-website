import { Component, inject, signal } from '@angular/core';
import { Brand } from '../brand/brand';
import { BUSINESS_PROFILE } from '../../site-profile';

@Component({
  selector: 'app-navbar',
  imports: [Brand],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  protected readonly business = inject(BUSINESS_PROFILE);
  protected readonly menuOpen = signal(false);

  protected toggleMenu(): void {
    this.menuOpen.update((isOpen) => !isOpen);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
