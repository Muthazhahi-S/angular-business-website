import { Component, input, output } from '@angular/core';
import { AppPage } from '../../app.types';
import { AiAssistantPage } from '../ai-assistant-page/ai-assistant-page';
import { BusinessProfilePage } from '../business-profile-page/business-profile-page';
import { EnquiriesPage } from '../enquiries-page/enquiries-page';
import { LeadsPage } from '../leads-page/leads-page';

@Component({
  selector: 'app-workspace-page',
  imports: [LeadsPage, EnquiriesPage, BusinessProfilePage, AiAssistantPage],
  templateUrl: './workspace-page.html',
  styleUrl: './workspace-page.scss',
})
export class WorkspacePage {
  readonly page = input.required<AppPage>();
  readonly searchTerm = input('');
  readonly selectedLeadId = input<string | null>(null);
  readonly createDialogRequest = input<{
    page: 'Leads' | 'Customer Enquiries';
    id: number;
  } | null>(null);
  readonly leadSelectionHandled = output<void>();
  readonly createDialogRequestHandled = output<void>();

}
