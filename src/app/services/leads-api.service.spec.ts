import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BIZPILOT_BUSINESS_ID } from './dashboard-api.service';
import { LeadsApiService } from './leads-api.service';
import { CreateLeadRequest, LeadRecord } from './leads-api.types';

describe('LeadsApiService', () => {
  let service: LeadsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(LeadsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads business-scoped leads with customer details', () => {
    const lead: LeadRecord = {
      id: 'lead-1',
      businessId: BIZPILOT_BUSINESS_ID,
      customerId: 'customer-1',
      service: 'Kitchen design',
      source: 'WEBSITE',
      status: 'NEW',
      message: null,
      createdAt: '2026-09-29T10:00:00.000Z',
      updatedAt: '2026-09-29T10:00:00.000Z',
      customer: { id: 'customer-1', name: 'Riya Shah', email: 'riya@example.com', phone: null },
    };

    service.getLeads({ status: 'NEW', source: 'WEBSITE', search: 'Riya' }).subscribe((leads) => {
      expect(leads).toEqual([lead]);
    });

    const request = httpMock.expectOne(
      (req) =>
        req.method === 'GET' &&
        req.url === '/api/leads' &&
        req.params.get('businessId') === BIZPILOT_BUSINESS_ID &&
        req.params.get('status') === 'NEW' &&
        req.params.get('source') === 'WEBSITE' &&
        req.params.get('search') === 'Riya',
    );
    request.flush([lead]);
  });

  it('creates a lead in the demo business', () => {
    const body: Omit<CreateLeadRequest, 'businessId'> = {
      customerId: 'customer-1',
      service: 'Kitchen design',
      source: 'WEBSITE',
      status: 'NEW',
      message: null,
    };

    service.createLead(body).subscribe();

    const request = httpMock.expectOne('/api/leads');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ ...body, businessId: BIZPILOT_BUSINESS_ID });
    request.flush({ id: 'lead-1' });
  });

  it('updates a lead status scoped to the demo business', () => {
    service.updateLead('lead-1', { status: 'CONTACTED' }).subscribe();

    const request = httpMock.expectOne('/api/leads/lead-1');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      status: 'CONTACTED',
      businessId: BIZPILOT_BUSINESS_ID,
    });
    request.flush({ id: 'lead-1' });
  });
});
