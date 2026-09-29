export interface AssistantChatRequest {
  businessId: string;
  message: string;
}

export interface AssistantBusinessProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  industry: string | null;
  location: string | null;
}

export interface AssistantEnquiry {
  id: string;
  message: string;
  source: string;
  status: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string | null;
  };
}

export interface AssistantLeadStatusCounts {
  NEW: number;
  CONTACTED: number;
  QUALIFIED: number;
  CONVERTED: number;
  LOST: number;
}

export interface AssistantEnquiryStatusCounts {
  NEW: number;
  IN_PROGRESS: number;
  RESOLVED: number;
  CLOSED: number;
}

export type AssistantRelevantData =
  | { type: 'business'; business: AssistantBusinessProfile }
  | { type: 'lead-count'; total: number; leadStatusCounts: AssistantLeadStatusCounts }
  | {
      type: 'enquiry-count';
      newEnquiries: number;
      enquiryStatusCounts: AssistantEnquiryStatusCounts;
    }
  | { type: 'recent-enquiries'; enquiries: AssistantEnquiry[] };

export interface AssistantChatResponse {
  answer: string;
  data?: AssistantRelevantData;
}
