import { Component, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';
import { AppPage } from '../../app.types';

interface NavigationItem {
  label: AppPage;
  icon: string;
  badge?: string;
}

interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly activePage = input.required<AppPage>();
  readonly mobileMenuOpen = input(false);
  readonly navigate = output<AppPage>();
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  protected readonly businessMenuOpen = signal(false);

  protected readonly sections: NavigationSection[] = [
    {
      label: 'Overview',
      items: [{ label: 'Dashboard', icon: 'M3 3h8v8H3z M13 3h8v5h-8z M13 10h8v11h-8z M3 13h8v8H3z' }],
    },
    {
      label: 'Workspace',
      items: [
        { label: 'Leads', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
        { label: 'Customer Enquiries', icon: 'M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z M8 10h8 M8 14h5', badge: '8' },
        { label: 'AI Assistant', icon: 'M12 3v3 M18.4 5.6l-2.1 2.1 M21 12h-3 M5.6 18.4l2.1-2.1 M12 21v-3 M3 12h3 M5.6 5.6l2.1 2.1 M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6' },
      ],
    },
    {
      label: 'Manage',
      items: [
        { label: 'Business Profile', icon: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-4 M9 9v.01 M9 12v.01 M9 15v.01 M9 18v.01 M15 13v.01 M15 16v.01 M15 19v.01' },
        { label: 'Settings', icon: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 2.94-.08-.02a1.7 1.7 0 0 0-1.77.54l-.05.07h-3.4l-.04-.08a1.7 1.7 0 0 0-1.55-1.02 1.7 1.7 0 0 0-.81.21l-.08.04-2.94-1.7.02-.08A1.7 1.7 0 0 0 6.86 16l-.07-.05v-3.4l.08-.04a1.7 1.7 0 0 0 .81-2.36l-.04-.08 1.7-2.94.08.02a1.7 1.7 0 0 0 2.36-.81l.04-.08h3.4l.05.08a1.7 1.7 0 0 0 2.36.81l.08-.04 2.94 1.7-.02.08A1.7 1.7 0 0 0 21 11.25l.08.04v3.4z' },
      ],
    },
  ];

  protected selectPage(page: AppPage): void {
    this.navigate.emit(page);
  }

  protected toggleBusinessMenu(): void {
    this.businessMenuOpen.update((isOpen) => !isOpen);
  }

  protected openBusinessProfile(): void {
    this.businessMenuOpen.set(false);
    this.selectPage('Business Profile');
  }

  protected openCurrentBusiness(): void {
    this.businessMenuOpen.set(false);
    this.selectPage('Dashboard');
  }

  @HostListener('document:click', ['$event'])
  protected closeBusinessMenuOnOutsideClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.businessMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected closeBusinessMenuOnEscape(): void {
    this.businessMenuOpen.set(false);
  }
}
