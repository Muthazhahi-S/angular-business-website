import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AiAssistantApiService } from '../../services/ai-assistant-api.service';
import { LeadsApiService } from '../../services/leads-api.service';
import {
  createFollowUpMessage,
  createWhatsAppUrl,
  getFollowUpCandidates,
  LeadFollowUpCandidate,
  normalizeWhatsAppPhone,
} from '../../services/lead-follow-up.utils';
import {
  AssistantChatResponse,
  AssistantEnquiry,
  AssistantRelevantData,
} from '../../services/ai-assistant-api.types';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  data?: AssistantRelevantData;
}

export {
  createFollowUpMessage,
  createWhatsAppUrl,
  getFollowUpCandidates,
  normalizeWhatsAppPhone,
} from '../../services/lead-follow-up.utils';

const SUGGESTED_QUESTIONS = [
  'How many leads do I have?',
  'How many new enquiries?',
  'Show my recent enquiries',
];

@Component({
  selector: 'app-ai-assistant-page',
  imports: [DatePipe],
  templateUrl: './ai-assistant-page.html',
  styleUrl: './ai-assistant-page.scss',
})
export class AiAssistantPage {
  private readonly assistantApi = inject(AiAssistantApiService);
  private readonly leadsApi = inject(LeadsApiService);
  private readonly destroyRef = inject(DestroyRef);
  private nextMessageId = 0;
  private readonly messageInput = viewChild<ElementRef<HTMLTextAreaElement>>('messageInput');

  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly draft = signal('');
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly failedMessage = signal<string | null>(null);
  protected readonly suggestions = SUGGESTED_QUESTIONS;
  protected readonly followUpCandidates = signal<LeadFollowUpCandidate[]>([]);
  protected readonly followUpLoading = signal(false);
  protected readonly followUpLoaded = signal(false);
  protected readonly followUpError = signal<string | null>(null);
  protected readonly followUpDraftLeadId = signal<string | null>(null);
  protected readonly followUpDraft = signal('');
  protected readonly followUpCopied = signal(false);
  protected readonly followUpCopyError = signal<string | null>(null);

  protected updateDraft(event: Event): void {
    this.draft.set((event.target as HTMLTextAreaElement).value);
  }

  protected submitMessage(event: SubmitEvent): void {
    event.preventDefault();
    this.sendMessage(this.draft());
  }

  protected sendOnEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.shiftKey) return;
    event.preventDefault();
    this.sendMessage(this.draft());
  }

  protected askSuggestion(question: string): void {
    this.sendMessage(question);
  }

  protected retry(): void {
    const message = this.failedMessage();
    if (message) this.sendMessage(message, true);
  }

  protected trackMessage(_index: number, message: ChatMessage): number {
    return message.id;
  }

  protected recentEnquiries(data: AssistantRelevantData | undefined): AssistantEnquiry[] {
    return data?.type === 'recent-enquiries' ? data.enquiries : [];
  }

  protected findLeadsToFollowUp(): void {
    if (this.followUpLoading()) return;
    this.followUpLoading.set(true);
    this.followUpLoaded.set(false);
    this.followUpError.set(null);
    this.followUpCandidates.set([]);
    this.cancelFollowUpDraft();

    this.leadsApi
      .getLeads()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (leads) => {
          this.followUpCandidates.set(getFollowUpCandidates(leads));
          this.followUpLoaded.set(true);
          this.followUpLoading.set(false);
        },
        error: () => {
          this.followUpError.set('Could not load leads for follow-up. Please try again.');
          this.followUpLoading.set(false);
        },
      });
  }

  protected draftFollowUpMessage(candidate: LeadFollowUpCandidate): void {
    this.followUpDraftLeadId.set(candidate.lead.id);
    this.followUpDraft.set(createFollowUpMessage(candidate.lead));
    this.followUpCopied.set(false);
    this.followUpCopyError.set(null);
  }

  protected updateFollowUpDraft(event: Event): void {
    this.followUpDraft.set((event.target as HTMLTextAreaElement).value);
    this.followUpCopied.set(false);
  }

  protected async copyFollowUpDraft(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.followUpDraft());
      this.followUpCopied.set(true);
      this.followUpCopyError.set(null);
    } catch {
      this.followUpCopyError.set('Could not copy the message. Please select and copy it manually.');
    }
  }

  protected whatsAppPhone(phone: string | null | undefined): string | null {
    return normalizeWhatsAppPhone(phone);
  }

  protected sendFollowUpViaWhatsApp(phone: string | null | undefined): void {
    const url = createWhatsAppUrl(phone, this.followUpDraft());
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  protected cancelFollowUpDraft(): void {
    this.followUpDraftLeadId.set(null);
    this.followUpDraft.set('');
    this.followUpCopied.set(false);
    this.followUpCopyError.set(null);
  }

  protected sendMessage(message: string, isRetry = false): void {
    const normalized = message.trim();
    if (!normalized || this.loading()) return;
    this.errorMessage.set(null);
    this.failedMessage.set(null);
    if (!isRetry) {
      this.messages.update((current) => [
        ...current,
        { id: this.nextMessageId++, role: 'user', content: normalized },
      ]);
    }
    this.draft.set('');
    this.loading.set(true);
    this.assistantApi
      .sendMessage(normalized)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: AssistantChatResponse) => {
          this.messages.update((current) => [
            ...current,
            {
              id: this.nextMessageId++,
              role: 'assistant',
              content: response.answer,
              data: response.data,
            },
          ]);
          this.loading.set(false);
          this.focusMessageInput();
        },
        error: (error: unknown) => {
          this.failedMessage.set(normalized);
          this.errorMessage.set(this.getErrorMessage(error));
          this.loading.set(false);
          this.focusMessageInput();
        },
      });
  }

  private focusMessageInput(): void {
    queueMicrotask(() => this.messageInput()?.nativeElement.focus());
  }

  private getErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Your message could not be sent. Please try again.';
    }
    if (error.status === 0) {
      return 'Could not connect to BizPilot. Check that the backend is running on port 3000.';
    }
    if (error.status === 429) {
      return 'The AI assistant has reached its current usage limit. Please try again later.';
    }
    if (error.status === 400) return 'Enter a valid question and try again.';
    if (error.status === 404) return 'The business profile was not found.';
    if (error.status === 503) {
      return 'Business data is temporarily unavailable. Please try again shortly.';
    }
    return 'Your message could not be sent. Please try again.';
  }
}
