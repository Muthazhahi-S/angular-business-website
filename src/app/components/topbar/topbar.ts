import { Component, input, output } from '@angular/core';
import { AppPage } from '../../app.types';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  readonly page = input.required<AppPage>();
  readonly searchTerm = input('');
  readonly searchChange = output<string>();
  readonly menuToggle = output<void>();

  protected updateSearch(event: Event): void {
    this.searchChange.emit((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.searchChange.emit('');
  }
}
