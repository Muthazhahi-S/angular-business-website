import { Injectable, inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const ONBOARDING_SESSION_KEY = 'bizpilot-demo-onboarding-completed';

@Injectable({ providedIn: 'root' })
export class BusinessOnboardingSessionService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private completedInMemory = false;

  hasCompleted(): boolean {
    if (!this.browser) return this.completedInMemory;
    try {
      return window.sessionStorage.getItem(ONBOARDING_SESSION_KEY) === 'true';
    } catch {
      return this.completedInMemory;
    }
  }

  markCompleted(): void {
    this.completedInMemory = true;
    if (!this.browser) return;
    try {
      window.sessionStorage.setItem(ONBOARDING_SESSION_KEY, 'true');
    } catch {
      this.completedInMemory = true;
    }
  }
}
