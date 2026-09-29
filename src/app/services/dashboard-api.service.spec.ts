import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BIZPILOT_BUSINESS_ID, DashboardApiService } from './dashboard-api.service';
import { DashboardResponse } from './dashboard-api.types';

describe('DashboardApiService', () => {
  let service: DashboardApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(DashboardApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('requests the dashboard for the selected business', () => {
    const response: DashboardResponse = {
      businessId: BIZPILOT_BUSINESS_ID,
      totalLeads: 2,
      newEnquiries: 1,
      contactedLeads: 0,
      convertedLeads: 1,
      recentEnquiries: [],
      leadPipeline: { NEW: 1, CONTACTED: 0, QUALIFIED: 0, CONVERTED: 1, LOST: 0 },
    };

    service.getDashboard(BIZPILOT_BUSINESS_ID).subscribe((dashboard) => {
      expect(dashboard).toEqual(response);
    });

    const request = httpMock.expectOne(
      (req) =>
        req.method === 'GET' &&
        req.url === '/api/dashboard' &&
        req.params.get('businessId') === BIZPILOT_BUSINESS_ID,
    );
    request.flush(response);
  });
});
