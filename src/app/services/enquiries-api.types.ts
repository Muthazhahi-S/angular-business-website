import { EnquiryStatus, LeadSource } from './dashboard-api.types';
import { LeadCustomer } from './leads-api.types';

export interface EnquiryRecord {
  id: string;
  businessId: string;
  customerId: string;
  service?: string | null;
  message: string;
  source: LeadSource;
  status: EnquiryStatus;
  createdAt: string;
  updatedAt: string;
  customer: LeadCustomer;
}

export interface EnquiryFilters {
  status?: EnquiryStatus;
  source?: LeadSource;
  search?: string;
}

export interface CreateEnquiryRequest {
  customerId: string;
  message: string;
  source: LeadSource;
  status?: EnquiryStatus;
}

export interface UpdateEnquiryRequest {
  customerId?: string;
  message?: string;
  source?: LeadSource;
  status?: EnquiryStatus;
}
