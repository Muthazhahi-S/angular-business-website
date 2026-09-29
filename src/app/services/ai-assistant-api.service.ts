import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BIZPILOT_BUSINESS_ID } from './dashboard-api.service';
import { AssistantChatRequest, AssistantChatResponse } from './ai-assistant-api.types';

@Injectable({ providedIn: 'root' })
export class AiAssistantApiService {
  private readonly http = inject(HttpClient);

  sendMessage(message: string): Observable<AssistantChatResponse> {
    const request: AssistantChatRequest = {
      businessId: BIZPILOT_BUSINESS_ID,
      message,
    };
    return this.http.post<AssistantChatResponse>('/api/ai-assistant/chat', request);
  }
}
