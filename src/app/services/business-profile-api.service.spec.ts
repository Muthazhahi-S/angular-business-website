import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BIZPILOT_BUSINESS_ID } from './dashboard-api.service';
import { BusinessProfileApiService } from './business-profile-api.service';
import { BusinessProfile } from './business-profile-api.types';

describe('BusinessProfileApiService', () => {
  let service: BusinessProfileApiService;
  let httpMock: HttpTestingController;
  const profile: BusinessProfile = {
    id: BIZPILOT_BUSINESS_ID,
    name: 'UrbanNest Interiors',
    email: 'ananya@urbannest.in',
    phone: '+910000000000',
    industry: 'Interior Design',
    location: 'Bengaluru',
    createdAt: '2026-09-29T10:00:00.000Z',
    updatedAt: '2026-09-29T10:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BusinessProfileApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the existing BizPilot business profile', () => {
    service.getProfile().subscribe((result) => expect(result).toEqual(profile));
    const request = httpMock.expectOne(`/api/businesses/${BIZPILOT_BUSINESS_ID}`);
    expect(request.request.method).toBe('GET');
    request.flush(profile);
  });

  it('patches editable fields on the existing business profile', () => {
    const changes = { name: 'UrbanNest Studio', location: 'Bengaluru, Karnataka' };
    service.updateProfile(changes).subscribe();
    const request = httpMock.expectOne(`/api/businesses/${BIZPILOT_BUSINESS_ID}`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(changes);
    request.flush({ ...profile, ...changes });
  });
});
