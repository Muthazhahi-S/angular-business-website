export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';

export type EnquiryStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type LeadSource =
  'WEBSITE' | 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'REFERRAL' | 'PHONE' | 'EMAIL' | 'OTHER';

export interface RecentEnquiry {
  id: string;
  message: string;
  source: LeadSource;
  status: EnquiryStatus;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string | null;
  };
}

export type LeadPipelineCounts = Record<LeadStatus, number>;

export interface DashboardResponse {
  businessId: string;
  totalLeads: number;
  newEnquiries: number;
  contactedLeads: number;
  convertedLeads: number;
  recentEnquiries: RecentEnquiry[];
  leadPipeline: LeadPipelineCounts;
}
