import { Component, signal } from '@angular/core';
import { Brand } from '../brand/brand';

@Component({
  selector: 'app-navbar',
  imports: [Brand],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  protected readonly menuOpen = signal(false);

  protected toggleMenu(): void {
    this.menuOpen.update((isOpen) => !isOpen);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
