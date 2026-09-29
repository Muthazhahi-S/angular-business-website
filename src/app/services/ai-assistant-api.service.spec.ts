import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BIZPILOT_BUSINESS_ID } from './dashboard-api.service';
import { AiAssistantApiService } from './ai-assistant-api.service';

describe('AiAssistantApiService', () => {
  let service: AiAssistantApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AiAssistantApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('posts a question with the demo business id', () => {
    service.sendMessage('How many leads do I have?').subscribe((response) => {
      expect(response.answer).toBe('You have 5 leads in total.');
    });
    const request = httpMock.expectOne('/api/ai-assistant/chat');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      businessId: BIZPILOT_BUSINESS_ID,
      message: 'How many leads do I have?',
    });
    request.flush({ answer: 'You have 5 leads in total.' });
  });
});
