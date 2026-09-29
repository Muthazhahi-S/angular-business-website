import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BIZPILOT_BUSINESS_ID } from './dashboard-api.service';
import { EnquiriesApiService } from './enquiries-api.service';
import { CreateEnquiryRequest, EnquiryRecord } from './enquiries-api.types';

describe('EnquiriesApiService', () => {
  let service: EnquiriesApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EnquiriesApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads business-scoped enquiries with filters', () => {
    service.getEnquiries({ status: 'NEW', source: 'WHATSAPP', search: 'Riya' }).subscribe();

    const request = httpMock.expectOne(
      (req) =>
        req.method === 'GET' &&
        req.url === '/api/enquiries' &&
        req.params.get('businessId') === BIZPILOT_BUSINESS_ID &&
        req.params.get('status') === 'NEW' &&
        req.params.get('source') === 'WHATSAPP' &&
        req.params.get('search') === 'Riya',
    );
    request.flush([]);
  });

  it('creates an enquiry in the demo business', () => {
    const enquiry: CreateEnquiryRequest = {
      customerId: 'customer-1',
      message: 'Interested in a consultation',
      source: 'WEBSITE',
      status: 'NEW',
    };
    service.createEnquiry(enquiry).subscribe();

    const request = httpMock.expectOne('/api/enquiries');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ ...enquiry, businessId: BIZPILOT_BUSINESS_ID });
    request.flush({ id: 'enquiry-1' });
  });

  it('updates an enquiry with business scoping', () => {
    service.updateEnquiry('enquiry-1', { status: 'RESOLVED' }).subscribe();

    const request = httpMock.expectOne('/api/enquiries/enquiry-1');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      status: 'RESOLVED',
      businessId: BIZPILOT_BUSINESS_ID,
    });
    request.flush({ id: 'enquiry-1' });
  });
});
