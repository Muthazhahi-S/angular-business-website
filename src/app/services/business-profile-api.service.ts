import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BIZPILOT_BUSINESS_ID } from './dashboard-api.service';
import {
  BusinessProfile,
  UpdateBusinessProfileRequest,
} from './business-profile-api.types';

@Injectable({ providedIn: 'root' })
export class BusinessProfileApiService {
  private readonly http = inject(HttpClient);
  private readonly profileUrl = `/api/businesses/${encodeURIComponent(BIZPILOT_BUSINESS_ID)}`;

  getProfile(): Observable<BusinessProfile> {
    return this.http.get<BusinessProfile>(this.profileUrl);
  }

  updateProfile(changes: UpdateBusinessProfileRequest): Observable<BusinessProfile> {
    return this.http.patch<BusinessProfile>(this.profileUrl, changes);
  }
}
