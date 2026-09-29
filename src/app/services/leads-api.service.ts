import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BIZPILOT_BUSINESS_ID } from './dashboard-api.service';
import { CreateLeadRequest, LeadFilters, LeadRecord, UpdateLeadRequest } from './leads-api.types';

@Injectable({ providedIn: 'root' })
export class LeadsApiService {
  private readonly http = inject(HttpClient);

  getLeads(filters: Omit<LeadFilters, 'businessId'> = {}): Observable<LeadRecord[]> {
    let params = new HttpParams().set('businessId', BIZPILOT_BUSINESS_ID);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.source) params = params.set('source', filters.source);
    if (filters.search?.trim()) params = params.set('search', filters.search.trim());
    return this.http.get<LeadRecord[]>('/api/leads', { params });
  }

  createLead(lead: Omit<CreateLeadRequest, 'businessId'>): Observable<LeadRecord> {
    return this.http.post<LeadRecord>('/api/leads', {
      ...lead,
      businessId: BIZPILOT_BUSINESS_ID,
    });
  }

  updateLead(id: string, changes: Omit<UpdateLeadRequest, 'businessId'>): Observable<LeadRecord> {
    return this.http.patch<LeadRecord>(`/api/leads/${encodeURIComponent(id)}`, {
      ...changes,
      businessId: BIZPILOT_BUSINESS_ID,
    });
  }
}
