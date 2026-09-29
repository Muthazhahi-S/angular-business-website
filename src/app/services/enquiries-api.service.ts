import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BIZPILOT_BUSINESS_ID } from './dashboard-api.service';
import {
  CreateEnquiryRequest,
  EnquiryFilters,
  EnquiryRecord,
  UpdateEnquiryRequest,
} from './enquiries-api.types';

@Injectable({ providedIn: 'root' })
export class EnquiriesApiService {
  private readonly http = inject(HttpClient);

  getEnquiries(filters: EnquiryFilters = {}): Observable<EnquiryRecord[]> {
    let params = new HttpParams().set('businessId', BIZPILOT_BUSINESS_ID);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.source) params = params.set('source', filters.source);
    if (filters.search?.trim()) params = params.set('search', filters.search.trim());
    return this.http.get<EnquiryRecord[]>('/api/enquiries', { params });
  }

  createEnquiry(enquiry: CreateEnquiryRequest): Observable<EnquiryRecord> {
    return this.http.post<EnquiryRecord>('/api/enquiries', {
      ...enquiry,
      businessId: BIZPILOT_BUSINESS_ID,
    });
  }

  updateEnquiry(
    id: string,
    changes: UpdateEnquiryRequest,
  ): Observable<EnquiryRecord> {
    return this.http.patch<EnquiryRecord>(`/api/enquiries/${encodeURIComponent(id)}`, {
      ...changes,
      businessId: BIZPILOT_BUSINESS_ID,
    });
  }
}
