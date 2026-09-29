import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardResponse } from './dashboard-api.types';

export const BIZPILOT_BUSINESS_ID = 'bizpilot-demo-urbannest';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);

  getDashboard(businessId: string): Observable<DashboardResponse> {
    const params = new HttpParams().set('businessId', businessId);
    return this.http.get<DashboardResponse>('/api/dashboard', { params });
  }
}
