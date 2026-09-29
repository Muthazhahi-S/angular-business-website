import { Component, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { AppPage, DashboardQuickAction } from './app.types';
import { BusinessOnboarding } from './components/business-onboarding/business-onboarding';
import { Dashboard } from './components/dashboard/dashboard';
import { Sidebar } from './components/sidebar/sidebar';
import { Topbar } from './components/topbar/topbar';
import { WorkspacePage } from './components/workspace-page/workspace-page';
import { BusinessOnboardingSessionService } from './services/business-onboarding-session.service';

@Component({
  selector: 'app-root',
  imports: [BusinessOnboarding, Sidebar, Topbar, Dashboard, WorkspacePage],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly onboardingSession = inject(BusinessOnboardingSessionService);

  protected readonly showOnboarding = signal(!this.onboardingSession.hasCompleted());
  protected readonly activePage = signal<AppPage>('Dashboard');
  protected readonly searchTerm = signal('');
  protected readonly mobileMenuOpen = signal(false);
  protected readonly selectedLeadId = signal<string | null>(null);
  protected readonly createDialogRequest = signal<{
    page: 'Leads' | 'Customer Enquiries';
    id: number;
  } | null>(null);
  private createDialogRequestId = 0;

  constructor(title: Title, meta: Meta) {
    title.setTitle('BizPilot AI | Lead management');
    meta.updateTag({
      name: 'description',
      content: 'Manage customer enquiries, leads, and follow-ups with BizPilot AI.',
    });
  }

  protected navigate(page: AppPage): void {
    this.activePage.set(page);
    this.mobileMenuOpen.set(false);
    this.searchTerm.set('');
  }

  protected openLeadFromDashboard(leadId: string): void {
    this.selectedLeadId.set(leadId);
    this.navigate('Leads');
  }

  protected handleDashboardQuickAction(action: DashboardQuickAction): void {
    this.selectedLeadId.set(null);
    switch (action) {
      case 'addLead':
        this.createDialogRequest.set({ page: 'Leads', id: ++this.createDialogRequestId });
        this.navigate('Leads');
        break;
      case 'addEnquiry':
        this.createDialogRequest.set({
          page: 'Customer Enquiries',
          id: ++this.createDialogRequestId,
        });
        this.navigate('Customer Enquiries');
        break;
      case 'viewLeads':
        this.createDialogRequest.set(null);
        this.navigate('Leads');
        break;
      case 'viewEnquiries':
        this.createDialogRequest.set(null);
        this.navigate('Customer Enquiries');
        break;
      case 'aiAssistant':
        this.createDialogRequest.set(null);
        this.navigate('AI Assistant');
        break;
    }
  }

  protected clearCreateDialogRequest(): void {
    this.createDialogRequest.set(null);
  }

  protected finishOnboarding(): void {
    this.markOnboardingCompleted();
    this.showOnboarding.set(false);
    this.navigate('Dashboard');
  }

  protected markOnboardingCompleted(): void {
    this.onboardingSession.markCompleted();
  }
}
