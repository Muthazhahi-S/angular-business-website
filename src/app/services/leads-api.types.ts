import { LeadSource, LeadStatus } from './dashboard-api.types';

export interface LeadCustomer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface LeadRecord {
  id: string;
  businessId: string;
  customerId: string;
  service: string;
  source: LeadSource;
  status: LeadStatus;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  customer: LeadCustomer | null;
}

export interface LeadFilters {
  businessId: string;
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
}

export interface CreateLeadRequest {
  businessId: string;
  customerId: string;
  service: string;
  source: LeadSource;
  status: LeadStatus;
  message: string | null;
}

export interface UpdateLeadRequest {
  businessId: string;
  status?: LeadStatus;
  customerId?: string;
  service?: string;
  source?: LeadSource;
  message?: string | null;
}
